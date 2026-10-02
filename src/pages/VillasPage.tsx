import React from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { VillasSection } from '../components/VillasSection';
import { FacilitiesSection } from '../components/FacilitiesSection';
import { InternalLinkingSection } from '../components/InternalLinkingSection';
import { Language, Villa, Facility } from '../types';
import { PAGE_HEADERS, PAGE_NAMES } from '../data/pageTranslations';
import { PageContentModel } from '../services/contentApi';
import { HomeSectionsContent } from '../data/homeSectionsCms';
import { PageHeader, renderPageSections } from './pageSections';

interface VillasPageProps {
  currentLang: Language;
  onNavigate: (url: string) => void;
  onSelectVilla: (villa: Villa) => void;
  onRequestBooking: (villaId?: string) => void;
  villas?: Villa[];
  facilities?: Facility[];
  pageContent?: PageContentModel | null;
  homeSections?: HomeSectionsContent;
}

export const VillasPage: React.FC<VillasPageProps> = ({
  currentLang,
  onNavigate,
  onSelectVilla,
  onRequestBooking,
  villas,
  facilities,
  pageContent,
  homeSections,
}) => {
  const pageNames = PAGE_NAMES[currentLang] || PAGE_NAMES.en;
  const fallback = (PAGE_HEADERS[currentLang] || PAGE_HEADERS.en).villas;

  return (
    <div className="pt-24 sm:pt-28 pb-16 bg-[#FAF8F5]">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-4">
        <Breadcrumbs
          items={[
            { name: pageNames.home, url: '/' },
            { name: pageNames.villas, url: '/villas' },
          ]}
          onNavigate={onNavigate}
          currentLang={currentLang}
        />
      </div>

      {renderPageSections('villas', pageContent, {
        // Hero Header for Villas
        header: () => <PageHeader pageContent={pageContent} fallback={fallback} />,
        // Full Interactive Villa Inventory
        villas_grid: () => (
          <VillasSection
            currentLang={currentLang}
            onSelectVilla={onSelectVilla}
            onRequestBooking={onRequestBooking}
            villas={villas}
            cmsContent={homeSections?.villas}
          />
        ),
        // Supporting Amenities & Estate Facilities
        facilities: () => (
          <FacilitiesSection currentLang={currentLang} facilities={facilities} cmsContent={homeSections?.facilities} />
        ),
        // Contextual Internal Links
        internal_links: () => (
          <InternalLinkingSection currentPage="villas" onNavigate={onNavigate} currentLang={currentLang} />
        ),
      })}
    </div>
  );
};
