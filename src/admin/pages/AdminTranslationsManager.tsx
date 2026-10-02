import React, { useEffect, useMemo, useState } from 'react';
import { Languages, Save, RefreshCw, Search, Check, AlertTriangle, Globe } from 'lucide-react';
import { API_BASE } from '../../services/authApi';
import { contentApi } from '../../services/contentApi';
import {
  TRANSLATABLE_ENTITIES,
  TRANSLATION_LANGUAGES,
  TranslationMap,
  extractTranslatable,
} from '../../i18n/cmsTranslations';

interface AdminTranslationsManagerProps {
  onUnsavedChangesChange?: (hasUnsaved: boolean) => void;
}

type SavedEntry = { value: string; source?: string };
type Filter = 'all' | 'missing' | 'outdated' | 'translated';

const prettyPath = (path: string) =>
  path
    .replace(/\[#(\d+)\]/g, (_m, i) => ` › ${Number(i) + 1}`)
    .replace(/\[([^\]]+)\]/g, ' › $1 ›')
    .replace(/\./g, ' › ')
    .replace(/(›\s*)+/g, '› ')
    .replace(/^\s*›\s*/, '')
    .replace(/\s*›\s*$/, '')
    .trim();

export const AdminTranslationsManager: React.FC<AdminTranslationsManagerProps> = ({ onUnsavedChangesChange }) => {
  const [lang, setLang] = useState<string>(TRANSLATION_LANGUAGES[0].code);
  const [entityKey, setEntityKey] = useState<string>(TRANSLATABLE_ENTITIES[0].key);
  const [sources, setSources] = useState<Record<string, TranslationMap>>({});
  const [saved, setSaved] = useState<Record<string, Record<string, SavedEntry>>>({});
  const [drafts, setDrafts] = useState<Record<string, Record<string, string>>>({});
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const draftCount = Object.values(drafts).reduce<number>((n, m) => n + Object.keys(m).length, 0);

  useEffect(() => {
    onUnsavedChangesChange?.(draftCount > 0);
  }, [draftCount]);

  // English sources come straight from the live CMS content.
  const loadSources = async () => {
    const entries = await Promise.all(
      TRANSLATABLE_ENTITIES.map(async (entity) => {
        try {
          const res = await fetch(`${API_BASE}/content/${entity.endpoint}`);
          const json = await res.json();
          return [entity.key, extractTranslatable(entity, json.data)] as const;
        } catch {
          return [entity.key, {}] as const;
        }
      })
    );
    setSources(Object.fromEntries(entries));
  };

  const loadTranslations = async (language: string) => {
    const rows = await contentApi.getAdminTranslations(language);
    const map: Record<string, Record<string, SavedEntry>> = {};
    rows.forEach((r) => {
      (map[r.entity] = map[r.entity] || {})[r.path] = { value: r.value, source: r.source };
    });
    setSaved(map);
  };

  const loadAll = async (language = lang) => {
    try {
      setLoading(true);
      setStatus(null);
      await Promise.all([loadSources(), loadTranslations(language)]);
      setDrafts({});
    } catch (err: any) {
      setStatus({ type: 'error', text: err.message || 'Failed to load translations.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll(lang);
  }, []);

  const switchLanguage = (next: string) => {
    if (draftCount > 0 && !window.confirm('You have unsaved translations. Switch language and discard them?')) return;
    setLang(next);
    loadAll(next);
  };

  const rowState = (entity: string, path: string): 'missing' | 'outdated' | 'translated' => {
    const entry = saved[entity]?.[path];
    if (!entry?.value) return 'missing';
    if (entry.source !== undefined && entry.source !== sources[entity]?.[path]) return 'outdated';
    return 'translated';
  };

  const entityStats = (entity: string) => {
    const paths = Object.keys(sources[entity] || {});
    let translated = 0;
    let outdated = 0;
    paths.forEach((p) => {
      const s = rowState(entity, p);
      if (s === 'translated') translated++;
      if (s === 'outdated') outdated++;
    });
    return { total: paths.length, translated, outdated };
  };

  const rows = useMemo(() => {
    const src: TranslationMap = sources[entityKey] || {};
    const q = query.trim().toLowerCase();
    return Object.entries(src).filter(([path, english]) => {
      const state = rowState(entityKey, path);
      if (filter !== 'all' && state !== filter) return false;
      if (!q) return true;
      const current = drafts[entityKey]?.[path] ?? saved[entityKey]?.[path]?.value ?? '';
      return (
        english.toLowerCase().includes(q) || current.toLowerCase().includes(q) || path.toLowerCase().includes(q)
      );
    });
  }, [sources, saved, drafts, entityKey, filter, query]);

  const setDraft = (path: string, value: string) => {
    setDrafts((prev) => {
      const entityDrafts = { ...(prev[entityKey] || {}) };
      const original = saved[entityKey]?.[path]?.value ?? '';
      if (value === original) delete entityDrafts[path];
      else entityDrafts[path] = value;
      return { ...prev, [entityKey]: entityDrafts };
    });
  };

  const markUpToDate = (path: string) => {
    // Re-saving the current text against the latest English source clears the "outdated" flag.
    setDrafts((prev) => ({
      ...prev,
      [entityKey]: { ...(prev[entityKey] || {}), [path]: saved[entityKey]?.[path]?.value ?? '' },
    }));
  };

  const handleSave = async () => {
    const entries = Object.entries(drafts).flatMap(([entity, paths]) =>
      Object.entries(paths).map(([path, value]) => ({
        entity,
        path,
        value,
        source: sources[entity]?.[path],
      }))
    );
    if (entries.length === 0) return;
    try {
      setSaving(true);
      setStatus(null);
      const count = await contentApi.updateTranslations(lang, entries);
      await loadTranslations(lang);
      setDrafts({});
      setStatus({ type: 'success', text: `${count} translation${count === 1 ? '' : 's'} published to the live website.` });
    } catch (err: any) {
      setStatus({ type: 'error', text: err.message || 'Failed to save translations.' });
    } finally {
      setSaving(false);
    }
  };

  const activeEntity = TRANSLATABLE_ENTITIES.find((e) => e.key === entityKey) || TRANSLATABLE_ENTITIES[0];
  const isRtl = lang === 'ar';
  const langLabel = TRANSLATION_LANGUAGES.find((l) => l.code === lang)?.label || lang;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-adm-line">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-adm-accent flex items-center gap-2">
            <Languages className="w-3.5 h-3.5" /> Multilingual Content
          </span>
          <h1 className="text-2xl sm:text-3xl text-adm-text mt-1">Translations</h1>
          <p className="text-xs text-adm-muted mt-1 max-w-2xl">
            Translate every text managed in the CMS. English is edited in each content manager; here you provide the other
            languages. Empty translations fall back to English. "Zanzirangi House" should stay untranslated.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {status && (
            <div
              className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 border ${
                status.type === 'success'
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                  : 'bg-red-950/60 text-red-300 border-red-800/60'
              }`}
            >
              {status.type === 'success' ? <Check className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              <span>{status.text}</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => loadAll(lang)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-adm-surface border border-adm-line hover:border-adm-accent/50 text-xs text-adm-text-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-adm-accent ${loading ? 'animate-spin' : ''}`} />
            <span>Reload</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || draftCount === 0}
            id="translations-save-btn"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-adm-accent-fill hover:bg-adm-accent-hover text-adm-on-accent text-xs uppercase tracking-widest font-bold shadow-lg cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing...' : `Publish ${draftCount > 0 ? `(${draftCount})` : ''}`}</span>
          </button>
        </div>
      </div>

      {/* Language Picker */}
      <div className="flex flex-wrap items-center gap-2">
        <Globe className="w-4 h-4 text-adm-muted mr-1" />
        {TRANSLATION_LANGUAGES.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => switchLanguage(l.code)}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              lang === l.code
                ? 'bg-adm-accent-fill text-adm-on-accent font-semibold'
                : 'bg-adm-surface border border-adm-line text-adm-text-2 hover:text-adm-text hover:border-adm-line-strong'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <RefreshCw className="w-7 h-7 mx-auto mb-3 animate-spin text-adm-accent" />
          <p className="text-xs uppercase tracking-widest text-adm-text-2">Loading content & translations...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Content Groups */}
          <div className="lg:col-span-3 space-y-1.5">
            {TRANSLATABLE_ENTITIES.map((entity) => {
              const s = entityStats(entity.key);
              const pending = Object.keys(drafts[entity.key] || {}).length;
              const isActive = entity.key === entityKey;
              const pct = s.total ? Math.round((s.translated / s.total) * 100) : 100;
              return (
                <button
                  key={entity.key}
                  type="button"
                  onClick={() => setEntityKey(entity.key)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-adm-accent-fill text-adm-on-accent'
                      : 'bg-adm-surface border border-adm-line text-adm-text-2 hover:text-adm-text hover:border-adm-line-strong'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[13px] truncate ${isActive ? 'font-semibold' : 'font-medium'}`}>{entity.label}</span>
                    {pending > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${isActive ? 'bg-black/15' : 'bg-adm-accent/15 text-adm-accent'}`}>
                        {pending} unsaved
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className={`flex-1 h-1 rounded-full ${isActive ? 'bg-black/15' : 'bg-adm-line'}`}>
                      <div
                        className={`h-1 rounded-full ${isActive ? 'bg-adm-on-accent' : 'bg-adm-accent'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] shrink-0 opacity-80">
                      {s.total === 0 ? 'No text' : `${s.translated}/${s.total}`}
                      {s.outdated > 0 ? ` • ${s.outdated} outdated` : ''}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Rows */}
          <div className="lg:col-span-9 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl bg-adm-surface border border-adm-line">
              <div>
                <h2 className="text-lg text-adm-text">{activeEntity.label}</h2>
                <p className="text-xs text-adm-muted">
                  English → {langLabel}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-adm-faint absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search text..."
                    className="bg-adm-bg border border-adm-line focus:border-adm-accent rounded-lg pl-8 pr-3 py-2 text-xs text-adm-text placeholder-adm-faint outline-none w-48"
                  />
                </div>
                {(['all', 'missing', 'outdated', 'translated'] as Filter[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={`px-3 py-2 rounded-lg text-xs capitalize cursor-pointer ${
                      filter === f
                        ? 'bg-adm-raised border border-adm-accent/50 text-adm-text font-semibold'
                        : 'bg-adm-bg border border-adm-line text-adm-muted hover:text-adm-text'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {rows.length === 0 ? (
              <p className="text-xs text-adm-muted text-center py-12 rounded-xl border border-dashed border-adm-line">
                {Object.keys(sources[entityKey] || {}).length === 0
                  ? 'This group has no CMS text yet. Fill it in its content manager first.'
                  : 'No texts match this filter.'}
              </p>
            ) : (
              <div className="space-y-2.5">
                {rows.map(([path, english]) => {
                  const state = rowState(entityKey, path);
                  const draft = drafts[entityKey]?.[path];
                  const value = draft ?? saved[entityKey]?.[path]?.value ?? '';
                  const isLong = english.length > 90;
                  return (
                    <div
                      key={path}
                      className={`grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-xl bg-adm-surface border ${
                        draft !== undefined ? 'border-adm-accent/60' : 'border-adm-line'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] text-adm-faint truncate" title={path}>
                            {prettyPath(path)}
                          </span>
                          {state === 'missing' && (
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-adm-raised text-adm-muted shrink-0">Missing</span>
                          )}
                          {state === 'outdated' && (
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-800/60 text-amber-300 shrink-0">
                              English changed
                            </span>
                          )}
                        </div>
                        <p className="text-[13px] text-adm-text-2 leading-relaxed whitespace-pre-wrap break-words">{english}</p>
                        {state === 'outdated' && saved[entityKey]?.[path]?.source && (
                          <p className="text-[11px] text-adm-faint mt-1.5 line-through break-words">
                            {saved[entityKey]?.[path]?.source}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        {isLong ? (
                          <textarea
                            dir={isRtl ? 'rtl' : 'ltr'}
                            rows={Math.min(8, Math.ceil(english.length / 70) + 1)}
                            value={value}
                            placeholder={english}
                            onChange={(e) => setDraft(path, e.target.value)}
                            className="w-full bg-adm-bg border border-adm-line focus:border-adm-accent focus:ring-1 focus:ring-adm-accent rounded-lg px-3 py-2 text-sm text-adm-text placeholder-adm-faint outline-none resize-y"
                          />
                        ) : (
                          <input
                            type="text"
                            dir={isRtl ? 'rtl' : 'ltr'}
                            value={value}
                            placeholder={english}
                            onChange={(e) => setDraft(path, e.target.value)}
                            className="w-full bg-adm-bg border border-adm-line focus:border-adm-accent focus:ring-1 focus:ring-adm-accent rounded-lg px-3 py-2 text-sm text-adm-text placeholder-adm-faint outline-none"
                          />
                        )}
                        {state === 'outdated' && draft === undefined && (
                          <button
                            type="button"
                            onClick={() => markUpToDate(path)}
                            className="text-[11px] text-adm-accent hover:underline cursor-pointer"
                          >
                            Translation still correct — mark as up to date
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
