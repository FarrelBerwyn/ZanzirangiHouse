import React from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ExperiencesSection } from '../components/ExperiencesSection';
import { ExploreZanzibarSection } from '../components/ExploreZanzibarSection';
import { InternalLinkingSection } from '../components/InternalLinkingSection';
import { Language } from '../types';
import { PAGE_HEADERS, PAGE_NAMES } from '../data/pageTranslations';
import { HomeSectionsContent } from '../data/homeSectionsCms';
import { PageContentModel, ExperienceModel } from '../services/contentApi';
import { PageHeader, renderPageSections } from './pageSections';

interface ExperiencesPageProps {
  currentLang: Language;
  onNavigate: (url: string) => void;
  onRequestBooking: () => void;
  onOpenSupportChat: (initialQuery?: string) => void;
  pageContent?: PageContentModel | null;
  dynamicExperiences?: ExperienceModel[] | null;
  homeSections?: HomeSectionsContent;
}

export const ExperiencesPage: React.FC<ExperiencesPageProps> = ({
  currentLang,
  onNavigate,
  onRequestBooking,
  onOpenSupportChat,
  pageContent,
  dynamicExperiences,
  homeSections,
}) => {
  const pageNames = PAGE_NAMES[currentLang] || PAGE_NAMES.en;
  const fallback = (PAGE_HEADERS[currentLang] || PAGE_HEADERS.en).experiences;

  return (
    <div className="pt-24 sm:pt-28 pb-16 bg-[#FAF8F5]">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-4">
        <Breadcrumbs
          items={[
            { name: pageNames.home, url: '/' },
            { name: pageNames.experiences, url: '/experiences' },
          ]}
          onNavigate={onNavigate}
          currentLang={currentLang}
        />
      </div>

      {renderPageSections('experiences', pageContent, {
        // Hero Header for Experiences
        header: () => <PageHeader pageContent={pageContent} fallback={fallback} />,
        // Core Experiences Section
        experiences_grid: () => (
          <ExperiencesSection
            currentLang={currentLang}
            onOpenBooking={onRequestBooking}
            onOpenSupportChat={onOpenSupportChat}
            dynamicExperiences={dynamicExperiences}
          />
        ),
        // Explore Zanzibar Island Highlights
        explore_zanzibar: () => (
          <ExploreZanzibarSection
            currentLang={currentLang}
            onOpenBooking={onRequestBooking}
            cmsContent={homeSections?.explore}
          />
        ),
        // Contextual Internal Links
        internal_links: () => (
          <InternalLinkingSection currentPage="experiences" onNavigate={onNavigate} currentLang={currentLang} />
        ),
      })}
    </div>
  );
};
