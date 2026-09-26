'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { EmailLog, EmailType } from '@/types/database';
import {
  Mail,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Send,
  Eye,
  ShieldAlert,
  Inbox,
  Sparkles,
  Zap,
  Server,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminEmailsPage() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | EmailType>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'queued' | 'sent' | 'failed'>('ALL');
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);

  // Brevo Test State
  const [showBrevoModal, setShowBrevoModal] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const loadLogs = () => {
    const list = db.getEmailLogs();
    setLogs([...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const totalEmails = logs.length;
  const sentEmails = logs.filter((l) => l.status === 'sent').length;
  const failedEmails = logs.filter((l) => l.status === 'failed').length;

  const handleSendBrevoTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail) return;
    setTestSending(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/admin/emails/test-brevo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toEmail: testEmail }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: `Test email successfully sent via Brevo! Message ID: ${data.messageId || 'confirmed'}`,
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Failed to dispatch test email through Brevo.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Network error while testing Brevo.',
      });
    } finally {
      setTestSending(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.idempotency_key && log.idempotency_key.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = typeFilter === 'ALL' || log.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#0c0d16] via-[#07080d] to-[#050608] p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-purple-300 mb-3 backdrop-blur-md">
              <Server className="h-3.5 w-3.5" />
              <span>Multi-Provider Dispatch Infrastructure</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Email Delivery Logs & Telemetry
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-2xl">
              Audit trail of all transactional receipts, payout alerts, automated fallback routing (Resend + Brevo), and audience broadcast logs.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => {
                setShowBrevoModal(true);
                setTestResult(null);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 font-bold text-xs border border-purple-500/30 transition shadow-lg shadow-purple-500/10 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5 text-purple-400" />
              <span>Test Brevo Fallback</span>
            </button>

            <button
              onClick={loadLogs}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-white font-bold text-xs border border-white/[0.08] transition cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh Logs</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 pt-6 border-t border-white/[0.08]">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Dispatches
              </span>
              <span className="text-2xl font-black text-white mt-1 block">
                {totalEmails}
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Mail className="h-5 w-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                Successful Deliveries
              </span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">
                {sentEmails}
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                Failed Attempts
              </span>
              <span className="text-2xl font-black text-rose-400 mt-1 block">
                {failedEmails}
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search recipient, subject, idempotency key..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#0b0c13] border border-white/[0.08] focus:border-[#C9A84C] rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none transition shadow-inner"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3.5 py-2.5 bg-[#0b0c13] border border-white/[0.08] rounded-2xl text-xs text-slate-300 focus:outline-none focus:border-[#C9A84C] cursor-pointer"
          >
            <option value="ALL">All Email Types</option>
            <option value="RECEIPT">Voting Receipts</option>
            <option value="PAYMENT_SUCCESS">Payment Success</option>
            <option value="PAYMENT_FAILED">Payment Failed</option>
            <option value="EVENT_SUBMITTED">Event Submitted</option>
            <option value="EVENT_APPROVED">Event Approved</option>
            <option value="EVENT_REJECTED">Event Rejected</option>
            <option value="WITHDRAWAL_REQUESTED">Withdrawal Requested</option>
            <option value="WITHDRAWAL_APPROVED">Withdrawal Approved</option>
            <option value="WITHDRAWAL_COMPLETED">Withdrawal Completed</option>
            <option value="WITHDRAWAL_FAILED">Withdrawal Failed</option>
            <option value="NEWSLETTER">Newsletter</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3.5 py-2.5 bg-[#0b0c13] border border-white/[0.08] rounded-2xl text-xs text-slate-300 focus:outline-none focus:border-[#C9A84C] cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="sent">Sent</option>
            <option value="queued">Queued</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-3xl bg-[#0b0c13] border border-white/[0.08] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] border-b border-white/[0.08] text-slate-400 font-black uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Recipient</th>
                <th className="px-6 py-4">Subject Line</th>
                <th className="px-6 py-4">Provider</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-500">
                    <Mail className="mx-auto h-10 w-10 text-slate-600 mb-2" />
                    No email logs found matching the filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-6 py-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                      {new Date(log.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] font-mono text-[10px] font-bold text-slate-300">
                        {log.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      {log.recipient}
                    </td>
                    <td className="px-6 py-4 text-slate-300 truncate max-w-xs">
                      {log.subject}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                          (log.provider_used || log.provider) === 'brevo'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                            : (log.provider_used || log.provider) === 'resend'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : 'bg-white/[0.05] text-slate-400 border-white/10'
                        )}
                      >
                        {log.provider_used || log.provider}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                          log.status === 'sent'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                            : log.status === 'failed'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        )}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition border border-white/[0.08] cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Brevo Test Diagnostic Modal */}
      {showBrevoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0c0d16] border border-purple-500/30 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="h-5 w-5 text-purple-400" />
                <span>Brevo Diagnostic Test</span>
              </h3>
              <button
                onClick={() => setShowBrevoModal(false)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Dispatches a test transactional email through the <code className="text-purple-300 font-mono">BrevoClient</code> SDK to verify API key validity and deliverability.
            </p>

            {testResult && (
              <div
                className={cn(
                  "p-3.5 rounded-2xl border text-xs font-bold",
                  testResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                )}
              >
                {testResult.message}
              </div>
            )}

            <form onSubmit={handleSendBrevoTest} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                  Recipient Test Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full bg-[#050608] border border-white/[0.1] focus:border-purple-500/60 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition shadow-inner"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowBrevoModal(false)}
                  className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={testSending || !testEmail}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black rounded-xl transition flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-600/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{testSending ? 'Dispatching...' : 'Send Test Email'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0c0d16] border border-white/[0.1] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Mail className="h-5 w-5 text-[#C9A84C]" />
                <span>Email Log #{selectedLog.id.slice(0, 8)}</span>
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Type:</span>
                <span className="font-mono font-bold text-white">{selectedLog.type}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Recipient:</span>
                <span className="font-bold text-white">{selectedLog.recipient}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Primary Provider:</span>
                <span className="font-medium text-slate-300">{selectedLog.primary_provider || selectedLog.provider}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Provider Actually Used:</span>
                <span className="font-bold text-emerald-300">{selectedLog.provider_used || selectedLog.provider}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Attempts:</span>
                <span className="font-bold text-white">{selectedLog.attempt_count || 1}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Subject:</span>
                <span className="text-white text-right max-w-xs truncate">{selectedLog.subject}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Status:</span>
                <span className="font-black text-emerald-400 uppercase">{selectedLog.status}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Idempotency Key:</span>
                <span className="font-mono text-[11px] text-slate-300">{selectedLog.idempotency_key || '—'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Provider Message ID:</span>
                <span className="font-mono text-[11px] text-slate-300">{selectedLog.provider_message_id || '—'}</span>
              </div>
              {selectedLog.error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-300">
                  <div className="font-bold uppercase text-[10px] mb-1">Error Message:</div>
                  <div>{selectedLog.error}</div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

