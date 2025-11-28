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
  created_at: string;
}

export default function AdminPage() {
  const [pins, setPins] = useState<TreePin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPins();
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

  const exportToCSV = () => {
    const headers = ['ID', 'Tree Label', 'User Name', 'User Email', 'Latitude', 'Longitude', 'Created At'];
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage tree adoptions</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Back to Map
            </Link>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Export to CSV
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{pins.length}</div>
              <div className="text-gray-600">Total Trees Adopted</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {new Set(pins.map(p => p.user_email)).size}
              </div>
              <div className="text-gray-600">Unique Adopters</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {pins.length > 0 ? new Date(pins[0].created_at).toLocaleDateString() : 'N/A'}
              </div>
              <div className="text-gray-600">Latest Adoption</div>
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
                  Tree Label
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adopter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
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
                    {pin.latitude.toFixed(6)}, {pin.longitude.toFixed(6)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(pin.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <a
                      href={`https://www.google.com/maps?q=${pin.latitude},${pin.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-900"
                    >
                      View on Map
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pins.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No trees adopted yet. Start by adding pins to the map!
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
