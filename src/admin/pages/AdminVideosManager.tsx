import React, { useState, useEffect } from 'react';
import {
  Video,
  Play,
  Save,
  Check,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
} from 'lucide-react';
import { contentApi, VideoModel } from '../../services/contentApi';

export const AdminVideosManager: React.FC = () => {
  const [videoData, setVideoData] = useState<VideoModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'success' | 'error'>('saved');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [newSceneText, setNewSceneText] = useState('');

  const loadVideos = async () => {
    try {
      setIsLoading(true);
      const data = await contentApi.getAdminVideos();
      setVideoData(data);
    } catch {
      setStatusMessage('Failed to load video configuration.');
      setSaveStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!videoData) return;
    try {
      setSaveStatus('saving');
      setStatusMessage('Saving video settings...');
      const updated = await contentApi.updateVideos(videoData);
      setVideoData(updated);
      setSaveStatus('success');
      setStatusMessage('✓ Video settings updated successfully.');
      setTimeout(() => {
        setSaveStatus('saved');
        setStatusMessage(null);
      }, 4000);
    } catch (err: any) {
      setSaveStatus('error');
      setStatusMessage(`Error: ${err.message || 'Failed to save'}`);
    }
  };

  const handleAddScene = () => {
    if (!newSceneText.trim() || !videoData) return;
    const scenes = videoData.scenes || [];
    const newScene = {
      id: `sc-${Date.now()}`,
      order: scenes.length + 1,
      description: newSceneText.trim(),
    };
    setVideoData({ ...videoData, scenes: [...scenes, newScene] });
    setNewSceneText('');
  };

  const handleDeleteScene = (id: string) => {
    if (!videoData) return;
    const updated = (videoData.scenes || []).filter((s) => s.id !== id);
    setVideoData({ ...videoData, scenes: updated });
  };

  if (isLoading || !videoData) {
    return (
      <div className="py-24 text-center">
        <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-[#C4A27A]" />
        <p className="font-mono text-xs uppercase tracking-widest text-[#D8CCB8]">Loading Videos...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#2C2B28] gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#C4A27A]">
              CINEMATIC MEDIA
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-emerald-950/60 border border-emerald-700/60 text-emerald-300">
              LIVE
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#FAF8F5] tracking-wide mt-1">
            Promotional Brand Reel
          </h1>
          <p className="text-xs text-[#8E8B85] mt-0.5">
            Configure the 4K Ultra HD promotional film, poster cover photography, and storyboard sequences.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {statusMessage && (
            <div
              className={`text-xs font-mono px-3 py-1.5 rounded-lg flex items-center space-x-2 ${
                saveStatus === 'success'
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                  : saveStatus === 'error'
                  ? 'bg-red-950/60 text-red-300 border border-red-800/60'
                  : 'bg-[#22211F] text-[#D8CCB8] border border-[#2C2B28]'
              }`}
            >
              {saveStatus === 'success' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              {saveStatus === 'error' && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
              {saveStatus === 'saving' && <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C4A27A]" />}
              <span>{statusMessage}</span>
            </div>
          )}

          <button
            onClick={() => handleSave()}
            disabled={saveStatus === 'saving'}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-[#B8966C] hover:bg-[#C4A27A] text-[#141413] text-xs font-mono uppercase tracking-widest font-bold shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Publish Video</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: General Settings */}
        <div className="bg-[#181716] p-6 rounded-xl border border-[#2C2B28] space-y-4">
          <h3 className="font-serif text-lg text-[#FAF8F5]">Video Reel Configuration</h3>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
              Section Title
            </label>
            <input
              type="text"
              value={videoData.title}
              onChange={(e) => setVideoData({ ...videoData, title: e.target.value })}
              className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
              Eyebrow Label
            </label>
            <input
              type="text"
              value={videoData.eyebrow}
              onChange={(e) => setVideoData({ ...videoData, eyebrow: e.target.value })}
              className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
              Badge Text
            </label>
            <input
              type="text"
              value={videoData.badge}
              onChange={(e) => setVideoData({ ...videoData, badge: e.target.value })}
              className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
              Direct MP4 Video URL (or YouTube/Vimeo)
            </label>
            <input
              type="text"
              value={videoData.videoUrl}
              onChange={(e) => setVideoData({ ...videoData, videoUrl: e.target.value })}
              placeholder="./Zanzirangi-home.mp4"
              className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
              Cover Poster Image URL
            </label>
            <input
              type="text"
              value={videoData.posterImage}
              onChange={(e) => setVideoData({ ...videoData, posterImage: e.target.value })}
              className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center space-x-2 text-xs font-mono text-[#FAF8F5] cursor-pointer">
              <input
                type="checkbox"
                checked={videoData.visible !== false}
                onChange={(e) => setVideoData({ ...videoData, visible: e.target.checked })}
                className="rounded border-[#2C2B28] text-[#C4A27A]"
              />
              <span>Render Video Reel on Public Homepage</span>
            </label>
          </div>
        </div>

        {/* Right: Storyboard Scenes */}
        <div className="bg-[#181716] p-6 rounded-xl border border-[#2C2B28] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#2C2B28]">
            <h3 className="font-serif text-lg text-[#FAF8F5]">Storyboard Narrative Scenes</h3>
            <span className="text-xs font-mono text-[#C4A27A]">
              {videoData.scenes?.length || 0} Scenes
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Add scene narrative description..."
              value={newSceneText}
              onChange={(e) => setNewSceneText(e.target.value)}
              className="flex-1 px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs text-[#FAF8F5] outline-none"
            />
            <button
              type="button"
              onClick={handleAddScene}
              className="px-4 py-2 bg-[#2C2B28] hover:bg-[#B8966C] text-[#FAF8F5] hover:text-[#141413] rounded-lg text-xs font-mono uppercase font-bold"
            >
              Add
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {videoData.scenes?.map((scene, idx) => (
              <div
                key={scene.id}
                className="flex items-start justify-between p-3 rounded-lg bg-[#141413] border border-[#2C2B28] text-xs text-[#FAF8F5]"
              >
                <div className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded bg-[#242321] text-[#C4A27A] flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="leading-relaxed text-[#D8CCB8]">{scene.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteScene(scene.id)}
                  className="p-1 text-[#8E8B85] hover:text-red-400 ml-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
