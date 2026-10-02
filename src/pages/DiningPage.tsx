import React from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { DiningSection } from '../components/DiningSection';
import { InternalLinkingSection } from '../components/InternalLinkingSection';
import { Language } from '../types';
import { PAGE_HEADERS, PAGE_NAMES } from '../data/pageTranslations';
import { PageContentModel, DiningConfigModel } from '../services/contentApi';
import { PageHeader, renderPageSections } from './pageSections';

interface DiningPageProps {
  currentLang: Language;
  onNavigate: (url: string) => void;
  onRequestBooking: () => void;
  pageContent?: PageContentModel | null;
  dynamicDining?: DiningConfigModel | null;
}

export const DiningPage: React.FC<DiningPageProps> = ({
  currentLang,
  onNavigate,
  onRequestBooking,
  pageContent,
  dynamicDining,
}) => {
  const pageNames = PAGE_NAMES[currentLang] || PAGE_NAMES.en;
  const fallback = (PAGE_HEADERS[currentLang] || PAGE_HEADERS.en).dining;

  return (
    <div className="pt-24 sm:pt-28 pb-16 bg-[#FAF8F5]">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-4">
        <Breadcrumbs
          items={[
            { name: pageNames.home, url: '/' },
            { name: pageNames.dining, url: '/dining' },
          ]}
          onNavigate={onNavigate}
          currentLang={currentLang}
        />
      </div>

      {renderPageSections('dining', pageContent, {
        // Hero Header for Dining
        header: () => <PageHeader pageContent={pageContent} fallback={fallback} />,
        // Interactive Dining Menu & Offerings
        dining_section: () => <DiningSection currentLang={currentLang} dynamicConfig={dynamicDining} />,
        // Contextual Internal Links
        internal_links: () => (
          <InternalLinkingSection currentPage="dining" onNavigate={onNavigate} currentLang={currentLang} />
        ),
      })}
    </div>
  );
};
