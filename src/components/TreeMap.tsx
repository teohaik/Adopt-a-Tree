'use client';

import { useEffect, useRef, useState } from 'react';

interface TreeMapProps {
  onPinCreated: (lat: number, lng: number) => void;
  existingPins?: Array<{ latitude: number; longitude: number; tree_label: string; user_email: string }>;
  currentUserEmail?: string;
}

export default function TreeMap({ onPinCreated, existingPins = [], currentUserEmail }: TreeMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script);
    } else if (window.google) {
      setIsLoaded(true);
    }
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

    // Add click listener to create new pins
    mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        onPinCreated(lat, lng);
      }
    });

    setMap(mapInstance);
  }, [isLoaded, onPinCreated, map]);

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
            ${isUserTree ? '<div style="color: #f97316; font-size: 12px; margin-top: 4px;">🌳 Your Tree</div>' : '<div style="color: #16a34a; font-size: 12px; margin-top: 4px;">🌳</div>'}
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

  return (
    <div
      ref={mapRef}
      className="w-full h-[600px] rounded-lg shadow-lg"
    >
      {!isLoaded && (
        <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
          <p className="text-gray-600">Loading map...</p>
        </div>
      )}
    </div>
  );
}
