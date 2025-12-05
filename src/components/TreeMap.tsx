'use client';

import { useEffect, useRef, useState } from 'react';
import { isPointInPlantingZone, PlantingZone } from '@/lib/plantingZones';

interface TreeMapProps {
  onPinCreated: (lat: number, lng: number) => void;
  existingPins?: Array<{ latitude: number; longitude: number; tree_label: string; user_email: string }>;
  currentUserEmail?: string;
  placementMode: boolean;
  onPlacementComplete: () => void;
}

export default function TreeMap({ onPinCreated, existingPins = [], currentUserEmail, placementMode, onPlacementComplete }: TreeMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [previewMarker, setPreviewMarker] = useState<google.maps.Marker | null>(null);
  const [zonePolygons, setZonePolygons] = useState<google.maps.Polygon[]>([]);
  const [plantingZones, setPlantingZones] = useState<PlantingZone[]>([]);

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
          strokeColor: '#065f46',
          strokeOpacity: 0.9,
          strokeWeight: 3,
          fillColor: '#065f46',
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
            ${isUserTree ? '<div style="color: #f97316; font-size: 12px; margin-top: 4px;">🌳 Το Δέντρο Σου</div>' : '<div style="color: #16a34a; font-size: 12px; margin-top: 4px;">🌳</div>'}
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
  }, [map, existingPins, isLoaded, currentUserEmail]);

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
            // Show error message
            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div style="padding: 12px; max-width: 250px;">
                  <strong style="color: #dc2626;">❌ Μη Επιτρεπόμενη Περιοχή</strong>
                  <p style="font-size: 12px; margin-top: 8px; color: #666;">
                    Η φύτευση δέντρων επιτρέπεται μόνο στις πράσινες περιοχές που έχουν ορίσει ο Δήμος.
                  </p>
                </div>
              `,
              position: { lat, lng },
            });
            infoWindow.open(map);
            setTimeout(() => infoWindow.close(), 4000);
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
  }, [map, isLoaded, placementMode, previewMarker, onPinCreated]);

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

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="w-full h-[600px] rounded-lg shadow-lg"
      >
        {!isLoaded && (
          <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
            <p className="text-gray-600">Φόρτωση χάρτη...</p>
          </div>
        )}
      </div>
      {placementMode && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 z-10">
          <span className="text-lg">📍</span>
          <span className="font-semibold">Κάνε κλικ στο χάρτη για να τοποθετήσεις το δέντρο σου</span>
        </div>
      )}
    </div>
  );
}
