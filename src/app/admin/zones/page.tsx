'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

interface PlantingZone {
  id: number;
  name: string;
  description: string;
  coordinates: Array<{ lat: number; lng: number }>;
  enabled: boolean;
  created_at: string;
}

// Map Component
function MapComponent({
  zones,
  onMapLoad,
}: {
  zones: PlantingZone[];
  onMapLoad: (map: google.maps.Map) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const mapInstance = new google.maps.Map(mapRef.current, {
      center: { lat: 40.5463, lng: 23.0176 },
      zoom: 14,
      mapTypeControl: true,
      streetViewControl: false,
    });

    setMap(mapInstance);
    onMapLoad(mapInstance);
  }, [onMapLoad]);

  // Draw existing zones
  useEffect(() => {
    if (!map || zones.length === 0) return;

    zones.forEach(zone => {
      const polygon = new google.maps.Polygon({
        paths: zone.coordinates,
        strokeColor: zone.enabled ? '#16a34a' : '#9ca3af',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: zone.enabled ? '#16a34a' : '#9ca3af',
        fillOpacity: 0.15,
        map: map,
      });

      const infoWindow = new google.maps.InfoWindow();
      polygon.addListener('click', (e: google.maps.PolyMouseEvent) => {
        infoWindow.setContent(`
          <div style="padding: 8px;">
            <strong>${zone.name}</strong>
            <p style="font-size: 12px; margin-top: 4px; color: #666;">${zone.description}</p>
            <p style="font-size: 11px; margin-top: 4px; color: ${zone.enabled ? '#16a34a' : '#dc2626'};">
              ${zone.enabled ? '✓ Ενεργή' : '✗ Ανενεργή'}
            </p>
          </div>
        `);
        infoWindow.setPosition(e.latLng);
        infoWindow.open(map);
      });
    });
  }, [map, zones]);

  return <div ref={mapRef} className="w-full h-full" />;
}

// Render function for the Wrapper
const render = (status: Status) => {
  switch (status) {
    case Status.LOADING:
      return <div className="flex items-center justify-center h-[500px] bg-gray-100 rounded-lg">
        <p className="text-gray-600">Φόρτωση χάρτη...</p>
      </div>;
    case Status.FAILURE:
      return <div className="flex items-center justify-center h-[500px] bg-red-100 rounded-lg">
        <p className="text-red-600">Σφάλμα φόρτωσης χάρτη</p>
      </div>;
    case Status.SUCCESS:
      return <div />;
  }
};

export default function AdminZonesPage() {
  const [zones, setZones] = useState<PlantingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState<google.maps.Polygon | null>(null);
  const [tempMarkers, setTempMarkers] = useState<google.maps.Marker[]>([]);
  const tempMarkersRef = useRef<google.maps.Marker[]>([]);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // Form state
  const [zoneName, setZoneName] = useState('');
  const [zoneDescription, setZoneDescription] = useState('');
  const [coordinates, setCoordinates] = useState<Array<{ lat: number; lng: number }>>([]);

  const handleMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  // Fetch zones
  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const response = await fetch('/api/zones');
      if (response.ok) {
        const data = await response.json();
        setZones(data);
      }
    } catch (error) {
      console.error('Failed to fetch zones:', error);
    } finally {
      setLoading(false);
    }
  };

  const startDrawing = () => {
    if (!map) return;

    setIsDrawing(true);
    setCoordinates([]);
    tempMarkersRef.current = [];
    setTempMarkers([]);
    map.setOptions({ draggableCursor: 'crosshair' });

    const clickListener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;

      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      setCoordinates(prevCoordinates => {
        const newCoordinates = [...prevCoordinates, { lat, lng }];

        // Add marker with correct number
        const marker = new google.maps.Marker({
          position: { lat, lng },
          map: map,
          label: newCoordinates.length.toString(),
          draggable: true,
        });

        // Store marker in ref
        tempMarkersRef.current.push(marker);
        setTempMarkers([...tempMarkersRef.current]);

        // Update marker position when dragged
        marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
          if (!event.latLng) return;

          const markerIndex = tempMarkersRef.current.findIndex(m => m === marker);
          if (markerIndex === -1) return;

          setCoordinates(currentCoords => {
            const updatedCoords = [...currentCoords];
            updatedCoords[markerIndex] = {
              lat: event.latLng!.lat(),
              lng: event.latLng!.lng(),
            };

            // Update polygon
            setCurrentPolygon(prevPolygon => {
              if (prevPolygon) {
                prevPolygon.setMap(null);
              }

              if (updatedCoords.length >= 3) {
                const polygon = new google.maps.Polygon({
                  paths: updatedCoords,
                  strokeColor: '#f97316',
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                  fillColor: '#f97316',
                  fillOpacity: 0.15,
                  map: map,
                });
                return polygon;
              }
              return null;
            });

            return updatedCoords;
          });
        });

        // Update polygon
        setCurrentPolygon(prevPolygon => {
          if (prevPolygon) {
            prevPolygon.setMap(null);
          }

          if (newCoordinates.length >= 3) {
            const polygon = new google.maps.Polygon({
              paths: newCoordinates,
              strokeColor: '#f97316',
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: '#f97316',
              fillOpacity: 0.15,
              map: map,
            });
            return polygon;
          }
          return prevPolygon;
        });

        return newCoordinates;
      });
    });

    // Store listener for cleanup
    (map as any)._drawingListener = clickListener;
  };

  const cancelDrawing = () => {
    if (!map) return;

    // Remove markers
    tempMarkersRef.current.forEach(marker => marker.setMap(null));
    tempMarkersRef.current = [];
    setTempMarkers([]);

    // Remove polygon
    if (currentPolygon) {
      currentPolygon.setMap(null);
      setCurrentPolygon(null);
    }

    // Reset state
    setIsDrawing(false);
    setCoordinates([]);
    setZoneName('');
    setZoneDescription('');
    map.setOptions({ draggableCursor: '' });

    // Remove listener
    if ((map as any)._drawingListener) {
      google.maps.event.removeListener((map as any)._drawingListener);
    }
  };

  const saveZone = async () => {
    if (!zoneName || coordinates.length < 3) {
      alert('Παρακαλώ δώστε όνομα και σχεδιάστε τουλάχιστον 3 σημεία');
      return;
    }

    try {
      const response = await fetch('/api/zones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: zoneName,
          description: zoneDescription,
          coordinates: coordinates,
        }),
      });

      if (response.ok) {
        alert('Η ζώνη αποθηκεύτηκε επιτυχώς!');
        cancelDrawing();
        fetchZones();
      } else {
        const error = await response.json();
        alert(error.error || 'Αποτυχία αποθήκευσης ζώνης');
      }
    } catch (error) {
      console.error('Error saving zone:', error);
      alert('Αποτυχία αποθήκευσης ζώνης');
    }
  };

  const toggleZone = async (id: number, enabled: boolean) => {
    try {
      const response = await fetch('/api/zones', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, enabled: !enabled }),
      });

      if (response.ok) {
        fetchZones();
      }
    } catch (error) {
      console.error('Error toggling zone:', error);
    }
  };

  const deleteZone = async (id: number) => {
    if (!confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή τη ζώνη;')) {
      return;
    }

    try {
      const response = await fetch(`/api/zones?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchZones();
      }
    } catch (error) {
      console.error('Error deleting zone:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Φόρτωση...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Διαχείριση Ζωνών Φύτευσης</h1>
            <p className="text-gray-600">Ορισμός επιτρεπόμενων περιοχών για φύτευση δέντρων</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/admin"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Πίσω στο Admin
            </Link>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Πίσω στο Χάρτη
            </Link>
          </div>
        </div>

        {/* Map */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Χάρτης</h2>
            <div className="flex gap-2">
              {!isDrawing ? (
                <button
                  onClick={startDrawing}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  🖊️ Σχεδίασε Νέα Ζώνη
                </button>
              ) : (
                <>
                  <button
                    onClick={cancelDrawing}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Ακύρωση
                  </button>
                </>
              )}
            </div>
          </div>

          {isDrawing && (
            <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-md">
              <p className="font-semibold text-orange-800 mb-2">
                📍 Κάνε κλικ στο χάρτη για να σημειώσεις τις κορυφές του πολυγώνου ({coordinates.length} σημεία)
              </p>
              <div className="space-y-2">
                <input
                  type="text"
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  placeholder="Όνομα ζώνης *"
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
                <input
                  type="text"
                  value={zoneDescription}
                  onChange={(e) => setZoneDescription(e.target.value)}
                  placeholder="Περιγραφή (προαιρετικό)"
                  className="w-full px-3 py-2 border rounded-md"
                />
                {coordinates.length >= 3 && (
                  <button
                    onClick={saveZone}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    💾 Αποθήκευση Ζώνης
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="w-full h-[500px] rounded-lg shadow-lg">
            <Wrapper
              apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
              render={render}
            >
              <MapComponent zones={zones} onMapLoad={handleMapLoad} />
            </Wrapper>
          </div>
        </div>

        {/* Zones List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-100 border-b">
            <h2 className="text-2xl font-bold">Καταχωρημένες Ζώνες ({zones.length})</h2>
          </div>

          {zones.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Δεν υπάρχουν ζώνες. Σχεδιάστε την πρώτη σας ζώνη!
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Όνομα
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Περιγραφή
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Σημεία
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Κατάσταση
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ενέργειες
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {zones.map((zone) => (
                  <tr key={zone.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {zone.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {zone.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {zone.coordinates.length} κορυφές
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {zone.enabled ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          ✓ Ενεργή
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                          ✗ Ανενεργή
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => toggleZone(zone.id, zone.enabled)}
                        className={`px-3 py-1 rounded-md ${
                          zone.enabled
                            ? 'bg-yellow-600 hover:bg-yellow-700'
                            : 'bg-green-600 hover:bg-green-700'
                        } text-white`}
                      >
                        {zone.enabled ? 'Απενεργοποίηση' : 'Ενεργοποίηση'}
                      </button>
                      <button
                        onClick={() => deleteZone(zone.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Διαγραφή
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
