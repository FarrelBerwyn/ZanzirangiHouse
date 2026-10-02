import React from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { MapSection } from '../components/MapSection';
import { ShuttleSection } from '../components/ShuttleSection';
import { ConciergeSection } from '../components/ConciergeSection';
import { InternalLinkingSection } from '../components/InternalLinkingSection';
import { Language } from '../types';
import { PAGE_HEADERS, PAGE_NAMES } from '../data/pageTranslations';
import { HomeSectionsContent } from '../data/homeSectionsCms';
import { PageContentModel, ChauffeurConfigModel, GlobalContentModel, HomepageContent } from '../services/contentApi';
import { PageHeader, renderPageSections } from './pageSections';

interface ContactPageProps {
  currentLang: Language;
  onNavigate: (url: string) => void;
  onRequestBooking: () => void;
  onOpenSupportChat: (initialQuery?: string) => void;
  pageContent?: PageContentModel | null;
  dynamicChauffeur?: ChauffeurConfigModel | null;
  dynamicGlobal?: GlobalContentModel | null;
  homepageContent?: HomepageContent | null;
  homeSections?: HomeSectionsContent;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  currentLang,
  onNavigate,
  onRequestBooking,
  onOpenSupportChat,
  pageContent,
  dynamicChauffeur,
  homepageContent,
  homeSections,
}) => {
  const pageNames = PAGE_NAMES[currentLang] || PAGE_NAMES.en;
  const fallback = (PAGE_HEADERS[currentLang] || PAGE_HEADERS.en).contact;

  return (
    <div className="pt-24 sm:pt-28 pb-16 bg-[#FAF8F5]">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-4">
        <Breadcrumbs
          items={[
            { name: pageNames.home, url: '/' },
            { name: pageNames.contact, url: '/contact' },
          ]}
          onNavigate={onNavigate}
          currentLang={currentLang}
        />
      </div>

      {renderPageSections('contact', pageContent, {
        // Hero Header for Contact
        header: () => <PageHeader pageContent={pageContent} fallback={fallback} />,
        // Concierge Feature
        concierge: () => (
          <ConciergeSection
            currentLang={currentLang}
            onOpenSupportChat={onOpenSupportChat}
            cmsContent={homeSections?.concierge}
          />
        ),
        // Shuttle & Airport Arrival
        shuttle: () => (
          <ShuttleSection currentLang={currentLang} onOpenBooking={onRequestBooking} dynamicConfig={dynamicChauffeur} />
        ),
        // Location Map & Coordinates
        map: () => (
          <MapSection currentLang={currentLang} cmsContent={homeSections?.map} contact={homepageContent?.contact} />
        ),
        // Contextual Internal Links
        internal_links: () => (
          <InternalLinkingSection currentPage="contact" onNavigate={onNavigate} currentLang={currentLang} />
        ),
      })}
    </div>
  );
};
