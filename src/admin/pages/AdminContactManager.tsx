import React, { useState, useEffect } from 'react';
import { Phone, Save, Check, AlertTriangle, RefreshCw, Share2, ExternalLink } from 'lucide-react';
import { contentApi, ContactInfoModel } from '../../services/contentApi';

type ContactKey = 'phone' | 'email' | 'whatsappNumber' | 'address' | 'googleMapsUrl';
type SocialKey = 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'whatsapp';

interface ContactForm {
  contact: Record<ContactKey, string>;
  socials: Record<SocialKey, string>;
}

const SOCIAL_FIELDS: { key: SocialKey; label: string; placeholder: string }[] = [
  { key: 'instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/...' },
  { key: 'facebook', label: 'Facebook Page URL', placeholder: 'https://facebook.com/...' },
  { key: 'tiktok', label: 'TikTok Channel URL', placeholder: 'https://tiktok.com/@...' },
  { key: 'youtube', label: 'YouTube Channel URL', placeholder: 'https://youtube.com/@...' },
  { key: 'whatsapp', label: 'WhatsApp Link', placeholder: 'https://wa.me/...' },
];

const inputClass =
  'w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none';

const str = (v: unknown): string => (typeof v === 'string' ? v : '');

const toForm = (data: ContactInfoModel | null | undefined): ContactForm => {
  const contact = (data?.contact || {}) as Record<string, unknown>;
  const socials = (data?.socials || {}) as Record<string, unknown>;
  return {
    contact: {
      phone: str(contact.phone),
      email: str(contact.email),
      whatsappNumber: str(contact.whatsappNumber),
      address: str(contact.address),
      googleMapsUrl: str(contact.googleMapsUrl),
    },
    socials: {
      instagram: str(socials.instagram),
      facebook: str(socials.facebook),
      tiktok: str(socials.tiktok),
      youtube: str(socials.youtube),
      whatsapp: str(socials.whatsapp),
    },
  };
};

export const AdminContactManager: React.FC = () => {
  const [form, setForm] = useState<ContactForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const res = await contentApi.getAdminContactInfo();
      if (!res) throw new Error('The server returned no contact information.');
      setForm(toForm(res));
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to load contact information.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const setContact = (key: ContactKey, value: string) => {
    setForm((prev) => (prev ? { ...prev, contact: { ...prev.contact, [key]: value } } : prev));
    if (saveStatus === 'success') {
      setSaveStatus('idle');
      setStatusMessage(null);
    }
  };

  const setSocial = (key: SocialKey, value: string) => {
    setForm((prev) => (prev ? { ...prev, socials: { ...prev.socials, [key]: value } } : prev));
    if (saveStatus === 'success') {
      setSaveStatus('idle');
      setStatusMessage(null);
    }
  };

  const handleSave = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    if (!form) return;

    // wa.me links need digits only: drop the usual "+", spaces, dashes and brackets.
    const whatsapp = form.contact.whatsappNumber.replace(/[\s+\-()]/g, '');
    if (whatsapp && !/^\d{6,15}$/.test(whatsapp)) {
      setSaveStatus('error');
      setStatusMessage('WhatsApp number must contain digits only (country code first, no + or spaces).');
      return;
    }

    try {
      setSaveStatus('saving');
      setStatusMessage('Saving contact details...');
      const payload: ContactInfoModel = {
        contact: {
          phone: form.contact.phone.trim(),
          email: form.contact.email.trim(),
          whatsappNumber: whatsapp,
          address: form.contact.address.trim(),
          googleMapsUrl: form.contact.googleMapsUrl.trim(),
        },
        socials: {
          instagram: form.socials.instagram.trim(),
          facebook: form.socials.facebook.trim(),
          tiktok: form.socials.tiktok.trim(),
          youtube: form.socials.youtube.trim(),
          whatsapp: form.socials.whatsapp.trim(),
        },
      };
      const updated = await contentApi.updateContactInfo(payload);
      if (updated && updated.contact) setForm(toForm(updated));
      setSaveStatus('success');
      setStatusMessage('Contact details saved. The website now shows these values.');
    } catch (err: any) {
      setSaveStatus('error');
      setStatusMessage(err?.message || 'Failed to save contact details.');
    }
  };

  if (isLoading && !form) {
    return (
      <div className="py-24 text-center">
        <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-adm-accent" />
        <p className="font-mono text-xs uppercase tracking-widest text-adm-text-2">Loading Contacts...</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="max-w-4xl mx-auto p-6 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs font-mono space-y-3">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{loadError || 'Contact information could not be loaded.'}</span>
        </div>
        <button
          type="button"
          onClick={loadData}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-adm-raised border border-adm-line-strong text-adm-text hover:bg-adm-line cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const mapsUrl = form.contact.googleMapsUrl.trim();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-adm-line gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-adm-accent">
            COMMUNICATION & CONTACT CHANNELS
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-adm-text tracking-wide mt-1">Contact & WhatsApp</h1>
          <p className="text-xs text-adm-muted mt-0.5">
            Set the reservation phone number, WhatsApp hotline, concierge email, address, Google Maps link and social
            profiles.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-adm-accent-fill hover:bg-adm-accent-hover text-adm-on-accent text-xs font-mono uppercase tracking-widest font-bold shadow-lg transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          {saveStatus === 'saving' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {statusMessage && saveStatus !== 'idle' && (
        <div
          className={`p-3.5 rounded-lg text-xs font-mono flex items-center space-x-2 ${
            saveStatus === 'success'
              ? 'bg-emerald-950/40 text-emerald-200 border border-emerald-800/60'
              : saveStatus === 'error'
              ? 'bg-red-950/40 text-red-200 border border-red-800/60'
              : 'bg-adm-raised text-adm-text-2 border border-adm-line'
          }`}
        >
          {saveStatus === 'success' && <Check className="w-4 h-4 shrink-0 text-emerald-400" />}
          {saveStatus === 'error' && <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />}
          {saveStatus === 'saving' && <RefreshCw className="w-4 h-4 shrink-0 animate-spin text-adm-accent" />}
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Visual Guide Banner for Layperson Admins */}
      <div className="p-4 rounded-xl bg-adm-surface border border-adm-accent/30 flex items-start space-x-3 text-xs">
        <Phone className="w-5 h-5 text-adm-accent shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-adm-text block mb-0.5">📍 Where this appears on the website:</span>
          <p className="text-adm-muted leading-relaxed">
            These details feed the <strong>floating WhatsApp button</strong>, the <strong>footer</strong> contact
            column and social icons, and the <strong>/contact page</strong>. Edit the fields below, then click{' '}
            <em>Save Changes</em>.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Direct Channels */}
        <div className="bg-adm-panel p-6 rounded-xl border border-adm-line space-y-4">
          <div className="border-b border-adm-line pb-3">
            <h3 className="font-serif text-lg text-adm-text">1. Phone, Email & Location</h3>
            <p className="text-xs text-adm-muted mt-0.5">How prospective guests reach you and find the property.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                Reservation Phone Number
              </label>
              <input
                type="text"
                value={form.contact.phone}
                onChange={(e) => setContact('phone', e.target.value)}
                className={inputClass}
              />
              <span className="text-[10px] text-adm-faint block mt-1">Shown in the footer and on the contact page.</span>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                Concierge Email
              </label>
              <input
                type="email"
                value={form.contact.email}
                onChange={(e) => setContact('email', e.target.value)}
                className={inputClass}
              />
              <span className="text-[10px] text-adm-faint block mt-1">Shown in the footer and on the contact page.</span>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                WhatsApp Number (country code, no + sign)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={form.contact.whatsappNumber}
                onChange={(e) => setContact('whatsappNumber', e.target.value)}
                className={inputClass}
              />
              <span className="text-[10px] text-adm-accent block mt-1">Digits only, e.g. 255777890123.</span>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                Google Maps Link
              </label>
              <input
                type="text"
                value={form.contact.googleMapsUrl}
                onChange={(e) => setContact('googleMapsUrl', e.target.value)}
                className={inputClass}
              />
              <span className="text-[10px] text-adm-faint flex items-center mt-1 space-x-1">
                <span>Opened when guests click the address.</span>
                {mapsUrl && /^https?:\/\//i.test(mapsUrl) && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-0.5 text-adm-accent hover:underline"
                  >
                    <span>Test link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </span>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                Property Address
              </label>
              <input
                type="text"
                value={form.contact.address}
                onChange={(e) => setContact('address', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Social Media Channels */}
        <div className="bg-adm-panel p-6 rounded-xl border border-adm-line space-y-4">
          <div className="border-b border-adm-line pb-3 flex items-center space-x-2">
            <Share2 className="w-4 h-4 text-adm-accent" />
            <h3 className="font-serif text-lg text-adm-text">2. Social Media Profiles</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                  {label}
                </label>
                <input
                  type="text"
                  value={form.socials[key]}
                  onChange={(e) => setSocial(key, e.target.value)}
                  placeholder={placeholder}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};
