import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Check,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  Server,
  Database,
  Users,
} from 'lucide-react';
import { contentApi, SettingsModel } from '../../services/contentApi';

export const AdminSettingsManager: React.FC = () => {
  const [settings, setSettings] = useState<SettingsModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'success' | 'error'>('saved');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await contentApi.getAdminSettings();
      setSettings(data);
    } catch {
      setStatusMessage('Failed to load settings.');
      setSaveStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!settings) return;
    try {
      setSaveStatus('saving');
      setStatusMessage('Updating system settings...');
      const updated = await contentApi.updateSettings(settings);
      setSettings(updated);
      setSaveStatus('success');
      setStatusMessage('✓ Settings updated successfully.');
      setTimeout(() => {
        setSaveStatus('saved');
        setStatusMessage(null);
      }, 4000);
    } catch (err: any) {
      setSaveStatus('error');
      setStatusMessage(`Error: ${err.message || 'Failed to save'}`);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="py-24 text-center">
        <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-[#C4A27A]" />
        <p className="font-mono text-xs uppercase tracking-widest text-[#D8CCB8]">Loading Settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#2C2B28] gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#C4A27A]">
              SYSTEM PREFERENCES
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-emerald-950/60 border border-emerald-700/60 text-emerald-300">
              LIVE
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#FAF8F5] tracking-wide mt-1">
            Sanctuary & System Settings
          </h1>
          <p className="text-xs text-[#8E8B85] mt-0.5">
            Configure property branding, reservation notification recipient, currency, and access logs.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {statusMessage && (
            <div
              className={`text-xs font-mono px-3 py-1.5 rounded-lg flex items-center space-x-2 ${
                saveStatus === 'success'
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                  : saveStatus === 'error'
                  ? 'bg-red-950/60 text-red-300 border border-red-800/60'
                  : 'bg-[#22211F] text-[#D8CCB8] border border-[#2C2B28]'
              }`}
            >
              {saveStatus === 'success' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              {saveStatus === 'error' && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
              {saveStatus === 'saving' && <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C4A27A]" />}
              <span>{statusMessage}</span>
            </div>
          )}

          <button
            onClick={() => handleSave()}
            disabled={saveStatus === 'saving'}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-[#B8966C] hover:bg-[#C4A27A] text-[#141413] text-xs font-mono uppercase tracking-widest font-bold shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Sanctuary Branding */}
        <div className="bg-[#181716] p-6 rounded-xl border border-[#2C2B28] space-y-4">
          <h3 className="font-serif text-lg text-[#FAF8F5]">Sanctuary Identity</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                Property Brand Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                Official Brand Tagline
              </label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                Display Currency
              </label>
              <input
                type="text"
                value={settings.defaultCurrency}
                onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                Reservation Alerts Recipient Email
              </label>
              <input
                type="email"
                value={settings.reservationNotificationEmail}
                onChange={(e) =>
                  setSettings({ ...settings, reservationNotificationEmail: e.target.value })
                }
                className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Database & Infrastructure Health */}
        <div className="bg-[#181716] p-6 rounded-xl border border-[#2C2B28] space-y-4">
          <h3 className="font-serif text-lg text-[#FAF8F5]">Engine & Storage Architecture</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-lg bg-[#141413] border border-[#2C2B28] space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8E8B85] block">
                Database Store
              </span>
              <p className="font-mono text-xs text-[#FAF8F5]">Atomic JSON Engine</p>
              <p className="text-[10px] font-mono text-[#C4A27A]">server/data/db.json</p>
            </div>

            <div className="p-4 rounded-lg bg-[#141413] border border-[#2C2B28] space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8E8B85] block">
                Session Security
              </span>
              <p className="font-mono text-xs text-[#FAF8F5]">JWT 7-Day Secret</p>
              <p className="text-[10px] font-mono text-emerald-400">bcrypt 10-rounds</p>
            </div>

            <div className="p-4 rounded-lg bg-[#141413] border border-[#2C2B28] space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8E8B85] block">
                Hostinger Deployment
              </span>
              <p className="font-mono text-xs text-[#FAF8F5]">Self-Contained Express</p>
              <p className="text-[10px] font-mono text-emerald-400">No Git Re-build Needed</p>
            </div>
          </div>
        </div>

        {/* Authorized Admin Mailboxes */}
        <div className="bg-[#181716] p-6 rounded-xl border border-[#2C2B28] space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-[#2C2B28]">
            <ShieldCheck className="w-4 h-4 text-[#C4A27A]" />
            <h3 className="font-serif text-lg text-[#FAF8F5]">Authorized Hostinger Administrative Mailboxes</h3>
          </div>
          <div className="space-y-2">
            {[
              { email: 'info@zanzirangihouse.com', role: 'Superadmin (Head Concierge)' },
              { email: 'dominic@zanzirangihouse.com', role: 'Property Director' },
              { email: 'dotto@zanzirangihouse.com', role: 'Guest Operations' },
              { email: 'jocelyn@zanzirangihouse.com', role: 'Hospitality Manager' },
              { email: 'saleh@zanzirangihouse.com', role: 'Operations Lead' },
            ].map((usr) => (
              <div
                key={usr.email}
                className="flex items-center justify-between p-3 rounded-lg bg-[#141413] border border-[#2C2B28]"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-mono text-xs text-[#FAF8F5]">{usr.email}</span>
                </div>
                <span className="text-[11px] font-mono text-[#C4A27A]">{usr.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
