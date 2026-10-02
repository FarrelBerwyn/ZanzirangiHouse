import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
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
  ExternalLink,
  Layers,
  Sparkles,
  Search,
  Upload,
  Languages,
  X,
} from 'lucide-react';
import {
  contentApi,
  PageContentModel,
  PageSectionConfigModel,
  LegalSectionModel,
} from '../../services/contentApi';
import { CmsPageSlug, PAGE_SECTION_DEFAULTS, mergeSectionsConfig, isLegalPage } from '../../pages/pageSections';

const AVAILABLE_PAGES: { slug: CmsPageSlug; label: string; path: string }[] = [
  { slug: 'villas', label: 'Stay / Villas', path: '/villas' },
  { slug: 'dining', label: 'Dining & Culinary', path: '/dining' },
  { slug: 'experiences', label: 'Island Experiences', path: '/experiences' },
  { slug: 'safari', label: 'Tanzania Safari', path: '/safari' },
  { slug: 'about', label: 'About Sanctuary', path: '/about' },
  { slug: 'contact', label: 'Contact & Location', path: '/contact' },
  { slug: 'privacy', label: 'Privacy Policy', path: '/privacy' },
  { slug: 'terms', label: 'Terms & Conditions', path: '/terms' },
];

type ContentJson = NonNullable<PageContentModel['contentJson']>;
type SeoFields = { title?: string; description?: string; ogImage?: string };

const inputCls =
  'w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs text-adm-text focus:border-adm-accent outline-none';
const labelCls = 'block text-xs font-mono text-adm-text-2 uppercase mb-1';
const hintCls = 'text-[11px] text-adm-muted mt-1 leading-relaxed';
const cardCls = 'p-5 rounded-xl bg-adm-panel border border-adm-line space-y-4';
const cardTitleCls = 'flex items-center space-x-2 text-xs font-mono uppercase text-adm-accent';
const iconBtnCls =
  'p-1.5 rounded bg-adm-surface border border-adm-line text-adm-muted hover:text-adm-text disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed';

/** Normalises a record loaded from the API into the shape the editor works with. */
const normalisePage = (slug: CmsPageSlug, data: PageContentModel): PageContentModel => ({
  ...data,
  sectionsConfig: mergeSectionsConfig(slug, data.sectionsConfig),
  contentJson: data.contentJson && typeof data.contentJson === 'object' ? data.contentJson : {},
});

/** Builds the PUT payload: every persisted field, with empty optional JSON values removed. */
const buildPayload = (slug: CmsPageSlug, page: PageContentModel): Partial<PageContentModel> => {
  const contentJson: ContentJson = { ...(page.contentJson || {}) };

  const seo: SeoFields = {};
  (['title', 'description', 'ogImage'] as const).forEach((key) => {
    const value = contentJson.seo?.[key];
    if (typeof value === 'string' && value.trim()) seo[key] = value.trim();
  });
  if (Object.keys(seo).length > 0) contentJson.seo = seo;
  else delete contentJson.seo;

  if (isLegalPage(slug)) {
    const sections = (contentJson.sections || [])
      .map((sec) => {
        const cleaned: LegalSectionModel = { title: sec.title || '' };
        if (sec.body && sec.body.trim()) cleaned.body = sec.body;
        const items = (sec.items || []).filter((item) => item && item.trim());
        if (items.length > 0) cleaned.items = items;
        return cleaned;
      })
      .filter((sec) => sec.title.trim() || sec.body || (sec.items || []).length > 0);
    contentJson.sections = sections;
    (['introText', 'lastUpdated'] as const).forEach((key) => {
      if (typeof contentJson[key] === 'string' && !contentJson[key]!.trim()) delete contentJson[key];
    });
  }

  return {
    title: page.title || '',
    eyebrow: page.eyebrow || '',
    heading: page.heading || '',
    subheading: page.subheading || '',
    description: page.description || '',
    heroImage: page.heroImage || '',
    sectionsConfig: (page.sectionsConfig || []).map((s, idx) => ({ ...s, order: idx + 1, visible: s.visible !== false })),
    contentJson,
  };
};

// ---------------------------------------------------------------------------
// Image field with preview + upload to the media library
// ---------------------------------------------------------------------------

const ImageField: React.FC<{
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  onError: (message: string) => void;
}> = ({ label, hint, value, onChange, onError }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);

  useEffect(() => setPreviewFailed(false), [value]);

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    try {
      setUploading(true);
      const asset = await contentApi.uploadMediaFile(file);
      if (!asset?.url) throw new Error('The upload finished but the server returned no file URL.');
      onChange(asset.url);
    } catch (err: any) {
      onError(err?.message || 'Image upload failed.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="flex items-start gap-3">
        <div className="w-24 h-16 rounded-lg border border-adm-line-strong bg-adm-bg overflow-hidden shrink-0 flex items-center justify-center">
          {value && !previewFailed ? (
            <img src={value} alt="" className="w-full h-full object-cover" onError={() => setPreviewFailed(true)} />
          ) : (
            <ImageIcon className="w-5 h-5 text-adm-muted" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`${inputCls} font-mono text-[11px]`}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-adm-raised hover:bg-adm-line border border-adm-line-strong text-[11px] font-mono text-adm-accent cursor-pointer disabled:opacity-50"
            >
              {uploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-adm-surface border border-adm-line text-[11px] font-mono text-adm-muted hover:text-adm-text cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
            {value && previewFailed && <span className="text-[11px] text-red-400 font-mono">Preview could not load</span>}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      </div>
      {hint && <p className={hintCls}>{hint}</p>}
    </div>
  );
};

const CharCount: React.FC<{ value?: string; max: number }> = ({ value, max }) => {
  const len = (value || '').length;
  return (
    <span className={`text-[10px] font-mono ${len > max ? 'text-amber-400' : 'text-adm-muted'}`}>
      {len}/{max}
    </span>
  );
};

// ---------------------------------------------------------------------------
// Editor
// ---------------------------------------------------------------------------

export const AdminPageEditor: React.FC<{ initialSlug?: CmsPageSlug; onNavigateToTab?: (tab: string) => void }> = ({
  initialSlug = 'villas',
  onNavigateToTab,
}) => {
  const [selectedSlug, setSelectedSlug] = useState<CmsPageSlug>(initialSlug);
  const [page, setPage] = useState<PageContentModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const legal = isLegalPage(selectedSlug);
  const activePageInfo = AVAILABLE_PAGES.find((p) => p.slug === selectedSlug);
  const knownSectionIds = new Set((PAGE_SECTION_DEFAULTS[selectedSlug] || []).map((s) => s.id));

  const loadPage = async (slug: CmsPageSlug) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setPage(null);
      const data = await contentApi.getAdminPage(slug);
      if (!data) throw new Error(`No page record found for "${slug}".`);
      setPage(normalisePage(slug, data));
      setDirty(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to load page content.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage(selectedSlug);
  }, [selectedSlug]);

  // Warn before leaving the browser tab with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const handleSelectPage = (slug: CmsPageSlug) => {
    if (slug === selectedSlug) return;
    if (dirty && !window.confirm('You have unsaved changes on this page. Discard them and switch pages?')) return;
    setSelectedSlug(slug);
  };

  const updatePage = (patch: Partial<PageContentModel>) => {
    setPage((prev) => (prev ? { ...prev, ...patch } : prev));
    setDirty(true);
    setSuccess(null);
  };

  const updateContentJson = (patch: Partial<ContentJson>) => {
    setPage((prev) => (prev ? { ...prev, contentJson: { ...(prev.contentJson || {}), ...patch } } : prev));
    setDirty(true);
    setSuccess(null);
  };

  const seo: SeoFields = page?.contentJson?.seo || {};
  const updateSeo = (patch: SeoFields) => updateContentJson({ seo: { ...seo, ...patch } });

  const handleSavePage = async () => {
    if (!page) return;
    if (!page.title || !page.title.trim()) {
      setError('Page title is required.');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const updated = await contentApi.updateAdminPage(page.id || selectedSlug, buildPayload(selectedSlug, page));
      if (!updated) throw new Error('The server did not return the saved page.');
      setPage(normalisePage(selectedSlug, updated));
      setDirty(false);
      setSuccess(`Page "${updated.title}" saved and published.`);
    } catch (err: any) {
      setError(err?.message || 'Failed to save page.');
    } finally {
      setSaving(false);
    }
  };

  // --- Section order & visibility -------------------------------------------------
  const sectionsConfig: PageSectionConfigModel[] = page?.sectionsConfig || [];

  const moveSection = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sectionsConfig.length) return;
    const next = [...sectionsConfig];
    [next[index], next[target]] = [next[target], next[index]];
    updatePage({ sectionsConfig: next.map((s, idx) => ({ ...s, order: idx + 1 })) });
  };

  const toggleSection = (index: number) => {
    const next = sectionsConfig.map((s, idx) => (idx === index ? { ...s, visible: s.visible === false } : s));
    updatePage({ sectionsConfig: next });
  };

  // --- Legal sections ---------------------------------------------------------------
  const legalSections: LegalSectionModel[] = page?.contentJson?.sections || [];
  const setLegalSections = (sections: LegalSectionModel[]) => updateContentJson({ sections });

  const updateLegalSection = (index: number, patch: Partial<LegalSectionModel>) =>
    setLegalSections(legalSections.map((s, idx) => (idx === index ? { ...s, ...patch } : s)));

  const moveLegalSection = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= legalSections.length) return;
    const next = [...legalSections];
    [next[index], next[target]] = [next[target], next[index]];
    setLegalSections(next);
  };

  const deleteLegalSection = (index: number) => {
    const label = legalSections[index]?.title || `Section ${index + 1}`;
    if (!window.confirm(`Remove "${label}" from this page?`)) return;
    setLegalSections(legalSections.filter((_, idx) => idx !== index));
  };

  const updateLegalItem = (sectionIndex: number, itemIndex: number, value: string) => {
    const items = [...(legalSections[sectionIndex]?.items || [])];
    items[itemIndex] = value;
    updateLegalSection(sectionIndex, { items });
  };

  const removeLegalItem = (sectionIndex: number, itemIndex: number) => {
    const items = (legalSections[sectionIndex]?.items || []).filter((_, idx) => idx !== itemIndex);
    updateLegalSection(sectionIndex, { items });
  };

  const moveLegalItem = (sectionIndex: number, itemIndex: number, direction: -1 | 1) => {
    const items = [...(legalSections[sectionIndex]?.items || [])];
    const target = itemIndex + direction;
    if (target < 0 || target >= items.length) return;
    [items[itemIndex], items[target]] = [items[target], items[itemIndex]];
    updateLegalSection(sectionIndex, { items });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Save */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-adm-line pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono tracking-widest uppercase text-adm-accent mb-1">
            <FileText className="w-4 h-4" />
            <span>FULL PAGE CONTENT MANAGER</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-adm-text">Information & Legal Pages</h1>
          <p className="text-xs sm:text-sm text-adm-muted mt-1">
            Edit each page's header, section order & visibility, legal text and search-engine settings.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {activePageInfo && (
            <a
              href={activePageInfo.path}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-adm-surface border border-adm-line text-xs font-mono text-adm-text-2 hover:text-adm-accent"
            >
              <span>View Page on Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            type="button"
            onClick={handleSavePage}
            disabled={saving || loading || !page}
            className="inline-flex items-center space-x-2 px-5 py-2 rounded-lg bg-adm-accent-fill hover:bg-adm-accent-hover text-adm-on-accent text-xs font-mono font-bold uppercase transition-colors shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : dirty ? 'Save Page Changes *' : 'Save Page Changes'}</span>
          </button>
        </div>
      </div>

      {/* Page Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {AVAILABLE_PAGES.map((p) => {
          const isSelected = selectedSlug === p.slug;
          return (
            <button
              key={p.slug}
              type="button"
              onClick={() => handleSelectPage(p.slug)}
              className={`p-3 rounded-xl text-left transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-adm-accent-fill text-adm-on-accent border-adm-accent shadow-md'
                  : 'bg-adm-panel text-adm-muted hover:text-adm-text border-adm-line hover:border-adm-line-strong'
              }`}
            >
              <div className="flex items-center justify-between mb-1 gap-2">
                <span className={`text-[11px] font-mono uppercase font-bold tracking-wider ${isSelected ? 'text-adm-on-accent' : 'text-adm-text'}`}>
                  {p.label}
                </span>
                <span className={`text-[9px] font-mono px-1 rounded ${isSelected ? 'bg-black/20 text-adm-on-accent' : 'bg-adm-raised text-adm-muted'}`}>
                  {p.path}
                </span>
              </div>
              <span className={`text-[11px] block truncate ${isSelected ? 'text-adm-on-accent/80' : 'text-adm-muted'}`}>
                {isLegalPage(p.slug) ? 'Legal Document' : 'Header, Sections & SEO'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-800/60 text-red-200 text-xs font-mono flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
          {!page && !loading && (
            <button
              type="button"
              onClick={() => loadPage(selectedSlug)}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-red-900/40 border border-red-800/60 hover:text-white cursor-pointer shrink-0"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 text-xs font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-adm-muted font-mono text-xs">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-adm-accent" />
          Loading page data...
        </div>
      ) : !page ? (
        <div className="p-12 text-center text-adm-muted font-mono text-xs">Page content could not be loaded.</div>
      ) : (
        <div className="space-y-6">
          {/* 1. Page Header */}
          <div className={cardCls}>
            <div className={`${cardTitleCls} border-b border-adm-line pb-2`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>1. Page Header</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Page Title *</label>
                <input
                  type="text"
                  value={page.title || ''}
                  onChange={(e) => updatePage({ title: e.target.value })}
                  className={`${inputCls} font-serif`}
                />
                <p className={hintCls}>Internal page name. Also used as the main heading when "Heading" is empty.</p>
              </div>

              <div>
                <label className={labelCls}>Eyebrow</label>
                <input
                  type="text"
                  value={page.eyebrow || ''}
                  onChange={(e) => updatePage({ eyebrow: e.target.value })}
                  className={inputCls}
                />
                <p className={hintCls}>Small uppercase line above the heading.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Heading (H1)</label>
                <input
                  type="text"
                  value={page.heading || ''}
                  onChange={(e) => updatePage({ heading: e.target.value })}
                  className={`${inputCls} font-serif`}
                />
              </div>

              <div>
                <label className={labelCls}>Subheading</label>
                <input
                  type="text"
                  value={page.subheading || ''}
                  onChange={(e) => updatePage({ subheading: e.target.value })}
                  className={inputCls}
                />
                <p className={hintCls}>Optional italic line shown under the heading.</p>
              </div>
            </div>

            <div>
              <label className={labelCls}>{legal ? 'Summary' : 'Description'}</label>
              <textarea
                rows={3}
                value={page.description || ''}
                onChange={(e) => updatePage({ description: e.target.value })}
                className={`${inputCls} leading-relaxed`}
              />
              <p className={hintCls}>
                {legal
                  ? 'Used as the opening paragraph when "Introduction" below is empty.'
                  : 'Paragraph shown under the heading.'}
                {' '}Leave any header field empty to use the built-in (translated) default text.
              </p>
            </div>

            {!legal && (
              <ImageField
                label="Header Background Image"
                hint="Shown as a soft, faded backdrop behind the page header."
                value={page.heroImage || ''}
                onChange={(url) => updatePage({ heroImage: url })}
                onError={setError}
              />
            )}
          </div>

          {/* 2. Legal Document (privacy / terms) */}
          {legal && (
            <div className={cardCls}>
              <div className="flex items-center justify-between border-b border-adm-line pb-3">
                <div className={cardTitleCls}>
                  <FileText className="w-3.5 h-3.5" />
                  <span>2. Legal Document ({legalSections.length} Sections)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setLegalSections([...legalSections, { title: '', body: '', items: [] }])}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-adm-raised hover:bg-adm-line border border-adm-line-strong text-xs font-mono text-adm-accent cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Section</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Last Updated</label>
                  <input
                    type="text"
                    value={page.contentJson?.lastUpdated || ''}
                    onChange={(e) => updateContentJson({ lastUpdated: e.target.value })}
                    className={inputCls}
                  />
                  <p className={hintCls}>Shown after the localized "Last Updated" label.</p>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Introduction</label>
                  <textarea
                    rows={3}
                    value={page.contentJson?.introText || ''}
                    onChange={(e) => updateContentJson({ introText: e.target.value })}
                    className={`${inputCls} leading-relaxed`}
                  />
                </div>
              </div>

              {legalSections.length === 0 ? (
                <div className="py-6 text-center text-adm-muted text-xs font-mono border border-dashed border-adm-line rounded-xl">
                  No sections yet. The website shows its built-in document until at least one section is added.
                </div>
              ) : (
                <div className="space-y-3">
                  {legalSections.map((sec, idx) => {
                    const items = sec.items || [];
                    return (
                      <div key={idx} className="p-4 rounded-xl border border-adm-line bg-adm-bg space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <span className="w-7 h-7 rounded-md bg-adm-accent/20 border border-adm-accent/40 text-adm-accent font-mono text-xs font-bold flex items-center justify-center shrink-0">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <div className="flex items-center space-x-2 shrink-0">
                            <button type="button" onClick={() => moveLegalSection(idx, -1)} disabled={idx === 0} className={iconBtnCls} title="Move section up">
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveLegalSection(idx, 1)}
                              disabled={idx === legalSections.length - 1}
                              className={iconBtnCls}
                              title="Move section down"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteLegalSection(idx)}
                              className="p-1.5 rounded bg-red-950/30 border border-red-800/40 text-red-400 hover:text-red-200 cursor-pointer"
                              title="Delete section"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className={labelCls}>Section Title</label>
                          <input
                            type="text"
                            value={sec.title || ''}
                            onChange={(e) => updateLegalSection(idx, { title: e.target.value })}
                            className={`${inputCls} font-serif`}
                          />
                        </div>

                        <div>
                          <label className={labelCls}>Paragraph</label>
                          <textarea
                            rows={3}
                            value={sec.body || ''}
                            onChange={(e) => updateLegalSection(idx, { body: e.target.value })}
                            className={`${inputCls} leading-relaxed`}
                          />
                          <p className={hintCls}>Line breaks are kept. E-mail addresses and https:// links become clickable.</p>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className={`${labelCls} mb-0`}>Bullet List ({items.length})</label>
                            <button
                              type="button"
                              onClick={() => updateLegalSection(idx, { items: [...items, ''] })}
                              className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-adm-raised hover:bg-adm-line border border-adm-line-strong text-[11px] font-mono text-adm-accent cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Item</span>
                            </button>
                          </div>
                          {items.length > 0 && (
                            <div className="space-y-2">
                              {items.map((item, itemIdx) => (
                                <div key={itemIdx} className="flex items-center gap-2">
                                  <span className="text-adm-muted text-xs">•</span>
                                  <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => updateLegalItem(idx, itemIdx, e.target.value)}
                                    className={inputCls}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => moveLegalItem(idx, itemIdx, -1)}
                                    disabled={itemIdx === 0}
                                    className={iconBtnCls}
                                    title="Move item up"
                                  >
                                    <ChevronUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveLegalItem(idx, itemIdx, 1)}
                                    disabled={itemIdx === items.length - 1}
                                    className={iconBtnCls}
                                    title="Move item down"
                                  >
                                    <ChevronDown className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeLegalItem(idx, itemIdx)}
                                    className="p-1.5 rounded bg-red-950/30 border border-red-800/40 text-red-400 hover:text-red-200 cursor-pointer"
                                    title="Remove item"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Section order & visibility */}
          <div className={cardCls}>
            <div className={`${cardTitleCls} border-b border-adm-line pb-2`}>
              <Layers className="w-3.5 h-3.5" />
              <span>{legal ? '3' : '2'}. Page Sections: Order & Visibility</span>
            </div>
            <p className="text-[11px] text-adm-muted">
              Sections render on <code>{activePageInfo?.path}</code> from top to bottom in this order. Hidden sections are
              not shown to visitors. Section content itself is edited in its own manager.
            </p>

            <div className="space-y-2">
              {sectionsConfig.map((section, idx) => {
                const isVisible = section.visible !== false;
                const isKnown = knownSectionIds.has(section.id);
                return (
                  <div
                    key={section.id}
                    className={`p-3 rounded-xl border bg-adm-bg flex items-center justify-between gap-3 transition-all ${
                      isVisible ? 'border-adm-line' : 'border-adm-line/40 opacity-60'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <span className="w-7 h-7 rounded-md bg-adm-accent/20 border border-adm-accent/40 text-adm-accent font-mono text-xs font-bold flex items-center justify-center shrink-0">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <span className="text-sm text-adm-text block truncate">{section.name || section.id}</span>
                        <span className="text-[10px] font-mono text-adm-muted">
                          {section.id}
                          {!isKnown && ' · not used on this page'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button type="button" onClick={() => moveSection(idx, -1)} disabled={idx === 0} className={iconBtnCls} title="Move up">
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(idx, 1)}
                        disabled={idx === sectionsConfig.length - 1}
                        className={iconBtnCls}
                        title="Move down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleSection(idx)}
                        className={`inline-flex items-center space-x-1 px-2 py-1.5 rounded border text-[11px] font-mono cursor-pointer ${
                          isVisible
                            ? 'bg-emerald-950/30 text-emerald-300 border-emerald-800/50'
                            : 'bg-adm-surface text-adm-muted border-adm-line'
                        }`}
                        title={isVisible ? 'Visible — click to hide' : 'Hidden — click to show'}
                      >
                        {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{isVisible ? 'Visible' : 'Hidden'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SEO */}
          <div className={cardCls}>
            <div className={`${cardTitleCls} border-b border-adm-line pb-2`}>
              <Search className="w-3.5 h-3.5" />
              <span>{legal ? '4' : '3'}. SEO & Social Sharing</span>
            </div>
            <p className="text-[11px] text-adm-muted">Leave a field empty to keep the website's built-in default for this page.</p>

            <div>
              <div className="flex items-center justify-between">
                <label className={labelCls}>SEO Title (browser tab & Google)</label>
                <CharCount value={seo.title} max={60} />
              </div>
              <input type="text" value={seo.title || ''} onChange={(e) => updateSeo({ title: e.target.value })} className={inputCls} />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className={labelCls}>Meta Description</label>
                <CharCount value={seo.description} max={160} />
              </div>
              <textarea
                rows={2}
                value={seo.description || ''}
                onChange={(e) => updateSeo({ description: e.target.value })}
                className={`${inputCls} leading-relaxed`}
              />
            </div>

            <ImageField
              label="Social Share Image (Open Graph)"
              hint="Image shown when the page is shared on WhatsApp, Facebook, etc. Recommended 1200×630."
              value={seo.ogImage || ''}
              onChange={(url) => updateSeo({ ogImage: url })}
              onError={setError}
            />
          </div>

          {onNavigateToTab && (
            <div className="p-4 rounded-xl bg-adm-surface border border-adm-line flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start space-x-3">
                <Languages className="w-5 h-5 text-adm-accent shrink-0 mt-0.5" />
                <p className="text-adm-muted leading-relaxed">
                  Text entered here is the English version. Translations for the other website languages are managed in
                  Translations → Info & Legal Pages.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (dirty && !window.confirm('You have unsaved changes on this page. Discard them and open Translations?')) return;
                  onNavigateToTab('translations');
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-adm-raised hover:bg-adm-line border border-adm-line-strong text-xs font-mono text-adm-accent hover:text-adm-text shrink-0 self-start sm:self-auto cursor-pointer"
              >
                <span>Open Translations</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
