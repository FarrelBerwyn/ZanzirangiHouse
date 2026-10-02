import React, { useState, useEffect } from 'react';
import {
  Binoculars,
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
  Plane,
  MapPin,
  X,
} from 'lucide-react';
import { contentApi, SafariDestinationModel } from '../../services/contentApi';

/** Old field names from the previous editor; never sent back to the server. */
const LEGACY_KEYS = ['subtitle', 'driveTime', 'image', 'highlight', 'keySpecies'];

/** The form edits a full record; `id` is empty while creating (the server assigns it). */
type SafariForm = SafariDestinationModel;

const EMPTY_FORM: SafariForm = {
  id: '',
  name: '',
  tagline: '',
  region: '',
  flightTimeFromZanzibar: '',
  heroImage: '',
  description: '',
  highlights: [],
  bestFor: '',
  safariType: '',
  order: 0,
  visible: true,
};

const inputClass =
  'w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs text-adm-text focus:border-adm-accent outline-none';
const labelClass = 'block text-xs font-mono text-adm-text-2 uppercase mb-1';

const sortByOrder = (items: SafariDestinationModel[]) =>
  [...items].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

/** Older rows may still carry the image under the legacy `image` key. */
const imageOf = (item: Partial<SafariDestinationModel>) =>
  item.heroImage || (typeof item.image === 'string' ? item.image : '') || '';

const toPayload = (form: SafariForm): Partial<SafariDestinationModel> => {
  const payload: Record<string, any> = {
    ...form,
    heroImage: imageOf(form),
    highlights: (Array.isArray(form.highlights) ? form.highlights : []).map((h) => String(h).trim()).filter(Boolean),
    order: Number(form.order) || 0,
  };
  LEGACY_KEYS.forEach((key) => delete payload[key]);
  delete payload.id;
  delete payload.updatedAt;
  delete payload.updatedBy;
  return payload as Partial<SafariDestinationModel>;
};

export const AdminSafariManager: React.FC = () => {
  const [destinations, setDestinations] = useState<SafariDestinationModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SafariDestinationModel | null>(null);
  const [formData, setFormData] = useState<SafariForm>(EMPTY_FORM);
  const [previewFailed, setPreviewFailed] = useState(false);

  const loadDestinations = async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await contentApi.getAdminSafari();
      setDestinations(sortByOrder(items));
    } catch (err: any) {
      setError(err.message || 'Failed to load safari destinations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDestinations();
  }, []);

  useEffect(() => setPreviewFailed(false), [formData.heroImage]);

  const flash = (message: string) => {
    setError(null);
    setSuccess(message);
  };

  const handleOpenCreate = () => {
    const maxOrder = destinations.reduce((max, d) => Math.max(max, Number(d.order) || 0), 0);
    setEditingItem(null);
    setError(null);
    setFormData({ ...EMPTY_FORM, highlights: [''], order: maxOrder + 1 });
    setModalOpen(true);
  };

  const handleOpenEdit = (item: SafariDestinationModel) => {
    setEditingItem(item);
    setError(null);
    setFormData({
      ...EMPTY_FORM,
      ...item,
      heroImage: imageOf(item),
      highlights: Array.isArray(item.highlights) ? [...item.highlights] : [],
      visible: item.visible !== false,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('The destination name is required.');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (editingItem) {
        const saved = await contentApi.updateAdminSafariDestination(editingItem.id, toPayload(formData));
        setDestinations((list) => sortByOrder(list.map((d) => (d.id === saved.id ? saved : d))));
        flash(`Updated safari destination "${saved.name}".`);
      } else {
        const created = await contentApi.createAdminSafariDestination(toPayload(formData));
        flash(`Created safari destination "${created.name}".`);
        await loadDestinations();
      }

      setModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save safari destination.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: SafariDestinationModel) => {
    if (!window.confirm(`Delete the safari destination "${item.name}"? This cannot be undone.`)) return;
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await contentApi.deleteAdminSafariDestination(item.id);
      setDestinations((list) => list.filter((d) => d.id !== item.id));
      flash(`Deleted safari destination "${item.name}".`);
    } catch (err: any) {
      setError(err.message || 'Failed to delete safari destination.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisibility = async (item: SafariDestinationModel) => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const nextVisible = item.visible === false;
      const saved = await contentApi.updateAdminSafariDestination(item.id, toPayload({ ...item, visible: nextVisible }));
      setDestinations((list) => list.map((d) => (d.id === saved.id ? saved : d)));
      flash(`"${saved.name}" is now ${saved.visible !== false ? 'visible' : 'hidden'} on the website.`);
    } catch (err: any) {
      setError(err.message || 'Failed to change visibility.');
    } finally {
      setSaving(false);
    }
  };

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= destinations.length) return;

    const swapped = [...destinations];
    [swapped[index], swapped[targetIndex]] = [swapped[targetIndex], swapped[index]];
    const renumbered = swapped.map((item, idx) => ({ ...item, order: idx + 1 }));
    const changed = renumbered.filter((item) => destinations.find((d) => d.id === item.id)?.order !== item.order);

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const results = await Promise.all(
        changed.map((item) => contentApi.updateAdminSafariDestination(item.id, toPayload(item)))
      );
      const byId = new Map(results.map((r) => [r.id, r]));
      setDestinations(sortByOrder(renumbered.map((item) => byId.get(item.id) || item)));
      flash('Safari destination order saved.');
    } catch (err: any) {
      setError(err.message || 'Failed to save the new order.');
      await loadDestinations();
    } finally {
      setSaving(false);
    }
  };

  // --- Highlights list editing ---
  const updateHighlight = (index: number, value: string) => {
    const highlights = [...formData.highlights];
    highlights[index] = value;
    setFormData({ ...formData, highlights });
  };

  const addHighlight = () => setFormData({ ...formData, highlights: [...formData.highlights, ''] });

  const removeHighlight = (index: number) =>
    setFormData({ ...formData, highlights: formData.highlights.filter((_, i) => i !== index) });

  const moveHighlight = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= formData.highlights.length) return;
    const highlights = [...formData.highlights];
    [highlights[index], highlights[target]] = [highlights[target], highlights[index]];
    setFormData({ ...formData, highlights });
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-adm-line pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono tracking-widest uppercase text-adm-accent mb-1">
            <Binoculars className="w-4 h-4" />
            <span>TANZANIA MAINLAND EXPEDITIONS</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-adm-text">Beyond Zanzibar & Safari</h1>
          <p className="text-xs sm:text-sm text-adm-muted mt-1">
            Manage the safari destinations shown in "Beyond Zanzibar" on the homepage and the /safari page.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={loadDestinations}
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
            <span>Add Destination</span>
          </button>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-adm-surface border border-adm-accent/30 flex items-start space-x-3 text-xs">
        <Binoculars className="w-5 h-5 text-adm-accent shrink-0 mt-0.5" />
        <p className="text-adm-muted leading-relaxed">
          Each destination becomes a selector tab with a large photo and details. Text left at the original English
          wording is shown in each visitor's language using the built-in translations; edited text is shown as written.
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

      {/* Destinations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading && destinations.length === 0 ? (
          <div className="col-span-full py-12 text-center text-adm-muted font-mono text-xs">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-adm-accent" />
            Loading safari destinations...
          </div>
        ) : destinations.length === 0 ? (
          <div className="col-span-full py-12 text-center text-adm-muted font-mono text-xs">
            No safari destinations configured. While the list is empty the website shows the built-in destinations.
          </div>
        ) : (
          destinations.map((dest, idx) => {
            const img = imageOf(dest);
            const highlights = Array.isArray(dest.highlights) ? dest.highlights : [];
            return (
              <div
                key={dest.id}
                className={`rounded-xl border bg-adm-panel overflow-hidden flex flex-col justify-between transition-all ${
                  dest.visible !== false ? 'border-adm-line hover:border-adm-line-strong' : 'border-adm-line/40 opacity-60'
                }`}
              >
                {/* Media Thumbnail */}
                <div className="relative h-44 bg-adm-bg">
                  {img ? (
                    <img src={img} alt={dest.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-adm-faint">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                  {dest.region && (
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[10px] font-mono uppercase text-adm-accent border border-adm-accent/30 inline-flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{dest.region}</span>
                      </span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(dest)}
                      disabled={saving}
                      className="p-1 rounded bg-black/70 backdrop-blur-sm text-xs text-adm-text disabled:opacity-60"
                      title={dest.visible !== false ? 'Visible — click to hide' : 'Hidden — click to show'}
                    >
                      {dest.visible !== false ? (
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 space-y-2 flex-1">
                  <h3 className="font-serif text-base text-adm-text leading-snug">{dest.name}</h3>
                  {dest.tagline && <p className="text-[11px] text-adm-accent italic">{dest.tagline}</p>}
                  <p className="text-xs text-adm-muted line-clamp-2">{dest.description}</p>

                  <div className="pt-2 flex flex-col space-y-1.5 text-[11px] font-mono text-adm-text-2/80">
                    {dest.flightTimeFromZanzibar && (
                      <div className="flex items-center space-x-1.5 text-[10px]">
                        <Plane className="w-3 h-3 text-adm-accent" />
                        <span>{dest.flightTimeFromZanzibar}</span>
                      </div>
                    )}
                    {dest.safariType && <div className="text-[10px]">{dest.safariType}</div>}
                    {dest.bestFor && <div className="text-[10px] text-adm-accent italic">Best for: {dest.bestFor}</div>}
                  </div>

                  {highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {highlights.map((h, hIdx) => (
                        <span
                          key={hIdx}
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-adm-bg border border-adm-line text-adm-muted"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  )}
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
                      disabled={saving || idx === destinations.length - 1}
                      className="p-1 rounded bg-adm-surface border border-adm-line text-adm-muted hover:text-adm-text disabled:opacity-30"
                      title="Move down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <span className="pl-1 text-[10px] font-mono text-adm-faint">#{dest.order}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(dest)}
                      className="px-2.5 py-1 rounded bg-adm-raised hover:bg-adm-line border border-adm-line-strong text-xs font-mono text-adm-text flex items-center space-x-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(dest)}
                      disabled={saving}
                      className="p-1 rounded bg-red-950/30 border border-red-800/40 text-red-400 hover:text-red-200 disabled:opacity-60"
                      title="Delete destination"
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

      {/* Modal: Create / Edit Safari Destination */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-adm-panel border border-adm-line rounded-xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-adm-line">
              <div>
                <h3 className="font-serif text-lg text-adm-text">
                  {editingItem ? 'Edit Safari Destination' : 'Create Safari Destination'}
                </h3>
                <p className="text-xs text-adm-muted">Tab text, hero photo, flight time, highlights and description.</p>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} className="text-adm-muted hover:text-adm-text">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Destination Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`${inputClass} font-serif`}
                    placeholder="e.g. SERENGETI"
                  />
                </div>
                <div>
                  <label className={labelClass}>Tagline</label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. Wildlife & the Great Migration"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Region</label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. Northern Tanzania"
                  />
                </div>
                <div>
                  <label className={labelClass}>Flight Time from Zanzibar</label>
                  <input
                    type="text"
                    value={formData.flightTimeFromZanzibar}
                    onChange={(e) => setFormData({ ...formData, flightTimeFromZanzibar: e.target.value })}
                    className={`${inputClass} font-mono`}
                    placeholder="e.g. 1h 45m Direct Bush Plane"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Safari Type</label>
                  <input
                    type="text"
                    value={formData.safariType}
                    onChange={(e) => setFormData({ ...formData, safariType: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. Fly-in Bush Plane Safari"
                  />
                </div>
                <div>
                  <label className={labelClass}>Best For</label>
                  <input
                    type="text"
                    value={formData.bestFor}
                    onChange={(e) => setFormData({ ...formData, bestFor: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. Big Five sightings & wildlife spectacles"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Highlights ({formData.highlights.length})</label>
                  <button
                    type="button"
                    onClick={addHighlight}
                    className="inline-flex items-center space-x-1 text-xs font-mono text-adm-accent hover:text-adm-text"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Highlight</span>
                  </button>
                </div>
                {formData.highlights.length === 0 && (
                  <div className="p-3 rounded-lg bg-adm-bg border border-dashed border-adm-line text-[11px] text-adm-muted text-center">
                    No highlights. Built-in destinations then show their translated highlights.
                  </div>
                )}
                {formData.highlights.map((highlight, hIdx) => (
                  <div key={hIdx} className="flex items-center space-x-1.5">
                    <input
                      type="text"
                      value={highlight}
                      onChange={(e) => updateHighlight(hIdx, e.target.value)}
                      className={inputClass}
                      placeholder="e.g. Sunrise hot air balloon safaris"
                    />
                    <button
                      type="button"
                      onClick={() => moveHighlight(hIdx, -1)}
                      disabled={hIdx === 0}
                      className="p-1.5 rounded bg-adm-surface border border-adm-line text-adm-muted hover:text-adm-text disabled:opacity-30"
                      title="Move up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveHighlight(hIdx, 1)}
                      disabled={hIdx === formData.highlights.length - 1}
                      className="p-1.5 rounded bg-adm-surface border border-adm-line text-adm-muted hover:text-adm-text disabled:opacity-30"
                      title="Move down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeHighlight(hIdx)}
                      className="p-1.5 rounded bg-red-950/30 border border-red-800/40 text-red-400 hover:text-red-200"
                      title="Remove highlight"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className={labelClass}>Hero Image URL</label>
                <input
                  type="text"
                  value={formData.heroImage}
                  onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
                  className={`${inputClass} font-mono text-[11px]`}
                  placeholder="https://..."
                />
                <div className="mt-2 w-48 h-28 rounded-md overflow-hidden border border-adm-line bg-adm-bg flex items-center justify-center text-adm-faint">
                  {formData.heroImage && !previewFailed ? (
                    <img
                      src={formData.heroImage}
                      alt="Destination preview"
                      className="w-full h-full object-cover"
                      onError={() => setPreviewFailed(true)}
                    />
                  ) : (
                    <div className="flex flex-col items-center text-[9px] font-mono uppercase">
                      <ImageIcon className="w-5 h-5 mb-1" />
                      {formData.heroImage ? 'Image failed to load' : 'No image'}
                    </div>
                  )}
                </div>
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
                  {saving ? 'Saving...' : 'Save Destination'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
