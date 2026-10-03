import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Quote,
  Layers,
} from 'lucide-react';
import { contentApi, WhyStayConfigModel, WhyStayPillar } from '../../services/contentApi';
import { AdminImageInput } from '../components/AdminImageInput';

const inputClass =
  'w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs text-adm-text focus:border-adm-accent outline-none';
const pillarInputClass =
  'w-full px-2.5 py-1.5 bg-adm-surface border border-adm-line rounded text-xs text-adm-text focus:border-adm-accent outline-none';

const padNumber = (n: number) => String(n).padStart(2, '0');

/** Normalise pillars coming from the API: every field present, sorted by order. */
const normalisePillars = (pillars: unknown): WhyStayPillar[] => {
  if (!Array.isArray(pillars)) return [];
  return pillars
    .filter((p) => p && typeof p === 'object')
    .map((p: any, idx) => ({
      id: typeof p.id === 'string' && p.id ? p.id : `pillar-custom-${idx + 1}`,
      number: typeof p.number === 'string' ? p.number : padNumber(idx + 1),
      title: typeof p.title === 'string' ? p.title : '',
      tagline: typeof p.tagline === 'string' ? p.tagline : '',
      description: typeof p.description === 'string' ? p.description : '',
      image: typeof p.image === 'string' ? p.image : '',
      order: typeof p.order === 'number' ? p.order : idx + 1,
      visible: p.visible !== false,
    }))
    .sort((a, b) => a.order - b.order);
};

/** Re-assign order 1..n; numbers that still follow the automatic 01, 02... pattern are renumbered too. */
const reindex = (pillars: WhyStayPillar[], previous: WhyStayPillar[]): WhyStayPillar[] => {
  const autoNumbered = previous.every((p, i) => p.number === padNumber(i + 1) || !p.number);
  return pillars.map((p, idx) => ({
    ...p,
    order: idx + 1,
    number: autoNumbered ? padNumber(idx + 1) : p.number,
  }));
};

export const AdminWhyStayManager: React.FC = () => {
  const [config, setConfig] = useState<WhyStayConfigModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const applyServerData = (data: WhyStayConfigModel) => {
    setConfig({ ...data, pillars: normalisePillars(data.pillars) });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const data = await contentApi.getAdminWhyStay();
      if (!data) throw new Error('The server returned no Why Stay configuration.');
      applyServerData(data);
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to load the Why Stay configuration.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const update = (changes: Partial<WhyStayConfigModel>) => {
    setConfig((prev) => (prev ? { ...prev, ...changes } : prev));
    setSuccess(null);
  };

  const handleSave = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    if (!config) return;
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const pillars = config.pillars.map((p, idx) => ({ ...p, order: idx + 1 }));
      const updated = await contentApi.updateAdminWhyStay({
        eyebrow: config.eyebrow || '',
        heading: config.heading || '',
        subhead: config.subhead || '',
        pillars,
        visible: config.visible !== false,
      });
      if (updated) applyServerData(updated);
      setSuccess('Why Stay section saved. The website now shows these values.');
    } catch (err: any) {
      setError(err?.message || 'Failed to save the Why Stay configuration.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPillar = () => {
    if (!config) return;
    const nextIndex = config.pillars.length + 1;
    const newPillar: WhyStayPillar = {
      id: `pillar-custom-${Date.now().toString(36)}`,
      number: padNumber(nextIndex),
      title: '',
      tagline: '',
      description: '',
      image: '',
      order: nextIndex,
      visible: true,
    };
    update({ pillars: [...config.pillars, newPillar] });
  };

  const handleUpdatePillar = (index: number, changes: Partial<WhyStayPillar>) => {
    if (!config) return;
    const pillars = config.pillars.map((p, i) => (i === index ? { ...p, ...changes } : p));
    update({ pillars });
  };

  const handleRemovePillar = (index: number) => {
    if (!config) return;
    const name = config.pillars[index]?.title || `pillar ${index + 1}`;
    if (!window.confirm(`Remove "${name}"? It is deleted from the website when you save.`)) return;
    const filtered = config.pillars.filter((_, i) => i !== index);
    update({ pillars: reindex(filtered, config.pillars) });
  };

  const handleMovePillar = (index: number, direction: 'up' | 'down') => {
    if (!config) return;
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= config.pillars.length) return;
    const moved = [...config.pillars];
    [moved[index], moved[target]] = [moved[target], moved[index]];
    update({ pillars: reindex(moved, config.pillars) });
  };

  if (loading && !config) {
    return (
      <div className="p-12 text-center text-adm-muted font-mono text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-adm-accent" />
        Loading Why Stay settings...
      </div>
    );
  }

  if (!config) {
    return (
      <div className="p-6 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs font-mono space-y-3">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{loadError || 'The Why Stay configuration could not be loaded.'}</span>
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

  const sectionVisible = config.visible !== false;
  const visibleCount = config.pillars.filter((p) => p.visible !== false).length;

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-adm-line pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono tracking-widest uppercase text-adm-accent mb-1">
            <Sparkles className="w-4 h-4" />
            <span>SANCTUARY PHILOSOPHY & STRENGTHS</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-adm-text">Why Stay: Pillars</h1>
          <p className="text-xs sm:text-sm text-adm-muted mt-1">
            Manage the pillars that explain why guests choose to stay at Zanzirangi House.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => update({ visible: !sectionVisible })}
            className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-mono border transition-colors cursor-pointer ${
              sectionVisible
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                : 'bg-zinc-900 text-zinc-500 border-zinc-800'
            }`}
            title="Show or hide the whole Why Stay section on the website"
          >
            {sectionVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{sectionVisible ? 'Section Visible' : 'Section Hidden'}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center space-x-2 px-5 py-2 rounded-lg bg-adm-accent-fill hover:bg-adm-accent-hover text-adm-on-accent text-xs font-mono font-bold uppercase transition-colors shadow-md cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Visual Guide Banner for Layperson Admins */}
      <div className="p-4 rounded-xl bg-adm-surface border border-adm-accent/30 flex items-start space-x-3 text-xs">
        <Sparkles className="w-5 h-5 text-adm-accent shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-adm-text block mb-0.5">📍 Where this appears on the website:</span>
          <p className="text-adm-muted leading-relaxed">
            The <strong>"Why Zanzirangi House"</strong> section with the numbered photo cards. Only visible pillars
            are shown, in the order listed here. While a text is still the original default, visitors see the
            built-in translation for their language; edited text is shown as written (translate it in Admin →
            Translations). If you delete every pillar, the website falls back to the four built-in pillars.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-800/60 text-red-200 text-xs font-mono flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 text-xs font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section Header Configuration */}
        <div className="p-5 rounded-xl bg-adm-panel border border-adm-line space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono uppercase text-adm-accent border-b border-adm-line pb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>01 — Section Header</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-adm-text-2 uppercase mb-1">Eyebrow Label</label>
              <input
                type="text"
                value={config.eyebrow || ''}
                onChange={(e) => update({ eyebrow: e.target.value })}
                className={inputClass}
              />
              <span className="text-[10px] text-adm-faint block mt-1">Small label above the heading.</span>
            </div>

            <div>
              <label className="block text-xs font-mono text-adm-text-2 uppercase mb-1">Section Heading</label>
              <input
                type="text"
                value={config.heading || ''}
                onChange={(e) => update({ heading: e.target.value })}
                className={`${inputClass} font-serif`}
              />
              <span className="text-[10px] text-adm-faint block mt-1">The large heading guests see.</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-adm-text-2 uppercase mb-1">Intro Text</label>
            <textarea
              rows={2}
              value={config.subhead || ''}
              onChange={(e) => update({ subhead: e.target.value })}
              className={inputClass}
            />
            <span className="text-[10px] text-adm-faint block mt-1">Paragraph below the heading.</span>
          </div>
        </div>

        {/* Pillars Collection */}
        <div className="p-5 rounded-xl bg-adm-panel border border-adm-line space-y-4">
          <div className="flex items-center justify-between border-b border-adm-line pb-3">
            <div className="flex items-center space-x-2 text-xs font-mono uppercase text-adm-accent">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                02 — Pillars ({config.pillars.length} total, {visibleCount} visible)
              </span>
            </div>
            <button
              type="button"
              onClick={handleAddPillar}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-adm-raised hover:bg-adm-line border border-adm-line-strong text-xs font-mono text-adm-accent cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Pillar</span>
            </button>
          </div>

          {config.pillars.length === 0 && (
            <div className="p-4 rounded-lg bg-adm-bg border border-dashed border-adm-line text-xs text-adm-muted">
              No pillars saved yet. The website currently shows the four built-in pillars. Click <em>Add Pillar</em>{' '}
              to create your own.
            </div>
          )}

          <div className="space-y-4">
            {config.pillars.map((pillar, idx) => {
              const visible = pillar.visible !== false;
              return (
                <div
                  key={pillar.id}
                  className={`p-4 rounded-xl bg-adm-bg border border-adm-line space-y-3 relative hover:border-adm-line-strong transition-colors ${
                    visible ? '' : 'opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-adm-raised pb-2.5">
                    <div className="flex items-center space-x-3 min-w-0">
                      <span className="w-7 h-7 rounded-md bg-adm-accent/20 border border-adm-accent/40 text-adm-accent font-mono text-xs font-bold flex items-center justify-center shrink-0">
                        {pillar.number || padNumber(idx + 1)}
                      </span>
                      <span className="font-serif text-sm text-adm-text tracking-wide truncate">
                        {pillar.title || 'Untitled pillar'}
                      </span>
                      {!visible && (
                        <span className="text-[10px] font-mono uppercase text-zinc-500">Hidden</span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMovePillar(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded bg-adm-surface border border-adm-line text-adm-muted hover:text-adm-text disabled:opacity-30 cursor-pointer"
                        title="Move up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMovePillar(idx, 'down')}
                        disabled={idx === config.pillars.length - 1}
                        className="p-1 rounded bg-adm-surface border border-adm-line text-adm-muted hover:text-adm-text disabled:opacity-30 cursor-pointer"
                        title="Move down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdatePillar(idx, { visible: !visible })}
                        className={`p-1 rounded border text-xs cursor-pointer ${
                          visible
                            ? 'bg-emerald-950/30 text-emerald-300 border-emerald-800/50'
                            : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                        }`}
                        title={visible ? 'Visible — click to hide' : 'Hidden — click to show'}
                      >
                        {visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemovePillar(idx)}
                        className="p-1 rounded bg-red-950/30 border border-red-800/40 text-red-400 hover:text-red-200 cursor-pointer"
                        title="Delete pillar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-1">
                      <label className="block text-[11px] font-mono text-adm-muted uppercase mb-1">Number</label>
                      <input
                        type="text"
                        value={pillar.number}
                        onChange={(e) => handleUpdatePillar(idx, { number: e.target.value })}
                        className={`${pillarInputClass} font-mono`}
                      />
                    </div>

                    <div className="md:col-span-5">
                      <label className="block text-[11px] font-mono text-adm-muted uppercase mb-1">Title</label>
                      <input
                        type="text"
                        value={pillar.title}
                        onChange={(e) => handleUpdatePillar(idx, { title: e.target.value })}
                        className={`${pillarInputClass} font-serif tracking-wide`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-adm-muted uppercase mb-1">Tagline</label>
                    <div className="relative">
                      <Quote className="w-3.5 h-3.5 absolute left-2.5 top-2 text-adm-faint" />
                      <input
                        type="text"
                        value={pillar.tagline}
                        onChange={(e) => handleUpdatePillar(idx, { tagline: e.target.value })}
                        className={`${pillarInputClass} pl-8 italic font-serif`}
                      />
                    </div>
                    <span className="text-[10px] text-adm-faint block mt-1">
                      Italic line shown in quotation marks under the title. Leave empty to hide it.
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-adm-muted uppercase mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={pillar.description}
                      onChange={(e) => handleUpdatePillar(idx, { description: e.target.value })}
                      className={pillarInputClass}
                    />
                  </div>

                  <div className="pt-1">
                    <AdminImageInput
                      value={pillar.image}
                      onChange={(url) => handleUpdatePillar(idx, { image: url })}
                      label="Sanctuary Pillar Photo"
                      hint="Enter an image URL or click to directly upload a photo file from your device (JPG, PNG, WebP)."
                      altText={pillar.title}
                      previewHeight="h-36"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </form>
    </div>
  );
};
