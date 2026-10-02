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
  LayoutGrid,
} from 'lucide-react';
import {
  contentApi,
  HomepageContent,
  HeroSlide,
  FALLBACK_HOMEPAGE_CONTENT,
} from '../../services/contentApi';
import { HomeSectionsContent } from '../../data/homeSectionsCms';
import { HomeSectionsEditor } from './HomeSectionsEditor';
import { AdminImageInput } from '../components/AdminImageInput';

// Slide images may be stored as './file.jpg' (relative to the site root). Resolve them from the root so
// previews also work under /admin/*.
const previewUrl = (url?: string) => (url && url.startsWith('./') ? url.slice(1) : url || '');

interface AdminHomepageEditorProps {
  onUnsavedChangesChange?: (hasUnsaved: boolean) => void;
}

export const AdminHomepageEditor: React.FC<AdminHomepageEditorProps> = ({
  onUnsavedChangesChange,
}) => {
  const [initialData, setInitialData] = useState<HomepageContent | null>(null);
  const [formData, setFormData] = useState<HomepageContent>(FALLBACK_HOMEPAGE_CONTENT);
  const [activeTab, setActiveTab] = useState<'hero' | 'sections' | 'intro' | 'contact' | 'socials' | 'content'>('hero');
  const [homeSections, setHomeSections] = useState<HomeSectionsContent>({});
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
      const [data, sectionsContent] = await Promise.all([
        contentApi.getAdminHomepage(),
        contentApi.getAdminHomeSections().catch((err) => {
          console.error('Failed to load homepage section content:', err);
          return {} as HomeSectionsContent;
        }),
      ]);
      setInitialData(data);
      setFormData(data);
      setHomeSections(sectionsContent);
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

      const [updated, updatedSections] = await Promise.all([
        contentApi.updateHomepage(payload),
        contentApi.updateHomeSections(homeSections),
      ]);
      setInitialData(updated);
      setFormData(updated);
      setHomeSections(updatedSections);
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
        <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-adm-accent" />
        <p className="font-mono text-xs uppercase tracking-widest text-adm-text-2">
          Loading Homepage CMS...
        </p>
      </div>
    );
  }

  const currentSlide = slides[selectedSlideIndex] || slides[0];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header & Publish Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-adm-line gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-adm-accent">
              HOMEPAGE
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-emerald-950/60 border border-emerald-700/60 text-emerald-300">
              LIVE ON WEBSITE
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-adm-text tracking-wide mt-1">
            Homepage Settings
          </h1>
          <p className="text-xs text-adm-muted mt-0.5">
            Manage the opening hero, video banner, introduction text, and the order of content on the homepage.
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
                  : 'bg-adm-raised text-adm-text-2 border border-adm-line'
              }`}
            >
              {saveStatus === 'success' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              {saveStatus === 'error' && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
              {saveStatus === 'saving' && <RefreshCw className="w-3.5 h-3.5 animate-spin text-adm-accent" />}
              <span>{statusMessage}</span>
            </div>
          )}

          <button
            onClick={handlePublish}
            disabled={saveStatus === 'saving'}
            id="homepage-publish-btn"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-adm-accent-fill hover:bg-adm-accent-hover text-adm-on-accent text-xs font-mono uppercase tracking-widest font-bold shadow-lg transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Publish Changes</span>
          </button>
        </div>
      </div>

      {/* Visual Guide Banner for Layperson Admin */}
      <div className="bg-adm-panel border border-adm-accent/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-adm-accent">
            <span>📍 WHERE THIS APPEARS ON THE WEBSITE</span>
            <span className="text-adm-muted">•</span>
            <span className="text-adm-text">Homepage (Root /)</span>
          </div>
          <p className="text-xs text-adm-muted">
            The content below is the first thing prospective guests see when they open <span className="text-adm-text font-mono">zanzirangihouse.com</span>. Click a tab below to edit each section.
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-adm-raised hover:bg-adm-line border border-adm-line-strong text-xs font-mono text-adm-text transition-colors whitespace-nowrap"
        >
          <span>Open Live Website</span>
          <span className="text-adm-accent">↗</span>
        </a>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-adm-line pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('hero')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono tracking-wider uppercase transition-colors cursor-pointer ${
            activeTab === 'hero'
              ? 'bg-adm-accent-fill text-adm-on-accent font-bold'
              : 'text-adm-text-2 hover:bg-adm-surface'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>1. Main Banner Slider ({slides.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('intro')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono tracking-wider uppercase transition-colors cursor-pointer ${
            activeTab === 'intro'
              ? 'bg-adm-accent-fill text-adm-on-accent font-bold'
              : 'text-adm-text-2 hover:bg-adm-surface'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>2. Story & Introduction</span>
        </button>

        <button
          onClick={() => setActiveTab('sections')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono tracking-wider uppercase transition-colors cursor-pointer ${
            activeTab === 'sections'
              ? 'bg-adm-accent-fill text-adm-on-accent font-bold'
              : 'text-adm-text-2 hover:bg-adm-surface'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>3. Section Order ({sections.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('contact')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono tracking-wider uppercase transition-colors cursor-pointer ${
            activeTab === 'contact'
              ? 'bg-adm-accent-fill text-adm-on-accent font-bold'
              : 'text-adm-text-2 hover:bg-adm-surface'
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>4. Concierge Quick Contact</span>
        </button>

        <button
          onClick={() => setActiveTab('socials')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono tracking-wider uppercase transition-colors cursor-pointer ${
            activeTab === 'socials'
              ? 'bg-adm-accent-fill text-adm-on-accent font-bold'
              : 'text-adm-text-2 hover:bg-adm-surface'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>5. Social Media Accounts</span>
        </button>

        <button
          onClick={() => setActiveTab('content')}
          id="homepage-tab-content"
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono tracking-wider uppercase transition-colors cursor-pointer ${
            activeTab === 'content'
              ? 'bg-adm-accent-fill text-adm-on-accent font-bold'
              : 'text-adm-text-2 hover:bg-adm-surface'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>6. Other Section Content</span>
        </button>
      </div>

      {/* TAB 6: PER-SECTION CONTENT (headings, cards & lists of every other homepage section) */}
      {activeTab === 'content' && (
        <HomeSectionsEditor
          value={homeSections}
          onChange={(next) => {
            setHomeSections(next);
            markUnsaved();
          }}
        />
      )}

      {/* ============================================================== */}
      {/* ============================================================== */}
      {/* TAB 1: HERO CAROUSEL SLIDES                                    */}
      {/* ============================================================== */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          {/* Hero Slides Header & Autoplay Settings */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-adm-panel border border-adm-line">
            <div>
              <h2 className="font-serif text-lg text-adm-text">Hero Carousel Slides</h2>
              <p className="text-xs text-adm-muted mt-0.5">
                Every slide uses the authentic Zanzirangi House background video (./Zanzirangi-home.mp4).
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-[11px] font-mono text-adm-text-2 uppercase tracking-wider">
                  Interval (seconds):
                </label>
                <input
                  type="number"
                  min={3}
                  max={30}
                  value={formData.hero.autoPlayIntervalSeconds || 6}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 6;
                    setFormData((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, autoPlayIntervalSeconds: val },
                    }));
                    markUnsaved();
                  }}
                  className="w-16 px-2 py-1 bg-adm-bg border border-adm-line rounded text-xs font-mono text-center text-adm-text focus:border-adm-accent outline-none"
                />
              </div>

              <button
                onClick={handleAddSlide}
                className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-adm-raised hover:bg-adm-line border border-adm-line hover:border-adm-accent text-xs font-mono text-adm-text transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-adm-accent" />
                <span>Add Slide</span>
              </button>
            </div>
          </div>

          {/* Slide Cards Horizontal List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {slides.map((slide, index) => {
              const isSelected = index === selectedSlideIndex;
              return (
                <div
                  key={slide.id}
                  onClick={() => setSelectedSlideIndex(index)}
                  className={`relative p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-adm-raised border-adm-accent shadow-lg'
                      : 'bg-adm-panel border-adm-line hover:border-adm-line-strong'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-adm-accent">
                      #{index + 1}
                    </span>
                    <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleToggleSlideVisibility(index)}
                        title={slide.visible ? 'Hide slide' : 'Show slide'}
                        className="p-1 text-adm-muted hover:text-adm-text cursor-pointer"
                      >
                        {slide.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-amber-400" />}
                      </button>
                      <button
                        disabled={index === 0}
                        onClick={() => handleMoveSlide(index, 'up')}
                        className="p-1 text-adm-muted hover:text-adm-text disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={index === slides.length - 1}
                        onClick={() => handleMoveSlide(index, 'down')}
                        className="p-1 text-adm-muted hover:text-adm-text disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="h-20 rounded-lg overflow-hidden bg-black/40 mb-2 relative">
                    <img
                      src={previewUrl(slide.heroImage)}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 right-1 bg-black/70 px-1.5 py-0.5 rounded text-[8px] font-mono uppercase text-adm-accent">
                      VIDEO
                    </div>
                    {!slide.visible && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-[9px] font-mono uppercase tracking-widest text-amber-300">
                          Hidden
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="font-serif text-xs text-adm-text truncate font-medium">
                    {slide.title}
                  </p>
                  <p className="text-[10px] text-adm-muted truncate mt-0.5">
                    {slide.subtitle || slide.badgeText}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Detailed Hero Editor Form */}
          {currentSlide && (
            <div className="bg-adm-panel p-6 rounded-xl border border-adm-line space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-adm-line">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-adm-accent uppercase">
                    EDITING SLIDE {selectedSlideIndex + 1} OF {slides.length}
                  </span>
                  <h3 className="font-serif text-lg text-adm-text">
                    {currentSlide.title || 'Untitled Slide'}
                  </h3>
                  <p className="text-xs text-adm-muted mt-0.5">
                    Authentic background video and editorial content for this slide.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDuplicateSlide(selectedSlideIndex)}
                    className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded bg-adm-raised hover:bg-adm-line text-xs font-mono text-adm-text-2 cursor-pointer"
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
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                    Eyebrow / Badge Label
                  </label>
                  <input
                    type="text"
                    value={currentSlide.badgeText || ''}
                    onChange={(e) =>
                      handleUpdateSlide(selectedSlideIndex, 'badgeText', e.target.value)
                    }
                    placeholder="e.g. KIZIMKAZI DIMBANI • SOUTH COAST"
                    className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
                  />
                </div>

                {/* Main Headline */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                    Main Title (Heading)
                  </label>
                  <input
                    type="text"
                    value={currentSlide.title || ''}
                    onChange={(e) => handleUpdateSlide(selectedSlideIndex, 'title', e.target.value)}
                    placeholder="e.g. Zanzibar Luxury Villa - Zanzirangi House"
                    className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-serif text-adm-text focus:border-adm-accent outline-none text-sm"
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                    Subtitle Descriptor
                  </label>
                  <input
                    type="text"
                    value={currentSlide.subtitle || ''}
                    onChange={(e) =>
                      handleUpdateSlide(selectedSlideIndex, 'subtitle', e.target.value)
                    }
                    placeholder="e.g. Private Pool Retreat"
                    className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-serif text-adm-text focus:border-adm-accent outline-none"
                  />
                </div>

                {/* Background Video URL (Optional) */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                    Background Video URL (Optional MP4)
                  </label>
                  <input
                    type="text"
                    value={currentSlide.videoUrl || ''}
                    onChange={(e) =>
                      handleUpdateSlide(selectedSlideIndex, 'videoUrl', e.target.value)
                    }
                    placeholder="./Zanzirangi-home.mp4"
                    className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
                  />
                </div>

                {/* Description Narrative */}
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                    Narrative Story / Description
                  </label>
                  <textarea
                    rows={3}
                    value={currentSlide.description || ''}
                    onChange={(e) =>
                      handleUpdateSlide(selectedSlideIndex, 'description', e.target.value)
                    }
                    placeholder="Experience Zanzibar luxury villas with private plunge pools..."
                    className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs text-adm-text focus:border-adm-accent outline-none"
                  />
                </div>

                {/* Primary CTA Label & Link */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                    Primary CTA Label
                  </label>
                  <input
                    type="text"
                    value={currentSlide.primaryCtaText || ''}
                    onChange={(e) =>
                      handleUpdateSlide(selectedSlideIndex, 'primaryCtaText', e.target.value)
                    }
                    placeholder="Reserve Sanctuary"
                    className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                    Primary CTA Destination
                  </label>
                  <input
                    type="text"
                    value={currentSlide.primaryCtaLink || ''}
                    onChange={(e) =>
                      handleUpdateSlide(selectedSlideIndex, 'primaryCtaLink', e.target.value)
                    }
                    placeholder="#stay or /villas"
                    className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
                  />
                </div>

                {/* Secondary CTA Label & Link */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                    Secondary CTA Label
                  </label>
                  <input
                    type="text"
                    value={currentSlide.secondaryCtaText || ''}
                    onChange={(e) =>
                      handleUpdateSlide(selectedSlideIndex, 'secondaryCtaText', e.target.value)
                    }
                    placeholder="Explore Sanctuary"
                    className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
                    Secondary CTA Destination
                  </label>
                  <input
                    type="text"
                    value={currentSlide.secondaryCtaLink || ''}
                    onChange={(e) =>
                      handleUpdateSlide(selectedSlideIndex, 'secondaryCtaLink', e.target.value)
                    }
                    placeholder="#itinerary or /experiences"
                    className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
                  />
                </div>

                {/* Background Image URL & Curated Picker */}
                <div className="md:col-span-2 pt-2">
                  <AdminImageInput
                    value={currentSlide.heroImage || ''}
                    onChange={(url) =>
                      handleUpdateSlide(selectedSlideIndex, 'heroImage', url)
                    }
                    label="Foto Latar Belakang Slide (Hero Image)"
                    hint="Gunakan link foto (URL) atau langsung upload file gambar resolusi tinggi dari komputer."
                    altText={currentSlide.title}
                    presets={CURATED_IMAGES.map((img) => ({ label: img.name, url: img.url }))}
                    previewHeight="h-56"
                  />
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
        <div className="bg-adm-panel p-6 rounded-xl border border-adm-line space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-adm-line">
            <div>
              <h3 className="font-serif text-lg text-adm-text">Homepage Section Architecture</h3>
              <p className="text-xs text-adm-muted">
                Show/Hide sections without deleting content. Reorder sections dynamically to test customer journeys.
              </p>
            </div>
            <span className="text-[11px] font-mono text-adm-accent">
              {sections.filter((s) => s.visible).length} of {sections.length} Sections Visible
            </span>
          </div>

          <div className="space-y-2">
            {sections.map((section, idx) => (
              <div
                key={section.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                  section.visible
                    ? 'bg-adm-surface border-adm-line'
                    : 'bg-adm-bg/60 border-adm-raised opacity-60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded bg-adm-raised text-adm-accent flex items-center justify-center font-mono text-xs">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-mono text-xs uppercase tracking-wider text-adm-text block">
                      {section.name || (section as any).label || section.id}
                    </span>
                    <span className="text-[10px] text-adm-muted font-mono">
                      Key: <code className="text-adm-accent">{section.id}</code>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Reorder Buttons */}
                  <button
                    onClick={() => handleMoveSection(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded bg-adm-raised hover:bg-adm-line text-adm-text-2 disabled:opacity-20 cursor-pointer"
                    title="Move section up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveSection(idx, 'down')}
                    disabled={idx === sections.length - 1}
                    className="p-1.5 rounded bg-adm-raised hover:bg-adm-line text-adm-text-2 disabled:opacity-20 cursor-pointer"
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
        <div className="bg-adm-panel p-6 rounded-xl border border-adm-line space-y-4">
          <div className="pb-3 border-b border-adm-line">
            <h3 className="font-serif text-lg text-adm-text">Editorial Sanctuary Introduction</h3>
            <p className="text-xs text-adm-muted">
              The prominent narrative section immediately following the quick booking bar.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
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
                className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
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
                className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-sm font-serif text-adm-text focus:border-adm-accent outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
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
                className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs text-adm-text focus:border-adm-accent outline-none leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: CONTACT & CONCIERGE INFORMATION                         */}
      {/* ============================================================== */}
      {activeTab === 'contact' && (
        <div className="bg-adm-panel p-6 rounded-xl border border-adm-line space-y-4">
          <div className="pb-3 border-b border-adm-line">
            <h3 className="font-serif text-lg text-adm-text">Concierge & Direct Contact Channels</h3>
            <p className="text-xs text-adm-muted">
              Official phone numbers, WhatsApp, physical address and map links displayed on website and footer.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
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
                className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
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
                className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
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
                className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
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
                className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
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
                className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: SOCIAL MEDIA CHANNELS                                   */}
      {/* ============================================================== */}
      {activeTab === 'socials' && (
        <div className="bg-adm-panel p-6 rounded-xl border border-adm-line space-y-4">
          <div className="pb-3 border-b border-adm-line">
            <h3 className="font-serif text-lg text-adm-text">Social Media Channels</h3>
            <p className="text-xs text-adm-muted">
              Update Instagram, Facebook, TikTok, and YouTube channels rendered in footer and concierge features.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
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
                className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
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
                className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
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
                className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1">
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
                className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs font-mono text-adm-text focus:border-adm-accent outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
