import React, { useState, useEffect } from 'react';
import {
  BedDouble,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  RefreshCw,
  Search,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Users,
  Maximize,
  Sparkles,
  Image as ImageIcon,
  Save,
  X,
} from 'lucide-react';
import { contentApi, VillaModel } from '../../services/contentApi';

export const AdminRoomsManager: React.FC = () => {
  const [villas, setVillas] = useState<VillaModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVilla, setEditingVilla] = useState<Partial<VillaModel> | null>(null);
  const [newAmenityText, setNewAmenityText] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  const loadVillas = async () => {
    try {
      setIsLoading(true);
      const data = await contentApi.getAdminVillas();
      setVillas(data);
    } catch (err) {
      console.error('Failed to load villas:', err);
      showNotification('error', 'Failed to retrieve villas from server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVillas();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenAddModal = () => {
    setEditingVilla({
      id: `villa-${Date.now()}`,
      roomNumber: `VILLA 0${villas.length + 1}`,
      name: '',
      type: 'Private Pool Villa',
      capacity: 2,
      bed: 'King Four-Poster Bed',
      bathroom: 'En-suite Luxury Bathroom & Outdoor Shower',
      size: '85 m²',
      view: 'Indian Ocean & Sunset',
      pricePerNight: '$450',
      promotionalPrice: '',
      availability: true,
      featured: false,
      architecturalFeature: 'Private plunge pool carved into natural coral limestone',
      shortDescription: '',
      description: '',
      heroImage: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1600&q=85',
      images: [
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1400&q=85',
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=85',
      ],
      amenities: [
        'Private Ocean Plunge Pool',
        'Air Conditioning & Ceiling Fan',
        'High-Speed Wi-Fi',
        'Gourmet Breakfast Included',
        '24/7 Butler Service',
      ],
      order: villas.length + 1,
      status: 'published',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (v: VillaModel) => {
    setEditingVilla({ ...v });
    setIsModalOpen(true);
  };

  const handleSaveVilla = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVilla || !editingVilla.name) {
      alert('Villa name is required.');
      return;
    }

    try {
      const isNew = !villas.some((v) => v.id === editingVilla.id);
      if (isNew) {
        await contentApi.createVilla(editingVilla);
        showNotification('success', `Created "${editingVilla.name}" successfully.`);
      } else {
        await contentApi.updateVilla(editingVilla.id!, editingVilla);
        showNotification('success', `Updated "${editingVilla.name}" successfully.`);
      }
      setIsModalOpen(false);
      setEditingVilla(null);
      await loadVillas();
    } catch (err: any) {
      console.error('Error saving villa:', err);
      showNotification('error', err.message || 'Failed to save villa.');
    }
  };

  const handleDeleteVilla = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete villa: "${name}"?`)) return;
    try {
      await contentApi.deleteVilla(id);
      showNotification('success', `Deleted "${name}".`);
      await loadVillas();
    } catch (err) {
      showNotification('error', 'Failed to delete villa.');
    }
  };

  const handleDuplicateVilla = async (v: VillaModel) => {
    try {
      const duplicated: Partial<VillaModel> = {
        ...v,
        id: `villa-${Date.now()}`,
        name: `${v.name} (Copy)`,
        roomNumber: `${v.roomNumber}-B`,
        order: villas.length + 1,
      };
      await contentApi.createVilla(duplicated);
      showNotification('success', `Duplicated "${v.name}".`);
      await loadVillas();
    } catch (err) {
      showNotification('error', 'Failed to duplicate villa.');
    }
  };

  const handleToggleStatus = async (v: VillaModel) => {
    const nextStatus = v.status === 'published' ? 'draft' : 'published';
    try {
      await contentApi.updateVilla(v.id, { status: nextStatus });
      setVillas((prev) =>
        prev.map((item) => (item.id === v.id ? { ...item, status: nextStatus } : item))
      );
      showNotification('success', `"${v.name}" is now ${nextStatus.toUpperCase()}.`);
    } catch {
      showNotification('error', 'Failed to change villa status.');
    }
  };

  const filteredVillas = villas.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-adm-line gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-adm-accent">
              VILLA
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-emerald-950/60 border border-emerald-700/60 text-emerald-300">
              LIVE
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-adm-text tracking-wide mt-1">
            Villas
          </h1>
          <p className="text-xs text-adm-muted mt-0.5">
            Manage rooms and villas, pricing, amenities, and photos.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {notification && (
            <div
              className={`text-xs font-mono px-3 py-1.5 rounded-lg flex items-center space-x-2 ${
                notification.type === 'success'
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                  : 'bg-red-950/60 text-red-300 border border-red-800/60'
              }`}
            >
              {notification.type === 'success' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              )}
              <span>{notification.message}</span>
            </div>
          )}

          <button
            onClick={handleOpenAddModal}
            id="add-villa-btn"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-adm-accent-fill hover:bg-adm-accent-hover text-adm-on-accent text-xs font-mono uppercase tracking-widest font-bold shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Villa</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-adm-panel p-3 rounded-xl border border-adm-line">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-adm-muted" />
          <input
            type="text"
            placeholder="Search villas by name, number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {(['all', 'published', 'draft', 'archived'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-adm-accent-fill text-adm-on-accent font-bold'
                  : 'text-adm-text-2 hover:bg-adm-raised'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Villas Table / Cards Grid */}
      {isLoading ? (
        <div className="py-24 text-center">
          <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-adm-accent" />
          <p className="font-mono text-xs uppercase tracking-widest text-adm-text-2">Loading Villas...</p>
        </div>
      ) : filteredVillas.length === 0 ? (
        <div className="py-16 text-center bg-adm-panel rounded-xl border border-adm-line">
          <BedDouble className="w-10 h-10 mx-auto mb-2 text-adm-muted" />
          <p className="text-sm font-serif text-adm-text">No villas found</p>
          <p className="text-xs text-adm-muted mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVillas.map((villa) => (
            <div
              key={villa.id}
              className="bg-adm-panel rounded-xl border border-adm-line overflow-hidden flex flex-col justify-between hover:border-adm-line-strong transition-all"
            >
              <div>
                {/* Image Banner */}
                <div className="relative h-44 w-full bg-black/40 overflow-hidden">
                  <img
                    src={villa.heroImage}
                    alt={villa.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-adm-panel via-transparent to-black/30" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-mono uppercase tracking-wider text-adm-accent border border-white/10">
                      {villa.roomNumber}
                    </span>
                    {villa.featured && (
                      <span className="px-2 py-0.5 rounded bg-adm-accent-fill text-adm-on-accent text-[9px] font-mono uppercase font-bold">
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3 flex items-center space-x-1">
                    <button
                      onClick={() => handleToggleStatus(villa)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border backdrop-blur-sm transition-colors cursor-pointer ${
                        villa.status === 'published'
                          ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                          : 'bg-amber-950/80 border-amber-700 text-amber-300'
                      }`}
                    >
                      {villa.status}
                    </button>
                  </div>

                  {/* Price Tag Overlay */}
                  <div className="absolute bottom-3 right-3">
                    <span className="font-serif text-lg text-adm-text font-bold">
                      {villa.pricePerNight}
                    </span>
                    <span className="text-[10px] font-mono text-adm-text-2 ml-1">/ night</span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-4 space-y-2">
                  <h3 className="font-serif text-lg text-adm-text font-light leading-snug">
                    {villa.name}
                  </h3>
                  <p className="text-[11px] text-adm-accent font-mono uppercase tracking-wider truncate">
                    {villa.type}
                  </p>
                  <p className="text-xs text-adm-muted line-clamp-2 leading-relaxed">
                    {villa.shortDescription || villa.description}
                  </p>

                  <div className="pt-2 flex items-center space-x-4 text-xs font-mono text-adm-text-2">
                    <span className="flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5 text-adm-accent" />
                      <span>{villa.capacity} Guests</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Maximize className="w-3.5 h-3.5 text-adm-accent" />
                      <span>{villa.size}</span>
                    </span>
                    <span className="text-[10px] text-adm-muted">
                      {villa.amenities?.length || 0} Amenities
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="p-3 bg-adm-bg border-t border-adm-line flex items-center justify-between">
                <button
                  onClick={() => handleToggleStatus(villa)}
                  className="text-xs font-mono text-adm-muted hover:text-adm-text flex items-center space-x-1 cursor-pointer"
                >
                  {villa.status === 'published' ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-amber-500" />
                      <span>Unpublish</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Publish</span>
                    </>
                  )}
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDuplicateVilla(villa)}
                    title="Duplicate villa"
                    className="p-1.5 rounded bg-adm-surface hover:bg-adm-line text-adm-text-2 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(villa)}
                    title="Edit villa"
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded bg-adm-accent-fill hover:bg-adm-accent-hover text-adm-on-accent text-xs font-mono uppercase font-bold cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteVilla(villa.id, villa.name)}
                    title="Delete villa"
                    className="p-1.5 rounded bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-200 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Villa Modal */}
      {isModalOpen && editingVilla && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-adm-panel border border-adm-line rounded-2xl w-full max-w-3xl my-8 max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-adm-line flex items-center justify-between bg-adm-surface">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-adm-accent uppercase">
                  VILLA EDITOR
                </span>
                <h2 className="font-serif text-xl text-adm-text">
                  {editingVilla.name || 'New Villa / Suite'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-adm-muted hover:text-adm-text cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveVilla} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Villa Name */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                    Villa Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingVilla.name || ''}
                    onChange={(e) => setEditingVilla({ ...editingVilla, name: e.target.value })}
                    placeholder="e.g. Sultan Oceanfront Villa"
                    className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-serif text-sm text-adm-text focus:border-adm-accent outline-none"
                  />
                </div>

                {/* Room Number / Identifier */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                    Room Number / Badge
                  </label>
                  <input
                    type="text"
                    value={editingVilla.roomNumber || ''}
                    onChange={(e) =>
                      setEditingVilla({ ...editingVilla, roomNumber: e.target.value })
                    }
                    placeholder="e.g. VILLA 01"
                    className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
                  />
                </div>

                {/* Villa Subtitle / Category Type */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                    Villa Category / Architectural Type
                  </label>
                  <input
                    type="text"
                    value={editingVilla.type || ''}
                    onChange={(e) => setEditingVilla({ ...editingVilla, type: e.target.value })}
                    placeholder="e.g. Master Ocean Villa with Private Plunge Pool"
                    className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
                  />
                </div>

                {/* Pricing: Regular Price & Promotional Price */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                    Price Per Night
                  </label>
                  <input
                    type="text"
                    value={editingVilla.pricePerNight || ''}
                    onChange={(e) =>
                      setEditingVilla({ ...editingVilla, pricePerNight: e.target.value })
                    }
                    placeholder="e.g. $480"
                    className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                    Promotional Price (Optional)
                  </label>
                  <input
                    type="text"
                    value={editingVilla.promotionalPrice || ''}
                    onChange={(e) =>
                      setEditingVilla({ ...editingVilla, promotionalPrice: e.target.value })
                    }
                    placeholder="e.g. $420"
                    className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
                  />
                </div>

                {/* Capacity & Size */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                    Max Guest Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={editingVilla.capacity || 2}
                    onChange={(e) =>
                      setEditingVilla({ ...editingVilla, capacity: parseInt(e.target.value) || 2 })
                    }
                    className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                    Floor Size
                  </label>
                  <input
                    type="text"
                    value={editingVilla.size || ''}
                    onChange={(e) => setEditingVilla({ ...editingVilla, size: e.target.value })}
                    placeholder="e.g. 95 m² (1,022 sq ft)"
                    className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
                  />
                </div>

                {/* Bed & Bathroom */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                    Bed Configuration
                  </label>
                  <input
                    type="text"
                    value={editingVilla.bed || ''}
                    onChange={(e) => setEditingVilla({ ...editingVilla, bed: e.target.value })}
                    placeholder="e.g. Handcrafted King Four-Poster Bed"
                    className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                    Bathroom Details
                  </label>
                  <input
                    type="text"
                    value={editingVilla.bathroom || ''}
                    onChange={(e) => setEditingVilla({ ...editingVilla, bathroom: e.target.value })}
                    placeholder="e.g. En-suite Stone Wet Room & Outdoor Rain Shower"
                    className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
                  />
                </div>

                {/* Ocean View Description */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                    View Description
                  </label>
                  <input
                    type="text"
                    value={editingVilla.view || ''}
                    onChange={(e) => setEditingVilla({ ...editingVilla, view: e.target.value })}
                    placeholder="e.g. Direct Panoramic Indian Ocean & Sunset"
                    className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
                  />
                </div>

                {/* Short Description */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                    Short Description (Card Teaser)
                  </label>
                  <textarea
                    rows={2}
                    value={editingVilla.shortDescription || ''}
                    onChange={(e) =>
                      setEditingVilla({ ...editingVilla, shortDescription: e.target.value })
                    }
                    placeholder="Perched directly above the coral cliff with uninterrupted ocean vistas..."
                    className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs text-adm-text focus:border-adm-accent outline-none"
                  />
                </div>

                {/* Long Description */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                    Full Narrative Description
                  </label>
                  <textarea
                    rows={4}
                    value={editingVilla.description || ''}
                    onChange={(e) =>
                      setEditingVilla({ ...editingVilla, description: e.target.value })
                    }
                    placeholder="The Sultan Oceanfront Villa represents the pinnacle of barefoot luxury..."
                    className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs text-adm-text focus:border-adm-accent outline-none leading-relaxed"
                  />
                </div>

                {/* Cover Hero Image URL */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                    Cover Hero Photography URL *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingVilla.heroImage || ''}
                    onChange={(e) =>
                      setEditingVilla({ ...editingVilla, heroImage: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
                  />
                </div>

                {/* Gallery Photos Repeater */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2">
                    Villa Image Gallery ({editingVilla.images?.length || 0} photos)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Add photo URL to gallery..."
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newImageUrl) return;
                        setEditingVilla({
                          ...editingVilla,
                          images: [...(editingVilla.images || []), newImageUrl],
                        });
                        setNewImageUrl('');
                      }}
                      className="px-3 py-1.5 bg-adm-line hover:bg-adm-accent-hover text-adm-text hover:text-adm-on-accent rounded text-xs font-mono uppercase"
                    >
                      Add Photo
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {editingVilla.images?.map((img, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden h-16 bg-black">
                        <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = editingVilla.images?.filter((_, i) => i !== idx);
                            setEditingVilla({ ...editingVilla, images: updated });
                          }}
                          className="absolute top-1 right-1 p-1 bg-red-950/80 text-red-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amenities Repeater */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2">
                    Villa Amenities ({editingVilla.amenities?.length || 0} items)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="e.g. Private Ocean Plunge Pool"
                      value={newAmenityText}
                      onChange={(e) => setNewAmenityText(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newAmenityText) return;
                        setEditingVilla({
                          ...editingVilla,
                          amenities: [...(editingVilla.amenities || []), newAmenityText],
                        });
                        setNewAmenityText('');
                      }}
                      className="px-3 py-1.5 bg-adm-line hover:bg-adm-accent-hover text-adm-text hover:text-adm-on-accent rounded text-xs font-mono uppercase"
                    >
                      Add Amenity
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {editingVilla.amenities?.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-adm-surface border border-adm-line text-xs font-mono text-adm-text-2"
                      >
                        <span>{amenity}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = editingVilla.amenities?.filter((_, i) => i !== idx);
                            setEditingVilla({ ...editingVilla, amenities: updated });
                          }}
                          className="text-adm-muted hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Featured & Status Checkboxes */}
                <div className="sm:col-span-2 pt-2 flex items-center space-x-6">
                  <label className="flex items-center space-x-2 text-xs font-mono text-adm-text cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingVilla.featured || false}
                      onChange={(e) =>
                        setEditingVilla({ ...editingVilla, featured: e.target.checked })
                      }
                      className="rounded border-adm-line text-adm-accent focus:ring-0"
                    />
                    <span>Highlight as Featured on Homepage</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs font-mono text-adm-text cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingVilla.availability !== false}
                      onChange={(e) =>
                        setEditingVilla({ ...editingVilla, availability: e.target.checked })
                      }
                      className="rounded border-adm-line text-adm-accent focus:ring-0"
                    />
                    <span>Available for Booking</span>
                  </label>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-4 border-t border-adm-line flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-adm-raised text-xs font-mono uppercase tracking-wider text-adm-text-2 hover:bg-adm-line cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center space-x-2 px-5 py-2 rounded-lg bg-adm-accent-fill hover:bg-adm-accent-hover text-adm-on-accent text-xs font-mono uppercase tracking-widest font-bold shadow-lg cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Villa</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
