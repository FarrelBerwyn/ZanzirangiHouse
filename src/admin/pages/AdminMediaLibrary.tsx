import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  Plus,
  Search,
  Copy,
  Check,
  Image as ImageIcon,
  Video,
  FileText,
  RefreshCw,
  ExternalLink,
  X,
} from 'lucide-react';
import { contentApi, MediaAsset } from '../../services/contentApi';

export const AdminMediaLibrary: React.FC = () => {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAsset, setNewAsset] = useState<Partial<MediaAsset>>({
    filename: '',
    url: '',
    type: 'image',
    altText: '',
    caption: '',
  });

  const loadMedia = async () => {
    try {
      setIsLoading(true);
      const data = await contentApi.getAdminMedia();
      setMedia(data);
    } catch {
      console.error('Failed to load media');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.url || !newAsset.filename) return;
    try {
      await contentApi.createMediaAsset({
        ...newAsset,
        id: `med-${Date.now()}`,
        sizeBytes: 1024000,
        mimeType: newAsset.type === 'video' ? 'video/mp4' : 'image/jpeg',
      });
      setIsModalOpen(false);
      setNewAsset({ filename: '', url: '', type: 'image', altText: '', caption: '' });
      await loadMedia();
    } catch (err) {
      console.error('Failed to add media asset:', err);
    }
  };

  const filteredMedia = media.filter((m) =>
    m.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.altText.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#2C2B28] gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#C4A27A]">
              ASSET STORAGE
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-emerald-950/60 border border-emerald-700/60 text-emerald-300">
              LIVE
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#FAF8F5] tracking-wide mt-1">
            Media Asset Library
          </h1>
          <p className="text-xs text-[#8E8B85] mt-0.5">
            Centralized media repository for villa imagery, video reels, and sanctuary photography.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-[#B8966C] hover:bg-[#C4A27A] text-[#141413] text-xs font-mono uppercase tracking-widest font-bold shadow-lg transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register Media</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8B85]" />
        <input
          type="text"
          placeholder="Search media by filename, alt text..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
        />
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="py-24 text-center">
          <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-[#C4A27A]" />
          <p className="font-mono text-xs uppercase tracking-widest text-[#D8CCB8]">Loading Assets...</p>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="py-16 text-center bg-[#181716] rounded-xl border border-[#2C2B28]">
          <FolderOpen className="w-10 h-10 mx-auto mb-2 text-[#8E8B85]" />
          <p className="text-sm font-serif text-[#FAF8F5]">No media assets found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((asset) => (
            <div
              key={asset.id}
              className="bg-[#181716] rounded-xl border border-[#2C2B28] overflow-hidden flex flex-col justify-between group"
            >
              <div className="relative aspect-video bg-black/60 overflow-hidden">
                {asset.type === 'video' ? (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                    <Video className="w-8 h-8 text-[#C4A27A]" />
                  </div>
                ) : (
                  <img src={asset.url} alt={asset.altText} className="w-full h-full object-cover" />
                )}

                <div className="absolute top-2 right-2">
                  <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[9px] font-mono uppercase text-[#C4A27A]">
                    {asset.type}
                  </span>
                </div>
              </div>

              <div className="p-3 space-y-1">
                <p className="font-mono text-xs text-[#FAF8F5] truncate" title={asset.filename}>
                  {asset.filename}
                </p>
                <p className="text-[10px] text-[#8E8B85] truncate">{asset.altText || 'No Alt Text'}</p>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[9px] font-mono text-[#C4A27A]">
                    Used in {asset.referenceCount || 1} sections
                  </span>

                  <button
                    onClick={() => handleCopyUrl(asset.id, asset.url)}
                    className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-[#242321] hover:bg-[#2C2B28] text-[10px] font-mono text-[#D8CCB8] cursor-pointer"
                  >
                    {copiedId === asset.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181716] border border-[#2C2B28] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#2C2B28] flex items-center justify-between bg-[#1C1B1A]">
              <h2 className="font-serif text-lg text-[#FAF8F5]">Register New Media Asset</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-[#8E8B85]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMedia} className="p-5 space-y-3">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                  Filename *
                </label>
                <input
                  type="text"
                  required
                  value={newAsset.filename}
                  onChange={(e) => setNewAsset({ ...newAsset, filename: e.target.value })}
                  placeholder="e.g. sultan-villa-ocean.jpg"
                  className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                  Direct Asset URL *
                </label>
                <input
                  type="text"
                  required
                  value={newAsset.url}
                  onChange={(e) => setNewAsset({ ...newAsset, url: e.target.value })}
                  placeholder="https://... or ./photo.jpg"
                  className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                  Asset Type
                </label>
                <select
                  value={newAsset.type}
                  onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
                >
                  <option value="image">Image Photography</option>
                  <option value="video">MP4 Video</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                  Accessibility Alt Text
                </label>
                <input
                  type="text"
                  value={newAsset.altText}
                  onChange={(e) => setNewAsset({ ...newAsset, altText: e.target.value })}
                  placeholder="Descriptive text for SEO & screen-readers..."
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
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
