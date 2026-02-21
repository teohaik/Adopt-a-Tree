'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import PinForm from '@/components/PinForm';
import LanguageToggle from '@/components/LanguageToggle';
import { useLanguage } from '@/lib/i18n/LanguageContext';

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
  const { t, language } = useLanguage();

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
    setPlacementMode(!placementMode);
  };

  const handlePlacementComplete = () => {
    setPlacementMode(false);
  };

  const handleFormSubmit = async (data: { name: string; email: string; label: string; treeExists: boolean }) => {
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
          lang: language,
          treeExists: data.treeExists,
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
        alert(error.error || t.errorCreationFailed);
      }
    } catch (error) {
      console.error('Error creating pin:', error);
      alert(t.errorCreationFailed);
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
            {t.mainTitle}
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            {t.mainSubtitle}
          </p>
        </div>

        {showSuccess && (
          <div className="max-w-2xl mx-auto mb-6 bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg shadow-md">
            <p className="font-semibold">{t.successTitle}</p>
            <p className="text-sm">{t.successMessage}</p>
          </div>
        )}

        <div className="max-w-4xl mx-auto mb-8 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">{t.howItWorks}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">📍</div>
              <h3 className="font-semibold text-lg mb-2">{t.step1Title}</h3>
              <p className="text-gray-600 text-sm">
                {t.step1Desc}<a className="text-[#670000] font-bold">{t.step1DescHighlight}</a>{t.step1DescSuffix}
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">✍️</div>
              <h3 className="font-semibold text-lg mb-2">{t.step2Title}</h3>
              <p className="text-gray-600 text-sm">
                {t.step2Desc}
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">💧</div>
              <h3 className="font-semibold text-lg mb-2">{t.step3Title}</h3>
              <p className="text-gray-600 text-sm">
                {t.step3Desc}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Controls Bar - Above Map */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-xl shadow-md">
            {/* Left side - Stats & Legend */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
                <span className="text-xl">🌳</span>
                <span className="font-semibold text-green-700 text-sm">{pins.length} {t.adoptedCount}</span>
              </div>

              <div className="flex gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">🌳</span>
                  <span className="text-gray-600">{t.othersLabel}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-xs">🌳</div>
                  <span className="text-gray-600">{t.yourTreesLabel}</span>
                </div>
              </div>

              <form onSubmit={handleEmailFilter} className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                <span className="text-gray-500 text-sm">📧</span>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder={t.emailFilterPlaceholder}
                  className="outline-none text-sm w-40 bg-transparent placeholder-gray-400"
                />
                {currentUserEmail ? (
                  <button
                    type="button"
                    onClick={handleClearFilter}
                    className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-0.5 rounded-full transition-colors"
                  >
                    ✕
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-0.5 rounded-full transition-colors"
                  >
                    {t.filterButton}
                  </button>
                )}
              </form>
            </div>

            {/* Right side - Language Toggle & Add Tree Button */}
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <button
                onClick={handleAddTreeClick}
                className={`px-6 py-2.5 rounded-lg shadow-md transition-all font-semibold flex items-center gap-2 text-sm ${
                  placementMode
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <span className="text-lg">{placementMode ? '✕' : '🌳'}</span>
                <span>{placementMode ? t.cancelButton : t.addTreeButton}</span>
              </button>
            </div>
          </div>
          <TreeMap
            onPinCreated={handlePinCreated}
            existingPins={pins}
            currentUserEmail={currentUserEmail}
            placementMode={placementMode}
            onPlacementComplete={handlePlacementComplete}
          />
        </div>

        <div className="max-w-4xl mx-auto mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-2 text-yellow-800">{t.responsibilitiesTitle}</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>{t.responsibility1}</li>
            <li>{t.responsibility2}</li>
            <li>{t.responsibility3}</li>
            <li>{t.responsibility4}</li>
          </ul>
          <p className="mt-6 text-center text-lg">
            📖 <a href="/guide" className="text-[#670000] font-bold hover:underline">{t.wateringGuideLink}</a>
          </p>
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
