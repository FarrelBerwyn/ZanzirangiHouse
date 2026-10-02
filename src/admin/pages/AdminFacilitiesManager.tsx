import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  RefreshCw,
  Search,
  Save,
  X,
  Clock,
  Tag,
  UploadCloud,
  Loader2,
  ImageOff,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { contentApi, FacilityModel } from '../../services/contentApi';

/** Image types accepted by POST /api/admin/media/upload (images only here). */
const IMAGE_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
};
const MAX_IMAGE_MB = 25;

/** Icon names the public site / seed data use for facilities (free text is also accepted). */
const ICON_SUGGESTIONS = [
  'Sparkles',
  'Waves',
  'Flower2',
  'Dumbbell',
  'UtensilsCrossed',
  'Coffee',
  'Wine',
  'Sun',
  'Palmtree',
  'Leaf',
  'Wifi',
  'Car',
  'Bath',
  'BedDouble',
  'Heart',
];

type FacilityDraft = Omit<FacilityModel, 'id'> & { id?: string };

const EMPTY_DRAFT: FacilityDraft = {
  title: '',
  category: '',
  description: '',
  image: '',
  hours: '',
  highlight: '',
  icon: '',
  order: 1,
  visible: true,
};

const sortByOrder = (list: FacilityModel[]) =>
  [...list].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

export const AdminFacilitiesManager: React.FC = () => {
  const [facilities, setFacilities] = useState<FacilityModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [editingFacility, setEditingFacility] = useState<FacilityDraft | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageBroken, setImageBroken] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<FacilityModel | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const notifyTimer = useRef<number | undefined>(undefined);
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    window.clearTimeout(notifyTimer.current);
    // Errors stay until dismissed; success messages fade out.
    if (type === 'success') notifyTimer.current = window.setTimeout(() => setNotification(null), 4000);
  };

  const loadFacilities = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const data = await contentApi.getAdminFacilities();
      setFacilities(sortByOrder(Array.isArray(data) ? data : []));
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to retrieve facilities.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFacilities();
    return () => window.clearTimeout(notifyTimer.current);
  }, []);

  const handleOpenAdd = () => {
    const maxOrder = facilities.reduce((m, f) => Math.max(m, Number(f.order) || 0), 0);
    setEditingFacility({ ...EMPTY_DRAFT, order: maxOrder + 1 });
    setIsNew(true);
    setFormError(null);
    setImageBroken(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (f: FacilityModel) => {
    setEditingFacility({ ...EMPTY_DRAFT, ...f, icon: f.icon || '' });
    setIsNew(false);
    setFormError(null);
    setImageBroken(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving || isUploadingImage) return;
    setIsModalOpen(false);
    setEditingFacility(null);
    setFormError(null);
  };

  const patchDraft = (patch: Partial<FacilityDraft>) =>
    setEditingFacility((prev) => (prev ? { ...prev, ...patch } : prev));

  const handleSaveFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFacility) return;
    const title = editingFacility.title.trim();
    if (!title) {
      setFormError('A title is required.');
      return;
    }
    const order = Number(editingFacility.order);
    if (!Number.isFinite(order)) {
      setFormError('Display order must be a number.');
      return;
    }
    // Only the facility model fields; the server keeps any other stored fields on update.
    const payload: Partial<FacilityModel> = {
      title,
      category: editingFacility.category.trim(),
      description: editingFacility.description.trim(),
      hours: editingFacility.hours.trim(),
      highlight: editingFacility.highlight.trim(),
      image: editingFacility.image.trim(),
      // New facilities without an icon get the server default; on edit an empty value clears it.
      icon: (editingFacility.icon || '').trim() || (isNew ? undefined : ''),
      order,
      visible: !!editingFacility.visible,
    };
    try {
      setIsSaving(true);
      setFormError(null);
      if (isNew) {
        const created = await contentApi.createFacility(payload);
        showNotification('success', `Created "${created?.title || title}".`);
      } else {
        await contentApi.updateFacility(editingFacility.id!, payload);
        showNotification('success', `Updated "${title}".`);
      }
      setIsModalOpen(false);
      setEditingFacility(null);
      await loadFacilities();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save facility.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageFile = async (file: File | undefined) => {
    if (!file) return;
    const dot = file.name.lastIndexOf('.');
    const ext = dot >= 0 ? file.name.slice(dot).toLowerCase() : '';
    const expected = IMAGE_TYPES[ext];
    if (!expected) {
      setFormError(`"${file.name}" is not a supported image. Use JPG, PNG, WebP, GIF or AVIF.`);
      return;
    }
    if (file.type && file.type !== expected) {
      setFormError(`"${file.name}": the extension ${ext} does not match the file type (${file.type}).`);
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setFormError(`"${file.name}" is larger than ${MAX_IMAGE_MB} MB.`);
      return;
    }
    const upload = file.type ? file : new File([file], file.name, { type: expected });
    try {
      setIsUploadingImage(true);
      setFormError(null);
      const asset = await contentApi.uploadMediaFile(upload, editingFacility?.title?.trim() || undefined);
      if (!asset?.url) throw new Error('The server did not return a URL for the uploaded image.');
      patchDraft({ image: asset.url });
      setImageBroken(false);
    } catch (err: any) {
      setFormError(`Image upload failed: ${err?.message || 'unknown error'}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      setDeleteError(null);
      await contentApi.deleteFacility(deleteTarget.id);
      showNotification('success', `Deleted "${deleteTarget.title}".`);
      setDeleteTarget(null);
      await loadFacilities();
    } catch (err: any) {
      setDeleteError(err?.message || 'Failed to delete facility.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleVisible = async (f: FacilityModel) => {
    try {
      setBusyId(f.id);
      const nextStatus = !f.visible;
      await contentApi.updateFacility(f.id, { visible: nextStatus });
      setFacilities((prev) =>
        prev.map((item) => (item.id === f.id ? { ...item, visible: nextStatus } : item))
      );
      showNotification('success', `"${f.title}" is now ${nextStatus ? 'visible' : 'hidden'} on the website.`);
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to update visibility.');
    } finally {
      setBusyId(null);
    }
  };

  /** Swaps the order value with the neighbour so the public list order changes. */
  const handleMove = async (f: FacilityModel, direction: -1 | 1) => {
    const sorted = sortByOrder(facilities);
    const idx = sorted.findIndex((x) => x.id === f.id);
    const other = sorted[idx + direction];
    if (!other) return;
    const a = Number(f.order) || 0;
    let b = Number(other.order) || 0;
    if (a === b) b = a + direction; // equal values: nudge so the swap actually reorders
    try {
      setBusyId(f.id);
      await contentApi.updateFacility(f.id, { order: b });
      await contentApi.updateFacility(other.id, { order: a });
      await loadFacilities();
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to reorder facilities.');
      await loadFacilities();
    } finally {
      setBusyId(null);
    }
  };

  const query = searchQuery.trim().toLowerCase();
  const visibleList = facilities.filter(
    (f) =>
      !query ||
      (f.title || '').toLowerCase().includes(query) ||
      (f.category || '').toLowerCase().includes(query) ||
      (f.description || '').toLowerCase().includes(query)
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-adm-line gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-adm-accent">
              ESTATE AMENITIES
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-emerald-950/60 border border-emerald-700/60 text-emerald-300">
              LIVE
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-adm-text tracking-wide mt-1">
            Facilities & Wellness Manager
          </h1>
          <p className="text-xs text-adm-muted mt-0.5">
            Manage infinity pools, dining pavilions, Swahili botanical spa, and estate amenities.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={loadFacilities}
            disabled={isLoading}
            className="p-2.5 rounded-lg bg-adm-surface border border-adm-line text-adm-muted hover:text-adm-text cursor-pointer disabled:opacity-50"
            title="Reload facilities"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            disabled={isLoading || !!loadError}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-adm-accent-fill hover:bg-adm-accent-hover text-adm-on-accent text-xs font-mono uppercase tracking-widest font-bold shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>Add Facility</span>
          </button>
        </div>
      </div>

      {notification && (
        <div
          className={`p-3.5 rounded-lg text-xs font-mono flex items-start justify-between gap-3 border ${
            notification.type === 'success'
              ? 'bg-emerald-950/40 text-emerald-200 border-emerald-800/60'
              : 'bg-red-950/40 text-red-200 border-red-800/60'
          }`}
        >
          <div className="flex items-start space-x-2">
            {notification.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            )}
            <span>{notification.message}</span>
          </div>
          <button type="button" onClick={() => setNotification(null)} className="opacity-70 hover:opacity-100 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {!isLoading && !loadError && facilities.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-adm-muted" />
            <input
              type="text"
              placeholder="Search by title, category or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
            />
          </div>
          <span className="text-[11px] font-mono text-adm-muted sm:ml-auto">
            {facilities.filter((f) => f.visible).length} visible &middot; {facilities.length} total
          </span>
        </div>
      )}

      {isLoading && facilities.length === 0 ? (
        <div className="py-24 text-center">
          <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-adm-accent" />
          <p className="font-mono text-xs uppercase tracking-widest text-adm-text-2">Loading Facilities...</p>
        </div>
      ) : loadError ? (
        <div className="py-12 text-center bg-adm-panel rounded-xl border border-red-800/50">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-400" />
          <p className="text-sm text-adm-text">Could not load facilities</p>
          <p className="text-xs font-mono text-red-300 mt-1">{loadError}</p>
          <button
            type="button"
            onClick={loadFacilities}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-adm-raised text-xs font-mono text-adm-text-2 hover:text-adm-text cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try again
          </button>
        </div>
      ) : visibleList.length === 0 ? (
        <div className="py-16 text-center bg-adm-panel rounded-xl border border-adm-line">
          <p className="text-sm font-serif text-adm-text">
            {facilities.length === 0 ? 'No facilities yet' : 'No facilities match your search'}
          </p>
          {facilities.length === 0 && (
            <p className="text-xs text-adm-muted mt-1">Use "Add Facility" to create the first one.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleList.map((fac) => {
            const sortedIdx = facilities.findIndex((x) => x.id === fac.id);
            const isBusy = busyId === fac.id;
            return (
              <div
                key={fac.id}
                className={`bg-adm-panel rounded-xl border border-adm-line overflow-hidden flex flex-col justify-between ${
                  fac.visible ? '' : 'opacity-70'
                }`}
              >
                <div>
                  <div className="relative h-40 bg-black/40 overflow-hidden">
                    {fac.image || fac.imageUrl ? (
                      <img
                        src={fac.image || fac.imageUrl}
                        alt={fac.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-adm-faint bg-adm-surface">
                        <ImageOff className="w-7 h-7" />
                        <span className="text-[10px] font-mono mt-1">No image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-adm-panel via-transparent to-black/30 pointer-events-none" />
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      {fac.category && (
                        <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[9px] font-mono uppercase text-adm-accent">
                          {fac.category}
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[9px] font-mono text-white/80">
                        #{fac.order}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <button
                        type="button"
                        onClick={() => handleToggleVisible(fac)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1 px-1.5 py-1 rounded bg-black/60 text-white text-[9px] font-mono uppercase cursor-pointer disabled:opacity-60"
                        title={fac.visible ? 'Visible on the website — click to hide' : 'Hidden — click to show on the website'}
                      >
                        {fac.visible ? (
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5 text-amber-500" />
                        )}
                        <span>{fac.visible ? 'Visible' : 'Hidden'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-serif text-lg text-adm-text leading-snug">{fac.title}</h3>
                    <p className="text-xs text-adm-muted line-clamp-3 leading-relaxed">
                      {fac.description || <span className="italic text-adm-faint">No description</span>}
                    </p>

                    <div className="pt-2 space-y-1 text-xs font-mono text-adm-text-2">
                      {fac.hours && (
                        <div className="flex items-center space-x-1.5">
                          <Clock className="w-3 h-3 text-adm-accent" />
                          <span className="text-[11px]">{fac.hours}</span>
                        </div>
                      )}
                      {fac.highlight && (
                        <div className="flex items-center space-x-1.5">
                          <Tag className="w-3 h-3 text-adm-accent" />
                          <span className="text-[11px] truncate">{fac.highlight}</span>
                        </div>
                      )}
                      {fac.icon && <div className="text-[10px] text-adm-faint">Icon: {fac.icon}</div>}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-adm-bg border-t border-adm-line flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMove(fac, -1)}
                      disabled={isBusy || !!query || sortedIdx <= 0}
                      className="p-1.5 rounded bg-adm-raised text-adm-text-2 hover:text-adm-text cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Move earlier"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(fac, 1)}
                      disabled={isBusy || !!query || sortedIdx === facilities.length - 1}
                      className="p-1.5 rounded bg-adm-raised text-adm-text-2 hover:text-adm-text cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Move later"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    {isBusy && <Loader2 className="w-3.5 h-3.5 animate-spin text-adm-accent" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(fac)}
                      className="px-3 py-1.5 rounded bg-adm-accent-fill hover:bg-adm-accent-hover text-adm-on-accent text-xs font-mono uppercase font-bold cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError(null);
                        setDeleteTarget(fac);
                      }}
                      className="p-1.5 rounded bg-red-950/40 text-red-200 hover:bg-red-900/50 cursor-pointer"
                      title="Delete facility"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-adm-panel border border-adm-line rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-adm-line flex items-center justify-between bg-adm-surface">
              <h2 className="font-serif text-lg text-adm-text">Delete facility?</h2>
              <button
                type="button"
                onClick={() => !isDeleting && setDeleteTarget(null)}
                className="p-1 text-adm-muted cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs text-adm-text-2">
              <p>
                <span className="text-adm-text font-semibold">{deleteTarget.title}</span> will be permanently removed
                from the website. This cannot be undone. To take it offline temporarily, hide it instead.
              </p>
              {deleteError && (
                <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/60 text-red-200 font-mono flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{deleteError}</span>
                </div>
              )}
              <div className="pt-3 border-t border-adm-line flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-lg bg-adm-raised text-xs font-mono text-adm-text-2 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-red-700 hover:bg-red-600 text-white text-xs font-mono uppercase font-bold cursor-pointer disabled:opacity-60"
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && editingFacility && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-adm-panel border border-adm-line rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            <div className="p-4 border-b border-adm-line flex items-center justify-between bg-adm-surface shrink-0">
              <h2 className="font-serif text-lg text-adm-text truncate pr-2">
                {isNew ? 'Add Facility' : `Edit: ${editingFacility.title || 'Facility'}`}
              </h2>
              <button type="button" onClick={closeModal} className="p-1 text-adm-muted cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFacility} className="p-5 space-y-3 overflow-y-auto">
              {formError && (
                <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/60 text-red-200 text-xs font-mono flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingFacility.title}
                    onChange={(e) => patchDraft({ title: e.target.value })}
                    placeholder="e.g. Oceanfront Infinity Pool"
                    className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-serif text-adm-text focus:border-adm-accent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    list="facility-category-options"
                    value={editingFacility.category}
                    onChange={(e) => patchDraft({ category: e.target.value })}
                    placeholder="e.g. Relaxation & Wellness"
                    className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
                  />
                  <datalist id="facility-category-options">
                    {Array.from(new Set(facilities.map((f) => f.category).filter(Boolean))).map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                  Image
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="w-full sm:w-44 h-28 rounded-lg overflow-hidden border border-adm-line bg-adm-bg shrink-0 flex items-center justify-center">
                    {editingFacility.image.trim() && !imageBroken ? (
                      <img
                        src={editingFacility.image.trim()}
                        alt="Facility preview"
                        className="w-full h-full object-cover"
                        onError={() => setImageBroken(true)}
                      />
                    ) : (
                      <div className="text-center text-adm-faint">
                        <ImageOff className="w-6 h-6 mx-auto" />
                        <span className="text-[10px] font-mono block mt-1">
                          {editingFacility.image.trim() ? 'Image could not load' : 'No image'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={editingFacility.image}
                      onChange={(e) => {
                        patchDraft({ image: e.target.value });
                        setImageBroken(false);
                      }}
                      placeholder="https://... or /uploads/..."
                      className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
                    />
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept={Object.keys(IMAGE_TYPES).join(',')}
                      className="hidden"
                      onChange={(e) => {
                        handleImageFile(e.target.files?.[0]);
                        e.target.value = '';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={isUploadingImage || isSaving}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-adm-raised border border-adm-line-strong text-xs font-mono text-adm-text-2 hover:text-adm-text cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                      <span>{isUploadingImage ? 'Uploading...' : 'Upload image'}</span>
                    </button>
                    <p className="text-[10px] text-adm-muted">
                      Uploads go to the Media Library (JPG, PNG, WebP, GIF or AVIF, max {MAX_IMAGE_MB} MB).
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    value={editingFacility.hours}
                    onChange={(e) => patchDraft({ hours: e.target.value })}
                    placeholder="06:30 – 22:00 Daily"
                    className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                    Highlight Badge Text
                  </label>
                  <input
                    type="text"
                    value={editingFacility.highlight}
                    onChange={(e) => patchDraft({ highlight: e.target.value })}
                    placeholder="Heated freshwater with ocean horizon views"
                    className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={editingFacility.description}
                  onChange={(e) => patchDraft({ description: e.target.value })}
                  className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs text-adm-text focus:border-adm-accent outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                    Icon (optional)
                  </label>
                  <input
                    type="text"
                    list="facility-icon-options"
                    value={editingFacility.icon || ''}
                    onChange={(e) => patchDraft({ icon: e.target.value })}
                    placeholder="e.g. Sparkles"
                    className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
                  />
                  <datalist id="facility-icon-options">
                    {ICON_SUGGESTIONS.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    step={1}
                    value={Number.isFinite(Number(editingFacility.order)) ? editingFacility.order : ''}
                    onChange={(e) => patchDraft({ order: e.target.value === '' ? NaN : Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
                  />
                </div>

                <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-adm-line bg-adm-bg cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!editingFacility.visible}
                    onChange={(e) => patchDraft({ visible: e.target.checked })}
                    className="accent-current"
                  />
                  <span className="text-xs text-adm-text">Visible on website</span>
                </label>
              </div>

              <div className="pt-3 border-t border-adm-line flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving || isUploadingImage}
                  className="px-4 py-2 rounded-lg bg-adm-raised text-xs font-mono text-adm-text-2 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isUploadingImage}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-adm-accent-fill hover:bg-adm-accent-hover text-adm-on-accent text-xs font-mono uppercase font-bold cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{isSaving ? 'Saving...' : isNew ? 'Create Facility' : 'Save Facility'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
