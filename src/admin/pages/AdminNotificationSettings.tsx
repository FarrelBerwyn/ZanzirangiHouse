import React, { useState, useEffect } from 'react';
import {
  Bell,
  Smartphone,
  Mail,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Radio,
  CheckCircle2,
  AlertTriangle,
  User,
  ExternalLink,
  Volume2,
  Info,
  RefreshCw,
} from 'lucide-react';
import { supportApi } from '../../services/supportApi';
import { authApi, AdminUser } from '../../services/authApi';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const AdminNotificationSettings: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  // Duty states
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [isDutyLoading, setIsDutyLoading] = useState(false);
  const [staffDutyList, setStaffDutyList] = useState<any[]>([]);
  const [hasAgentOnline, setHasAgentOnline] = useState(false);

  // Push notification states
  const [isPushSubscribed, setIsPushSubscribed] = useState(false);
  const [isPushLoading, setIsPushLoading] = useState(false);
  const [pushStatusMessage, setPushStatusMessage] = useState<string | null>(null);
  const [statusMessageType, setStatusMessageType] = useState<'success' | 'error' | 'info'>('info');

  useEffect(() => {
    setCurrentUser(authApi.getUser());
    loadDutyStatus();
    checkExistingPushSubscription();
  }, []);

  const loadDutyStatus = async () => {
    try {
      const res = await supportApi.getDutyStatus();
      setIsOnDuty(res.isOnDuty);
      setStaffDutyList(res.staff || []);
      setHasAgentOnline(res.hasAgentOnline);
    } catch (e) {
      console.error('Failed to load duty status', e);
    }
  };

  const handleToggleDuty = async () => {
    if (isDutyLoading) return;
    setIsDutyLoading(true);
    try {
      const nextDuty = !isOnDuty;
      const res = await supportApi.toggleDutyStatus(nextDuty);
      const updatedDuty = res.duty?.is_on_duty ?? nextDuty;
      setIsOnDuty(updatedDuty);
      setStaffDutyList(res.staff || []);
      setHasAgentOnline(res.hasAgentOnline);
      setPushStatusMessage(
        updatedDuty
          ? '✓ You are now ON DUTY. Live guest inquiries will be routed to you.'
          : '✓ You are now OFF DUTY. Inquiries will trigger automated mobile push and email escalation.'
      );
      setStatusMessageType('success');
      setTimeout(() => setPushStatusMessage(null), 5000);
    } catch (err: any) {
      setPushStatusMessage(`Failed to update duty status: ${err.message}`);
      setStatusMessageType('error');
    } finally {
      setIsDutyLoading(false);
    }
  };

  const checkExistingPushSubscription = async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        setIsPushSubscribed(Boolean(sub));
      }
    } catch (e) {
      console.warn('Could not inspect push subscription', e);
    }
  };

  const enableMobileWebPush = async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPushStatusMessage('This browser or device does not support Web Push Notifications.');
      setStatusMessageType('error');
      return;
    }

    setIsPushLoading(true);
    setPushStatusMessage(null);

    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        setPushStatusMessage('Notification permission denied. Please allow notifications in your device settings.');
        setStatusMessageType('error');
        setIsPushLoading(false);
        return;
      }

      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const vapidKey = await supportApi.getVapidPublicKey();
      const convertedKey = urlBase64ToUint8Array(vapidKey);
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });

      const success = await supportApi.subscribePush(sub.toJSON());
      if (success) {
        setIsPushSubscribed(true);
        setPushStatusMessage('✓ Mobile Push Connected! You will receive instant alerts for incoming guest messages.');
        setStatusMessageType('success');
        setTimeout(() => setPushStatusMessage(null), 6000);
      }
    } catch (err: any) {
      console.error('Push registration error:', err);
      setPushStatusMessage(`Failed to enable mobile push: ${err.message}`);
      setStatusMessageType('error');
    } finally {
      setIsPushLoading(false);
    }
  };

  const handleTestPush = async () => {
    try {
      setPushStatusMessage('Sending test push alert to registered devices...');
      setStatusMessageType('info');
      const res = await supportApi.testPushNotification();
      if (res.sent > 0) {
        setPushStatusMessage(`✓ Test notification sent to ${res.sent} device(s)! Check your mobile screen.`);
        setStatusMessageType('success');
      } else {
        setPushStatusMessage('No mobile devices registered yet. Click "Connect This Device" below first.');
        setStatusMessageType('error');
      }
      setTimeout(() => setPushStatusMessage(null), 6000);
    } catch (err: any) {
      setPushStatusMessage(`Failed to send test alert: ${err.message}`);
      setStatusMessageType('error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* ---------------- PAGE HEADER ---------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-adm-line gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-adm-accent">
              ACCOUNT & NOTIFICATIONS
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-emerald-950/60 border border-emerald-700/60 text-emerald-300">
              ACTIVE
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-adm-text tracking-wide mt-1">
            Support Notifications & Duty Settings
          </h1>
          <p className="text-xs text-adm-muted mt-0.5">
            Configure multi-tier guest alert channels, mobile push notifications, and staff on-duty availability.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={loadDutyStatus}
            className="p-2 rounded-lg bg-adm-surface hover:bg-adm-raised border border-adm-line text-adm-text-2 hover:text-adm-text transition-all cursor-pointer"
            title="Refresh Status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ---------------- FEEDBACK BANNER ---------------- */}
      {pushStatusMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between animate-in fade-in duration-200 ${
            statusMessageType === 'success'
              ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
              : statusMessageType === 'error'
              ? 'bg-red-950/60 border-red-800/60 text-red-300'
              : 'bg-adm-surface border-adm-accent/50 text-adm-text'
          }`}
        >
          <div className="flex items-center space-x-2">
            {statusMessageType === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {statusMessageType === 'error' && <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
            {statusMessageType === 'info' && <Info className="w-4 h-4 text-adm-accent shrink-0" />}
            <span>{pushStatusMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setPushStatusMessage(null)}
            className="text-xs opacity-70 hover:opacity-100 ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ---------------- SIGNED-IN ACCOUNT CARD ---------------- */}
      <div className="bg-adm-surface border border-adm-line rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-adm-accent-fill text-adm-on-accent font-bold text-lg flex items-center justify-center shrink-0 shadow-md">
              {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold text-adm-text">
                  {currentUser?.name || currentUser?.email || 'Administrator'}
                </h3>
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-adm-accent/20 border border-adm-accent/40 text-adm-accent font-bold">
                  {currentUser?.role || 'SUPERADMIN'}
                </span>
              </div>
              <p className="text-xs text-adm-muted font-mono mt-0.5">{currentUser?.email || 'admin@zanzirangihouse.com'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono text-adm-muted">System Authority:</span>
            <span className="px-2 py-1 rounded-lg bg-adm-raised border border-adm-line text-[11px] font-mono text-emerald-400">
              Live Gateway Access
            </span>
          </div>
        </div>
      </div>

      {/* ---------------- SECTION 1: STAFF DUTY & LIVE ROUTING ---------------- */}
      <div className="bg-adm-surface border border-adm-line rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-adm-line/60 pb-3">
          <div>
            <h2 className="text-sm font-semibold text-adm-text">Staff On-Duty Availability</h2>
            <p className="text-xs text-adm-muted mt-0.5">
              Set your availability to handle live guest support chats.
            </p>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-adm-muted">PRIORITY ROUTING</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-adm-raised/60 border border-adm-line/50">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-adm-text flex items-center space-x-2">
              <span>Current Status:</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                isOnDuty
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
              }`}>
                {isOnDuty ? 'ON DUTY' : 'OFF DUTY'}
              </span>
            </div>
            <p className="text-xs text-adm-muted max-w-xl">
              When On Duty, new guest chats will alert you directly. When all staff are Off Duty, the system automatically triggers multi-step mobile push and email escalation.
            </p>
          </div>

          <button
            type="button"
            onClick={handleToggleDuty}
            disabled={isDutyLoading}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer shadow-md disabled:opacity-50 shrink-0 ${
              isOnDuty
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-adm-surface hover:bg-adm-card text-adm-text border border-adm-line'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${isOnDuty ? 'bg-white animate-pulse' : 'bg-zinc-500'}`} />
            <span>{isOnDuty ? 'I am ON DUTY' : 'I am OFF DUTY'}</span>
          </button>
        </div>

        {/* Team Availability Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <span className="text-adm-muted">Active On-Duty Team:</span>
          {hasAgentOnline ? (
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 font-medium text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>
                Available Staff:{' '}
                {staffDutyList
                  .filter((s) => s.is_on_duty)
                  .map((s) => s.staff_name || s.name || 'Staff')
                  .join(', ') || '1 Agent'}
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-rose-950/50 border border-rose-800/40 text-rose-300 font-medium text-[11px]">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>No staff currently on duty • Auto-Escalation & Mobile Push Active</span>
            </div>
          )}
        </div>
      </div>

      {/* ---------------- SECTION 2: MOBILE WEB PUSH (PWA) ---------------- */}
      <div className="bg-adm-surface border border-adm-line rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-adm-line/60 pb-3">
          <div>
            <h2 className="text-sm font-semibold text-adm-text">Mobile Device Push Notifications</h2>
            <p className="text-xs text-adm-muted mt-0.5">
              Receive instant alerts on your smartphone screen when a guest needs human support.
            </p>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-adm-muted">PWA & VAPID</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Connection Card */}
          <div className="p-4 rounded-xl bg-adm-raised/60 border border-adm-line/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-adm-text">This Device Connection</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  isPushSubscribed
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                    : 'bg-amber-950/80 text-amber-300 border border-amber-700/60'
                }`}
              >
                {isPushSubscribed ? 'CONNECTED' : 'NOT CONNECTED'}
              </span>
            </div>

            <p className="text-xs text-adm-muted">
              Connect your smartphone or tablet browser to receive lock-screen push alerts even when the browser tab is closed.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={enableMobileWebPush}
                disabled={isPushLoading}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer shadow-sm disabled:opacity-50 ${
                  isPushSubscribed
                    ? 'bg-sky-950/60 text-sky-300 border border-sky-800/60 hover:bg-sky-950'
                    : 'bg-amber-600 hover:bg-amber-500 text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{isPushSubscribed ? 'Reconnect Mobile Push' : 'Connect Mobile Notifications'}</span>
              </button>

              <button
                type="button"
                onClick={handleTestPush}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-adm-text-2 bg-adm-surface hover:bg-adm-card border border-adm-line flex items-center space-x-1.5 transition-all cursor-pointer"
                title="Send test alert to all registered devices"
              >
                <Radio className="w-3.5 h-3.5 text-adm-accent" />
                <span>Test Mobile Push</span>
              </button>
            </div>
          </div>

          {/* Device Setup Guide */}
          <div className="p-4 rounded-xl bg-adm-raised/40 border border-adm-line/50 space-y-2.5 text-xs text-adm-muted">
            <span className="font-semibold text-adm-text block">Installation Instructions</span>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <span className="text-adm-accent font-bold">•</span>
                <div>
                  <strong className="text-adm-text">Apple iPhone / iPad (iOS 16.4+):</strong> Open this Admin URL in Safari, tap the <span className="text-adm-accent">Share</span> button, and select <span className="text-adm-accent font-medium">"Add to Home Screen"</span>. Launch from Home Screen to receive native push notifications.
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-adm-accent font-bold">•</span>
                <div>
                  <strong className="text-adm-text">Android & Chrome:</strong> Click "Connect Mobile Notifications" above and tap <span className="text-adm-accent font-medium">"Allow"</span> when prompted.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- SECTION 3: 4-TIER NOTIFICATION ARCHITECTURE ---------------- */}
      <div className="bg-adm-surface border border-adm-line rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-adm-line/60 pb-3">
          <div>
            <h2 className="text-sm font-semibold text-adm-text">4-Tier Notification Architecture</h2>
            <p className="text-xs text-adm-muted mt-0.5">
              Automated redundancy pipeline ensuring no guest inquiry goes unanswered.
            </p>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-adm-accent">ESC-V3 PROTOCOL</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Layer 1 */}
          <div className="p-4 rounded-xl bg-adm-raised/60 border border-adm-line/60 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-adm-muted">Layer 1</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="flex items-center space-x-2 text-adm-accent">
              <Volume2 className="w-4 h-4" />
              <h3 className="text-xs font-semibold text-adm-text">Web Chime</h3>
            </div>
            <p className="text-[11px] text-adm-muted leading-relaxed">
              Instant acoustic chime & live visual counter inside the active Admin Dashboard.
            </p>
            <div className="pt-2 text-[10px] font-mono text-emerald-400">
              Real-time WebSocket & Polling
            </div>
          </div>

          {/* Layer 2 */}
          <div className="p-4 rounded-xl bg-adm-raised/60 border border-adm-line/60 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-adm-muted">Layer 2</span>
              <span className="w-2 h-2 rounded-full bg-sky-400" />
            </div>
            <div className="flex items-center space-x-2 text-adm-accent">
              <Smartphone className="w-4 h-4" />
              <h3 className="text-xs font-semibold text-adm-text">Mobile Web Push</h3>
            </div>
            <p className="text-[11px] text-adm-muted leading-relaxed">
              Immediate lockscreen push notification delivered to all registered staff mobile devices.
            </p>
            <div className="pt-2 text-[10px] font-mono text-sky-400">
              VAPID Push Protocol
            </div>
          </div>

          {/* Layer 3 */}
          <div className="p-4 rounded-xl bg-adm-raised/60 border border-adm-line/60 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-adm-muted">Layer 3</span>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            </div>
            <div className="flex items-center space-x-2 text-adm-accent">
              <Mail className="w-4 h-4" />
              <h3 className="text-xs font-semibold text-adm-text">Email Alert</h3>
            </div>
            <p className="text-[11px] text-adm-muted leading-relaxed">
              Automated handoff alert dispatched to <span className="font-mono text-adm-text">info@zanzirangihouse.com</span> with 1-click reply link.
            </p>
            <div className="pt-2 text-[10px] font-mono text-amber-400">
              Hostinger SMTP Gateway
            </div>
          </div>

          {/* Layer 4 */}
          <div className="p-4 rounded-xl bg-adm-raised/60 border border-adm-line/60 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-adm-muted">Layer 4</span>
              <span className="w-2 h-2 rounded-full bg-purple-400" />
            </div>
            <div className="flex items-center space-x-2 text-adm-accent">
              <Clock className="w-4 h-4" />
              <h3 className="text-xs font-semibold text-adm-text">Escalation Reminders</h3>
            </div>
            <p className="text-[11px] text-adm-muted leading-relaxed">
              Periodic automated reminders triggered at 2 min, 5 min, and 10 min if inquiries remain unacknowledged.
            </p>
            <div className="pt-2 text-[10px] font-mono text-purple-400">
              2m • 5m • 10m Escalation Queue
            </div>
          </div>
        </div>

        {/* Bottom policy banner */}
        <div className="mt-4 p-3 rounded-xl bg-adm-raised/40 border border-adm-line/50 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-adm-muted gap-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-adm-accent shrink-0" />
            <span>
              <strong className="text-adm-text">AI + Human Synergy:</strong> Simple queries are handled automatically by Elena AI • Detailed inquiries and human handoffs are immediately routed to staff devices.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
