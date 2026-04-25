'use client';

import { useState } from 'react';
import AdminPinMover from './AdminPinMover';

interface TreePin {
  id: number;
  latitude: number;
  longitude: number;
  user_name: string;
  user_email: string;
  user_phone: string | null;
  tree_label: string;
  zone_id: number | null;
  zone_name: string | null;
  tree_type_id: number | null;
  tree_type_name: string | null;
  tree_exists: boolean;
  created_at: string;
}

interface TreeType {
  id: number;
  name: string;
}

interface AdminPinDetailProps {
  pin: TreePin;
  treeTypes: TreeType[];
  onClose: () => void;
  onTreeTypeChange: (pinId: number, typeId: string) => void;
  onTreeExistsChange: (pinId: number, treeExists: boolean) => void;
  onLocationUpdate: (pinId: number, lat: number, lng: number) => Promise<void>;
  onDelete: (pin: TreePin) => void;
  onReject: (pin: TreePin, reason: string) => Promise<void>;
}

export default function AdminPinDetail({
  pin,
  treeTypes,
  onClose,
  onTreeTypeChange,
  onTreeExistsChange,
  onLocationUpdate,
  onDelete,
  onReject,
}: AdminPinDetailProps) {
  const [showMover, setShowMover] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmittingRejection, setIsSubmittingRejection] = useState(false);

  const handleSaveLocation = async (lat: number, lng: number) => {
    await onLocationUpdate(pin.id, lat, lng);
    setShowMover(false);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) return;
    setIsSubmittingRejection(true);
    try {
      await onReject(pin, rejectionReason.trim());
    } finally {
      setIsSubmittingRejection(false);
    }
  };

  return (
    <>
      <div className="w-96 flex-shrink-0 bg-white rounded-lg shadow-lg border flex flex-col sticky top-4 self-start overflow-hidden"
        style={{ maxHeight: 'calc(100vh - 8rem)' }}>

        {/* Header */}
        <div className="p-4 border-b bg-green-50 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-bold text-base truncate">{pin.tree_label}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              #{pin.id} · {new Date(pin.created_at).toLocaleDateString('el-GR')}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none flex-shrink-0 mt-0.5">
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-4 space-y-4 text-sm">

          {/* Adopter */}
          <section>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Στοιχεία Αδοπτή</h4>
            <div className="space-y-1.5">
              <div className="flex gap-2">
                <span className="text-gray-400 w-16 flex-shrink-0">Όνομα</span>
                <span className="font-medium">{pin.user_name}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-400 w-16 flex-shrink-0">Email</span>
                <a href={`mailto:${pin.user_email}`} className="text-blue-600 hover:underline truncate">{pin.user_email}</a>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-400 w-16 flex-shrink-0">Τηλ</span>
                {pin.user_phone
                  ? <a href={`tel:${pin.user_phone}`} className="text-blue-600 hover:underline">{pin.user_phone}</a>
                  : <span className="text-gray-400">—</span>
                }
              </div>
            </div>
          </section>

          <hr />

          {/* Tree details */}
          <section>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Στοιχεία Δέντρου</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Είδος</label>
                <select
                  value={pin.tree_type_id || ''}
                  onChange={(e) => onTreeTypeChange(pin.id, e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">—</option>
                  {treeTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Κατάσταση</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pin.tree_exists}
                    onChange={(e) => onTreeExistsChange(pin.id, e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                  />
                  <span className={pin.tree_exists ? 'text-green-700' : 'text-orange-600'}>
                    {pin.tree_exists ? '🌳 Υπάρχει ήδη' : '🌱 Προς φύτευση'}
                  </span>
                </label>
              </div>
              {pin.zone_name && (
                <div className="flex gap-2">
                  <span className="text-gray-400 flex-shrink-0">Ζώνη</span>
                  <span>{pin.zone_name}</span>
                </div>
              )}
            </div>
          </section>

          <hr />

          {/* Location */}
          <section>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Τοποθεσία</h4>
            <p className="font-mono text-xs text-gray-600 mb-2">
              {Number(pin.latitude).toFixed(6)}, {Number(pin.longitude).toFixed(6)}
            </p>
            <div className="flex gap-2">
              <a
                href={`https://www.google.com/maps?q=${pin.latitude},${pin.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs"
              >
                Προβολή στο Χάρτη
              </a>
              <button
                onClick={() => setShowMover(true)}
                className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 text-xs"
              >
                Μετακίνηση
              </button>
            </div>
          </section>

          <hr />

          {/* Actions */}
          <section>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Ενέργειες</h4>

            {!isRejecting ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsRejecting(true)}
                  className="flex-1 px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 text-xs font-medium"
                >
                  ❌ Απόρριψη
                </button>
                <button
                  onClick={() => onDelete(pin)}
                  className="px-3 py-2 text-gray-500 hover:text-red-600 text-sm"
                  title="Διαγραφή"
                >
                  🗑️
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-red-600 uppercase tracking-wider">
                  Αιτία Απόρριψης
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  placeholder="π.χ. Η τοποθεσία βρίσκεται εκτός ζώνης φύτευσης..."
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { setIsRejecting(false); setRejectionReason(''); }}
                    className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs"
                  >
                    Ακύρωση
                  </button>
                  <button
                    onClick={handleRejectSubmit}
                    disabled={!rejectionReason.trim() || isSubmittingRejection}
                    className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 text-xs font-medium"
                  >
                    {isSubmittingRejection ? 'Αποστολή...' : 'Αποστολή & Απόρριψη'}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {showMover && (
        <AdminPinMover
          pin={pin}
          onSave={handleSaveLocation}
          onCancel={() => setShowMover(false)}
        />
      )}
    </>
  );
}
