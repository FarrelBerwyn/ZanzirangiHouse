import React from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { BeyondZanzibarSection } from '../components/BeyondZanzibarSection';
import { CustomItinerarySection } from '../components/CustomItinerarySection';
import { InternalLinkingSection } from '../components/InternalLinkingSection';
import { Language } from '../types';
import { PAGE_HEADERS, PAGE_NAMES } from '../data/pageTranslations';
import { HomeSectionsContent } from '../data/homeSectionsCms';
import { PageContentModel, SafariDestinationModel } from '../services/contentApi';
import { PageHeader, renderPageSections } from './pageSections';

interface SafariPageProps {
  currentLang: Language;
  onNavigate: (url: string) => void;
  onRequestBooking: () => void;
  onOpenSupportChat: (initialQuery?: string) => void;
  pageContent?: PageContentModel | null;
  dynamicSafari?: SafariDestinationModel[] | null;
  homeSections?: HomeSectionsContent;
}

export const SafariPage: React.FC<SafariPageProps> = ({
  currentLang,
  onNavigate,
  onRequestBooking,
  onOpenSupportChat,
  pageContent,
  dynamicSafari,
  homeSections,
}) => {
  const pageNames = PAGE_NAMES[currentLang] || PAGE_NAMES.en;
  const fallback = (PAGE_HEADERS[currentLang] || PAGE_HEADERS.en).safari;

  return (
    <div className="pt-24 sm:pt-28 pb-16 bg-[#FAF8F5]">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-4">
        <Breadcrumbs
          items={[
            { name: pageNames.home, url: '/' },
            { name: pageNames.safari, url: '/safari' },
          ]}
          onNavigate={onNavigate}
          currentLang={currentLang}
        />
      </div>

      {renderPageSections('safari', pageContent, {
        // Hero Header for Safari
        header: () => <PageHeader pageContent={pageContent} fallback={fallback} />,
        // Mainland Safaris Showcase
        safari_destinations: () => (
          <BeyondZanzibarSection
            currentLang={currentLang}
            onOpenBooking={onRequestBooking}
            onOpenSupportChat={onOpenSupportChat}
            dynamicDestinations={dynamicSafari}
          />
        ),
        // Custom Itinerary Builder
        itinerary_builder: () => (
          <CustomItinerarySection
            currentLang={currentLang}
            onOpenSupportChat={onOpenSupportChat}
            cmsContent={homeSections?.itinerary}
          />
        ),
        // Contextual Internal Links
        internal_links: () => (
          <InternalLinkingSection currentPage="safari" onNavigate={onNavigate} currentLang={currentLang} />
        ),
      })}
    </div>
  );
};
