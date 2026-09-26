'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  Trophy,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  Clock,
  Vote,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Tag,
  Layers,
} from 'lucide-react';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth';
import { Event, Nominee, Category } from '@/types/database';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export default function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { user } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEventData();
  }, [resolvedParams.id]);

  const loadEventData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/events/details?id=${encodeURIComponent(resolvedParams.id)}&slug=${encodeURIComponent(resolvedParams.id)}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.event) {
        setEvent(data.event);
        setCategories(data.categories || []);
        setNominees(data.nominees || []);
      } else {
        setEvent(null);
      }
    } catch (err) {
      console.error('Error fetching admin event details:', err);
      setEvent(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C9A84C] border-t-transparent" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20 bg-[#0b0c13] rounded-3xl border border-white/[0.08] p-8 max-w-xl mx-auto space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500/80 mx-auto" />
        <h2 className="text-xl font-bold text-white">Event Record Not Found</h2>
        <p className="text-xs text-slate-400">
          The requested event record does not exist or has been permanently deleted from the database.
        </p>
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#C9A84C] hover:text-[#d4b55e] pt-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Events
        </Link>
      </div>
    );
  }

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id, status: 'published' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to approve event in database');

      db.updateEventApprovalStatus(
        event.id,
        'published',
        undefined,
        user?.id || 'admin-0000-0000-0000-000000000000'
      );
      setNotification({
        type: 'success',
        message: `Event "${event.name}" has been approved and published to the public marketplace!`,
      });
      loadEventData();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.message || 'Failed to approve event.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          status: 'rejected',
          rejectionReason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reject event in database');

      db.updateEventApprovalStatus(
        event.id,
        'rejected',
        rejectionReason,
        user?.id || 'admin-0000-0000-0000-000000000000'
      );
      setIsRejectModalOpen(false);
      setNotification({
        type: 'success',
        message: `Event "${event.name}" was marked as rejected.`,
      });
      loadEventData();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.message || 'Failed to reject event.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredNominees =
    selectedCategory === 'all'
      ? nominees
      : nominees.filter((n) => n.category_id === selectedCategory);

  const votesList = db.getVotes(event.id).filter((v) => v.status === 'confirmed');
  const totalVotes = votesList.reduce((sum, v) => sum + (v.quantity || 1), 0);
  const grossRevenue = totalVotes * (event.vote_price || 0);
  const platformFee = grossRevenue * 0.1;
  const organizerNet = grossRevenue - platformFee;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Back Navigation & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Event Registry
        </Link>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href={`/events/${event.slug}`}
            target="_blank"
            className="px-4 py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-bold transition-all border border-white/[0.08] flex items-center gap-2"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#C9A84C]" /> Public Voter Page
          </Link>

          {event.status === 'pending_approval' && (
            <>
              <button
                onClick={() => setIsRejectModalOpen(true)}
                disabled={actionLoading}
                className="px-4 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" /> Reject Event
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-[#050505] font-black text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Publish
              </button>
            </>
          )}
        </div>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold shadow-lg ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-emerald-500/10'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300 shadow-rose-500/10'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Details + Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details & Contest Roster */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0b0c13] border border-white/[0.08] shadow-2xl space-y-5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border inline-flex items-center gap-1.5 ${
                  event.status === 'published'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                    : event.status === 'pending_approval'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                    : event.status === 'rejected'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : 'bg-white/[0.05] text-slate-400 border-white/10'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                {event.status.replace('_', ' ')}
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-white/[0.03] text-slate-400 border border-white/[0.08]">
                ID: {event.id}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {event.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {event.description || 'No description provided.'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-white/[0.06]">
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-[#C9A84C]" /> Voting Timeline
                </span>
                <p className="text-xs font-bold text-white mt-1">
                  {formatDate(event.start_date)} → {formatDate(event.end_date)}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3 h-3 text-emerald-400" /> Vote Price
                </span>
                <p className="text-xs font-black text-emerald-400 mt-1">
                  {formatCurrency(event.vote_price || 0, event.currency)} / vote
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3 h-3 text-sky-400" /> Organizer
                </span>
                <p className="text-xs font-bold text-white truncate mt-1">
                  {event.organizer_name || event.organizer_id}
                </p>
              </div>
            </div>
          </div>

          {/* Categories & Nominees Inspection */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0b0c13] border border-white/[0.08] shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#C9A84C]" /> Contest Roster & Nominees
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {categories.length} Categories · {nominees.length} Registered Nominees
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-[#0e1018] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#C9A84C] cursor-pointer"
                >
                  <option value="all">All Categories ({nominees.length})</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Nominees Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredNominees.map((n) => {
                const nomVotes = db.getNomineeVoteCount(n.id);
                return (
                  <div
                    key={n.id}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-3 hover:border-white/[0.12] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/25 flex items-center justify-center text-xs font-black text-[#C9A84C] overflow-hidden shrink-0">
                        {n.image_url ? (
                          <img
                            src={n.image_url}
                            alt={n.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          n.name.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">
                          {n.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate">
                          Code: <span className="font-mono text-[#C9A84C] font-semibold">{n.public_id || 'N/A'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-emerald-400 flex items-center justify-end gap-1">
                        <Vote className="w-3.5 h-3.5" /> {nomVotes.toLocaleString()}
                      </div>
                      <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">
                        Confirmed
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredNominees.length === 0 && (
                <div className="col-span-full py-10 text-center text-xs text-slate-500 bg-white/[0.01] rounded-2xl border border-dashed border-white/[0.06]">
                  No nominees registered under the selected category.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Financial Snapshot & Payout Bank */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#0b0c13] border border-white/[0.08] shadow-2xl space-y-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#C9A84C]" /> Financial Breakdown
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Total Votes Cast</span>
                <span className="text-sm font-black text-white">
                  {totalVotes.toLocaleString()}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Gross Volume</span>
                <span className="text-sm font-black text-white">
                  {formatCurrency(grossRevenue, event.currency)}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#C9A84C]/5 border border-[#C9A84C]/15 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#C9A84C]">
                    JVican Platform Cut (10%)
                  </span>
                  <p className="text-[10px] text-slate-400">System retained</p>
                </div>
                <span className="text-sm font-black text-[#C9A84C]">
                  {formatCurrency(platformFee, event.currency)}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-400">
                    Organizer Net (90%)
                  </span>
                  <p className="text-[10px] text-slate-400">Payable balance</p>
                </div>
                <span className="text-sm font-black text-emerald-400">
                  {formatCurrency(organizerNet, event.currency)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#0b0c13] border border-white/[0.08] shadow-2xl space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-sky-400" /> Designated Settlement Bank
            </h3>

            {event.payout_bank ? (
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Bank:</span>
                  <span className="font-bold text-white">
                    {event.payout_bank}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Account Number:</span>
                  <span className="font-mono font-bold text-[#C9A84C]">
                    {event.payout_account_number}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Account Name:</span>
                  <span className="font-bold text-white">
                    {event.payout_account_name}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-white/[0.01] border border-dashed border-white/[0.08] text-xs text-slate-500 italic text-center">
                No bank settlement details configured by organizer.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Event Application"
        description="Provide a clear reason for rejection so the organizer can amend and re-submit."
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
              Rejection Reason / Required Changes
            </label>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Inappropriate category imagery, invalid payout details, or incomplete voting rules."
              className="w-full bg-[#0b0c13] border border-white/[0.1] rounded-2xl p-3.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500 shadow-inner resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsRejectModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || actionLoading}
              className="!bg-rose-600 hover:!bg-rose-500 !text-white"
            >
              {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

