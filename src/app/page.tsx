'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import PinForm from '@/components/PinForm';

const TreeMap = dynamic(() => import('@/components/TreeMap'), { ssr: false });

interface TreePin {
  id: number;
  latitude: number;
  longitude: number;
  tree_label: string;
  user_name: string;
  user_email: string;
}

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [pins, setPins] = useState<TreePin[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [placementMode, setPlacementMode] = useState(false);
  const [emailInput, setEmailInput] = useState<string>('');

  useEffect(() => {
    fetchPins();

    // Check URL parameter first
    const urlParams = new URLSearchParams(window.location.search);
    const emailFromUrl = urlParams.get('email');

    if (emailFromUrl) {
      setCurrentUserEmail(emailFromUrl);
      setEmailInput(emailFromUrl);
      // Save to localStorage
      localStorage.setItem('userEmail', emailFromUrl);
    } else {
      // Load user email from localStorage
      const savedEmail = localStorage.getItem('userEmail');
      if (savedEmail) {
        setCurrentUserEmail(savedEmail);
        setEmailInput(savedEmail);
      }
    }
  }, []);

  const fetchPins = async () => {
    try {
      const response = await fetch('/api/pins');
      if (response.ok) {
        const data = await response.json();
        setPins(data);
      }
    } catch (error) {
      console.error('Failed to fetch pins:', error);
    }
  };

  const handlePinCreated = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
  };

  const handleAddTreeClick = () => {
    setPlacementMode(true);
  };

  const handlePlacementComplete = () => {
    setPlacementMode(false);
  };

  const handleFormSubmit = async (data: { name: string; email: string; label: string }) => {
    if (!selectedLocation) return;

    try {
      const response = await fetch('/api/pins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng,
          name: data.name,
          email: data.email,
          label: data.label,
        }),
      });

      if (response.ok) {
        // Save user email to localStorage
        localStorage.setItem('userEmail', data.email);
        setCurrentUserEmail(data.email);

        setSelectedLocation(null);
        setShowSuccess(true);
        fetchPins();

        setTimeout(() => {
          setShowSuccess(false);
        }, 5000);
      } else {
        const error = await response.json();
        alert(error.error || 'Αποτυχία δημιουργίας δέντρου');
      }
    } catch (error) {
      console.error('Error creating pin:', error);
      alert('Αποτυχία δημιουργίας δέντρου');
    }
  };

  const handleFormCancel = () => {
    setSelectedLocation(null);
    setPlacementMode(false);
  };

  const handleEmailFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = emailInput.trim();
    if (trimmedEmail) {
      setCurrentUserEmail(trimmedEmail);
      localStorage.setItem('userEmail', trimmedEmail);
      // Update URL
      const url = new URL(window.location.href);
      url.searchParams.set('email', trimmedEmail);
      window.history.pushState({}, '', url);
    }
  };

  const handleClearFilter = () => {
    setCurrentUserEmail('');
    setEmailInput('');
    localStorage.removeItem('userEmail');
    // Remove from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('email');
    window.history.pushState({}, '', url);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 text-green-800">
            Υιοθέτησε ένα Δέντρο στη Θέρμη
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            Βοήθησε να πρασινίσει η κοινότητά μας υιοθετώντας και φροντίζοντας ένα δέντρο
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={handleAddTreeClick}
              disabled={placementMode}
              className="bg-orange-500 text-white px-8 py-3 rounded-full hover:bg-orange-600 shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold flex items-center gap-2"
            >
              <span className="text-xl">🌳</span>
              <span>{placementMode ? 'Τοποθέτηση Δέντρου...' : 'Πρόσθεσε Δέντρο'}</span>
            </button>
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <span className="text-2xl">🌳</span>
              <span className="font-semibold text-green-700">{pins.length} Δέντρα Υιοθετήθηκαν</span>
            </div>
          </div>
        </div>

        {showSuccess && (
          <div className="max-w-2xl mx-auto mb-6 bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg shadow-md">
            <p className="font-semibold">Το δέντρο υιοθετήθηκε επιτυχώς!</p>
            <p className="text-sm">Ελέγξτε το email σας για επιβεβαίωση και λεπτομέρειες για το δέντρο σας.</p>
          </div>
        )}

        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex flex-col items-center gap-4">
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                <span className="text-xl">🌳</span>
                <span className="text-gray-700">Άλλα Δέντρα</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-xs">🌳</div>
                <span className="text-gray-700">Τα Δέντρα Σου</span>
              </div>
            </div>

            <form onSubmit={handleEmailFilter} className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
              <span className="text-gray-600 text-sm">📧</span>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Το email σου για να δεις τα δέντρα σου"
                className="outline-none text-sm w-64 placeholder-gray-400"
              />
              {currentUserEmail ? (
                <button
                  type="button"
                  onClick={handleClearFilter}
                  className="text-xs bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-full transition-colors"
                >
                  Καθαρισμός
                </button>
              ) : (
                <button
                  type="submit"
                  className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-full transition-colors"
                >
                  Φίλτρο
                </button>
              )}
            </form>
          </div>
          <TreeMap
            onPinCreated={handlePinCreated}
            existingPins={pins}
            currentUserEmail={currentUserEmail}
            placementMode={placementMode}
            onPlacementComplete={handlePlacementComplete}
          />
        </div>

        <div className="max-w-4xl mx-auto mt-12 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Πώς Λειτουργεί</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">📍</div>
              <h3 className="font-semibold text-lg mb-2">1. Διάλεξε Τοποθεσία</h3>
              <p className="text-gray-600 text-sm">
                Κάνε κλικ στο κουμπί και στη συνέχεια στο χάρτη όπου θα ήθελες να υιοθετήσεις ένα δέντρο
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">✍️</div>
              <h3 className="font-semibold text-lg mb-2">2. Συμπλήρωσε Στοιχεία</h3>
              <p className="text-gray-600 text-sm">
                Εισήγαγε το όνομά σου, email και δώσε μια ετικέτα στο δέντρο σου
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">💧</div>
              <h3 className="font-semibold text-lg mb-2">3. Φρόντισέ Το</h3>
              <p className="text-gray-600 text-sm">
                Λάβε επιβεβαίωση και δεσμεύσου να ποτίζεις και να συντηρείς το δέντρο σου
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-2 text-yellow-800">Οι Υποχρεώσεις Σου</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Πότισε το δέντρο σου τακτικά, ειδικά κατά τις ξηρές περιόδους</li>
            <li>Παρακολούθησε την υγεία του δέντρου και ανάφερε τυχόν προβλήματα στις τοπικές αρχές</li>
            <li>Κράτησε την περιοχή γύρω από το δέντρο καθαρή</li>
            <li>Γίνε πρεσβευτής των δέντρων και ενθάρρυνε άλλους να συμμετάσχουν</li>
          </ul>
        </div>
      </div>

      {selectedLocation && (
        <PinForm
          latitude={selectedLocation.lat}
          longitude={selectedLocation.lng}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
    </main>
  );
}
