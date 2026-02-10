'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface TreeType {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export default function AdminTreeTypesPage() {
  const [types, setTypes] = useState<TreeType[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      const response = await fetch('/api/tree-types');
      if (response.ok) {
        const data = await response.json();
        setTypes(data);
      }
    } catch (error) {
      console.error('Failed to fetch tree types:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const isEditing = editingId !== null;
      const response = await fetch('/api/tree-types', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(isEditing && { id: editingId }),
          name: name.trim(),
          description: description.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Αποτυχία');
        return;
      }

      resetForm();
      fetchTypes();
    } catch (err) {
      alert('Αποτυχία αποθήκευσης');
    }
  };

  const handleEdit = (type: TreeType) => {
    setName(type.name);
    setDescription(type.description || '');
    setEditingId(type.id);
  };

  const handleDelete = async (type: TreeType) => {
    if (!confirm(`Διαγραφή του είδους "${type.name}";`)) return;

    try {
      const response = await fetch(`/api/tree-types?id=${type.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed');
      fetchTypes();
    } catch (err) {
      alert('Αποτυχία διαγραφής');
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

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Είδη Δέντρων</h1>
            <p className="text-gray-600">Διαχείριση ειδών δέντρων προς φύτευση</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/admin"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Πίσω στο Admin
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Αποσύνδεση
            </button>
          </div>
        </div>

        {/* Add / Edit Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Επεξεργασία Είδους' : 'Προσθήκη Νέου Είδους'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Όνομα είδους *"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Περιγραφή (προαιρετικό)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 text-sm"
              >
                {editingId ? 'Ενημέρωση' : 'Προσθήκη'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 text-sm"
                >
                  Ακύρωση
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Types List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-100 border-b">
            <h2 className="text-lg font-semibold">Καταχωρημένα Είδη ({types.length})</h2>
          </div>

          {types.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Δεν υπάρχουν είδη δέντρων. Προσθέστε το πρώτο!
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Όνομα</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Περιγραφή</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ενέργειες</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {types.map((type) => (
                  <tr key={type.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{type.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{type.description || '—'}</td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => handleEdit(type)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Επεξεργασία
                      </button>
                      <button
                        onClick={() => handleDelete(type)}
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
