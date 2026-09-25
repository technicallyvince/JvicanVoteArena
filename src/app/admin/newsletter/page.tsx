'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { NewsletterSubscriber, NewsletterStatus, NewsletterSource } from '@/types/database';
import {
  Users,
  UserCheck,
  UserX,
  Search,
  Filter,
  Download,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Mail,
  Calendar,
  Globe,
  RefreshCw,
  Plus
} from 'lucide-react';

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | NewsletterStatus>('ALL');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | NewsletterSource>('ALL');
  
  // Broadcast modal state
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastHeadline, setBroadcastHeadline] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcastCtaText, setBroadcastCtaText] = useState('');
  const [broadcastCtaUrl, setBroadcastCtaUrl] = useState('');
  const [broadcastStatus, setBroadcastStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [broadcastResult, setBroadcastResult] = useState<{ total: number; sent: number; failed: number } | null>(null);

  // Manual subscriber add modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [addError, setAddError] = useState('');

  const loadSubscribers = () => {
    const list = db.getNewsletterSubscribers();
    setSubscribers([...list]);
  };

  useEffect(() => {
    loadSubscribers();
  }, []);

  const totalCount = subscribers.length;
  const activeCount = subscribers.filter((s) => s.status === 'SUBSCRIBED').length;
  const unsubscribedCount = subscribers.filter((s) => s.status === 'UNSUBSCRIBED').length;

  const filteredSubscribers = subscribers.filter((sub) => {
    const matchesSearch =
      sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.name && sub.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || sub.status === statusFilter;
    const matchesSource = sourceFilter === 'ALL' || sub.source === sourceFilter;

    return matchesSearch && matchesStatus && matchesSource;
  });

  const handleExportCSV = () => {
    if (subscribers.length === 0) return;
    const headers = ['Email', 'Name', 'Status', 'Source', 'Subscribed At', 'Unsubscribed At'];
    const rows = filteredSubscribers.map((s) => [
      `"${s.email}"`,
      `"${s.name || ''}"`,
      s.status,
      s.source,
      s.subscribed_at,
      s.unsubscribed_at || '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `jvican_subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddSubscriber = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    if (!newEmail || !newEmail.includes('@')) {
      setAddError('Please provide a valid email.');
      return;
    }

    db.subscribeNewsletter({
      email: newEmail.trim().toLowerCase(),
      name: newName.trim() || undefined,
      source: 'ADMIN',
    });
    setNewEmail('');
    setNewName('');
    setAddModalOpen(false);
    loadSubscribers();
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastSubject || !broadcastHeadline || !broadcastContent) {
      alert('Please fill in Subject, Headline, and Content fields.');
      return;
    }

    setBroadcastStatus('sending');
    try {
      const res = await fetch('/api/admin/newsletter/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: broadcastSubject,
          headline: broadcastHeadline,
          contentHtml: broadcastContent.replace(/\n/g, '<br/>'),
          ctaText: broadcastCtaText || undefined,
          ctaUrl: broadcastCtaUrl || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBroadcastStatus('success');
        setBroadcastResult({
          total: data.totalSubscribers,
          sent: data.sentCount,
          failed: data.failedCount,
        });
      } else {
        setBroadcastStatus('error');
      }
    } catch {
      setBroadcastStatus('error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Mail className="h-7 w-7 text-[#C9A84C]" />
            <span>Newsletter &amp; Audience</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Manage subscriber database, track consent sources, and trigger broadcasts via Resend.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setBroadcastStatus('idle');
              setBroadcastResult(null);
              setBroadcastOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#E3C565] hover:from-[#B8973B] hover:to-[#D4B654] text-black font-extrabold text-xs shadow-lg shadow-[#C9A84C]/20 transition active:scale-95 cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>New Broadcast</span>
          </button>

          <button
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white font-semibold text-xs border border-white/[0.08] transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Subscriber</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white font-semibold text-xs border border-white/[0.08] transition cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0b0c12] border border-white/[0.08] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
              Total Subscribers
            </span>
            <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">
              {totalCount}
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b0c12] border border-white/[0.08] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
              Active (Subscribed)
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 block">
              {activeCount}
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <UserCheck className="h-6 w-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b0c12] border border-white/[0.08] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
              Unsubscribed
            </span>
            <span className="text-2xl sm:text-3xl font-black text-rose-400 mt-1 block">
              {unsubscribedCount}
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <UserX className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0b0c12] border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search email or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/[0.04] border border-white/[0.08] focus:border-[#C9A84C]/50 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-[#C9A84C]"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBSCRIBED">Subscribed</option>
            <option value="UNSUBSCRIBED">Unsubscribed</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as any)}
            className="px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-[#C9A84C]"
          >
            <option value="ALL">All Sources</option>
            <option value="WEBSITE">Website Form</option>
            <option value="VOTING_FLOW">Voting Flow Opt-in</option>
            <option value="ORGANIZER">Organizer</option>
            <option value="ADMIN">Admin Added</option>
          </select>

          <button
            onClick={loadSubscribers}
            className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-neutral-400 hover:text-white transition"
            title="Refresh list"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="rounded-2xl bg-[#0b0c12] border border-white/[0.08] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] border-b border-white/[0.06] text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Email Address</th>
                <th className="px-5 py-3.5">Name</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Consent Source</th>
                <th className="px-5 py-3.5">Subscribed Date</th>
                <th className="px-5 py-3.5">Unsubscribed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-neutral-300">
              {filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-neutral-500">
                    No subscribers found matching the filters.
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-5 py-3.5 font-medium text-white">
                      {sub.email}
                    </td>
                    <td className="px-5 py-3.5 text-neutral-400">
                      {sub.name || '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sub.status === 'SUBSCRIBED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-[11px] text-neutral-400">
                        {sub.source}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-neutral-400">
                      {new Date(sub.subscribed_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-neutral-500">
                      {sub.unsubscribed_at
                        ? new Date(sub.unsubscribed_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Broadcast Modal */}
      {broadcastOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0c0c12] border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Send className="h-5 w-5 text-[#C9A84C]" />
                <span>Send Newsletter Broadcast</span>
              </h3>
              <button
                onClick={() => setBroadcastOpen(false)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {broadcastStatus === 'success' ? (
              <div className="text-center py-6 space-y-3">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-white">Broadcast Dispatched</h4>
                <p className="text-xs text-neutral-400">
                  Successfully delivered to {broadcastResult?.sent} of {broadcastResult?.total} active subscribers via Resend.
                </p>
                <button
                  onClick={() => setBroadcastOpen(false)}
                  className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl transition"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendBroadcast} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 uppercase mb-1">
                    Email Subject Line:
                  </label>
                  <input
                    type="text"
                    required
                    value={broadcastSubject}
                    onChange={(e) => setBroadcastSubject(e.target.value)}
                    placeholder="e.g. Major Update: Final Voting Rounds Open"
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 uppercase mb-1">
                    Announcement Headline:
                  </label>
                  <input
                    type="text"
                    required
                    value={broadcastHeadline}
                    onChange={(e) => setBroadcastHeadline(e.target.value)}
                    placeholder="e.g. The Stage is Set for Grand Finale 2026"
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 uppercase mb-1">
                    Email Body Content:
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={broadcastContent}
                    onChange={(e) => setBroadcastContent(e.target.value)}
                    placeholder="Enter your announcement details here..."
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-300 uppercase mb-1">
                      CTA Button Text:
                    </label>
                    <input
                      type="text"
                      value={broadcastCtaText}
                      onChange={(e) => setBroadcastCtaText(e.target.value)}
                      placeholder="e.g. Explore Events"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#C9A84C]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-300 uppercase mb-1">
                      CTA URL:
                    </label>
                    <input
                      type="url"
                      value={broadcastCtaUrl}
                      onChange={(e) => setBroadcastCtaUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#C9A84C]"
                    />
                  </div>
                </div>

                <div className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl text-[11px] text-neutral-400 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-[#C9A84C] shrink-0" />
                  <span>Will be dispatched to {activeCount} active opted-in subscribers. Unsubscribe links are automatically appended.</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setBroadcastOpen(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={broadcastStatus === 'sending'}
                    className="px-5 py-2 bg-[#C9A84C] hover:bg-[#d4b86a] text-black text-xs font-bold rounded-xl transition shadow-lg shadow-[#C9A84C]/20 disabled:opacity-50"
                  >
                    {broadcastStatus === 'sending' ? 'Dispatching...' : 'Send Broadcast'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add Subscriber Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0c0c12] border border-white/10 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Add Newsletter Subscriber</h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubscriber} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 uppercase mb-1">
                  Email Address:
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="voter@example.com"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#C9A84C]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 uppercase mb-1">
                  Name (Optional):
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#C9A84C]"
                />
              </div>

              {addError && (
                <div className="text-xs text-rose-400">{addError}</div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#C9A84C] hover:bg-[#d4b86a] text-black text-xs font-bold rounded-xl transition"
                >
                  Save Subscriber
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
