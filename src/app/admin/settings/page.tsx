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
} from 'lucide-react';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth';
import { PlatformSettings } from '@/types/database';
import { Button } from '@/components/ui/Button';

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
  const [gateway, setGateway] = useState<string>('Paystack / Korapay Escrow');

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
    setGateway(s.settlement_gateway);
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
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-white/5 pb-6">
        <span className="text-[10px] font-black uppercase tracking-wider text-amber-500/80 mb-1 block">
          Platform Governance
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          System & Financial Settings
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Configure baseline financial commission rates, payout security rules, and platform gating parameters.
        </p>
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

      <form onSubmit={handleSave} className="space-y-6">
        {/* Financial Rules Card */}
        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-white/5 space-y-5">
          <div className="flex items-center gap-2 border-b border-white/5 pb-4">
            <Percent className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Financial & Fee Mechanics</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                Default Platform Fee Percentage (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={feePercent}
                  onChange={(e) => setFeePercent(Number(e.target.value))}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-500">
                  %
                </span>
              </div>
              <p className="text-[10px] text-neutral-500 mt-1">
                Standard platform fee deducted from gross vote purchases (currently 10%).
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                Minimum Withdrawal Amount (₦)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={minWithdrawal}
                  onChange={(e) => setMinWithdrawal(Number(e.target.value))}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-500">
                  NGN
                </span>
              </div>
              <p className="text-[10px] text-neutral-500 mt-1">
                Minimum balance required before an organizer can request a payout.
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                Payout Delay / Clearance Period (Hours)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="168"
                  value={delayHours}
                  onChange={(e) => setDelayHours(Number(e.target.value))}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-500">
                  hrs
                </span>
              </div>
              <p className="text-[10px] text-neutral-500 mt-1">
                Holding period for revenue clearance against potential chargebacks.
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                Primary Settlement Gateway
              </label>
              <input
                type="text"
                value={gateway}
                onChange={(e) => setGateway(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
                required
              />
              <p className="text-[10px] text-neutral-500 mt-1">
                Active settlement corridor used for automated disbursement.
              </p>
            </div>
          </div>
        </div>

        {/* Security & Governance Card */}
        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-white/5 space-y-5">
          <div className="flex items-center gap-2 border-b border-white/5 pb-4">
            <Lock className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Platform Security & Gating</h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-white">
                  Require Manual Event Approval
                </h4>
                <p className="text-[11px] text-neutral-400">
                  When enabled, newly created events remain in `pending_approval` until vetted by Super Admin.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setManualApproval(!manualApproval)}
                className="text-amber-400 hover:text-amber-300 transition-colors"
              >
                {manualApproval ? (
                  <ToggleRight className="w-8 h-8 text-amber-500" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-neutral-600" />
                )}
              </button>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-white">
                  System Maintenance Mode
                </h4>
                <p className="text-[11px] text-neutral-400">
                  Temporarily pause new vote payments and event creations while system upgrades occur.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className="text-amber-400 hover:text-amber-300 transition-colors"
              >
                {maintenanceMode ? (
                  <ToggleRight className="w-8 h-8 text-rose-500" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-neutral-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Super Admin Security & Password Change Card */}
        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-[#C9A84C]/20 shadow-lg space-y-5">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#C9A84C]" />
              <div>
                <h3 className="text-sm font-bold text-white">Super Admin Password & Security</h3>
                <p className="text-[11px] text-neutral-400">Update the master credential required to access the Super Admin governance portal.</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20">
              admin@jvican.com
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#C9A84C]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#C9A84C]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#C9A84C]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-neutral-500">
              Default password if never changed is <code className="text-amber-400 font-mono">admin@password123</code>
            </p>
            <button
              type="button"
              onClick={handlePasswordChange}
              disabled={passwordChanging || !currentPassword || !newPassword}
              className="px-4 py-2 rounded-xl bg-[#C9A84C] hover:bg-[#D4B86A] text-[#0a0c14] font-black text-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-[#C9A84C]/10"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{passwordChanging ? 'Updating Password...' : 'Update Admin Password'}</span>
            </button>
          </div>
        </div>

        {/* Save Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="!bg-amber-500 hover:!bg-amber-400 !text-black font-black px-6 shadow-lg shadow-amber-500/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </form>
    </div>
  );
}
