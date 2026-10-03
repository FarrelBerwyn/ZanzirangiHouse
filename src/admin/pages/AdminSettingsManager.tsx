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
  Camera,
  Upload,
  Bell,
  ArrowRight,
  Globe,
  Layout,
  Layers,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { contentApi, SettingsModel } from '../../services/contentApi';
import { DEFAULT_SETTINGS } from '../../data/seedDefaults';
import { ImageCropperModal } from '../components/ImageCropperModal';
import { AdminImageInput } from '../components/AdminImageInput';
import { updateDynamicFavicon } from '../../utils/faviconHelper';

interface AdminSettingsManagerProps {
  onNavigateToTab?: (tab: string) => void;
}

export const AdminSettingsManager: React.FC<AdminSettingsManagerProps> = ({ onNavigateToTab }) => {
  const [settings, setSettings] = useState<SettingsModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'success' | 'error'>('saved');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [selectedCropFile, setSelectedCropFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

      // Dispatch global event for real-time frontend updates (Navbar, Favicon, Chat, AdminLayout)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('zanzirangi-settings-updated', {
            detail: updated,
          })
        );
        if (updated.favicon) {
          updateDynamicFavicon(updated.favicon);
        }
      }

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
        <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-adm-accent" />
        <p className="font-mono text-xs uppercase tracking-widest text-adm-text-2">Loading Settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-adm-line gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-adm-accent">
              SYSTEM PREFERENCES
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-emerald-950/60 border border-emerald-700/60 text-emerald-300">
              LIVE
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-adm-text tracking-wide mt-1">
            Sanctuary & System Settings
          </h1>
          <p className="text-xs text-adm-muted mt-0.5">
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
                  : 'bg-adm-raised text-adm-text-2 border border-adm-line'
              }`}
            >
              {saveStatus === 'success' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              {saveStatus === 'error' && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
              {saveStatus === 'saving' && <RefreshCw className="w-3.5 h-3.5 animate-spin text-adm-accent" />}
              <span>{statusMessage}</span>
            </div>
          )}

          <button
            onClick={() => handleSave()}
            disabled={saveStatus === 'saving'}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-adm-accent-fill hover:bg-adm-accent-hover text-adm-on-accent text-xs font-mono uppercase tracking-widest font-bold shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Support Notifications & Staff Duty Link */}
        <div className="bg-adm-surface border border-adm-line rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-adm-accent/20 text-adm-accent shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-adm-text">Staff Notifications & Duty Status</h3>
              <p className="text-[11px] text-adm-muted mt-0.5">
                Configure 4-tier notification escalation, mobile push alerts, and On-Duty staff availability.
              </p>
            </div>
          </div>
          {onNavigateToTab && (
            <button
              type="button"
              onClick={() => onNavigateToTab('notifications')}
              className="px-4 py-2 rounded-lg bg-adm-raised hover:bg-adm-card border border-adm-line text-xs font-mono text-adm-text flex items-center space-x-2 transition-all cursor-pointer shrink-0"
            >
              <span>Manage Notifications</span>
              <ArrowRight className="w-3.5 h-3.5 text-adm-accent" />
            </button>
          )}
        </div>

        {/* Sanctuary Branding */}
        <div className="bg-adm-panel p-6 rounded-xl border border-adm-line space-y-4">
          <h3 className="font-serif text-lg text-adm-text">Sanctuary Identity & Localization</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                Property Brand Name
              </label>
              <input
                type="text"
                value={settings.siteName || ''}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                Official Brand Tagline
              </label>
              <input
                type="text"
                value={settings.tagline || ''}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                Display Currency
              </label>
              <input
                type="text"
                value={settings.defaultCurrency || ''}
                onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                Default Language
              </label>
              <input
                type="text"
                value={settings.defaultLanguage || 'en'}
                onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
                className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MULTI-CONTEXT LOGO & BRANDING SUITE                                      */}
        {/* ========================================================================= */}
        <div className="bg-adm-panel p-6 rounded-xl border border-adm-line space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-adm-line pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-adm-accent">
                  BRAND ASSETS
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-adm-accent/20 text-adm-accent font-semibold">
                  Multi-Context
                </span>
              </div>
              <h3 className="font-serif text-lg text-adm-text mt-0.5">
                Property Logo & Visual Identity by Context
              </h3>
              <p className="text-xs text-adm-muted mt-0.5">
                Manage and upload logo files independently for each context (Home Navigation Bar, Browser Tabbar / Favicon, and Admin Dashboard).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CONTEXT 1: Home & Main Navigation Header Logo */}
            <div className="bg-adm-bg p-5 rounded-xl border border-adm-line space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-adm-surface border border-adm-line text-adm-accent">
                    <Layout className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-adm-text font-mono uppercase tracking-wider">
                      Home & Header Navbar Logo
                    </h4>
                    <span className="text-[10px] text-adm-muted font-sans block">
                      Displayed on the main website navigation bar (Home & all public pages)
                    </span>
                  </div>
                </div>

                {/* Live Preview Simulation (Navbar Header mockup) */}
                <div className="p-3 rounded-lg bg-black/95 border border-[#C4A27A]/30 flex items-center justify-between shadow-inner">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={settings.logo || '/src/assets/zanzirangi-logo-new.jpeg'}
                      alt="Navbar Preview"
                      className="w-8 h-8 rounded-full object-cover border border-[#C4A27A]/60 shadow"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/zanzirangi-logo-circle.png';
                      }}
                    />
                    <div className="flex flex-col leading-tight">
                      <span className="font-serif text-xs uppercase text-[#FAF8F5] tracking-widest font-medium">
                        ZANZIRANGI
                      </span>
                      <span className="font-serif text-[9px] uppercase text-[#C4A27A] tracking-[0.25em]">
                        HOUSE
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono uppercase text-[#C4A27A] px-2 py-0.5 rounded bg-[#C4A27A]/10 border border-[#C4A27A]/30">
                    Navbar Preview
                  </span>
                </div>

                <AdminImageInput
                  value={settings.logo || ''}
                  onChange={(url) => setSettings({ ...settings, logo: url })}
                  label="Upload Home & Header Logo"
                  hint="Upload photo or logo file from your device (transparent PNG recommended) or enter an image URL."
                  placeholder="/src/assets/zanzirangi-logo-new.jpeg or /uploads/..."
                  previewHeight="h-32"
                  presets={[
                    { label: 'Default Badge (Square)', url: '/src/assets/zanzirangi-logo-new.jpeg' },
                    { label: 'Circle Gold Emblem', url: '/zanzirangi-logo-circle.png' },
                    { label: 'Official Lettermark', url: '/zanzirangi-house-logo.jpg' },
                  ]}
                />
              </div>
            </div>

            {/* CONTEXT 2: Browser Tabbar & Favicon Logo */}
            <div className="bg-adm-bg p-5 rounded-xl border border-adm-line space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-adm-surface border border-adm-line text-emerald-400">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-adm-text font-mono uppercase tracking-wider">
                      Browser Tabbar & Favicon Logo
                    </h4>
                    <span className="text-[10px] text-adm-muted font-sans block">
                      Displayed on visitor browser tabs, bookmark bars, and mobile shortcuts
                    </span>
                  </div>
                </div>

                {/* Live Preview Simulation (Browser Tab mockup) */}
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-adm-line flex items-center space-x-2 shadow-inner">
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-zinc-800 rounded-t-lg border border-b-0 border-zinc-700 max-w-[240px] truncate shadow">
                    <img
                      src={settings.favicon || '/favicon.svg'}
                      alt="Tabbar Favicon Preview"
                      className="w-4 h-4 rounded-sm object-contain shrink-0"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/zanzirangi-logo-circle.png';
                      }}
                    />
                    <span className="text-[11px] font-sans text-zinc-200 truncate">
                      {settings.siteName || 'Zanzirangi House'} | Sanctuary
                    </span>
                  </div>
                  <span className="text-[9px] font-mono uppercase text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 ml-auto">
                    Tabbar Preview
                  </span>
                </div>

                <AdminImageInput
                  value={settings.favicon || ''}
                  onChange={(url) => setSettings({ ...settings, favicon: url })}
                  label="Upload Tabbar Logo (Favicon)"
                  hint="Upload a favicon icon (SVG, PNG 32x32, or 48x48) for browser tabs."
                  placeholder="/favicon.svg or /favicon-32x32.png"
                  previewHeight="h-32"
                  presets={[
                    { label: 'Default SVG Favicon', url: '/favicon.svg' },
                    { label: 'PNG 32x32 Favicon', url: '/favicon-32x32.png' },
                    { label: 'Circle Gold Emblem', url: '/zanzirangi-logo-circle.png' },
                  ]}
                />
              </div>
            </div>

            {/* CONTEXT 3: Admin Dashboard & Login Logo */}
            <div className="bg-adm-bg p-5 rounded-xl border border-adm-line space-y-4 flex flex-col justify-between sm:col-span-2">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-adm-surface border border-adm-line text-amber-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-adm-text font-mono uppercase tracking-wider">
                      Admin Dashboard & Login Logo
                    </h4>
                    <span className="text-[10px] text-adm-muted font-sans block">
                      Displayed in the top-left corner of the Admin Dashboard and Admin Login screen
                    </span>
                  </div>
                </div>

                {/* Live Preview Simulation (Admin Sidebar Header mockup) */}
                <div className="p-3 rounded-lg bg-adm-panel border border-adm-line flex items-center justify-between shadow-inner">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={settings.adminLogo || settings.logo || '/src/assets/zanzirangi-logo-new.jpeg'}
                      alt="Admin Logo Preview"
                      className="w-9 h-9 rounded-xl object-cover border border-adm-accent/40 shadow-sm"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/zanzirangi-logo-circle.png';
                      }}
                    />
                    <div>
                      <span className="text-sm font-medium uppercase tracking-wider text-adm-text block leading-none">
                        Zanzirangi House
                      </span>
                      <span className="text-[9px] font-semibold tracking-[0.2em] text-adm-accent uppercase block mt-0.5">
                        Admin Panel
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono uppercase text-amber-400 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/40">
                    Admin Header Preview
                  </span>
                </div>

                <AdminImageInput
                  value={settings.adminLogo || ''}
                  onChange={(url) => setSettings({ ...settings, adminLogo: url })}
                  label="Upload Admin Dashboard Logo"
                  hint="Leave empty to automatically match the Home & Header logo."
                  placeholder="Leave empty to use Home logo, or enter URL / upload new..."
                  previewHeight="h-32"
                  presets={[
                    { label: 'Default Badge (Square)', url: '/src/assets/zanzirangi-logo-new.jpeg' },
                    { label: 'Circle Gold Emblem', url: '/zanzirangi-logo-circle.png' },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Centralized Contact & Booking */}
        <div className="bg-adm-panel p-6 rounded-xl border border-adm-line space-y-4">
          <h3 className="font-serif text-lg text-adm-text">Authoritative Contact & Reservations</h3>
          <p className="text-xs text-adm-muted">
            Single authoritative source used across Header, Footer, Contact, WhatsApp CTA, and Reservation section.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                Concierge Phone
              </label>
              <input
                type="text"
                value={settings.conciergePhone || settings.phone || ''}
                onChange={(e) =>
                  setSettings({ ...settings, conciergePhone: e.target.value, phone: e.target.value })
                }
                className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                WhatsApp Hotline
              </label>
              <input
                type="text"
                value={settings.whatsapp || ''}
                onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                Public Inquiries Email
              </label>
              <input
                type="email"
                value={settings.email || ''}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                Reservation Alerts Email
              </label>
              <input
                type="email"
                value={settings.reservationNotificationEmail || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    reservationNotificationEmail: e.target.value,
                    reservationEmail: e.target.value,
                  })
                }
                className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                Physical Property Address
              </label>
              <input
                type="text"
                value={settings.address || ''}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                Direct Booking URL
              </label>
              <input
                type="text"
                value={settings.bookingUrl || ''}
                onChange={(e) => setSettings({ ...settings, bookingUrl: e.target.value })}
                className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                Instagram Profile Link
              </label>
              <input
                type="text"
                value={settings.instagram || ''}
                onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Customer Support Avatar & Concierge Profile */}
        <div className="bg-adm-panel p-6 rounded-xl border border-adm-line space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg text-adm-text">Customer Support & Concierge Avatar</h3>
              <p className="text-xs text-adm-muted mt-0.5">
                Avatar image and details displayed on the floating customer support widget on the website.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-700/60 text-emerald-300">
              LIVE WIDGET
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
            <div className="md:col-span-4 flex flex-col items-center p-4 bg-adm-bg rounded-xl border border-adm-line space-y-3 text-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-[#B8966C] via-[#C4A27A] to-[#FAF8F5] shadow-xl">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#141413]">
                    <img
                      src={
                        settings.supportAvatar ||
                        settings.logo ||
                        DEFAULT_SETTINGS.supportAvatar ||
                        '/zanzirangi-logo-circle.png'
                      }
                      alt={settings.supportName || 'Customer Support'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = settings.logo || '/zanzirangi-logo-circle.png';
                      }}
                    />
                  </div>
                </div>
                <span className="absolute top-0 right-0 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#141413] shadow-[0_0_6px_#10b981]" />
                </span>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/png,image/jpeg,image/webp,image/avif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedCropFile(file);
                    setIsCropperOpen(true);
                  }
                  e.target.value = '';
                }}
              />

              <div className="w-full space-y-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-3 bg-adm-accent-fill hover:bg-adm-accent-hover text-adm-on-accent text-xs font-mono font-bold uppercase tracking-wider rounded-lg shadow flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const currentLogo = settings.logo || '/zanzirangi-logo-circle.png';
                    setSettings({ ...settings, supportAvatar: currentLogo });
                    setStatusMessage('Avatar set to current property logo. Click Save Changes to commit.');
                    setSaveStatus('saved');
                  }}
                  className="w-full py-1.5 px-3 bg-adm-surface hover:bg-adm-panel border border-adm-line hover:border-adm-accent/60 text-adm-text text-[11px] font-mono uppercase tracking-wider rounded-lg shadow-sm flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                  title="Apply current property logo as the customer support avatar"
                >
                  <Sparkles className="w-3.5 h-3.5 text-adm-accent" />
                  <span>Use Property Logo</span>
                </button>
              </div>
            </div>

            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                  Support / Concierge Name
                </label>
                <input
                  type="text"
                  value={settings.supportName || ''}
                  onChange={(e) => setSettings({ ...settings, supportName: e.target.value })}
                  placeholder="e.g. Juma"
                  className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                  Widget Badge Title
                </label>
                <input
                  type="text"
                  value={settings.supportTitle || ''}
                  onChange={(e) => setSettings({ ...settings, supportTitle: e.target.value })}
                  placeholder="e.g. Customer Support"
                  className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                  Online Status Line
                </label>
                <input
                  type="text"
                  value={settings.supportStatus || ''}
                  onChange={(e) => setSettings({ ...settings, supportStatus: e.target.value })}
                  placeholder="e.g. Active 24/7 or Online • Juma"
                  className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Database & Infrastructure Health */}
        <div className="bg-adm-panel p-6 rounded-xl border border-adm-line space-y-4">
          <h3 className="font-serif text-lg text-adm-text">Engine & Storage Architecture</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-lg bg-adm-bg border border-adm-line space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-adm-muted block">
                Database Store
              </span>
              <p className="font-mono text-xs text-adm-text">Cloud MySQL Engine</p>
              <p className="text-[10px] font-mono text-adm-accent">u170555096_Zanzirangi</p>
            </div>

            <div className="p-4 rounded-lg bg-adm-bg border border-adm-line space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-adm-muted block">
                Session Security
              </span>
              <p className="font-mono text-xs text-adm-text">JWT 7-Day Secret</p>
              <p className="text-[10px] font-mono text-emerald-400">bcrypt 10-rounds</p>
            </div>

            <div className="p-4 rounded-lg bg-adm-bg border border-adm-line space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-adm-muted block">
                Cloud Deployment
              </span>
              <p className="font-mono text-xs text-adm-text">Self-Contained Express</p>
              <p className="text-[10px] font-mono text-emerald-400">No Git Re-build Needed</p>
            </div>
          </div>
        </div>

        {/* Authorized Admin Mailboxes */}
        <div className="bg-adm-panel p-6 rounded-xl border border-adm-line space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-adm-line">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-adm-accent" />
              <h3 className="font-serif text-lg text-adm-text">Authorized Administrative Mailboxes</h3>
            </div>
            {onNavigateToTab && (
              <button
                type="button"
                onClick={() => onNavigateToTab('admin-access')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-adm-accent-fill hover:bg-adm-accent-hover text-adm-on-accent text-xs font-mono font-bold uppercase transition-colors"
              >
                <span>Manage Admin Access & Roles</span>
              </button>
            )}
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
                className="flex items-center justify-between p-3 rounded-lg bg-adm-bg border border-adm-line"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-mono text-xs text-adm-text">{usr.email}</span>
                </div>
                <span className="text-[11px] font-mono text-adm-accent">{usr.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ImageCropperModal
        isOpen={isCropperOpen}
        onClose={() => setIsCropperOpen(false)}
        imageFile={selectedCropFile}
        initialImageUrl={settings.supportAvatar || settings.logo || '/zanzirangi-logo-circle.png'}
        supportName={settings.supportName || 'Elena'}
        supportTitle={settings.supportTitle || 'Customer Support'}
        supportStatus={settings.supportStatus || 'Active 24/7'}
        onCroppedAndUploaded={(url) => {
          setSettings({ ...settings, supportAvatar: url });
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('zanzirangi-support-profile-updated', {
                detail: {
                  supportAvatar: url,
                  supportName: settings.supportName,
                  supportTitle: settings.supportTitle,
                  supportStatus: settings.supportStatus,
                },
              })
            );
          }
        }}
      />
    </div>
  );
};
