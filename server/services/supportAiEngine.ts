import { supportRepository } from '../database/repositories/supportRepository.ts';
import {
  SupportAiDecision,
  SupportActionMetadata,
} from '../database/supportTypes.ts';

export interface AiEvaluationResult {
  replyText: string;
  action?: SupportActionMetadata;
  intent: string;
  confidence: number;
  knowledge_source: string;
  decision: SupportAiDecision;
  handoffReason?: string;
}

export const HANDOFF_MESSAGES: Record<string, string> = {
  en: "I'd be happy to help with that. Let me check this with our concierge team and get back to you.",
  fr: "Je serais ravi de vous aider. Laissez-moi vérifier cela auprès de notre équipe de conciergerie et je reviens vers vous.",
  sw: "Ningefurahi kukusaidia kwa hilo. Ngoja nithibitishe hili na timu yetu ya makaribisho kisha nitakujulisha.",
  es: "Con gusto le ayudo con eso. Permítame consultar con nuestro equipo de conserjería y me pondré en contacto con usted.",
  it: "Sarò lieto di aiutarvi. Permettetemi di verificare con il nostro team concierge e vi ricontatterò a breve.",
  pl: "Z przyjemnością w tym pomogę. Pozwól, że skonsultuję to z naszym zespołem konsjerża i wrócę do Ciebie z odpowiedzią.",
  ar: "يسعدني مساعدتك في ذلك. دعني أتحقق من هذا الأمر مع فريق الكونسيرج وسأعاود الرد عليك.",
  zh: "非常乐意为您协助。请稍等，我将与我们的私人礼宾管家团队确认后立即向您答复。",
};

export class SupportAiEngine {
  /**
   * Evaluates a visitor query through the Support Decision Layer:
   * 1. Inspect dynamic Knowledge Base (published items)
   * 2. Inspect deterministic FAQ rules
   * 3. Detect high-constraint parameters (dates, large groups, discounts) requiring human review
   * 4. Compute decision: AUTO_ANSWER, SAFE_ANSWER, or HANDOFF_TO_HUMAN
   */
  async evaluateQuery(
    query: string,
    lang: string = 'en',
    _currentPage: string = '/'
  ): Promise<AiEvaluationResult> {
    const q = query.trim().toLowerCase();
    const fallbackHandoff = HANDOFF_MESSAGES[lang] || HANDOFF_MESSAGES.en;

    // -------------------------------------------------------------
    // RULE 1: HIGH CONSTRAINT CHECK (Immediate dates, custom headcount, custom pricing)
    // AI must NEVER invent availability or negotiate custom reservations!
    // -------------------------------------------------------------
    const hasImmediateDate = /\b(tomorrow|tonight|today|besok|malam ini|demain|ce soir|mañana|domani|jutro|غدا|اليوم|明天|今晚)\b/i.test(q);
    const hasSpecificLargeGroup = /\b(1[0-9]|[2-9][0-9])\s*(people|guests|persons|orang|personnes|personas|persone|osób|شخص|位|人)\b/i.test(q) ||
      /\b(for|untuk|pour|para|per|dla|li|共)\s*(1[0-9]|[2-9][0-9])\b/i.test(q);

    // If both large group and immediate date or unverified availability constraint are present:
    if (hasImmediateDate && hasSpecificLargeGroup) {
      return {
        replyText: fallbackHandoff,
        intent: 'large_group_immediate_availability_inquiry',
        confidence: 0.50,
        knowledge_source: 'NONE',
        decision: 'HANDOFF_TO_HUMAN',
        handoffReason: 'Visitor requested immediate availability for a large group (10+ guests), requiring human concierge verification.',
      };
    }

    if (hasSpecificLargeGroup && (q.includes('dinner') || q.includes('candlelight') || q.includes('safari') || q.includes('tour') || q.includes('villa'))) {
      return {
        replyText: fallbackHandoff,
        intent: 'large_group_custom_arrangement',
        confidence: 0.52,
        knowledge_source: 'NONE',
        decision: 'HANDOFF_TO_HUMAN',
        handoffReason: 'Large group custom arrangement requires concierge catering and logistics coordination.',
      };
    }

    // -------------------------------------------------------------
    // RULE 2: Dynamic Knowledge Base Lookup (Admin-curated KB)
    // -------------------------------------------------------------
    try {
      const kbItems = await supportRepository.getKnowledgeBase({
        status: 'PUBLISHED',
      });

      for (const item of kbItems) {
        const itemQ = item.question.toLowerCase();
        // Exact or close match
        if (q === itemQ || (q.length > 15 && itemQ.includes(q)) || (itemQ.length > 15 && q.includes(itemQ))) {
          return {
            replyText: item.answer,
            intent: `kb_${item.category.toLowerCase().replace(/\s+/g, '_')}`,
            confidence: 0.95,
            knowledge_source: `KNOWLEDGE_BASE_${item.id}`,
            decision: 'AUTO_ANSWER',
          };
        }
      }
    } catch {
      // Continue to deterministic engine if KB lookup encounters issues
    }

    // -------------------------------------------------------------
    // RULE 3: Deterministic Intent Classifier
    // -------------------------------------------------------------

    // A. Safari Destinations
    if (q.includes('serengeti') || q.includes('great migration')) {
      return {
        replyText: 'Serengeti National Park is an extraordinary safari experience. Zanzirangi House arranges direct chartered fly-in safaris from Zanzibar airport (approx. 1h 45m) with luxury partner tented camps overlooking migration corridors.',
        action: { label: 'View Safari Destinations', actionType: 'SCROLL', target: 'tanzania' },
        intent: 'safari_serengeti',
        confidence: 0.95,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    if (q.includes('ngorongoro') || q.includes('crater')) {
      return {
        replyText: 'Ngorongoro Crater offers Africa’s densest predator populations inside a UNESCO volcanic caldera. We organize chartered fly-in packages combining your beach retreat with panoramic crater floor game drives.',
        action: { label: 'Explore Ngorongoro', actionType: 'SCROLL', target: 'tanzania' },
        intent: 'safari_ngorongoro',
        confidence: 0.95,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    if (q.includes('kilimanjaro')) {
      return {
        replyText: 'Mount Kilimanjaro expeditions and scenic fly-over safaris are arranged through our certified mainland mountain guide partners. We can curate pre-climb acclimatization stays or relaxing post-climb beach recovery.',
        action: { label: 'Plan Safari & Kilimanjaro', actionType: 'SCROLL', target: 'tanzania' },
        intent: 'safari_kilimanjaro',
        confidence: 0.92,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    if (q.includes('tarangire')) {
      return {
        replyText: 'Tarangire National Park is celebrated for iconic baobab trees and vast elephant herds along the Tarangire River. We arrange chartered flight itineraries directly from Zanzibar.',
        action: { label: 'View Tarangire Safaris', actionType: 'SCROLL', target: 'tanzania' },
        intent: 'safari_tarangire',
        confidence: 0.92,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // B. Check-in & Check-out
    const checkinKeywords = ['check-in', 'checkin', 'check out', 'checkout', 'horaires', 'muda wa kuingia', 'horario', 'arrived', 'departure', 'jam masuk', 'waktu masuk', 'wymeldowani', 'zameldowani', '入住', '退房', 'الوصول', 'المغادرة'];
    if (checkinKeywords.some((k) => q.includes(k))) {
      return {
        replyText: 'Standard check-in is from 14:00 (2:00 PM) and check-out is until 11:00 AM. Flexible early check-in or late checkout can be accommodated based on villa availability.',
        action: { label: 'Book a Villa', actionType: 'MODAL', target: 'booking_modal' },
        intent: 'faq_checkin_checkout',
        confidence: 0.94,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // C. Wi-Fi / Starlink
    const wifiKeywords = ['wifi', 'wi-fi', 'internet', 'speed', 'starlink', 'network', 'connect', 'online', 'ستارلينك', '星链', '无线'];
    if (wifiKeywords.some((k) => q.includes(k))) {
      return {
        replyText: 'High-speed Starlink satellite Wi-Fi (150+ Mbps) is complimentary across all private villas, gardens, and dining pavilions, ensuring reliable connectivity for streaming or remote work.',
        action: { label: 'Check Villa Features', actionType: 'SCROLL', target: 'stay' },
        intent: 'faq_starlink_wifi',
        confidence: 0.95,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // D. Payment & Cancellation
    const paymentKeywords = ['payment', 'pay', 'cancel', 'deposit', 'card', 'visa', 'mastercard', 'amex', 'paiement', 'pago', 'malipo', 'bayar', 'pembayaran', 'płatnoś', 'anulac', 'الدفع', 'إلغاء', '付款', '取消'];
    if (paymentKeywords.some((k) => q.includes(k))) {
      return {
        replyText: 'We accept major credit cards (Visa, MasterCard, Amex), international bank transfers, and mobile payments. Cancellation terms offer full flexibility up to 14 days prior to arrival.',
        action: { label: 'Reserve a Villa', actionType: 'MODAL', target: 'booking_modal' },
        intent: 'faq_payment_cancellation',
        confidence: 0.90,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // E. Dolphins / Menai Bay
    const dolphinKeywords = ['dolphin', 'pomboo', 'dauphin', 'delfin', 'delfini', 'دلافين', 'دلفين', '海豚'];
    if (dolphinKeywords.some((k) => q.includes(k))) {
      return {
        replyText: 'Kizimkazi is world-famous for resident dolphin pods in the Menai Bay Conservation Area. We organize ethical sunrise dolphin safaris directly from our shore.',
        action: { label: 'Explore Dolphin Safaris', actionType: 'SCROLL', target: 'experiences' },
        intent: 'experience_dolphins',
        confidence: 0.93,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // F. Dhow / Sunset Cruise
    const dhowKeywords = ['dhow', 'jahazi', 'dau', 'voilier', 'velero', 'قارب', 'الداو', '木船', '帆船'];
    if (dhowKeywords.some((k) => q.includes(k))) {
      return {
        replyText: 'Glide across the turquoise Indian Ocean aboard a handcrafted wooden dhow while enjoying chilled Champagne and fresh Swahili canapés as the sun sets.',
        action: { label: 'View Sunset Sailing', actionType: 'SCROLL', target: 'experiences' },
        intent: 'experience_sunset_dhow',
        confidence: 0.93,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // G. Candlelight Beach Dining
    const candleKeywords = ['candle', 'candlelight', 'chandelles', 'romantique', 'mishumaa', 'vela', 'velas', 'شموع', 'شمع', '烛光', 'świec'];
    if (candleKeywords.some((k) => q.includes(k))) {
      // General question without high-constraint date or party size
      return {
        replyText: 'We arrange unforgettable candlelit dinners directly on the soft white sands or elevated coral terraces with torchlight and a custom 5-course seafood tasting menu.',
        action: { label: 'Taste Dining Moments', actionType: 'SCROLL', target: 'dining' },
        intent: 'dining_candlelight',
        confidence: 0.88,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // H. Spa & Wellness
    const spaKeywords = ['spa', 'massage', 'masaji', 'bien-être', 'bienestar', 'odnowa', 'تدليك', 'سبa', '水疗', '按摩', 'wellness', 'therap'];
    if (spaKeywords.some((k) => q.includes(k))) {
      return {
        replyText: 'Our in-villa wellness treatments feature cold-pressed Zanzibari coconut oils, clove and cinnamon body scrubs, and soothing deep-tissue massages performed on your private ocean deck.',
        action: { label: 'View Wellness & Spa', actionType: 'SCROLL', target: 'experiences' },
        intent: 'experience_spa',
        confidence: 0.92,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // I. Stone Town & Spices
    const stonetownKeywords = ['stone town', 'spice', 'épices', 'viungo', 'especias', 'spezie', 'التوابل', 'المدينة الحجرية', '石头城', '香料', 'przypraw'];
    if (stonetownKeywords.some((k) => q.includes(k))) {
      return {
        replyText: 'We organize private cultural journeys with local historians through UNESCO-listed Stone Town and organic spice plantations celebrating vanilla, cloves, and cardamom.',
        action: { label: 'Discover Island Tours', actionType: 'SCROLL', target: 'experiences' },
        intent: 'experience_stone_town',
        confidence: 0.92,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // J. Family & Children
    const familyKeywords = ['family', 'children', 'child', 'kid', 'famille', 'enfant', 'familia', 'niño', 'watoto', 'bambin', 'عائل', 'أطفال', '家庭', '儿童', 'rodzin'];
    if (familyKeywords.some((k) => q.includes(k))) {
      return {
        replyText: 'Families are warmly welcomed. We offer interconnecting villa sanctuaries, extra beds, tailored kids menus, and professional babysitting upon request.',
        action: { label: 'Explore Family Villas', actionType: 'SCROLL', target: 'stay' },
        intent: 'faq_family_children',
        confidence: 0.90,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // K. Honeymoon
    const honeymoonKeywords = ['honeymoon', 'anniversary', 'lune de miel', 'fungate', 'luna de miel', 'luna di miele', 'عسل', 'رومانس', '蜜月', 'młod', 'poślubn'];
    if (honeymoonKeywords.some((k) => q.includes(k))) {
      return {
        replyText: 'For honeymooners, we prepare complimentary chilled Champagne, fresh tropical floral arrangements, a private sunset dhow sail, and a romantic beach dinner under the stars.',
        action: { label: 'Plan Honeymoon Escape', actionType: 'MODAL', target: 'booking_modal' },
        intent: 'faq_honeymoon',
        confidence: 0.91,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // L. Diving & Reefs
    const divingKeywords = ['dive', 'diving', 'snorkel', 'snorkeling', 'plongée', 'kuzamia', 'buceo', 'immersi', 'غوص', 'سنوركل', '潜水', '浮潜', 'nurkowan', 'reef', 'coral'];
    if (divingKeywords.some((k) => q.includes(k))) {
      return {
        replyText: 'Partnering with certified PADI dive masters, we take you to the pristine reefs of Mnemba Atoll and Kizimkazi to observe sea turtles, manta rays, and vibrant marine life.',
        action: { label: 'Explore Marine Safaris', actionType: 'SCROLL', target: 'experiences' },
        intent: 'experience_diving',
        confidence: 0.92,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // M. Pools & Beach
    const poolKeywords = ['pool', 'plunge', 'swim', 'beach', 'ocean', 'piscine', 'bwawa', 'piscina', 'pantai', 'kolam', 'basen', 'المسبح', 'الشاطئ', '泳池', '沙滩'];
    if (poolKeywords.some((k) => q.includes(k))) {
      return {
        replyText: 'Every single one of our 8 luxury sanctuaries features its own private freshwater plunge pool, sun loungers, and direct private pathway access to the pristine shores of the Indian Ocean.',
        action: { label: 'View Private Villas', actionType: 'SCROLL', target: 'stay' },
        intent: 'faq_pools_beach',
        confidence: 0.89,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // N. Villas & Rates (General)
    const villaKeywords = ['villa', 'rate', 'price', 'stay', 'room', 'availab', 'suite', 'bungalow', 'prix', 'chambre', 'bei', 'chumba', 'precio', 'tarifa', 'فلل', 'فيلا', 'سعر', '别墅', '价格'];
    if (villaKeywords.some((k) => q.includes(k))) {
      return {
        replyText: 'We feature 8 handcrafted luxury sanctuaries including oceanfront pool villas and secluded garden bungalows. Would you like to check dates and availability?',
        action: { label: 'Check Villa Availability', actionType: 'MODAL', target: 'booking_modal' },
        intent: 'faq_villas_rates',
        confidence: 0.86,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // O. Transfers & Location (General)
    const transferKeywords = ['airport', 'transfer', 'location', 'where', 'car', 'distance', 'arrive', 'driver', 'taxi', 'shuttle', 'aéroport', 'usafiri', 'aeropuerto', 'مطار', '接送'];
    if (transferKeywords.some((k) => q.includes(k))) {
      return {
        replyText: 'We provide private VIP meet-and-greet and chauffeur shuttle transfers from Abeid Amani Karume International Airport (ZNZ) directly to our sanctuary in Kizimkazi (approx. 55 minutes).',
        action: { label: 'View Transfer Details', actionType: 'SCROLL', target: 'shuttle' },
        intent: 'faq_transfers',
        confidence: 0.88,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // P. Dining (General)
    const diningKeywords = ['din', 'food', 'restaurant', 'chef', 'breakfast', 'menu', 'lunch', 'eat', 'drink', 'cuisine', 'nourriture', 'chakula', 'comida', 'مطعم', '餐厅'];
    if (diningKeywords.some((k) => q.includes(k))) {
      return {
        replyText: 'Our gastronomic philosophy embraces organic garden-to-table produce and line-caught seafood with authentic Swahili and fine international dining.',
        action: { label: 'Taste Dining & Garden Menu', actionType: 'SCROLL', target: 'dining' },
        intent: 'faq_dining',
        confidence: 0.86,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // -------------------------------------------------------------
    // RULE 4: LOW CONFIDENCE / UNKNOWN QUERY -> HUMAN HANDOFF
    // -------------------------------------------------------------
    return {
      replyText: fallbackHandoff,
      intent: 'unrecognized_visitor_inquiry',
      confidence: 0.40,
      knowledge_source: 'NONE',
      decision: 'HANDOFF_TO_HUMAN',
      handoffReason: 'Query contains unfamiliar, highly specific, or unverified inquiry requirements.',
    };
  }

  /**
   * Generates a suggested reply for the human admin when HUMAN_ACTIVE is set.
   */
  generateSuggestedReplyForAdmin(
    lastVisitorMessage: string,
    _history: { sender: string; text: string }[]
  ): string {
    const q = lastVisitorMessage.toLowerCase();

    if (q.includes('dinner') && (q.includes('candlelight') || q.includes('beach'))) {
      return 'Yes, we can check availability for a private candlelight dinner on the beach. May I confirm the preferred date, time, and any specific dietary preferences for your party?';
    }

    if (q.includes('transfer') || q.includes('airport') || q.includes('pickup')) {
      return 'Yes, private VIP airport transfers can be arranged subject to availability. May I confirm your flight number and expected arrival date?';
    }

    if (q.includes('safari') || q.includes('serengeti') || q.includes('ngorongoro')) {
      return 'We would be delighted to customize your Tanzania safari fly-in itinerary. How many nights would you like to dedicate to the game drives, and do you have a preferred travel month?';
    }

    if (q.includes('villa') || q.includes('room') || q.includes('book') || q.includes('stay')) {
      return 'Jambo! I would be pleased to review our direct sanctuary availability for your requested dates. Could you kindly share your preferred check-in and check-out schedule?';
    }

    return 'Jambo! Thank you for contacting our concierge team directly. I am reviewing the details of your inquiry right now and will assist you immediately.';
  }
}

export const supportAiEngine = new SupportAiEngine();
