import React, { useState, useEffect } from 'react';
import {
  Search,
  Globe,
  Save,
  Check,
  AlertTriangle,
  RefreshCw,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import { contentApi, SeoConfig } from '../../services/contentApi';

export const AdminSeoManager: React.FC = () => {
  const [seo, setSeo] = useState<SeoConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'success' | 'error'>('saved');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<string>('/');

  const loadSeo = async () => {
    try {
      setIsLoading(true);
      const data = await contentApi.getAdminSeo();
      setSeo(data);
    } catch {
      setStatusMessage('Failed to load SEO configuration.');
      setSaveStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSeo();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!seo) return;
    try {
      setSaveStatus('saving');
      setStatusMessage('Saving SEO metadata...');
      const updated = await contentApi.updateSeo(seo);
      setSeo(updated);
      setSaveStatus('success');
      setStatusMessage('✓ SEO metadata updated successfully.');
      setTimeout(() => {
        setSaveStatus('saved');
        setStatusMessage(null);
      }, 4000);
    } catch (err: any) {
      setSaveStatus('error');
      setStatusMessage(`Error: ${err.message || 'Failed to save SEO'}`);
    }
  };

  if (isLoading || !seo) {
    return (
      <div className="py-24 text-center">
        <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-[#C4A27A]" />
        <p className="font-mono text-xs uppercase tracking-widest text-[#D8CCB8]">Loading SEO...</p>
      </div>
    );
  }

  const currentRouteSeo = seo.routes[selectedRoute] || {
    path: selectedRoute,
    title: '',
    description: '',
    canonical: '',
    robots: 'index, follow',
  };

  const handleUpdateRoute = (field: string, val: string) => {
    setSeo({
      ...seo,
      routes: {
        ...seo.routes,
        [selectedRoute]: {
          ...currentRouteSeo,
          [field]: val,
        },
      },
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#2C2B28] gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#C4A27A]">
              SEARCH VISIBILITY
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-emerald-950/60 border border-emerald-700/60 text-emerald-300">
              LIVE
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#FAF8F5] tracking-wide mt-1">
            SEO & Metadata Manager
          </h1>
          <p className="text-xs text-[#8E8B85] mt-0.5">
            Configure global search defaults, OpenGraph social cards, canonical URLs, and per-page meta tags.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {statusMessage && (
            <div
              className={`text-xs font-mono px-3 py-1.5 rounded-lg flex items-center space-x-2 ${
                saveStatus === 'success'
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                  : 'bg-red-950/60 text-red-300 border border-red-800/60'
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
            <span>Save SEO</span>
          </button>
        </div>
      </div>

      {/* Global Defaults */}
      <div className="bg-[#181716] p-6 rounded-xl border border-[#2C2B28] space-y-4">
        <h3 className="font-serif text-lg text-[#FAF8F5]">Global Site Search Defaults</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
              Global Default Page Title
            </label>
            <input
              type="text"
              value={seo.siteTitle}
              onChange={(e) => setSeo({ ...seo, siteTitle: e.target.value })}
              className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
              Default OpenGraph Social Image URL
            </label>
            <input
              type="text"
              value={seo.defaultOgImage}
              onChange={(e) => setSeo({ ...seo, defaultOgImage: e.target.value })}
              className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Per Route Tabs & Editor */}
      <div className="bg-[#181716] p-6 rounded-xl border border-[#2C2B28] space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#2C2B28]">
          <h3 className="font-serif text-lg text-[#FAF8F5]">Per-Page Organic Meta Tags</h3>
          <span className="text-xs font-mono text-[#C4A27A]">
            Selected: <code className="text-[#FAF8F5]">{selectedRoute}</code>
          </span>
        </div>

        {/* Route Selector Buttons */}
        <div className="flex flex-wrap gap-2">
          {Object.keys(seo.routes).map((path) => (
            <button
              key={path}
              onClick={() => setSelectedRoute(path)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                selectedRoute === path
                  ? 'bg-[#B8966C] text-[#141413] font-bold'
                  : 'bg-[#141413] text-[#D8CCB8] hover:bg-[#22211F] border border-[#2C2B28]'
              }`}
            >
              {path === '/' ? 'Homepage (/)' : path}
            </button>
          ))}
        </div>

        {/* Route Form */}
        <div className="space-y-4 pt-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8]">
                Page Title Tag (&lt;title&gt;)
              </label>
              <span className="text-[10px] font-mono text-[#8E8B85]">
                {currentRouteSeo.title.length} / 65 chars
              </span>
            </div>
            <input
              type="text"
              value={currentRouteSeo.title}
              onChange={(e) => handleUpdateRoute('title', e.target.value)}
              className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8]">
                Meta Description
              </label>
              <span className="text-[10px] font-mono text-[#8E8B85]">
                {currentRouteSeo.description.length} / 160 chars
              </span>
            </div>
            <textarea
              rows={3}
              value={currentRouteSeo.description}
              onChange={(e) => handleUpdateRoute('description', e.target.value)}
              className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs text-[#FAF8F5] focus:border-[#C4A27A] outline-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                Canonical URL
              </label>
              <input
                type="text"
                value={currentRouteSeo.canonical}
                onChange={(e) => handleUpdateRoute('canonical', e.target.value)}
                className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                Robots Indexing Directive
              </label>
              <select
                value={currentRouteSeo.robots}
                onChange={(e) => handleUpdateRoute('robots', e.target.value)}
                className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
              >
                <option value="index, follow">index, follow (Standard Public)</option>
                <option value="noindex, nofollow">noindex, nofollow (Private / Admin)</option>
              </select>
            </div>
          </div>

          {/* Google Search Result Preview Simulation */}
          <div className="pt-3">
            <span className="text-[10px] font-mono tracking-wider text-[#8E8B85] uppercase block mb-2">
              Google SERP Snippet Preview:
            </span>
            <div className="p-4 rounded-xl bg-[#141413] border border-[#2C2B28] max-w-2xl">
              <span className="text-[11px] text-[#8E8B85] block truncate">
                {currentRouteSeo.canonical || 'https://zanzirangihouse.com'}
              </span>
              <h4 className="text-base text-[#8AB4F8] hover:underline cursor-pointer truncate mt-0.5">
                {currentRouteSeo.title || 'Zanzibar Luxury Villa - Zanzirangi House'}
              </h4>
              <p className="text-xs text-[#BDC1C6] line-clamp-2 mt-1 leading-relaxed">
                {currentRouteSeo.description || 'Experience Zanzibar luxury villas with private plunge pools at Zanzirangi House in Kizimkazi.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
