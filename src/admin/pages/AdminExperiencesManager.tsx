import React, { useState, useEffect } from 'react';
import {
  Compass,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Clock,
  Tag,
  X,
} from 'lucide-react';
import { contentApi, ExperienceModel } from '../../services/contentApi';
import { EXPERIENCES_UI_TRANSLATIONS } from '../../data/experienceTranslations';

/** Category keys used by the public Experiences filter (labels are the English filter labels). */
const enUi = EXPERIENCES_UI_TRANSLATIONS.en;
const CATEGORY_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'cultural', label: enUi.culturalCategory },
  { value: 'marine', label: enUi.marineCategory },
  { value: 'sailing', label: enUi.sailingCategory },
  { value: 'nature', label: enUi.natureCategory },
  { value: 'adventure', label: enUi.adventureCategory },
];
const categoryLabel = (value: string | undefined) =>
  CATEGORY_OPTIONS.find((c) => c.value === value)?.label || value || 'Uncategorized';

/** Old field names from the previous editor; never sent back to the server. */
const LEGACY_KEYS = ['image', 'location', 'time', 'highlight'];

/** The form edits a full record; `id` is empty while creating (the server assigns it). */
type ExperienceForm = ExperienceModel;

const EMPTY_FORM: ExperienceForm = {
  id: '',
  title: '',
  category: 'cultural',
  duration: '',
  tag: '',
  priceNote: '',
  shortDescription: '',
  description: '',
  imageUrl: '',
  whatsappMessage: '',
  order: 0,
  visible: true,
};

const inputClass =
  'w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs text-adm-text focus:border-adm-accent outline-none';
const labelClass = 'block text-xs font-mono text-adm-text-2 uppercase mb-1';
const hintClass = 'text-[10px] text-adm-faint block mt-1';

const sortByOrder = (items: ExperienceModel[]) =>
  [...items].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

/** Older rows may still carry the image under the legacy `image` key. */
const imageOf = (item: Partial<ExperienceModel>) => item.imageUrl || (typeof item.image === 'string' ? item.image : '') || '';

const toPayload = (form: ExperienceForm): Partial<ExperienceModel> => {
  const payload: Record<string, any> = { ...form, imageUrl: imageOf(form), order: Number(form.order) || 0 };
  LEGACY_KEYS.forEach((key) => delete payload[key]);
  delete payload.id;
  delete payload.updatedAt;
  delete payload.updatedBy;
  return payload as Partial<ExperienceModel>;
};

export const AdminExperiencesManager: React.FC = () => {
  const [experiences, setExperiences] = useState<ExperienceModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExperienceModel | null>(null);
  const [formData, setFormData] = useState<ExperienceForm>(EMPTY_FORM);
  const [previewFailed, setPreviewFailed] = useState(false);

  const loadExperiences = async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await contentApi.getAdminExperiences();
      setExperiences(sortByOrder(items));
    } catch (err: any) {
      setError(err.message || 'Failed to load experiences.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExperiences();
  }, []);

  useEffect(() => setPreviewFailed(false), [formData.imageUrl]);

  const flash = (message: string) => {
    setError(null);
    setSuccess(message);
  };

  const handleOpenCreate = () => {
    const maxOrder = experiences.reduce((max, e) => Math.max(max, Number(e.order) || 0), 0);
    setEditingItem(null);
    setError(null);
    setFormData({ ...EMPTY_FORM, order: maxOrder + 1 });
    setModalOpen(true);
  };

  const handleOpenEdit = (item: ExperienceModel) => {
    setEditingItem(item);
    setError(null);
    setFormData({
      ...EMPTY_FORM,
      ...item,
      imageUrl: imageOf(item),
      visible: item.visible !== false,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('The experience title is required.');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (editingItem) {
        const saved = await contentApi.updateAdminExperience(editingItem.id, toPayload(formData));
        setExperiences((list) => sortByOrder(list.map((exp) => (exp.id === saved.id ? saved : exp))));
        flash(`Updated experience "${saved.title}".`);
      } else {
        const created = await contentApi.createAdminExperience(toPayload(formData));
        flash(`Created experience "${created.title}".`);
        await loadExperiences();
      }

      setModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save experience.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: ExperienceModel) => {
    if (!window.confirm(`Delete the experience "${item.title}"? This cannot be undone.`)) return;
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await contentApi.deleteAdminExperience(item.id);
      setExperiences((list) => list.filter((exp) => exp.id !== item.id));
      flash(`Deleted experience "${item.title}".`);
    } catch (err: any) {
      setError(err.message || 'Failed to delete experience.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisibility = async (item: ExperienceModel) => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const nextVisible = item.visible === false;
      const saved = await contentApi.updateAdminExperience(item.id, toPayload({ ...item, visible: nextVisible }));
      setExperiences((list) => list.map((exp) => (exp.id === saved.id ? saved : exp)));
      flash(`"${saved.title}" is now ${saved.visible !== false ? 'visible' : 'hidden'} on the website.`);
    } catch (err: any) {
      setError(err.message || 'Failed to change visibility.');
    } finally {
      setSaving(false);
    }
  };

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= experiences.length) return;

    const swapped = [...experiences];
    [swapped[index], swapped[targetIndex]] = [swapped[targetIndex], swapped[index]];
    const renumbered = swapped.map((item, idx) => ({ ...item, order: idx + 1 }));
    const changed = renumbered.filter((item) => experiences.find((e) => e.id === item.id)?.order !== item.order);

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const results = await Promise.all(
        changed.map((item) => contentApi.updateAdminExperience(item.id, toPayload(item)))
      );
      const byId = new Map(results.map((r) => [r.id, r]));
      setExperiences(sortByOrder(renumbered.map((item) => byId.get(item.id) || item)));
      flash('Experience order saved.');
    } catch (err: any) {
      setError(err.message || 'Failed to save the new order.');
      await loadExperiences();
    } finally {
      setSaving(false);
    }
  };

  const categoryIsKnown = CATEGORY_OPTIONS.some((c) => c.value === formData.category);

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-adm-line pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono tracking-widest uppercase text-adm-accent mb-1">
            <Compass className="w-4 h-4" />
            <span>CURATED ISLAND DISCOVERIES</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-adm-text">Experiences Manager</h1>
          <p className="text-xs sm:text-sm text-adm-muted mt-1">
            Manage the experience cards shown on the homepage and the /experiences page.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={loadExperiences}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-adm-raised hover:bg-adm-line border border-adm-line-strong text-xs font-mono text-adm-text disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-adm-accent-fill hover:bg-adm-accent-hover text-adm-on-accent text-xs font-mono font-bold uppercase transition-colors shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Experience</span>
          </button>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-adm-surface border border-adm-accent/30 flex items-start space-x-3 text-xs">
        <Compass className="w-5 h-5 text-adm-accent shrink-0 mt-0.5" />
        <p className="text-adm-muted leading-relaxed">
          The category decides which filter tab an experience appears under. Text left at the original English wording
          is shown in each visitor's language using the built-in translations; edited text is shown as written.
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

      {/* Experiences Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading && experiences.length === 0 ? (
          <div className="col-span-full py-12 text-center text-adm-muted font-mono text-xs">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-adm-accent" />
            Loading experiences...
          </div>
        ) : experiences.length === 0 ? (
          <div className="col-span-full py-12 text-center text-adm-muted font-mono text-xs">
            No experiences configured. While the list is empty the website shows the built-in experiences.
          </div>
        ) : (
          experiences.map((exp, idx) => {
            const img = imageOf(exp);
            return (
              <div
                key={exp.id}
                className={`rounded-xl border bg-adm-panel overflow-hidden flex flex-col justify-between transition-all ${
                  exp.visible !== false ? 'border-adm-line hover:border-adm-line-strong' : 'border-adm-line/40 opacity-60'
                }`}
              >
                {/* Media Thumbnail */}
                <div className="relative h-44 bg-adm-bg">
                  {img ? (
                    <img src={img} alt={exp.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-adm-faint">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                    <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[10px] font-mono uppercase text-adm-accent border border-adm-accent/30">
                      {categoryLabel(exp.category)}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(exp)}
                      disabled={saving}
                      className="p-1 rounded bg-black/70 backdrop-blur-sm text-xs text-adm-text disabled:opacity-60"
                      title={exp.visible !== false ? 'Visible — click to hide' : 'Hidden — click to show'}
                    >
                      {exp.visible !== false ? (
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
                      )}
                    </button>
                  </div>
                  {exp.priceNote && (
                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/75 text-[10px] font-mono uppercase text-adm-text-2">
                      {exp.priceNote}
                    </div>
                  )}
                </div>

                {/* Content Body */}
                <div className="p-4 space-y-2 flex-1">
                  <h3 className="font-serif text-base text-adm-text leading-snug">{exp.title}</h3>
                  <p className="text-xs text-adm-muted line-clamp-2">{exp.shortDescription || exp.description}</p>

                  <div className="pt-2 flex flex-wrap gap-2 text-[10px] font-mono text-adm-text-2/80">
                    {exp.duration && (
                      <div className="flex items-center space-x-1 bg-adm-bg px-2 py-0.5 rounded border border-adm-line">
                        <Clock className="w-3 h-3 text-adm-accent" />
                        <span>{exp.duration}</span>
                      </div>
                    )}
                    {exp.tag && (
                      <div className="flex items-center space-x-1 bg-adm-bg px-2 py-0.5 rounded border border-adm-line">
                        <Tag className="w-3 h-3 text-adm-accent" />
                        <span>{exp.tag}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-3 border-t border-adm-line bg-adm-bg/50 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleReorder(idx, 'up')}
                      disabled={saving || idx === 0}
                      className="p-1 rounded bg-adm-surface border border-adm-line text-adm-muted hover:text-adm-text disabled:opacity-30"
                      title="Move up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReorder(idx, 'down')}
                      disabled={saving || idx === experiences.length - 1}
                      className="p-1 rounded bg-adm-surface border border-adm-line text-adm-muted hover:text-adm-text disabled:opacity-30"
                      title="Move down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <span className="pl-1 text-[10px] font-mono text-adm-faint">#{exp.order}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(exp)}
                      className="px-2.5 py-1 rounded bg-adm-raised hover:bg-adm-line border border-adm-line-strong text-xs font-mono text-adm-text flex items-center space-x-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(exp)}
                      disabled={saving}
                      className="p-1 rounded bg-red-950/30 border border-red-800/40 text-red-400 hover:text-red-200 disabled:opacity-60"
                      title="Delete experience"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Create / Edit Experience */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-adm-panel border border-adm-line rounded-xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-adm-line">
              <div>
                <h3 className="font-serif text-lg text-adm-text">
                  {editingItem ? 'Edit Experience' : 'Create Experience'}
                </h3>
                <p className="text-xs text-adm-muted">Card text, detail text, image and the concierge message.</p>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} className="text-adm-muted hover:text-adm-text">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className={labelClass}>Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`${inputClass} font-serif`}
                  placeholder="e.g. Kizimkazi Wild Dolphin Encounter"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Category (filter tab)</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={inputClass}
                  >
                    {!categoryIsKnown && formData.category && (
                      <option value={formData.category}>Old value: {formData.category} — please choose a tab</option>
                    )}
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Tag (image badge)</label>
                  <input
                    type="text"
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. Dolphin Experience"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className={`${inputClass} font-mono`}
                    placeholder="e.g. 3.5 Hours (Early Morning)"
                  />
                </div>

                <div>
                  <label className={labelClass}>Price Note</label>
                  <input
                    type="text"
                    value={formData.priceNote}
                    onChange={(e) => setFormData({ ...formData, priceNote: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. Price on Request"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Short Description (card)</label>
                <textarea
                  rows={2}
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Full Description (detail window)</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Image URL</label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className={`${inputClass} font-mono text-[11px]`}
                  placeholder="https://..."
                />
                <div className="mt-2 w-48 h-28 rounded-md overflow-hidden border border-adm-line bg-adm-bg flex items-center justify-center text-adm-faint">
                  {formData.imageUrl && !previewFailed ? (
                    <img
                      src={formData.imageUrl}
                      alt="Experience preview"
                      className="w-full h-full object-cover"
                      onError={() => setPreviewFailed(true)}
                    />
                  ) : (
                    <div className="flex flex-col items-center text-[9px] font-mono uppercase">
                      <ImageIcon className="w-5 h-5 mb-1" />
                      {formData.imageUrl ? 'Image failed to load' : 'No image'}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className={labelClass}>WhatsApp / Concierge Message</label>
                <textarea
                  rows={2}
                  value={formData.whatsappMessage || ''}
                  onChange={(e) => setFormData({ ...formData, whatsappMessage: e.target.value })}
                  className={inputClass}
                  placeholder="Hello Zanzirangi House Concierge, I am interested in..."
                />
                <span className={hintClass}>Pre-filled message used when a guest asks about this experience.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Display Order</label>
                  <input
                    type="number"
                    value={Number.isFinite(Number(formData.order)) ? formData.order : 0}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) || 0 })}
                    className={`${inputClass} font-mono`}
                  />
                </div>
                <div>
                  <label className={labelClass}>Visibility</label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, visible: !formData.visible })}
                    className={`w-full inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-mono border transition-colors ${
                      formData.visible
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                        : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                    }`}
                  >
                    {formData.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{formData.visible ? 'Visible on website' : 'Hidden from website'}</span>
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-200 text-xs font-mono flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-adm-line">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-adm-raised text-xs font-mono text-adm-muted hover:text-adm-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-adm-accent-fill hover:bg-adm-accent-hover text-adm-on-accent text-xs font-mono font-bold uppercase transition-colors disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Experience'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
