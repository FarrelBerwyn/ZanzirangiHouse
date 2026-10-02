import React, { useState } from 'react';
import { Play, Pause, Film, Volume2, VolumeX, Sparkles, X } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { HomeSectionContent, cmsText } from '../data/homeSectionsCms';

interface PromotionalVideoSectionProps {
  currentLang: Language;
  dynamicVideo?: {
    videoUrl?: string;
    posterImage?: string;
    scenes?: Array<{
      id: string;
      title: string;
      description: string;
      image: string;
      time: string;
    }>;
  };
  cmsContent?: HomeSectionContent;
}

export const PromotionalVideoSection: React.FC<PromotionalVideoSectionProps> = ({
  currentLang,
  dynamicVideo,
  cmsContent,
}) => {
  const t = TRANSLATIONS[currentLang];
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  const videoUi: Record<
    Language,
    {
      eyebrow: string;
      badge: string;
      playing: string;
      ready: string;
      timeline: string;
      sceneCount: (current: number, total: number) => string;
      playAria: string;
      pauseAria: string;
      toggleAudioAria: string;
      descriptions: string[];
    }
  > = {
    en: {
      eyebrow: 'Cinematic Brand Reel',
      badge: '4K Ultra HD • Concept Storyboard',
      playing: 'Playing Scene',
      ready: 'Storyboard Ready',
      timeline: 'Timeline',
      sceneCount: (c, t) => `Scene ${c} of ${t}`,
      playAria: 'Play film',
      pauseAria: 'Pause film',
      toggleAudioAria: 'Toggle Audio',
      descriptions: [
        'Private airport chauffeur arrival & traditional iced lemongrass towel welcome',
        'Makuti timber architecture nestled within ancient baobab groves',
        'Handcrafted teak interiors, floor-to-ceiling glass, and limestone plunge pool',
        'Freshwater infinity pool overlooking the turquoise Menai Bay reef',
        'Farm-fresh Swahili spices, wild yellowfin tuna, and candlelit ocean pavilion',
        'Hand-hewn dhow wooden boat sailing into the Indian Ocean golden twilight',
        'The gateway to the Serengeti & wild Tanzanian mainland expeditions',
      ],
    },
    pl: {
      eyebrow: 'Film Wizerunkowy',
      badge: '4K Ultra HD • Scenorys Koncepcyjny',
      playing: 'Odtwarzanie sceny',
      ready: 'Gotowe do odtworzenia',
      timeline: 'Oś czasu',
      sceneCount: (c, t) => `Scena ${c} z ${t}`,
      playAria: 'Odtwórz film',
      pauseAria: 'Zatrzymaj film',
      toggleAudioAria: 'Przełącz dźwięk',
      descriptions: [
        'Prywatny transfer z lotniska z szoferem i tradycyjne powitanie chłodnymi ręcznikami z trawą cytrynową',
        'Architektura z drewna makuti w cieniu wiekowych gajów baobabów',
        'Ręcznie wykonane wnętrza z drewna tekowego, panoramiczne przeszklenia i basen ze skały wapiennej',
        'Basen bezkrawędziowy ze słodką wodą z widokiem na turkusową rafę Menai Bay',
        'Świeże przyprawy z plantacji, dziki tuńczyk żółtopłetwy i pawilon nad oceanem przy świecach',
        'Tradycyjna drewniana łódź dhow żeglująca ku złocistemu zmierzchowi Oceanu Indyjskiego',
        'Brama do Serengeti i dzikich ekspedycji na lądzie Tanzanii',
      ],
    },
    ar: {
      eyebrow: 'شريط سينمائي تعريفي',
      badge: '4K فائق الدقة • لوحة القصة المفاهيمية',
      playing: 'تشغيل المشهد',
      ready: 'جاهز للعرض',
      timeline: 'الجدول الزمني',
      sceneCount: (c, t) => `المشهد ${c} من ${t}`,
      playAria: 'تشغيل الفيديو',
      pauseAria: 'إيقاف الفيديو مؤقتاً',
      toggleAudioAria: 'تبديل الصوت',
      descriptions: [
        'وصول خاص مع سائق من المطار واستقبال تقليدي بمناشف عشب الليمون المثلجة',
        'عمارة خشبية بطراز ماكوتي الساحلي وسط بساتين أشجار الباوباب التاريخية',
        'تصميمات داخلية من خشب الساج، ونوافذ ممتدة، ومسبح خاص من الحجر الجيري',
        'مسبح لا متناهي بمياه عذبة يطل على شعاب خليج ميناي الفيروزية',
        'توابل سواحلية طازجة، وتونة برية، وعشاء على أضواء الشموع بجوار المحيط',
        'قارب شراعي خشبي تقليدي يبحر في أفق الغسق الذهبي للمحيط الهندي',
        'بوابتك إلى سهول سيرينغيتي ورحلات السفاري البرية في قلب تنزانيا',
      ],
    },
    zh: {
      eyebrow: '品牌意境短片',
      badge: '4K 超高清 • 故事板',
      playing: '正在播放分镜',
      ready: '故事板就绪',
      timeline: '时间轴',
      sceneCount: (c, t) => `分镜 ${c} / ${t}`,
      playAria: '播放短片',
      pauseAria: '暂停短片',
      toggleAudioAria: '开启/关闭声音',
      descriptions: [
        '专属机场专车接送，下榻享用传统冰镇柠檬草香氛毛巾迎宾礼',
        '天然马库蒂木构建筑掩映在古老壮丽的猴面包树丛林之中',
        '纯手工柚木内饰、全景通透玻璃落地窗与私属石灰岩恒温跳水池',
        '淡水无边泳池，俯瞰梅奈湾（Menai Bay）碧蓝璀璨的珊瑚海礁',
        '自种植斯瓦希里香料、野生黄鳍金枪鱼与烛光映照的私密临海雅座',
        '手工打造的传统单桅帆船（Dhow），缓缓航行在印度洋金色落日余晖之中',
        '通往塞伦盖蒂国家公园与坦桑尼亚原野狂野猎游的私享之门',
      ],
    },
    fr: {
      eyebrow: 'Bande Découverte Cinématique',
      badge: '4K Ultra HD • Storyboard Conceptuel',
      playing: 'Lecture de la scène',
      ready: 'Storyboard prêt',
      timeline: 'Chronologie',
      sceneCount: (c, t) => `Scène ${c} sur ${t}`,
      playAria: 'Lire la vidéo',
      pauseAria: 'Mettre en pause',
      toggleAudioAria: 'Activer/Désactiver le son',
      descriptions: [
        'Accueil aéroport privé avec chauffeur et bienvenue traditionnelle aux serviettes fraîches à la citronnelle',
        'Architecture en bois Makuti nichée au cœur d’anciens bosquets de baobabs',
        'Intérieurs en teck artisanal, baies vitrées panoramiques et bassin en pierre calcaire',
        'Piscine à débordement d’eau douce surplombant les récifs turquoise de Menai Bay',
        'Épices swahilies fraîches du jardin, thon sauvage et pavillon marin aux chandelles',
        'Bateau traditionnel en bois dhow naviguant dans le crépuscule doré de l’océan Indien',
        'Votre porte d’entrée vers le Serengeti et les safaris sauvages de Tanzanie continentale',
      ],
    },
    sw: {
      eyebrow: 'Video ya Picha za Hoteli',
      badge: '4K Ultra HD • Mtiririko wa Picha',
      playing: 'Inacheza Picha',
      ready: 'Tayari Kucheza',
      timeline: 'Muda',
      sceneCount: (c, t) => `Picha ${c} kati ya ${t}`,
      playAria: 'Cheza video',
      pauseAria: 'Simamisha video',
      toggleAudioAria: 'Sauti',
      descriptions: [
        'Mapokezi ya usafiri binafsi kutoka uwanja wa ndege na taulo baridi za mchaichai',
        'Usanifu wa mbao na paa la makuti katikati ya miti ya kale ya mibuyu',
        'Muundo wa mbao za mninga, vioo vikubwa vya ukutani na kidimbwi cha mawe',
        'Bwawa la maji baridi linalotazama mawimbi ya bahari ya Ghuba ya Menai',
        'Viungo safi vya kizanzibari, samaki wabichi wa jodari na banda la chakula baharini',
        'Jahazi la asili la mbao likielea kwenye machweo ya jua la Bahari ya Hindi',
        'Mlango wako wa kuelekea Serengeti na safari za mbuga za wanyama Tanzania Bara',
      ],
    },
    es: {
      eyebrow: 'Película Cinematográfica',
      badge: '4K Ultra HD • Guion Gráfico Conceptual',
      playing: 'Reproduciendo escena',
      ready: 'Guion listo',
      timeline: 'Línea de tiempo',
      sceneCount: (c, t) => `Escena ${c} de ${t}`,
      playAria: 'Reproducir película',
      pauseAria: 'Pausar película',
      toggleAudioAria: 'Silenciar/Activar sonido',
      descriptions: [
        'Llegada privada con chófer desde el aeropuerto y bienvenida tradicional con toallas frías de limoncillo',
        'Arquitectura de madera makuti integrada entre antiguos bosques de baobabs',
        'Interiores de teca artesanal, ventanales de suelo a techo y piscina de piedra caliza',
        'Piscina infinita de agua dulce con vistas a los arrecifes turquesa de Menai Bay',
        'Especias suajilis recién cosechadas, atún silvestre y veladas a la luz de las velas frente al mar',
        'Barco dhow artesanal navegando hacia el crepúsculo dorado del océano Índico',
        'La puerta de entrada al Serengueti y a las expediciones salvajes de Tanzania continental',
      ],
    },
    it: {
      eyebrow: 'Video Cinematografico',
      badge: '4K Ultra HD • Storyboard Concettuale',
      playing: 'Riproduzione scena',
      ready: 'Storyboard pronto',
      timeline: 'Cronologia',
      sceneCount: (c, t) => `Scena ${c} di ${t}`,
      playAria: 'Riproduci video',
      pauseAria: 'Metti in pausa',
      toggleAudioAria: 'Attiva/Disattiva audio',
      descriptions: [
        'Arrivo con autista privato dall’aeroporto e benvenuto tradizionale con salviette rinfrescanti alla citronella',
        'Architettura in legno makuti incastonata tra antichi boschi di baobab',
        'Interni in teak artigianale, vetrate a tutta altezza e piscina privata in pietra calcarea',
        'Piscina a sfioro d’acqua dolce con vista sulla barriera turchese di Menai Bay',
        'Spezie fresche swahili, tonno pinna gialla e padiglione sul mare a lume di candela',
        'Tradizionale barca a vela dhow che naviga nel tramonto dorato dell’Oceano Indiano',
        'La porta d’accesso al Serengeti e alle spedizioni selvagge nella Tanzania continentale',
      ],
    },
  };

  const ui = videoUi[currentLang] || videoUi.en;

  const defaultScenes = [
    {
      title: t.video.sceneArrival,
      description: ui.descriptions[0],
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85',
      time: '0:00 - 0:15',
    },
    {
      title: t.video.sceneExterior,
      description: ui.descriptions[1],
      image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1600&q=85',
      time: '0:15 - 0:30',
    },
    {
      title: t.video.sceneVilla,
      description: ui.descriptions[2],
      image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1600&q=85',
      time: '0:30 - 0:50',
    },
    {
      title: t.video.scenePool,
      description: ui.descriptions[3],
      image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1600&q=85',
      time: '0:50 - 1:10',
    },
    {
      title: t.video.sceneDining,
      description: ui.descriptions[4],
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1600&q=85',
      time: '1:10 - 1:30',
    },
    {
      title: t.video.sceneSunset,
      description: ui.descriptions[5],
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85',
      time: '1:30 - 1:55',
    },
    {
      title: t.video.sceneSafari,
      description: ui.descriptions[6],
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1600&q=85',
      time: '1:55 - 2:20',
    },
  ];

  // CMS scenes only carry partial fields (e.g. description); layer them over the built-in
  // scenes by position so titles, images and timings never render blank.
  const cmsScenes = dynamicVideo?.scenes || [];
  const storylineScenes = cmsScenes.length > 0
    ? cmsScenes.map((scene, idx) => {
        const base = defaultScenes[idx] || defaultScenes[defaultScenes.length - 1];
        return {
          title: scene.title || base.title,
          description: scene.description || base.description,
          image: scene.image || base.image,
          time: scene.time || base.time,
        };
      })
    : defaultScenes;

  const currentScene = storylineScenes[activeSceneIndex] || storylineScenes[0];

  return (
    <section id="film" className="relative w-full pt-14 sm:pt-20 md:pt-28 pb-8 sm:pb-12 bg-[#141413] text-[#FAF8F5] overflow-hidden">
      {/* Full-width visual background container */}
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center space-x-2 text-[11px] tracking-[0.3em] uppercase text-[#C4A27A] font-medium mb-3">
              <Film className="w-3.5 h-3.5" />
              <span>{cmsText(cmsContent?.eyebrow, ui.eyebrow)}</span>
            </div>
            <h2
              id="film-heading"
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-[0.05em] uppercase text-[#FAF8F5]"
            >
              {cmsText(cmsContent?.heading, t.video.heading)}
            </h2>
            <p className="text-[#D8CCB8]/80 text-sm sm:text-base mt-2 max-w-xl">
              {cmsText(cmsContent?.subhead, t.video.subhead)}
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <span className="text-xs text-[#C4A27A] font-mono tracking-wider bg-white/5 border border-[#C4A27A]/30 px-3 py-1.5 rounded">
              {ui.badge}
            </span>
          </div>
        </div>

        {/* Cinematic Screen Canvas */}
        <div className="relative min-h-[430px] sm:min-h-[480px] md:min-h-[520px] lg:aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-2xl border border-[#2C2B28] group">
          <img
            key={currentScene.image}
            src={currentScene.image}
            alt={currentScene.title}
            className={`w-full h-full object-cover transition-all duration-1000 ${
              isPlaying ? 'scale-105 filter brightness-95' : 'scale-100 filter brightness-75'
            }`}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#141413] via-transparent to-black/40" />

          {/* Center Play/Pause Trigger */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <button
              id="video-play-btn"
              onClick={() => setIsPlaying(!isPlaying)}
              className="pointer-events-auto w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-[#B8966C]/90 hover:bg-[#C4A27A] text-[#141413] flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-2xl backdrop-blur-md group-hover:ring-8 group-hover:ring-white/10 cursor-pointer"
              aria-label={isPlaying ? ui.pauseAria : ui.playAria}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 sm:w-8 sm:h-8 fill-current" />
              ) : (
                <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-current ml-0.5 sm:ml-1" />
              )}
            </button>
          </div>

          {/* Top Video Overlay Details */}
          <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 flex items-center justify-between text-xs tracking-wider gap-2">
            <div className="px-3 py-1.5 bg-black/70 backdrop-blur-md rounded border border-white/10 flex items-center space-x-2 max-w-[80%] sm:max-w-none">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-[#C4A27A]'}`} />
              <span className="font-mono text-[#FAF8F5] text-[10px] sm:text-xs uppercase truncate">
                {isPlaying ? ui.playing : ui.ready} : {currentScene.title}
              </span>
            </div>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 bg-black/70 backdrop-blur-md rounded hover:bg-black/80 transition-colors border border-white/10 text-[#FAF8F5] flex-shrink-0 cursor-pointer"
              aria-label={ui.toggleAudioAria}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#C4A27A]" />}
            </button>
          </div>

          {/* Bottom Scene Indicator Bar */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 text-white">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-2.5 sm:mb-3">
              <div>
                <span className="text-[10px] font-mono text-[#C4A27A] uppercase tracking-[0.2em] block mb-0.5">
                  {ui.timeline} {currentScene.time}
                </span>
                <h3 className="font-serif text-lg sm:text-2xl font-light leading-tight">
                  {currentScene.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-[#D8CCB8]/90 max-w-lg mt-0.5 line-clamp-2 sm:line-clamp-none">
                  {currentScene.description}
                </p>
              </div>

              <span className="text-[10px] sm:text-[11px] font-mono text-[#D8CCB8]/80 mt-1 sm:mt-0">
                {ui.sceneCount(activeSceneIndex + 1, storylineScenes.length)}
              </span>
            </div>

            {/* Interactive Timeline Scrub Bar */}
            <div className="grid grid-cols-7 gap-1.5 h-1.5 bg-white/20 rounded overflow-hidden">
              {storylineScenes.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveSceneIndex(idx);
                    setIsPlaying(true);
                  }}
                  className={`h-full transition-colors cursor-pointer ${
                    activeSceneIndex === idx
                      ? 'bg-[#C4A27A]'
                      : activeSceneIndex > idx
                      ? 'bg-white/60'
                      : 'bg-transparent hover:bg-white/40'
                  }`}
                  aria-label={`${ui.timeline} ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
