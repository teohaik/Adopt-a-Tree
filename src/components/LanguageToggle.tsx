'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className="inline-flex items-center bg-white border border-gray-200 rounded-full p-0.5 shadow-sm"
      role="group"
      aria-label="Language selector"
    >
      <button
        onClick={() => setLanguage('el')}
        className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all ${
          language === 'el'
            ? 'bg-green-600 text-white'
            : 'text-gray-600 hover:text-gray-800'
        }`}
        aria-pressed={language === 'el'}
        aria-label="Ελληνικά"
      >
        EL
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all ${
          language === 'en'
            ? 'bg-green-600 text-white'
            : 'text-gray-600 hover:text-gray-800'
        }`}
        aria-pressed={language === 'en'}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
}
