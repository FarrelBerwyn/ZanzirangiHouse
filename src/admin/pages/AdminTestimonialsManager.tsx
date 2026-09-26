import React, { useState, useEffect } from 'react';
import {
  MessageSquareQuote,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  RefreshCw,
  Star,
  ShieldCheck,
  Save,
  X,
} from 'lucide-react';
import { contentApi, TestimonialModel } from '../../services/contentApi';

export const AdminTestimonialsManager: React.FC = () => {
  const [reviews, setReviews] = useState<TestimonialModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Partial<TestimonialModel> | null>(null);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      const data = await contentApi.getAdminTestimonials();
      setReviews(data);
    } catch {
      showNotification('error', 'Failed to retrieve testimonials.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenAdd = () => {
    setEditingReview({
      id: `rev-${Date.now()}`,
      guestName: '',
      country: 'United Kingdom',
      countryCode: 'GB',
      rating: 5,
      stayDate: 'February 2026',
      villaStayed: 'Sultan Oceanfront Villa',
      title: '',
      reviewText: '',
      featured: true,
      verified: true,
      visible: true,
      order: reviews.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (r: TestimonialModel) => {
    setEditingReview({ ...r });
    setIsModalOpen(true);
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview || !editingReview.guestName || !editingReview.reviewText) return;
    try {
      const isNew = !reviews.some((r) => r.id === editingReview.id);
      if (isNew) {
        await contentApi.createTestimonial(editingReview);
        showNotification('success', `Added review by "${editingReview.guestName}".`);
      } else {
        await contentApi.updateTestimonial(editingReview.id!, editingReview);
        showNotification('success', `Updated review by "${editingReview.guestName}".`);
      }
      setIsModalOpen(false);
      setEditingReview(null);
      await loadReviews();
    } catch {
      showNotification('error', 'Failed to save review.');
    }
  };

  const handleDeleteReview = async (id: string, name: string) => {
    if (!window.confirm(`Delete review by "${name}"?`)) return;
    try {
      await contentApi.deleteTestimonial(id);
      showNotification('success', `Deleted review by "${name}".`);
      await loadReviews();
    } catch {
      showNotification('error', 'Failed to delete review.');
    }
  };

  const handleToggleVisible = async (r: TestimonialModel) => {
    try {
      const nextStatus = !r.visible;
      await contentApi.updateTestimonial(r.id, { visible: nextStatus });
      setReviews((prev) =>
        prev.map((item) => (item.id === r.id ? { ...item, visible: nextStatus } : item))
      );
      showNotification('success', `Review is now ${nextStatus ? 'VISIBLE' : 'HIDDEN'}.`);
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
              GUEST SATISFACTION
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-emerald-950/60 border border-emerald-700/60 text-emerald-300">
              LIVE
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#FAF8F5] tracking-wide mt-1">
            Testimonials & Guest Reviews
          </h1>
          <p className="text-xs text-[#8E8B85] mt-0.5">
            Manage verified guest impressions, star ratings, stay dates, and villa attributions.
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
            <span>Add Review</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 text-center">
          <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-[#C4A27A]" />
          <p className="font-mono text-xs uppercase tracking-widest text-[#D8CCB8]">Loading Reviews...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#181716] p-5 rounded-xl border border-[#2C2B28] flex flex-col justify-between space-y-4 hover:border-[#3E3C38] transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#C4A27A] text-[#C4A27A]" />
                    ))}
                  </div>

                  <div className="flex items-center space-x-2">
                    {rev.verified && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-[9px] font-mono uppercase text-emerald-300">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        <span>Verified Stay</span>
                      </span>
                    )}
                    <button
                      onClick={() => handleToggleVisible(rev)}
                      className="p-1 text-[#8E8B85] hover:text-[#FAF8F5]"
                    >
                      {rev.visible ? (
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-amber-500" />
                      )}
                    </button>
                  </div>
                </div>

                <h3 className="font-serif text-base text-[#FAF8F5] leading-snug">
                  "{rev.title}"
                </h3>
                <p className="text-xs text-[#8E8B85] italic leading-relaxed line-clamp-3">
                  "{rev.reviewText}"
                </p>
              </div>

              <div className="pt-3 border-t border-[#2C2B28] flex items-center justify-between">
                <div>
                  <p className="font-mono text-xs text-[#FAF8F5]">{rev.guestName}</p>
                  <p className="text-[10px] text-[#C4A27A] font-mono">
                    {rev.country} • Stayed in {rev.villaStayed}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEdit(rev)}
                    className="p-1.5 rounded hover:bg-[#2C2B28] text-[#D8CCB8]"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteReview(rev.id, rev.guestName)}
                    className="p-1.5 rounded hover:bg-red-950/40 text-red-300"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {isModalOpen && editingReview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181716] border border-[#2C2B28] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#2C2B28] flex items-center justify-between bg-[#1C1B1A]">
              <h2 className="font-serif text-lg text-[#FAF8F5]">
                {editingReview.guestName ? `Edit Review: ${editingReview.guestName}` : 'Add Testimonial'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-[#8E8B85]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                    Guest Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingReview.guestName || ''}
                    onChange={(e) => setEditingReview({ ...editingReview, guestName: e.target.value })}
                    placeholder="e.g. Eleanor & Marcus Vance"
                    className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                    Origin Country
                  </label>
                  <input
                    type="text"
                    value={editingReview.country || ''}
                    onChange={(e) => setEditingReview({ ...editingReview, country: e.target.value })}
                    placeholder="e.g. United Kingdom"
                    className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                    Villa Stayed
                  </label>
                  <input
                    type="text"
                    value={editingReview.villaStayed || ''}
                    onChange={(e) => setEditingReview({ ...editingReview, villaStayed: e.target.value })}
                    placeholder="e.g. Sultan Oceanfront Villa"
                    className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                    Stay Date
                  </label>
                  <input
                    type="text"
                    value={editingReview.stayDate || ''}
                    onChange={(e) => setEditingReview({ ...editingReview, stayDate: e.target.value })}
                    placeholder="e.g. November 2025"
                    className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                  Review Headline *
                </label>
                <input
                  type="text"
                  required
                  value={editingReview.title || ''}
                  onChange={(e) => setEditingReview({ ...editingReview, title: e.target.value })}
                  placeholder="e.g. An absolute paradise beyond all expectations"
                  className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-serif text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                  Review Narrative *
                </label>
                <textarea
                  rows={4}
                  required
                  value={editingReview.reviewText || ''}
                  onChange={(e) => setEditingReview({ ...editingReview, reviewText: e.target.value })}
                  placeholder="From the moment our private chauffeur welcomed us..."
                  className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs text-[#FAF8F5] focus:border-[#C4A27A] outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center space-x-6 pt-2">
                <label className="flex items-center space-x-2 text-xs font-mono text-[#FAF8F5] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingReview.featured || false}
                    onChange={(e) => setEditingReview({ ...editingReview, featured: e.target.checked })}
                    className="rounded border-[#2C2B28] text-[#C4A27A]"
                  />
                  <span>Featured on Homepage</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-mono text-[#FAF8F5] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingReview.verified !== false}
                    onChange={(e) => setEditingReview({ ...editingReview, verified: e.target.checked })}
                    className="rounded border-[#2C2B28] text-[#C4A27A]"
                  />
                  <span>Verified Stay Badge</span>
                </label>
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
                  Save Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
