'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Search,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';
import { db } from '@/lib/db';
import { FinancialLedgerEntry } from '@/types/database';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminTransactionsPage() {
  const [ledgerEntries, setLedgerEntries] = useState<FinancialLedgerEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending' | 'reversed'>('all');

  useEffect(() => {
    loadLedger();
  }, []);

  const loadLedger = () => {
    const entries = db.getLedger();
    setLedgerEntries([...entries].reverse());
  };

  const filteredEntries = ledgerEntries.filter((entry) => {
    const matchesSearch =
      entry.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.event_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.payment_reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.voter_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.organizer_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true : entry.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totals = filteredEntries.reduce(
    (acc, curr) => {
      acc.gross += curr.gross_amount;
      acc.fee += curr.platform_fee;
      acc.net += curr.organizer_amount;
      return acc;
    },
    { gross: 0, fee: 0, net: 0 }
  );

  const exportToCSV = () => {
    const headers = [
      'Ledger Entry ID',
      'Payment Reference',
      'Event Name',
      'Event ID',
      'Organizer Name',
      'Organizer ID',
      'Voter Email',
      'Gross Amount',
      'Platform Fee (10%)',
      'Organizer Amount (90%)',
      'Currency',
      'Status',
      'Date',
    ];

    const rows = filteredEntries.map((e) => [
      e.id,
      e.payment_reference,
      `"${e.event_name}"`,
      e.event_id,
      `"${e.organizer_name}"`,
      e.organizer_id,
      e.voter_email,
      e.gross_amount,
      e.platform_fee,
      e.organizer_amount,
      e.currency,
      e.status,
      e.created_at,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `voteflow_financial_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-500/80 mb-1 block">
            Financial Audit Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Transactions & Ledger
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Complete, immutable audit trail of all vote transactions, platform fees, and organizer splits.
          </p>
        </div>

        <button
          onClick={exportToCSV}
          className="px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-bold transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" /> Export Ledger CSV
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            Total Ledger Volume
          </span>
          <p className="text-lg sm:text-xl font-black text-white">
            {formatCurrency(totals.gross)}
          </p>
          <span className="text-[10px] text-neutral-400">
            Gross transaction volume
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-amber-500/10 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500/80">
            Platform Retained (10%)
          </span>
          <p className="text-lg sm:text-xl font-black text-amber-400">
            {formatCurrency(totals.fee)}
          </p>
          <span className="text-[10px] text-amber-500/60">
            10% gross transaction cut
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-emerald-500/10 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500/80">
            Organizer Net (90%)
          </span>
          <p className="text-lg sm:text-xl font-black text-emerald-400">
            {formatCurrency(totals.net)}
          </p>
          <span className="text-[10px] text-emerald-500/60">
            Payable to event admins
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            Total Ledger Records
          </span>
          <p className="text-lg sm:text-xl font-black text-white">
            {filteredEntries.length}
          </p>
          <span className="text-[10px] text-neutral-400">
            All records cryptographically logged
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-900/40 border border-white/5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Payment Ref, Event Name, Organizer, Voter Email..."
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
            <option value="all">All Transactions</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="reversed">Reversed</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-2xl border border-white/5 bg-neutral-900/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/40 text-[10px] font-black uppercase tracking-wider text-neutral-400 border-b border-white/5">
              <tr>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Payment Ref / ID</th>
                <th className="py-3.5 px-4">Event & Organizer</th>
                <th className="py-3.5 px-4">Voter</th>
                <th className="py-3.5 px-4 text-right">Gross Total</th>
                <th className="py-3.5 px-4 text-right text-amber-400">Platform (10%)</th>
                <th className="py-3.5 px-4 text-right text-emerald-400">Organizer (90%)</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredEntries.map((entry) => (
                <tr
                  key={entry.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3.5 px-4 text-neutral-300 whitespace-nowrap">
                    {formatDate(entry.created_at)}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-mono text-white font-bold">{entry.payment_reference}</div>
                    <div className="font-mono text-[10px] text-neutral-500">{entry.id}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-neutral-200 truncate max-w-[160px]">{entry.event_name}</div>
                    <div className="text-[10px] text-neutral-500 truncate max-w-[160px]">{entry.organizer_name}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-neutral-400">{entry.voter_email}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-white whitespace-nowrap">
                    {formatCurrency(entry.gross_amount)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-amber-400 whitespace-nowrap">
                    {formatCurrency(entry.platform_fee)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-emerald-400 whitespace-nowrap">
                    {formatCurrency(entry.organizer_amount)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        entry.status === 'verified'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : entry.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {entry.status === 'verified' ? (
                        <CheckCircle2 className="w-2.5 h-2.5" />
                      ) : (
                        <Clock className="w-2.5 h-2.5" />
                      )}
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-500">
                    No financial ledger entries match your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
