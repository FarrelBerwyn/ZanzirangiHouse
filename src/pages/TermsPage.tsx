import React from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';

interface LegalPageProps {
  onNavigate: (url: string) => void;
}

export const TermsPage: React.FC<LegalPageProps> = ({ onNavigate }) => {
  return (
    <div className="pt-24 sm:pt-28 pb-16 bg-[#FAF8F5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        <Breadcrumbs
          items={[
            { name: 'Home', url: '/' },
            { name: 'Terms & Conditions', url: '/terms' },
          ]}
          onNavigate={onNavigate}
        />

        <header className="pt-6 pb-8 border-b border-[#E7DFD2]">
          <span className="text-xs font-mono tracking-[0.25em] uppercase text-[#A07E54] block mb-2">
            HOSPITALITY POLICIES & TERMS
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1B1A]">Terms & Conditions</h1>
          <p className="text-xs text-[#6B6862] mt-2 font-mono">Last Updated: September 2026</p>
        </header>

        <article className="prose prose-stone max-w-none pt-8 space-y-6 text-sm text-[#4A4742] leading-relaxed">
          <p>
            Welcome to <strong>Zanzirangi House</strong>. By accessing our website (<a href="https://zanzirangihouse.com/" className="text-[#A07E54] underline">https://zanzirangihouse.com/</a>) or submitting accommodation and excursion requests, you agree to comply with the following hospitality terms and reservation guidelines.
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
            To modify or cancel a reservation, contact our concierge directly via email at <a href="mailto:concierge@zanzirangihouse.com" className="text-[#A07E54] underline">concierge@zanzirangihouse.com</a> or WhatsApp at +255 777 890 123.
          </p>
        </article>
      </div>
    </div>
  );
};
