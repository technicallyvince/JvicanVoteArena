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
} from 'lucide-react';
import { db } from '@/lib/db';
import { AuditLog, AuditAction } from '@/types/database';
import { formatDate } from '@/lib/utils';

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
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'ADMIN_REJECTED_EVENT':
      case 'ADMIN_REJECTED_WITHDRAWAL':
      case 'ADMIN_SUSPENDED_EVENT':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'ORGANIZER_SUBMITTED_EVENT':
      case 'ORGANIZER_REQUESTED_WITHDRAWAL':
      case 'ADMIN_APPROVED_WITHDRAWAL':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'ADMIN_UPDATED_PLATFORM_SETTING':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-500/80 mb-1 block">
            System Security & Compliance
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Immutable Audit Trail
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time cryptographic activity stream logging all administrative and financial actions.
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-neutral-300 text-xs font-bold flex items-center gap-2 self-start sm:self-auto">
          <Activity className="w-4 h-4 text-amber-400 animate-pulse" /> Live Telemetry Active
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-900/40 border border-white/5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Log ID, Admin/Actor, Target, or Reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-neutral-500" />
          <span className="text-xs text-neutral-400">Action:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-500/50"
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
      <div className="space-y-3">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="p-4 rounded-2xl bg-neutral-900/60 border border-white/5 hover:border-white/10 transition-all space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${getActionBadgeColor(
                    log.action
                  )}`}
                >
                  {log.action.replace(/_/g, ' ')}
                </span>
                <span className="text-[10px] font-mono text-neutral-500">
                  {log.id}
                </span>
              </div>
              <span className="text-xs text-neutral-400 font-mono">
                {formatDate(log.created_at)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                  <User className="w-3 h-3" /> Actor / Admin
                </span>
                <p className="font-bold text-neutral-200">{log.admin_name}</p>
                <p className="font-mono text-[10px] text-neutral-500 truncate">{log.admin_id}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                  <Layers className="w-3 h-3" /> Target Entity ({log.target_type})
                </span>
                <p className="font-bold text-neutral-200">{log.target_name || log.target_id}</p>
                <p className="font-mono text-[10px] text-neutral-500 truncate">{log.target_id}</p>
              </div>

              <div className="space-y-0.5 sm:col-span-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Note / Reason
                </span>
                <div className="text-[11px] text-amber-400/90 truncate">
                  {log.reason || (log.metadata ? JSON.stringify(log.metadata) : 'No reason recorded')}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="p-12 text-center rounded-2xl border border-white/5 bg-neutral-900/40 text-neutral-500 text-xs">
            No audit records found matching the specified parameters.
          </div>
        )}
      </div>
    </div>
  );
}
