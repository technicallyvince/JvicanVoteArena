'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please provide a valid email address.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'WEBSITE' }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        setMessage(data.message || 'Thank you for subscribing!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to subscribe.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="w-full">
      <h4 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#C9A84C] mb-2 sm:mb-3">
        Stay Updated
      </h4>
      <p className="text-xs text-neutral-400 mb-3 leading-relaxed">
        Subscribe to JVican spotlights, featured ceremonies, and major platform announcements.
      </p>

      {status === 'success' ? (
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="relative flex items-center">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full pl-3 pr-10 py-2 bg-white/[0.04] border border-white/[0.08] focus:border-[#C9A84C]/50 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none transition"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="absolute right-1.5 p-1 bg-[#C9A84C] hover:bg-[#d4b86a] text-black rounded-md transition disabled:opacity-50"
              title="Subscribe"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-1.5 text-[11px] text-rose-400">
              <AlertCircle className="h-3 w-3 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <p className="text-[10px] text-neutral-500">
            No spam. You can unsubscribe at any time.
          </p>
        </form>
      )}
    </div>
  );
}
