import React from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';

interface LegalPageProps {
  onNavigate: (url: string) => void;
}

export const PrivacyPage: React.FC<LegalPageProps> = ({ onNavigate }) => {
  return (
    <div className="pt-24 sm:pt-28 pb-16 bg-[#FAF8F5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        <Breadcrumbs
          items={[
            { name: 'Home', url: '/' },
            { name: 'Privacy Policy', url: '/privacy' },
          ]}
          onNavigate={onNavigate}
        />

        <header className="pt-6 pb-8 border-b border-[#E7DFD2]">
          <span className="text-xs font-mono tracking-[0.25em] uppercase text-[#A07E54] block mb-2">
            LEGAL & TRUST ASSURANCE
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1B1A]">Privacy Policy</h1>
          <p className="text-xs text-[#6B6862] mt-2 font-mono">Last Updated: September 2026</p>
        </header>

        <article className="prose prose-stone max-w-none pt-8 space-y-6 text-sm text-[#4A4742] leading-relaxed">
          <p>
            At <strong>Zanzirangi House</strong> (accessible from <a href="https://zanzirangihouse.com/" className="text-[#A07E54] underline">https://zanzirangihouse.com/</a>), safeguarding our guests’ personal data and privacy is of utmost importance. This Privacy Policy details how we collect, use, and protect information when you visit our website, submit booking inquiries, or communicate with our concierge team.
          </p>

          <h2 className="font-serif text-xl text-[#1C1B1A] pt-4">1. Information We Collect</h2>
          <p>
            When submitting an inquiry or reserving a private villa, you may provide details including your full name, email address, telephone/WhatsApp number, arrival/departure dates, guest party size, and special hospitality or dietary preferences.
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
            We implement strict technical and administrative safeguards. We do not sell, rent, or lease guest information to third-party commercial marketing networks. Data is shared exclusively with licensed local service providers (such as official TANAPA safari charter operators) strictly to fulfill your agreed itinerary.
          </p>

          <h2 className="font-serif text-xl text-[#1C1B1A] pt-4">4. Contact Our Concierge</h2>
          <p>
            For any privacy inquiries or to request data removal, contact our data protection team directly at <a href="mailto:concierge@zanzirangihouse.com" className="text-[#A07E54] underline">concierge@zanzirangihouse.com</a> or via official telephone at +255 777 890 123.
          </p>
        </article>
      </div>
    </div>
  );
};
