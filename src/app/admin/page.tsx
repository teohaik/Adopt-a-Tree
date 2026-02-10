'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getZoneForPoint, PlantingZone } from '@/lib/plantingZones';

interface TreePin {
  id: number;
  latitude: number;
  longitude: number;
  user_name: string;
  user_email: string;
  tree_label: string;
  created_at: string;
}

export default function AdminPage() {
  const [pins, setPins] = useState<TreePin[]>([]);
  const [zones, setZones] = useState<PlantingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPins();
    fetchZones();
  }, []);

  const fetchPins = async () => {
    try {
      const response = await fetch('/api/pins');
      if (!response.ok) throw new Error('Failed to fetch pins');
      const data = await response.json();
      setPins(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchZones = async () => {
    try {
      const response = await fetch('/api/zones?enabled=true');
      if (response.ok) {
        const data = await response.json();
        setZones(data);
      }
    } catch (err) {
      console.error('Failed to fetch zones:', err);
    }
  };

  const getZoneName = (pin: TreePin): string => {
    const lat = typeof pin.latitude === 'string' ? parseFloat(pin.latitude) : pin.latitude;
    const lng = typeof pin.longitude === 'string' ? parseFloat(pin.longitude) : pin.longitude;
    const zone = getZoneForPoint(lat, lng, zones);
    return zone?.name || '—';
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Ετικέτα Δέντρου', 'Όνομα Χρήστη', 'Email Χρήστη', 'Γεωγραφικό Πλάτος', 'Γεωγραφικό Μήκος', 'Ημερομηνία Δημιουργίας'];
    const csvData = pins.map(pin => [
      pin.id,
      pin.tree_label,
      pin.user_name,
      pin.user_email,
      pin.latitude,
      pin.longitude,
      new Date(pin.created_at).toLocaleString()
    ]);

    const csv = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tree-pins-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleDelete = async (pin: TreePin) => {
    if (!confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε το δέντρο "${pin.tree_label}" του ${pin.user_name};`)) {
      return;
    }

    try {
      const response = await fetch(`/api/pins?id=${pin.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete pin');
      setPins(pins.filter(p => p.id !== pin.id));
    } catch (err: any) {
      alert('Αποτυχία διαγραφής: ' + err.message);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Φόρτωση...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Σφάλμα: {error}</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Πίνακας Διαχείρισης</h1>
            <p className="text-gray-600">Διαχείριση υιοθεσιών δέντρων</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/admin/zones"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Διαχείριση Ζωνών
            </Link>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Πίσω στο Χάρτη
            </Link>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Εξαγωγή σε CSV
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Αποσύνδεση
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{pins.length}</div>
              <div className="text-gray-600">Σύνολο Δέντρων που Υιοθετήθηκαν</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {new Set(pins.map(p => p.user_email)).size}
              </div>
              <div className="text-gray-600">Μοναδικοί Υιοθέτες</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {pins.length > 0 ? new Date(pins[0].created_at).toLocaleDateString('el-GR') : 'Δ/Υ'}
              </div>
              <div className="text-gray-600">Τελευταία Υιοθεσία</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ετικέτα Δέντρου
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Υιοθέτης
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ζώνη
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Δημιουργήθηκε
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ενέργειες
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pins.map((pin) => (
                <tr key={pin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pin.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {pin.tree_label}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pin.user_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {pin.user_email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getZoneName(pin)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(pin.created_at).toLocaleDateString('el-GR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-3">
                      <a
                        href={`https://www.google.com/maps?q=${pin.latitude},${pin.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-900"
                      >
                        Προβολή στο Χάρτη
                      </a>
                      <button
                        onClick={() => handleDelete(pin)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Διαγραφή"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pins.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Δεν υιοθετήθηκαν ακόμα δέντρα. Ξεκινήστε προσθέτοντας δέντρα στο χάρτη!
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
