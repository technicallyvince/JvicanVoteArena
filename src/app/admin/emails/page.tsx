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
  Inbox
} from 'lucide-react';

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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Inbox className="h-7 w-7 text-[#C9A84C]" />
            <span>Email Delivery Logs</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Audit trail of all transactional receipts, status alerts, multi-provider routing (Resend + Brevo), and newsletter dispatches.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={() => {
              setShowBrevoModal(true);
              setTestResult(null);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-semibold text-xs border border-purple-500/20 transition cursor-pointer"
          >
            <Send className="h-4 w-4 text-purple-400" />
            <span>Test Brevo Fallback</span>
          </button>

          <button
            onClick={loadLogs}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white font-semibold text-xs border border-white/[0.08] transition cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Logs</span>
          </button>
        </div>
      </div>

      {/* Brevo Test Diagnostic Modal */}
      {showBrevoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0c0c12] border border-purple-500/30 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="h-5 w-5 text-purple-400" />
                <span>Brevo Diagnostic Test</span>
              </h3>
              <button
                onClick={() => setShowBrevoModal(false)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-400">
              Dispatches a non-destructive test transactional email through the <code className="text-purple-300 font-mono">BrevoClient</code> SDK once <code className="text-amber-300 font-mono">BREVO_API_KEY</code> is configured.
            </p>

            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs ${
                  testResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                }`}
              >
                {testResult.message}
              </div>
            )}

            <form onSubmit={handleSendBrevoTest} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Recipient Test Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="voter@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-purple-500/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none transition"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowBrevoModal(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={testSending || !testEmail}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{testSending ? 'Dispatching...' : 'Send Test Email'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0b0c12] border border-white/[0.08] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
              Total Dispatches
            </span>
            <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">
              {totalEmails}
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Mail className="h-6 w-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b0c12] border border-white/[0.08] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
              Successful Deliveries
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 block">
              {sentEmails}
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b0c12] border border-white/[0.08] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
              Failed Attempts
            </span>
            <span className="text-2xl sm:text-3xl font-black text-rose-400 mt-1 block">
              {failedEmails}
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <AlertCircle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0b0c12] border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search recipient, subject, idempotency key..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/[0.04] border border-white/[0.08] focus:border-[#C9A84C]/50 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-[#C9A84C]"
          >
            <option value="ALL">All Types</option>
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
            className="px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-[#C9A84C]"
          >
            <option value="ALL">All Statuses</option>
            <option value="sent">Sent</option>
            <option value="queued">Queued</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl bg-[#0b0c12] border border-white/[0.08] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] border-b border-white/[0.06] text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Recipient</th>
                <th className="px-5 py-3.5">Subject Line</th>
                <th className="px-5 py-3.5">Provider</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-neutral-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-neutral-500">
                    No email logs found matching the filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-5 py-3.5 text-neutral-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono text-[10px] text-neutral-300">
                        {log.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-white">
                      {log.recipient}
                    </td>
                    <td className="px-5 py-3.5 text-neutral-300 truncate max-w-xs">
                      {log.subject}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          (log.provider_used || log.provider) === 'brevo'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : (log.provider_used || log.provider) === 'resend'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-neutral-500/10 text-neutral-400 border border-neutral-500/20'
                        }`}
                      >
                        {log.provider_used || log.provider}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'sent'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : log.status === 'failed'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0c0c12] border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Mail className="h-5 w-5 text-[#C9A84C]" />
                <span>Email Log #{selectedLog.id.slice(0, 8)}</span>
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">Type:</span>
                <span className="font-mono text-white">{selectedLog.type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">Recipient:</span>
                <span className="font-medium text-white">{selectedLog.recipient}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">Primary Provider:</span>
                <span className="font-medium text-neutral-300">{selectedLog.primary_provider || selectedLog.provider}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">Provider Actually Used:</span>
                <span className="font-medium text-emerald-300">{selectedLog.provider_used || selectedLog.provider}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">Attempts:</span>
                <span className="font-medium text-white">{selectedLog.attempt_count || 1}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">Subject:</span>
                <span className="text-white text-right">{selectedLog.subject}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">Status:</span>
                <span className="font-bold text-emerald-400 uppercase">{selectedLog.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">Idempotency Key:</span>
                <span className="font-mono text-[11px] text-neutral-300">{selectedLog.idempotency_key || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">Provider Message ID:</span>
                <span className="font-mono text-[11px] text-neutral-300">{selectedLog.provider_message_id || '—'}</span>
              </div>
              {selectedLog.error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300">
                  <div className="font-bold uppercase text-[10px] mb-1">Error Message:</div>
                  <div>{selectedLog.error}</div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl"
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
