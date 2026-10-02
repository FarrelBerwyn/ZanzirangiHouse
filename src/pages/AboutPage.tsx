import React from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { PropertyIntro } from '../components/PropertyIntro';
import { PropertyExperienceSection } from '../components/PropertyExperienceSection';
import { WhyStaySection } from '../components/WhyStaySection';
import { InternalLinkingSection } from '../components/InternalLinkingSection';
import { Language } from '../types';
import { PAGE_HEADERS, PAGE_NAMES } from '../data/pageTranslations';
import { HomeSectionsContent } from '../data/homeSectionsCms';
import { PageContentModel, WhyStayConfigModel, HomepageContent } from '../services/contentApi';
import { PageHeader, renderPageSections } from './pageSections';

interface AboutPageProps {
  currentLang: Language;
  onNavigate: (url: string) => void;
  onRequestBooking: () => void;
  pageContent?: PageContentModel | null;
  dynamicWhyStay?: WhyStayConfigModel | null;
  homepageContent?: HomepageContent | null;
  homeSections?: HomeSectionsContent;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  currentLang,
  onNavigate,
  onRequestBooking,
  pageContent,
  dynamicWhyStay,
  homepageContent,
  homeSections,
}) => {
  const pageNames = PAGE_NAMES[currentLang] || PAGE_NAMES.en;
  const fallback = (PAGE_HEADERS[currentLang] || PAGE_HEADERS.en).about;

  return (
    <div className="pt-24 sm:pt-28 pb-16 bg-[#FAF8F5]">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-4">
        <Breadcrumbs
          items={[
            { name: pageNames.home, url: '/' },
            { name: pageNames.about, url: '/about' },
          ]}
          onNavigate={onNavigate}
          currentLang={currentLang}
        />
      </div>

      {renderPageSections('about', pageContent, {
        // Hero Header for About
        header: () => <PageHeader pageContent={pageContent} fallback={fallback} />,
        // Property Editorial Intro (shares the homepage intro copy)
        property_intro: () => <PropertyIntro currentLang={currentLang} dynamicIntro={homepageContent?.intro} />,
        // Property Experience
        property_experience: () => (
          <PropertyExperienceSection currentLang={currentLang} cmsContent={homeSections?.experience} />
        ),
        // Why Stay Section
        why_stay: () => <WhyStaySection currentLang={currentLang} dynamicWhyStay={dynamicWhyStay} />,
        // Contextual Internal Links
        internal_links: () => (
          <InternalLinkingSection currentPage="about" onNavigate={onNavigate} currentLang={currentLang} />
        ),
      })}
    </div>
  );
};
