import React, { useState } from 'react';
import { Camera, Maximize2 } from 'lucide-react';
import { GalleryItem, GalleryCategory, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { getLocalizedGallery, GALLERY_TRANSLATIONS, LocalizedGalleryItem } from '../data/galleryTranslations';
import { LightboxModal } from './LightboxModal';
import { ScrollFadeContainer } from './ScrollFadeContainer';

interface GallerySectionProps {
  currentLang: Language;
  items?: GalleryItem[];
}

export const GallerySection: React.FC<GallerySectionProps> = ({ currentLang, items: customItems }) => {
  const t = TRANSLATIONS[currentLang];
  const tGallery = GALLERY_TRANSLATIONS[currentLang] || GALLERY_TRANSLATIONS.en;
  const [activeCategory, setActiveCategory] = useState<GalleryCategory | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const categories: { id: GalleryCategory | 'all'; label: string }[] = [
    { id: 'all', label: tGallery.categories.all },
    { id: 'property', label: tGallery.categories.property },
    { id: 'villas', label: tGallery.categories.villas },
    { id: 'dining', label: tGallery.categories.dining },
    { id: 'pool', label: tGallery.categories.pool },
    { id: 'garden', label: tGallery.categories.garden },
    { id: 'zanzibar', label: tGallery.categories.zanzibar },
    { id: 'experiences', label: tGallery.categories.experiences },
  ];

  const localizedItems = getLocalizedGallery(currentLang, customItems || undefined);

  const filteredItems =
    activeCategory === 'all'
      ? localizedItems
      : localizedItems.filter((item) => item.category === activeCategory);

  return (
    <section id="gallery" className="pt-6 sm:pt-10 md:pt-14 pb-20 sm:pb-28 md:pb-36 bg-[#141413] text-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center space-x-2 text-[11px] tracking-[0.3em] uppercase text-[#C4A27A] font-medium mb-3">
              <Camera className="w-3.5 h-3.5" />
              <span>{tGallery.eyebrow}</span>
            </div>
            <h2
              id="gallery-heading"
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-[0.05em] uppercase text-[#FAF8F5]"
            >
              {t.gallery.heading}
            </h2>
            <p className="text-[#D8CCB8]/80 text-sm sm:text-base mt-2 max-w-xl">
              {t.gallery.subhead}
            </p>
          </div>
        </div>

        {/* Filter Tabs with Dynamic Left & Right Gradient Fade */}
        <ScrollFadeContainer
          className="relative max-w-full overflow-hidden mb-10"
          scrollClassName="flex items-center space-x-2 overflow-x-auto pb-4 pr-14 sm:pr-16 no-scrollbar scroll-smooth"
          leftGradientClass="bg-gradient-to-r from-[#141413] via-[#141413]/90 to-transparent"
          rightGradientClass="bg-gradient-to-l from-[#141413] via-[#141413]/90 to-transparent"
          bottomOffset="bottom-4"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 px-4 py-2 text-xs tracking-[0.14em] uppercase font-semibold rounded-full transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#B8966C] text-[#141413] shadow-lg'
                  : 'bg-[#22211F] text-[#D8CCB8]/70 hover:bg-[#2C2B28] hover:text-[#FAF8F5]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </ScrollFadeContainer>

        {/* Dynamic Editorial Masonry Layout */}
        <div
          id="gallery-masonry-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredItems.map((item, index) => {
            // Give varied aspect ratios for editorial feel
            const isWide = index % 5 === 0;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`relative rounded-xl overflow-hidden cursor-pointer group shadow-lg border border-[#2C2B28] ${
                  isWide ? 'sm:col-span-2 aspect-[16/9]' : 'aspect-[4/3]'
                }`}
              >
                <img
                  src={item.image || item.src}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-[#C4A27A]">
                    {item.localizedCategoryName}
                  </span>
                  <h4 className="font-serif text-lg text-white font-normal tracking-wide">
                    {item.title}
                  </h4>
                  {(item.caption || item.description) && (
                    <p className="text-xs text-[#D8CCB8]/90 line-clamp-1 mt-0.5">
                      {item.caption || item.description}
                    </p>
                  )}
                  <span className="inline-flex items-center space-x-1 text-[10px] uppercase tracking-wider text-[#FAF8F5] mt-3 font-semibold">
                    <Maximize2 className="w-3 h-3 text-[#C4A27A]" />
                    <span>{t.gallery.fullscreen}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedItem && (
        <LightboxModal
          item={selectedItem}
          items={filteredItems}
          currentLang={currentLang}
          onClose={() => setSelectedItem(null)}
          onNavigate={(newItem) => setSelectedItem(newItem)}
        />
      )}
    </section>
  );
};
