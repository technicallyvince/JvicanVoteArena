'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Building2,
  ArrowUpRight,
  ShieldCheck,
  User,
} from 'lucide-react';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth';
import { WithdrawalRequest, WithdrawalStatus } from '@/types/database';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export default function AdminWithdrawalsPage() {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | WithdrawalStatus>('all');
  
  // Rejection modal state
  const [rejectingItem, setRejectingItem] = useState<WithdrawalRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Notification banner
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const loadWithdrawals = () => {
    const list = db.getWithdrawals();
    setWithdrawals([...list].reverse());
  };

  const handleStatusUpdate = async (
    id: string,
    status: WithdrawalStatus,
    reason?: string
  ) => {
    setActionLoading(true);
    try {
      db.updateWithdrawalStatus(
        id,
        status,
        reason,
        user?.id || 'admin-0000-0000-0000-000000000000'
      );
      setNotification({
        type: 'success',
        message: `Withdrawal ${id} successfully updated to status "${status}".`,
      });
      loadWithdrawals();
      setRejectingItem(null);
      setRejectionReason('');
    } catch {
      setNotification({
        type: 'error',
        message: `Failed to update withdrawal status.`,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredWithdrawals = withdrawals.filter((w) => {
    const matchesSearch =
      w.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.organizer_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.organizer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.payout_bank.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.payout_account_number.includes(searchQuery) ||
      w.payout_account_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true : w.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = withdrawals.filter(
    (w) => w.status === 'pending_approval' || w.status === 'requested' || w.status === 'processing'
  ).length;
  const pendingTotal = withdrawals
    .filter((w) => w.status === 'pending_approval' || w.status === 'requested' || w.status === 'processing')
    .reduce((sum, w) => sum + w.amount, 0);

  const completedTotal = withdrawals
    .filter((w) => w.status === 'completed')
    .reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-500/80 mb-1 block">
            Payout Settlement Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Organizer Withdrawals
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Review, approve, and finalize payout disbursement requests from event organizers.
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold flex items-center gap-2 self-start sm:self-auto">
            <Clock className="w-4 h-4" /> {pendingCount} Pending Clearance ({formatCurrency(pendingTotal)})
          </div>
        )}
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-amber-500/10 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500/80">
            Pending Approval Volume
          </span>
          <p className="text-xl font-black text-amber-400">
            {formatCurrency(pendingTotal)}
          </p>
          <span className="text-[10px] text-neutral-400">
            {pendingCount} organizer requests waiting
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-emerald-500/10 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500/80">
            Completed Settlements
          </span>
          <p className="text-xl font-black text-emerald-400">
            {formatCurrency(completedTotal)}
          </p>
          <span className="text-[10px] text-neutral-400">
            Successfully disbursed to bank accounts
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            Total Requests Filed
          </span>
          <p className="text-xl font-black text-white">
            {withdrawals.length}
          </p>
          <span className="text-[10px] text-neutral-400">
            Across all platform events
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-900/40 border border-white/5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Request ID, Organizer, Bank Name, or Account..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-neutral-500" />
          <span className="text-xs text-neutral-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500/50"
          >
            <option value="all">All Requests</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="rounded-2xl border border-white/5 bg-neutral-900/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/40 text-[10px] font-black uppercase tracking-wider text-neutral-400 border-b border-white/5">
              <tr>
                <th className="py-3.5 px-4">Request Date</th>
                <th className="py-3.5 px-4">Request ID / Organizer</th>
                <th className="py-3.5 px-4">Destination Bank Account</th>
                <th className="py-3.5 px-4 text-right">Requested Amount</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredWithdrawals.map((w) => (
                <tr
                  key={w.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3.5 px-4 text-neutral-300 whitespace-nowrap">
                    {formatDate(w.created_at)}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-mono text-white font-bold">{w.id}</div>
                    <div className="font-mono text-[10px] text-neutral-400 truncate max-w-[150px]">
                      {w.organizer_name}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-neutral-200">{w.payout_bank}</div>
                    <div className="text-[11px] text-neutral-400">
                      <span className="font-mono text-amber-400/90">{w.payout_account_number}</span> • {w.payout_account_name}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-white whitespace-nowrap">
                    {formatCurrency(w.amount)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        w.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : w.status === 'approved'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : w.status === 'pending_approval' || w.status === 'requested' || w.status === 'processing'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {w.status === 'completed' && <CheckCircle2 className="w-2.5 h-2.5" />}
                      {(w.status === 'pending_approval' || w.status === 'requested' || w.status === 'processing') && <Clock className="w-2.5 h-2.5" />}
                      {w.status === 'rejected' && <XCircle className="w-2.5 h-2.5" />}
                      {w.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {(w.status === 'pending_approval' || w.status === 'requested') && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(w.id, 'approved')}
                            disabled={actionLoading}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider transition-all"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectingItem(w)}
                            disabled={actionLoading}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[10px] font-black uppercase tracking-wider transition-all"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {(w.status === 'approved' || w.status === 'processing') && (
                        <button
                          onClick={() => handleStatusUpdate(w.id, 'completed')}
                          disabled={actionLoading}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-black text-[10px] uppercase tracking-wider transition-all shadow-md shadow-amber-500/20"
                        >
                          Mark Completed
                        </button>
                      )}

                      {(w.status === 'completed' || w.status === 'rejected') && (
                        <span className="text-[10px] text-neutral-500 italic">
                          Closed
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredWithdrawals.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500">
                    No withdrawal requests match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Withdrawal Modal */}
      <Modal
        isOpen={!!rejectingItem}
        onClose={() => {
          setRejectingItem(null);
          setRejectionReason('');
        }}
        title="Reject Withdrawal Request"
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-neutral-400">
            Please indicate why this withdrawal of{' '}
            <span className="font-bold text-white">
              {rejectingItem && formatCurrency(rejectingItem.amount)}
            </span>{' '}
            is being rejected. The organizer will be notified.
          </p>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
              Reason for Rejection
            </label>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Account name mismatch, flagged for audit, or requested prior to clearance window."
              className="w-full bg-neutral-900 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
            <Button
              variant="outline"
              onClick={() => {
                setRejectingItem(null);
                setRejectionReason('');
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (rejectingItem) {
                  handleStatusUpdate(rejectingItem.id, 'rejected', rejectionReason);
                }
              }}
              disabled={!rejectionReason.trim() || actionLoading}
              className="!bg-rose-600 hover:!bg-rose-500 !text-white"
            >
              {actionLoading ? 'Rejecting...' : 'Reject Request'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
