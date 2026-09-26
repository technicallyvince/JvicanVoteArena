'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  User,
  Layers,
  FileText,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { db } from '@/lib/db';
import { AuditLog, AuditAction } from '@/types/database';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = () => {
    const list = db.getAuditLogs();
    setLogs([...list].reverse());
  };

  const getActionBadgeColor = (action: AuditAction) => {
    switch (action) {
      case 'ADMIN_APPROVED_EVENT':
      case 'ADMIN_COMPLETED_WITHDRAWAL':
      case 'PAYMENT_VERIFIED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]';
      case 'ADMIN_REJECTED_EVENT':
      case 'ADMIN_REJECTED_WITHDRAWAL':
      case 'ADMIN_SUSPENDED_EVENT':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.15)]';
      case 'ORGANIZER_SUBMITTED_EVENT':
      case 'ORGANIZER_REQUESTED_WITHDRAWAL':
      case 'ADMIN_APPROVED_WITHDRAWAL':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]';
      case 'ADMIN_UPDATED_PLATFORM_SETTING':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.admin_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.admin_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.target_name && log.target_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.reason && log.reason.toLowerCase().includes(searchQuery.toLowerCase())) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction =
      actionFilter === 'all' ? true : log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#0c0d16] via-[#07080d] to-[#050608] p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-amber-400 mb-3 backdrop-blur-md">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Compliance, Governance & Accountability</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Immutable Security Audit Trail
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-2xl">
              Chronological cryptographic activity stream capturing all privileged administrative changes, status moderations, and financial authorizations.
            </p>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-slate-300 text-xs font-bold flex items-center gap-2.5 self-start md:self-auto shadow-inner">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Telemetry Active ({logs.length} events logged)</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Log ID, Actor, Target Entity, or Reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0b0c13] border border-white/[0.08] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#C9A84C] shadow-inner transition"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs text-slate-400 font-bold">Action:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-[#0b0c13] border border-white/[0.08] rounded-2xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#C9A84C] cursor-pointer"
          >
            <option value="all">All Action Types</option>
            <option value="ADMIN_APPROVED_EVENT">ADMIN_APPROVED_EVENT</option>
            <option value="ADMIN_REJECTED_EVENT">ADMIN_REJECTED_EVENT</option>
            <option value="ORGANIZER_SUBMITTED_EVENT">ORGANIZER_SUBMITTED_EVENT</option>
            <option value="ORGANIZER_REQUESTED_WITHDRAWAL">ORGANIZER_REQUESTED_WITHDRAWAL</option>
            <option value="ADMIN_APPROVED_WITHDRAWAL">ADMIN_APPROVED_WITHDRAWAL</option>
            <option value="ADMIN_COMPLETED_WITHDRAWAL">ADMIN_COMPLETED_WITHDRAWAL</option>
            <option value="ADMIN_REJECTED_WITHDRAWAL">ADMIN_REJECTED_WITHDRAWAL</option>
            <option value="ADMIN_UPDATED_PLATFORM_SETTING">ADMIN_UPDATED_PLATFORM_SETTING</option>
          </select>
        </div>
      </div>

      {/* Audit Log Timeline View */}
      <div className="space-y-3.5">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="p-5 rounded-3xl bg-[#0b0c13] border border-white/[0.08] hover:border-white/[0.15] transition-all space-y-4 shadow-xl group"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border inline-flex items-center gap-1.5",
                    getActionBadgeColor(log.action)
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {log.action.replace(/_/g, ' ')}
                </span>
                <span className="text-[11px] font-mono font-semibold text-slate-500">
                  {log.id}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {formatDate(log.created_at)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-sky-400" /> Actor / Super Admin
                </span>
                <p className="font-bold text-white mt-0.5">{log.admin_name}</p>
                <p className="font-mono text-[10px] text-slate-500 truncate">{log.admin_id}</p>
              </div>

              <div className="space-y-1 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" /> Target Entity ({log.target_type})
                </span>
                <p className="font-bold text-white mt-0.5">{log.target_name || log.target_id}</p>
                <p className="font-mono text-[10px] text-slate-500 truncate">{log.target_id}</p>
              </div>

              <div className="space-y-1 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] sm:col-span-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#C9A84C]" /> Note / Context Reason
                </span>
                <div className="text-[11px] text-[#C9A84C] font-medium truncate mt-0.5">
                  {log.reason || (log.metadata ? JSON.stringify(log.metadata) : 'System automated record')}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="p-16 text-center rounded-3xl border border-white/[0.08] bg-[#0b0c13] text-slate-400 text-xs shadow-xl space-y-2">
            <ShieldAlert className="mx-auto h-10 w-10 text-slate-600" />
            <p className="text-sm font-bold text-white">No Audit Records Found</p>
            <p className="text-xs text-slate-500">No events matched your search query or chosen action filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}

