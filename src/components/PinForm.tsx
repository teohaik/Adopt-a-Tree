'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface PinFormProps {
  latitude: number;
  longitude: number;
  onSubmit: (data: { name: string; email: string; label: string; treeExists: boolean }) => void;
  onCancel: () => void;
}

export default function PinForm({ latitude, longitude, onSubmit, onCancel }: PinFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [label, setLabel] = useState('');
  const [treeExists, setTreeExists] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit({ name, email, label, treeExists });
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">{t.adoptTreeFormTitle}</h2>
        <p className="text-sm text-gray-600 mb-4">
          {t.locationLabel} {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              {t.yourNameLabel}
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder={t.namePlaceholder}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {t.yourEmailLabel}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-1">
              {t.treeLabelLabel}
            </label>
            <input
              type="text"
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder={t.treeLabelPlaceholder}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.treeExistsLabel}
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setTreeExists(!treeExists)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  treeExists ? 'bg-green-500' : 'bg-orange-400'
                }`}
                aria-checked={treeExists}
                role="switch"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    treeExists ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${treeExists ? 'text-green-700' : 'text-orange-600'}`}>
                {treeExists ? t.treeExistsYes : t.treeExistsNo}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400"
            >
              {isSubmitting ? t.submittingButton : t.adoptTreeButton}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:bg-gray-200"
            >
              {t.cancelButton}
            </button>
          </div>
        </form>

        <p className="text-xs text-gray-500 mt-4">
          {t.disclaimer}
        </p>
      </div>
    </div>
  );
}
