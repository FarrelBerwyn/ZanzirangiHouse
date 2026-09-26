import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
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
  getDatabaseAdapter,
} from './database/index.ts';
import { authenticateAdmin, loginUser, AuthenticatedRequest } from './auth.ts';
import { mediaStorage } from './storage/index.ts';
import { env } from './config/env.ts';

export const apiApp = express();

// -------------------------------------------------------------
// Security Headers & Hardening Middleware
// -------------------------------------------------------------
apiApp.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Configure CORS
const corsOrigin = env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN;
apiApp.use(cors({ origin: corsOrigin, credentials: true }));
apiApp.use(cookieParser());
apiApp.use(express.json({ limit: `${env.MAX_UPLOAD_SIZE_MB}mb` }));
apiApp.use(express.urlencoded({ extended: true, limit: `${env.MAX_UPLOAD_SIZE_MB}mb` }));

// Serve persistent user uploads
apiApp.use('/uploads', express.static(mediaStorage.getStorageDirectory()));

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
// Health Check (Safe Public Endpoint - Section 13)
// -------------------------------------------------------------
apiApp.get('/health', async (_req: Request, res: Response) => {
  const dbHealth = await getDatabaseAdapter().healthCheck();
  res.json({
    status: 'ok',
    service: 'Zanzirangi House CMS Engine',
    environment: env.NODE_ENV,
    database: dbHealth.connected ? 'connected' : 'error',
    provider: dbHealth.provider,
    version: env.APP_VERSION,
    timestamp: new Date().toISOString(),
  });
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
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve site settings.' });
  }
});

// -------------------------------------------------------------
// Admin Content Endpoints (Auth Required)
// -------------------------------------------------------------

// --- Homepage CMS ---
apiApp.get('/admin/homepage', authenticateAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await homepageRepository.getHomepage();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch homepage data.' });
  }
});

apiApp.put('/admin/homepage', authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
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

// --- Rooms & Villas CRUD ---
apiApp.get('/admin/villas', authenticateAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await villasRepository.getAll();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve villas.' });
  }
});

apiApp.post('/admin/villas', authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
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

apiApp.put('/admin/villas/:id', authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
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

apiApp.delete('/admin/villas/:id', authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
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
apiApp.get('/admin/gallery', authenticateAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await galleryRepository.getAll();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve gallery items.' });
  }
});

apiApp.post('/admin/gallery', authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
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

apiApp.put('/admin/gallery/:id', authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
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

apiApp.delete('/admin/gallery/:id', authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
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
apiApp.get('/admin/facilities', authenticateAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await facilitiesRepository.getAll();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve facilities.' });
  }
});

apiApp.put('/admin/facilities/:id', authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
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

// --- Testimonials CRUD ---
apiApp.get('/admin/testimonials', authenticateAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await testimonialsRepository.getAll();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve testimonials.' });
  }
});

apiApp.post('/admin/testimonials', authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
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

apiApp.put('/admin/testimonials/:id', authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
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

apiApp.delete('/admin/testimonials/:id', authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
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
apiApp.get('/admin/videos', authenticateAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await videosRepository.get();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch video details.' });
  }
});

apiApp.put('/admin/videos', authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await videosRepository.update(req.body, req.user?.email || 'admin');
    res.json({ success: true, data: updated, message: 'Promotional video details updated.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update videos.' });
  }
});

// --- SEO ---
apiApp.get('/admin/seo', authenticateAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await seoRepository.getSeo();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch SEO configuration.' });
  }
});

apiApp.put('/admin/seo', authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await seoRepository.updateSeo(req.body, req.user?.email || 'admin');
    res.json({ success: true, data: updated, message: 'SEO configuration saved.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update SEO.' });
  }
});

// --- Media Library ---
apiApp.get('/admin/media', authenticateAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await mediaRepository.getAll();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch media assets.' });
  }
});

apiApp.post('/admin/media', authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const newMedia = {
      ...req.body,
      id: req.body.id || `med-${Date.now()}`,
      createdAt: new Date().toISOString(),
      usageCount: 0,
    };
    const saved = await mediaRepository.save(newMedia, req.user?.email || 'admin');
    res.json({ success: true, data: saved, message: 'Media asset added to registry.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to save media.' });
  }
});

apiApp.delete('/admin/media/:id', authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await mediaRepository.delete(id, req.user?.email || 'admin');
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Media asset not found.' });
      return;
    }
    res.json({ success: true, message: 'Media asset removed.' });
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

    const base64Data = fileBase64.replace(/^data:([A-Za-z-+/]+);base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const uploadRes = await mediaStorage.saveFile(buffer, filename, mimeType);

    const assetRecord = {
      id: `med-${Date.now()}`,
      filename: uploadRes.filename,
      url: uploadRes.url,
      mimeType: uploadRes.mimeType,
      sizeBytes: uploadRes.size,
      altText: altText || uploadRes.filename,
      caption: '',
      usageCount: 0,
      createdAt: new Date().toISOString(),
    };

    const saved = await mediaRepository.save(assetRecord, req.user?.email || 'admin');
    res.json({ success: true, data: saved, message: 'File uploaded and registered successfully.' });
  } catch (err: any) {
    console.error('File upload error:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

// --- Settings ---
apiApp.get('/admin/settings', authenticateAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await settingsRepository.getSettings();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch settings.' });
  }
});

apiApp.put('/admin/settings', authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await settingsRepository.updateSettings(req.body, req.user?.email || 'admin');
    res.json({ success: true, data: updated, message: 'Settings saved.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update settings.' });
  }
});

// --- Admin Dashboard Statistics & Health ---
apiApp.get('/admin/dashboard-stats', authenticateAdmin, async (_req: AuthenticatedRequest, res: Response) => {
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
apiApp.get('/admin/audit-logs', authenticateAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = parseInt(String(req.query.limit || '50'), 10);
    const logs = await auditRepository.getLogs(limit);
    res.json({ success: true, data: logs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch audit logs.' });
  }
});

