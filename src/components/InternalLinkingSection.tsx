import React from 'react';
import { ArrowRight, Utensils, Compass, Plane, Home, Mail } from 'lucide-react';
import { Language } from '../types';
import { INTERNAL_LINKS_I18N, InternalLinkKey } from '../data/pageTranslations';

interface RelatedLink {
  title: string;
  description: string;
  url: string;
  ctaText: string;
  icon: InternalLinkKey;
}

interface InternalLinkingSectionProps {
  currentPage: 'villas' | 'dining' | 'experiences' | 'safari' | 'about' | 'contact';
  onNavigate: (url: string) => void;
  currentLang?: Language;
}

const LINK_ORDER: InternalLinkKey[] = ['villas', 'dining', 'experiences', 'safari', 'contact'];

export const InternalLinkingSection: React.FC<InternalLinkingSectionProps> = ({
  currentPage,
  onNavigate,
  currentLang = 'en',
}) => {
  const ui = INTERNAL_LINKS_I18N[currentLang] || INTERNAL_LINKS_I18N.en;

  const allDestinations: Record<string, RelatedLink> = {};
  LINK_ORDER.forEach((key) => {
    const copy = ui.links[key];
    allDestinations[key] = {
      title: copy.title,
      description: copy.description,
      url: `/${key}`,
      ctaText: copy.cta,
      icon: key,
    };
  });

  // Filter out current page and select 3 highly relevant internal links
  const linksToDisplay: RelatedLink[] = Object.keys(allDestinations)
    .filter((key) => key !== currentPage)
    .slice(0, 3)
    .map((key) => allDestinations[key]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'villas':
        return <Home className="w-5 h-5 text-[#C4A27A]" />;
      case 'dining':
        return <Utensils className="w-5 h-5 text-[#C4A27A]" />;
      case 'experiences':
        return <Compass className="w-5 h-5 text-[#C4A27A]" />;
      case 'safari':
        return <Plane className="w-5 h-5 text-[#C4A27A]" />;
      default:
        return <Mail className="w-5 h-5 text-[#C4A27A]" />;
    }
  };

  return (
    <section className="py-16 bg-[#F4EFEA] border-t border-[#E5DDD2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-mono tracking-[0.25em] uppercase text-[#A07E54] block mb-2">
            {ui.eyebrow}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1B1A]">
            {ui.heading}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {linksToDisplay.map((link) => (
            <div
              key={link.url}
              className="bg-[#FAF8F5] p-6 rounded-lg border border-[#E7DFD2] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-full bg-[#1C1B1A] flex items-center justify-center mb-4">
                  {getIcon(link.icon)}
                </div>
                <h3 className="font-serif text-xl text-[#1C1B1A] mb-2">{link.title}</h3>
                <p className="text-sm text-[#6B6862] leading-relaxed mb-6">{link.description}</p>
              </div>
              <a
                href={link.url}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(link.url);
                }}
                className="inline-flex items-center space-x-2 text-xs font-semibold tracking-wider uppercase text-[#A07E54] hover:text-[#1C1B1A] transition-colors"
              >
                <span>{link.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
