'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wallet,
  ArrowUpRight,
  TrendingUp,
  Percent,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth';
import { FinancialLedgerEntry, Event } from '@/types/database';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export default function OrganizerWalletPage() {
  const { user } = useAuth();
  const organizerId = user?.id || '11111111-1111-1111-1111-111111111111';

  const [breakdown, setBreakdown] = useState<{
    grossRevenue: number;
    platformFees: number;
    organizerNetEarnings: number;
    completedWithdrawals: number;
    pendingWithdrawals: number;
    availableBalance: number;
  }>({
    grossRevenue: 0,
    platformFees: 0,
    organizerNetEarnings: 0,
    completedWithdrawals: 0,
    pendingWithdrawals: 0,
    availableBalance: 0,
  });

  const [events, setEvents] = useState<Event[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<FinancialLedgerEntry[]>([]);

  useEffect(() => {
    loadWalletData();
  }, [organizerId]);

  const loadWalletData = async () => {
    const b = db.getFinancialBreakdown(organizerId);
    setBreakdown(b);

    try {
      const res = await fetch("/api/admin/events", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.events)) {
        const orgEvents = data.events.filter((e: any) => e.organizer_id === organizerId || !e.organizer_id);
        setEvents(orgEvents.length > 0 ? orgEvents : data.events);
      } else {
        setEvents([]);
      }
    } catch {
      setEvents([]);
    }

    const allLedger = db.getLedger();
    const orgLedger = allLedger.filter((l) => l.organizer_id === organizerId);
    setLedgerEntries([...orgLedger].reverse());
  };

  return (
    <div className="min-h-screen bg-[#050608] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-500/80 mb-1 block">
              Organizer Financial Command
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Revenue & Wallet
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Track real-time ticket vote revenue, 10% platform service deductions, and your liquid payout balance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/withdrawals"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
            >
              <ArrowUpRight className="w-4 h-4" /> Request Payout
            </Link>
          </div>
        </div>

        {/* Primary Available Balance Hero Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900/80 to-amber-950/20 border border-amber-500/20 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" /> Net Available Balance
              </span>
              <div className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                {formatCurrency(breakdown.availableBalance)}
              </div>
              <p className="text-xs text-neutral-400 max-w-md">
                Ready for immediate automated disbursement to your designated bank account.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Pending Clearances
                </span>
                <p className="text-base font-black text-amber-400">
                  {formatCurrency(breakdown.pendingWithdrawals)}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Total Disbursed
                </span>
                <p className="text-base font-black text-emerald-400">
                  {formatCurrency(breakdown.completedWithdrawals)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Column Financial Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-white/5 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-blue-400" /> Gross Vote Revenue
            </span>
            <p className="text-2xl font-black text-white">
              {formatCurrency(breakdown.grossRevenue)}
            </p>
            <p className="text-[11px] text-neutral-500">
              Total gross amount paid by voters across all your active contests.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-amber-500/10 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-amber-400" /> Platform Infrastructure Fee (10%)
            </span>
            <p className="text-2xl font-black text-amber-400">
              {formatCurrency(breakdown.platformFees)}
            </p>
            <p className="text-[11px] text-neutral-500">
              Automated 10% fee covering payment gateway fees, security, and hosting.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-emerald-500/10 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Lifetime Net Earnings (90%)
            </span>
            <p className="text-2xl font-black text-emerald-400">
              {formatCurrency(breakdown.organizerNetEarnings)}
            </p>
            <p className="text-[11px] text-neutral-500">
              Your 90% cumulative net share across all events.
            </p>
          </div>
        </div>

        {/* Per-Event Financial Contribution */}
        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-white/5 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" /> Event Revenue Breakdown
              </h3>
              <p className="text-xs text-neutral-400">
                Detailed financial performance for each of your events.
              </p>
            </div>
            <Link
              href="/dashboard/events"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1"
            >
              Manage Events <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((event) => {
              const eventLedger = ledgerEntries.filter((l) => l.event_id === event.id);
              const eventGross = eventLedger.reduce((sum, l) => sum + l.gross_amount, 0);
              const eventFee = eventLedger.reduce((sum, l) => sum + l.platform_fee, 0);
              const eventNet = eventLedger.reduce((sum, l) => sum + l.organizer_amount, 0);
              const eventVotes = db.getVotes(event.id).filter((v) => v.status === 'confirmed').length;

              return (
                <div
                  key={event.id}
                  className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-4 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white truncate max-w-[200px]">
                      {event.name}
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        event.status === 'published'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {event.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-white/5">
                    <div className="p-2 rounded-lg bg-neutral-900/60">
                      <span className="text-[9px] text-neutral-500 uppercase font-bold block">
                        Votes
                      </span>
                      <span className="text-xs font-black text-white">
                        {eventVotes.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-neutral-900/60">
                      <span className="text-[9px] text-neutral-500 uppercase font-bold block">
                        Gross
                      </span>
                      <span className="text-xs font-black text-white">
                        {formatCurrency(eventGross)}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/10">
                      <span className="text-[9px] text-emerald-400 uppercase font-bold block">
                        Your Net (90%)
                      </span>
                      <span className="text-xs font-black text-emerald-400">
                        {formatCurrency(eventNet)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {events.length === 0 && (
              <div className="col-span-full py-8 text-center text-xs text-neutral-500">
                You have not created any events yet.
              </div>
            )}
          </div>
        </div>

        {/* Recent Transaction Stream */}
        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-4">
            <Clock className="w-4 h-4 text-amber-400" /> Recent Settled Votes
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/40 text-[10px] font-black uppercase tracking-wider text-neutral-400 border-b border-white/5">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Payment Ref</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4 text-right">Gross</th>
                  <th className="py-3 px-4 text-right text-amber-400">10% Fee</th>
                  <th className="py-3 px-4 text-right text-emerald-400">Your Net</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {ledgerEntries.slice(0, 8).map((entry) => (
                  <tr key={entry.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 text-neutral-300 whitespace-nowrap">
                      {formatDate(entry.created_at)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {entry.payment_reference}
                    </td>
                    <td className="py-3 px-4 font-semibold text-neutral-200 truncate max-w-[150px]">
                      {entry.event_name}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-white whitespace-nowrap">
                      {formatCurrency(entry.gross_amount)}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-amber-400 whitespace-nowrap">
                      {formatCurrency(entry.platform_fee)}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-emerald-400 whitespace-nowrap">
                      {formatCurrency(entry.organizer_amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {ledgerEntries.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-neutral-500">
                      No transactions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
