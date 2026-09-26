import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
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
} from 'lucide-react';
import { contentApi, FacilityModel } from '../../services/contentApi';

export const AdminFacilitiesManager: React.FC = () => {
  const [facilities, setFacilities] = useState<FacilityModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Partial<FacilityModel> | null>(null);

  const loadFacilities = async () => {
    try {
      setIsLoading(true);
      const data = await contentApi.getAdminFacilities();
      setFacilities(data);
    } catch {
      showNotification('error', 'Failed to retrieve facilities.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFacilities();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenAdd = () => {
    setEditingFacility({
      id: `fac-${Date.now()}`,
      title: '',
      category: 'Relaxation & Wellness',
      description: '',
      image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=85',
      hours: '08:00 – 22:00 Daily',
      highlight: 'Exclusive to staying guests',
      order: facilities.length + 1,
      visible: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (f: FacilityModel) => {
    setEditingFacility({ ...f });
    setIsModalOpen(true);
  };

  const handleSaveFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFacility || !editingFacility.title) return;
    try {
      const isNew = !facilities.some((f) => f.id === editingFacility.id);
      if (isNew) {
        await contentApi.createFacility(editingFacility);
        showNotification('success', `Created "${editingFacility.title}".`);
      } else {
        await contentApi.updateFacility(editingFacility.id!, editingFacility);
        showNotification('success', `Updated "${editingFacility.title}".`);
      }
      setIsModalOpen(false);
      setEditingFacility(null);
      await loadFacilities();
    } catch {
      showNotification('error', 'Failed to save facility.');
    }
  };

  const handleDeleteFacility = async (id: string, title: string) => {
    if (!window.confirm(`Delete facility: "${title}"?`)) return;
    try {
      await contentApi.deleteFacility(id);
      showNotification('success', `Deleted "${title}".`);
      await loadFacilities();
    } catch {
      showNotification('error', 'Failed to delete facility.');
    }
  };

  const handleToggleVisible = async (f: FacilityModel) => {
    try {
      const nextStatus = !f.visible;
      await contentApi.updateFacility(f.id, { visible: nextStatus });
      setFacilities((prev) =>
        prev.map((item) => (item.id === f.id ? { ...item, visible: nextStatus } : item))
      );
      showNotification('success', `"${f.title}" is now ${nextStatus ? 'VISIBLE' : 'HIDDEN'}.`);
    } catch {
      showNotification('error', 'Failed to update visibility.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#2C2B28] gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#C4A27A]">
              ESTATE AMENITIES
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-emerald-950/60 border border-emerald-700/60 text-emerald-300">
              LIVE
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#FAF8F5] tracking-wide mt-1">
            Facilities & Wellness Manager
          </h1>
          <p className="text-xs text-[#8E8B85] mt-0.5">
            Manage infinity pools, dining pavilions, Swahili botanical spa, and estate amenities.
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
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-[#B8966C] hover:bg-[#C4A27A] text-[#141413] text-xs font-mono uppercase tracking-widest font-bold shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Facility</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 text-center">
          <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-[#C4A27A]" />
          <p className="font-mono text-xs uppercase tracking-widest text-[#D8CCB8]">Loading Facilities...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {facilities.map((fac) => (
            <div
              key={fac.id}
              className="bg-[#181716] rounded-xl border border-[#2C2B28] overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative h-40 bg-black/40 overflow-hidden">
                  <img src={fac.image} alt={fac.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#181716] via-transparent to-black/30" />
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[9px] font-mono uppercase text-[#C4A27A]">
                      {fac.category}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => handleToggleVisible(fac)}
                      className="p-1 rounded bg-black/60 text-white"
                    >
                      {fac.visible ? (
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-amber-500" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-serif text-lg text-[#FAF8F5] leading-snug">{fac.title}</h3>
                  <p className="text-xs text-[#8E8B85] line-clamp-3 leading-relaxed">
                    {fac.description}
                  </p>

                  <div className="pt-2 space-y-1 text-xs font-mono text-[#D8CCB8]">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3 h-3 text-[#C4A27A]" />
                      <span className="text-[11px]">{fac.hours}</span>
                    </div>
                    {fac.highlight && (
                      <div className="flex items-center space-x-1.5">
                        <Tag className="w-3 h-3 text-[#C4A27A]" />
                        <span className="text-[11px] truncate">{fac.highlight}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#141413] border-t border-[#2C2B28] flex items-center justify-end space-x-2">
                <button
                  onClick={() => handleOpenEdit(fac)}
                  className="px-3 py-1.5 rounded bg-[#B8966C] hover:bg-[#C4A27A] text-[#141413] text-xs font-mono uppercase font-bold"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteFacility(fac.id, fac.title)}
                  className="p-1.5 rounded bg-red-950/40 text-red-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {isModalOpen && editingFacility && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181716] border border-[#2C2B28] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#2C2B28] flex items-center justify-between bg-[#1C1B1A]">
              <h2 className="font-serif text-lg text-[#FAF8F5]">
                {editingFacility.title ? `Edit: ${editingFacility.title}` : 'Add Facility'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-[#8E8B85]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFacility} className="p-5 space-y-3">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingFacility.title || ''}
                  onChange={(e) => setEditingFacility({ ...editingFacility, title: e.target.value })}
                  placeholder="e.g. Oceanfront Infinity Pool"
                  className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-serif text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={editingFacility.category || ''}
                  onChange={(e) => setEditingFacility({ ...editingFacility, category: e.target.value })}
                  placeholder="e.g. Relaxation & Wellness"
                  className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  value={editingFacility.image || ''}
                  onChange={(e) => setEditingFacility({ ...editingFacility, image: e.target.value })}
                  className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                  Operating Hours
                </label>
                <input
                  type="text"
                  value={editingFacility.hours || ''}
                  onChange={(e) => setEditingFacility({ ...editingFacility, hours: e.target.value })}
                  placeholder="06:30 – 22:00 Daily"
                  className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                  Highlight Badge Text
                </label>
                <input
                  type="text"
                  value={editingFacility.highlight || ''}
                  onChange={(e) => setEditingFacility({ ...editingFacility, highlight: e.target.value })}
                  placeholder="Heated freshwater with ocean horizon views"
                  className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingFacility.description || ''}
                  onChange={(e) => setEditingFacility({ ...editingFacility, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#2C2B28] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#242321] text-xs font-mono text-[#D8CCB8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#B8966C] hover:bg-[#C4A27A] text-[#141413] text-xs font-mono uppercase font-bold"
                >
                  Save Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
