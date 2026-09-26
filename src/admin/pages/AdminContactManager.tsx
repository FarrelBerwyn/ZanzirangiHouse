import React, { useState, useEffect } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Save,
  Check,
  AlertTriangle,
  RefreshCw,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { contentApi, HomepageContent, FALLBACK_HOMEPAGE_CONTENT } from '../../services/contentApi';

export const AdminContactManager: React.FC = () => {
  const [data, setData] = useState<HomepageContent>(FALLBACK_HOMEPAGE_CONTENT);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'success' | 'error'>('saved');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await contentApi.getAdminHomepage();
      setData(res);
    } catch {
      setStatusMessage('Failed to load contact information.');
      setSaveStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaveStatus('saving');
      setStatusMessage('Saving contacts & concierge channels...');
      const updated = await contentApi.updateHomepage(data);
      setData(updated);
      setSaveStatus('success');
      setStatusMessage('✓ Contacts & concierge details updated successfully.');
      setTimeout(() => {
        setSaveStatus('saved');
        setStatusMessage(null);
      }, 4000);
    } catch (err: any) {
      setSaveStatus('error');
      setStatusMessage(`Error: ${err.message || 'Failed to save'}`);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-[#C4A27A]" />
        <p className="font-mono text-xs uppercase tracking-widest text-[#D8CCB8]">Loading Contacts...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#2C2B28] gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#C4A27A]">
              COMMUNICATION CHANNELS
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-emerald-950/60 border border-emerald-700/60 text-emerald-300">
              LIVE
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#FAF8F5] tracking-wide mt-1">
            Contact & Concierge Channels
          </h1>
          <p className="text-xs text-[#8E8B85] mt-0.5">
            Manage telephone lines, 24/7 concierge WhatsApp, reservation email, and location maps.
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
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-[#B8966C] hover:bg-[#C4A27A] text-[#141413] text-xs font-mono uppercase tracking-widest font-bold shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Save Contacts</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Direct Channels */}
        <div className="bg-[#181716] p-6 rounded-xl border border-[#2C2B28] space-y-4">
          <h3 className="font-serif text-lg text-[#FAF8F5]">Concierge & Direct Lines</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                Direct Telephone
              </label>
              <input
                type="text"
                value={data.contact.phone}
                onChange={(e) =>
                  setData({ ...data, contact: { ...data.contact, phone: e.target.value } })
                }
                className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                Concierge Email
              </label>
              <input
                type="email"
                value={data.contact.email}
                onChange={(e) =>
                  setData({ ...data, contact: { ...data.contact, email: e.target.value } })
                }
                className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                WhatsApp Hotline (International without +)
              </label>
              <input
                type="text"
                value={data.contact.whatsappNumber}
                onChange={(e) =>
                  setData({ ...data, contact: { ...data.contact, whatsappNumber: e.target.value } })
                }
                className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                Google Maps Embed / Navigation URL
              </label>
              <input
                type="text"
                value={data.contact.googleMapsUrl || ''}
                onChange={(e) =>
                  setData({ ...data, contact: { ...data.contact, googleMapsUrl: e.target.value } })
                }
                className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                Physical Property Address
              </label>
              <input
                type="text"
                value={data.contact.address}
                onChange={(e) =>
                  setData({ ...data, contact: { ...data.contact, address: e.target.value } })
                }
                className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Social Media Channels */}
        <div className="bg-[#181716] p-6 rounded-xl border border-[#2C2B28] space-y-4">
          <h3 className="font-serif text-lg text-[#FAF8F5]">Social Media Profiles</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                Instagram URL
              </label>
              <input
                type="text"
                value={data.socials?.instagram || ''}
                onChange={(e) =>
                  setData({
                    ...data,
                    socials: { ...(data.socials as any), instagram: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                Facebook Page URL
              </label>
              <input
                type="text"
                value={data.socials?.facebook || ''}
                onChange={(e) =>
                  setData({
                    ...data,
                    socials: { ...(data.socials as any), facebook: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                TikTok Channel URL
              </label>
              <input
                type="text"
                value={data.socials?.tiktok || ''}
                onChange={(e) =>
                  setData({
                    ...data,
                    socials: { ...(data.socials as any), tiktok: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                YouTube Channel URL
              </label>
              <input
                type="text"
                value={data.socials?.youtube || ''}
                onChange={(e) =>
                  setData({
                    ...data,
                    socials: { ...(data.socials as any), youtube: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
