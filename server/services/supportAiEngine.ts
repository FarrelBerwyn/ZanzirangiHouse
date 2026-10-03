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
  id: 'Pertanyaan detail Anda telah kami teruskan langsung ke Admin / Tim Concierge Zanzirangi House. Staf kami akan segera membalas pesan Anda di sini secara langsung. Terima kasih atas kesabaran Anda!',
  en: "Your detailed request has been forwarded directly to our Admin & Concierge team. A staff member will assist you shortly here in the chat. Thank you for your patience!",
  fr: 'Votre demande détaillée a été transmise directement à notre équipe de conciergerie. Un membre de notre équipe vous répondra sous peu.',
  sw: 'Ombi lako la kina limetumwa moja kwa moja kwa wasimamizi wetu. Mhudumu wetu atakujibu hapa punde si punde.',
  es: 'Su consulta detallada ha sido enviada a nuestro equipo de conserjería. Un miembro del personal le responderá en breve.',
  it: 'La vostra richiesta dettagliata è stata inoltrata al nostro team concierge. Un nostro collaboratore vi risponderà a breve.',
  pl: 'Twoje szczegółowe zapytanie zostało przekazane bezpośrednio do naszego zespołu konsjerża. Nasz pracownik wkrótce Ci odpowie.',
  ar: 'تم توجيه استفسارك التفصيلي مباشرة إلى فريق الكونسيرج وسيقوم أحد موظفينا بالرد عليك هنا قريباً.',
  zh: '您的详细咨询已直接转交给我们的私人礼宾管家团队，工作人员将很快在此为您解答，感谢您的耐心等待！',
};

export class SupportAiEngine {
  /**
   * Evaluates a visitor query through the Support Decision Layer:
   * 1. Simple greetings, pleasantries & FAQs -> AUTO_ANSWER immediately by Elena
   * 2. Detailed questions, custom quotes, discounts, or explicit human requests -> HANDOFF_TO_HUMAN (routed to Admin with email alert)
   * 3. Seamless Indonesian and multi-language comprehension
   */
  async evaluateQuery(
    query: string,
    lang: string = 'en',
    _currentPage: string = '/',
    conciergeName: string = 'Elena'
  ): Promise<AiEvaluationResult> {
    const q = query.trim().toLowerCase();
    const isIndonesian =
      lang === 'id' ||
      /\b(malam|pagi|siang|sore|halo|hai|bisa|berapa|kamar|kolam|sarapan|makan|pantai|tolong|terima kasih|makasih|siapa|admin|staf|dimana|apakah|tanya|pesan|sewa|harga|villa|jemput|bandara|diskon|promo|rombongan|orang|ada|nginap|menginap)\b/i.test(
        q
      );

    const fallbackHandoff = isIndonesian
      ? HANDOFF_MESSAGES.id
      : (HANDOFF_MESSAGES[lang] || HANDOFF_MESSAGES.en);

    const name = (conciergeName && conciergeName.trim()) || 'Elena';
    const nameEscaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // -------------------------------------------------------------
    // RULE 1: EXPLICIT HUMAN / ADMIN REQUEST
    // If the guest asks for admin/staff, immediately route to human
    // -------------------------------------------------------------
    const asksForHuman =
      /\b(admin|staf|staff|human|manusia|orang|manager|manajer|owner|pemilik|hubungi|bicara|talk to|speak to|contact|bantuan langsung|operator|customer care)\b/i.test(
        q
      );
    if (asksForHuman) {
      return {
        replyText: isIndonesian
          ? 'Tentu! Pesan Anda telah kami teruskan langsung ke Admin Zanzirangi House. Staf kami akan segera merespons Anda di sini dalam hitungan menit.'
          : (HANDOFF_MESSAGES[lang] || HANDOFF_MESSAGES.en),
        intent: 'human_concierge_requested',
        confidence: 0.98,
        knowledge_source: 'NONE',
        decision: 'HANDOFF_TO_HUMAN',
        handoffReason: 'Visitor explicitly requested to communicate with a human staff member / admin.',
      };
    }

    // -------------------------------------------------------------
    // RULE 2: DETAILED / HIGH CONSTRAINT REQUESTS (Discounts, Events, Large Groups)
    // Detailed commercial matters are routed to human admin
    // -------------------------------------------------------------
    const hasDiscountInquiry = /\b(diskon|discount|promo|potongan|tawar|nego|best price|special rate)\b/i.test(q);
    const hasEventInquiry = /\b(wedding|nikah|pernikahan|event|acara|gathering|party|anniversary khusus|charter)\b/i.test(q);
    const hasImmediateDate = /\b(tomorrow|tonight|today|besok|malam ini|demain|ce soir|mañana|domani|jutro|غدا|اليوم|明天|今晚)\b/i.test(q);
    const hasSpecificLargeGroup =
      /\b(1[0-9]|[2-9][0-9])\s*(people|guests|persons|orang|personnes|personas|persone|osób|شخص|位|人)\b/i.test(q) ||
      /\b(for|untuk|pour|para|per|dla|li|共)\s*(1[0-9]|[2-9][0-9])\b/i.test(q);

    if (hasDiscountInquiry || hasEventInquiry || (hasImmediateDate && hasSpecificLargeGroup)) {
      return {
        replyText: isIndonesian
          ? 'Untuk permintaan khusus, penawaran harga terbaik, serta ketersediaan rombongan detail, pertanyaan Anda sedang kami teruskan langsung ke Admin / Manajer Reservasi kami untuk dikonfirmasi secepatnya.'
          : fallbackHandoff,
        intent: 'custom_inquiry_handoff',
        confidence: 0.92,
        knowledge_source: 'NONE',
        decision: 'HANDOFF_TO_HUMAN',
        handoffReason: 'Visitor inquired about discounts, events, or specific high-constraint bookings requiring human management approval.',
      };
    }

    // -------------------------------------------------------------
    // RULE 3: Dynamic Knowledge Base Lookup (Admin-curated KB)
    // Evaluated with priority so admin custom greetings & answers take effect
    // -------------------------------------------------------------
    try {
      const kbItems = await supportRepository.getKnowledgeBase({
        status: 'PUBLISHED',
      });

      for (const item of kbItems) {
        const itemQ = (item.question || '').toLowerCase().trim();
        if (!itemQ) continue;

        // Split question by common delimiters to support multi-phrases (e.g. "Hello / Hi / Greetings")
        const phrases = itemQ
          .split(/[/,|;]/)
          .map((p) => p.trim())
          .filter((p) => p.length > 0);

        const isMatch =
          q === itemQ ||
          (q.length > 15 && itemQ.includes(q)) ||
          (itemQ.length > 15 && q.includes(itemQ)) ||
          phrases.some((phrase) => {
            if (q === phrase) return true;
            if (phrase.length >= 3) {
              const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              return new RegExp(`(^|\\s)${escaped}(\\s|$|\\?|!|\\.)`, 'i').test(q);
            }
            return false;
          });

        if (isMatch) {
          // Dynamically replace name tokens with the active concierge name
          let resolvedAnswer = item.answer
            .replace(/\{(?:name|concierge_name|support_name|concierge)\}/gi, name);

          // If answer contains legacy static default names and concierge is customized
          if (name !== 'Elena' && name !== 'Juma') {
            resolvedAnswer = resolvedAnswer.replace(/\b(Elena|Juma)\b/g, name);
          }

          return {
            replyText: resolvedAnswer,
            intent: `kb_${item.category.toLowerCase().replace(/\s+/g, '_')}`,
            confidence: 0.96,
            knowledge_source: `KNOWLEDGE_BASE_${item.id}`,
            decision: 'AUTO_ANSWER',
          };
        }
      }
    } catch {
      // Continue to deterministic engine
    }

    // -------------------------------------------------------------
    // RULE 4: SIMPLE GREETINGS & PLEASANTRIES (Instant Auto Answer Fallback)
    // -------------------------------------------------------------
    // A. Sapaan malam
    if (/\b(malam|selamat malam|good evening|soir|bonsoir|buonasera|buenas noches|dobry wieczór|مساء الخير|晚上好)\b/i.test(q)) {
      return {
        replyText: isIndonesian
          ? `Jambo & selamat malam! Senang bisa menyapa Anda di Zanzirangi House. Saya ${name}, concierge Anda. Ada yang bisa kami bantu seputar reservasi villa, fasilitas, atau pengalaman safari & wisata di Zanzibar?`
          : `Jambo and good evening! Welcome to Zanzirangi House. My name is ${name}, your private concierge. How may I assist your stay or inquiries in Zanzibar tonight?`,
        action: { label: isIndonesian ? 'Lihat Pilihan Villa' : 'View Villas', actionType: 'SCROLL', target: 'stay' },
        intent: 'greeting_evening',
        confidence: 0.98,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // B. Sapaan pagi / siang / sore
    if (/\b(pagi|selamat pagi|siang|selamat siang|sore|selamat sore|good morning|good afternoon|bonjour|buongiorno|buenos días|dzień dobry|صباح الخير|早上好|下午好)\b/i.test(q)) {
      return {
        replyText: isIndonesian
          ? `Jambo & selamat datang! Saya ${name}, concierge pribadi Anda di Zanzirangi House. Ada yang bisa kami bantu hari ini seputar pilihan villa, dining, atau safari di Zanzibar?`
          : `Jambo and welcome! My name is ${name}, your personal concierge at Zanzirangi House. How may I assist you today regarding our luxury villas, dining, or safari experiences?`,
        action: { label: isIndonesian ? 'Lihat Pilihan Villa' : 'View Villas', actionType: 'SCROLL', target: 'stay' },
        intent: 'greeting_daytime',
        confidence: 0.98,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // C. Sapaan umum (halo / hi / hello / jambo)
    const nameGreetingRegex = new RegExp(`\\b(halo|hi|hello|hey)\\s+(${nameEscaped}|elena|juma)\\b`, 'i');
    if (
      /^(halo|hai|hi|hello|hey|jambo|habari|hola|ciao|salut|cześć|مرحبا|你好)[\s!.?]*$/i.test(q) ||
      nameGreetingRegex.test(q) ||
      /\b(selamat datang)\b/i.test(q)
    ) {
      return {
        replyText: isIndonesian
          ? `Jambo! Halo, senang Anda menghubungi kami di Zanzirangi House. Saya ${name}, concierge Anda. Silakan tanyakan apa pun seputar reservasi villa, check-in, antar-jemput bandara, atau pengalaman menarik di Zanzibar!`
          : `Jambo! Welcome to Zanzirangi House. I am ${name}, your personal concierge. Feel free to ask about our private villas, check-in, transfers, dining, or bespoke safari journeys!`,
        action: { label: isIndonesian ? 'Eksplorasi Sanctuary' : 'Explore Sanctuary', actionType: 'SCROLL', target: 'itinerary' },
        intent: 'greeting_general',
        confidence: 0.98,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // D. Ucapan terima kasih
    if (/\b(terima kasih|makasih|matur suwun|thank you|thanks|asante|merci|grazie|gracias|dzięk|شكرا|谢谢)\b/i.test(q)) {
      return {
        replyText: isIndonesian
          ? 'Sama-sama! Dengan senang hati. Jika Anda membutuhkan informasi lebih lanjut atau ingin memesan villa, tim kami selalu siap membantu.'
          : 'You are most welcome! It is our pleasure. Please let us know if there is anything else we can arrange for your luxury retreat in Zanzibar.',
        intent: 'polite_thank_you',
        confidence: 0.96,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // E. Konfirmasi santai (ok, baik, siap)
    if (/^(ok|oke|okay|baik|siap|noted|siap kak|siap min|roger|alright|fine|yes|ya)[\s!.?]*$/i.test(q)) {
      return {
        replyText: isIndonesian
          ? 'Baik, terima kasih! Silakan beri tahu kami kapan pun Anda siap melakukan reservasi atau membutuhkan bantuan lainnya.'
          : 'Wonderful! We are right here whenever you need assistance with your booking or stay arrangements. Enjoy your time!',
        intent: 'polite_acknowledgement',
        confidence: 0.95,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // F. Pertanyaan identitas (siapa kamu / recent concierge name)
    const identityRegex = new RegExp(`\\b(siapa kamu|kamu siapa|who are you|siapa ini|bot atau|apakah bot|(${nameEscaped}|elena|juma) itu siapa)\\b`, 'i');
    if (identityRegex.test(q)) {
      return {
        replyText: isIndonesian
          ? `Saya ${name}, Customer Support & Concierge pribadi Anda di Zanzirangi House. Saya siap menjawab pertanyaan Anda seputar sanctuary kami, dan staf admin kami juga selalu terhubung langsung di sini jika Anda membutuhkan bantuan khusus.`
          : `I am ${name}, your personal Customer Support & Concierge at Zanzirangi House. I am here to assist with all your questions, and our human admin team is also directly connected here whenever you need specialized assistance.`,
        intent: 'faq_identity',
        confidence: 0.95,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // -------------------------------------------------------------
    // RULE 5: SIMPLE COMMON FAQS (Deterministic, Fast, Accurate)
    // -------------------------------------------------------------

    // Check-in & Check-out
    const checkinKeywords = ['check-in', 'checkin', 'check out', 'checkout', 'horaires', 'muda wa kuingia', 'horario', 'arrived', 'departure', 'jam masuk', 'waktu masuk', 'jam berapa masuk', 'jam keluar', 'wymeldowani', 'zameldowani', '入住', '退房', 'الوصول', 'المغادرة'];
    if (checkinKeywords.some((k) => q.includes(k))) {
      return {
        replyText: isIndonesian
          ? 'Waktu check-in standar kami mulai pukul 14:00 (2:00 siang) dan check-out hingga pukul 11:00 pagi. Early check-in atau late check-out dapat disesuaikan secara fleksibel tergantung ketersediaan villa Anda.'
          : 'Standard check-in is from 14:00 (2:00 PM) and check-out is until 11:00 AM. Flexible early check-in or late checkout can be accommodated based on villa availability.',
        action: { label: isIndonesian ? 'Reservasi Villa' : 'Book a Villa', actionType: 'MODAL', target: 'booking_modal' },
        intent: 'faq_checkin_checkout',
        confidence: 0.94,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // Wi-Fi / Starlink
    const wifiKeywords = ['wifi', 'wi-fi', 'internet', 'speed', 'starlink', 'network', 'koneksi', 'sinyal', 'connect', 'online', 'ستارلينك', '星链', '无线'];
    if (wifiKeywords.some((k) => q.includes(k))) {
      return {
        replyText: isIndonesian
          ? 'Internet satelit Starlink kecepatan tinggi (150+ Mbps) tersedia gratis tanpa batas di seluruh private villa, taman santuari, dan paviliun restoran kami untuk kenyamanan streaming maupun remote work.'
          : 'High-speed Starlink satellite Wi-Fi (150+ Mbps) is complimentary across all private villas, gardens, and dining pavilions, ensuring reliable connectivity for streaming or remote work.',
        action: { label: isIndonesian ? 'Cek Fasilitas Villa' : 'Check Villa Features', actionType: 'SCROLL', target: 'stay' },
        intent: 'faq_starlink_wifi',
        confidence: 0.95,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // Pools & Beach
    const poolKeywords = ['pool', 'plunge', 'swim', 'beach', 'ocean', 'piscine', 'bwawa', 'piscina', 'pantai', 'kolam', 'renang', 'basen', 'المسبح', 'الشاطئ', '泳池', '沙滩'];
    if (poolKeywords.some((k) => q.includes(k))) {
      return {
        replyText: isIndonesian
          ? 'Setiap villa dari 8 private sanctuary kami memiliki kolam renang pribadi (freshwater plunge pool), sun loungers, dan akses jalur pribadi langsung ke pantai Kizimkazi Samudra Hindia yang tenang.'
          : 'Every single one of our 8 luxury sanctuaries features its own private freshwater plunge pool, sun loungers, and direct private pathway access to the pristine shores of the Indian Ocean.',
        action: { label: isIndonesian ? 'Lihat Private Villa' : 'View Private Villas', actionType: 'SCROLL', target: 'stay' },
        intent: 'faq_pools_beach',
        confidence: 0.94,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // Transfers & Location
    const transferKeywords = ['airport', 'transfer', 'location', 'where', 'car', 'distance', 'arrive', 'driver', 'taxi', 'shuttle', 'jemput', 'antar jemput', 'bandara', 'lokasi', 'dimana', 'alamat', 'jauh', 'usafiri', 'مطار', '接送'];
    if (transferKeywords.some((k) => q.includes(k))) {
      return {
        replyText: isIndonesian
          ? 'Zanzirangi House berlokasi di Kizimkazi Dimbani, pesisir selatan Zanzibar. Kami menyediakan layanan antar-jemput VIP chauffeur pribadi dari Bandara Internasional Zanzibar (ZNZ) langsung ke sanctuary (~55 menit perjalanan).'
          : 'We provide private VIP meet-and-greet and chauffeur shuttle transfers from Abeid Amani Karume International Airport (ZNZ) directly to our sanctuary in Kizimkazi (approx. 55 minutes).',
        action: { label: isIndonesian ? 'Detail Layanan Transfer' : 'View Transfer Details', actionType: 'SCROLL', target: 'shuttle' },
        intent: 'faq_transfers',
        confidence: 0.92,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // Dining / Food / Breakfast
    const diningKeywords = ['din', 'food', 'restaurant', 'chef', 'breakfast', 'menu', 'lunch', 'eat', 'drink', 'makan', 'makanan', 'sarapan', 'restoran', 'kuliner', 'halal', 'seafood', 'cuisine', 'chakula', 'comida', 'مطعم', '餐厅'];
    if (diningKeywords.some((k) => q.includes(k))) {
      return {
        replyText: isIndonesian
          ? 'Filosofi kuliner kami menyajikan hasil bumi organik dari kebun sendiri (garden-to-table) dan hidangan seafood segar tangkapan harian nelayan lokal dengan sentuhan Swahili otentik dan menu internasional mewah.'
          : 'Our gastronomic philosophy embraces organic garden-to-table produce and line-caught seafood with authentic Swahili and fine international dining.',
        action: { label: isIndonesian ? 'Lihat Menu & Dining' : 'Taste Dining & Garden Menu', actionType: 'SCROLL', target: 'dining' },
        intent: 'faq_dining',
        confidence: 0.92,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // Safari Destinations
    if (q.includes('serengeti') || q.includes('great migration')) {
      return {
        replyText: isIndonesian
          ? 'Taman Nasional Serengeti adalah pengalaman safari legendaris. Zanzirangi House mengatur safari terbang carter langsung dari Zanzibar (±1 jam 45 menit) dengan akomodasi tenda mewah mitra kami.'
          : 'Serengeti National Park is an extraordinary safari experience. Zanzirangi House arranges direct chartered fly-in safaris from Zanzibar airport (approx. 1h 45m) with luxury partner tented camps overlooking migration corridors.',
        action: { label: isIndonesian ? 'Lihat Destinasi Safari' : 'View Safari Destinations', actionType: 'SCROLL', target: 'tanzania' },
        intent: 'safari_serengeti',
        confidence: 0.95,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    if (q.includes('ngorongoro') || q.includes('crater')) {
      return {
        replyText: isIndonesian
          ? 'Kawah Ngorongoro menyimpan populasi predator terpadat di Afrika di dalam kaldera vulkanik UNESCO. Kami menyediakan paket safari terbang kombinasi liburan pantai dan game drive kawah.'
          : 'Ngorongoro Crater offers Africa’s densest predator populations inside a UNESCO volcanic caldera. We organize chartered fly-in packages combining your beach retreat with panoramic crater floor game drives.',
        action: { label: isIndonesian ? 'Eksplorasi Ngorongoro' : 'Explore Ngorongoro', actionType: 'SCROLL', target: 'tanzania' },
        intent: 'safari_ngorongoro',
        confidence: 0.95,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    if (q.includes('kilimanjaro')) {
      return {
        replyText: isIndonesian
          ? 'Ekspedisi Gunung Kilimanjaro dan safari penerbangan panorama diatur bersama mitra pemandu gunung resmi kami, lengkap dengan aklimatisasi sebelum pendakian atau istirahat relaksasi setelahnya.'
          : 'Mount Kilimanjaro expeditions and scenic fly-over safaris are arranged through our certified mainland mountain guide partners. We can curate pre-climb acclimatization stays or relaxing post-climb beach recovery.',
        action: { label: isIndonesian ? 'Rencanakan Safari & Kilimanjaro' : 'Plan Safari & Kilimanjaro', actionType: 'SCROLL', target: 'tanzania' },
        intent: 'safari_kilimanjaro',
        confidence: 0.92,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // Dolphins / Kizimkazi Marine
    const dolphinKeywords = ['dolphin', 'lumba', 'pomboo', 'dauphin', 'delfin', 'دلافين', '海豚'];
    if (dolphinKeywords.some((k) => q.includes(k))) {
      return {
        replyText: isIndonesian
          ? 'Kizimkazi terkenal di dunia dengan kawanan lumba-lumba di Kawasan Konservasi Menai Bay. Kami mengadakan safari lumba-lumba etis saat matahari terbit langsung dari tepi pantai kami.'
          : 'Kizimkazi is world-famous for resident dolphin pods in the Menai Bay Conservation Area. We organize ethical sunrise dolphin safaris directly from our shore.',
        action: { label: isIndonesian ? 'Eksplorasi Safari Lumba-Lumba' : 'Explore Dolphin Safaris', actionType: 'SCROLL', target: 'experiences' },
        intent: 'experience_dolphins',
        confidence: 0.94,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // Dhow / Sunset Cruise
    const dhowKeywords = ['dhow', 'sunset', 'perahu', 'kapal', 'jahazi', 'layar', 'senja', 'matahari terbenam', 'voilier', 'قارب', 'الداو', '木船'];
    if (dhowKeywords.some((k) => q.includes(k))) {
      return {
        replyText: isIndonesian
          ? 'Nikmati pelayaran magis di atas perahu kayu tradisional Dhow menyusuri Samudra Hindia pirus sambil menikmati Champagne dingin dan canapé Swahili saat matahari terbenam.'
          : 'Glide across the turquoise Indian Ocean aboard a handcrafted wooden dhow while enjoying chilled Champagne and fresh Swahili canapés as the sun sets.',
        action: { label: isIndonesian ? 'Lihat Sunset Sailing' : 'View Sunset Sailing', actionType: 'SCROLL', target: 'experiences' },
        intent: 'experience_sunset_dhow',
        confidence: 0.93,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // Spa & Wellness
    const spaKeywords = ['spa', 'massage', 'pijat', 'masaji', 'relaksasi', 'bien-être', 'تدليك', '水疗', '按摩', 'wellness'];
    if (spaKeywords.some((k) => q.includes(k))) {
      return {
        replyText: isIndonesian
          ? 'Layanan spa & wellness in-villa kami menggunakan minyak kelapa Zanzibari murni, scrub cengkeh & kayu manis, serta deep-tissue massage yang menenangkan langsung di dek oceanfront pribadi Anda.'
          : 'Our in-villa wellness treatments feature cold-pressed Zanzibari coconut oils, clove and cinnamon body scrubs, and soothing deep-tissue massages performed on your private ocean deck.',
        action: { label: isIndonesian ? 'Lihat Layanan Spa' : 'View Wellness & Spa', actionType: 'SCROLL', target: 'experiences' },
        intent: 'experience_spa',
        confidence: 0.92,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // Villas & General Rates
    const villaKeywords = ['villa', 'rate', 'price', 'stay', 'room', 'kamar', 'harga', 'sewa', 'tarif', 'tipe', 'bungalow', 'availab', 'chambre', 'chumba', 'فلل', '别墅'];
    if (villaKeywords.some((k) => q.includes(k))) {
      return {
        replyText: isIndonesian
          ? 'Zanzirangi House menyediakan 8 private pool sanctuary eksklusif termasuk oceanfront villa dan garden sanctuary yang tenang. Apakah Anda ingin mengecek tanggal dan ketersediaan sekarang?'
          : 'We feature 8 handcrafted luxury sanctuaries including oceanfront pool villas and secluded garden bungalows. Would you like to check dates and availability?',
        action: { label: isIndonesian ? 'Cek Ketersediaan Villa' : 'Check Villa Availability', actionType: 'MODAL', target: 'booking_modal' },
        intent: 'faq_villas_rates',
        confidence: 0.90,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // Payment & Cancellation
    const paymentKeywords = ['payment', 'pay', 'cancel', 'deposit', 'card', 'visa', 'mastercard', 'bayar', 'pembayaran', 'batal', 'pembatalan', 'kartu kredit', 'malipo', 'الدفع'];
    if (paymentKeywords.some((k) => q.includes(k))) {
      return {
        replyText: isIndonesian
          ? 'Kami menerima kartu kredit utama (Visa, MasterCard, Amex), transfer bank internasional, dan pembayaran digital. Kebijakan pembatalan fleksibel penuh hingga 14 hari sebelum tanggal kedatangan.'
          : 'We accept major credit cards (Visa, MasterCard, Amex), international bank transfers, and mobile payments. Cancellation terms offer full flexibility up to 14 days prior to arrival.',
        action: { label: isIndonesian ? 'Reservasi Sekarang' : 'Reserve a Villa', actionType: 'MODAL', target: 'booking_modal' },
        intent: 'faq_payment_cancellation',
        confidence: 0.90,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // -------------------------------------------------------------
    // RULE 6: DETAILED / UNRECOGNIZED QUERY -> HANDOFF TO HUMAN ADMIN
    // If it is not a simple FAQ, route it directly to Admin with email alert!
    // -------------------------------------------------------------
    return {
      replyText: fallbackHandoff,
      intent: 'detailed_inquiry_handed_to_admin',
      confidence: 0.45,
      knowledge_source: 'NONE',
      decision: 'HANDOFF_TO_HUMAN',
      handoffReason: 'Query contains detailed, unverified, or specialized requirements forwarded for direct admin response.',
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
