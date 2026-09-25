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
      const res = await fetch(`/api/events/details?id=${encodeURIComponent(resolvedParams.id)}&slug=${encodeURIComponent(resolvedParams.id)}`);
      const data = await res.json();
      if (data.success && data.event) {
        setEvent(data.event);
        setCategories(data.categories || []);
        setNominees(data.nominees || []);
      } else {
        const ev = db.getEventById(resolvedParams.id) || db.getEventBySlug(resolvedParams.id);
        if (ev) {
          setEvent(ev);
          setCategories(db.getCategories(ev.id));
          setNominees(db.getNominees(ev.id));
        } else {
          setEvent(null);
        }
      }
    } catch (err) {
      console.error('Error fetching admin event details:', err);
      const ev = db.getEventById(resolvedParams.id) || db.getEventBySlug(resolvedParams.id);
      if (ev) {
        setEvent(ev);
        setCategories(db.getCategories(ev.id));
        setNominees(db.getNominees(ev.id));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-12 h-12 text-amber-500/50 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Event Not Found</h2>
        <p className="text-sm text-neutral-400 mb-6">
          The requested event record does not exist or has been removed.
        </p>
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300"
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
      {/* Top Back Navigation & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Registry
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href={`/events/${event.slug}`}
            target="_blank"
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-bold transition-all border border-white/10 flex items-center gap-2"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Public Voter Page
          </Link>

          {event.status === 'pending_approval' && (
            <>
              <button
                onClick={() => setIsRejectModalOpen(true)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" /> Reject Event
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Publish
              </button>
            </>
          )}
        </div>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-medium ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-neutral-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Header / Banner Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-white/5 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  event.status === 'published'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : event.status === 'pending_approval'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : event.status === 'rejected'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                }`}
              >
                {event.status.replace('_', ' ')}
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/5 text-neutral-400 border border-white/10">
                ID: {event.id}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {event.name}
            </h1>

            <p className="text-sm text-neutral-400 leading-relaxed">
              {event.description || 'No description provided.'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-white/5">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> Event Timeline
                </span>
                <p className="text-xs font-semibold text-neutral-200">
                  {formatDate(event.start_date)} - {formatDate(event.end_date)}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3 h-3" /> Vote Cost
                </span>
                <p className="text-xs font-semibold text-neutral-200">
                  {formatCurrency(event.vote_price || 0)} / vote
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3 h-3" /> Organizer Ref
                </span>
                <p className="text-xs font-mono text-neutral-400 truncate">
                  {event.organizer_name || event.organizer_id}
                </p>
              </div>
            </div>
          </div>

          {/* Categories & Nominees Inspection */}
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-white/5 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" /> Contest Roster
                </h3>
                <p className="text-xs text-neutral-400">
                  {categories.length} Categories • {nominees.length} Registered Nominees
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500/50"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredNominees.map((n) => {
                const nomVotes = db.getNomineeVoteCount(n.id);
                return (
                  <div
                    key={n.id}
                    className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-3 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-xs font-bold text-amber-400 overflow-hidden shrink-0">
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
                        <p className="text-[10px] text-neutral-400 truncate">
                          Code: <span className="font-mono text-amber-400/80">{n.public_id || 'N/A'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-emerald-400 flex items-center justify-end gap-1">
                        <Vote className="w-3 h-3" /> {nomVotes.toLocaleString()}
                      </div>
                      <span className="text-[9px] text-neutral-500 uppercase font-bold">
                        Votes
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredNominees.length === 0 && (
                <div className="col-span-full py-8 text-center text-xs text-neutral-500">
                  No nominees registered in this category.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Financial Snapshot & Payout Details */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-white/5 space-y-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" /> Financial Overview
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <span className="text-xs text-neutral-400">Total Votes Cast</span>
                <span className="text-sm font-bold text-white">
                  {totalVotes.toLocaleString()}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <span className="text-xs text-neutral-400">Gross Volume</span>
                <span className="text-sm font-bold text-white">
                  {formatCurrency(grossRevenue)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-400">
                    Platform Fee (10%)
                  </span>
                  <p className="text-[9px] text-neutral-500">System Cut</p>
                </div>
                <span className="text-sm font-black text-amber-400">
                  {formatCurrency(platformFee)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-400">
                    Organizer Net (90%)
                  </span>
                  <p className="text-[9px] text-neutral-500">Net Payable</p>
                </div>
                <span className="text-sm font-black text-emerald-400">
                  {formatCurrency(organizerNet)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-white/5 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" /> Designated Settlement Bank
            </h3>

            {event.payout_bank ? (
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Bank:</span>
                  <span className="font-bold text-neutral-200">
                    {event.payout_bank}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Account Number:</span>
                  <span className="font-mono font-bold text-amber-400">
                    {event.payout_account_number}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Account Name:</span>
                  <span className="font-bold text-neutral-200">
                    {event.payout_account_name}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-neutral-500 italic">
                No bank settlement details configured by organizer.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Event Application"
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-neutral-400">
            Please provide a specific reason for rejecting this event submission.
            This will be logged in the audit trail and accessible to the organizer.
          </p>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
              Rejection Reason / Required Changes
            </label>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Inappropriate category imagery, invalid bank details, or incomplete voting rules."
              className="w-full bg-neutral-900 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
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
