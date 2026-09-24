'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  Plus,
  ArrowLeft,
} from 'lucide-react';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth';
import { WithdrawalRequest } from '@/types/database';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export default function OrganizerWithdrawalsPage() {
  const { user } = useAuth();
  const organizerId = user?.id || '11111111-1111-1111-1111-111111111111';
  const organizerName = user?.name || 'Chief Organizer';
  const organizerEmail = user?.email || 'organizer@jvican.com';

  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // Form states
  const [amount, setAmount] = useState<string>('');
  const [bankName, setBankName] = useState<string>('Access Bank');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, [organizerId]);

  const loadData = () => {
    const b = db.getFinancialBreakdown(organizerId);
    setAvailableBalance(b.availableBalance);

    const orgW = db.getWithdrawals(organizerId);
    setWithdrawals([...orgW]);
  };

  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setErrorMessage('Please enter a valid withdrawal amount.');
      return;
    }

    if (parsedAmount > availableBalance) {
      setErrorMessage(
        `Insufficient available balance. You can withdraw up to ${formatCurrency(
          availableBalance
        )}.`
      );
      return;
    }

    if (parsedAmount < 1000) {
      setErrorMessage('Minimum withdrawal amount is ₦1,000.');
      return;
    }

    if (!accountNumber.trim() || accountNumber.length < 10) {
      setErrorMessage('Please provide a valid 10-digit account number.');
      return;
    }

    if (!accountName.trim()) {
      setErrorMessage('Please provide the beneficiary account name.');
      return;
    }

    setLoading(true);
    try {
      db.requestWithdrawal({
        organizer_id: organizerId,
        organizer_name: organizerName,
        organizer_email: organizerEmail,
        amount: parsedAmount,
        payout_bank: bankName,
        payout_account_number: accountNumber.trim(),
        payout_account_name: accountName.trim(),
      });

      setIsRequestModalOpen(false);
      setAmount('');
      setAccountNumber('');
      setAccountName('');
      setNotification({
        type: 'success',
        message:
          'Withdrawal request successfully filed! Your funds will clear following administrative review.',
      });
      loadData();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to submit withdrawal request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050608] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <Link
              href="/dashboard/wallet"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Wallet Overview
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Withdrawals & Payouts
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Request bank settlements and track payout status for your event ticket proceeds.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Request Payout
            </button>
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
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
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

        {/* Balance Card */}
        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Available Liquid Balance
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {formatCurrency(availableBalance)}
            </div>
          </div>

          <button
            onClick={() => setIsRequestModalOpen(true)}
            disabled={availableBalance < 1000}
            className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-bold transition-all disabled:opacity-50 disabled:pointer-events-none self-start sm:self-auto"
          >
            Withdraw to Bank
          </button>
        </div>

        {/* Payout History Table */}
        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-4">
            <Clock className="w-4 h-4 text-amber-400" /> Withdrawal History
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/40 text-[10px] font-black uppercase tracking-wider text-neutral-400 border-b border-white/5">
                <tr>
                  <th className="py-3 px-4">Date Filed</th>
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Beneficiary Bank Account</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 px-4 text-neutral-300 whitespace-nowrap">
                      {formatDate(w.created_at)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {w.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{w.payout_bank}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">
                        {w.payout_account_number} • {w.payout_account_name}
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
                  </tr>
                ))}

                {withdrawals.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-neutral-500">
                      No withdrawal requests filed yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Request Withdrawal Modal */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Request Bank Payout"
        maxWidth="md"
      >
        <form onSubmit={handleRequestWithdrawal} className="space-y-4 pt-2">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
            <span className="text-xs text-neutral-400">Available to Withdraw:</span>
            <span className="text-sm font-black text-amber-400">
              {formatCurrency(availableBalance)}
            </span>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
              Withdrawal Amount (₦)
            </label>
            <input
              type="number"
              min="1000"
              max={availableBalance}
              step="100"
              placeholder="e.g. 50000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-neutral-900 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
              Select Destination Bank
            </label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full bg-neutral-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="Access Bank">Access Bank</option>
              <option value="Guaranty Trust Bank (GTBank)">Guaranty Trust Bank (GTBank)</option>
              <option value="Zenith Bank">Zenith Bank</option>
              <option value="United Bank for Africa (UBA)">United Bank for Africa (UBA)</option>
              <option value="First Bank of Nigeria">First Bank of Nigeria</option>
              <option value="Kuda Bank">Kuda Bank</option>
              <option value="Opay">Opay</option>
              <option value="Palmpay">Palmpay</option>
              <option value="Moniepoint">Moniepoint</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                Account Number
              </label>
              <input
                type="text"
                maxLength={10}
                placeholder="10-digit NUBAN"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full bg-neutral-900 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                Account Name
              </label>
              <input
                type="text"
                placeholder="Beneficiary Name"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full bg-neutral-900 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsRequestModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={loading || availableBalance < 1000}
              className="!bg-amber-500 hover:!bg-amber-400 !text-black font-black"
            >
              {loading ? 'Submitting...' : 'Confirm Request'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
