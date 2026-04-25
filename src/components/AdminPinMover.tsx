'use client';

import { useEffect, useRef, useState } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

interface PinStub {
  id: number;
  latitude: number;
  longitude: number;
  tree_label: string;
}

function MoverMap({ pin, onPositionChange }: {
  pin: PinStub;
  onPositionChange: (lat: number, lng: number) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onPositionChange);
  callbackRef.current = onPositionChange;

  useEffect(() => {
    if (!mapRef.current) return;

    const lat = Number(pin.latitude);
    const lng = Number(pin.longitude);

    const map = new google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom: 18,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
    });

    const marker = new google.maps.Marker({
      position: { lat, lng },
      map,
      draggable: true,
      title: pin.tree_label,
    });

    marker.addListener('dragend', () => {
      const pos = marker.getPosition();
      if (pos) callbackRef.current(pos.lat(), pos.lng());
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={mapRef} className="w-full h-full" />;
}

const renderStatus = (status: Status) => {
  if (status === Status.LOADING) return (
    <div className="flex items-center justify-center h-full text-gray-500 text-sm">Φόρτωση χάρτη...</div>
  );
  if (status === Status.FAILURE) return (
    <div className="flex items-center justify-center h-full text-red-500 text-sm">Σφάλμα φόρτωσης χάρτη</div>
  );
  return <></>;
};

interface AdminPinMoverProps {
  pin: PinStub;
  onSave: (lat: number, lng: number) => Promise<void>;
  onCancel: () => void;
}

export default function AdminPinMover({ pin, onSave, onCancel }: AdminPinMoverProps) {
  const [newLat, setNewLat] = useState(Number(pin.latitude));
  const [newLng, setNewLng] = useState(Number(pin.longitude));
  const [isSaving, setIsSaving] = useState(false);

  const moved = newLat !== Number(pin.latitude) || newLng !== Number(pin.longitude);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(newLat, newLng);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Μετακίνηση: {pin.tree_label}</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <p className="px-4 pt-3 pb-1 text-sm text-gray-600">Σύρε τον δείκτη στη σωστή τοποθεσία.</p>

        <div className="px-4 pb-2 text-xs text-gray-500 flex gap-6">
          <span>Τρέχον: {Number(pin.latitude).toFixed(6)}, {Number(pin.longitude).toFixed(6)}</span>
          {moved && (
            <span className="text-green-700 font-medium">
              Νέο: {newLat.toFixed(6)}, {newLng.toFixed(6)}
            </span>
          )}
        </div>

        <div className="mx-4 mb-4 rounded-md overflow-hidden border" style={{ height: '380px' }}>
          <Wrapper apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!} render={renderStatus}>
            <MoverMap pin={pin} onPositionChange={(lat, lng) => { setNewLat(lat); setNewLng(lng); }} />
          </Wrapper>
        </div>

        <div className="p-4 border-t flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
          >
            Ακύρωση
          </button>
          <button
            onClick={handleSave}
            disabled={!moved || isSaving}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 text-sm"
          >
            {isSaving ? 'Αποθήκευση...' : 'Αποθήκευση Θέσης'}
          </button>
        </div>
      </div>
    </div>
  );
}
