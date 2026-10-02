import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Layers,
  Leaf,
  Eye,
  EyeOff,
  Clock,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from 'lucide-react';
import {
  contentApi,
  DiningConfigModel,
  DiningCategoryModel,
  DiningItem,
  DiningMoment,
} from '../../services/contentApi';

const inputClass =
  'w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs text-adm-text focus:border-adm-accent outline-none';
const smallInputClass =
  'w-full px-2.5 py-1.5 bg-adm-surface border border-adm-line rounded text-xs text-adm-text focus:border-adm-accent outline-none';
const labelClass = 'block text-xs font-mono text-adm-text-2 uppercase mb-1';
const smallLabelClass = 'block text-[10px] font-mono text-adm-muted uppercase mb-1';
const hintClass = 'text-[10px] text-adm-faint block mt-1';

/**
 * Narrative config. The `categories` list the server attaches on read is stripped (categories are saved through
 * their own endpoint) so it is never written back into the config's extras.
 */
type DiningNarrative = DiningConfigModel;

const toNarrative = (data: DiningConfigModel | null | undefined): DiningNarrative | null => {
  if (!data) return null;
  const rest: DiningNarrative = { ...data };
  delete rest.categories;
  return { ...rest, moments: Array.isArray(rest.moments) ? rest.moments : [] };
};

const sortByOrder = (items: DiningCategoryModel[]): DiningCategoryModel[] =>
  [...items].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

const ImagePreview: React.FC<{ url?: string; alt: string; className?: string }> = ({ url, alt, className }) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [url]);
  return (
    <div
      className={`mt-2 rounded-md overflow-hidden border border-adm-line bg-adm-panel flex items-center justify-center text-adm-faint ${
        className || 'w-40 h-24'
      }`}
    >
      {url && !failed ? (
        <img src={url} alt={alt} className="w-full h-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <div className="flex flex-col items-center text-[9px] font-mono uppercase">
          <ImageIcon className="w-5 h-5 mb-1" />
          {url ? 'Image failed to load' : 'No image'}
        </div>
      )}
    </div>
  );
};

export const AdminDiningManager: React.FC = () => {
  const [config, setConfig] = useState<DiningNarrative | null>(null);
  // `categories` holds the editor copies, `savedCategories` the last copies confirmed by the server.
  const [categories, setCategories] = useState<DiningCategoryModel[]>([]);
  const [savedCategories, setSavedCategories] = useState<DiningCategoryModel[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const applyCategories = (list: DiningCategoryModel[], preferId?: string) => {
    const sorted = sortByOrder(
      list.map((c) => ({ ...c, signatureDishes: Array.isArray(c.signatureDishes) ? c.signatureDishes : [] }))
    );
    setCategories(sorted);
    setSavedCategories(sorted);
    setSelectedCatId((current) => {
      const wanted = preferId || current;
      if (wanted && sorted.some((c) => c.id === wanted)) return wanted;
      return sorted[0]?.id || '';
    });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [diningData, catData] = await Promise.all([
        contentApi.getAdminDining(),
        contentApi.getAdminDiningCategories(),
      ]);
      setConfig(toNarrative(diningData));
      applyCategories(catData);
    } catch (err: any) {
      setError(err.message || 'Failed to load dining content.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const flash = (message: string) => {
    setError(null);
    setSuccess(message);
  };

  // ---------------------------------------------------------------------------
  // Narrative & moments
  // ---------------------------------------------------------------------------
  const updateConfig = (updates: Partial<DiningNarrative>) => {
    if (!config) return;
    setConfig({ ...config, ...updates });
  };

  const handleSaveConfig = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!config) return;
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const { updatedAt: _updatedAt, updatedBy: _updatedBy, ...payload } = config;
      const updated = await contentApi.updateAdminDining({
        ...payload,
        moments: (config.moments || []).map((m) => ({
          title: m.title || '',
          time: m.time || '',
          desc: m.desc || '',
          ...(m.image ? { image: m.image } : {}),
        })),
      });
      setConfig(toNarrative(updated));
      flash('Dining narrative, garden story and dining moments saved.');
    } catch (err: any) {
      setError(err.message || 'Failed to save dining configuration.');
    } finally {
      setSaving(false);
    }
  };

  const updateMoment = (index: number, updates: Partial<DiningMoment>) => {
    if (!config) return;
    const moments = [...config.moments];
    moments[index] = { ...moments[index], ...updates };
    setConfig({ ...config, moments });
  };

  const addMoment = () => {
    if (!config) return;
    setConfig({ ...config, moments: [...config.moments, { title: '', time: '', desc: '', image: '' }] });
  };

  const moveMoment = (index: number, direction: -1 | 1) => {
    if (!config) return;
    const target = index + direction;
    if (target < 0 || target >= config.moments.length) return;
    const moments = [...config.moments];
    [moments[index], moments[target]] = [moments[target], moments[index]];
    setConfig({ ...config, moments });
  };

  const removeMoment = (index: number) => {
    if (!config) return;
    if (!window.confirm('Remove this dining moment? The change is published when you save.')) return;
    setConfig({ ...config, moments: config.moments.filter((_, i) => i !== index) });
  };

  // ---------------------------------------------------------------------------
  // Categories & dishes
  // ---------------------------------------------------------------------------
  const currentCategory = categories.find((c) => c.id === selectedCatId);
  const savedCurrent = savedCategories.find((c) => c.id === selectedCatId);
  const currentDirty =
    !!currentCategory && JSON.stringify(currentCategory) !== JSON.stringify(savedCurrent || null);

  const replaceCategory = (updated: DiningCategoryModel) => {
    setCategories((list) => list.map((c) => (c.id === updated.id ? updated : c)));
  };

  const updateCurrentCategory = (updates: Partial<DiningCategoryModel>) => {
    if (!currentCategory) return;
    replaceCategory({ ...currentCategory, ...updates });
  };

  const normalizeDishes = (dishes: DiningItem[]): DiningItem[] =>
    dishes.map((d, i) => ({
      ...d,
      id: d.id || `dish-${Date.now()}-${i}`,
      name: d.name || '',
      description: d.description || '',
      price: d.price || '',
      dietary: d.dietary || '',
      order: i + 1,
      visible: d.visible !== false,
    }));

  const persistCategory = async (category: DiningCategoryModel, message: string) => {
    const payload: DiningCategoryModel = {
      ...category,
      order: Number(category.order) || 0,
      visible: category.visible !== false,
      signatureDishes: normalizeDishes(category.signatureDishes || []),
    };
    const saved = await contentApi.updateAdminDiningCategory(category.id, payload);
    const merged = { ...saved, signatureDishes: Array.isArray(saved.signatureDishes) ? saved.signatureDishes : [] };
    setSavedCategories((list) => sortByOrder(list.map((c) => (c.id === merged.id ? merged : c))));
    setCategories((list) => sortByOrder(list.map((c) => (c.id === merged.id ? merged : c))));
    flash(message);
    return merged;
  };

  const handleSaveCategory = async () => {
    if (!currentCategory) return;
    if (!currentCategory.name.trim()) {
      setError('The category name is required.');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await persistCategory(currentCategory, `Menu category "${currentCategory.name}" saved.`);
    } catch (err: any) {
      setError(err.message || 'Failed to save menu category.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCategoryVisibility = async () => {
    if (!currentCategory || !savedCurrent) return;
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      // Only the visibility flag changes; the server copy is sent so unsaved edits are not published by accident.
      const nextVisible = savedCurrent.visible === false;
      const saved = await persistCategory(
        { ...savedCurrent, visible: nextVisible },
        `Menu category "${savedCurrent.name}" is now ${nextVisible ? 'visible' : 'hidden'} on the website.`
      );
      // Keep the admin's unsaved edits, but reflect the new visibility.
      if (currentDirty) replaceCategory({ ...currentCategory, visible: saved.visible });
    } catch (err: any) {
      setError(err.message || 'Failed to change category visibility.');
    } finally {
      setSaving(false);
    }
  };

  const handleMoveCategory = async (direction: -1 | 1) => {
    if (!currentCategory) return;
    const ordered = sortByOrder(savedCategories);
    const index = ordered.findIndex((c) => c.id === currentCategory.id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= ordered.length) return;
    const swapped = [...ordered];
    [swapped[index], swapped[target]] = [swapped[target], swapped[index]];
    const renumbered = swapped.map((c, i) => ({ ...c, order: i + 1 }));
    const changed = renumbered.filter((c) => ordered.find((o) => o.id === c.id)?.order !== c.order);
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const results = await Promise.all(
        changed.map((c) => contentApi.updateAdminDiningCategory(c.id, c))
      );
      const byId = new Map(results.map((r) => [r.id, r]));
      setSavedCategories((list) => sortByOrder(list.map((c) => byId.get(c.id) || renumbered.find((r) => r.id === c.id) || c)));
      // Editor copies keep their unsaved edits; only the order is refreshed.
      setCategories((list) =>
        sortByOrder(
          list.map((c) => {
            const fresh = byId.get(c.id) || renumbered.find((r) => r.id === c.id);
            return fresh ? { ...c, order: fresh.order } : c;
          })
        )
      );
      flash('Category order saved.');
    } catch (err: any) {
      setError(err.message || 'Failed to save the category order.');
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = async () => {
    const maxOrder = categories.reduce((max, c) => Math.max(max, Number(c.order) || 0), 0);
    const newCat: Partial<DiningCategoryModel> = {
      name: 'New Menu Category',
      tabLabel: 'New',
      subtitle: '',
      description: '',
      imageUrl: '',
      order: maxOrder + 1,
      visible: false,
      signatureDishes: [],
    };
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const created = await contentApi.createAdminDiningCategory(newCat);
      const all = await contentApi.getAdminDiningCategories();
      applyCategories(all, created.id);
      flash('New menu category created as hidden. Fill it in, save, then make it visible.');
    } catch (err: any) {
      setError(err.message || 'Failed to add dining category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (category: DiningCategoryModel) => {
    if (!window.confirm(`Delete the menu category "${category.name}" and all its dishes? This cannot be undone.`)) return;
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await contentApi.deleteAdminDiningCategory(category.id);
      const remaining = savedCategories.filter((c) => c.id !== category.id);
      setSavedCategories(remaining);
      setCategories((list) => list.filter((c) => c.id !== category.id));
      setSelectedCatId(remaining[0]?.id || '');
      flash(`Menu category "${category.name}" deleted.`);
    } catch (err: any) {
      setError(err.message || 'Failed to delete category.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddDish = () => {
    if (!currentCategory) return;
    const dishes = currentCategory.signatureDishes || [];
    const newDish: DiningItem = {
      id: `dish-${Date.now()}`,
      name: '',
      description: '',
      price: '',
      dietary: '',
      order: dishes.length + 1,
      visible: true,
    };
    updateCurrentCategory({ signatureDishes: [...dishes, newDish] });
  };

  const handleUpdateDish = (index: number, updates: Partial<DiningItem>) => {
    if (!currentCategory) return;
    const dishes = [...(currentCategory.signatureDishes || [])];
    dishes[index] = { ...dishes[index], ...updates };
    updateCurrentCategory({ signatureDishes: dishes });
  };

  const handleMoveDish = (index: number, direction: -1 | 1) => {
    if (!currentCategory) return;
    const dishes = [...(currentCategory.signatureDishes || [])];
    const target = index + direction;
    if (target < 0 || target >= dishes.length) return;
    [dishes[index], dishes[target]] = [dishes[target], dishes[index]];
    updateCurrentCategory({ signatureDishes: dishes });
  };

  const handleRemoveDish = (index: number) => {
    if (!currentCategory) return;
    if (!window.confirm('Remove this dish? The change is published when you save the category.')) return;
    updateCurrentCategory({
      signatureDishes: (currentCategory.signatureDishes || []).filter((_, i) => i !== index),
    });
  };

  if (loading && !config) {
    return (
      <div className="p-12 text-center text-adm-muted font-mono text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-adm-accent" />
        Loading Dining & Menu CMS...
      </div>
    );
  }

  if (!config) {
    return (
      <div className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-800/60 text-red-200 text-xs font-mono flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}
        <button
          type="button"
          onClick={loadData}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-adm-raised hover:bg-adm-line border border-adm-line-strong text-xs font-mono text-adm-text"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const sectionVisible = config.visible !== false;
  const orderedSaved = sortByOrder(savedCategories);
  const currentIndex = orderedSaved.findIndex((c) => c.id === selectedCatId);

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-adm-line pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono tracking-widest uppercase text-adm-accent mb-1">
            <UtensilsCrossed className="w-4 h-4" />
            <span>CULINARY & TASTING MENU CMS</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-adm-text">Dining & Menus Editor</h1>
          <p className="text-xs sm:text-sm text-adm-muted mt-1">
            Manage the dining section text, garden story, dining moments, menu categories, dishes, prices and dietary tags.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => updateConfig({ visible: !sectionVisible })}
            className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-mono border transition-colors ${
              sectionVisible
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                : 'bg-zinc-900 text-zinc-500 border-zinc-800'
            }`}
            title="Applied when you click Save Narrative & Moments"
          >
            {sectionVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{sectionVisible ? 'Section Visible' : 'Section Hidden'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveConfig()}
            disabled={saving}
            className="inline-flex items-center space-x-2 px-5 py-2 rounded-lg bg-adm-accent-fill hover:bg-adm-accent-hover text-adm-on-accent text-xs font-mono font-bold uppercase transition-colors shadow-md cursor-pointer disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Narrative & Moments'}</span>
          </button>
        </div>
      </div>

      {/* Guidance */}
      <div className="p-4 rounded-xl bg-adm-surface border border-adm-accent/30 flex items-start space-x-3 text-xs">
        <UtensilsCrossed className="w-5 h-5 text-adm-accent shrink-0 mt-0.5" />
        <p className="text-adm-muted leading-relaxed">
          This content appears in the Dining section on the homepage and on the /dining page. Text left empty, or left
          at the original English wording, is shown in each visitor's language using the built-in translations.
          Sections 01–03 are published with <strong>Save Narrative & Moments</strong>; each menu category is published
          with its own <strong>Save Category</strong> button.
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-800/60 text-red-200 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSaveConfig} className="space-y-6">
        {/* Part 1: Section header */}
        <div className="p-5 rounded-xl bg-adm-panel border border-adm-line space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono uppercase text-adm-accent border-b border-adm-line pb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>01 — Section Header & Introduction</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Eyebrow</label>
              <input
                type="text"
                value={config.eyebrow || ''}
                onChange={(e) => updateConfig({ eyebrow: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Heading</label>
              <input
                type="text"
                value={config.heading || ''}
                onChange={(e) => updateConfig({ heading: e.target.value })}
                className={`${inputClass} font-serif`}
              />
            </div>
            <div>
              <label className={labelClass}>Subheading</label>
              <input
                type="text"
                value={config.subhead || ''}
                onChange={(e) => updateConfig({ subhead: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Introduction</label>
            <textarea
              rows={3}
              value={config.intro || ''}
              onChange={(e) => updateConfig({ intro: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        {/* Part 2: Garden story */}
        <div className="p-5 rounded-xl bg-adm-panel border border-adm-line space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono uppercase text-adm-accent border-b border-adm-line pb-2">
            <Leaf className="w-3.5 h-3.5" />
            <span>02 — Garden Story ("From Our Garden to Your Table")</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Garden Eyebrow</label>
              <input
                type="text"
                value={config.gardenEyebrow || ''}
                onChange={(e) => updateConfig({ gardenEyebrow: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Image Badge</label>
              <input
                type="text"
                value={config.gardenBadge || ''}
                onChange={(e) => updateConfig({ gardenBadge: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Garden Title</label>
              <input
                type="text"
                value={config.gardenTitle || ''}
                onChange={(e) => updateConfig({ gardenTitle: e.target.value })}
                className={`${inputClass} font-serif`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Garden Description</label>
              <textarea
                rows={4}
                value={config.gardenDesc || ''}
                onChange={(e) => updateConfig({ gardenDesc: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Second Paragraph (optional)</label>
              <textarea
                rows={4}
                value={config.gardenDesc2 || ''}
                onChange={(e) => updateConfig({ gardenDesc2: e.target.value })}
                className={inputClass}
              />
              <span className={hintClass}>Shown below the description only when filled in.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Tag 1 (Zero Food Miles)</label>
              <input
                type="text"
                value={config.tagZeroMiles || ''}
                onChange={(e) => updateConfig({ tagZeroMiles: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Tag 2 (Spices)</label>
              <input
                type="text"
                value={config.tagSpices || ''}
                onChange={(e) => updateConfig({ tagSpices: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Tag 3 (Seafood)</label>
              <input
                type="text"
                value={config.tagSeafood || ''}
                onChange={(e) => updateConfig({ tagSeafood: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Garden Image URL</label>
            <input
              type="text"
              value={config.gardenImage || ''}
              onChange={(e) => updateConfig({ gardenImage: e.target.value })}
              className={`${inputClass} font-mono text-[11px]`}
              placeholder="https://... (leave empty to keep the default garden photo)"
            />
            <ImagePreview url={config.gardenImage} alt="Garden image preview" />
          </div>
        </div>

        {/* Part 3: Dining moments */}
        <div className="p-5 rounded-xl bg-adm-panel border border-adm-line space-y-4">
          <div className="flex items-center justify-between border-b border-adm-line pb-3">
            <div className="flex items-center space-x-2 text-xs font-mono uppercase text-adm-accent">
              <Clock className="w-3.5 h-3.5" />
              <span>03 — Dining Throughout the Day ({config.moments.length} Moments)</span>
            </div>
            <button
              type="button"
              onClick={addMoment}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-adm-raised hover:bg-adm-line border border-adm-line-strong text-xs font-mono text-adm-accent cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Moment</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Moments Eyebrow</label>
              <input
                type="text"
                value={config.momentsEyebrow || ''}
                onChange={(e) => updateConfig({ momentsEyebrow: e.target.value })}
                className={inputClass}
                placeholder="Leave empty to use the built-in translated text"
              />
            </div>
            <div>
              <label className={labelClass}>Moments Title</label>
              <input
                type="text"
                value={config.momentsTitle || ''}
                onChange={(e) => updateConfig({ momentsTitle: e.target.value })}
                className={`${inputClass} font-serif`}
                placeholder="Leave empty to use the built-in translated text"
              />
            </div>
          </div>

          {config.moments.length === 0 && (
            <div className="p-4 rounded-lg bg-adm-bg border border-dashed border-adm-line text-xs text-adm-muted text-center">
              No dining moments saved. While this list is empty the website shows the built-in, translated moments.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {config.moments.map((moment, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-adm-bg border border-adm-line space-y-3">
                <div className="flex items-center justify-between border-b border-adm-raised pb-2">
                  <span className="text-[10px] font-mono text-adm-accent uppercase">Moment {idx + 1}</span>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => moveMoment(idx, -1)}
                      disabled={idx === 0}
                      className="p-1 rounded bg-adm-surface border border-adm-line text-adm-muted hover:text-adm-text disabled:opacity-30"
                      title="Move up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveMoment(idx, 1)}
                      disabled={idx === config.moments.length - 1}
                      className="p-1 rounded bg-adm-surface border border-adm-line text-adm-muted hover:text-adm-text disabled:opacity-30"
                      title="Move down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeMoment(idx)}
                      className="p-1 rounded bg-red-950/30 border border-red-800/40 text-red-400 hover:text-red-200"
                      title="Remove moment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className={smallLabelClass}>Title</label>
                  <input
                    type="text"
                    value={moment.title || ''}
                    onChange={(e) => updateMoment(idx, { title: e.target.value })}
                    className={`${smallInputClass} font-serif`}
                  />
                </div>

                <div>
                  <label className={smallLabelClass}>Service Time</label>
                  <input
                    type="text"
                    value={moment.time || ''}
                    onChange={(e) => updateMoment(idx, { time: e.target.value })}
                    className={`${smallInputClass} font-mono text-[11px]`}
                  />
                </div>

                <div>
                  <label className={smallLabelClass}>Description</label>
                  <textarea
                    rows={3}
                    value={moment.desc || ''}
                    onChange={(e) => updateMoment(idx, { desc: e.target.value })}
                    className={smallInputClass}
                  />
                </div>

                <div>
                  <label className={smallLabelClass}>Image URL (optional)</label>
                  <input
                    type="text"
                    value={moment.image || ''}
                    onChange={(e) => updateMoment(idx, { image: e.target.value })}
                    className={`${smallInputClass} font-mono text-[10px]`}
                    placeholder="https://..."
                  />
                  {moment.image && <ImagePreview url={moment.image} alt={moment.title} className="w-full h-24" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Part 4: Heritage header */}
        <div className="p-5 rounded-xl bg-adm-panel border border-adm-line space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono uppercase text-adm-accent border-b border-adm-line pb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>04 — Tasting Portfolio Header</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Heritage Eyebrow</label>
              <input
                type="text"
                value={config.heritageEyebrow || ''}
                onChange={(e) => updateConfig({ heritageEyebrow: e.target.value })}
                className={inputClass}
                placeholder="Leave empty to use the built-in translated text"
              />
            </div>
            <div>
              <label className={labelClass}>Heritage Title</label>
              <input
                type="text"
                value={config.heritageTitle || ''}
                onChange={(e) => updateConfig({ heritageTitle: e.target.value })}
                className={`${inputClass} font-serif`}
                placeholder="Leave empty to use the built-in translated text"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center space-x-2 px-5 py-2 rounded-lg bg-adm-accent-fill hover:bg-adm-accent-hover text-adm-on-accent text-xs font-mono font-bold uppercase transition-colors shadow-md cursor-pointer disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Narrative & Moments'}</span>
          </button>
        </div>
      </form>

      {/* Part 5: Menu Categories & Dishes */}
      <div className="p-5 rounded-xl bg-adm-panel border border-adm-line space-y-5">
        <div className="flex items-center justify-between border-b border-adm-line pb-3">
          <div className="flex items-center space-x-2 text-xs font-mono uppercase text-adm-accent">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>05 — Menu Categories & Dishes ({categories.length})</span>
          </div>

          <button
            type="button"
            onClick={handleAddCategory}
            disabled={saving}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-adm-raised hover:bg-adm-line border border-adm-line-strong text-xs font-mono text-adm-accent cursor-pointer disabled:opacity-60"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Category</span>
          </button>
        </div>

        {categories.length === 0 && (
          <div className="p-4 rounded-lg bg-adm-bg border border-dashed border-adm-line text-xs text-adm-muted text-center">
            No menu categories yet. While there are none, the website shows the built-in menu.
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCatId(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center space-x-2 cursor-pointer ${
                selectedCatId === cat.id
                  ? 'bg-adm-accent-fill text-adm-on-accent font-bold'
                  : 'bg-adm-surface text-adm-muted hover:text-adm-text border border-adm-line'
              }`}
            >
              {cat.visible === false && <EyeOff className="w-3 h-3" />}
              <span>{cat.tabLabel || cat.name || 'Untitled'}</span>
              <span className="text-[10px] opacity-75">({(cat.signatureDishes || []).length})</span>
            </button>
          ))}
        </div>

        {/* Selected Category Editor */}
        {currentCategory && (
          <div className="p-5 rounded-xl bg-adm-bg border border-adm-line space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-adm-raised pb-3">
              <div>
                <span className="text-[10px] font-mono text-adm-accent uppercase flex items-center space-x-2">
                  <span>Menu Category</span>
                  {currentDirty && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-950/40 border border-amber-800/50 text-amber-300 normal-case">
                      Unsaved changes
                    </span>
                  )}
                </span>
                <h3 className="font-serif text-lg text-adm-text">{currentCategory.name || 'Untitled category'}</h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMoveCategory(-1)}
                  disabled={saving || currentIndex <= 0}
                  className="p-1.5 rounded bg-adm-surface border border-adm-line text-adm-muted hover:text-adm-text disabled:opacity-30"
                  title="Move tab left (saves immediately)"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveCategory(1)}
                  disabled={saving || currentIndex < 0 || currentIndex >= orderedSaved.length - 1}
                  className="p-1.5 rounded bg-adm-surface border border-adm-line text-adm-muted hover:text-adm-text disabled:opacity-30"
                  title="Move tab right (saves immediately)"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleToggleCategoryVisibility}
                  disabled={saving || !savedCurrent}
                  className={`px-3 py-1.5 rounded border text-xs font-mono flex items-center space-x-1.5 disabled:opacity-60 ${
                    savedCurrent?.visible !== false
                      ? 'bg-emerald-950/30 text-emerald-300 border-emerald-800/50'
                      : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                  }`}
                  title="Show or hide this category on the website (saves immediately)"
                >
                  {savedCurrent?.visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{savedCurrent?.visible !== false ? 'Visible' : 'Hidden'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(currentCategory)}
                  disabled={saving}
                  className="px-3 py-1.5 rounded bg-red-950/30 border border-red-800/40 text-red-400 hover:text-red-200 text-xs font-mono flex items-center space-x-1.5 disabled:opacity-60"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveCategory}
                  disabled={saving}
                  className="px-4 py-1.5 rounded bg-adm-accent-fill hover:bg-adm-accent-hover text-adm-on-accent text-xs font-mono font-bold flex items-center space-x-1.5 disabled:opacity-60"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Category'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <label className={smallLabelClass}>Category Name</label>
                <input
                  type="text"
                  value={currentCategory.name || ''}
                  onChange={(e) => updateCurrentCategory({ name: e.target.value })}
                  className={`${smallInputClass} font-serif`}
                />
              </div>
              <div>
                <label className={smallLabelClass}>Tab Label</label>
                <input
                  type="text"
                  value={currentCategory.tabLabel || ''}
                  onChange={(e) => updateCurrentCategory({ tabLabel: e.target.value })}
                  className={smallInputClass}
                  placeholder="Short label on the tab"
                />
              </div>
              <div>
                <label className={smallLabelClass}>Display Order</label>
                <input
                  type="number"
                  value={Number.isFinite(Number(currentCategory.order)) ? currentCategory.order : 0}
                  onChange={(e) => updateCurrentCategory({ order: Number(e.target.value) || 0 })}
                  className={`${smallInputClass} font-mono`}
                />
              </div>
            </div>

            <div>
              <label className={smallLabelClass}>Subtitle</label>
              <input
                type="text"
                value={currentCategory.subtitle || ''}
                onChange={(e) => updateCurrentCategory({ subtitle: e.target.value })}
                className={smallInputClass}
              />
            </div>

            <div>
              <label className={smallLabelClass}>Description</label>
              <textarea
                rows={3}
                value={currentCategory.description || ''}
                onChange={(e) => updateCurrentCategory({ description: e.target.value })}
                className={smallInputClass}
              />
            </div>

            <div>
              <label className={smallLabelClass}>Category Image URL</label>
              <input
                type="text"
                value={currentCategory.imageUrl || ''}
                onChange={(e) => updateCurrentCategory({ imageUrl: e.target.value })}
                className={`${smallInputClass} font-mono text-[11px]`}
                placeholder="https://..."
              />
              <ImagePreview url={currentCategory.imageUrl} alt={currentCategory.name} />
            </div>

            {/* Dishes list */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-adm-accent uppercase">
                  Signature Dishes ({(currentCategory.signatureDishes || []).length})
                </span>
                <button
                  type="button"
                  onClick={handleAddDish}
                  className="inline-flex items-center space-x-1 text-xs font-mono text-adm-accent hover:text-adm-text"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Dish</span>
                </button>
              </div>

              {(currentCategory.signatureDishes || []).length === 0 && (
                <div className="p-3 rounded-lg bg-adm-surface border border-dashed border-adm-line text-xs text-adm-muted text-center">
                  No dishes in this category.
                </div>
              )}

              <div className="space-y-2.5">
                {(currentCategory.signatureDishes || []).map((item, idx, dishes) => (
                  <div
                    key={item.id || idx}
                    className={`p-3.5 rounded-lg bg-adm-surface border border-adm-line space-y-2.5 ${
                      item.visible === false ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-2.5">
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-mono text-adm-faint uppercase">Dish Name</label>
                        <input
                          type="text"
                          value={item.name || ''}
                          onChange={(e) => handleUpdateDish(idx, { name: e.target.value })}
                          className="w-full px-2 py-1 bg-adm-bg border border-adm-line rounded text-xs text-adm-text font-serif focus:border-adm-accent outline-none"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-mono text-adm-faint uppercase">Price (optional)</label>
                        <input
                          type="text"
                          value={item.price || ''}
                          onChange={(e) => handleUpdateDish(idx, { price: e.target.value })}
                          className="w-full px-2 py-1 bg-adm-bg border border-adm-line rounded text-xs text-adm-text font-mono focus:border-adm-accent outline-none"
                          placeholder="e.g. $28 — empty shows 'A La Carte'"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-mono text-adm-faint uppercase">Dietary (optional)</label>
                        <input
                          type="text"
                          value={item.dietary || ''}
                          onChange={(e) => handleUpdateDish(idx, { dietary: e.target.value })}
                          className="w-full px-2 py-1 bg-adm-bg border border-adm-line rounded text-xs text-adm-text font-mono focus:border-adm-accent outline-none"
                          placeholder="GF, DF, VG"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end gap-2.5">
                      <div className="flex-1">
                        <label className="block text-[10px] font-mono text-adm-faint uppercase">Description</label>
                        <textarea
                          rows={2}
                          value={item.description || ''}
                          onChange={(e) => handleUpdateDish(idx, { description: e.target.value })}
                          className="w-full px-2 py-1 bg-adm-bg border border-adm-line rounded text-xs text-adm-text focus:border-adm-accent outline-none"
                        />
                      </div>
                      <div className="flex items-center space-x-1 self-end">
                        <button
                          type="button"
                          onClick={() => handleMoveDish(idx, -1)}
                          disabled={idx === 0}
                          className="p-1.5 rounded bg-adm-bg border border-adm-line text-adm-muted hover:text-adm-text disabled:opacity-30"
                          title="Move up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDish(idx, 1)}
                          disabled={idx === dishes.length - 1}
                          className="p-1.5 rounded bg-adm-bg border border-adm-line text-adm-muted hover:text-adm-text disabled:opacity-30"
                          title="Move down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateDish(idx, { visible: item.visible === false })}
                          className={`p-1.5 rounded border ${
                            item.visible !== false
                              ? 'bg-emerald-950/30 text-emerald-300 border-emerald-800/50'
                              : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                          }`}
                          title={item.visible !== false ? 'Dish visible (save category to apply)' : 'Dish hidden (save category to apply)'}
                        >
                          {item.visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveDish(idx)}
                          className="p-1.5 rounded bg-red-950/30 border border-red-800/40 text-red-400 hover:text-red-200"
                          title="Remove dish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
