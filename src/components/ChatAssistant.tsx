import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Sparkles, UserCheck } from 'lucide-react';
import { Language } from '../types';
import { CHAT_TRANSLATIONS, ChatQuickPrompt } from '../data/chatTranslations';
import { ScrollFadeContainer } from './ScrollFadeContainer';
import { supportApi } from '../services/supportApi';
import { SupportActionMetadata } from '../../server/database/supportTypes';

interface Message {
  id: string;
  sender: 'bot' | 'user' | 'admin' | 'system';
  text: string;
  timestamp: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ChatAssistantProps {
  currentLang?: Language;
  onOpenBooking?: () => void;
  isOpen?: boolean;
  onToggleOpen?: (open: boolean) => void;
  externalQuery?: string | null;
  onClearExternalQuery?: () => void;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  currentLang = 'en',
  onOpenBooking,
  isOpen: controlledIsOpen,
  onToggleOpen,
  externalQuery,
  onClearExternalQuery,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const setIsOpen = (nextState: boolean) => {
    if (onToggleOpen) {
      onToggleOpen(nextState);
    }
    setInternalIsOpen(nextState);
  };

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationStatus, setConversationStatus] = useState<string>('AI_ACTIVE');
  const visitorSessionRef = useRef(supportApi.getOrCreateVisitorSession());

  const t = CHAT_TRANSLATIONS[currentLang] || CHAT_TRANSLATIONS.en;
  const isRtl = currentLang === 'ar';

  const [shuffledPrompts, setShuffledPrompts] = useState<ChatQuickPrompt[]>(() => {
    const list = [...(CHAT_TRANSLATIONS[currentLang] || CHAT_TRANSLATIONS.en).quickPrompts];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  });

  // Reshuffle recommendations randomly each time the chat is opened or language changes
  useEffect(() => {
    if (isOpen) {
      const list = [...t.quickPrompts];
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }
      setShuffledPrompts(list);
    }
  }, [isOpen, currentLang]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: t.welcomeMessage,
      timestamp: t.justNow,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const triggerBtnRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        chatContainerRef.current &&
        !chatContainerRef.current.contains(target) &&
        triggerBtnRef.current &&
        !triggerBtnRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [
          {
            id: 'welcome',
            sender: 'bot',
            text: t.welcomeMessage,
            timestamp: t.justNow,
          },
        ];
      }
      return [
        ...prev,
        {
          id: `lang-switch-${Date.now()}`,
          sender: 'bot',
          text: t.welcomeMessage,
          timestamp: t.justNow,
        },
      ];
    });
  }, [currentLang]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
    }
  }, [isOpen, messages, isTyping]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  const resolveAction = (action?: SupportActionMetadata) => {
    if (!action) return undefined;
    return {
      label: action.label,
      onClick: () => {
        if (action.actionType === 'MODAL' || action.target === 'booking_modal') {
          if (onOpenBooking) onOpenBooking();
          else scrollToSection('stay');
        } else if (action.target) {
          scrollToSection(action.target);
        }
      },
    };
  };

  const initConversation = useCallback(async (bookingContext?: any) => {
    try {
      const session = visitorSessionRef.current;
      const res = await supportApi.initVisitorConversation({
        visitor_id: session.visitorId,
        session_id: session.sessionId,
        language: currentLang,
        current_page: typeof window !== 'undefined' ? window.location.pathname : '/',
        booking_id: bookingContext?.bookingId || null,
        metadata: bookingContext || null,
      });

      if (res.conversation) {
        setConversationId(res.conversation.id);
        setConversationStatus(res.conversation.status);
      }

      if (res.messages && res.messages.length > 0) {
        const mapped: Message[] = res.messages.map((m) => {
          let sender: 'bot' | 'user' | 'admin' | 'system' = 'bot';
          if (m.sender_type === 'VISITOR') sender = 'user';
          else if (m.sender_type === 'ADMIN') sender = 'admin';
          else if (m.sender_type === 'SYSTEM') sender = 'system';
          else sender = 'bot';

          const timeStr = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return {
            id: m.id,
            sender,
            text: m.message,
            timestamp: timeStr,
            action: resolveAction(m.metadata?.action),
          };
        });
        setMessages(mapped);
      }
    } catch (err) {
      console.warn('Visitor conversation init failed, using local mode:', err);
    }
  }, [currentLang, onOpenBooking]);

  useEffect(() => {
    initConversation();
  }, [initConversation]);

  const generateBotReply = (userQuery: string): { text: string; action?: { label: string; onClick: () => void } } => {
    const q = userQuery.toLowerCase();

    // Specific safari destinations
    if (q.includes('serengeti') || q.includes('great migration')) {
      return {
        text: 'Serengeti National Park is an extraordinary safari experience. Zanzirangi House arranges direct chartered fly-in safaris from Zanzibar airport (approx. 1h 45m) with luxury partner tented camps overlooking migration corridors.',
        action: {
          label: 'View Safari Destinations',
          onClick: () => scrollToSection('tanzania'),
        },
      };
    }

    if (q.includes('ngorongoro') || q.includes('crater')) {
      return {
        text: 'Ngorongoro Crater offers Africa’s densest predator populations inside a UNESCO volcanic caldera. We organize chartered fly-in packages combining your beach retreat with panoramic crater floor game drives.',
        action: {
          label: 'Explore Ngorongoro',
          onClick: () => scrollToSection('tanzania'),
        },
      };
    }

    if (q.includes('kilimanjaro')) {
      return {
        text: 'Mount Kilimanjaro expeditions and scenic fly-over safaris are arranged through our certified mainland mountain guide partners. We can curate pre-climb acclimatization stays or relaxing post-climb beach recovery.',
        action: {
          label: 'Plan Safari & Kilimanjaro',
          onClick: () => scrollToSection('tanzania'),
        },
      };
    }

    if (q.includes('tarangire')) {
      return {
        text: 'Tarangire National Park is celebrated for iconic baobab trees and vast elephant herds along the Tarangire River. We arrange chartered flight itineraries directly from Zanzibar.',
        action: {
          label: 'View Tarangire Safaris',
          onClick: () => scrollToSection('tanzania'),
        },
      };
    }

    // Itinerary builder inquiries
    if (q.includes('itinerary') || q.includes('bespoke schedule') || q.includes('journey')) {
      return {
        text: 'I would be delighted to personalize your multi-day Tanzania journey! Our team will harmonize your island villa stay with your chosen excursions and mainland safari flights.',
        action: {
          label: 'Book Dates with Concierge',
          onClick: () => (onOpenBooking ? onOpenBooking() : scrollToSection('stay')),
        },
      };
    }

    // Specific Experiences
    if (q.includes('dolphin') || q.includes('kizimkazi')) {
      return {
        text: 'Kizimkazi is world-renowned for resident bottlenose and spinner dolphins in the Menai Bay Conservation Area right off our doorstep. We provide private dawn boat departures with licensed marine conservation guides.',
        action: {
          label: 'View Experiences',
          onClick: () => scrollToSection('experiences'),
        },
      };
    }

    if (q.includes('stone town') || q.includes('heritage')) {
      return {
        text: 'Stone Town is a UNESCO World Heritage treasure. We arrange private guided cultural walks through winding alleys, the House of Wonders, Old Fort, and the spice market with an expert Swahili historian.',
        action: {
          label: 'Explore Stone Town',
          onClick: () => scrollToSection('experiences'),
        },
      };
    }

    if (q.includes('mnemba') || q.includes('snorkeling') || q.includes('diving')) {
      return {
        text: 'Mnemba Island Atoll is Zanzibar’s crown jewel for coral reef biodiversity. We arrange private motorized dhow charters with full snorkeling gear, marine guides, and secluded sandbank picnics.',
        action: {
          label: 'Discover Mnemba',
          onClick: () => scrollToSection('experiences'),
        },
      };
    }

    if (q.includes('spice')) {
      return {
        text: 'Our Organic Botanical Spice Farm Journey introduces you to cloves, vanilla, nutmeg, and cardamom grown in lush organic plantations, concluded with a fresh coconut tasting and spice-infused lunch.',
        action: {
          label: 'View Spice Journey',
          onClick: () => scrollToSection('experiences'),
        },
      };
    }

    if (q.includes('dhow') || q.includes('sunset')) {
      return {
        text: 'Nothing rivals a private wooden dhow gliding across the tranquil turquoise Indian Ocean at sunset. Chilled drinks and Swahili canapés are served as the sun dips below the horizon.',
        action: {
          label: 'Sunset Dhow Details',
          onClick: () => scrollToSection('experiences'),
        },
      };
    }

    if (q.includes('reservation') || q.includes('booking') || q.includes('submitted')) {
      return {
        text: 'Thank you for your reservation inquiry! Our on-site concierge team is reviewing your requested dates and villa preferences. We will confirm availability and bespoke rates directly with you.',
        action: {
          label: 'Check More Rooms',
          onClick: () => scrollToSection('stay'),
        },
      };
    }

    // FAQ: Check-in & Check-out times
    const checkinKeywords = ['check-in', 'checkin', 'check out', 'checkout', 'horaires', 'muda wa kuingia', 'horario', 'arrived', 'departure', 'jam masuk', 'waktu masuk', 'wymeldowani', 'zameldowani', '入住', '退房', 'الوصول', 'المغادرة'];
    if (checkinKeywords.some((k) => q.includes(k))) {
      return {
        text: t.replies.checkin || 'Standard check-in is from 14:00 (2:00 PM) and check-out is until 11:00 AM. Flexible early check-in or late checkout can be accommodated based on villa availability.',
        action: {
          label: t.bookAction || 'Book a Villa',
          onClick: () => (onOpenBooking ? onOpenBooking() : scrollToSection('stay')),
        },
      };
    }

    // FAQ: High-Speed Wi-Fi
    const wifiKeywords = ['wifi', 'wi-fi', 'internet', 'speed', 'starlink', 'network', 'connect', 'online', 'wi-fi', 'ستارلينك', '星链', '无线'];
    if (wifiKeywords.some((k) => q.includes(k))) {
      return {
        text: t.replies.wifi || 'High-speed Starlink satellite Wi-Fi (150+ Mbps) is complimentary across all private villas, gardens, and dining pavilions, ensuring reliable connectivity for streaming or remote work.',
        action: {
          label: 'Check Villa Features',
          onClick: () => scrollToSection('stay'),
        },
      };
    }

    // FAQ: Payment & Cancellation Policy
    const paymentKeywords = ['payment', 'pay', 'cancel', 'deposit', 'card', 'visa', 'mastercard', 'amex', 'paiement', 'pago', 'malipo', 'bayar', 'pembayaran', 'płatnoś', 'anulac', 'الدفع', 'إلغاء', '付款', '取消'];
    if (paymentKeywords.some((k) => q.includes(k))) {
      return {
        text: t.replies.payment || 'We accept major credit cards (Visa, MasterCard, Amex), international bank transfers, and mobile payments. Cancellation terms offer full flexibility up to 14 days prior to arrival.',
        action: {
          label: t.bookAction || 'Reserve a Villa',
          onClick: () => (onOpenBooking ? onOpenBooking() : scrollToSection('stay')),
        },
      };
    }

    // FAQ: Kizimkazi Dolphins
    const dolphinKeywords = ['dolphin', 'pomboo', 'dauphin', 'delfin', 'delfini', 'دلافين', 'دلفين', '海豚'];
    if (dolphinKeywords.some((k) => q.includes(k))) {
      return {
        text: t.replies.dolphins || 'Kizimkazi is world-famous for resident dolphin pods in the Menai Bay Conservation Area. We organize ethical sunrise dolphin safaris directly from our shore.',
        action: {
          label: 'Explore Dolphin Safaris',
          onClick: () => scrollToSection('experiences'),
        },
      };
    }

    // FAQ: Sunset Dhow Sailing
    const dhowKeywords = ['dhow', 'jahazi', 'dau', 'voilier', 'velero', 'قارب', 'الداو', '木船', '帆船'];
    if (dhowKeywords.some((k) => q.includes(k))) {
      return {
        text: t.replies.dhow || 'Glide across the turquoise Indian Ocean aboard a handcrafted wooden dhow while enjoying chilled Champagne and fresh Swahili canapés as the sun sets.',
        action: {
          label: 'View Sunset Sailing',
          onClick: () => scrollToSection('experiences'),
        },
      };
    }

    // FAQ: Spa & Wellness Treatments
    const spaKeywords = ['spa', 'massage', 'masaji', 'bien-être', 'bienestar', 'odnowa', 'تدليك', 'سبا', '水疗', '按摩', 'wellness', 'therap'];
    if (spaKeywords.some((k) => q.includes(k))) {
      return {
        text: t.replies.spa || 'Our in-villa wellness treatments feature cold-pressed Zanzibari coconut oils, clove and cinnamon body scrubs, and soothing deep-tissue massages performed on your private ocean deck.',
        action: {
          label: 'View Wellness & Spa',
          onClick: () => scrollToSection('experiences'),
        },
      };
    }

    // FAQ: Private Candlelight Beach Dining
    const candleKeywords = ['candle', 'candlelight', 'chandelles', 'romantique', 'mishumaa', 'vela', 'velas', 'شموع', 'شمع', '烛光', 'świec'];
    if (candleKeywords.some((k) => q.includes(k))) {
      return {
        text: t.replies.beachDining || 'We arrange unforgettable candlelit dinners directly on the soft white sands or elevated coral terraces with torchlight and a custom 5-course seafood tasting menu.',
        action: {
          label: 'Taste Dining Moments',
          onClick: () => scrollToSection('dining'),
        },
      };
    }

    // FAQ: Stone Town & Spice Tour
    const stonetownKeywords = ['stone town', 'spice', 'épices', 'viungo', 'especias', 'spezie', 'التوابل', 'المدينة الحجرية', '石头城', '香料', 'przypraw'];
    if (stonetownKeywords.some((k) => q.includes(k))) {
      return {
        text: t.replies.stonetown || 'We organize private cultural journeys with local historians through UNESCO-listed Stone Town and organic spice plantations celebrating vanilla, cloves, and cardamom.',
        action: {
          label: 'Discover Island Tours',
          onClick: () => scrollToSection('experiences'),
        },
      };
    }

    // FAQ: Family & Children Stays
    const familyKeywords = ['family', 'children', 'child', 'kid', 'famille', 'enfant', 'familia', 'niño', 'watoto', 'bambin', 'عائل', 'أطفال', '家庭', '儿童', 'rodzin'];
    if (familyKeywords.some((k) => q.includes(k))) {
      return {
        text: t.replies.family || 'Families are warmly welcomed. We offer interconnecting villa sanctuaries, extra beds, tailored kids menus, and professional babysitting upon request.',
        action: {
          label: 'Explore Family Villas',
          onClick: () => scrollToSection('stay'),
        },
      };
    }

    // FAQ: Honeymoon & Celebrations
    const honeymoonKeywords = ['honeymoon', 'anniversary', 'lune de miel', 'fungate', 'luna de miel', 'luna di miele', 'عسل', 'رومانس', '蜜月', 'młod', 'poślubn'];
    if (honeymoonKeywords.some((k) => q.includes(k))) {
      return {
        text: t.replies.honeymoon || 'For honeymooners, we prepare complimentary chilled Champagne, fresh tropical floral arrangements, a private sunset dhow sail, and a romantic beach dinner under the stars.',
        action: {
          label: 'Plan Honeymoon Escape',
          onClick: () => (onOpenBooking ? onOpenBooking() : scrollToSection('stay')),
        },
      };
    }

    // FAQ: Diving & Snorkeling
    const divingKeywords = ['dive', 'diving', 'snorkel', 'snorkeling', 'plongée', 'kuzamia', 'buceo', 'immersi', 'غوص', 'سنوركل', '潜水', '浮潜', 'nurkowan', 'reef', 'coral'];
    if (divingKeywords.some((k) => q.includes(k))) {
      return {
        text: t.replies.diving || 'Partnering with certified PADI dive masters, we take you to the pristine reefs of Mnemba Atoll and Kizimkazi to observe sea turtles, manta rays, and vibrant marine life.',
        action: {
          label: 'Explore Marine Safaris',
          onClick: () => scrollToSection('experiences'),
        },
      };
    }

    // FAQ: Pools & Beach Access
    const poolKeywords = ['pool', 'plunge', 'swim', 'beach', 'ocean', 'piscine', 'bwawa', 'piscina', 'pantai', 'kolam', 'basen', 'المسبح', 'الشاطئ', '泳池', '沙滩'];
    if (poolKeywords.some((k) => q.includes(k))) {
      return {
        text: 'Every single one of our 8 luxury sanctuaries features its own private freshwater plunge pool, sun loungers, and direct private pathway access to the pristine shores of the Indian Ocean.',
        action: {
          label: 'View Private Villas',
          onClick: () => scrollToSection('stay'),
        },
      };
    }

    // General categories
    const safariKeywords = ['safari', 'wildlife', 'big five', 'fly-in', 'game drive', 'bush', 'serengeti', 'ngorongoro', 'سيرينجيتي', '塞伦盖蒂'];
    if (safariKeywords.some((k) => q.includes(k))) {
      return {
        text: 'We organize chartered fly-in safaris directly from Zanzibar to Serengeti, Ngorongoro Crater, and Tarangire with luxury partner camps. Would you like to view our safari destinations?',
        action: {
          label: 'View Safari Destinations',
          onClick: () => scrollToSection('tanzania'),
        },
      };
    }

    const villaKeywords = [
      'villa', 'rate', 'price', 'stay', 'room', 'availab', 'suite', 'bungalow',
      'chambre', 'prix', 'tarif', 'nuit',
      'bei', 'ghorofa', 'chumba', 'kulala',
      'precio', 'tarifa', 'habitaci', 'estancia', 'noche',
      'prezzo', 'costo', 'camera', 'notte',
      'فلل', 'فيلا', 'سعر', 'اسعار', 'أسعار', 'غرفة', 'غرف', 'حجز', 'مسبح',
      '别墅', '价格', '房价', '房型', '套房', '空房', '预订',
    ];
    if (villaKeywords.some((k) => q.includes(k))) {
      return {
        text: t.botVillaAnswer || 'We feature 8 handcrafted luxury sanctuaries including oceanfront pool villas and secluded garden bungalows. Would you like to check dates and availability?',
        action: {
          label: t.actionCheckVillas || 'Check Villa Availability',
          onClick: () => (onOpenBooking ? onOpenBooking() : scrollToSection('stay')),
        },
      };
    }

    const transferKeywords = [
      'airport', 'transfer', 'location', 'where', 'car', 'distance', 'arrive', 'driver', 'taxi', 'shuttle',
      'aéroport', 'aeroport', 'transport', 'voiture', 'chauffeur',
      'uwanja', 'ndege', 'usafiri', 'gari', 'umbali',
      'aeropuerto', 'traslado', 'transporte', 'coche',
      'aeroporto', 'trasferimento', 'auto',
      'مطار', 'توصيل', 'نقل', 'سيارة', 'سائق', 'مسافة', 'موقع',
      '机场', '接送', '专车', '距离', '怎么走', '位置',
    ];
    if (transferKeywords.some((k) => q.includes(k))) {
      return {
        text: t.replies.transfer || 'We provide private VIP meet-and-greet and chauffeur shuttle transfers from Abeid Amani Karume International Airport (ZNZ) directly to our sanctuary in Kizimkazi.',
        action: {
          label: 'View Transfer Details',
          onClick: () => scrollToSection('shuttle'),
        },
      };
    }

    const diningKeywords = [
      'din', 'food', 'restaurant', 'chef', 'breakfast', 'menu', 'lunch', 'dinner', 'eat', 'drink', 'wine', 'beverage', 'juice', 'cuisine', 'garden',
      'manger', 'nourriture', 'repas', 'boisson', 'petit-déjeuner', 'déjeuner',
      'chakula', 'mgahawa', 'vinywaji', 'kula', 'kinywaji',
      'comida', 'restaurante', 'cena', 'desayuno', 'bebida',
      'cibo', 'ristorante', 'pranzo', 'bevande',
      'مطعم', 'مطاعم', 'طعام', 'أكل', 'اكل', 'عشاء', 'غداء', 'إفطار', 'وجبة', 'مشروب', 'عصير', 'مشروبات',
      '餐厅', '餐饮', '美食', '菜', '早餐', '晚餐', '饮料', '酒', '厨师',
    ];
    if (diningKeywords.some((k) => q.includes(k))) {
      return {
        text: t.replies.dining || 'Our gastronomic philosophy embraces organic garden-to-table produce and line-caught seafood with authentic Swahili and fine international dining.',
        action: {
          label: 'Taste Dining & Garden Menu',
          onClick: () => scrollToSection('dining'),
        },
      };
    }

    const excursionKeywords = [
      'excursion', 'dhow', 'activity', 'tour', 'dolphin', 'experience', 'trip', 'adventure', 'mnemba', 'stone town', 'spice', 'jozani',
      'visite', 'croisière', 'dauphin', 'aventure', 'forêt',
      'matembezi', 'pomboo', 'jahazi', 'msitu',
      'excursión', 'excursion', 'delfines', 'paseo', 'selva',
      'escursione', 'delfini',
      'رحلات', 'رحلة', 'دلافين', 'جولة', 'مغامرة', 'غابة', 'قارب',
      '游览', '海豚', '活动', '体验', '森林', '帆船',
    ];
    if (excursionKeywords.some((k) => q.includes(k))) {
      return {
        text: t.replies.excursions || 'We curate 10 signature Zanzibar adventures including wild dolphin cruises in Menai Bay, Mnemba Island snorkeling, Stone Town heritage tours, and sunset dhow sails.',
        action: {
          label: 'Explore Experiences',
          onClick: () => scrollToSection('experiences'),
        },
      };
    }

    const conciergeKeywords = ['speak', 'talk', 'concierge', 'host', 'team', 'call', 'arrange', 'help', 'contact'];
    if (conciergeKeywords.some((k) => q.includes(k))) {
      return {
        text: 'Jambo! I am right here to help you arrange your custom stay and private services. Tell me your preferred dates, party size, or experiences and I will tailor everything to your rhythm.',
        action: {
          label: 'Plan Your Stay',
          onClick: () => (onOpenBooking ? onOpenBooking() : scrollToSection('stay')),
        },
      };
    }

    return {
      text: t.replies.fallback || 'I am happy to assist with all your questions regarding your stay, dining, island adventures, and Tanzania safaris.',
      action: {
        label: 'Plan Your Stay',
        onClick: () => (onOpenBooking ? onOpenBooking() : scrollToSection('stay')),
      },
    };
  };

  const handleSendMessage = async (textToSend?: string, customBookingContext?: any) => {
    const query = textToSend || inputValue;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    try {
      let convId = conversationId;
      const session = visitorSessionRef.current;
      if (!convId) {
        const initRes = await supportApi.initVisitorConversation({
          visitor_id: session.visitorId,
          session_id: session.sessionId,
          language: currentLang,
          current_page: typeof window !== 'undefined' ? window.location.pathname : '/',
          booking_id: customBookingContext?.bookingId || null,
          metadata: customBookingContext || null,
        });
        convId = initRes.conversation.id;
        setConversationId(convId);
        setConversationStatus(initRes.conversation.status);
      }

      const res = await supportApi.sendVisitorMessage(convId, session.visitorId, query, customBookingContext);
      setConversationStatus(res.conversationStatus);

      // Adopt the server id so polling recognises this message instead of re-appending it.
      if (res.userMessage?.id) {
        const serverId = res.userMessage.id;
        setMessages((prev) =>
          prev.some((m) => m.id === serverId)
            ? prev.filter((m) => m.id !== userMsg.id)
            : prev.map((m) => (m.id === userMsg.id ? { ...m, id: serverId } : m))
        );
      }

      if (res.botMessage) {
        const timeStr = new Date(res.botMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const botMsg: Message = {
          id: res.botMessage.id,
          sender: 'bot',
          text: res.botMessage.message,
          timestamp: timeStr,
          action: resolveAction(res.botMessage.metadata?.action),
        };
        // Polling may already have delivered this reply.
        setMessages((prev) => (prev.some((m) => m.id === botMsg.id) ? prev : [...prev, botMsg]));
      }
      setIsTyping(false);
    } catch (err) {
      console.warn('Backend message send failed, using deterministic local reply:', err);
      setTimeout(() => {
        const reply = generateBotReply(query);
        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: reply.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: reply.action,
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
      }, 450);
    }
  };

  // Near-real-time polling for admin and system messages
  useEffect(() => {
    if (!isOpen || !conversationId) return;

    const interval = setInterval(async () => {
      try {
        const session = visitorSessionRef.current;
        const pollRes = await supportApi.pollVisitorMessages(conversationId, session.visitorId);
        if (pollRes.status) {
          setConversationStatus(pollRes.status);
        }
        if (pollRes.messages && pollRes.messages.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            let next = prev;
            const newOnes: Message[] = [];
            for (const pm of pollRes.messages) {
              if (!existingIds.has(pm.id) && pm.sender_type === 'VISITOR') {
                // A poll can land before the send request resolves: match the optimistic
                // copy (temporary `user-` id, same text) and give it the server id.
                const pending = next.find((m) => m.id.startsWith('user-') && m.sender === 'user' && m.text === pm.message);
                if (pending) {
                  next = next.map((m) => (m.id === pending.id ? { ...m, id: pm.id } : m));
                  existingIds.add(pm.id);
                  continue;
                }
              }
              if (!existingIds.has(pm.id)) {
                let sender: 'bot' | 'user' | 'admin' | 'system' = 'bot';
                if (pm.sender_type === 'VISITOR') sender = 'user';
                else if (pm.sender_type === 'ADMIN') sender = 'admin';
                else if (pm.sender_type === 'SYSTEM') sender = 'system';

                const timeStr = new Date(pm.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                newOnes.push({
                  id: pm.id,
                  sender,
                  text: pm.message,
                  timestamp: timeStr,
                  action: resolveAction(pm.metadata?.action),
                });
              }
            }
            if (newOnes.length > 0) {
              return [...next, ...newOnes];
            }
            return next;
          });
        }
      } catch {
        // Silent poll error handling
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [isOpen, conversationId]);

  // Handle external query trigger (from other sections)
  useEffect(() => {
    if (externalQuery && externalQuery.trim()) {
      setIsOpen(true);
      handleSendMessage(externalQuery);
      if (onClearExternalQuery) {
        onClearExternalQuery();
      }
    }
  }, [externalQuery]);

  // Handle global custom DOM event
  useEffect(() => {
    const handleOpenSupportEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ query?: string; bookingContext?: any }>;
      const query = customEvent.detail?.query;
      const bookingContext = customEvent.detail?.bookingContext;
      setIsOpen(true);
      if (query) {
        setTimeout(() => {
          handleSendMessage(query, bookingContext);
        }, 100);
      }
    };
    window.addEventListener('open-customer-support', handleOpenSupportEvent);
    return () => window.removeEventListener('open-customer-support', handleOpenSupportEvent);
  }, []);


  const actionLabels: Record<
    Language,
    {
      book: string;
      checkRooms: string;
      viewExperiences: string;
      viewDining: string;
      viewSafari: string;
      closeChat: string;
      sendAria: string;
      conciergeRole: string;
      openSupportAria: string;
    }
  > = {
    en: {
      book: 'Reserve Villa',
      checkRooms: 'View Villas',
      viewExperiences: 'View Experiences',
      viewDining: 'Taste Dining Moments',
      viewSafari: 'Explore Safaris',
      closeChat: 'Close Chat',
      sendAria: 'Send message',
      conciergeRole: 'Juma • Private Concierge',
      openSupportAria: 'Open Zanzirangi Customer Support',
    },
    fr: {
      book: 'Réserver la villa',
      checkRooms: 'Voir les villas',
      viewExperiences: 'Découvrir les expériences',
      viewDining: 'Découvrir les délices',
      viewSafari: 'Explorer les safaris',
      closeChat: 'Fermer le chat',
      sendAria: 'Envoyer le message',
      conciergeRole: 'Juma • Concierge Privé',
      openSupportAria: 'Ouvrir le Service Client Zanzirangi',
    },
    sw: {
      book: 'Weka Nafasi ya Villa',
      checkRooms: 'Tazama Villa Zote',
      viewExperiences: 'Tazama Safari & Vivutio',
      viewDining: 'Tazama Menyu ya Chakula',
      viewSafari: 'Tazama Safari za Tanzania',
      closeChat: 'Funga Maongezi',
      sendAria: 'Tuma ujumbe',
      conciergeRole: 'Juma • Mhudumu Binafsi',
      openSupportAria: 'Fungua Huduma kwa Wateja Zanzirangi',
    },
    es: {
      book: 'Reservar Villa',
      checkRooms: 'Ver Villas',
      viewExperiences: 'Ver Experiencias',
      viewDining: 'Ver Gastronomía',
      viewSafari: 'Explorar Safaris',
      closeChat: 'Cerrar chat',
      sendAria: 'Enviar mensaje',
      conciergeRole: 'Juma • Conserje Privado',
      openSupportAria: 'Abrir Atención al Huésped Zanzirangi',
    },
    it: {
      book: 'Prenota Villa',
      checkRooms: 'Scopri le Ville',
      viewExperiences: 'Esplora le Esperienze',
      viewDining: 'Scopri la Ristorazione',
      viewSafari: 'Esplora i Safari in Tanzania',
      closeChat: 'Chiudi chat',
      sendAria: 'Invia messaggio',
      conciergeRole: 'Juma • Concierge Privato',
      openSupportAria: 'Apri Assistenza Ospiti Zanzirangi',
    },
    pl: {
      book: 'Zarezerwuj willę',
      checkRooms: 'Zobacz wille',
      viewExperiences: 'Odkryj atrakcje',
      viewDining: 'Odkryj menu kulinarne',
      viewSafari: 'Odkryj safari w Tanzanii',
      closeChat: 'Zamknij czat',
      sendAria: 'Wyślij wiadomość',
      conciergeRole: 'Juma • Prywatny Konsjerż',
      openSupportAria: 'Otwórz Obsługę Klienta Zanzirangi',
    },
    ar: {
      book: 'حجز فيلا الآن',
      checkRooms: 'استعراض الفلل',
      viewExperiences: 'استكشاف التجارب والأنشطة',
      viewDining: 'استكشاف تجارب الطعام',
      viewSafari: 'استكشاف رحلات السفاري',
      closeChat: 'إغلاق المحادثة',
      sendAria: 'إرسال الرسالة',
      conciergeRole: 'جمعة • الكونسيرج الخاص',
      openSupportAria: 'فتح خدمة عملاء زنجيرانجي',
    },
    zh: {
      book: '立即预订奢华别墅',
      checkRooms: '查看专属别墅',
      viewExperiences: '探索岛屿精彩体验',
      viewDining: '探索珍馐美馔',
      viewSafari: '了解坦桑尼亚猎游',
      closeChat: '关闭客服窗口',
      sendAria: '发送咨询消息',
      conciergeRole: '朱马 • 专属私人管家',
      openSupportAria: '打开 Zanzirangi 专属在线管家',
    },
  };

  const currentUi = actionLabels[currentLang] || actionLabels.en;

  return (
    <>
      {/* Floating Avatar Trigger Button in Bottom Left Corner */}
      <div
        ref={triggerBtnRef}
        className={`fixed bottom-4 left-4 sm:bottom-6 sm:left-6 ${
          isOpen ? 'z-30 pointer-events-none sm:pointer-events-auto sm:z-40' : 'z-40'
        } flex items-center font-sans transition-all duration-300`}
      >
        <button
          id="chat-assistant-avatar-btn"
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center space-x-2 sm:space-x-3 focus:outline-none cursor-pointer"
          aria-label={currentUi.openSupportAria}
        >
          {/* Glowing Circle Avatar with Golden Ring */}
          <div className="relative">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-[#B8966C] via-[#C4A27A] to-[#FAF8F5] shadow-2xl transform transition-transform duration-300 group-hover:scale-110">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#141413]">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80"
                  alt="Juma - Zanzirangi Customer Support Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Active online pulsing green radar signal */}
            <span className="absolute top-0 right-0 flex h-3.5 w-3.5 sm:h-4 sm:w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 bg-emerald-500 border-2 border-[#141413] shadow-[0_0_8px_#10b981]" />
            </span>

            {/* Unread Message Dot */}
            {hasUnread && !isOpen && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 z-10">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B8966C] opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-[#B8966C] text-[9px] font-bold text-[#141413] flex items-center justify-center">
                  1
                </span>
              </span>
            )}
          </div>

          {/* MOBILE FORMAT (HP): Hanya avatar dan card kecil yang bernama Juma, tanpa deskripsi */}
          <div className="sm:hidden flex items-center space-x-1.5 px-3 py-1.5 bg-[#141413]/95 border border-[#C4A27A]/50 rounded-xl text-[#FAF8F5] shadow-xl backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold text-[#FAF8F5] tracking-wide">
              Juma
            </span>
          </div>

          {/* DESKTOP FORMAT: Full Customer Support Tag Pill with Description */}
          <div className="hidden sm:flex items-center space-x-2 px-4 py-2.5 bg-[#141413]/95 hover:bg-[#1C1B1A] border border-[#C4A27A]/50 rounded-2xl text-[#FAF8F5] shadow-2xl backdrop-blur-md transition-all duration-300 group-hover:border-[#C4A27A]">
            <div className="flex flex-col text-left leading-tight">
              <span className="text-xs font-semibold text-[#FAF8F5] tracking-wide">
                {t.badgeTitle || 'Customer Support'}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono tracking-wider flex items-center space-x-1.5 mt-0.5 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>{t.badgeStatus || 'Online • Juma'}</span>
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Dark Blurred Backdrop: Covers screen and places avatar below it */}
      {/* Dark Blurred Backdrop: Only on mobile, completely removed on desktop */}
      {isOpen && (
        <div
          id="customer-support-mobile-backdrop"
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 transition-opacity duration-300 sm:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Customer Support Chat Window (Vertically and horizontally centered on mobile modal, anchored at bottom-left on desktop) */}
      {isOpen && (
        <div
          ref={chatContainerRef}
          id="customer-support-chat-window"
          className="fixed top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 sm:top-auto sm:translate-y-0 sm:bottom-22 sm:left-6 sm:translate-x-0 z-50 w-[calc(100vw-3.75rem)] sm:w-[385px] max-w-[385px] h-[510px] sm:h-[550px] max-h-[82vh] sm:max-h-[80vh] bg-[#141413]/98 backdrop-blur-2xl border border-[#C4A27A]/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn text-[#FAF8F5] font-sans"
        >
          {/* Top Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-[#1C1B1A] via-[#22211F] to-[#1C1B1A] border-b border-[#2C2B28] flex items-center justify-between">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#C4A27A] bg-[#2C2B28] shadow-md">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80"
                    alt="Juma - Zanzirangi Customer Support"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#141413] shadow-[0_0_6px_#10b981]" />
                </span>
              </div>

              <div className="flex flex-col text-left rtl:text-right leading-tight">
                <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                  <span className="font-serif font-medium text-base tracking-wider text-[#FAF8F5]">
                    {t.headerTitle || 'Customer Support'}
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-[#C4A27A]" />
                </div>
                <span className="text-[11px] text-emerald-400 font-mono tracking-wider flex items-center space-x-1 rtl:space-x-reverse mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  <span>{currentUi.conciergeRole}</span>
                </span>
              </div>
            </div>

            <button
              id="close-chat-assistant-btn"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full text-[#D8CCB8]/70 hover:text-white hover:bg-white/10 transition-colors focus:outline-none cursor-pointer"
              aria-label={currentUi.closeChat}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#0F0E0E]/95 text-sm">
            {messages.map((msg) => {
              if (msg.sender === 'system') {
                return (
                  <div key={msg.id} className="text-center py-1">
                    <span className="text-[10px] font-mono text-[#D8CCB8]/80 bg-[#1C1B1A]/80 border border-[#2C2B28] px-3 py-1 rounded-full inline-block shadow-sm">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user'
                      ? isRtl ? 'items-start' : 'items-end'
                      : isRtl ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`flex items-end space-x-2 rtl:space-x-reverse max-w-[85%] ${
                      msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                    }`}
                  >
                    {msg.sender === 'bot' && (
                      <div className="w-6 h-6 rounded-full overflow-hidden border border-[#C4A27A]/60 flex-shrink-0 bg-[#2C2B28] shadow-sm">
                        <img
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80"
                          alt="Juma"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {msg.sender === 'admin' && (
                      <div className="w-6 h-6 rounded-full overflow-hidden border border-emerald-500/80 flex-shrink-0 bg-[#2C2B28] shadow-sm flex items-center justify-center text-emerald-400">
                        <UserCheck className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#B8966C] text-[#141413] font-semibold rounded-br-none shadow-md'
                          : msg.sender === 'admin'
                          ? 'bg-[#22211F] text-[#FAF8F5] border border-emerald-600/50 rounded-bl-none shadow'
                          : 'bg-[#1C1B1A] text-[#FAF8F5] border border-[#2C2B28] rounded-bl-none shadow'
                      }`}
                    >
                      {msg.sender === 'admin' && (
                        <div className="text-[10px] font-mono text-emerald-400 mb-1 flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>Concierge Staff</span>
                        </div>
                      )}

                      <p>{msg.text}</p>

                      {msg.action && (
                        <button
                          onClick={msg.action.onClick}
                          className="mt-3 inline-flex items-center px-3 py-1.5 bg-[#B8966C] hover:bg-[#C4A27A] text-[#141413] font-bold text-[11px] uppercase tracking-wider rounded-lg transition-all shadow"
                        >
                          {msg.action.label} {isRtl ? '←' : '→'}
                        </button>
                      )}
                    </div>
                  </div>
                  <span className="text-[9px] text-[#8C8880] mt-1 px-8 font-mono">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}


            {isTyping && (
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="w-6 h-6 rounded-full overflow-hidden border border-[#C4A27A]/60 flex-shrink-0 bg-[#2C2B28] shadow-sm">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80"
                    alt="Juma"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="px-4 py-2.5 bg-[#1C1B1A] border border-[#2C2B28] rounded-2xl rounded-bl-none flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 bg-[#C4A27A] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-[#C4A27A] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-[#C4A27A] rounded-full animate-bounce" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips with Scroll Fade */}
          <ScrollFadeContainer
            className="relative max-w-full overflow-hidden bg-[#171615] border-t border-[#2C2B28]"
            scrollClassName="px-3.5 py-2 overflow-x-auto flex items-center space-x-2 rtl:space-x-reverse pr-10 no-scrollbar scroll-smooth"
            leftGradientClass="bg-gradient-to-r from-[#171615] via-[#171615]/90 to-transparent"
            rightGradientClass="bg-gradient-to-l from-[#171615] via-[#171615]/90 to-transparent"
            fadeWidth="w-8 sm:w-10"
          >
            {(shuffledPrompts.length > 0 ? shuffledPrompts : t.quickPrompts).map((p, idx) => (
              <button
                key={`${p.label}-${idx}`}
                onClick={() => handleSendMessage(p.query)}
                className="whitespace-nowrap px-2.5 py-1 bg-white/5 hover:bg-[#C4A27A]/20 hover:border-[#C4A27A]/50 border border-white/10 rounded-full text-[11px] text-[#D8CCB8] hover:text-[#FAF8F5] transition-all flex-shrink-0 cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </ScrollFadeContainer>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[#1C1B1A] border-t border-[#2C2B28] flex items-center space-x-2 rtl:space-x-reverse"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t.inputPlaceholder || "Ask about check-in, villas, transfers, safaris..."}
              className="flex-1 bg-[#141413] border border-[#2C2B28] rounded-xl px-3.5 py-2.5 text-xs text-[#FAF8F5] placeholder-[#8C8880] focus:outline-none focus:border-[#C4A27A] transition-colors"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="p-2.5 bg-[#B8966C] hover:bg-[#C4A27A] disabled:opacity-40 disabled:cursor-not-allowed text-[#141413] rounded-xl transition-colors flex items-center justify-center flex-shrink-0 cursor-pointer"
              aria-label={currentUi.sendAria}
            >
              <Send className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
