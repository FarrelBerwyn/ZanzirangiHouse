import React from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { PROPERTY_CONFIG } from '../data/propertyConfig';
import { PageContentModel } from '../services/contentApi';
import { Language } from '../types';
import { PAGE_HEADERS, PAGE_NAMES } from '../data/pageTranslations';
import { LegalPageLayout } from './pageSections';

interface LegalPageProps {
  onNavigate: (url: string) => void;
  pageContent?: PageContentModel | null;
  currentLang?: Language;
}

export const PrivacyPage: React.FC<LegalPageProps> = ({ onNavigate, pageContent, currentLang = 'en' }) => {
  const pageNames = PAGE_NAMES[currentLang] || PAGE_NAMES.en;
  const headers = PAGE_HEADERS[currentLang] || PAGE_HEADERS.en;

  return (
    <LegalPageLayout
      slug="privacy"
      pageContent={pageContent}
      fallbackEyebrow={headers.privacyEyebrow}
      fallbackTitle={pageNames.privacy}
      fallbackLastUpdated={headers.lastUpdated}
      lastUpdatedPrefix={headers.lastUpdatedPrefix}
      breadcrumbs={
        <Breadcrumbs
          items={[
            { name: pageNames.home, url: '/' },
            { name: pageNames.privacy, url: '/privacy' },
          ]}
          onNavigate={onNavigate}
          currentLang={currentLang}
        />
      }
      fallbackBody={
        <>
          <p>
            At <strong>Zanzirangi House</strong> (accessible from{' '}
            <a href="https://zanzirangihouse.com/" className="text-[#A07E54] underline">
              https://zanzirangihouse.com/
            </a>
            ), safeguarding our guests’ personal data and privacy is of utmost importance. This Privacy Policy details
            how we collect, use, and protect information when you visit our website, submit booking inquiries, or
            communicate with our concierge team.
          </p>

          <h2 className="font-serif text-xl text-[#1C1B1A] pt-4">1. Information We Collect</h2>
          <p>
            When submitting an inquiry or reserving a private villa, you may provide details including your full name,
            email address, telephone/WhatsApp number, arrival/departure dates, guest party size, and special hospitality
            or dietary preferences.
          </p>

          <h2 className="font-serif text-xl text-[#1C1B1A] pt-4">2. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Facilitating reservation inquiries and room availability checks.</li>
            <li>Coordinating airport chauffeur transfers from Abeid Amani Karume International Airport (ZNZ).</li>
            <li>Customizing private dining, marine dolphin tours, and mainland Tanzania safari connections.</li>
            <li>Providing 24/7 personal butler and concierge communications.</li>
          </ul>

          <h2 className="font-serif text-xl text-[#1C1B1A] pt-4">3. Data Security & Third-Party Disclosure</h2>
          <p>
            We implement strict technical and administrative safeguards. We do not sell, rent, or lease guest information
            to third-party commercial marketing networks. Data is shared exclusively with licensed local service
            providers (such as official TANAPA safari charter operators) strictly to fulfill your agreed itinerary.
          </p>

          <h2 className="font-serif text-xl text-[#1C1B1A] pt-4">4. Contact Our Concierge</h2>
          <p>
            For any privacy inquiries or to request data removal, contact our data protection team directly at{' '}
            <a href={`mailto:${PROPERTY_CONFIG.email}`} className="text-[#A07E54] underline">
              {PROPERTY_CONFIG.email}
            </a>{' '}
            or via official telephone at {PROPERTY_CONFIG.phone}.
          </p>
        </>
      }
    />
  );
};
