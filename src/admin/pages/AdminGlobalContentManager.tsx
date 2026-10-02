import React, { useState, useEffect } from 'react';
import {
  Globe,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Layers,
  Sparkles,
  Share2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
} from 'lucide-react';
import { contentApi, GlobalContentModel, GlobalNavLink } from '../../services/contentApi';

type SocialKey = 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'whatsapp';

const SOCIAL_FIELDS: { key: SocialKey; label: string; placeholder: string }[] = [
  { key: 'instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/...' },
  { key: 'facebook', label: 'Facebook Page URL', placeholder: 'https://facebook.com/...' },
  { key: 'tiktok', label: 'TikTok URL', placeholder: 'https://tiktok.com/@...' },
  { key: 'youtube', label: 'YouTube URL', placeholder: 'https://youtube.com/@...' },
  { key: 'whatsapp', label: 'WhatsApp Link', placeholder: 'https://wa.me/...' },
];

/** The fields this editor owns. Deprecated contact* duplicates are never sent. */
interface GlobalForm {
  brandName: string;
  navLinks: GlobalNavLink[];
  ctaPlanStayLabel: string;
  ctaPlanStayLink: string;
  footerTagline: string;
  footerCopyright: string;
  footerDisclaimer: string;
  socials: Record<SocialKey, string>;
}

const inputClass =
  'w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs text-adm-text focus:border-adm-accent outline-none';

const str = (v: unknown): string => (typeof v === 'string' ? v : '');

const toForm = (data: GlobalContentModel): GlobalForm => {
  const links = Array.isArray(data.navLinks) ? data.navLinks : [];
  const socials = (data.socials && typeof data.socials === 'object' ? data.socials : {}) as Record<string, unknown>;
  return {
    brandName: str(data.brandName),
    navLinks: links
      .filter((l) => l && typeof l === 'object')
      .map((l, idx) => ({
        label: str(l.label),
        href: str(l.href),
        order: typeof l.order === 'number' ? l.order : idx + 1,
        visible: l.visible !== false,
      }))
      .sort((a, b) => a.order - b.order),
    ctaPlanStayLabel: str(data.ctaPlanStayLabel),
    ctaPlanStayLink: str(data.ctaPlanStayLink),
    footerTagline: str(data.footerTagline),
    footerCopyright: str(data.footerCopyright),
    footerDisclaimer: str(data.footerDisclaimer),
    socials: {
      instagram: str(socials.instagram),
      facebook: str(socials.facebook),
      tiktok: str(socials.tiktok),
      youtube: str(socials.youtube),
      whatsapp: str(socials.whatsapp),
    },
  };
};

export const AdminGlobalContentManager: React.FC = () => {
  const [form, setForm] = useState<GlobalForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const data = await contentApi.getAdminGlobalContent();
      if (!data) throw new Error('The server returned no navigation/footer content.');
      setForm(toForm(data));
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to load navigation & footer content.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const update = (changes: Partial<GlobalForm>) => {
    setForm((prev) => (prev ? { ...prev, ...changes } : prev));
    setSuccess(null);
  };

  const handleSave = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    if (!form) return;

    const incomplete = form.navLinks.findIndex((l) => !l.label.trim() || !l.href.trim());
    if (incomplete >= 0) {
      setError(`Menu item #${incomplete + 1} needs both a label and a link.`);
      setSuccess(null);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const socials: Record<string, string> = {};
      SOCIAL_FIELDS.forEach(({ key }) => {
        socials[key] = form.socials[key].trim();
      });
      const updated = await contentApi.updateAdminGlobalContent({
        brandName: form.brandName,
        navLinks: form.navLinks.map((l, idx) => ({
          label: l.label.trim(),
          href: l.href.trim(),
          order: idx + 1,
          visible: l.visible !== false,
        })),
        ctaPlanStayLabel: form.ctaPlanStayLabel,
        ctaPlanStayLink: form.ctaPlanStayLink,
        footerTagline: form.footerTagline,
        footerCopyright: form.footerCopyright,
        footerDisclaimer: form.footerDisclaimer,
        socials,
      });
      if (updated) setForm(toForm(updated));
      setSuccess('Navigation & footer saved. The website now shows these values.');
    } catch (err: any) {
      setError(err?.message || 'Failed to save navigation & footer content.');
    } finally {
      setSaving(false);
    }
  };

  const updateLink = (index: number, changes: Partial<GlobalNavLink>) => {
    if (!form) return;
    update({ navLinks: form.navLinks.map((l, i) => (i === index ? { ...l, ...changes } : l)) });
  };

  const addLink = () => {
    if (!form) return;
    update({
      navLinks: [...form.navLinks, { label: '', href: '', order: form.navLinks.length + 1, visible: true }],
    });
  };

  const removeLink = (index: number) => {
    if (!form) return;
    const name = form.navLinks[index]?.label || `item #${index + 1}`;
    if (!window.confirm(`Remove menu item "${name}"? It is removed from the website when you save.`)) return;
    update({
      navLinks: form.navLinks.filter((_, i) => i !== index).map((l, idx) => ({ ...l, order: idx + 1 })),
    });
  };

  const moveLink = (index: number, direction: 'up' | 'down') => {
    if (!form) return;
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= form.navLinks.length) return;
    const moved = [...form.navLinks];
    [moved[index], moved[target]] = [moved[target], moved[index]];
    update({ navLinks: moved.map((l, idx) => ({ ...l, order: idx + 1 })) });
  };

  if (loading && !form) {
    return (
      <div className="p-12 text-center text-adm-muted font-mono text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-adm-accent" />
        Loading navigation & footer...
      </div>
    );
  }

  if (!form) {
    return (
      <div className="p-6 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs font-mono space-y-3">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{loadError || 'Navigation & footer content could not be loaded.'}</span>
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

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-adm-line pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono tracking-widest uppercase text-adm-accent mb-1">
            <Globe className="w-4 h-4" />
            <span>SITE-WIDE NAVIGATION</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-adm-text">Navigation Menu & Footer</h1>
          <p className="text-xs sm:text-sm text-adm-muted mt-1">
            Set the brand name, the menu links, the Plan Your Stay button, and the footer texts and social links.
          </p>
        </div>

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

      {/* Visual Guide Banner for Layperson Admins */}
      <div className="p-4 rounded-xl bg-adm-surface border border-adm-accent/30 flex items-start space-x-3 text-xs">
        <Globe className="w-5 h-5 text-adm-accent shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-adm-text block mb-0.5">📍 Where this appears on the website:</span>
          <p className="text-adm-muted leading-relaxed">
            The <strong>top menu bar</strong> (desktop and mobile) and the <strong>footer</strong> on every page.
            Phone, email, WhatsApp number and address are edited in <strong>Contact & WhatsApp</strong>. Menu labels
            that still match the original defaults are shown translated in each language; edited labels are shown as
            written (translate them in Admin → Translations).
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
        {/* Brand & Header CTA */}
        <div className="p-5 rounded-xl bg-adm-panel border border-adm-line space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono uppercase text-adm-accent border-b border-adm-line pb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>01 — Brand & Plan Your Stay Button</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-adm-text-2 uppercase mb-1">Brand Name</label>
              <input
                type="text"
                value={form.brandName}
                onChange={(e) => update({ brandName: e.target.value })}
                className={`${inputClass} font-serif`}
              />
              <span className="text-[10px] text-adm-faint block mt-1">
                Shown next to the logo (first word on top, rest below) and in the footer.
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono text-adm-text-2 uppercase mb-1">Button Label</label>
              <input
                type="text"
                value={form.ctaPlanStayLabel}
                onChange={(e) => update({ ctaPlanStayLabel: e.target.value })}
                className={inputClass}
              />
              <span className="text-[10px] text-adm-faint block mt-1">
                Header, mobile menu and footer button. It opens the booking request form.
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono text-adm-text-2 uppercase mb-1">Button Fallback Link</label>
              <input
                type="text"
                value={form.ctaPlanStayLink}
                onChange={(e) => update({ ctaPlanStayLink: e.target.value })}
                className={`${inputClass} font-mono`}
              />
              <span className="text-[10px] text-adm-faint block mt-1">
                Stored for integrations; the website button always opens the booking form.
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="p-5 rounded-xl bg-adm-panel border border-adm-line space-y-4">
          <div className="flex items-center justify-between border-b border-adm-line pb-3">
            <div className="flex items-center space-x-2 text-xs font-mono uppercase text-adm-accent">
              <Layers className="w-3.5 h-3.5" />
              <span>02 — Menu Links ({form.navLinks.length})</span>
            </div>
            <button
              type="button"
              onClick={addLink}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-adm-raised hover:bg-adm-line border border-adm-line-strong text-xs font-mono text-adm-accent cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Menu Item</span>
            </button>
          </div>

          <p className="text-[11px] text-adm-muted">
            Used for the header menu and the footer "Quick Links". Links starting with <code>/</code> open a page of
            this website (e.g. <code>/villas</code>); full URLs open external sites. If no visible item exists, the
            built-in menu is shown.
          </p>

          {form.navLinks.length === 0 && (
            <div className="p-4 rounded-lg bg-adm-bg border border-dashed border-adm-line text-xs text-adm-muted">
              No menu items saved. The website currently shows its built-in menu.
            </div>
          )}

          <div className="space-y-2">
            {form.navLinks.map((link, idx) => {
              const visible = link.visible !== false;
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-lg bg-adm-bg border border-adm-line flex flex-col md:flex-row md:items-center gap-2 ${
                    visible ? '' : 'opacity-60'
                  }`}
                >
                  <span className="text-[10px] font-mono text-adm-muted w-8 shrink-0">#{idx + 1}</span>
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => updateLink(idx, { label: e.target.value })}
                    className="flex-1 px-2 py-1.5 bg-adm-surface border border-adm-line rounded text-xs text-adm-text focus:border-adm-accent outline-none font-mono uppercase"
                    placeholder="Label"
                    aria-label={`Menu item ${idx + 1} label`}
                  />
                  <input
                    type="text"
                    value={link.href}
                    onChange={(e) => updateLink(idx, { href: e.target.value })}
                    className="flex-1 px-2 py-1.5 bg-adm-surface border border-adm-line rounded text-xs text-adm-muted focus:border-adm-accent outline-none font-mono text-[11px]"
                    placeholder="Link, e.g. /villas"
                    aria-label={`Menu item ${idx + 1} link`}
                  />
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveLink(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded bg-adm-surface border border-adm-line text-adm-muted hover:text-adm-text disabled:opacity-30 cursor-pointer"
                      title="Move up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveLink(idx, 'down')}
                      disabled={idx === form.navLinks.length - 1}
                      className="p-1 rounded bg-adm-surface border border-adm-line text-adm-muted hover:text-adm-text disabled:opacity-30 cursor-pointer"
                      title="Move down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateLink(idx, { visible: !visible })}
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
                      onClick={() => removeLink(idx)}
                      className="p-1 rounded bg-red-950/30 border border-red-800/40 text-red-400 hover:text-red-200 cursor-pointer"
                      title="Delete menu item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 rounded-xl bg-adm-panel border border-adm-line space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono uppercase text-adm-accent border-b border-adm-line pb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>03 — Footer Texts</span>
          </div>

          <div>
            <label className="block text-xs font-mono text-adm-text-2 uppercase mb-1">Footer Tagline</label>
            <textarea
              rows={2}
              value={form.footerTagline}
              onChange={(e) => update({ footerTagline: e.target.value })}
              className={inputClass}
            />
            <span className="text-[10px] text-adm-faint block mt-1">
              Short brand statement under the brand name. Empty = built-in translated statement.
            </span>
          </div>

          <div>
            <label className="block text-xs font-mono text-adm-text-2 uppercase mb-1">Copyright Notice</label>
            <input
              type="text"
              value={form.footerCopyright}
              onChange={(e) => update({ footerCopyright: e.target.value })}
              className={inputClass}
            />
            <span className="text-[10px] text-adm-faint block mt-1">
              Bottom line of the footer. A copyright text set in the Homepage editor takes priority over this one.
            </span>
          </div>

          <div>
            <label className="block text-xs font-mono text-adm-text-2 uppercase mb-1">Footer Disclaimer</label>
            <textarea
              rows={2}
              value={form.footerDisclaimer}
              onChange={(e) => update({ footerDisclaimer: e.target.value })}
              className={inputClass}
            />
            <span className="text-[10px] text-adm-faint block mt-1">
              Optional small print below the copyright line. Leave empty to hide it.
            </span>
          </div>
        </div>

        {/* Socials */}
        <div className="p-5 rounded-xl bg-adm-panel border border-adm-line space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono uppercase text-adm-accent border-b border-adm-line pb-2">
            <Share2 className="w-3.5 h-3.5" />
            <span>04 — Footer Social Links</span>
          </div>
          <p className="text-[11px] text-adm-muted">
            Used for the footer icons when no link is set in <strong>Contact & WhatsApp</strong> (those take
            priority).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-mono text-adm-text-2 uppercase mb-1">{label}</label>
                <input
                  type="text"
                  value={form.socials[key]}
                  onChange={(e) => update({ socials: { ...form.socials, [key]: e.target.value } })}
                  placeholder={placeholder}
                  className={`${inputClass} font-mono`}
                />
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};
