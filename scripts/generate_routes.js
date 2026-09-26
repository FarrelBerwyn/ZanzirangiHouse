import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

const routes = [
  {
    path: 'villas',
    title: 'Private Luxury Villas in Zanzibar | Zanzirangi House',
    description: 'Explore 8 exclusive private plunge pool villas in Kizimkazi, Zanzibar. Handcrafted coral stone suites with dedicated 24/7 butler service.',
    canonical: 'https://zanzirangihouse.com/villas',
  },
  {
    path: 'dining',
    title: 'Oceanfront Dining in Zanzibar | Zanzirangi House',
    description: 'Artisanal ocean-to-table gastronomy featuring line-caught Kizimkazi seafood, rare Swahili spices, and private sunset beach candlelit dinners.',
    canonical: 'https://zanzirangihouse.com/dining',
  },
  {
    path: 'experiences',
    title: 'Zanzibar Experiences & Private Tours | Zanzirangi House',
    description: 'Bespoke Zanzibar island tours: ethical Menai Bay dolphin dhow safaris, Stone Town UNESCO heritage walks, and organic spice farm excursions.',
    canonical: 'https://zanzirangihouse.com/experiences',
  },
  {
    path: 'safari',
    title: 'Tanzania Safari from Zanzibar | Zanzirangi House',
    description: 'Seamless fly-in bush and beach safaris connecting Zanzibar to Serengeti National Park, Ngorongoro Crater, and Mount Kilimanjaro.',
    canonical: 'https://zanzirangihouse.com/safari',
  },
  {
    path: 'about',
    title: 'About Zanzirangi House | Barefoot Luxury Sanctuary in Kizimkazi',
    description: 'Learn about Zanzirangi House—an ultra-boutique 8-villa sanctuary in Kizimkazi Dimbani combining Swahili-Omani heritage with barefoot eco-luxury.',
    canonical: 'https://zanzirangihouse.com/about',
  },
  {
    path: 'contact',
    title: 'Contact & Book Zanzirangi House Zanzibar | Direct Reservations',
    description: 'Contact our 24/7 concierge for direct villa reservations, airport chauffeur transfers from ZNZ, and personalized Tanzania safari itinerary planning.',
    canonical: 'https://zanzirangihouse.com/contact',
  },
  {
    path: 'privacy',
    title: 'Privacy Policy | Zanzirangi House Zanzibar',
    description: 'Privacy Policy and guest data protection practices for Zanzirangi House luxury sanctuary in Zanzibar, Tanzania.',
    canonical: 'https://zanzirangihouse.com/privacy',
  },
  {
    path: 'terms',
    title: 'Terms & Conditions | Zanzirangi House Zanzibar',
    description: 'Terms and conditions, reservation policies, and guest guidelines for Zanzirangi House boutique retreat.',
    canonical: 'https://zanzirangihouse.com/terms',
  },
];

function generateStaticRoutes() {
  const indexPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('❌ dist/index.html not found! Run vite build first.');
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(indexPath, 'utf-8');

  routes.forEach((route) => {
    const routeDir = path.join(distDir, route.path);
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }

    let routeHtml = baseHtml;

    // Replace Title
    routeHtml = routeHtml.replace(
      /<title>.*?<\/title>/i,
      `<title>${route.title}</title>`
    );

    // Replace Meta Description
    routeHtml = routeHtml.replace(
      /<meta\s+name=["']description["']\s+content=["'].*?["']\s*\/?>/i,
      `<meta name="description" content="${route.description}" />`
    );

    // Replace Canonical Link
    routeHtml = routeHtml.replace(
      /<link\s+rel=["']canonical["']\s+href=["'].*?["']\s*\/?>/i,
      `<link rel="canonical" href="${route.canonical}" />`
    );

    // Replace OG Title & Description
    routeHtml = routeHtml.replace(
      /<meta\s+property=["']og:title["']\s+content=["'].*?["']\s*\/?>/i,
      `<meta property="og:title" content="${route.title}" />`
    );
    routeHtml = routeHtml.replace(
      /<meta\s+property=["']og:description["']\s+content=["'].*?["']\s*\/?>/i,
      `<meta property="og:description" content="${route.description}" />`
    );
    routeHtml = routeHtml.replace(
      /<meta\s+property=["']og:url["']\s+content=["'].*?["']\s*\/?>/i,
      `<meta property="og:url" content="${route.canonical}" />`
    );

    // Replace Twitter Title & Description
    routeHtml = routeHtml.replace(
      /<meta\s+name=["']twitter:title["']\s+content=["'].*?["']\s*\/?>/i,
      `<meta name="twitter:title" content="${route.title}" />`
    );
    routeHtml = routeHtml.replace(
      /<meta\s+name=["']twitter:description["']\s+content=["'].*?["']\s*\/?>/i,
      `<meta name="twitter:description" content="${route.description}" />`
    );
    routeHtml = routeHtml.replace(
      /<meta\s+name=["']twitter:url["']\s+content=["'].*?["']\s*\/?>/i,
      `<meta name="twitter:url" content="${route.canonical}" />`
    );

    const outPath = path.join(routeDir, 'index.html');
    fs.writeFileSync(outPath, routeHtml, 'utf-8');
    console.log(`✅ Generated static physical route: dist/${route.path}/index.html`);
  });

  console.log(`\n🎉 All ${routes.length} static physical routes successfully generated for SEO, Google Sitelinks, and Hostinger!`);
}

generateStaticRoutes();
