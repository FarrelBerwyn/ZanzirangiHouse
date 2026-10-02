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

export const TermsPage: React.FC<LegalPageProps> = ({ onNavigate, pageContent, currentLang = 'en' }) => {
  const pageNames = PAGE_NAMES[currentLang] || PAGE_NAMES.en;
  const headers = PAGE_HEADERS[currentLang] || PAGE_HEADERS.en;

  return (
    <LegalPageLayout
      slug="terms"
      pageContent={pageContent}
      fallbackEyebrow={headers.termsEyebrow}
      fallbackTitle={pageNames.terms}
      fallbackLastUpdated={headers.lastUpdated}
      lastUpdatedPrefix={headers.lastUpdatedPrefix}
      breadcrumbs={
        <Breadcrumbs
          items={[
            { name: pageNames.home, url: '/' },
            { name: pageNames.terms, url: '/terms' },
          ]}
          onNavigate={onNavigate}
          currentLang={currentLang}
        />
      }
      fallbackBody={
        <>
          <p>
            Welcome to <strong>Zanzirangi House</strong>. By accessing our website (
            <a href="https://zanzirangihouse.com/" className="text-[#A07E54] underline">
              https://zanzirangihouse.com/
            </a>
            ) or submitting accommodation and excursion requests, you agree to comply with the following hospitality terms and reservation guidelines.
          </p>

          <h2 className="font-serif text-xl text-[#1C1B1A] pt-4">1. Reservations & Payments</h2>
          <p>
            Nightly villa rates range between $390 and $480+ USD and include private plunge pool access, gourmet breakfast, and 24/7 dedicated butler service. Confirmation requires an agreed deposit or voucher via official reservation channels.
          </p>

          <h2 className="font-serif text-xl text-[#1C1B1A] pt-4">2. Check-In & Check-Out Times</h2>
          <p>
            Standard check-in is from 14:00 (2:00 PM), and check-out is by 11:00 (11:00 AM). Early arrival or late departure may be requested through your personal concierge, subject to villa availability.
          </p>

          <h2 className="font-serif text-xl text-[#1C1B1A] pt-4">3. Marine Conservation & Wildlife Etiquette</h2>
          <p>
            Zanzirangi House borders the Menai Bay Marine Conservation Area. Guests participating in dhow sailing and dolphin excursions agree to follow ethical wildlife protocols, maintaining respectful distances from marine wildlife in compliance with local environmental regulations.
          </p>

          <h2 className="font-serif text-xl text-[#1C1B1A] pt-4">4. Inquiries & Cancellations</h2>
          <p>
            To modify or cancel a reservation, contact our concierge directly via email at{' '}
            <a href={`mailto:${PROPERTY_CONFIG.email}`} className="text-[#A07E54] underline">
              {PROPERTY_CONFIG.email}
            </a>{' '}
            or WhatsApp at {PROPERTY_CONFIG.contact.whatsapp}.
          </p>
        </>
      }
    />
  );
};
