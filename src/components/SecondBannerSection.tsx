import React from 'react';
import { Sparkles, Compass } from 'lucide-react';
import { Language } from '../types';

interface SecondBannerSectionProps {
  currentLang: Language;
  onOpenBooking?: () => void;
}

const SECOND_BANNER_I18N: Record<
  Language,
  { imageAlt: string; tag: string; location: string; heading: string; body: string; cta: string; badges: string }
> = {
  en: {
    imageAlt: 'Zanzirangi House luxury poolside oceanfront sanctuary',
    tag: 'Private Sanctuary • Oceanfront Sun Deck',
    location: 'Zanzibar South Coast • Kizimkazi',
    heading: 'Where Turquoise Waters Meet Coastal Solitude',
    body: 'Unwind upon handcrafted teak sun loungers overlooking the calm tides of Menai Bay. An intimate setting engineered for total rejuvenation, bespoke butler care, and unforgettable sunsets.',
    cta: 'Reserve Your Escape',
    badges: 'Infinity Pool • Private Beach Access • Dedicated Host',
  },
  pl: {
    imageAlt: 'Luksusowe sanktuarium Zanzirangi House przy basenie z widokiem na ocean',
    tag: 'Prywatne Sanktuarium • Taras Słoneczny nad Oceanem',
    location: 'Południowe Wybrzeże Zanzibaru • Kizimkazi',
    heading: 'Gdzie Turkusowe Wody Spotykają Nadmorską Ciszę',
    body: 'Odpocznij na ręcznie wykonanych leżakach z drewna tekowego z widokiem na spokojne pływy Menai Bay. Kameralne miejsce stworzone dla pełnej regeneracji, troskliwej opieki kamerdynera i niezapomnianych zachodów słońca.',
    cta: 'Zarezerwuj Swój Wypoczynek',
    badges: 'Basen Bezkrawędziowy • Prywatny Dostęp do Plaży • Dedykowany Gospodarz',
  },
  ar: {
    imageAlt: 'ملاذ Zanzirangi House الفاخر بجانب المسبح المطل على المحيط',
    tag: 'ملاذ خاص • شرفة شمسية مطلة على المحيط',
    location: 'الساحل الجنوبي لزنجبار • كيزيمكازي',
    heading: 'حيث تلتقي المياه الفيروزية بسكينة الساحل',
    body: 'استرخوا على كراسي استلقاء من خشب الساج المصنوعة يدويًا والمطلة على المد الهادئ لخليج ميناي. أجواء حميمة صُممت لتجديد كامل للنشاط، ورعاية خادم شخصي مخصصة، وغروب لا يُنسى.',
    cta: 'احجزوا ملاذكم',
    badges: 'مسبح لا متناهٍ • وصول خاص إلى الشاطئ • مضيف مخصص',
  },
  zh: {
    imageAlt: 'Zanzirangi House 奢华临海泳池秘境',
    tag: '私享秘境 • 临海日光甲板',
    location: '桑给巴尔南海岸 • 基济姆卡济',
    heading: '碧蓝海水与海岸静谧交汇之处',
    body: '在手工柚木日光躺椅上放松身心，俯瞰梅奈湾平静的潮汐。私密雅致的环境，专为全然焕新、定制管家关怀与难忘日落而打造。',
    cta: '预订您的度假之旅',
    badges: '无边泳池 • 私享海滩通道 • 专属管家',
  },
  fr: {
    imageAlt: "Sanctuaire de luxe Zanzirangi House au bord de la piscine face à l'océan",
    tag: "Sanctuaire Privé • Terrasse Face à l'Océan",
    location: 'Côte Sud de Zanzibar • Kizimkazi',
    heading: 'Là Où les Eaux Turquoise Rencontrent la Quiétude du Rivage',
    body: 'Détendez-vous sur des transats en teck artisanal face aux marées paisibles de Menai Bay. Un cadre intime pensé pour un ressourcement total, un service de majordome sur mesure et des couchers de soleil inoubliables.',
    cta: 'Réservez Votre Évasion',
    badges: 'Piscine à Débordement • Accès Privé à la Plage • Hôte Dédié',
  },
  sw: {
    imageAlt: 'Makazi ya kifahari ya Zanzirangi House kando ya bwawa yanayotazama bahari',
    tag: 'Makazi Binafsi • Sitaha ya Jua Ufukweni',
    location: 'Pwani ya Kusini ya Zanzibar • Kizimkazi',
    heading: 'Pale Maji ya Samawati Yanapokutana na Utulivu wa Pwani',
    body: 'Pumzika juu ya viti vya mbao za mninga vilivyotengenezwa kwa mikono, ukitazama mawimbi tulivu ya Ghuba ya Menai. Mazingira ya faragha yaliyoundwa kwa ajili ya kujiburudisha kikamilifu, huduma maalum ya mhudumu binafsi, na machweo yasiyosahaulika.',
    cta: 'Hifadhi Mapumziko Yako',
    badges: 'Bwawa la Infinity • Ufikiaji Binafsi wa Ufukwe • Mwenyeji Maalum',
  },
  es: {
    imageAlt: 'Santuario de lujo de Zanzirangi House junto a la piscina frente al mar',
    tag: 'Santuario Privado • Solárium Frente al Mar',
    location: 'Costa Sur de Zanzíbar • Kizimkazi',
    heading: 'Donde las Aguas Turquesa se Encuentran con la Calma de la Costa',
    body: 'Relájese en tumbonas artesanales de teca con vistas a las serenas mareas de Menai Bay. Un entorno íntimo concebido para el rejuvenecimiento total, la atención personalizada de un mayordomo y atardeceres inolvidables.',
    cta: 'Reserve Su Escapada',
    badges: 'Piscina Infinita • Acceso Privado a la Playa • Anfitrión Dedicado',
  },
  it: {
    imageAlt: 'Rifugio di lusso Zanzirangi House a bordo piscina fronte oceano',
    tag: 'Rifugio Privato • Solarium Fronte Oceano',
    location: 'Costa Sud di Zanzibar • Kizimkazi',
    heading: 'Dove le Acque Turchesi Incontrano la Quiete della Costa',
    body: 'Rilassatevi su lettini in teak artigianale affacciati sulle maree tranquille di Menai Bay. Un ambiente intimo pensato per una rigenerazione totale, le attenzioni su misura di un maggiordomo e tramonti indimenticabili.',
    cta: 'Prenota la Tua Fuga',
    badges: 'Piscina a Sfioro • Accesso Privato alla Spiaggia • Host Dedicato',
  },
};

export const SecondBannerSection: React.FC<SecondBannerSectionProps> = ({
  currentLang,
  onOpenBooking,
}) => {
  const ui = SECOND_BANNER_I18N[currentLang] || SECOND_BANNER_I18N.en;

  return (
    <section
      id="second-image-banner"
      className="relative w-full h-[520px] md:h-[620px] lg:h-[700px] overflow-hidden bg-[#141413] text-[#FAF8F5]"
    >
      {/* Background Image: The previous first banner luxury poolside oceanfront image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2400&q=90"
          alt={ui.imageAlt}
          className="w-full h-full object-cover object-center filter brightness-[0.78] contrast-[1.06] transition-transform duration-[12000ms] hover:scale-105"
        />
        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141413] via-black/30 to-black/45" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Floating Content Over Banner */}
      <div className="relative z-10 max-w-6xl mx-auto h-full px-6 md:px-12 flex flex-col justify-between py-16 md:py-24">
        {/* Top Eyebrow Tag */}
        <div className="inline-flex items-center space-x-2 self-start px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#D8CCB8] text-[10px] sm:text-xs tracking-[0.3em] uppercase">
          <Sparkles className="w-3.5 h-3.5 text-[#C4A27A]" />
          <span>{ui.tag}</span>
        </div>

        {/* Center Main Text */}
        <div className="max-w-3xl">
          <span className="text-[11px] sm:text-xs tracking-[0.35em] text-[#C4A27A] uppercase font-mono block mb-3">
            {ui.location}
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-light tracking-[0.06em] uppercase text-[#FAF8F5] leading-[1.15] mb-6 drop-shadow-lg">
            {ui.heading}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-[#E7DFD2]/95 font-light leading-relaxed max-w-2xl drop-shadow">
            {ui.body}
          </p>

          {onOpenBooking && (
            <div className="mt-8 flex items-center space-x-4">
              <button
                onClick={onOpenBooking}
                className="px-7 py-3 bg-[#B8966C] hover:bg-[#C4A27A] text-[#141413] text-xs tracking-[0.2em] uppercase font-semibold rounded transition-all duration-300 shadow-xl transform active:scale-95"
              >
                {ui.cta}
              </button>
            </div>
          )}
        </div>

        {/* Bottom Coordinates & Badges */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/15 text-xs text-[#D8CCB8]/80 font-mono tracking-wider">
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-[#C4A27A]" />
            <span>6°26'34.4"S 39°28'04.1"E</span>
          </div>
          <span>{ui.badges}</span>
        </div>
      </div>
    </section>
  );
};
