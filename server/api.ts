import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import {
  homepageRepository,
  villasRepository,
  galleryRepository,
  facilitiesRepository,
  testimonialsRepository,
  videosRepository,
  seoRepository,
  mediaRepository,
  settingsRepository,
  contactRepository,
  auditRepository,
  usersRepository,
  pageContentsRepository,
  chauffeurRepository,
  whyStayRepository,
  diningRepository,
  experiencesRepository,
  safariRepository,
  globalContentRepository,
  translationsRepository,
  SUPPORTED_TRANSLATION_LANGS,
  getDatabaseAdapter,
} from './database/index.ts';
import {
  authenticateAdmin,
  loginUser,
  AuthenticatedRequest,
  requirePermission,
  requireAnyPermission,
  requireSuperadmin,
  sanitizePermissions,
  ADMIN_PERMISSIONS,
  verifyToken,
} from './auth.ts';
import { mediaStorage } from './storage/index.ts';
import { env } from './config/env.ts';
import { supportRouter } from './supportApiRoutes.ts';
import { runtimeState, uptimeSeconds } from './runtime.ts';

export const apiApp = express();
// Behind Hostinger's reverse proxy: use X-Forwarded-For for req.ip (rate limiting, audit IPs).
apiApp.set('trust proxy', 1);
// A mounted sub-app keeps its own settings, so the parent's disable() does not cover /api/*.
apiApp.disable('x-powered-by');

// -------------------------------------------------------------
// Security Headers & Hardening Middleware
// -------------------------------------------------------------
apiApp.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  if (env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Configure CORS
const corsOrigin = env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN;
apiApp.use(cors({ origin: corsOrigin, credentials: true }));
apiApp.use(cookieParser());
// Media uploads arrive base64-encoded inside JSON (~4/3 of the file size), so allow headroom above MAX_UPLOAD_SIZE_MB.
const JSON_BODY_LIMIT_MB = Math.ceil(env.MAX_UPLOAD_SIZE_MB * 1.4) + 1;
apiApp.use(express.json({ limit: `${JSON_BODY_LIMIT_MB}mb` }));
apiApp.use(express.urlencoded({ extended: true, limit: `${env.MAX_UPLOAD_SIZE_MB}mb` }));


// Rate limiter for authentication attempts
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'production' ? 10 : 1000, // Strict 10 in production, relaxed in dev
  skip: () => env.NODE_ENV === 'development', // Skip in development
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many login attempts. Please try again after 15 minutes.',
  },
});

// -------------------------------------------------------------
// Health Check (Safe Public Endpoint)
// -------------------------------------------------------------
// 200 only when the process is serving AND MySQL answers `SELECT 1`; otherwise 503 so uptime
// monitors and the platform see a real failure instead of a misleading "ok".
apiApp.get('/health', async (_req: Request, res: Response) => {
  let dbHealth: { connected: boolean; provider: string; error?: string };
  try {
    dbHealth = await getDatabaseAdapter().healthCheck();
  } catch (err: any) {
    dbHealth = { connected: false, provider: env.DATABASE_PROVIDER, error: err?.message };
  }
  const healthy = dbHealth.connected && !runtimeState.shuttingDown;
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    database: {
      provider: dbHealth.provider,
      connected: dbHealth.connected,
      ...(healthy ? {} : { error: runtimeState.databaseError || dbHealth.error || 'Database unavailable' }),
    },
    runtime: {
      uptimeSeconds: uptimeSeconds(),
      startedAt: runtimeState.startedAt,
      shuttingDown: runtimeState.shuttingDown,
    },
    service: 'Zanzirangi House CMS Engine',
    version: env.APP_VERSION,
    releaseDate: env.APP_RELEASE_DATE,
    // Pipeline deployment stamp (tag, short commit, CI build, environment, time) — null for manual deploys.
    // The repository is public, so none of this is sensitive; it lets TKS prove exactly what is live.
    release: env.APP_DEPLOYMENT,
    timestamp: new Date().toISOString(),
  });
});

// Protected diagnostic endpoint: tests DNS, TCP, auth, DB selection, and SELECT 1 (superadmin only —
// it reveals the database host, name and user)
apiApp.get('/health/database', authenticateAdmin, requireSuperadmin, async (_req: Request, res: Response) => {
  try {
    const { testDatabaseConnection } = await import('./database/connection.ts');
    const diagnostic = await testDatabaseConnection();
    res.json({
      status: diagnostic.success ? 'ok' : 'degraded',
      diagnostic,
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      error: err.message,
    });
  }
});

// -------------------------------------------------------------
// Auth Endpoints
// -------------------------------------------------------------
apiApp.post('/auth/login', loginRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required.',
      });
      return;
    }

    const result = await loginUser(email, password);
    if (!result.success) {
      // Record the attempt (email + IP only — never the password).
      await auditRepository
        .log({
          action: 'USER_LOGIN_FAILED',
          userEmail: String(email).trim().toLowerCase().slice(0, 255),
          details: 'Failed administrator login attempt',
          ipAddress: req.ip,
        })
        .catch(() => undefined);
      res.status(401).json(result);
      return;
    }

    res.cookie('zanzirangi_admin_token', result.token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    await auditRepository.log({
      action: 'USER_LOGIN',
      userEmail: result.user!.email,
      details: 'Administrator logged into Zanzirangi CMS',
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      user: result.user,
      token: result.token,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      error: env.NODE_ENV === 'production' ? 'Internal server error during login.' : err.message,
    });
  }
});

apiApp.post('/auth/logout', async (req: Request, res: Response) => {
  // Revoke the session server-side (tokenVersion bump) when a valid token is presented.
  const header = req.headers.authorization;
  const token =
    header && header.startsWith('Bearer ') ? header.substring(7).trim() : req.cookies?.zanzirangi_admin_token;
  const decoded = token ? verifyToken(token) : null;
  if (decoded?.id) {
    try {
      await getDatabaseAdapter().revokeUserSessions(decoded.id);
      await auditRepository.log({
        action: 'USER_LOGOUT',
        userEmail: decoded.email,
        details: 'Administrator logged out (sessions revoked)',
        ipAddress: req.ip,
      });
    } catch (err: any) {
      console.error('[AUTH] Logout revocation failed:', err.message);
    }
  }
  res.clearCookie('zanzirangi_admin_token');
  res.json({ success: true, message: 'Successfully logged out.' });
});

apiApp.get('/auth/me', authenticateAdmin, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// -------------------------------------------------------------
// Public Content Endpoints (Read-Only)
// -------------------------------------------------------------
apiApp.get('/content/homepage', async (_req: Request, res: Response) => {
  try {
    const data = await homepageRepository.getHomepage();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve published homepage content.' });
  }
});

apiApp.get('/content/villas', async (_req: Request, res: Response) => {
  try {
    const villas = await villasRepository.getAll();
    const published = villas.filter((v) => v.status === 'published');
    res.json({ success: true, data: published });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve villas.' });
  }
});

apiApp.get('/content/gallery', async (_req: Request, res: Response) => {
  try {
    const gallery = await galleryRepository.getAll();
    const published = gallery.filter((g) => g.published !== false);
    res.json({ success: true, data: published });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve gallery items.' });
  }
});

apiApp.get('/content/facilities', async (_req: Request, res: Response) => {
  try {
    const facilities = await facilitiesRepository.getAll();
    const visible = facilities.filter((f) => f.visible !== false);
    res.json({ success: true, data: visible });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve facilities.' });
  }
});

apiApp.get('/content/testimonials', async (_req: Request, res: Response) => {
  try {
    const testimonials = await testimonialsRepository.getAll();
    const visible = testimonials.filter((t) => t.visible !== false);
    res.json({ success: true, data: visible });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve testimonials.' });
  }
});

apiApp.get('/content/videos', async (_req: Request, res: Response) => {
  try {
    const videos = await videosRepository.get();
    res.json({ success: true, data: videos });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve video details.' });
  }
});

apiApp.get('/content/seo', async (_req: Request, res: Response) => {
  try {
    const seo = await seoRepository.getSeo();
    res.json({ success: true, data: seo });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve SEO configuration.' });
  }
});

apiApp.get('/content/contact', async (_req: Request, res: Response) => {
  try {
    const contactInfo = await contactRepository.getContactInfo();
    res.json({ success: true, data: contactInfo });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve contact information.' });
  }
});

apiApp.get('/content/settings', async (_req: Request, res: Response) => {
  try {
    const s = await settingsRepository.getSettings();
    // Expose only safe public settings
    res.json({
      success: true,
      data: {
        siteName: s.siteName,
        tagline: s.tagline,
        defaultCurrency: s.defaultCurrency,
        currency: s.currency || 'USD',
        defaultLanguage: s.defaultLanguage || 'en',
        phone: s.phone || s.conciergePhone,
        conciergePhone: s.conciergePhone,
        whatsapp: s.whatsapp,
        email: s.email,
        reservationEmail: s.reservationEmail || s.reservationNotificationEmail,
        address: s.address,
        instagram: s.instagram,
        facebook: s.facebook,
        youtube: s.youtube,
        bookingUrl: s.bookingUrl,
        logo: s.logo,
        favicon: s.favicon,
        maintenanceMode: s.maintenanceMode,
        supportAvatar: s.supportAvatar,
        supportName: s.supportName,
        supportTitle: s.supportTitle,
        supportStatus: s.supportStatus,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve site settings.' });
  }
});

// --- Public Pages & Section Content ---
apiApp.get('/content/pages', async (_req: Request, res: Response) => {
  try {
    const pages = await pageContentsRepository.getAll();
    res.json({ success: true, data: pages });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve pages.' });
  }
});

apiApp.get('/content/pages/:id', async (req: Request, res: Response) => {
  try {
    const page = await pageContentsRepository.getById(String(req.params.id));
    if (!page) {
      res.status(404).json({ success: false, error: 'Page not found.' });
      return;
    }
    res.json({ success: true, data: page });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve page content.' });
  }
});

// --- Public Homepage Section Content (headings, cards & lists per homepage section) ---
// Stored inside page_contents['home'].content_json.homeSections, owned by the Homepage editor.
const HOME_PAGE_ID = 'home';

apiApp.get('/content/home-sections', async (_req: Request, res: Response) => {
  try {
    const page = await pageContentsRepository.getById(HOME_PAGE_ID);
    res.json({ success: true, data: page?.contentJson?.homeSections || {} });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve homepage sections.' });
  }
});

// --- Public Content Translations: { entity: { path: text } } for one language ---
apiApp.get('/content/translations/:lang', async (req: Request, res: Response) => {
  const lang = String(req.params.lang);
  if (!SUPPORTED_TRANSLATION_LANGS.includes(lang)) {
    res.json({ success: true, data: {} });
    return;
  }
  try {
    const data = await translationsRepository.getMapForLanguage(lang);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve translations.' });
  }
});

// --- Public Chauffeur & Transfers ---
apiApp.get('/content/chauffeur', async (_req: Request, res: Response) => {
  try {
    const data = await chauffeurRepository.get();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve chauffeur configuration.' });
  }
});

// --- Public Why Stay Pillars ---
apiApp.get('/content/whystay', async (_req: Request, res: Response) => {
  try {
    const data = await whyStayRepository.get();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve sanctuary differentiators.' });
  }
});

// --- Public Dining Content & Categories ---
apiApp.get('/content/dining', async (_req: Request, res: Response) => {
  try {
    const config = await diningRepository.getConfig();
    const categories = await diningRepository.getCategories();
    res.json({
      success: true,
      data: {
        ...config,
        categories: categories.filter((c) => c.visible),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve dining content.' });
  }
});

apiApp.get('/content/dining/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await diningRepository.getCategories();
    res.json({ success: true, data: categories.filter((c) => c.visible) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve dining categories.' });
  }
});

// --- Public Experiences Collection ---
apiApp.get('/content/experiences', async (_req: Request, res: Response) => {
  try {
    const items = await experiencesRepository.getAll();
    res.json({ success: true, data: items.filter((item) => item.visible) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve experiences.' });
  }
});

// --- Public Safari Destinations Collection ---
apiApp.get('/content/safari', async (_req: Request, res: Response) => {
  try {
    const items = await safariRepository.getAll();
    res.json({ success: true, data: items.filter((item) => item.visible) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve safari destinations.' });
  }
});

// --- Public Global Navigation & Footer Content ---
apiApp.get('/content/global', async (_req: Request, res: Response) => {
  try {
    const data = await globalContentRepository.get();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve global content.' });
  }
});

// -------------------------------------------------------------
// Admin Content Endpoints (Auth Required)
// -------------------------------------------------------------

// --- Homepage CMS ---
apiApp.get('/admin/homepage', authenticateAdmin, requirePermission('homepage'), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await homepageRepository.getHomepage();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch homepage data.' });
  }
});

apiApp.put('/admin/homepage', authenticateAdmin, requirePermission('homepage'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const body = req.body;
    if (!body || typeof body !== 'object') {
      res.status(400).json({ success: false, error: 'Invalid payload structure.' });
      return;
    }

    const updated = await homepageRepository.updateHomepage(body, req.user?.email || 'admin');
    res.json({
      success: true,
      message: 'Homepage content successfully published to live website.',
      data: updated,
    });
  } catch (err: any) {
    console.error('Homepage save error:', err);
    res.status(500).json({ success: false, error: 'Failed to save homepage changes.' });
  }
});

// --- Contact & Social Channels (Admin → Contact & WhatsApp) ---
// Edits only homepage.contact + homepage.socials, so a contact-only admin never needs (or touches)
// the rest of the homepage.
const CONTACT_FIELDS = ['phone', 'email', 'whatsappNumber', 'address', 'googleMapsUrl'] as const;
const SOCIAL_FIELDS = ['instagram', 'facebook', 'tiktok', 'youtube', 'whatsapp'] as const;

apiApp.get('/admin/contact-info', authenticateAdmin, requirePermission('contact'), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const home = await homepageRepository.getHomepage();
    res.json({ success: true, data: { contact: home.contact, socials: home.socials || {} } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to load contact information.' });
  }
});

apiApp.put('/admin/contact-info', authenticateAdmin, requirePermission('contact'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const body = req.body || {};
    const home = await homepageRepository.getHomepage();
    const contact: any = { ...home.contact };
    const socials: any = { ...(home.socials || {}) };
    if (body.contact && typeof body.contact === 'object') {
      for (const k of CONTACT_FIELDS) if (typeof body.contact[k] === 'string') contact[k] = body.contact[k].trim();
    }
    if (body.socials && typeof body.socials === 'object') {
      for (const k of SOCIAL_FIELDS) if (typeof body.socials[k] === 'string') socials[k] = body.socials[k].trim();
    }
    if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      res.status(400).json({ success: false, error: 'Please provide a valid contact email address.' });
      return;
    }
    const updated = await homepageRepository.updateHomepage({ contact, socials }, req.user?.email || 'admin');
    res.json({
      success: true,
      data: { contact: updated.contact, socials: updated.socials || {} },
      message: 'Contact information saved and published.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to save contact information.' });
  }
});
// --- Rooms & Villas CRUD ---
apiApp.get('/admin/villas', authenticateAdmin, requirePermission('villas'), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await villasRepository.getAll();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve villas.' });
  }
});

apiApp.post('/admin/villas', authenticateAdmin, requirePermission('villas'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const newVilla = {
      ...req.body,
      id: req.body.id || `villa-${Date.now()}`,
      order: req.body.order || 0,
      status: req.body.status || 'published',
    };
    const saved = await villasRepository.save(newVilla, req.user?.email || 'admin');
    res.json({ success: true, data: saved, message: 'Villa successfully created.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to create villa.' });
  }
});

apiApp.put('/admin/villas/:id', authenticateAdmin, requirePermission('villas'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const existing = await villasRepository.getById(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Villa not found.' });
      return;
    }
    const merged = { ...existing, ...req.body, id };
    const saved = await villasRepository.save(merged, req.user?.email || 'admin');
    res.json({ success: true, data: saved, message: 'Villa updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update villa.' });
  }
});

apiApp.delete('/admin/villas/:id', authenticateAdmin, requirePermission('villas'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const deleted = await villasRepository.delete(id, req.user?.email || 'admin');
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Villa not found.' });
      return;
    }
    res.json({ success: true, message: 'Villa deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete villa.' });
  }
});

// --- Gallery CRUD ---
apiApp.get('/admin/gallery', authenticateAdmin, requirePermission('gallery'), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await galleryRepository.getAll();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve gallery items.' });
  }
});

apiApp.post('/admin/gallery', authenticateAdmin, requirePermission('gallery'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const newItem = {
      ...req.body,
      id: req.body.id || `g-${Date.now()}`,
      order: req.body.order || 0,
      published: req.body.published !== false,
    };
    const saved = await galleryRepository.save(newItem, req.user?.email || 'admin');
    res.json({ success: true, data: saved, message: 'Gallery item added.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to add gallery item.' });
  }
});

apiApp.put('/admin/gallery/:id', authenticateAdmin, requirePermission('gallery'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const items = await galleryRepository.getAll();
    const existing = items.find((g) => g.id === id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Gallery item not found.' });
      return;
    }
    const merged = { ...existing, ...req.body, id };
    const saved = await galleryRepository.save(merged, req.user?.email || 'admin');
    res.json({ success: true, data: saved, message: 'Gallery item updated.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update gallery item.' });
  }
});

apiApp.delete('/admin/gallery/:id', authenticateAdmin, requirePermission('gallery'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const deleted = await galleryRepository.delete(id, req.user?.email || 'admin');
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Gallery item not found.' });
      return;
    }
    res.json({ success: true, message: 'Gallery item deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete gallery item.' });
  }
});

// --- Facilities CRUD ---
apiApp.get('/admin/facilities', authenticateAdmin, requirePermission('facilities'), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await facilitiesRepository.getAll();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve facilities.' });
  }
});

apiApp.put('/admin/facilities/:id', authenticateAdmin, requirePermission('facilities'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const facilities = await facilitiesRepository.getAll();
    const existing = facilities.find((f) => f.id === id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Facility not found.' });
      return;
    }
    const merged = { ...existing, ...req.body, id };
    const saved = await facilitiesRepository.save(merged, req.user?.email || 'admin');
    res.json({ success: true, data: saved, message: 'Facility updated.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update facility.' });
  }
});

apiApp.post('/admin/facilities', authenticateAdmin, requirePermission('facilities'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const body = req.body || {};
    if (!body.title || typeof body.title !== 'string') {
      res.status(400).json({ success: false, error: 'A facility title is required.' });
      return;
    }
    const facilities = await facilitiesRepository.getAll();
    const id = String(body.id || `facility-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '-');
    if (facilities.some((f) => f.id === id)) {
      res.status(400).json({ success: false, error: `A facility with id '${id}' already exists.` });
      return;
    }
    const saved = await facilitiesRepository.save(
      {
        category: '',
        description: '',
        hours: '',
        highlight: '',
        image: '',
        icon: 'Sparkles',
        order: facilities.length + 1,
        visible: true,
        ...body,
        id,
      } as any,
      req.user?.email || 'admin'
    );
    res.json({ success: true, data: saved, message: 'Facility created.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to create facility.' });
  }
});

apiApp.delete('/admin/facilities/:id', authenticateAdmin, requirePermission('facilities'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleted = await getDatabaseAdapter().deleteFacility(String(req.params.id), req.user?.email || 'admin');
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Facility not found.' });
      return;
    }
    res.json({ success: true, message: 'Facility deleted.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to delete facility.' });
  }
});

// --- Testimonials CRUD ---
apiApp.get('/admin/testimonials', authenticateAdmin, requirePermission('testimonials'), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await testimonialsRepository.getAll();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve testimonials.' });
  }
});

apiApp.post('/admin/testimonials', authenticateAdmin, requirePermission('testimonials'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const newTestimonial = {
      ...req.body,
      id: req.body.id || `rev-${Date.now()}`,
      order: req.body.order || 0,
      visible: req.body.visible !== false,
      rating: req.body.rating || 5,
    };
    const saved = await testimonialsRepository.save(newTestimonial, req.user?.email || 'admin');
    res.json({ success: true, data: saved, message: 'Testimonial added.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to add testimonial.' });
  }
});

apiApp.put('/admin/testimonials/:id', authenticateAdmin, requirePermission('testimonials'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const testimonials = await testimonialsRepository.getAll();
    const existing = testimonials.find((t) => t.id === id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Testimonial not found.' });
      return;
    }
    const merged = { ...existing, ...req.body, id };
    const saved = await testimonialsRepository.save(merged, req.user?.email || 'admin');
    res.json({ success: true, data: saved, message: 'Testimonial updated.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update testimonial.' });
  }
});

apiApp.delete('/admin/testimonials/:id', authenticateAdmin, requirePermission('testimonials'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const deleted = await testimonialsRepository.delete(id, req.user?.email || 'admin');
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Testimonial not found.' });
      return;
    }
    res.json({ success: true, message: 'Testimonial deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete testimonial.' });
  }
});

// --- Videos ---
apiApp.get('/admin/videos', authenticateAdmin, requirePermission('videos'), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await videosRepository.get();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch video details.' });
  }
});

apiApp.put('/admin/videos', authenticateAdmin, requirePermission('videos'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await videosRepository.update(req.body, req.user?.email || 'admin');
    res.json({ success: true, data: updated, message: 'Promotional video details updated.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update videos.' });
  }
});

// --- SEO ---
apiApp.get('/admin/seo', authenticateAdmin, requirePermission('seo'), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await seoRepository.getSeo();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch SEO configuration.' });
  }
});

apiApp.put('/admin/seo', authenticateAdmin, requirePermission('seo'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await seoRepository.updateSeo(req.body, req.user?.email || 'admin');
    res.json({ success: true, data: updated, message: 'SEO configuration saved.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update SEO.' });
  }
});

// --- Media Library ---
apiApp.get('/admin/media', authenticateAdmin, requirePermission('media'), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await mediaRepository.getAll();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch media assets.' });
  }
});

apiApp.post('/admin/media', authenticateAdmin, requirePermission('media'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const newMedia = {
      ...req.body,
      id: req.body.id || `med-${Date.now()}`,
      createdAt: new Date().toISOString(),
      uploadedAt: new Date().toISOString(),
      usageCount: 0,
    };
    const saved = await mediaRepository.save(newMedia, req.user?.email || 'admin');
    res.json({ success: true, data: saved, message: 'Media asset added to registry.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to save media.' });
  }
});

apiApp.delete('/admin/media/:id', authenticateAdmin, requirePermission('media'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const asset = (await mediaRepository.getAll()).find((m: any) => m.id === id) as any;
    const deleted = await mediaRepository.delete(id, req.user?.email || 'admin');
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Media asset not found.' });
      return;
    }
    // Remove the stored file too (only files we uploaded; external URLs are just unregistered).
    let fileRemoved = false;
    if (asset?.url && String(asset.url).startsWith('/uploads/')) {
      try {
        fileRemoved = await mediaStorage.deleteFile(String(asset.url).replace('/uploads/', ''));
      } catch (e: any) {
        console.error('[MEDIA] Could not delete stored file:', e.message);
      }
    }
    res.json({ success: true, message: fileRemoved ? 'Media asset and file removed.' : 'Media asset removed.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete media asset.' });
  }
});

// Direct Media File Upload (Persistent storage)
apiApp.post('/admin/media/upload', authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fileBase64, filename, mimeType, altText } = req.body;
    if (!fileBase64 || !filename || !mimeType) {
      res.status(400).json({ success: false, error: 'fileBase64, filename, and mimeType are required.' });
      return;
    }

    const base64Data = String(fileBase64).replace(/^data:[^;,]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    if (buffer.length === 0) {
      res.status(400).json({ success: false, error: 'The uploaded file is empty or not valid base64.' });
      return;
    }

    const uploadRes = await mediaStorage.saveFile(buffer, String(filename), String(mimeType));

    const assetRecord = {
      id: `med-${Date.now()}`,
      filename: uploadRes.filename,
      originalFilename: String(filename).slice(0, 255),
      url: uploadRes.url,
      mimeType: uploadRes.mimeType,
      sizeBytes: uploadRes.size,
      altText: altText || uploadRes.filename,
      caption: '',
      usageCount: 0,
      createdAt: new Date().toISOString(),
      uploadedAt: new Date().toISOString(),
    };

    const saved = await mediaRepository.save(assetRecord, req.user?.email || 'admin');
    res.json({ success: true, data: saved, message: 'File uploaded and registered successfully.' });
  } catch (err: any) {
    console.error('File upload error:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

// --- Settings ---
apiApp.get('/admin/settings', authenticateAdmin, requirePermission('settings'), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await settingsRepository.getSettings();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch settings.' });
  }
});

apiApp.put('/admin/settings', authenticateAdmin, requirePermission('settings'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await settingsRepository.updateSettings(req.body, req.user?.email || 'admin');
    res.json({ success: true, data: updated, message: 'Settings saved.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update settings.' });
  }
});

// -------------------------------------------------------------
// Admin Pages & Section CMS Routes
// -------------------------------------------------------------
apiApp.get('/admin/pages', authenticateAdmin, requirePermission('pages'), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const pages = await pageContentsRepository.getAll();
    res.json({ success: true, data: pages });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch pages.' });
  }
});

apiApp.get('/admin/pages/:id', authenticateAdmin, requirePermission('pages'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = await pageContentsRepository.getById(String(req.params.id));
    if (!page) {
      res.status(404).json({ success: false, error: 'Page not found.' });
      return;
    }
    res.json({ success: true, data: page });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch page content.' });
  }
});

apiApp.put('/admin/pages/:id', authenticateAdmin, requirePermission('pages'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const body = { ...(req.body || {}) };
    // homeSections belongs to the Homepage editor; never let a (possibly stale) page save overwrite it.
    const existing = await pageContentsRepository.getById(id);
    if (existing?.contentJson?.homeSections) {
      body.contentJson = { ...(body.contentJson || {}), homeSections: existing.contentJson.homeSections };
    }
    const updated = await pageContentsRepository.update(id, body, req.user?.email || 'admin');
    res.json({ success: true, data: updated, message: `Page '${updated.title}' saved and published.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to update page.' });
  }
});

apiApp.get('/admin/translations/:lang', authenticateAdmin, requirePermission('pages'), async (req: AuthenticatedRequest, res: Response) => {
  const lang = String(req.params.lang);
  if (!SUPPORTED_TRANSLATION_LANGS.includes(lang)) {
    res.status(400).json({ success: false, error: `Unsupported language '${lang}'.` });
    return;
  }
  try {
    const data = await translationsRepository.getForLanguage(lang);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch translations.' });
  }
});

apiApp.put('/admin/translations/:lang', authenticateAdmin, requirePermission('pages'), async (req: AuthenticatedRequest, res: Response) => {
  const lang = String(req.params.lang);
  const entries = req.body?.entries;
  if (!SUPPORTED_TRANSLATION_LANGS.includes(lang)) {
    res.status(400).json({ success: false, error: `Unsupported language '${lang}'.` });
    return;
  }
  const valid =
    Array.isArray(entries) &&
    entries.every(
      (e: any) =>
        e &&
        typeof e.entity === 'string' &&
        typeof e.path === 'string' &&
        e.path.length <= 255 &&
        typeof e.value === 'string' &&
        (e.source === undefined || typeof e.source === 'string')
    );
  if (!valid) {
    res.status(400).json({ success: false, error: 'Invalid translations payload.' });
    return;
  }
  try {
    const saved = await translationsRepository.save(lang, entries, req.user?.email || 'admin');
    res.json({ success: true, data: { saved }, message: `${saved} ${lang.toUpperCase()} translations saved and published.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to save translations.' });
  }
});

apiApp.get('/admin/home-sections', authenticateAdmin, requirePermission('homepage'), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const page = await pageContentsRepository.getById(HOME_PAGE_ID);
    res.json({ success: true, data: page?.contentJson?.homeSections || {} });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch homepage sections.' });
  }
});

apiApp.put('/admin/home-sections', authenticateAdmin, requirePermission('homepage'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const homeSections = req.body;
    if (!homeSections || typeof homeSections !== 'object' || Array.isArray(homeSections)) {
      res.status(400).json({ success: false, error: 'Invalid homepage sections payload.' });
      return;
    }
    const existing = await pageContentsRepository.getById(HOME_PAGE_ID);
    if (!existing) {
      res.status(404).json({ success: false, error: "Home page record not found in page_contents." });
      return;
    }
    const updated = await pageContentsRepository.update(
      HOME_PAGE_ID,
      { contentJson: { ...(existing.contentJson || {}), homeSections } },
      req.user?.email || 'admin'
    );
    res.json({ success: true, data: updated.contentJson?.homeSections || {}, message: 'Homepage sections saved and published.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to update homepage sections.' });
  }
});

// -------------------------------------------------------------
// Admin Chauffeur & Transfers CMS
// -------------------------------------------------------------
apiApp.get('/admin/chauffeur', authenticateAdmin, requirePermission('transfers'), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await chauffeurRepository.get();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch chauffeur configuration.' });
  }
});

apiApp.put('/admin/chauffeur', authenticateAdmin, requirePermission('transfers'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await chauffeurRepository.update(req.body, req.user?.email || 'admin');
    res.json({ success: true, data: updated, message: 'VIP Chauffeur & Transfers configuration published.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to update chauffeur configuration.' });
  }
});

// -------------------------------------------------------------
// Admin Why Stay / Sanctuary Difference CMS
// -------------------------------------------------------------
apiApp.get('/admin/whystay', authenticateAdmin, requireAnyPermission(['homepage', 'pages']), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await whyStayRepository.get();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch sanctuary differentiators.' });
  }
});

apiApp.put('/admin/whystay', authenticateAdmin, requireAnyPermission(['homepage', 'pages']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await whyStayRepository.update(req.body, req.user?.email || 'admin');
    res.json({ success: true, data: updated, message: 'Why Stay / Sanctuary Difference configuration published.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to update sanctuary differentiators.' });
  }
});

// -------------------------------------------------------------
// Admin Dining CMS
// -------------------------------------------------------------
apiApp.get('/admin/dining', authenticateAdmin, requirePermission('dining'), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const config = await diningRepository.getConfig();
    const categories = await diningRepository.getCategories();
    res.json({ success: true, data: { ...config, categories } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch dining content.' });
  }
});

apiApp.put('/admin/dining', authenticateAdmin, requirePermission('dining'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await diningRepository.updateConfig(req.body, req.user?.email || 'admin');
    res.json({ success: true, data: updated, message: 'Dining narrative published.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to update dining config.' });
  }
});

apiApp.get('/admin/dining/categories', authenticateAdmin, requirePermission('dining'), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const categories = await diningRepository.getCategories();
    res.json({ success: true, data: categories });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch dining categories.' });
  }
});

apiApp.post('/admin/dining/categories', authenticateAdmin, requirePermission('dining'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const cat = {
      ...req.body,
      id: req.body.id || `dining-${Date.now()}`,
      order: req.body.order || 0,
      visible: req.body.visible !== false,
      signatureDishes: req.body.signatureDishes || [],
    };
    const saved = await diningRepository.saveCategory(cat, req.user?.email || 'admin');
    res.json({ success: true, data: saved, message: 'Dining category created.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to create dining category.' });
  }
});

apiApp.put('/admin/dining/categories/:id', authenticateAdmin, requirePermission('dining'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const cat = {
      ...req.body,
      id,
    };
    const saved = await diningRepository.saveCategory(cat, req.user?.email || 'admin');
    res.json({ success: true, data: saved, message: 'Dining category updated.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to update dining category.' });
  }
});

apiApp.delete('/admin/dining/categories/:id', authenticateAdmin, requirePermission('dining'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleted = await diningRepository.deleteCategory(String(req.params.id), req.user?.email || 'admin');
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Dining category not found.' });
      return;
    }
    res.json({ success: true, message: 'Dining category deleted.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to delete dining category.' });
  }
});

// -------------------------------------------------------------
// Admin Experiences Collection CMS
// -------------------------------------------------------------
apiApp.get('/admin/experiences', authenticateAdmin, requirePermission('experiences'), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const items = await experiencesRepository.getAll();
    res.json({ success: true, data: items });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch experiences.' });
  }
});

apiApp.post('/admin/experiences', authenticateAdmin, requirePermission('experiences'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const item = {
      ...req.body,
      id: req.body.id || `exp-${Date.now()}`,
      order: req.body.order || 0,
      visible: req.body.visible !== false,
    };
    const saved = await experiencesRepository.save(item, req.user?.email || 'admin');
    res.json({ success: true, data: saved, message: 'Experience created successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to create experience.' });
  }
});

apiApp.put('/admin/experiences/:id', authenticateAdmin, requirePermission('experiences'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const item = {
      ...req.body,
      id: String(req.params.id),
    };
    const saved = await experiencesRepository.save(item, req.user?.email || 'admin');
    res.json({ success: true, data: saved, message: 'Experience updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to update experience.' });
  }
});

apiApp.delete('/admin/experiences/:id', authenticateAdmin, requirePermission('experiences'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleted = await experiencesRepository.delete(String(req.params.id), req.user?.email || 'admin');
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Experience not found.' });
      return;
    }
    res.json({ success: true, message: 'Experience deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to delete experience.' });
  }
});

// -------------------------------------------------------------
// Admin Safari Destinations Collection CMS
// -------------------------------------------------------------
apiApp.get('/admin/safari', authenticateAdmin, requirePermission('safari'), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const items = await safariRepository.getAll();
    res.json({ success: true, data: items });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch safari destinations.' });
  }
});

apiApp.post('/admin/safari', authenticateAdmin, requirePermission('safari'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const item = {
      ...req.body,
      id: req.body.id || `safari-${Date.now()}`,
      order: req.body.order || 0,
      visible: req.body.visible !== false,
      highlights: req.body.highlights || [],
    };
    const saved = await safariRepository.save(item, req.user?.email || 'admin');
    res.json({ success: true, data: saved, message: 'Safari destination created successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to create safari destination.' });
  }
});

apiApp.put('/admin/safari/:id', authenticateAdmin, requirePermission('safari'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Partial updates are merged with the stored row by the adapter (e.g. a visibility toggle).
    const item = {
      ...req.body,
      id: String(req.params.id),
    };
    const saved = await safariRepository.save(item, req.user?.email || 'admin');
    res.json({ success: true, data: saved, message: 'Safari destination updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to update safari destination.' });
  }
});

apiApp.delete('/admin/safari/:id', authenticateAdmin, requirePermission('safari'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleted = await safariRepository.delete(String(req.params.id), req.user?.email || 'admin');
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Safari destination not found.' });
      return;
    }
    res.json({ success: true, message: 'Safari destination deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to delete safari destination.' });
  }
});

// -------------------------------------------------------------
// Admin Global Content CMS
// -------------------------------------------------------------
apiApp.get('/admin/global', authenticateAdmin, requirePermission('settings'), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await globalContentRepository.get();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch global content.' });
  }
});

apiApp.put('/admin/global', authenticateAdmin, requirePermission('settings'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await globalContentRepository.update(req.body, req.user?.email || 'admin');
    res.json({ success: true, data: updated, message: 'Global navigation and footer content published.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to update global content.' });
  }
});

// -------------------------------------------------------------
// Admin Access Management (Superadmin Only, Max 6 Active Users)
// -------------------------------------------------------------
const MAX_ACTIVE_ADMINS = 6;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const countActiveSuperadmins = async () =>
  (await usersRepository.list()).filter((u) => u.role === 'superadmin' && (u as any).status !== 'disabled').length;

apiApp.get('/admin/users', authenticateAdmin, requireSuperadmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await usersRepository.list();
    const activeCount = users.filter((u) => (u as any).status !== 'disabled').length;
    res.json({
      success: true,
      data: users,
      meta: {
        activeCount,
        maxActive: MAX_ACTIVE_ADMINS,
        availableSlots: Math.max(0, MAX_ACTIVE_ADMINS - activeCount),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch administrators.' });
  }
});

apiApp.post('/admin/users', authenticateAdmin, requireSuperadmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const name = req.body.name || req.body.fullName;
    const { email, password, role, permissions } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ success: false, error: 'Full name, email, and password are required.' });
      return;
    }

    if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
      res.status(400).json({ success: false, error: 'Password must be between 8 and 72 characters long.' });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    if (!EMAIL_PATTERN.test(cleanEmail)) {
      res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
      return;
    }
    const existing = await usersRepository.findByEmail(cleanEmail);
    if (existing) {
      res.status(400).json({ success: false, error: 'An administrator with this email already exists.' });
      return;
    }

    const activeCount = await usersRepository.getActiveCount();
    if (activeCount >= MAX_ACTIVE_ADMINS) {
      res.status(400).json({
        success: false,
        error: `Maximum active administrators limit reached (${MAX_ACTIVE_ADMINS}/${MAX_ACTIVE_ADMINS}). Please disable an existing user before adding a new one.`,
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const assignedRole = role === 'superadmin' ? 'superadmin' : 'admin';
    const assignedPermissions = Array.isArray(permissions) ? sanitizePermissions(permissions) : [...ADMIN_PERMISSIONS];

    const newUser = await usersRepository.create({
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      role: assignedRole,
      status: 'active',
      permissions: assignedPermissions,
      tokenVersion: 1,
      passwordHash,
      createdAt: new Date().toISOString(),
    });

    await auditRepository.log({
      action: 'ADMIN_USER_CREATED',
      userEmail: req.user!.email,
      details: `Created administrator ${newUser.name} (${newUser.email}) with role ${newUser.role}`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Administrator successfully created.',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        permissions: newUser.permissions,
        createdAt: newUser.createdAt,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to create administrator.' });
  }
});

apiApp.get('/admin/users/:id', authenticateAdmin, requireSuperadmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await usersRepository.findById(String(req.params.id));
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }
    const { passwordHash, ...safe } = user;
    res.json({ success: true, data: safe });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch administrator.' });
  }
});

apiApp.put('/admin/users/:id', authenticateAdmin, requireSuperadmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const existing = await usersRepository.findById(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }

    // Whitelist editable fields; email, password and token version are never changed here.
    const body = req.body || {};
    const changes: { name?: string; role?: string; status?: 'active' | 'disabled'; permissions?: string[] } = {};
    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name || name.length > 120) {
        res.status(400).json({ success: false, error: 'Name must be between 1 and 120 characters.' });
        return;
      }
      changes.name = name;
    }
    if (body.role !== undefined) {
      if (body.role !== 'superadmin' && body.role !== 'admin') {
        res.status(400).json({ success: false, error: "Role must be 'superadmin' or 'admin'." });
        return;
      }
      changes.role = body.role;
    }
    if (body.status !== undefined) {
      if (body.status !== 'active' && body.status !== 'disabled') {
        res.status(400).json({ success: false, error: "Status must be 'active' or 'disabled'." });
        return;
      }
      changes.status = body.status;
    }
    if (body.permissions !== undefined) {
      if (!Array.isArray(body.permissions)) {
        res.status(400).json({ success: false, error: 'Permissions must be a list.' });
        return;
      }
      changes.permissions = sanitizePermissions(body.permissions);
    }

    const isSelf = id === req.user?.id;
    const losesSuperadmin =
      existing.role === 'superadmin' &&
      existing.status !== 'disabled' &&
      ((changes.role && changes.role !== 'superadmin') || changes.status === 'disabled');

    if (isSelf && (changes.status === 'disabled' || (changes.role && changes.role !== existing.role))) {
      res.status(400).json({ success: false, error: 'You cannot disable or change the role of your own account.' });
      return;
    }

    // Safeguard: never leave the CMS without an active superadmin
    if (losesSuperadmin && (await countActiveSuperadmins()) <= 1) {
      res.status(400).json({ success: false, error: 'Cannot disable or demote the last remaining active Superadmin.' });
      return;
    }

    // Enforce the active limit when re-activating
    if (existing.status === 'disabled' && changes.status === 'active') {
      const activeCount = await usersRepository.getActiveCount();
      if (activeCount >= MAX_ACTIVE_ADMINS) {
        res.status(400).json({
          success: false,
          error: `Maximum active administrators limit reached (${MAX_ACTIVE_ADMINS}/${MAX_ACTIVE_ADMINS}).`,
        });
        return;
      }
    }

    const updated = await usersRepository.update(id, changes);
    const { passwordHash, ...safe } = updated;

    const changeSummary = [
      changes.name !== undefined && changes.name !== existing.name ? 'name' : null,
      changes.role !== undefined && changes.role !== existing.role ? `role ${existing.role} → ${changes.role}` : null,
      changes.status !== undefined && changes.status !== existing.status ? `status ${existing.status || 'active'} → ${changes.status}` : null,
      changes.permissions !== undefined &&
      JSON.stringify(changes.permissions) !== JSON.stringify(existing.permissions || [])
        ? `permissions [${changes.permissions.join(', ')}]`
        : null,
    ].filter(Boolean);

    await auditRepository.log({
      action: 'ADMIN_USER_UPDATED',
      userEmail: req.user!.email,
      details: `Updated administrator ${safe.name} (${safe.email})${changeSummary.length ? `: ${changeSummary.join('; ')}` : ''}`,
      ipAddress: req.ip,
    });

    res.json({ success: true, data: safe, message: 'Administrator profile updated.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to update administrator.' });
  }
});

apiApp.post('/admin/users/:id/disable', authenticateAdmin, requireSuperadmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const target = await usersRepository.findById(id);
    if (!target) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }

    if (id === req.user?.id) {
      res.status(400).json({ success: false, error: 'You cannot disable your own currently active account.' });
      return;
    }

    if (target.role === 'superadmin') {
      const allUsers = await usersRepository.list();
      const activeSuperadmins = allUsers.filter((u) => u.role === 'superadmin' && (u as any).status !== 'disabled');
      if (activeSuperadmins.length <= 1) {
        res.status(400).json({ success: false, error: 'Cannot disable the last remaining active Superadmin.' });
        return;
      }
    }

    await usersRepository.disable(id);

    await auditRepository.log({
      action: 'ADMIN_USER_DISABLED',
      userEmail: req.user!.email,
      details: `Deactivated administrator ${target.name} (${target.email})`,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: `Administrator ${target.name} has been deactivated.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to disable administrator.' });
  }
});

apiApp.post('/admin/users/:id/enable', authenticateAdmin, requireSuperadmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const target = await usersRepository.findById(id);
    if (!target) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }

    if (target.status !== 'disabled') {
      res.json({ success: true, message: `Administrator ${target.name} is already active.` });
      return;
    }

    const activeCount = await usersRepository.getActiveCount();
    if (activeCount >= MAX_ACTIVE_ADMINS) {
      res.status(400).json({
        success: false,
        error: `Maximum active administrators limit reached (${MAX_ACTIVE_ADMINS}/${MAX_ACTIVE_ADMINS}). Please disable an existing user first.`,
      });
      return;
    }

    await usersRepository.enable(id);

    await auditRepository.log({
      action: 'ADMIN_USER_ENABLED',
      userEmail: req.user!.email,
      details: `Activated administrator ${target.name} (${target.email})`,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: `Administrator ${target.name} has been activated.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to enable administrator.' });
  }
});

apiApp.post('/admin/users/:id/reset-password', authenticateAdmin, requireSuperadmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { newPassword } = req.body;
    if (typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 72) {
      res.status(400).json({ success: false, error: 'New password must be between 8 and 72 characters long.' });
      return;
    }

    const target = await usersRepository.findById(id);
    if (!target) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await usersRepository.resetPassword(id, newHash);

    await auditRepository.log({
      action: 'ADMIN_PASSWORD_RESET',
      userEmail: req.user!.email,
      details: `Reset password for administrator ${target.name} (${target.email}). Active sessions invalidated.`,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Password has been reset successfully. Active sessions invalidated.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to reset password.' });
  }
});

// --- Admin Dashboard Statistics & Health ---
apiApp.get('/admin/dashboard-stats', authenticateAdmin, requirePermission('dashboard'), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = await getDatabaseAdapter().getDashboardStats();
    res.json({
      success: true,
      ...stats,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard metrics.' });
  }
});

// --- Audit Logs ---
apiApp.get(['/admin/audit-logs', '/admin/audit'], authenticateAdmin, requireSuperadmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const requested = parseInt(String(req.query.limit || '50'), 10);
    const limit = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), 500) : 50;
    const logs = await auditRepository.getLogs(limit);
    res.json({ success: true, data: logs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch audit logs.' });
  }
});

// --- Support Platform ---
apiApp.use('/support', supportRouter);

// -------------------------------------------------------------
// API 404 + error handling — API errors always stay JSON (never the SPA's index.html)
// -------------------------------------------------------------
apiApp.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: `API endpoint not found: ${req.method} ${req.baseUrl}${req.path}` });
});

apiApp.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  if (err?.type === 'entity.too.large') {
    res.status(413).json({ success: false, error: `Request is too large (limit ${env.MAX_UPLOAD_SIZE_MB} MB).` });
    return;
  }
  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ success: false, error: 'Malformed JSON request body.' });
    return;
  }
  console.error(`[API] Unhandled error on ${req.method} ${req.originalUrl}: ${err?.stack || err}`);
  res.status(err?.status || 500).json({
    success: false,
    error: env.NODE_ENV === 'production' ? 'Internal server error.' : String(err?.message || err),
  });
});


