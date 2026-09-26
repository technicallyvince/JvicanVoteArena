'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldAlert,
  Percent,
  Clock,
  DollarSign,
  ToggleLeft,
  ToggleRight,
  Save,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Layers,
  KeyRound,
  Sliders,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth';
import { PlatformSettings } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function AdminSettingsPage() {
  const { user, changeAdminPassword } = useAuth();
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Form states
  const [feePercent, setFeePercent] = useState<number>(10);
  const [delayHours, setDelayHours] = useState<number>(24);
  const [minWithdrawal, setMinWithdrawal] = useState<number>(1000);
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [manualApproval, setManualApproval] = useState<boolean>(true);
  const [gateway, setGateway] = useState<string>('TransactPay AI / Standard Kit Escrow');

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChanging, setPasswordChanging] = useState(false);

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setNotification({
        type: 'error',
        message: 'New password and confirmation do not match.',
      });
      return;
    }
    setPasswordChanging(true);
    const res = await changeAdminPassword(currentPassword, newPassword);
    if (res.success) {
      setNotification({
        type: 'success',
        message: res.message,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setNotification({
        type: 'error',
        message: res.message,
      });
    }
    setPasswordChanging(false);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const s = db.getPlatformSettings();
    setSettings(s);
    setFeePercent(s.platform_fee_percent);
    setDelayHours(s.payout_delay_hours);
    setMinWithdrawal(s.minimum_withdrawal_amount);
    setMaintenanceMode(s.maintenance_mode);
    setManualApproval(s.require_manual_event_approval);
    if (s.settlement_gateway) setGateway(s.settlement_gateway);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = db.updatePlatformSettings(
        {
          platform_fee_percent: Number(feePercent),
          payout_delay_hours: Number(delayHours),
          minimum_withdrawal_amount: Number(minWithdrawal),
          maintenance_mode: maintenanceMode,
          require_manual_event_approval: manualApproval,
          settlement_gateway: gateway,
        },
        user?.id || 'admin-0000-0000-0000-000000000000'
      );
      setSettings(updated);
      setNotification({
        type: 'success',
        message: 'Platform configuration updated and broadcast across global nodes.',
      });
    } catch {
      setNotification({
        type: 'error',
        message: 'Failed to update platform settings.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#C9A84C]/25 bg-gradient-to-br from-[#0c0d16] via-[#07080d] to-[#050608] p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#C9A84C]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-[#C9A84C] mb-3 backdrop-blur-md">
            <Sliders className="h-3.5 w-3.5" />
            <span>Global Platform Governance</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            System & Financial Configuration
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
            Configure baseline commission rates, settlement threshold rules, maintenance gating, and update the privileged Super Admin security credentials.
          </p>
        </div>
      </div>

      {notification && (
        <div
          className={cn(
            "p-4 rounded-2xl border flex items-center justify-between text-xs font-bold shadow-lg animate-in slide-in-from-top-2 duration-300",
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-emerald-500/10'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300 shadow-rose-500/10'
          )}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Financial Rules Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0b0c13] border border-white/[0.08] shadow-2xl space-y-6">
          <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
            <div className="h-9 w-9 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/25 flex items-center justify-center text-[#C9A84C]">
              <Percent className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">Financial & Fee Mechanics</h3>
              <p className="text-[11px] text-slate-400">Manage JVican revenue share and organizer clearance conditions.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                Default Platform Fee (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={feePercent}
                  onChange={(e) => setFeePercent(Number(e.target.value))}
                  className="w-full bg-[#050608] border border-white/[0.1] focus:border-[#C9A84C] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition shadow-inner font-mono font-bold"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-[#C9A84C]">
                  %
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5">
                Commission deducted from gross vote volume (default 10%).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                Minimum Withdrawal Threshold (₦)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={minWithdrawal}
                  onChange={(e) => setMinWithdrawal(Number(e.target.value))}
                  className="w-full bg-[#050608] border border-white/[0.1] focus:border-[#C9A84C] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition shadow-inner font-mono font-bold"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-emerald-400">
                  NGN
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5">
                Minimum cleared balance required before organizer payout requests.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                Payout Delay / Clearance Period (Hours)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="168"
                  value={delayHours}
                  onChange={(e) => setDelayHours(Number(e.target.value))}
                  className="w-full bg-[#050608] border border-white/[0.1] focus:border-[#C9A84C] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition shadow-inner font-mono font-bold"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-amber-400">
                  HRS
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5">
                Holding duration against potential chargebacks and verification.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                Settlement Gateway Corridor
              </label>
              <input
                type="text"
                value={gateway}
                onChange={(e) => setGateway(e.target.value)}
                className="w-full bg-[#050608] border border-white/[0.1] focus:border-[#C9A84C] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition shadow-inner font-medium"
                required
              />
              <p className="text-[10px] text-slate-500 mt-1.5">
                Active settlement partner used for disbursement escrow.
              </p>
            </div>
          </div>
        </div>

        {/* Security & Governance Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0b0c13] border border-white/[0.08] shadow-2xl space-y-5">
          <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
            <div className="h-9 w-9 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">Platform Gating & Access Control</h3>
              <p className="text-[11px] text-slate-400">Safeguards and approval switches governing public operations.</p>
            </div>
          </div>

          <div className="space-y-3.5">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-white">
                  Require Manual Event Approval
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  When enabled, newly created events remain in `pending_approval` until vetted by Super Admin.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setManualApproval(!manualApproval)}
                className="text-[#C9A84C] hover:text-[#d4b55e] transition-colors cursor-pointer"
              >
                {manualApproval ? (
                  <ToggleRight className="w-9 h-9 text-[#C9A84C]" />
                ) : (
                  <ToggleLeft className="w-9 h-9 text-slate-600" />
                )}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-white">
                  System Maintenance Mode
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Temporarily pause new vote payments and event submissions during system upgrades.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className="text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                {maintenanceMode ? (
                  <ToggleRight className="w-9 h-9 text-rose-500" />
                ) : (
                  <ToggleLeft className="w-9 h-9 text-slate-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Super Admin Security & Password Change Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0b0c13] border border-[#C9A84C]/25 shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center text-[#C9A84C]">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-white">Super Admin Password & Security</h3>
                <p className="text-[11px] text-slate-400">Update the master credential required to access the Super Admin governance portal.</p>
              </div>
            </div>
            <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/30">
              admin@jvican.com
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-[#050608] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#C9A84C] shadow-inner"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#050608] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#C9A84C] shadow-inner"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#050608] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#C9A84C] shadow-inner"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <p className="text-[11px] text-slate-500">
              Default password if never changed is <code className="text-[#C9A84C] font-mono">admin@password123</code>
            </p>
            <button
              type="button"
              onClick={handlePasswordChange}
              disabled={passwordChanging || !currentPassword || !newPassword}
              className="px-5 py-2.5 rounded-xl bg-[#C9A84C] hover:bg-[#d4b55e] text-[#050505] font-black text-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#C9A84C]/20"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{passwordChanging ? 'Updating Password...' : 'Update Admin Password'}</span>
            </button>
          </div>
        </div>

        {/* Save Actions */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-2xl bg-[#C9A84C] hover:bg-[#d4b55e] text-[#050505] font-black text-xs transition-all shadow-xl shadow-[#C9A84C]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving Changes...' : 'Save System Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

