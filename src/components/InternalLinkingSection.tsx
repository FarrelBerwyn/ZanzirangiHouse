import React from 'react';
import { ArrowRight, Utensils, Compass, Plane, Home, Mail } from 'lucide-react';

interface RelatedLink {
  title: string;
  description: string;
  url: string;
  ctaText: string;
  icon: 'villas' | 'dining' | 'experiences' | 'safari' | 'contact';
}

interface InternalLinkingSectionProps {
  currentPage: 'villas' | 'dining' | 'experiences' | 'safari' | 'about' | 'contact';
  onNavigate: (url: string) => void;
}

export const InternalLinkingSection: React.FC<InternalLinkingSectionProps> = ({
  currentPage,
  onNavigate,
}) => {
  const allDestinations: Record<string, RelatedLink> = {
    villas: {
      title: 'Private Luxury Villas',
      description: 'Explore 8 handcrafted plunge-pool suites in Kizimkazi with 24/7 dedicated butler service.',
      url: '/villas',
      ctaText: 'Explore our private villas',
      icon: 'villas',
    },
    dining: {
      title: 'Oceanfront Dining',
      description: 'Savor daily line-caught seafood, artisanal Swahili spices, and romantic beachfront candlelit dinners.',
      url: '/dining',
      ctaText: 'Discover oceanfront dining experiences',
      icon: 'dining',
    },
    experiences: {
      title: 'Zanzibar Experiences',
      description: 'Embark on ethical Menai Bay dolphin dhow safaris, Stone Town walks, and organic spice farm tours.',
      url: '/experiences',
      ctaText: 'Explore curated Zanzibar tours',
      icon: 'experiences',
    },
    safari: {
      title: 'Tanzania Safari Connections',
      description: 'Seamless fly-in bush charters from Zanzibar to Serengeti National Park and Ngorongoro Crater.',
      url: '/safari',
      ctaText: 'Discover Tanzania safari journeys',
      icon: 'safari',
    },
    contact: {
      title: 'Concierge & Direct Booking',
      description: 'Coordinate your customized stay, private transfers, and bespoke itinerary with our team.',
      url: '/contact',
      ctaText: 'Contact concierge & reserve directly',
      icon: 'contact',
    },
  };

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
            EXPLORE MORE OF ZANZIRANGI HOUSE
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1B1A]">
            Complete Your Zanzibar & Tanzania Journey
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
