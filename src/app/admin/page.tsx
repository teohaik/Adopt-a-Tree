'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
interface TreePin {
  id: number;
  latitude: number;
  longitude: number;
  user_name: string;
  user_email: string;
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

interface ZoneSuggestion {
  id: number;
  latitude: number;
  longitude: number;
  user_name: string;
  user_email: string;
  description: string | null;
  status: 'pending' | 'reviewed';
  created_at: string;
}

type ViewTab = 'list' | 'byZone' | 'suggestions';

export default function AdminPage() {
  const [pins, setPins] = useState<TreePin[]>([]);
  const [treeTypes, setTreeTypes] = useState<TreeType[]>([]);
  const [suggestions, setSuggestions] = useState<ZoneSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ViewTab>('list');
  const [expandedZones, setExpandedZones] = useState<Set<string>>(new Set());
  const [showOnlyToPlant, setShowOnlyToPlant] = useState(false);

  useEffect(() => {
    fetchPins();
    fetchTreeTypes();
    fetchSuggestions();
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

  const fetchTreeTypes = async () => {
    try {
      const response = await fetch('/api/tree-types');
      if (response.ok) {
        const data = await response.json();
        setTreeTypes(data);
      }
    } catch (err) {
      console.error('Failed to fetch tree types:', err);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await fetch('/api/zone-suggestions');
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
    }
  };

  const handleMarkReviewed = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'reviewed' : 'pending';
    setSuggestions(suggestions.map(s => s.id === id ? { ...s, status: newStatus } : s));
    try {
      await fetch('/api/zone-suggestions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch {
      fetchSuggestions();
    }
  };

  const handleDeleteSuggestion = async (id: number) => {
    if (!confirm('Διαγραφή πρότασης;')) return;
    setSuggestions(suggestions.filter(s => s.id !== id));
    try {
      await fetch(`/api/zone-suggestions?id=${id}`, { method: 'DELETE' });
    } catch {
      fetchSuggestions();
    }
  };

  const handleTreeExistsChange = async (pinId: number, treeExists: boolean) => {
    // Optimistic update
    setPins(pins.map(p => p.id === pinId ? { ...p, tree_exists: treeExists } : p));

    try {
      const response = await fetch('/api/pins', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pinId, tree_exists: treeExists }),
      });
      if (!response.ok) throw new Error('Failed to update');
    } catch (err) {
      fetchPins();
      alert('Αποτυχία ενημέρωσης κατάστασης δέντρου');
    }
  };

  const handleTreeTypeChange = async (pinId: number, typeId: string) => {
    const newTypeId = typeId ? parseInt(typeId, 10) : null;
    const typeName = newTypeId ? treeTypes.find(t => t.id === newTypeId)?.name || null : null;

    // Optimistic update
    setPins(pins.map(p => p.id === pinId ? { ...p, tree_type_id: newTypeId, tree_type_name: typeName } : p));

    try {
      const response = await fetch('/api/pins', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pinId, tree_type_id: newTypeId }),
      });
      if (!response.ok) throw new Error('Failed to update');
    } catch (err) {
      // Revert on error
      fetchPins();
      alert('Αποτυχία ενημέρωσης είδους δέντρου');
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Ετικέτα Δέντρου', 'Είδος Δέντρου', 'Κατάσταση', 'Όνομα Χρήστη', 'Email Χρήστη', 'Ζώνη', 'Γεωγραφικό Πλάτος', 'Γεωγραφικό Μήκος', 'Ημερομηνία Δημιουργίας'];
    const csvData = displayedPins.map(pin => [
      pin.id,
      pin.tree_label,
      pin.tree_type_name || '',
      pin.tree_exists ? 'Υπάρχει ήδη' : 'Προς φύτευση',
      pin.user_name,
      pin.user_email,
      pin.zone_name || '',
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

  const toPlantCount = pins.filter(p => !p.tree_exists).length;
  const displayedPins = showOnlyToPlant ? pins.filter(p => !p.tree_exists) : pins;

  const pinsByZone = displayedPins.reduce<Record<string, TreePin[]>>((acc, pin) => {
    const zoneName = pin.zone_name || 'Χωρίς Ζώνη';
    if (!acc[zoneName]) acc[zoneName] = [];
    acc[zoneName].push(pin);
    return acc;
  }, {});

  const toggleZone = (zoneName: string) => {
    setExpandedZones(prev => {
      const next = new Set(prev);
      if (next.has(zoneName)) {
        next.delete(zoneName);
      } else {
        next.add(zoneName);
      }
      return next;
    });
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
      <div className="max-w-[1600px] mx-auto">
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
            <Link
              href="/admin/tree-types"
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
            >
              Είδη Δέντρων
            </Link>
            <button
              onClick={() => setShowOnlyToPlant(!showOnlyToPlant)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                showOnlyToPlant
                  ? 'bg-orange-500 text-white hover:bg-orange-600 ring-2 ring-orange-300'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
            >
              🌱 Προς Φύτευση{toPlantCount > 0 && ` (${toPlantCount})`}
            </button>
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

        <div className="flex gap-1 mb-4">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-5 py-2.5 rounded-t-lg font-medium text-sm transition-colors ${
              activeTab === 'list'
                ? 'bg-white text-gray-900 shadow-md'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            Λίστα
          </button>
          <button
            onClick={() => setActiveTab('byZone')}
            className={`px-5 py-2.5 rounded-t-lg font-medium text-sm transition-colors ${
              activeTab === 'byZone'
                ? 'bg-white text-gray-900 shadow-md'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            Ανά Ζώνη
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`px-5 py-2.5 rounded-t-lg font-medium text-sm transition-colors flex items-center gap-2 ${
              activeTab === 'suggestions'
                ? 'bg-white text-gray-900 shadow-md'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            💡 Προτάσεις Ζωνών
            {suggestions.filter(s => s.status === 'pending').length > 0 && (
              <span className="bg-purple-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {suggestions.filter(s => s.status === 'pending').length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'list' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
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
                    Είδος Δέντρου
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Κατάσταση
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
                {displayedPins.map((pin) => (
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
                      {pin.zone_name || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <select
                        value={pin.tree_type_id || ''}
                        onChange={(e) => handleTreeTypeChange(pin.id, e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="">—</option>
                        {treeTypes.map(type => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pin.tree_exists}
                          onChange={(e) => handleTreeExistsChange(pin.id, e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                        />
                        <span className={pin.tree_exists ? 'text-green-700' : 'text-orange-600'}>
                          {pin.tree_exists ? '🌳 Υπάρχει' : '🌱 Προς φύτευση'}
                        </span>
                      </label>
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
            </div>

            {displayedPins.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Δεν υιοθετήθηκαν ακόμα δέντρα. Ξεκινήστε προσθέτοντας δέντρα στο χάρτη!
              </div>
            )}
          </div>
        )}

        {activeTab === 'byZone' && (
          <div className="space-y-4">
            {Object.entries(pinsByZone).map(([zoneName, zonePins]) => (
              <div key={zoneName} className="bg-white rounded-lg shadow-md overflow-hidden">
                <button
                  onClick={() => toggleZone(zoneName)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-sm transition-transform ${expandedZones.has(zoneName) ? 'rotate-90' : ''}`}>
                      ▶
                    </span>
                    <span className="font-semibold text-gray-900">{zoneName}</span>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {zonePins.length} {zonePins.length === 1 ? 'δέντρο' : 'δέντρα'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Set(zonePins.map(p => p.user_email)).size} υιοθέτες
                  </div>
                </button>

                {expandedZones.has(zoneName) && (
                  <div className="border-t overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ετικέτα</th>
                          <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Είδος</th>
                          <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Κατάσταση</th>
                          <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Υιοθέτης</th>
                          <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ημερομηνία</th>
                          <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ενέργειες</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {zonePins.map((pin) => (
                          <tr key={pin.id} className="hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900">{pin.tree_label}</td>
                            <td className="px-6 py-3 text-sm">
                              <select
                                value={pin.tree_type_id || ''}
                                onChange={(e) => handleTreeTypeChange(pin.id, e.target.value)}
                                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                              >
                                <option value="">—</option>
                                {treeTypes.map(type => (
                                  <option key={type.id} value={type.id}>{type.name}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-6 py-3 text-sm">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={pin.tree_exists}
                                  onChange={(e) => handleTreeExistsChange(pin.id, e.target.checked)}
                                  className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                                />
                                <span className={pin.tree_exists ? 'text-green-700' : 'text-orange-600'}>
                                  {pin.tree_exists ? '🌳 Υπάρχει' : '🌱 Προς φύτευση'}
                                </span>
                              </label>
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-900">{pin.user_name}</td>
                            <td className="px-6 py-3 text-sm text-gray-500">{pin.user_email}</td>
                            <td className="px-6 py-3 text-sm text-gray-500">
                              {new Date(pin.created_at).toLocaleDateString('el-GR')}
                            </td>
                            <td className="px-6 py-3 text-sm">
                              <div className="flex items-center gap-3">
                                <a
                                  href={`https://www.google.com/maps?q=${pin.latitude},${pin.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Χάρτης
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
                  </div>
                )}
              </div>
            ))}

            {pins.length === 0 && (
              <div className="bg-white rounded-lg shadow-md text-center py-12 text-gray-500">
                Δεν υιοθετήθηκαν ακόμα δέντρα.
              </div>
            )}
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {suggestions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Δεν υπάρχουν προτάσεις ζωνών ακόμα.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Χρήστης</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Περιγραφή</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Συντεταγμένες</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Κατάσταση</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ημερομηνία</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ενέργειες</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {suggestions.map(s => (
                      <tr key={s.id} className={`hover:bg-gray-50 ${s.status === 'reviewed' ? 'opacity-60' : ''}`}>
                        <td className="px-6 py-4 text-sm text-gray-900">{s.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{s.user_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{s.user_email}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">{s.description || '—'}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {parseFloat(String(s.latitude)).toFixed(5)}, {parseFloat(String(s.longitude)).toFixed(5)}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            s.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {s.status === 'pending' ? '⏳ Εκκρεμεί' : '✅ Εξετάστηκε'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {new Date(s.created_at).toLocaleDateString('el-GR')}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <a
                              href={`https://www.google.com/maps?q=${s.latitude},${s.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Χάρτης
                            </a>
                            <button
                              onClick={() => handleMarkReviewed(s.id, s.status)}
                              className="text-purple-600 hover:text-purple-900 text-xs"
                              title={s.status === 'pending' ? 'Σημείωση ως εξετασμένο' : 'Επαναφορά σε εκκρεμές'}
                            >
                              {s.status === 'pending' ? '✅' : '↩️'}
                            </button>
                            <button
                              onClick={() => handleDeleteSuggestion(s.id)}
                              className="text-red-500 hover:text-red-700"
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
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
