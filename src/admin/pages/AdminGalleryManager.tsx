import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  RefreshCw,
  Search,
  ArrowUp,
  ArrowDown,
  Save,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { contentApi, GalleryModel } from '../../services/contentApi';

export const AdminGalleryManager: React.FC = () => {
  const [gallery, setGallery] = useState<GalleryModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<GalleryModel> | null>(null);

  const CATEGORIES = [
    { key: 'all', label: 'All Photos' },
    { key: 'property', label: 'Property' },
    { key: 'villas', label: 'Villas' },
    { key: 'dining', label: 'Dining' },
    { key: 'pool', label: 'Pool' },
    { key: 'garden', label: 'Garden' },
    { key: 'zanzibar', label: 'Zanzibar' },
    { key: 'experiences', label: 'Experiences' },
  ];

  const loadGallery = async () => {
    try {
      setIsLoading(true);
      const data = await contentApi.getAdminGallery();
      setGallery(data);
    } catch (err) {
      console.error('Failed to load gallery:', err);
      showNotification('error', 'Failed to retrieve gallery items from server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenAddModal = () => {
    setEditingItem({
      id: `g-${Date.now()}`,
      title: '',
      category: 'property',
      image: '',
      aspect: 'landscape',
      caption: '',
      order: gallery.length + 1,
      published: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: GalleryModel) => {
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.image || !editingItem.title) {
      alert('Photo title and Image URL are required.');
      return;
    }

    try {
      const isNew = !gallery.some((g) => g.id === editingItem.id);
      if (isNew) {
        await contentApi.createGalleryItem(editingItem);
        showNotification('success', `Added "${editingItem.title}" to gallery.`);
      } else {
        await contentApi.updateGalleryItem(editingItem.id!, editingItem);
        showNotification('success', `Updated "${editingItem.title}".`);
      }
      setIsModalOpen(false);
      setEditingItem(null);
      await loadGallery();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to save gallery item.');
    }
  };

  const handleDeleteItem = async (id: string, title: string) => {
    if (!window.confirm(`Delete photo: "${title}"?`)) return;
    try {
      await contentApi.deleteGalleryItem(id);
      showNotification('success', `Deleted "${title}".`);
      await loadGallery();
    } catch {
      showNotification('error', 'Failed to delete photo.');
    }
  };

  const handleTogglePublished = async (item: GalleryModel) => {
    try {
      const nextStatus = !item.published;
      await contentApi.updateGalleryItem(item.id, { published: nextStatus });
      setGallery((prev) =>
        prev.map((g) => (g.id === item.id ? { ...g, published: nextStatus } : g))
      );
      showNotification('success', `"${item.title}" is now ${nextStatus ? 'PUBLISHED' : 'HIDDEN'}.`);
    } catch {
      showNotification('error', 'Failed to update visibility.');
    }
  };

  const filteredItems = gallery.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.caption.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#2C2B28] gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#C4A27A]">
              VISUAL ARCHIVE
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-emerald-950/60 border border-emerald-700/60 text-emerald-300">
              LIVE
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#FAF8F5] tracking-wide mt-1">
            Curated Gallery Manager
          </h1>
          <p className="text-xs text-[#8E8B85] mt-0.5">
            Organize photography across the 7 sanctuary categories with lightbox captions and order controls.
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
            id="add-gallery-btn"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-[#B8966C] hover:bg-[#C4A27A] text-[#141413] text-xs font-mono uppercase tracking-widest font-bold shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Photo</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#2C2B28] pb-3 overflow-x-auto">
        {CATEGORIES.map((cat) => {
          const count =
            cat.key === 'all' ? gallery.length : gallery.filter((g) => g.category === cat.key).length;
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider uppercase transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.key
                  ? 'bg-[#B8966C] text-[#141413] font-bold'
                  : 'text-[#D8CCB8] hover:bg-[#1E1D1B]'
              }`}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8B85]" />
        <input
          type="text"
          placeholder="Filter photos by title or caption..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
        />
      </div>

      {/* Photos Grid */}
      {isLoading ? (
        <div className="py-24 text-center">
          <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-[#C4A27A]" />
          <p className="font-mono text-xs uppercase tracking-widest text-[#D8CCB8]">Loading Gallery...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-16 text-center bg-[#181716] rounded-xl border border-[#2C2B28]">
          <ImageIcon className="w-10 h-10 mx-auto mb-2 text-[#8E8B85]" />
          <p className="text-sm font-serif text-[#FAF8F5]">No photos in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#181716] rounded-xl border border-[#2C2B28] overflow-hidden group flex flex-col justify-between"
            >
              <div className="relative aspect-[4/3] bg-black/40 overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                <div className="absolute top-2 left-2 flex items-center space-x-1">
                  <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[9px] font-mono uppercase tracking-wider text-[#C4A27A]">
                    {item.category}
                  </span>
                </div>

                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => handleTogglePublished(item)}
                    className="p-1 rounded bg-black/60 backdrop-blur-sm text-white hover:text-[#C4A27A] cursor-pointer"
                  >
                    {item.published ? (
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-amber-500" />
                    )}
                  </button>
                </div>

                <div className="absolute bottom-2 left-2 right-2">
                  <p className="font-serif text-xs text-[#FAF8F5] truncate font-medium">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-[#8E8B85] truncate mt-0.5">{item.caption}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-2 bg-[#141413] border-t border-[#2C2B28] flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#8E8B85] uppercase">
                  {item.aspect}
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-1.5 rounded hover:bg-[#2C2B28] text-[#D8CCB8] cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id, item.title)}
                    className="p-1.5 rounded hover:bg-red-950/40 text-red-300 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Add Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181716] border border-[#2C2B28] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#2C2B28] flex items-center justify-between bg-[#1C1B1A]">
              <h2 className="font-serif text-lg text-[#FAF8F5]">
                {editingItem.title ? `Edit: ${editingItem.title}` : 'Add Photo to Gallery'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-[#8E8B85]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-5 space-y-3">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                  Photo Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.title || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="e.g. Cliffside Oceanfront Sanctuary"
                  className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-serif text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                  Category *
                </label>
                <select
                  value={editingItem.category || 'property'}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
                >
                  <option value="property">Property</option>
                  <option value="villas">Villas</option>
                  <option value="dining">Dining</option>
                  <option value="pool">Pool</option>
                  <option value="garden">Garden</option>
                  <option value="zanzibar">Zanzibar</option>
                  <option value="experiences">Experiences</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                  Image URL *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.image || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                  placeholder="https://images.unsplash.com/... or ./zanzirangi-villas.jpg"
                  className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                  Aspect Ratio
                </label>
                <select
                  value={editingItem.aspect || 'landscape'}
                  onChange={(e) => setEditingItem({ ...editingItem, aspect: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
                >
                  <option value="landscape">Landscape (Horizontal)</option>
                  <option value="portrait">Portrait (Vertical)</option>
                  <option value="square">Square</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                  Lightbox Caption
                </label>
                <textarea
                  rows={2}
                  value={editingItem.caption || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, caption: e.target.value })}
                  placeholder="Photographic description shown when enlarged..."
                  className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#2C2B28] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#242321] text-xs font-mono text-[#D8CCB8] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#B8966C] hover:bg-[#C4A27A] text-[#141413] text-xs font-mono uppercase font-bold cursor-pointer"
                >
                  Save Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
