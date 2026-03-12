'use client';

import { useEffect, useRef, useState } from 'react';
import { isPointInPlantingZone, PlantingZone } from '@/lib/plantingZones';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface TreeMapProps {
  onPinCreated: (lat: number, lng: number) => void;
  existingPins?: Array<{ latitude: number; longitude: number; tree_label: string; user_email: string }>;
  currentUserEmail?: string;
  placementMode: boolean;
  onPlacementComplete: () => void;
}

interface SuggestionCoords {
  lat: number;
  lng: number;
}

interface SuggestionForm {
  name: string;
  email: string;
  description: string;
}

export default function TreeMap({ onPinCreated, existingPins = [], currentUserEmail, placementMode, onPlacementComplete }: TreeMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [previewMarker, setPreviewMarker] = useState<google.maps.Marker | null>(null);
  const [zonePolygons, setZonePolygons] = useState<google.maps.Polygon[]>([]);
  const [plantingZones, setPlantingZones] = useState<PlantingZone[]>([]);
  const [suggestionCoords, setSuggestionCoords] = useState<SuggestionCoords | null>(null);
  const [suggestionForm, setSuggestionForm] = useState<SuggestionForm>({ name: '', email: '', description: '' });
  const [suggestionSubmitting, setSuggestionSubmitting] = useState(false);
  const [suggestionSuccess, setSuggestionSuccess] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationMarker, setLocationMarker] = useState<google.maps.Marker | null>(null);
  const { t } = useLanguage();

  // Load Google Maps script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if already loaded
    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    // Check if script is already in DOM
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com"]'
    );

    if (existingScript) {
      // Wait for existing script to load
      const checkLoaded = setInterval(() => {
        if (window.google?.maps) {
          setIsLoaded(true);
          clearInterval(checkLoaded);
        }
      }, 100);

      return () => clearInterval(checkLoaded);
    }

    // Create new script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (!isLoaded || !mapRef.current || map) return;

    // Center on Thermi, Thessaloniki
    const thermiCenter = { lat: 40.5463, lng: 23.0176 };

    const mapInstance = new google.maps.Map(mapRef.current, {
      center: thermiCenter,
      zoom: 14,
      mapTypeControl: true,
      streetViewControl: false,
    });

    setMap(mapInstance);
  }, [isLoaded, onPinCreated, map]);

  // Load planting zones from API
  useEffect(() => {
    async function fetchZones() {
      try {
        const response = await fetch('/api/zones?enabled=true');
        if (response.ok) {
          const zones = await response.json();
          setPlantingZones(zones);
        }
      } catch (error) {
        console.error('Failed to load planting zones:', error);
      }
    }

    fetchZones();
  }, []);

  // Draw planting zones on map
  useEffect(() => {
    if (!map || !isLoaded || plantingZones.length === 0) return;

    // Clear existing polygons
    zonePolygons.forEach(polygon => polygon.setMap(null));

    // Draw enabled zones
    const newPolygons = plantingZones
      .filter(zone => zone.enabled)
      .map(zone => {
        const polygon = new google.maps.Polygon({
          paths: zone.coordinates,
          strokeColor: '#670000',
          strokeOpacity: 0.9,
          strokeWeight: 3,
          fillColor: '#670000',
          fillOpacity: 0.25,
          map: map,
          clickable: !placementMode, // Make polygon non-clickable during placement mode
        });

        // Add info window for zone
        const infoWindow = new google.maps.InfoWindow();

        polygon.addListener('click', (e: google.maps.PolyMouseEvent) => {
          // Don't show zone info when in placement mode
          if (placementMode) {
            return;
          }

          infoWindow.setContent(`
            <div style="padding: 8px;">
              <strong>${zone.name}</strong>
              <p style="font-size: 12px; margin-top: 4px; color: #666;">${zone.description}</p>
            </div>
          `);
          infoWindow.setPosition(e.latLng);
          infoWindow.open(map);
        });

        return polygon;
      });

    setZonePolygons(newPolygons);
  }, [map, isLoaded, plantingZones, placementMode]);

  // Update markers when existing pins change
  useEffect(() => {
    if (!map || !isLoaded) return;

    console.log('Creating markers for', existingPins.length, 'pins');

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    // Add markers for existing pins
    const newMarkers = existingPins.map((pin, index) => {
      // Check if this tree belongs to the current user
      const isUserTree = currentUserEmail && pin.user_email === currentUserEmail;
      console.log(`Pin ${index}: ${pin.tree_label}, isUserTree: ${isUserTree}, color: ${isUserTree ? 'orange' : 'green'}`);

      // Convert to numbers (database returns decimals as strings)
      const lat = typeof pin.latitude === 'string' ? parseFloat(pin.latitude) : pin.latitude;
      const lng = typeof pin.longitude === 'string' ? parseFloat(pin.longitude) : pin.longitude;

      console.log(`Position: lat=${lat}, lng=${lng}`);

      // Create icon based on tree ownership
      let iconConfig;

      if (isUserTree) {
        // Your trees: orange circle with tree icon
        const svgIcon = `
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
            <circle cx="20" cy="20" r="16" fill="#f97316" stroke="white" stroke-width="2"/>
            <text x="20" y="26" font-size="18" text-anchor="middle" fill="white">🌳</text>
          </svg>
        `;
        iconConfig = {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgIcon),
          scaledSize: new google.maps.Size(40, 40),
          anchor: new google.maps.Point(20, 20),
        };
      } else {
        // Other trees: just the tree emoji, no circle
        const svgIcon = `
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
            <text x="16" y="24" font-size="24" text-anchor="middle">🌳</text>
          </svg>
        `;
        iconConfig = {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgIcon),
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 16),
        };
      }

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: pin.tree_label,
        icon: iconConfig,
        optimized: false,
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <strong>${pin.tree_label}</strong>
            ${isUserTree ? `<div style="color: #f97316; font-size: 12px; margin-top: 4px;">${t.yourTree}</div>` : '<div style="color: #16a34a; font-size: 12px; margin-top: 4px;">🌳</div>'}
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      console.log('Created marker at', pin.latitude, pin.longitude);
      return marker;
    });

    console.log('Total markers created:', newMarkers.length);
    setMarkers(newMarkers);
  }, [map, existingPins, isLoaded, currentUserEmail, t]);

  // Register global callback for zone suggestion (used by InfoWindow button)
  useEffect(() => {
    (window as any).__openZoneSuggestion = (lat: number, lng: number) => {
      setSuggestionCoords({ lat, lng });
      setSuggestionForm({ name: '', email: '', description: '' });
      setSuggestionSuccess(false);
    };
    return () => {
      delete (window as any).__openZoneSuggestion;
    };
  }, []);

  // Handle placement mode
  useEffect(() => {
    if (!map || !isLoaded) return;

    if (placementMode) {
      // Change cursor to crosshair
      if (mapRef.current) {
        mapRef.current.style.cursor = 'crosshair';
      }

      // Add click listener for placement
      const clickListener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();

          // Check if location is within allowed planting zones
          if (!isPointInPlantingZone(lat, lng, plantingZones)) {
            // Show error message with suggestion button
            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div style="padding: 12px; max-width: 270px;">
                  <strong style="color: #dc2626;">${t.restrictedAreaTitle}</strong>
                  <p style="font-size: 12px; margin-top: 8px; color: #555;">
                    ${t.restrictedAreaMessage}
                  </p>
                  <button
                    onclick="window.__openZoneSuggestion(${lat}, ${lng})"
                    style="margin-top: 10px; width: 100%; padding: 7px 12px; background: #7c3aed; color: white; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 600;"
                  >
                    ${t.suggestZoneButton}
                  </button>
                </div>
              `,
              position: { lat, lng },
            });
            infoWindow.open(map);
            setTimeout(() => infoWindow.close(), 8000);
            return;
          }

          // Create preview marker
          if (previewMarker) {
            previewMarker.setMap(null);
          }

          const svgIcon = `
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50">
              <circle cx="25" cy="25" r="20" fill="#f97316" stroke="white" stroke-width="3" opacity="0.8"/>
              <text x="25" y="32" font-size="22" text-anchor="middle" fill="white">🌳</text>
            </svg>
          `;

          const preview = new google.maps.Marker({
            position: { lat, lng },
            map: map,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgIcon),
              scaledSize: new google.maps.Size(50, 50),
              anchor: new google.maps.Point(25, 25),
            },
            draggable: true,
            animation: google.maps.Animation.DROP,
          });

          setPreviewMarker(preview);
          onPinCreated(lat, lng);
        }
      });

      return () => {
        google.maps.event.removeListener(clickListener);
      };
    } else {
      // Reset cursor
      if (mapRef.current) {
        mapRef.current.style.cursor = '';
      }

      // Remove preview marker when not in placement mode
      if (previewMarker) {
        previewMarker.setMap(null);
        setPreviewMarker(null);
      }
    }
  }, [map, isLoaded, placementMode, previewMarker, onPinCreated, t]);

  // Update preview marker position when it's dragged
  useEffect(() => {
    if (!previewMarker) return;

    const dragEndListener = previewMarker.addListener('dragend', () => {
      const position = previewMarker.getPosition();
      if (position) {
        onPinCreated(position.lat(), position.lng());
      }
    });

    return () => {
      google.maps.event.removeListener(dragEndListener);
    };
  }, [previewMarker, onPinCreated]);

  const handleLocateMe = () => {
    if (!map || !navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        map.panTo({ lat, lng });
        map.setZoom(17);

        // Remove previous location marker
        if (locationMarker) locationMarker.setMap(null);

        const svgIcon = `
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36">
            <circle cx="18" cy="18" r="10" fill="#2563eb" stroke="white" stroke-width="3"/>
            <circle cx="18" cy="18" r="16" fill="#2563eb" fill-opacity="0.2"/>
          </svg>
        `;
        const marker = new google.maps.Marker({
          position: { lat, lng },
          map,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgIcon),
            scaledSize: new google.maps.Size(36, 36),
            anchor: new google.maps.Point(18, 18),
          },
          title: t.yourLocation,
          optimized: false,
          zIndex: 999,
        });
        setLocationMarker(marker);
        setLocating(false);
      },
      () => {
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSuggestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionCoords) return;
    setSuggestionSubmitting(true);
    try {
      const res = await fetch('/api/zone-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: suggestionCoords.lat,
          longitude: suggestionCoords.lng,
          user_name: suggestionForm.name,
          user_email: suggestionForm.email,
          description: suggestionForm.description,
        }),
      });
      if (res.ok) {
        setSuggestionSuccess(true);
        setTimeout(() => {
          setSuggestionCoords(null);
          setSuggestionSuccess(false);
        }, 3000);
      }
    } catch {
      // silent fail — form remains open
    } finally {
      setSuggestionSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="w-full h-[600px] rounded-lg shadow-lg"
      >
        {!isLoaded && (
          <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
            <p className="text-gray-600">{t.loadingMap}</p>
          </div>
        )}
      </div>
      {/* Locate me button */}
      {isLoaded && (
        <button
          onClick={handleLocateMe}
          disabled={locating}
          title={t.locateMe}
          className="absolute bottom-24 right-3 z-10 bg-white rounded-full w-10 h-10 shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-60 border border-gray-200"
        >
          {locating ? (
            <svg className="w-5 h-5 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          ) : (
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
              <path d="M12 8a4 4 0 100 8 4 4 0 000-8z" fill="currentColor" fillOpacity="0.15"/>
            </svg>
          )}
        </button>
      )}

      {/* Zone suggestion form overlay */}
      {suggestionCoords && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 rounded-lg">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4">
            {suggestionSuccess ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">✅</div>
                <p className="font-semibold text-green-700">{t.suggestZoneSuccess}</p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{t.suggestZoneTitle}</h3>
                <p className="text-sm text-gray-500 mb-4">{t.suggestZoneIntro}</p>
                <form onSubmit={handleSuggestionSubmit} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.suggestZoneNameLabel}</label>
                    <input
                      type="text"
                      required
                      value={suggestionForm.name}
                      onChange={e => setSuggestionForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.suggestZoneEmailLabel}</label>
                    <input
                      type="email"
                      required
                      value={suggestionForm.email}
                      onChange={e => setSuggestionForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.suggestZoneDescriptionLabel}</label>
                    <textarea
                      rows={3}
                      value={suggestionForm.description}
                      onChange={e => setSuggestionForm(f => ({ ...f, description: e.target.value }))}
                      placeholder={t.suggestZoneDescriptionPlaceholder}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSuggestionCoords(null)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
                    >
                      {t.suggestZoneCancel}
                    </button>
                    <button
                      type="submit"
                      disabled={suggestionSubmitting}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-60"
                    >
                      {suggestionSubmitting ? t.suggestZoneSubmitting : t.suggestZoneSubmit}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Desktop: top pill */}
      {placementMode && (
        <div className="hidden md:flex absolute top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-6 py-3 rounded-full shadow-lg items-center gap-3 z-10">
          <span className="text-lg">📍</span>
          <span className="font-semibold">{t.placementBanner}</span>
        </div>
      )}
      {/* Mobile: compact bottom snackbar */}
      {placementMode && (
        <div className="md:hidden absolute bottom-3 left-3 right-3 bg-orange-500 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 z-10 animate-fade-in">
          <span>📍</span>
          <span className="text-sm font-medium flex-1">{t.placementBannerShort}</span>
        </div>
      )}
    </div>
  );
}
