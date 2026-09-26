import React, { useState, useEffect } from 'react';
import {
  Save,
  Check,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Sliders,
  Layers,
  FileText,
  Phone,
  Share2,
} from 'lucide-react';
import {
  contentApi,
  HomepageContent,
  HeroSlide,
  FALLBACK_HOMEPAGE_CONTENT,
} from '../../services/contentApi';

interface AdminHomepageEditorProps {
  onUnsavedChangesChange?: (hasUnsaved: boolean) => void;
}

export const AdminHomepageEditor: React.FC<AdminHomepageEditorProps> = ({
  onUnsavedChangesChange,
}) => {
  const [initialData, setInitialData] = useState<HomepageContent | null>(null);
  const [formData, setFormData] = useState<HomepageContent>(FALLBACK_HOMEPAGE_CONTENT);
  const [activeTab, setActiveTab] = useState<'hero' | 'sections' | 'intro' | 'contact' | 'socials'>('hero');
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'saving' | 'success' | 'error'>('saved');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);

  // Quick Curated Image library for slide background replacement
  const CURATED_IMAGES = [
    { name: 'Sultan Plunge Pool High Tide', url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2400&q=90' },
    { name: 'Authentic Makuti Villas Night', url: './zanzirangi-villas.jpg' },
    { name: 'Cliffside Infinity Pool Reef', url: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=2400&q=90' },
    { name: 'Kizimkazi Coastal Coral Lagoon', url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=2400&q=90' },
    { name: 'Zanzibar Sunset Dhow Horizon', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=90' },
    { name: 'Artisanal Teak Bedroom Suite', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2400&q=90' },
  ];

  const loadContent = async () => {
    try {
      setIsLoading(true);
      const data = await contentApi.getAdminHomepage();
      setInitialData(data);
      setFormData(data);
      setSaveStatus('saved');
      if (onUnsavedChangesChange) onUnsavedChangesChange(false);
    } catch (err) {
      console.error('Failed to load homepage content:', err);
      setStatusMessage('Unable to connect to CMS server.');
      setSaveStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const markUnsaved = () => {
    setSaveStatus('unsaved');
    if (onUnsavedChangesChange) onUnsavedChangesChange(true);
  };

  // --- Slide Handlers ---
  const slides = formData.hero.slides || [];

  const handleUpdateSlide = (index: number, field: keyof HeroSlide, value: any) => {
    const updated = [...slides];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        slides: updated,
      },
    }));
    markUnsaved();
  };

  const handleToggleSlideVisibility = (index: number) => {
    const updated = [...slides];
    updated[index] = { ...updated[index], visible: !updated[index].visible };
    setFormData((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        slides: updated,
      },
    }));
    markUnsaved();
  };

  const handleAddSlide = () => {
    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`,
      badgeText: 'KIZIMKAZI DIMBANI • ZANZIBAR',
      title: 'New Luxury Sanctuary Experience',
      subtitle: 'Exclusive Coastal Retreat',
      description: 'Discover unparalleled barefoot serenity surrounded by indigenous palms and the azure Indian Ocean.',
      heroImage: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=2400&q=90',
      primaryCtaText: 'Reserve Sanctuary',
      primaryCtaLink: '#stay',
      secondaryCtaText: 'Explore Sanctuary',
      secondaryCtaLink: '#itinerary',
      order: slides.length + 1,
      visible: true,
    };
    const updated = [...slides, newSlide];
    setFormData((prev) => ({
      ...prev,
      hero: { ...prev.hero, slides: updated },
    }));
    setSelectedSlideIndex(updated.length - 1);
    markUnsaved();
  };

  const handleDuplicateSlide = (index: number) => {
    const target = slides[index];
    const duplicated: HeroSlide = {
      ...target,
      id: `slide-${Date.now()}`,
      title: `${target.title} (Copy)`,
      order: slides.length + 1,
    };
    const updated = [...slides, duplicated];
    setFormData((prev) => ({
      ...prev,
      hero: { ...prev.hero, slides: updated },
    }));
    setSelectedSlideIndex(updated.length - 1);
    markUnsaved();
  };

  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 1) {
      alert('The hero carousel must retain at least one slide.');
      return;
    }
    if (!window.confirm(`Delete slide: "${slides[index].title}"?`)) return;
    const updated = slides.filter((_, idx) => idx !== index);
    setFormData((prev) => ({
      ...prev,
      hero: { ...prev.hero, slides: updated },
    }));
    setSelectedSlideIndex(Math.max(0, index - 1));
    markUnsaved();
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    const updated = [...slides];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    updated.forEach((s, idx) => (s.order = idx + 1));
    setFormData((prev) => ({
      ...prev,
      hero: { ...prev.hero, slides: updated },
    }));
    setSelectedSlideIndex(targetIndex);
    markUnsaved();
  };

  // --- Section Handlers ---
  const sections = formData.sections || [];

  const handleToggleSectionVisibility = (index: number) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], visible: !updated[index].visible };
    setFormData((prev) => ({ ...prev, sections: updated }));
    markUnsaved();
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    updated.forEach((s, idx) => (s.order = idx + 1));
    setFormData((prev) => ({ ...prev, sections: updated }));
    markUnsaved();
  };

  // --- Save / Publish ---
  const handlePublish = async () => {
    try {
      setSaveStatus('saving');
      setStatusMessage('Publishing changes to live sanctuary...');
      const primarySlide = formData.hero.slides?.[0];
      const payload: HomepageContent = {
        ...formData,
        hero: {
          ...formData.hero,
          title: primarySlide?.title || formData.hero.title,
          subtitle: primarySlide?.subtitle || formData.hero.subtitle,
          description: primarySlide?.description || formData.hero.description,
          badgeText: primarySlide?.badgeText || formData.hero.badgeText,
          heroImage: primarySlide?.heroImage || formData.hero.heroImage,
          primaryCtaText: primarySlide?.primaryCtaText || formData.hero.primaryCtaText,
          primaryCtaLink: primarySlide?.primaryCtaLink || formData.hero.primaryCtaLink,
          secondaryCtaText: primarySlide?.secondaryCtaText || formData.hero.secondaryCtaText,
          secondaryCtaLink: primarySlide?.secondaryCtaLink || formData.hero.secondaryCtaLink,
        },
      };

      const updated = await contentApi.updateHomepage(payload);
      setInitialData(updated);
      setFormData(updated);
      setSaveStatus('success');
      setStatusMessage('✓ Published to live website');
      if (onUnsavedChangesChange) onUnsavedChangesChange(false);

      setTimeout(() => {
        setSaveStatus('saved');
        setStatusMessage(null);
      }, 4000);
    } catch (err: any) {
      console.error('Publish error:', err);
      setSaveStatus('error');
      setStatusMessage(`Error: ${err.message || 'Failed to publish'}`);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-[#C4A27A]" />
        <p className="font-mono text-xs uppercase tracking-widest text-[#D8CCB8]">
          Loading Homepage CMS...
        </p>
      </div>
    );
  }

  const currentSlide = slides[selectedSlideIndex] || slides[0];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header & Publish Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#2C2B28] gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#C4A27A]">
              MODULE CONTROL
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-emerald-950/60 border border-emerald-700/60 text-emerald-300">
              LIVE
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#FAF8F5] tracking-wide mt-1">
            Homepage & Experience Manager
          </h1>
          <p className="text-xs text-[#8E8B85] mt-0.5">
            Manage multi-slide hero carousel, reorder homepage sections, and update contact narrative.
          </p>
        </div>

        {/* Action Controls */}
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
            onClick={handlePublish}
            disabled={saveStatus === 'saving'}
            id="homepage-publish-btn"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-[#B8966C] hover:bg-[#C4A27A] text-[#141413] text-xs font-mono uppercase tracking-widest font-bold shadow-lg transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Publish Live</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#2C2B28] pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('hero')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono tracking-wider uppercase transition-colors cursor-pointer ${
            activeTab === 'hero'
              ? 'bg-[#B8966C] text-[#141413] font-bold'
              : 'text-[#D8CCB8] hover:bg-[#1E1D1B]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Hero Slides ({slides.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sections')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono tracking-wider uppercase transition-colors cursor-pointer ${
            activeTab === 'sections'
              ? 'bg-[#B8966C] text-[#141413] font-bold'
              : 'text-[#D8CCB8] hover:bg-[#1E1D1B]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Sections & Ordering ({sections.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('intro')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono tracking-wider uppercase transition-colors cursor-pointer ${
            activeTab === 'intro'
              ? 'bg-[#B8966C] text-[#141413] font-bold'
              : 'text-[#D8CCB8] hover:bg-[#1E1D1B]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Editorial Intro</span>
        </button>

        <button
          onClick={() => setActiveTab('contact')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono tracking-wider uppercase transition-colors cursor-pointer ${
            activeTab === 'contact'
              ? 'bg-[#B8966C] text-[#141413] font-bold'
              : 'text-[#D8CCB8] hover:bg-[#1E1D1B]'
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Contacts & Concierge</span>
        </button>

        <button
          onClick={() => setActiveTab('socials')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono tracking-wider uppercase transition-colors cursor-pointer ${
            activeTab === 'socials'
              ? 'bg-[#B8966C] text-[#141413] font-bold'
              : 'text-[#D8CCB8] hover:bg-[#1E1D1B]'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Social Media</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: HERO MULTI-SLIDE CAROUSEL REPEATER                     */}
      {/* ============================================================== */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          {/* Slides Carousel Overview Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#181716] p-4 rounded-xl border border-[#2C2B28] gap-3">
            <div>
              <h3 className="font-serif text-lg text-[#FAF8F5]">Hero Carousel Slides</h3>
              <p className="text-xs text-[#8E8B85]">
                {slides.length} slides configured. Admin can add, duplicate, reorder, or toggle visibility.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <label className="text-xs font-mono text-[#D8CCB8] flex items-center space-x-2">
                <span>Rotation (sec):</span>
                <input
                  type="number"
                  min="3"
                  max="30"
                  value={formData.hero.autoPlayIntervalSeconds || 7}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, autoPlayIntervalSeconds: parseInt(e.target.value) || 7 },
                    }));
                    markUnsaved();
                  }}
                  className="w-16 px-2 py-1 bg-[#141413] border border-[#2C2B28] rounded text-center text-xs font-mono text-[#FAF8F5]"
                />
              </label>

              <button
                onClick={handleAddSlide}
                id="add-slide-btn"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#2C2B28] hover:bg-[#B8966C] text-[#FAF8F5] hover:text-[#141413] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Slide</span>
              </button>
            </div>
          </div>

          {/* Slide Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {slides.map((slide, idx) => {
              const isSelected = selectedSlideIndex === idx;
              return (
                <div
                  key={slide.id}
                  onClick={() => setSelectedSlideIndex(idx)}
                  className={`relative p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#22211F] border-[#B8966C] ring-1 ring-[#B8966C]'
                      : 'bg-[#181716] border-[#2C2B28] hover:border-[#3E3C38]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[10px] font-mono tracking-widest text-[#C4A27A] uppercase">
                      SLIDE {idx + 1}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSlideVisibility(idx);
                        }}
                        title={slide.visible ? 'Visible on site' : 'Hidden from site'}
                        className="p-1 text-[#8E8B85] hover:text-[#FAF8F5]"
                      >
                        {slide.visible ? (
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5 text-amber-500" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveSlide(idx, 'up');
                        }}
                        disabled={idx === 0}
                        title="Move Up"
                        className="p-1 text-[#8E8B85] hover:text-[#FAF8F5] disabled:opacity-20"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveSlide(idx, 'down');
                        }}
                        disabled={idx === slides.length - 1}
                        title="Move Down"
                        className="p-1 text-[#8E8B85] hover:text-[#FAF8F5] disabled:opacity-20"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail */}
                  <div className="h-20 rounded-lg overflow-hidden bg-black/40 mb-2 relative">
                    <img
                      src={slide.heroImage}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                    {!slide.visible && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-[9px] font-mono uppercase tracking-widest text-amber-300">
                          Hidden
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="font-serif text-xs text-[#FAF8F5] truncate font-medium">
                    {slide.title}
                  </p>
                  <p className="text-[10px] text-[#8E8B85] truncate mt-0.5">
                    {slide.subtitle || slide.badgeText}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Detailed Slide Editor Form */}
          {currentSlide && (
            <div className="bg-[#181716] p-6 rounded-xl border border-[#2C2B28] space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#2C2B28]">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-[#C4A27A] uppercase">
                    EDITING SLIDE {selectedSlideIndex + 1} OF {slides.length}
                  </span>
                  <h3 className="font-serif text-lg text-[#FAF8F5]">
                    {currentSlide.title || 'Untitled Slide'}
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDuplicateSlide(selectedSlideIndex)}
                    className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded bg-[#22211F] hover:bg-[#2C2B28] text-xs font-mono text-[#D8CCB8] cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Duplicate</span>
                  </button>
                  <button
                    onClick={() => handleDeleteSlide(selectedSlideIndex)}
                    className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-xs font-mono text-red-200 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Eyebrow / Badge */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                    Eyebrow / Badge Label
                  </label>
                  <input
                    type="text"
                    value={currentSlide.badgeText || ''}
                    onChange={(e) =>
                      handleUpdateSlide(selectedSlideIndex, 'badgeText', e.target.value)
                    }
                    placeholder="e.g. KIZIMKAZI DIMBANI • SOUTH COAST"
                    className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
                  />
                </div>

                {/* Main Headline */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                    Main Title (Heading)
                  </label>
                  <input
                    type="text"
                    value={currentSlide.title || ''}
                    onChange={(e) => handleUpdateSlide(selectedSlideIndex, 'title', e.target.value)}
                    placeholder="e.g. Zanzibar Luxury Villa - Zanzirangi House"
                    className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-serif text-[#FAF8F5] focus:border-[#C4A27A] outline-none text-sm"
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                    Subtitle Descriptor
                  </label>
                  <input
                    type="text"
                    value={currentSlide.subtitle || ''}
                    onChange={(e) =>
                      handleUpdateSlide(selectedSlideIndex, 'subtitle', e.target.value)
                    }
                    placeholder="e.g. Private Pool Retreat"
                    className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-serif text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
                  />
                </div>

                {/* Background Video URL (Optional) */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                    Background Video URL (Optional MP4)
                  </label>
                  <input
                    type="text"
                    value={currentSlide.videoUrl || ''}
                    onChange={(e) =>
                      handleUpdateSlide(selectedSlideIndex, 'videoUrl', e.target.value)
                    }
                    placeholder="./Zanzirangi-home.mp4"
                    className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
                  />
                </div>

                {/* Description Narrative */}
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                    Narrative Story / Description
                  </label>
                  <textarea
                    rows={3}
                    value={currentSlide.description || ''}
                    onChange={(e) =>
                      handleUpdateSlide(selectedSlideIndex, 'description', e.target.value)
                    }
                    placeholder="Experience Zanzibar luxury villas with private plunge pools..."
                    className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
                  />
                </div>

                {/* Primary CTA Label & Link */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                    Primary CTA Label
                  </label>
                  <input
                    type="text"
                    value={currentSlide.primaryCtaText || ''}
                    onChange={(e) =>
                      handleUpdateSlide(selectedSlideIndex, 'primaryCtaText', e.target.value)
                    }
                    placeholder="Reserve Sanctuary"
                    className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                    Primary CTA Destination
                  </label>
                  <input
                    type="text"
                    value={currentSlide.primaryCtaLink || ''}
                    onChange={(e) =>
                      handleUpdateSlide(selectedSlideIndex, 'primaryCtaLink', e.target.value)
                    }
                    placeholder="#stay or /villas"
                    className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
                  />
                </div>

                {/* Secondary CTA Label & Link */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                    Secondary CTA Label
                  </label>
                  <input
                    type="text"
                    value={currentSlide.secondaryCtaText || ''}
                    onChange={(e) =>
                      handleUpdateSlide(selectedSlideIndex, 'secondaryCtaText', e.target.value)
                    }
                    placeholder="Explore Sanctuary"
                    className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                    Secondary CTA Destination
                  </label>
                  <input
                    type="text"
                    value={currentSlide.secondaryCtaLink || ''}
                    onChange={(e) =>
                      handleUpdateSlide(selectedSlideIndex, 'secondaryCtaLink', e.target.value)
                    }
                    placeholder="#itinerary or /experiences"
                    className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
                  />
                </div>

                {/* Background Image URL & Curated Picker */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8]">
                    Background Image URL / High-Res Photography
                  </label>
                  <input
                    type="text"
                    value={currentSlide.heroImage || ''}
                    onChange={(e) =>
                      handleUpdateSlide(selectedSlideIndex, 'heroImage', e.target.value)
                    }
                    className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
                  />

                  {/* Quick Preset Selector */}
                  <div className="pt-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#8E8B85] block mb-2">
                      Or select from curated sanctuary gallery:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {CURATED_IMAGES.map((img) => (
                        <button
                          key={img.url}
                          type="button"
                          onClick={() =>
                            handleUpdateSlide(selectedSlideIndex, 'heroImage', img.url)
                          }
                          className={`flex items-center space-x-2 p-1.5 rounded-lg border text-left cursor-pointer transition-all ${
                            currentSlide.heroImage === img.url
                              ? 'border-[#B8966C] bg-[#B8966C]/10 text-[#C4A27A]'
                              : 'border-[#2C2B28] bg-[#141413] text-[#8E8B85] hover:text-[#FAF8F5]'
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={img.name}
                            className="w-8 h-8 rounded object-cover shrink-0"
                          />
                          <span className="text-[10px] font-mono truncate">{img.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: HOMEPAGE SECTIONS VISIBILITY & ORDERING               */}
      {/* ============================================================== */}
      {activeTab === 'sections' && (
        <div className="bg-[#181716] p-6 rounded-xl border border-[#2C2B28] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#2C2B28]">
            <div>
              <h3 className="font-serif text-lg text-[#FAF8F5]">Homepage Section Architecture</h3>
              <p className="text-xs text-[#8E8B85]">
                Show/Hide sections without deleting content. Reorder sections dynamically to test customer journeys.
              </p>
            </div>
            <span className="text-[11px] font-mono text-[#C4A27A]">
              {sections.filter((s) => s.visible).length} of {sections.length} Sections Visible
            </span>
          </div>

          <div className="space-y-2">
            {sections.map((section, idx) => (
              <div
                key={section.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                  section.visible
                    ? 'bg-[#1C1B1A] border-[#2C2B28]'
                    : 'bg-[#141413]/60 border-[#22211F] opacity-60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded bg-[#242321] text-[#C4A27A] flex items-center justify-center font-mono text-xs">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-mono text-xs uppercase tracking-wider text-[#FAF8F5] block">
                      {section.name}
                    </span>
                    <span className="text-[10px] text-[#8E8B85] font-mono">
                      Key: <code className="text-[#C4A27A]">{section.id}</code>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Reorder Buttons */}
                  <button
                    onClick={() => handleMoveSection(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded bg-[#242321] hover:bg-[#2C2B28] text-[#D8CCB8] disabled:opacity-20 cursor-pointer"
                    title="Move section up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveSection(idx, 'down')}
                    disabled={idx === sections.length - 1}
                    className="p-1.5 rounded bg-[#242321] hover:bg-[#2C2B28] text-[#D8CCB8] disabled:opacity-20 cursor-pointer"
                    title="Move section down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Visibility Toggle */}
                  <button
                    onClick={() => handleToggleSectionVisibility(idx)}
                    className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded text-xs font-mono tracking-wider uppercase transition-colors cursor-pointer ${
                      section.visible
                        ? 'bg-emerald-950/60 border border-emerald-800/80 text-emerald-300'
                        : 'bg-zinc-800/60 border border-zinc-700/60 text-zinc-400'
                    }`}
                  >
                    {section.visible ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Visible</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hidden</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: EDITORIAL INTRO ("MORE THAN A STAY")                     */}
      {/* ============================================================== */}
      {activeTab === 'intro' && (
        <div className="bg-[#181716] p-6 rounded-xl border border-[#2C2B28] space-y-4">
          <div className="pb-3 border-b border-[#2C2B28]">
            <h3 className="font-serif text-lg text-[#FAF8F5]">Editorial Sanctuary Introduction</h3>
            <p className="text-xs text-[#8E8B85]">
              The prominent narrative section immediately following the quick booking bar.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                Eyebrow Small Headline
              </label>
              <input
                type="text"
                value={formData.intro.eyebrow}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    intro: { ...prev.intro, eyebrow: e.target.value },
                  }));
                  markUnsaved();
                }}
                className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                Major Statement Title
              </label>
              <input
                type="text"
                value={formData.intro.title}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    intro: { ...prev.intro, title: e.target.value },
                  }));
                  markUnsaved();
                }}
                className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-sm font-serif text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                Philosophical Narrative
              </label>
              <textarea
                rows={4}
                value={formData.intro.description}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    intro: { ...prev.intro, description: e.target.value },
                  }));
                  markUnsaved();
                }}
                className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs text-[#FAF8F5] focus:border-[#C4A27A] outline-none leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: CONTACT & CONCIERGE INFORMATION                         */}
      {/* ============================================================== */}
      {activeTab === 'contact' && (
        <div className="bg-[#181716] p-6 rounded-xl border border-[#2C2B28] space-y-4">
          <div className="pb-3 border-b border-[#2C2B28]">
            <h3 className="font-serif text-lg text-[#FAF8F5]">Concierge & Direct Contact Channels</h3>
            <p className="text-xs text-[#8E8B85]">
              Official phone numbers, WhatsApp, physical address and map links displayed on website and footer.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                Telephone (Direct Line)
              </label>
              <input
                type="text"
                value={formData.contact.phone}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    contact: { ...prev.contact, phone: e.target.value },
                  }));
                  markUnsaved();
                }}
                className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                Concierge Email
              </label>
              <input
                type="email"
                value={formData.contact.email}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    contact: { ...prev.contact, email: e.target.value },
                  }));
                  markUnsaved();
                }}
                className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                WhatsApp Number (International format without +)
              </label>
              <input
                type="text"
                value={formData.contact.whatsappNumber}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    contact: { ...prev.contact, whatsappNumber: e.target.value },
                  }));
                  markUnsaved();
                }}
                placeholder="255777890123"
                className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                Google Maps URL
              </label>
              <input
                type="text"
                value={formData.contact.googleMapsUrl || ''}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    contact: { ...prev.contact, googleMapsUrl: e.target.value },
                  }));
                  markUnsaved();
                }}
                className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                Physical Property Address
              </label>
              <input
                type="text"
                value={formData.contact.address}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    contact: { ...prev.contact, address: e.target.value },
                  }));
                  markUnsaved();
                }}
                className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: SOCIAL MEDIA CHANNELS                                   */}
      {/* ============================================================== */}
      {activeTab === 'socials' && (
        <div className="bg-[#181716] p-6 rounded-xl border border-[#2C2B28] space-y-4">
          <div className="pb-3 border-b border-[#2C2B28]">
            <h3 className="font-serif text-lg text-[#FAF8F5]">Social Media Channels</h3>
            <p className="text-xs text-[#8E8B85]">
              Update Instagram, Facebook, TikTok, and YouTube channels rendered in footer and concierge features.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                Instagram Profile URL
              </label>
              <input
                type="text"
                value={formData.socials?.instagram || ''}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    socials: { ...(prev.socials as any), instagram: e.target.value },
                  }));
                  markUnsaved();
                }}
                className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                Facebook Page URL
              </label>
              <input
                type="text"
                value={formData.socials?.facebook || ''}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    socials: { ...(prev.socials as any), facebook: e.target.value },
                  }));
                  markUnsaved();
                }}
                className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                TikTok Channel URL
              </label>
              <input
                type="text"
                value={formData.socials?.tiktok || ''}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    socials: { ...(prev.socials as any), tiktok: e.target.value },
                  }));
                  markUnsaved();
                }}
                className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] mb-1">
                YouTube Channel URL
              </label>
              <input
                type="text"
                value={formData.socials?.youtube || ''}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    socials: { ...(prev.socials as any), youtube: e.target.value },
                  }));
                  markUnsaved();
                }}
                className="w-full px-3 py-2 bg-[#141413] border border-[#2C2B28] rounded-lg text-xs font-mono text-[#FAF8F5] focus:border-[#C4A27A] outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
