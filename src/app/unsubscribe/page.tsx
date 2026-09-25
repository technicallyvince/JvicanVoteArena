'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const handleUnsubscribe = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        setMessage(data.message || 'You have been unsubscribed from our newsletter.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Unable to find an active subscription with this email.');
      }
    } catch {
      setStatus('error');
      setMessage('A network error occurred. Please try again later.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-[#0c0c12] border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-indigo-500" />
        
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 text-xl font-black">
            J
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Newsletter Preferences</h1>
          <p className="text-sm text-gray-400 mt-2">
            Manage your email subscription preferences for JVican Vote Arena announcements.
          </p>
        </div>

        {status === 'success' ? (
          <div className="text-center space-y-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm">
              ✓ {message}
            </div>
            <p className="text-xs text-gray-500">
              Note: You will still receive essential transactional emails (like vote receipts and account alerts).
            </p>
            <div className="pt-4">
              <Link
                href="/"
                className="inline-block px-6 py-2.5 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-xl transition"
              >
                Return to Home
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUnsubscribe} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {status === 'error' && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-rose-950/40 disabled:opacity-50"
            >
              {status === 'loading' ? 'Processing...' : 'Unsubscribe from Newsletter'}
            </button>

            <p className="text-[11px] text-gray-500 text-center leading-relaxed">
              Unsubscribing only affects promotional broadcasts and spotlights. You will always receive critical voting receipts and security notices.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-gray-400">Loading...</div>}>
      <UnsubscribeContent />
    </Suspense>
  );
}
