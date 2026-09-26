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
  ShieldCheck,
  Building2,
  Mail,
  RefreshCw,
} from 'lucide-react';
import { db } from '@/lib/db';
import { FinancialLedgerEntry } from '@/types/database';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

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
    link.setAttribute('download', `jvican_financial_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Page Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#0c0e17] via-[#080910] to-[#040508] p-6 sm:p-8 shadow-2xl">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#C9A84C]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-3.5 py-1 text-[11px] font-black uppercase tracking-widest text-[#C9A84C] mb-3 backdrop-blur-md">
              <Receipt className="h-3.5 w-3.5" />
              <span>Financial Audit &amp; Settlement Ledger</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Transactions &amp; Ledger
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl leading-relaxed">
              Complete, immutable double-entry audit trail of all verified vote transactions, JVican platform fees, and organizer disbursements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C9A84C] hover:bg-[#b8973b] text-black font-extrabold text-xs shadow-lg shadow-[#C9A84C]/20 transition active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Ledger CSV</span>
            </button>
            <button
              onClick={loadLedger}
              className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 hover:text-white border border-white/[0.08] transition"
              title="Refresh ledger"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0c13] p-5 shadow-xl transition-all duration-300 hover:border-emerald-500/40">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block mb-2">
            Total Ledger Volume
          </span>
          <p className="text-2xl font-black text-white tracking-tight">
            {formatCurrency(totals.gross)}
          </p>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            Gross transaction volume
          </span>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0c13] p-5 shadow-xl transition-all duration-300 hover:border-[#C9A84C]/50">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C9A84C] to-[#E3C565]" />
          <span className="text-[10px] font-black uppercase tracking-wider text-[#C9A84C] block mb-2">
            Platform Retained (10%)
          </span>
          <p className="text-2xl font-black text-[#C9A84C] tracking-tight">
            {formatCurrency(totals.fee)}
          </p>
          <span className="text-[11px] text-[#C9A84C]/70 mt-1 block">
            10% gross transaction cut
          </span>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0c13] p-5 shadow-xl transition-all duration-300 hover:border-sky-500/40">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-blue-400" />
          <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 block mb-2">
            Organizer Net (90%)
          </span>
          <p className="text-2xl font-black text-sky-400 tracking-tight">
            {formatCurrency(totals.net)}
          </p>
          <span className="text-[11px] text-sky-400/70 mt-1 block">
            Payable to event organizers
          </span>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0c13] p-5 shadow-xl transition-all duration-300 hover:border-violet-500/40">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-400" />
          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block mb-2">
            Total Logged Entries
          </span>
          <p className="text-2xl font-black text-white tracking-tight">
            {filteredEntries.length}
          </p>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            Cryptographically signed records
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0b0c13] border border-white/[0.08]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Payment Ref, Event Name, Organizer, Voter Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#C9A84C]/50 transition"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <Filter className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-xs text-neutral-400 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-neutral-200 focus:outline-none focus:border-[#C9A84C]/50 transition"
          >
            <option value="all">All Transactions</option>
            <option value="verified">Verified (Paid)</option>
            <option value="pending">Pending</option>
            <option value="reversed">Reversed / Refunded</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0b0c13] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] text-[10px] font-black uppercase tracking-wider text-neutral-400 border-b border-white/[0.06]">
              <tr>
                <th className="py-3.5 px-4">Date &amp; Time</th>
                <th className="py-3.5 px-4">Payment Ref / ID</th>
                <th className="py-3.5 px-4">Event &amp; Organizer</th>
                <th className="py-3.5 px-4">Voter</th>
                <th className="py-3.5 px-4 text-right">Gross Amount</th>
                <th className="py-3.5 px-4 text-right text-[#C9A84C]">Platform (10%)</th>
                <th className="py-3.5 px-4 text-right text-sky-400">Organizer (90%)</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
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
                    <div className="font-bold text-neutral-200 truncate max-w-[170px]">{entry.event_name}</div>
                    <div className="text-[10px] text-neutral-500 truncate max-w-[170px]">{entry.organizer_name}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-neutral-300">{entry.voter_email}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-white whitespace-nowrap">
                    {formatCurrency(entry.gross_amount)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-[#C9A84C] whitespace-nowrap">
                    {formatCurrency(entry.platform_fee)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-sky-400 whitespace-nowrap">
                    {formatCurrency(entry.organizer_amount)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border",
                        entry.status === 'verified'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : entry.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      )}
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
                  <td colSpan={8} className="py-14 text-center text-neutral-500">
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

