'use client';

import { useState } from 'react';

interface PinFormProps {
  latitude: number;
  longitude: number;
  onSubmit: (data: { name: string; email: string; label: string }) => void;
  onCancel: () => void;
}

export default function PinForm({ latitude, longitude, onSubmit, onCancel }: PinFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [label, setLabel] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit({ name, email, label });
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Υιοθέτησε ένα Δέντρο</h2>
        <p className="text-sm text-gray-600 mb-4">
          Τοποθεσία: {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Το Όνομά Σου
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="π.χ. Γιάννης Παπαδόπουλος"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Το Email Σου
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="giannis@example.com"
            />
          </div>

          <div>
            <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-1">
              Ετικέτα Δέντρου
            </label>
            <input
              type="text"
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="π.χ. Δρυς κοντά στο πάρκο"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400"
            >
              {isSubmitting ? 'Υποβολή...' : 'Υιοθέτησε Δέντρο'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:bg-gray-200"
            >
              Ακύρωση
            </button>
          </div>
        </form>

        <p className="text-xs text-gray-500 mt-4">
          Υιοθετώντας αυτό το δέντρο, συμφωνείς να το συντηρείς και να το ποτίζεις τακτικά. Θα λάβεις email επιβεβαίωσης με την τοποθεσία του δέντρου.
        </p>
      </div>
    </div>
  );
}
