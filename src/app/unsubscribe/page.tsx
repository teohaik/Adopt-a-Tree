'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const TEXT = {
  el: {
    title: 'Διακοπή ενημερώσεων',
    intro: 'Θέλεις να σταματήσεις να λαμβάνεις ενημερωτικά μηνύματα (π.χ. υπενθυμίσεις ποτίσματος) για τη διεύθυνση',
    confirm: 'Διακοπή ενημερώσεων',
    working: 'Παρακαλώ περίμενε...',
    done: 'Έγινε! Δεν θα λαμβάνεις πλέον ενημερωτικά μηνύματα. Θα συνεχίσεις να λαμβάνεις μηνύματα σχετικά με τις υιοθεσίες σου.',
    invalid: 'Ο σύνδεσμος δεν είναι έγκυρος.',
    error: 'Κάτι πήγε στραβά. Δοκίμασε ξανά.',
    home: 'Πίσω στο χάρτη',
  },
  en: {
    title: 'Unsubscribe',
    intro: 'Do you want to stop receiving informational messages (e.g. watering reminders) at the address',
    confirm: 'Unsubscribe',
    working: 'Please wait...',
    done: 'Done! You will no longer receive broadcast messages. You will still get messages about your own adoptions.',
    invalid: 'This link is not valid.',
    error: 'Something went wrong. Please try again.',
    home: 'Back to the map',
  },
} as const;

function UnsubscribeContent() {
  const { language } = useLanguage();
  const text = TEXT[language];
  const params = useSearchParams();
  const email = params.get('e');
  const token = params.get('t');
  const [status, setStatus] = useState<'idle' | 'working' | 'done' | 'error'>('idle');

  const handleConfirm = async () => {
    setStatus('working');
    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ e: email, t: token }),
      });
      setStatus(res.ok ? 'done' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-bold">🌳 {text.title}</h1>
        {!email || !token ? (
          <p className="text-red-600">{text.invalid}</p>
        ) : status === 'done' ? (
          <p className="text-green-700">{text.done}</p>
        ) : (
          <>
            <p className="text-gray-700">
              {text.intro} <strong>{email}</strong>?
            </p>
            {status === 'error' && <p className="text-red-600 text-sm">{text.error}</p>}
            <button
              onClick={handleConfirm}
              disabled={status === 'working'}
              className="px-5 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              {status === 'working' ? text.working : text.confirm}
            </button>
          </>
        )}
        <div>
          <a href="/" className="text-sm text-blue-600 hover:underline">{text.home}</a>
        </div>
      </div>
    </main>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={null}>
      <UnsubscribeContent />
    </Suspense>
  );
}
