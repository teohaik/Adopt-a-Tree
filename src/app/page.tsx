'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
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

  useEffect(() => {
    fetchPins();
    // Load user email from localStorage
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      setCurrentUserEmail(savedEmail);
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
        alert(error.error || 'Failed to create pin');
      }
    } catch (error) {
      console.error('Error creating pin:', error);
      alert('Failed to create pin');
    }
  };

  const handleFormCancel = () => {
    setSelectedLocation(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 text-green-800">
            Adopt a Tree in Thermi
          </h1>
          <p className="text-lg text-gray-700 mb-2">
            Help green our community by adopting and caring for a tree
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Click anywhere on the map to place a pin and adopt a tree
          </p>
          <div className="flex justify-center gap-4">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <span className="text-2xl">🌳</span>
              <span className="font-semibold text-green-700">{pins.length} Trees Adopted</span>
            </div>
            <Link
              href="/admin"
              className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 shadow-md transition-colors"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>

        {showSuccess && (
          <div className="max-w-2xl mx-auto mb-6 bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg shadow-md">
            <p className="font-semibold">Tree adopted successfully!</p>
            <p className="text-sm">Check your email for confirmation and details about your tree.</p>
          </div>
        )}

        <div className="max-w-6xl mx-auto">
          <div className="mb-4 flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <span className="text-xl">🌳</span>
              <span className="text-gray-700">Other Trees</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-xs">🌳</div>
              <span className="text-gray-700">Your Trees</span>
            </div>
          </div>
          <TreeMap
            onPinCreated={handlePinCreated}
            existingPins={pins}
            currentUserEmail={currentUserEmail}
          />
        </div>

        <div className="max-w-4xl mx-auto mt-12 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">📍</div>
              <h3 className="font-semibold text-lg mb-2">1. Choose Location</h3>
              <p className="text-gray-600 text-sm">
                Click on the map where you would like to adopt a tree
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">✍️</div>
              <h3 className="font-semibold text-lg mb-2">2. Fill Details</h3>
              <p className="text-gray-600 text-sm">
                Enter your name, email, and give your tree a special label
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">💧</div>
              <h3 className="font-semibold text-lg mb-2">3. Care for It</h3>
              <p className="text-gray-600 text-sm">
                Receive confirmation and commit to watering and maintaining your tree
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-2 text-yellow-800">Your Responsibilities</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Water your tree regularly, especially during dry periods</li>
            <li>Monitor the tree's health and report any issues to local authorities</li>
            <li>Keep the area around the tree clean and free from debris</li>
            <li>Be a tree champion and encourage others to participate</li>
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
