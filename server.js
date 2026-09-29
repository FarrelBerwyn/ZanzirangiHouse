var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/config/env.ts
import dotenv from "dotenv";
import path2 from "path";
function parseCorsOrigin(val) {
  if (!val || val === "*") return "*";
  if (val.includes(",")) {
    return val.split(",").map((s) => s.trim());
  }
  return val.trim();
}
function validateEnvironment() {
  if (env.NODE_ENV === "production") {
    if (env.DATABASE_PROVIDER !== "mysql") {
      console.error("\u{1F4A5} [Hostinger DB Critical Error] Production environment strictly requires DATABASE_PROVIDER=mysql. Silent fallback to JSON is strictly prohibited.");
      throw new Error("Production environment strictly requires DATABASE_PROVIDER=mysql. Silent fallback to JSON is strictly prohibited.");
    }
    if (!env.JWT_SECRET || env.JWT_SECRET === "zanzirangi_dev_jwt_secret_2026" || env.JWT_SECRET.length < 32) {
      console.error("\u{1F4A5} [Hostinger Auth Critical Error] JWT_SECRET must be set to a random value of at least 32 characters in Hostinger Environment Variables.");
      throw new Error("Missing or weak JWT_SECRET in production");
    }
    const missingDbVars = [];
    if (!env.MYSQL_HOST) missingDbVars.push("DB_HOST / MYSQL_HOST");
    if (!env.MYSQL_DATABASE) missingDbVars.push("DB_NAME / MYSQL_DATABASE");
    if (!env.MYSQL_USER) missingDbVars.push("DB_USER / MYSQL_USER");
    if (!env.MYSQL_PASSWORD) missingDbVars.push("DB_PASSWORD / MYSQL_PASSWORD");
    if (missingDbVars.length > 0) {
      console.error(`\u{1F4A5} [Hostinger DB Critical Error] Missing MySQL variables: ${missingDbVars.join(", ")}. Silent fallback to JSON is strictly prohibited.`);
      throw new Error(`Missing required MySQL environment variables: ${missingDbVars.join(", ")}`);
    }
    console.log(`\u{1F6E1}\uFE0F Production environment validated successfully [Provider: ${env.DATABASE_PROVIDER}, URL: ${env.APP_URL}]`);
  } else {
    console.log(`\u{1F527} Environment loaded [Provider: ${env.DATABASE_PROVIDER}, Host: http://localhost:${env.PORT}]`);
  }
}
var nodeEnv, env;
var init_env = __esm({
  "server/config/env.ts"() {
    dotenv.config();
    dotenv.config({ path: path2.resolve(process.cwd(), ".env.local"), override: true });
    nodeEnv = process.env.NODE_ENV || "development";
    env = {
      NODE_ENV: nodeEnv,
      PORT: parseInt(process.env.PORT || process.env.API_PORT || "3000", 10),
      APP_URL: process.env.APP_URL || (nodeEnv === "production" ? "https://zanzirangihouse.com" : "http://localhost:3000"),
      PUBLIC_URL: process.env.PUBLIC_URL || (nodeEnv === "production" ? "https://zanzirangihouse.com" : "http://localhost:3000"),
      API_URL: process.env.API_URL || (nodeEnv === "production" ? "https://zanzirangihouse.com/api" : "/api"),
      DATABASE_PROVIDER: nodeEnv === "production" ? "mysql" : process.env.FORCE_JSON_DB === "true" ? "json" : process.env.DATABASE_PROVIDER || "mysql",
      MYSQL_HOST: process.env.DB_HOST || process.env.MYSQL_HOST,
      MYSQL_PORT: parseInt(process.env.DB_PORT || process.env.MYSQL_PORT || "3306", 10),
      MYSQL_DATABASE: process.env.DB_NAME || process.env.MYSQL_DATABASE,
      MYSQL_USER: process.env.DB_USER || process.env.MYSQL_USER,
      MYSQL_PASSWORD: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD,
      MYSQL_CONNECTION_LIMIT: parseInt(process.env.MYSQL_CONNECTION_LIMIT || "10", 10),
      JWT_SECRET: process.env.JWT_SECRET || (nodeEnv === "production" ? "" : "zanzirangi_dev_jwt_secret_2026"),
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
      ADMIN_EMAIL: process.env.ADMIN_EMAIL || "info@zanzirangihouse.com",
      MEDIA_STORAGE_PATH: process.env.MEDIA_STORAGE_PATH || path2.resolve(process.cwd(), "uploads"),
      MAX_UPLOAD_SIZE_MB: parseInt(process.env.MAX_UPLOAD_SIZE || process.env.MAX_UPLOAD_SIZE_MB || "25", 10),
      CORS_ORIGIN: parseCorsOrigin(process.env.CORS_ORIGIN || (nodeEnv === "production" ? "https://zanzirangihouse.com" : "http://localhost:3000")),
      LOG_LEVEL: process.env.LOG_LEVEL || (nodeEnv === "production" ? "info" : "debug"),
      APP_VERSION: process.env.npm_package_version || "1.0.0"
    };
  }
});

// server/database/connection.ts
var connection_exports = {};
__export(connection_exports, {
  closeMysqlPool: () => closeMysqlPool,
  getMysqlPool: () => getMysqlPool,
  testDatabaseConnection: () => testDatabaseConnection
});
import mysql from "mysql2/promise";
import dns from "dns";
import net from "net";
function getMysqlPool() {
  if (!connectionPool) {
    const host = process.env.DB_HOST || env.MYSQL_HOST || "localhost";
    const port = Number(process.env.DB_PORT || env.MYSQL_PORT || 3306);
    const user = process.env.DB_USER || env.MYSQL_USER || "u170555096_admindatabase";
    const password = process.env.DB_PASSWORD || env.MYSQL_PASSWORD || "";
    const database = process.env.DB_NAME || env.MYSQL_DATABASE || "u170555096_Zanzirangi";
    const connectionLimit = Number(process.env.MYSQL_CONNECTION_LIMIT || env.MYSQL_CONNECTION_LIMIT || 10);
    connectionPool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 1e4,
      connectTimeout: 15e3
    });
  }
  return connectionPool;
}
async function closeMysqlPool() {
  if (connectionPool) {
    await connectionPool.end();
    connectionPool = null;
  }
}
async function testDatabaseConnection() {
  const host = process.env.DB_HOST || env.MYSQL_HOST || "localhost";
  const port = Number(process.env.DB_PORT || env.MYSQL_PORT || 3306);
  const user = process.env.DB_USER || env.MYSQL_USER || "u170555096_admindatabase";
  const database = process.env.DB_NAME || env.MYSQL_DATABASE || "u170555096_Zanzirangi";
  const steps = [];
  let overallSuccess = true;
  let finalError;
  const t1 = Date.now();
  try {
    if (host === "localhost" || net.isIP(host)) {
      steps.push({
        step: "1_dns_resolution",
        name: "DNS / Host Resolution",
        status: "passed",
        durationMs: Date.now() - t1,
        details: host === "localhost" ? "Resolved loopback alias (localhost)" : `Direct IP address provided (${host})`
      });
    } else {
      const lookupResult = await dns.promises.lookup(host);
      steps.push({
        step: "1_dns_resolution",
        name: "DNS / Host Resolution",
        status: "passed",
        durationMs: Date.now() - t1,
        details: `Hostname ${host} resolved to ${lookupResult.address}`
      });
    }
  } catch (dnsErr) {
    overallSuccess = false;
    finalError = `DNS Resolution Failed: ${dnsErr.message}`;
    steps.push({
      step: "1_dns_resolution",
      name: "DNS / Host Resolution",
      status: "failed",
      durationMs: Date.now() - t1,
      error: dnsErr.message
    });
    return {
      success: false,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      target: { host, port, database, user },
      steps,
      error: finalError
    };
  }
  const t2 = Date.now();
  const tcpPassed = await new Promise((resolve) => {
    const socket = new net.Socket();
    let resolved = false;
    socket.setTimeout(4e3);
    socket.once("connect", () => {
      resolved = true;
      socket.destroy();
      resolve(true);
    });
    socket.once("timeout", () => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve(false);
      }
    });
    socket.once("error", () => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve(false);
      }
    });
    socket.connect(port, host);
  });
  if (tcpPassed) {
    steps.push({
      step: "2_tcp_connection",
      name: "TCP Port Connectivity",
      status: "passed",
      durationMs: Date.now() - t2,
      details: `Successfully opened TCP connection to ${host}:${port}`
    });
  } else {
    overallSuccess = false;
    finalError = `TCP Connection Failed: Unable to establish connection to ${host}:${port} within 4000ms.`;
    steps.push({
      step: "2_tcp_connection",
      name: "TCP Port Connectivity",
      status: "failed",
      durationMs: Date.now() - t2,
      error: finalError
    });
    return {
      success: false,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      target: { host, port, database, user },
      steps,
      error: finalError
    };
  }
  const t3 = Date.now();
  let conn = null;
  try {
    const pool = getMysqlPool();
    conn = await pool.getConnection();
    steps.push({
      step: "3_authentication_and_database",
      name: "MySQL Authentication & Database Selection",
      status: "passed",
      durationMs: Date.now() - t3,
      details: `Authenticated as '${user}' and selected database '${database}'`
    });
  } catch (authErr) {
    overallSuccess = false;
    finalError = `Authentication / Database Selection Failed: ${authErr.message}`;
    steps.push({
      step: "3_authentication_and_database",
      name: "MySQL Authentication & Database Selection",
      status: "failed",
      durationMs: Date.now() - t3,
      error: authErr.message
    });
    return {
      success: false,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      target: { host, port, database, user },
      steps,
      error: finalError
    };
  }
  const t5 = Date.now();
  try {
    const [rows] = await conn.query("SELECT 1 as ping, CURRENT_TIMESTAMP as server_time");
    const pingValue = rows?.[0]?.ping;
    if (pingValue === 1) {
      steps.push({
        step: "4_query_execution",
        name: "Query Execution (SELECT 1)",
        status: "passed",
        durationMs: Date.now() - t5,
        details: `Query executed successfully. Server timestamp: ${rows[0]?.server_time}`
      });
    } else {
      throw new Error(`Unexpected query return value: ${JSON.stringify(rows)}`);
    }
  } catch (queryErr) {
    overallSuccess = false;
    finalError = `Simple Query Execution Failed: ${queryErr.message}`;
    steps.push({
      step: "4_query_execution",
      name: "Query Execution (SELECT 1)",
      status: "failed",
      durationMs: Date.now() - t5,
      error: queryErr.message
    });
  } finally {
    if (conn) {
      conn.release();
    }
  }
  return {
    success: overallSuccess,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    target: { host, port, database, user },
    steps,
    error: finalError
  };
}
var connectionPool;
var init_connection = __esm({
  "server/database/connection.ts"() {
    init_env();
    connectionPool = null;
  }
});

// server/index.ts
import express2 from "express";
import fs4 from "fs";
import path5 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";

// server/api.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

// server/db.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

// src/data/seedDefaults.ts
var DEFAULT_HERO_SLIDES = [
  {
    id: "slide-01",
    badgeText: "KIZIMKAZI DIMBANI \u2022 SOUTH COAST ZANZIBAR",
    title: "Zanzibar Luxury Villa",
    subtitle: "Private Pool Retreat \u2022 Kizimkazi",
    description: "Experience Zanzibar luxury villas with private plunge pools at Zanzirangi House in Kizimkazi. An intimate 8-villa sanctuary offering ocean-to-table dining and bespoke island journeys.",
    heroImage: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2400&q=90",
    videoUrl: "./Zanzirangi-home.mp4",
    primaryCtaText: "Reserve Sanctuary",
    primaryCtaLink: "#stay",
    secondaryCtaText: "Explore Sanctuary",
    secondaryCtaLink: "#itinerary",
    order: 1,
    visible: true
  },
  {
    id: "slide-02",
    badgeText: "SECLUDED BOTANICAL HIDEAWAY \u2022 MENAI BAY",
    title: "Makuti Garden Sanctuary",
    subtitle: "Boutique Private Pool Villa",
    description: "Tucked within fragrant frangipani and coconut palms in southern Zanzibar, offering total seclusion, an open-air stone shower, and serene garden verandah.",
    heroImage: "./zanzirangi-villas.jpg",
    videoUrl: "./Zanzirangi-home.mp4",
    primaryCtaText: "Discover Garden Villa",
    primaryCtaLink: "#stay",
    secondaryCtaText: "View Amenities",
    secondaryCtaLink: "#facilities",
    order: 2,
    visible: true
  },
  {
    id: "slide-03",
    badgeText: "TANZANIA SAFARI & ZANZIBAR BEACH PACKAGE",
    title: "Oceanfront Safari Villa",
    subtitle: "Private Presidential Residence",
    description: "The premier oceanfront residence at Zanzirangi House featuring a suspended infinity pool, expansive living pavilion, private chef dining, and direct Serengeti fly-in safari packages.",
    heroImage: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=2400&q=90",
    videoUrl: "./Zanzirangi-home.mp4",
    primaryCtaText: "Reserve Presidential",
    primaryCtaLink: "#stay",
    secondaryCtaText: "Inquire Concierge",
    secondaryCtaLink: "#contact",
    order: 3,
    visible: true
  }
];
var DEFAULT_SECTIONS = [
  { id: "hero", name: "01. Hero & Slide Carousel", title: "Hero Journey", subtitle: "Main Arrival", order: 1, visible: true },
  { id: "quickBooking", name: "02. Quick Search & Booking Bar", title: "Check Availability", subtitle: "Direct Reservation", order: 2, visible: true },
  { id: "intro", name: "03. Editorial Introduction", title: "More Than A Stay", subtitle: "Sanctuary Philosophy", order: 3, visible: true },
  { id: "villas", name: "04. Stay Your Way (Villas & Suites)", title: "Stay Your Way", subtitle: "Private Plunge Pool Villas", order: 4, visible: true },
  { id: "experience", name: "05. Property Experience", title: "Discover The Retreat", subtitle: "Architecture & Craft", order: 5, visible: true },
  { id: "dining", name: "06. Taste Zanzibar Dining", title: "Taste Zanzibar", subtitle: "From Garden To Ocean Table", order: 6, visible: true },
  { id: "experiences", name: "07. Curated Island Experiences", title: "Island Experiences", subtitle: "Beyond The Ordinary", order: 7, visible: true },
  { id: "explore", name: "08. Regional Exploration", title: "Explore Zanzibar", subtitle: "Iconic Landmarks & Marine Reefs", order: 8, visible: true },
  { id: "safari", name: "09. Beyond Zanzibar & Tanzania Safari", title: "Beyond Zanzibar", subtitle: "Tanzania Safari Expeditions", order: 9, visible: true },
  { id: "itinerary", name: "10. Custom Itinerary Builder", title: "Build Your Tanzania Journey", subtitle: "Interactive Day-by-Day Curation", order: 10, visible: true },
  { id: "shuttle", name: "11. Shuttle & Arrival Service", title: "Arrive & Relax", subtitle: "VIP Airport Chauffeur", order: 11, visible: true },
  { id: "concierge", name: "12. Dedicated Butler & Concierge", title: "Your Journey Personally Arranged", subtitle: "24/7 Hosting", order: 12, visible: true },
  { id: "whyStay", name: "13. Why Stay With Us", title: "Why Zanzirangi House", subtitle: "Sanctuary Differentiators", order: 13, visible: true },
  { id: "video", name: "14. Promotional Brand Film", title: "Cinematic Brand Reel", subtitle: "4K Ultra HD Storyboard", order: 14, visible: true },
  { id: "facilities", name: "15. Facilities & Amenities", title: "Resort Facilities", subtitle: "Spa, Pool & Pavilions", order: 15, visible: true },
  { id: "gallery", name: "16. Curated Photography Gallery", title: "Visual Archive", subtitle: "7 Luxury Categories", order: 16, visible: true },
  { id: "reviews", name: "17. Guest Impressions & Reviews", title: "Guest Testimonials", subtitle: "Verified Experiences", order: 17, visible: true },
  { id: "otaChannels", name: "18. OTA Trust Channels", title: "Global Distribution", subtitle: "Accredited Platforms", order: 18, visible: true },
  { id: "map", name: "19. Location & Interactive Map", title: "Finding Zanzirangi House", subtitle: "Kizimkazi Dimbani, South Coast", order: 19, visible: true },
  { id: "finalCta", name: "20. Final Call To Action", title: "Ready to Experience Zanzirangi House?", subtitle: "Direct Sanctuary Booking", order: 20, visible: true }
];
var DEFAULT_VILLAS = [
  {
    id: "villa-01",
    roomNumber: "VILLA 01",
    name: "Sultan Oceanfront Villa",
    type: "Master Ocean Villa with Private Plunge Pool",
    capacity: 2,
    bed: "Handcrafted King Four-Poster Bed",
    bathroom: "En-suite Stone Wet Room & Outdoor Rain Shower",
    size: "95 m\xB2 (1,022 sq ft)",
    view: "Direct Panoramic Indian Ocean & Sunset",
    pricePerNight: "$480",
    promotionalPrice: "$430",
    availability: true,
    featured: true,
    architecturalFeature: "Private plunge pool carved into coastal limestone with sunken sea lounge",
    shortDescription: "Perched directly above the coral cliff with uninterrupted ocean vistas, private plunge pool, and dedicated butler service.",
    description: "The Sultan Oceanfront Villa represents the pinnacle of barefoot luxury in Zanzibar. Inspired by classical Omani architecture and Swahili maritime traditions, this sanctuary features high timber ceilings, polished lime plaster walls, and expansive floor-to-ceiling glass that dissolves the boundary between indoors and the Indian Ocean. Step out onto your private sun deck with an infinity plunge pool, or unwind in the carved stone soak tub overlooking the evening dhows.",
    heroImage: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1600&q=85",
    images: [
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=85"
    ],
    amenities: [
      "Private Ocean Plunge Pool",
      "Air Conditioning & Ceiling Fan",
      "High-Speed Wi-Fi",
      "Artisanal Gourmet Breakfast Included",
      "Complimentary Curated Mini Bar",
      "Freestanding Stone Soaking Tub",
      "Dedicated 24/7 Butler Service",
      "Organic Zanzibar Botanical Toiletries",
      "Nespresso Coffee Bar & Rare Teas",
      "Sunset Daybed & Yoga Mats"
    ],
    order: 1,
    status: "published"
  },
  {
    id: "villa-02",
    roomNumber: "VILLA 02",
    name: "Makuti Garden Sanctuary",
    type: "Secluded Botanical Garden Villa",
    capacity: 2,
    bed: "King Canopy Bed with Fine Egyptian Linen",
    bathroom: "Tropical Outdoor Garden Shower & Double Vanity",
    size: "78 m\xB2 (840 sq ft)",
    view: "Lush Botanical Gardens & Water Lilies",
    pricePerNight: "$390",
    promotionalPrice: "$350",
    availability: true,
    featured: false,
    architecturalFeature: "Traditional artisanal thatched makuti roof with natural cross-ventilation",
    shortDescription: "Tucked within fragrant frangipani and coconut palms, offering total seclusion, an open-air stone shower, and serene garden verandah.",
    description: "Immersed in indigenous tropical gardens, Villa 02 offers complete tranquility and privacy. Constructed using sustainably harvested timber, coconut palm thatch, and local coral ragstone, the villa remains naturally cool under the equatorial sun. Enjoy lazy afternoons reading on the daybed surrounded by birdsong, or indulge in an open-air rainwater shower under the canopy of night stars.",
    heroImage: "./zanzirangi-villas.jpg",
    images: [
      "./zanzirangi-villas.jpg",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=85"
    ],
    amenities: [
      "Outdoor Rain Shower in Tropical Garden",
      "Air Conditioning",
      "High-Speed Wi-Fi",
      "Daily Farm-to-Table Breakfast",
      "Organic Mini Bar",
      "Private Verandah & Hammock",
      "Turn-down Aromatherapy Service",
      "Complimentary Beach Bicycles"
    ],
    order: 2,
    status: "published"
  },
  {
    id: "villa-03",
    roomNumber: "VILLA 03",
    name: "Coral Cove Villa",
    type: "Direct Beach Access Ocean Villa",
    capacity: 2,
    bed: "King Size Heritage Teak Bed",
    bathroom: "Marble En-Suite with Deep Bath",
    size: "85 m\xB2 (915 sq ft)",
    view: "Direct Turquoise Lagoon & White Sand",
    pricePerNight: "$440",
    promotionalPrice: "$400",
    availability: true,
    featured: false,
    architecturalFeature: "Step-down sandy path directly reaching private sun loungers on the shore",
    shortDescription: "Wake up to the soft rustle of palms and step straight from your wooden deck onto the powdery white sand of the Indian Ocean.",
    description: "A beachfront haven designed for ocean lovers. Villa 03 provides direct, private access to the crystalline waters of southern Zanzibar. Custom hardwood furnishings, hand-loomed linen throws, and curated African sculpture create an atmosphere of understated sophistication. Step outside barefoot to watch traditional fisherman dhows drift across the sunrise.",
    heroImage: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1400&q=85",
    images: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=85"
    ],
    amenities: [
      "Direct Private Beach Access",
      "Private Sun Loungers & Parasol",
      "Air Conditioning & Ceiling Fans",
      "High-Speed Wi-Fi",
      "Organic Breakfast on Beach Deck",
      "Curated Wine & Spirits Bar",
      "Snorkeling Gear & Reef Shoes Provided",
      "Luxury Terry Bathrobes & Towels"
    ],
    order: 3,
    status: "published"
  },
  {
    id: "villa-04",
    roomNumber: "VILLA 04",
    name: "Kizimkazi Horizon Villa",
    type: "Elevated Oceanview Pavilion",
    capacity: 3,
    bed: "King Bed + Daybed Lounger",
    bathroom: "Twin Vanities & Panoramic Walk-in Shower",
    size: "90 m\xB2 (968 sq ft)",
    view: "Elevated 180\xB0 Ocean Horizon & Marine Reserve",
    pricePerNight: "$460",
    promotionalPrice: "$410",
    availability: true,
    featured: false,
    architecturalFeature: "Cantilevered timber deck extending out towards the marine sanctuary",
    shortDescription: "Elevated for supreme sea breezes and unobstructed horizons, featuring a wide panoramic verandah perfect for dolphin watching.",
    description: "Set on an elevated crest of the property, Villa 04 commands sweeping 180-degree vistas across Menai Bay Marine Sanctuary. During high tide, dolphins can frequently be spotted jumping along the outer reef line. The interior balances minimalist contemporary lines with warm earth tones, brass fixtures, and woven raffia accents.",
    heroImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1400&q=85",
    images: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85"
    ],
    amenities: [
      "Elevated Panoramic Ocean Deck",
      "High-Power Nautical Binoculars for Marine Watching",
      "Air Conditioning & Ceiling Fan",
      "High-Speed Wi-Fi",
      "Full Breakfast Service",
      "Mini Bar with Fresh Coconut Daily",
      "Double Rain Shower",
      "Outdoor Dining Table"
    ],
    order: 4,
    status: "published"
  },
  {
    id: "villa-05",
    roomNumber: "VILLA 05",
    name: "Baobab Palm Pavilion",
    type: "Two-Bedroom Family or Couple Suite",
    capacity: 4,
    bed: "Two King Beds (or King + Twin Suite)",
    bathroom: "2 Private En-Suite Bathrooms",
    size: "130 m\xB2 (1,400 sq ft)",
    view: "Ancient Baobab Trees & Distant Ocean Glimpse",
    pricePerNight: "$590",
    promotionalPrice: "$540",
    availability: true,
    featured: false,
    architecturalFeature: "Private enclosed courtyard wrapped around a centenary baobab tree",
    shortDescription: "A spacious two-bedroom sanctuary surrounded by sculptural baobabs, perfect for families or small groups seeking quiet luxury.",
    description: "Centered around an ancient, revered Baobab tree, this generous two-bedroom pavilion provides exceptional comfort for traveling companions or families. Featuring a shaded central living courtyard, two independent master suites each with their own open-air bathroom, and a private dining pergola.",
    heroImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=85",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=85"
    ],
    amenities: [
      "2 Master Bedrooms with Private En-suites",
      "Private Courtyard with Dining Pergola",
      "Air Conditioning in All Rooms",
      "High-Speed Wi-Fi",
      "Private Butler & Dedicated Family Host",
      "Full Gourmet Breakfast Service",
      "Board Games & Stargazing Telescope"
    ],
    order: 5,
    status: "published"
  },
  {
    id: "villa-06",
    roomNumber: "VILLA 06",
    name: "Zanzibar Spice Villa",
    type: "Heritage Villa with Private Lap Pool",
    capacity: 2,
    bed: "Hand-Carved Zanzibar Teak King Bed",
    bathroom: "Stone En-Suite & Copper Soaking Tub",
    size: "110 m\xB2 (1,184 sq ft)",
    view: "Private Pool, Coconut Grove & Ocean Shimmer",
    pricePerNight: "$520",
    promotionalPrice: "$470",
    availability: true,
    featured: false,
    architecturalFeature: "Hand-chiseled antique Swahili brass-studded doors and 12m private lap pool",
    shortDescription: "Celebrates Zanzibar\u2019s fabled spice heritage with authentic carved doors, private lap pool, and aromatic botanical courtyard.",
    description: "A tribute to the Spice Island\u2019s golden age of artisanal craftsmanship. Villa 06 features authentic brass-studded carved doors from Stone Town master carvers, hand-poured terrazzo floors, and a private 12-meter fresh water lap pool fringed by clove and lemongrass bushes.",
    heroImage: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=85",
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85"
    ],
    amenities: [
      "Private 12m Fresh Water Lap Pool",
      "Antique Hammered Copper Soaking Tub",
      "Air Conditioning & Cross-Breeze Louvers",
      "High-Speed Wi-Fi",
      "Complimentary Spice Tasting & Tea Ritual",
      "Artisanal Breakfast in Private Courtyard",
      "Butler Service"
    ],
    order: 6,
    status: "published"
  },
  {
    id: "villa-07",
    roomNumber: "VILLA 07",
    name: "Serengeti Breeze Villa",
    type: "Minimalist Modern Coastal Villa",
    capacity: 2,
    bed: "Ultra-Comfort King Bed with Natural Latex Mattress",
    bathroom: "Minimalist Terrazzo Shower & Garden Tub",
    size: "88 m\xB2 (947 sq ft)",
    view: "Ocean Panorama & Rooftop Stargazing Deck",
    pricePerNight: "$450",
    promotionalPrice: "$410",
    availability: true,
    featured: false,
    architecturalFeature: "Private spiral stairs leading to rooftop starlight daybed",
    shortDescription: "Sleek architectural lines, warm natural materials, and an exclusive rooftop observation deck for equatorial stargazing.",
    description: "Conceived for the design-conscious traveler, Villa 07 fuses Japanese-Scandinavian minimalism with East African earthiness. Soothing neutral tones, hand-woven sisal carpets, and an exclusive rooftop observation deck equipped with daybeds make this a haven for moonlit relaxation and tranquil meditation.",
    heroImage: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1400&q=85",
    images: [
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85"
    ],
    amenities: [
      "Rooftop Stargazing & Sunset Terrace",
      "Air Conditioning",
      "High-Speed Wi-Fi",
      "Daily In-Villa Breakfast",
      "Curated Wine & Spirits Selection",
      "Bang & Olufsen Bluetooth Acoustics",
      "Bespoke Pillow Menu"
    ],
    order: 7,
    status: "published"
  },
  {
    id: "villa-08",
    roomNumber: "VILLA 08",
    name: "The Royal Presidential Villa",
    type: "Grand Two-Story Master Estate",
    capacity: 6,
    bed: "2 King Master Suites + Twin Bedroom",
    bathroom: "3 Luxurious En-Suite Bathrooms + Powder Room",
    size: "240 m\xB2 (2,583 sq ft)",
    view: "Unrivaled 360\xB0 Indian Ocean & Coastal Bluff",
    pricePerNight: "$950",
    promotionalPrice: "$890",
    availability: true,
    featured: true,
    architecturalFeature: "Private infinity pool, chef prep kitchen, private dhow jetty, and dedicated 24-hour butler team",
    shortDescription: "The flagship residence of Zanzirangi House. Unparalleled oceanfront grandeur, multi-level infinity pools, and discrete private hosting.",
    description: "The estate\u2019s most exclusive address. Set on its own secluded promontory, The Royal Presidential Villa offers total autonomy, expansive entertaining salons, a private oceanfront infinity pool suspended over the coral lagoon, a private chef service on request, and direct private beach access.",
    heroImage: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1600&q=85",
    images: [
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=85"
    ],
    amenities: [
      "Private Multi-Level Infinity Pool",
      "Dedicated 24-Hour Private Butler & Host",
      "Private Chef Available for In-Villa Banquets",
      "3 Master Suites with Luxury En-suites",
      "Direct Private Beach Cove & Sundeck",
      "Air Conditioning in All Quarters",
      "High-Speed Wi-Fi & Smart Entertainment",
      "Complimentary VIP Airport Chauffeur Transfers",
      "Fully Stocked Premium Bar & Champagne on Arrival"
    ],
    order: 8,
    status: "published"
  }
];
var DEFAULT_GALLERY = [
  {
    id: "g-prop-01",
    title: "Cliffside Oceanfront Sanctuary",
    category: "property",
    image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1600&q=85",
    aspect: "landscape",
    caption: "The sweeping coastal grounds of Zanzirangi House overlooking Menai Bay.",
    order: 1,
    published: true
  },
  {
    id: "g-prop-02",
    title: "Swahili Coral Ragstone Architecture",
    category: "property",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=85",
    aspect: "portrait",
    caption: "Sustainable indigenous timber, makuti thatch roofs, and artisanal stone craftsmanship.",
    order: 2,
    published: true
  },
  {
    id: "g-prop-03",
    title: "Twilight Over Menai Bay Shoreline",
    category: "property",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=85",
    aspect: "landscape",
    caption: "Sunset hues reflecting across private beachfront daybeds and gentle evening tides.",
    order: 3,
    published: true
  },
  {
    id: "g-vil-real",
    title: "Zanzirangi Villa Access Pathway",
    category: "villas",
    image: "./zanzirangi-villas.jpg",
    aspect: "portrait",
    caption: "Atmospheric evening stone pathway winding to private thatched Makuti villas amidst illuminated tropical palms.",
    order: 4,
    published: true
  },
  {
    id: "g-vil-01",
    title: "Sultan Oceanfront Villa Sun Deck",
    category: "villas",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1600&q=85",
    aspect: "landscape",
    caption: "Private timber deck with personal plunge pool overlooking the turquoise Indian Ocean.",
    order: 5,
    published: true
  },
  {
    id: "g-vil-02",
    title: "Hand-Carved Zanzibar Four-Poster Teak Bed",
    category: "villas",
    image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=85",
    aspect: "portrait",
    caption: "Egyptian cotton linens and natural ocean breeze cross-ventilation in the Master Suite.",
    order: 6,
    published: true
  },
  {
    id: "g-din-01",
    title: "Ocean-to-Table Candlelit Dinner",
    category: "dining",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1600&q=85",
    aspect: "landscape",
    caption: "Artisanal Swahili cuisine served under the stars with fresh Menai Bay yellowfin tuna.",
    order: 7,
    published: true
  },
  {
    id: "g-pool-01",
    title: "Horizon Infinity Pool at High Tide",
    category: "pool",
    image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1600&q=85",
    aspect: "landscape",
    caption: "The main freshwater infinity pool blending seamlessly into the southern turquoise reef.",
    order: 8,
    published: true
  },
  {
    id: "g-gar-01",
    title: "Frangipani & Centenary Baobab Groves",
    category: "garden",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1600&q=85",
    aspect: "landscape",
    caption: "Indigenous coastal flora and medicinal botanicals cultivated organically on site.",
    order: 9,
    published: true
  },
  {
    id: "g-zan-01",
    title: "Traditional Wooden Dhow Sailing",
    category: "zanzibar",
    image: "https://images.unsplash.com/photo-1534759846116-5799c33ce22a?auto=format&fit=crop&w=1600&q=85",
    aspect: "landscape",
    caption: "A classical hand-hewn lateen-sail dhow catching the afternoon trade wind.",
    order: 10,
    published: true
  },
  {
    id: "g-exp-01",
    title: "Menai Bay Dolphin Marine Sanctuary",
    category: "experiences",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1600&q=85",
    aspect: "landscape",
    caption: "Ethical sunrise encounters with resident wild bottlenose pods right off Kizimkazi.",
    order: 11,
    published: true
  }
];
var DEFAULT_FACILITIES = [
  {
    id: "pool",
    title: "Oceanfront Infinity Pool",
    category: "Relaxation & Wellness",
    description: "Suspended above the turquoise tides of the Indian Ocean, our 25-meter freshwater infinity pool mirrors the sky and ocean horizons with sunken sunbeds and attentive poolside service.",
    image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=85",
    hours: "06:30 \u2013 22:00 Daily",
    highlight: "Heated freshwater with ocean horizon views",
    order: 1,
    visible: true
  },
  {
    id: "dining",
    title: "The Tamarind Dining Pavilion",
    category: "Culinary Arts",
    description: "An open-air pavilion beneath vaulted Makuti thatch offering panoramic ocean views. Experience fine dining infused with the aromas of Zanzibar spices and the freshest catches of the day.",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=85",
    hours: "Breakfast, Lunch & Dinner",
    highlight: "Farm-to-table organic produce & fresh daily seafood",
    order: 2,
    visible: true
  },
  {
    id: "massage",
    title: "Swahili Botanical Spa & Massage",
    category: "Holistic Wellness",
    description: "Secluded open-air spa salas nestled in coastal gardens. Indulge in bespoke massages using cold-pressed Zanzibar coconut oil, lemongrass, ground cloves, and indigenous African botanicals.",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85",
    hours: "08:00 \u2013 20:00 by Appointment",
    highlight: "Authentic Clove & Lemongrass Aromatherapy",
    order: 3,
    visible: true
  },
  {
    id: "bbq",
    title: "Barefoot Beach BBQ & Firepit",
    category: "Evening Gathering",
    description: "As the sun dips into the Indian Ocean, gather around our shoreline firepit for grilled lobster, tiger prawns, and spiced tenderloins cooked over coconut husks under the African constellations.",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=85",
    hours: "Sunset from 18:30",
    highlight: "Oceanfront candlelit dining with live acoustic Taarab music",
    order: 4,
    visible: true
  },
  {
    id: "breakfast",
    title: "Artisanal Gourmet Breakfast",
    category: "Morning Ritual",
    description: "Awaken to tropical fruit platters from local orchards, freshly baked brioche, passion fruit curd, Tanzanian arabica coffee, and eggs cooked to your preference in your villa or by the sea.",
    image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1200&q=85",
    hours: "07:00 \u2013 11:00 (In-Villa or Pavilion)",
    highlight: "Complimentary for all staying guests",
    order: 5,
    visible: true
  },
  {
    id: "wifi",
    title: "High-Speed Starlink Satellite Wi-Fi",
    category: "Connectivity",
    description: "Enjoy blazing-fast, low-latency satellite internet across the entire estate, private villas, beachfront loungers, and dining terraces, ensuring seamless communication and remote productivity.",
    image: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=85",
    hours: "24/7 Unlimited High Speed",
    highlight: "Reliable fiber-speed connectivity in every corner",
    order: 6,
    visible: true
  }
];
var DEFAULT_TESTIMONIALS = [
  {
    id: "rev-01",
    guestName: "Eleanor & Marcus Vance",
    country: "United Kingdom",
    countryCode: "GB",
    rating: 5,
    stayDate: "November 2025",
    villaStayed: "Sultan Oceanfront Villa",
    title: "An absolute paradise beyond all expectations",
    reviewText: "From the moment our private chauffeur welcomed us at Zanzibar Airport to our final sunset dhow sail, every detail was orchestrated to absolute perfection. The plunge pool perched over the ocean tide was magical.",
    featured: true,
    verified: true,
    visible: true,
    order: 1
  },
  {
    id: "rev-02",
    guestName: "Jean-Philippe de Montmirail",
    country: "France",
    countryCode: "FR",
    rating: 5,
    stayDate: "January 2026",
    villaStayed: "Makuti Garden Sanctuary",
    title: "Authentic elegance and supreme tranquility",
    reviewText: "The architectural restraint, use of indigenous coral stone, and attentive but discrete butler service reminded us of the very finest Aman or Singita lodges. The Swahili coconut seafood dinner was unforgettable.",
    featured: true,
    verified: true,
    visible: true,
    order: 2
  },
  {
    id: "rev-03",
    guestName: "Clara & Henrik Lindstr\xF6m",
    country: "Sweden",
    countryCode: "SE",
    rating: 5,
    stayDate: "February 2026",
    villaStayed: "The Royal Presidential Villa",
    title: "The ultimate private sanctuary in East Africa",
    reviewText: "We traveled as a family of five. Having our own private infinity pool suspended above the coral lagoon and our personal chef preparing fresh catches each evening redefined what luxury travel means to us.",
    featured: true,
    verified: true,
    visible: true,
    order: 3
  },
  {
    id: "rev-04",
    guestName: "Dr. Tariq & Amina Al-Mansoor",
    country: "United Arab Emirates",
    countryCode: "AE",
    rating: 5,
    stayDate: "December 2025",
    villaStayed: "Zanzibar Spice Villa",
    title: "Deeply restorative and culturally rich",
    reviewText: "The antique carved brass doors and private lap pool created a serene atmosphere. Waking up to ocean breezes and seeing wild dolphins on the sunrise dhow excursion was a lifelong highlight.",
    featured: false,
    verified: true,
    visible: true,
    order: 4
  },
  {
    id: "rev-05",
    guestName: "Sipho & Lerato Khumalo",
    country: "South Africa",
    countryCode: "ZA",
    rating: 5,
    stayDate: "October 2025",
    villaStayed: "Coral Cove Villa",
    title: "Genuine African hospitality at an international standard",
    reviewText: "Stepping directly from our villa deck into the warm turquoise Indian Ocean was pure bliss. The staff\u2019s warmth and attention to detail made us feel like honored family in Tanzania.",
    featured: false,
    verified: true,
    visible: true,
    order: 5
  }
];
var DEFAULT_VIDEOS = {
  id: "main-brand-reel",
  title: "Cinematic Brand Reel",
  eyebrow: "Experience The Sanctuary",
  badge: "4K Ultra HD \u2022 Concept Storyboard",
  videoUrl: "./Zanzirangi-home.mp4",
  posterImage: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1600&q=85",
  scenes: [
    { id: "sc-1", order: 1, description: "Private airport chauffeur arrival & traditional iced lemongrass towel welcome" },
    { id: "sc-2", order: 2, description: "Makuti timber architecture nestled within ancient baobab groves" },
    { id: "sc-3", order: 3, description: "Handcrafted teak interiors, floor-to-ceiling glass, and limestone plunge pool" },
    { id: "sc-4", order: 4, description: "Freshwater infinity pool overlooking the turquoise Menai Bay reef" },
    { id: "sc-5", order: 5, description: "Farm-fresh Swahili spices, wild yellowfin tuna, and candlelit ocean pavilion" },
    { id: "sc-6", order: 6, description: "Hand-hewn dhow wooden boat sailing into the Indian Ocean golden twilight" },
    { id: "sc-7", order: 7, description: "The gateway to the Serengeti & wild Tanzanian mainland expeditions" }
  ],
  visible: true
};
var DEFAULT_SEO = {
  siteTitle: "Zanzibar Luxury Villa - Zanzirangi House | Private Pool Retreat",
  defaultOgImage: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2400&q=90",
  googleSiteVerification: "zanzirangi-verification-code",
  routes: {
    "/": {
      path: "/",
      title: "Zanzibar Luxury Villa - Zanzirangi House | Private Pool Retreat",
      description: "Experience Zanzibar luxury villas with private plunge pools at Zanzirangi House in Kizimkazi. Enjoy ocean-to-table dining and bespoke Tanzania safari journeys.",
      canonical: "https://zanzirangihouse.com/",
      robots: "index, follow"
    },
    "/villas": {
      path: "/villas",
      title: "Private Luxury Villas in Zanzibar | Zanzirangi House",
      description: "Explore 8 exclusive private plunge pool villas in Kizimkazi, Zanzibar. Handcrafted coral stone suites with dedicated 24/7 butler service.",
      canonical: "https://zanzirangihouse.com/villas",
      robots: "index, follow"
    },
    "/dining": {
      path: "/dining",
      title: "Oceanfront Dining in Zanzibar | Zanzirangi House",
      description: "Artisanal ocean-to-table gastronomy featuring line-caught Kizimkazi seafood, rare Swahili spices, and private sunset beach candlelit dinners.",
      canonical: "https://zanzirangihouse.com/dining",
      robots: "index, follow"
    },
    "/experiences": {
      path: "/experiences",
      title: "Zanzibar Experiences & Private Tours | Zanzirangi House",
      description: "Bespoke Zanzibar island tours: ethical Menai Bay dolphin dhow safaris, Stone Town UNESCO heritage walks, and organic spice farm excursions.",
      canonical: "https://zanzirangihouse.com/experiences",
      robots: "index, follow"
    },
    "/safari": {
      path: "/safari",
      title: "Tanzania Safari from Zanzibar | Zanzirangi House",
      description: "Seamless fly-in bush and beach safaris connecting Zanzibar to Serengeti National Park, Ngorongoro Crater, and Mount Kilimanjaro.",
      canonical: "https://zanzirangihouse.com/safari",
      robots: "index, follow"
    },
    "/about": {
      path: "/about",
      title: "About Zanzirangi House | Barefoot Luxury Sanctuary in Kizimkazi",
      description: "Learn about Zanzirangi House\u2014an ultra-boutique 8-villa sanctuary in Kizimkazi Dimbani combining Swahili-Omani heritage with barefoot eco-luxury.",
      canonical: "https://zanzirangihouse.com/about",
      robots: "index, follow"
    },
    "/contact": {
      path: "/contact",
      title: "Contact & Book Zanzirangi House Zanzibar | Direct Reservations",
      description: "Contact our 24/7 concierge for direct villa reservations, airport chauffeur transfers from ZNZ, and personalized Tanzania safari itinerary planning.",
      canonical: "https://zanzirangihouse.com/contact",
      robots: "index, follow"
    }
  }
};
var DEFAULT_MEDIA = [
  {
    id: "med-01",
    filename: "hero-ocean-plunge.jpg",
    url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2400&q=90",
    type: "image",
    mimeType: "image/jpeg",
    sizeBytes: 1245e3,
    altText: "Sultan Oceanfront Villa private plunge pool overlooking Indian Ocean",
    caption: "Master Villa sun deck at high tide",
    uploadedAt: "2026-09-01T00:00:00.000Z",
    referenceCount: 4
  },
  {
    id: "med-02",
    filename: "zanzirangi-villas.jpg",
    url: "./zanzirangi-villas.jpg",
    type: "image",
    mimeType: "image/jpeg",
    sizeBytes: 84e4,
    altText: "Atmospheric evening Makuti thatched villas pathway",
    caption: "Authentic villa architecture at dusk",
    uploadedAt: "2026-09-01T00:00:00.000Z",
    referenceCount: 3
  },
  {
    id: "med-03",
    filename: "infinity-pool-reef.jpg",
    url: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1600&q=85",
    type: "image",
    mimeType: "image/jpeg",
    sizeBytes: 98e4,
    altText: "Freshwater 25-meter infinity pool suspended above Menai Bay",
    caption: "Ocean horizon infinity pool view",
    uploadedAt: "2026-09-01T00:00:00.000Z",
    referenceCount: 3
  },
  {
    id: "med-04",
    filename: "Zanzirangi-home.mp4",
    url: "./Zanzirangi-home.mp4",
    type: "video",
    mimeType: "video/mp4",
    sizeBytes: 1684578,
    altText: "Zanzirangi House 4K Cinematic Ambient Reel",
    caption: "Official property ambient film",
    uploadedAt: "2026-09-01T00:00:00.000Z",
    referenceCount: 2
  }
];
var DEFAULT_SETTINGS = {
  siteName: "Zanzirangi House",
  tagline: "Private Luxury Villas & Sanctuary in Kizimkazi, Zanzibar",
  defaultCurrency: "USD ($)",
  currency: "USD",
  defaultLanguage: "en",
  phone: "+255 777 890 123",
  conciergePhone: "+255 777 890 123",
  whatsapp: "+255 777 890 123",
  email: "info@zanzirangihouse.com",
  reservationNotificationEmail: "reservations@zanzirangihouse.com",
  reservationEmail: "reservations@zanzirangihouse.com",
  address: "Kizimkazi Dimbani, South Coast, Zanzibar, Tanzania",
  instagram: "https://instagram.com/zanzirangi.house",
  facebook: "https://facebook.com/zanzirangihouse",
  youtube: "https://youtube.com/@zanzirangihouse",
  bookingUrl: "https://zanzirangihouse.com/#stay",
  logo: "/src/assets/zanzirangi-logo-new.jpeg",
  favicon: "/favicon.svg",
  maintenanceMode: false
};

// server/seedKnowledgeBase.ts
var DEFAULT_KNOWLEDGE_BASE = [
  {
    id: "kb_checkin_01",
    question: "What are the check-in and check-out times?",
    answer: "Standard check-in is from 14:00 (2:00 PM) and check-out is until 11:00 AM. Flexible early check-in or late checkout can be accommodated complimentary whenever villa availability permits.",
    category: "Check-in",
    language: "en",
    status: "PUBLISHED",
    source: "FAQ_IMPORT",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "kb_transfer_01",
    question: "How does the airport transfer work and how far is it?",
    answer: "Zanzirangi House is located in Kizimkazi Dimbani, approximately 55 minutes from Abeid Amani Karume International Airport (ZNZ). We provide private luxury VIP chauffeur transfers with refreshing cold towels and tropical refreshments upon arrival.",
    category: "Airport Transfer",
    language: "en",
    status: "PUBLISHED",
    source: "FAQ_IMPORT",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "kb_wifi_01",
    question: "Is there high-speed Wi-Fi available across the property?",
    answer: "Yes! High-speed Starlink satellite Wi-Fi (150+ Mbps) is complimentary across all private villas, lush gardens, swimming pools, and dining pavilions, ensuring seamless connectivity for streaming or remote work.",
    category: "Wi-Fi",
    language: "en",
    status: "PUBLISHED",
    source: "FAQ_IMPORT",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "kb_dining_01",
    question: "Is breakfast included and what dining options are available?",
    answer: "A gourmet tropical breakfast is included daily with your stay. Our oceanfront restaurant serves freshly landed Menai Bay seafood, authentic Swahili spice recipes, and international fine dining. In-villa dining is available around the clock.",
    category: "Dining",
    language: "en",
    status: "PUBLISHED",
    source: "FAQ_IMPORT",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "kb_beach_dining_01",
    question: "Can we arrange a private romantic dinner on the beach?",
    answer: "Yes! We arrange unforgettable candlelight dinners directly on the soft white sands or elevated coral terraces with torchlight and a custom 5-course seafood tasting menu.",
    category: "Dining",
    language: "en",
    status: "PUBLISHED",
    source: "FAQ_IMPORT",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "kb_villas_01",
    question: "Do all villas have private plunge pools and beach access?",
    answer: "Every single one of our 8 luxury sanctuaries features its own private freshwater infinity plunge pool, sun loungers, outdoor stone showers, and direct private pathway access to the shores of the Indian Ocean.",
    category: "Villa",
    language: "en",
    status: "PUBLISHED",
    source: "FAQ_IMPORT",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "kb_safari_01",
    question: "How can we arrange a Serengeti fly-in safari expedition?",
    answer: "We organize chartered fly-in safaris directly from Zanzibar airport (approx. 1h 45m) to Serengeti National Park, Ngorongoro Crater, and Tarangire with luxury partner tented camps overlooking migration corridors.",
    category: "Safari",
    language: "en",
    status: "PUBLISHED",
    source: "FAQ_IMPORT",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "kb_dolphins_01",
    question: "Can we swim with dolphins in Kizimkazi?",
    answer: "Kizimkazi is world-renowned for resident pods of wild bottlenose and spinner dolphins in the Menai Bay Conservation Area. We arrange ethical sunrise boat departures with licensed marine conservation guides right from our shore.",
    category: "Other",
    language: "en",
    status: "PUBLISHED",
    source: "FAQ_IMPORT",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "kb_dhow_01",
    question: "How do we book a private sunset dhow sailing experience?",
    answer: "A private wooden dhow sailing experience is unforgettable. Glide across the turquoise Indian Ocean while enjoying chilled Champagne and fresh Swahili canap\xE9s as the sun dips below the horizon.",
    category: "Other",
    language: "en",
    status: "PUBLISHED",
    source: "FAQ_IMPORT",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "kb_spa_01",
    question: "What spa treatments and massage therapies are offered?",
    answer: "Our in-villa holistic wellness treatments feature cold-pressed Zanzibari coconut oils, clove and cinnamon body scrubs, and soothing deep-tissue massages performed on your private oceanfront sun deck.",
    category: "Wellness",
    language: "en",
    status: "PUBLISHED",
    source: "FAQ_IMPORT",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "kb_stonetown_01",
    question: "Can you organize a guided Stone Town and spice plantation tour?",
    answer: "We organize private cultural journeys with master Swahili historians through UNESCO-listed Stone Town, followed by a sensory walk through an organic spice plantation tasting fresh vanilla, nutmeg, and cloves.",
    category: "Other",
    language: "en",
    status: "PUBLISHED",
    source: "FAQ_IMPORT",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "kb_family_01",
    question: "Is Zanzirangi House suitable for families with children?",
    answer: "Families are warmly welcomed. We offer interconnecting villa sanctuaries, extra rollaway beds, tailored kids menus, and professional babysitting upon request.",
    category: "Family",
    language: "en",
    status: "PUBLISHED",
    source: "FAQ_IMPORT",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "kb_honeymoon_01",
    question: "What special amenities are available for honeymoon couples?",
    answer: "For honeymooners, we prepare complimentary chilled Champagne, fresh tropical floral arrangements, an intimate sunset dhow cruise, and a romantic beach dinner under the stars.",
    category: "Villa",
    language: "en",
    status: "PUBLISHED",
    source: "FAQ_IMPORT",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "kb_payment_01",
    question: "What payment methods and cancellation policies apply?",
    answer: "We accept major credit cards (Visa, MasterCard, Amex), international bank wire transfers, and mobile payments. Flexible cancellation terms apply up to 14 days prior to arrival with full refund.",
    category: "Pricing",
    language: "en",
    status: "PUBLISHED",
    source: "FAQ_IMPORT",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "kb_diving_01",
    question: "Where are the best snorkeling and diving spots nearby?",
    answer: "Partnering with certified PADI dive masters, we take you to the pristine coral reefs of Mnemba Atoll and Kizimkazi reef to observe sea turtles, manta rays, and vibrant marine life.",
    category: "Other",
    language: "en",
    status: "PUBLISHED",
    source: "FAQ_IMPORT",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }
];

// server/db.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var DATA_DIR = fs.existsSync(path.resolve(process.cwd(), "server/data")) ? path.resolve(process.cwd(), "server/data") : fs.existsSync(path.resolve(process.cwd(), "data")) ? path.resolve(process.cwd(), "data") : path.resolve(__dirname, "data");
var DB_FILE = path.join(DATA_DIR, "db.json");
var DEFAULT_HOMEPAGE_CONTENT = {
  hero: {
    title: "Zanzibar Luxury Villa - Zanzirangi House | Private Pool Retreat",
    subtitle: "YOUR PRIVATE GATEWAY TO ZANZIBAR",
    description: "Experience Zanzibar luxury villas with private plunge pools at Zanzirangi House in Kizimkazi. Enjoy ocean-to-table dining and bespoke Tanzania safari journeys.",
    badgeText: "KIZIMKAZI DIMBANI \u2022 SOUTH COAST ZANZIBAR",
    primaryCtaText: "Reserve Sanctuary",
    primaryCtaLink: "#stay",
    secondaryCtaText: "Explore Sanctuary",
    secondaryCtaLink: "#itinerary",
    heroImage: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2400&q=90",
    slides: DEFAULT_HERO_SLIDES,
    autoPlayIntervalSeconds: 6
  },
  sections: DEFAULT_SECTIONS,
  intro: {
    eyebrow: "MORE THAN A STAY",
    title: "An intimate sanctuary between the ocean breeze and Swahili heritage",
    description: "Zanzirangi House is an ultra-boutique retreat featuring 8 private plunge-pool villas secluded along the peaceful southern coast of Zanzibar in Kizimkazi Dimbani."
  },
  contact: {
    phone: "+255 777 890 123",
    email: "concierge@zanzirangihouse.com",
    whatsappNumber: "255777890123",
    address: "Kizimkazi Dimbani, South Coast, Zanzibar, Tanzania",
    googleMapsUrl: "https://maps.google.com/?q=Kizimkazi+Dimbani+Zanzibar"
  },
  socials: {
    instagram: "https://instagram.com/zanzirangihouse",
    facebook: "https://facebook.com/zanzirangihouse",
    tiktok: "https://tiktok.com/@zanzirangihouse",
    youtube: "https://youtube.com/@zanzirangihouse",
    whatsapp: "https://wa.me/255777890123"
  },
  footer: {
    copyrightText: "\xA9 2026 Zanzirangi House. All rights reserved. Ultra-Boutique Luxury Sanctuary in Kizimkazi Dimbani, Zanzibar, Tanzania.",
    tagline: "A tranquil coastal sanctuary in Kizimkazi Dimbani."
  },
  meta: {
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
    updatedBy: "system"
  }
};
var INITIAL_ADMINS = [
  {
    email: "info@zanzirangihouse.com",
    name: "Zanzirangi Head Concierge",
    role: "superadmin"
  },
  {
    email: "dominic@zanzirangihouse.com",
    name: "Dominic - Property Director",
    role: "admin"
  },
  {
    email: "dotto@zanzirangihouse.com",
    name: "Dotto - Guest Operations",
    role: "admin"
  },
  {
    email: "jocelyn@zanzirangihouse.com",
    name: "Jocelyn - Hospitality Manager",
    role: "admin"
  },
  {
    email: "saleh@zanzirangihouse.com",
    name: "Saleh - Operations Lead",
    role: "admin"
  }
];
var dbCache = null;
function initDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const initialBootstrapPassword = process.env.ADMIN_INITIAL_PASSWORD || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "ZanzirangiAuth" + Date.now());
  const salt = bcrypt.genSaltSync(12);
  const defaultHash = bcrypt.hashSync(initialBootstrapPassword, salt);
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed.users && parsed.homepage) {
        let mutated = false;
        if (!parsed.homepage.hero.slides || parsed.homepage.hero.slides.length === 0) {
          parsed.homepage.hero.slides = DEFAULT_HERO_SLIDES;
          parsed.homepage.hero.autoPlayIntervalSeconds = 6;
          mutated = true;
        }
        if (!parsed.homepage.sections || parsed.homepage.sections.length === 0) {
          parsed.homepage.sections = DEFAULT_SECTIONS;
          mutated = true;
        }
        if (!parsed.homepage.socials) {
          parsed.homepage.socials = DEFAULT_HOMEPAGE_CONTENT.socials;
          mutated = true;
        }
        if (!parsed.homepage.footer) {
          parsed.homepage.footer = DEFAULT_HOMEPAGE_CONTENT.footer;
          mutated = true;
        }
        if (!parsed.villas || parsed.villas.length === 0) {
          parsed.villas = DEFAULT_VILLAS;
          mutated = true;
        }
        if (!parsed.gallery || parsed.gallery.length === 0) {
          parsed.gallery = DEFAULT_GALLERY;
          mutated = true;
        }
        if (!parsed.facilities || parsed.facilities.length === 0) {
          parsed.facilities = DEFAULT_FACILITIES;
          mutated = true;
        }
        if (!parsed.testimonials || parsed.testimonials.length === 0) {
          parsed.testimonials = DEFAULT_TESTIMONIALS;
          mutated = true;
        }
        if (!parsed.videos) {
          parsed.videos = DEFAULT_VIDEOS;
          mutated = true;
        }
        if (!parsed.seo) {
          parsed.seo = DEFAULT_SEO;
          mutated = true;
        }
        if (!parsed.media || parsed.media.length === 0) {
          parsed.media = DEFAULT_MEDIA;
          mutated = true;
        }
        if (!parsed.settings) {
          parsed.settings = DEFAULT_SETTINGS;
          mutated = true;
        }
        if (!parsed.support_conversations) {
          parsed.support_conversations = [];
          mutated = true;
        }
        if (!parsed.support_messages) {
          parsed.support_messages = [];
          mutated = true;
        }
        if (!parsed.support_knowledge_base || parsed.support_knowledge_base.length === 0) {
          parsed.support_knowledge_base = DEFAULT_KNOWLEDGE_BASE;
          mutated = true;
        }
        if (!parsed.support_ai_events) {
          parsed.support_ai_events = [];
          mutated = true;
        }
        if (mutated) {
          saveDatabase(parsed);
        }
        dbCache = parsed;
        return dbCache;
      }
    } catch (e) {
      console.error("Error reading existing database, re-initializing...", e);
    }
  }
  const initialDb = {
    users: INITIAL_ADMINS.map((admin, idx) => ({
      id: `usr_${idx + 1}`,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      passwordHash: defaultHash,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    })),
    homepage: DEFAULT_HOMEPAGE_CONTENT,
    villas: DEFAULT_VILLAS,
    gallery: DEFAULT_GALLERY,
    facilities: DEFAULT_FACILITIES,
    testimonials: DEFAULT_TESTIMONIALS,
    videos: DEFAULT_VIDEOS,
    seo: DEFAULT_SEO,
    media: DEFAULT_MEDIA,
    settings: DEFAULT_SETTINGS,
    support_conversations: [],
    support_messages: [],
    support_knowledge_base: DEFAULT_KNOWLEDGE_BASE,
    support_ai_events: [],
    auditLog: [
      {
        action: "DB_INITIALIZED",
        userEmail: "system",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        details: "Initial database created with authorized Zanzirangi mailboxes and full content models"
      }
    ]
  };
  saveDatabase(initialDb);
  dbCache = initialDb;
  return initialDb;
}
var lastMtime = 0;
function getDatabase() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const stat = fs.statSync(DB_FILE);
      if (!dbCache || stat.mtimeMs > lastMtime) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        dbCache = JSON.parse(raw);
        lastMtime = stat.mtimeMs;
      }
      return dbCache;
    } catch {
    }
  }
  if (!dbCache) {
    return initDatabase();
  }
  return dbCache;
}
function saveDatabase(data) {
  dbCache = data;
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tempFile, DB_FILE);
  try {
    lastMtime = fs.statSync(DB_FILE).mtimeMs;
  } catch {
  }
}

// server/database/jsonAdapter.ts
var JsonDatabaseAdapter = class {
  constructor() {
    this.provider = "json";
  }
  async connect() {
    initDatabase();
  }
  async disconnect() {
  }
  async healthCheck() {
    try {
      const db = getDatabase();
      return {
        connected: !!db && Array.isArray(db.users),
        provider: "json"
      };
    } catch (err) {
      return {
        connected: false,
        provider: "json",
        error: err.message
      };
    }
  }
  // --- Homepage ---
  async getHomepage() {
    const db = getDatabase();
    return db.homepage || DEFAULT_HOMEPAGE_CONTENT;
  }
  async updateHomepage(data, userEmail) {
    const db = getDatabase();
    const current = db.homepage || DEFAULT_HOMEPAGE_CONTENT;
    db.homepage = {
      ...current,
      ...data,
      meta: {
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
        updatedBy: userEmail
      }
    };
    db.auditLog.push({
      action: "HOMEPAGE_UPDATED",
      userEmail,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      details: "Updated sanctuary homepage content & layout"
    });
    saveDatabase(db);
    return db.homepage;
  }
  // --- Villas ---
  async getVillas() {
    const db = getDatabase();
    return db.villas || [];
  }
  async getVillaById(id) {
    const db = getDatabase();
    return (db.villas || []).find((v) => v.id === id) || null;
  }
  async saveVilla(villa, userEmail) {
    const db = getDatabase();
    const list = db.villas || [];
    const idx = list.findIndex((v) => v.id === villa.id);
    if (idx >= 0) {
      list[idx] = villa;
    } else {
      list.push(villa);
    }
    db.villas = list;
    db.auditLog.push({
      action: idx >= 0 ? "VILLA_UPDATED" : "VILLA_CREATED",
      userEmail,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      details: `Saved villa entity: ${villa.name} (${villa.id})`
    });
    saveDatabase(db);
    return villa;
  }
  async deleteVilla(id, userEmail) {
    const db = getDatabase();
    const list = db.villas || [];
    const filtered = list.filter((v) => v.id !== id);
    if (filtered.length === list.length) return false;
    db.villas = filtered;
    db.auditLog.push({
      action: "VILLA_DELETED",
      userEmail,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      details: `Removed villa ID: ${id}`
    });
    saveDatabase(db);
    return true;
  }
  // --- Gallery ---
  async getGallery() {
    const db = getDatabase();
    return db.gallery || [];
  }
  async saveGalleryItem(item, userEmail) {
    const db = getDatabase();
    const list = db.gallery || [];
    const idx = list.findIndex((g) => g.id === item.id);
    if (idx >= 0) {
      list[idx] = item;
    } else {
      list.push(item);
    }
    db.gallery = list;
    db.auditLog.push({
      action: idx >= 0 ? "GALLERY_UPDATED" : "GALLERY_CREATED",
      userEmail,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      details: `Saved gallery photograph: ${item.title} (${item.id})`
    });
    saveDatabase(db);
    return item;
  }
  async deleteGalleryItem(id, userEmail) {
    const db = getDatabase();
    const list = db.gallery || [];
    const filtered = list.filter((g) => g.id !== id);
    if (filtered.length === list.length) return false;
    db.gallery = filtered;
    db.auditLog.push({
      action: "GALLERY_DELETED",
      userEmail,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      details: `Removed gallery item ID: ${id}`
    });
    saveDatabase(db);
    return true;
  }
  // --- Facilities ---
  async getFacilities() {
    const db = getDatabase();
    return db.facilities || [];
  }
  async saveFacility(facility, userEmail) {
    const db = getDatabase();
    const list = db.facilities || [];
    const idx = list.findIndex((f) => f.id === facility.id);
    if (idx >= 0) {
      list[idx] = facility;
    } else {
      list.push(facility);
    }
    db.facilities = list;
    db.auditLog.push({
      action: idx >= 0 ? "FACILITY_UPDATED" : "FACILITY_CREATED",
      userEmail,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      details: `Saved facility: ${facility.title} (${facility.id})`
    });
    saveDatabase(db);
    return facility;
  }
  // --- Testimonials ---
  async getTestimonials() {
    const db = getDatabase();
    return db.testimonials || [];
  }
  async saveTestimonial(testimonial, userEmail) {
    const db = getDatabase();
    const list = db.testimonials || [];
    const idx = list.findIndex((t) => t.id === testimonial.id);
    if (idx >= 0) {
      list[idx] = testimonial;
    } else {
      list.push(testimonial);
    }
    db.testimonials = list;
    db.auditLog.push({
      action: idx >= 0 ? "TESTIMONIAL_UPDATED" : "TESTIMONIAL_CREATED",
      userEmail,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      details: `Saved guest impression: ${testimonial.guestName} (${testimonial.id})`
    });
    saveDatabase(db);
    return testimonial;
  }
  async deleteTestimonial(id, userEmail) {
    const db = getDatabase();
    const list = db.testimonials || [];
    const filtered = list.filter((t) => t.id !== id);
    if (filtered.length === list.length) return false;
    db.testimonials = filtered;
    db.auditLog.push({
      action: "TESTIMONIAL_DELETED",
      userEmail,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      details: `Removed testimonial ID: ${id}`
    });
    saveDatabase(db);
    return true;
  }
  // --- Videos ---
  async getVideos() {
    const db = getDatabase();
    return db.videos || {
      videoUrl: "https://assets.zanzirangihouse.com/videos/brand-reel-4k.mp4",
      posterImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85",
      scenes: []
    };
  }
  async updateVideos(data, userEmail) {
    const db = getDatabase();
    const current = await this.getVideos();
    db.videos = { ...current, ...data };
    db.auditLog.push({
      action: "VIDEOS_UPDATED",
      userEmail,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      details: "Updated 4K cinematic film & storyboard scenes"
    });
    saveDatabase(db);
    return db.videos;
  }
  // --- SEO ---
  async getSeo() {
    const db = getDatabase();
    return db.seo || {
      siteTitle: "Zanzibar Luxury Villa - Zanzirangi House | Private Pool Retreat",
      defaultOgImage: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2400&q=90",
      routes: {}
    };
  }
  async updateSeo(data, userEmail) {
    const db = getDatabase();
    const current = await this.getSeo();
    db.seo = { ...current, ...data };
    db.auditLog.push({
      action: "SEO_UPDATED",
      userEmail,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      details: "Updated SERP metadata and route SEO configurations"
    });
    saveDatabase(db);
    return db.seo;
  }
  // --- Media ---
  async getMedia() {
    const db = getDatabase();
    return db.media || [];
  }
  async saveMedia(asset, userEmail) {
    const db = getDatabase();
    const list = db.media || [];
    const idx = list.findIndex((m) => m.id === asset.id);
    if (idx >= 0) {
      list[idx] = asset;
    } else {
      list.unshift(asset);
    }
    db.media = list;
    db.auditLog.push({
      action: idx >= 0 ? "MEDIA_UPDATED" : "MEDIA_UPLOADED",
      userEmail,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      details: `Saved media asset: ${asset.filename}`
    });
    saveDatabase(db);
    return asset;
  }
  async deleteMedia(id, userEmail) {
    const db = getDatabase();
    const list = db.media || [];
    const filtered = list.filter((m) => m.id !== id);
    if (filtered.length === list.length) return false;
    db.media = filtered;
    db.auditLog.push({
      action: "MEDIA_DELETED",
      userEmail,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      details: `Removed media record ID: ${id}`
    });
    saveDatabase(db);
    return true;
  }
  // --- Settings ---
  async getSettings() {
    const db = getDatabase();
    return db.settings || DEFAULT_SETTINGS;
  }
  async updateSettings(data, userEmail) {
    const db = getDatabase();
    db.settings = { ...db.settings || DEFAULT_SETTINGS, ...data };
    db.auditLog.push({
      action: "SETTINGS_UPDATED",
      userEmail,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      details: "Updated sanctuary system settings"
    });
    saveDatabase(db);
    return db.settings;
  }
  // --- Users & Auth ---
  async findUserByEmail(email) {
    const db = getDatabase();
    const normalized = email.trim().toLowerCase();
    const u = db.users.find((user) => user.email.toLowerCase() === normalized);
    if (!u) return null;
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      passwordHash: u.passwordHash,
      createdAt: u.createdAt,
      lastLogin: u.lastLogin
    };
  }
  async saveUser(user) {
    const db = getDatabase();
    const idx = db.users.findIndex((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (idx >= 0) {
      db.users[idx] = { ...db.users[idx], ...user };
    } else {
      db.users.push(user);
    }
    saveDatabase(db);
  }
  async listUsers() {
    const db = getDatabase();
    return db.users.map(({ passwordHash, ...safe }) => safe);
  }
  // --- Audit Logs ---
  async getAuditLogs(limit = 20) {
    const db = getDatabase();
    return [...db.auditLog || []].reverse().slice(0, limit);
  }
  async addAuditLog(entry) {
    const db = getDatabase();
    db.auditLog.push({
      ...entry,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    saveDatabase(db);
  }
  // --- Dashboard Stats ---
  async getDashboardStats() {
    const db = getDatabase();
    const recentLogs = await this.getAuditLogs(10);
    return {
      status: "Connected",
      lastPublished: db.homepage?.meta?.lastUpdated || null,
      publishedBy: db.homepage?.meta?.updatedBy || null,
      counts: {
        villasPublished: (db.villas || []).filter((v) => v.status === "published").length,
        villasTotal: (db.villas || []).length,
        galleryItems: (db.gallery || []).length,
        facilities: (db.facilities || []).length,
        testimonials: (db.testimonials || []).length,
        mediaAssets: (db.media || []).length
      },
      recentUpdates: recentLogs.map((l) => ({
        action: l.action,
        userEmail: l.userEmail,
        timestamp: l.timestamp,
        details: l.details
      }))
    };
  }
};

// server/database/mysqlAdapter.ts
init_connection();
init_env();
var MysqlDatabaseAdapter = class {
  constructor() {
    this.provider = "mysql";
  }
  getPool() {
    return getMysqlPool();
  }
  async connect() {
    try {
      const pool = this.getPool();
      const conn = await pool.getConnection();
      conn.release();
      const host = process.env.DB_HOST || env.MYSQL_HOST || "localhost";
      const db = process.env.DB_NAME || env.MYSQL_DATABASE || "u170555096_Zanzirangi";
      console.log(`\u{1F42C} Connected to Hostinger MySQL Database [${db}@${host}]`);
      try {
        const [tables] = await pool.query("SHOW TABLES LIKE 'homepage_config'");
        if (!tables || tables.length === 0) {
          console.warn("\u26A0\uFE0F Notice: Database tables not found yet. Run `npm run db:migrate:mysql` to initialize schema and migrate content.");
        } else {
          console.log("\u2705 Hostinger MySQL schema verified and ready.");
        }
      } catch (schemaErr) {
        console.warn("\u26A0\uFE0F Hostinger schema verification notice:", schemaErr.message);
      }
    } catch (err) {
      console.error("\u274C Failed to establish MySQL connection:", err.message);
      throw err;
    }
  }
  async disconnect() {
    await closeMysqlPool();
    console.log("\u{1F42C} MySQL connection pool closed gracefully.");
  }
  async healthCheck() {
    try {
      const pool = this.getPool();
      const [rows] = await pool.query("SELECT 1 as healthy");
      return {
        connected: Array.isArray(rows) && rows.length > 0,
        provider: "mysql"
      };
    } catch (err) {
      return {
        connected: false,
        provider: "mysql",
        error: err.message
      };
    }
  }
  // --- Homepage ---
  async getHomepage() {
    const pool = this.getPool();
    const [cfgRows] = await pool.query("SELECT * FROM homepage_config WHERE id = 1 LIMIT 1");
    const [slideRows] = await pool.query("SELECT * FROM hero_slides ORDER BY sort_order ASC");
    const [secRows] = await pool.query("SELECT * FROM homepage_sections ORDER BY sort_order ASC");
    const cfg = cfgRows[0] || {};
    let socials = {
      instagram: "https://instagram.com/zanzirangihouse",
      facebook: "https://facebook.com/zanzirangihouse",
      tiktok: "https://tiktok.com/@zanzirangihouse",
      youtube: "https://youtube.com/@zanzirangihouse",
      whatsapp: "https://wa.me/255777890123"
    };
    if (cfg.socials_json) {
      try {
        socials = JSON.parse(cfg.socials_json);
      } catch {
      }
    }
    return {
      hero: {
        title: cfg.hero_title || "Zanzirangi House",
        subtitle: cfg.hero_subtitle || "\u2014 Private Luxury Villas in Zanzibar",
        description: cfg.hero_description || "Experience Zanzibar luxury villas with private plunge pools at Zanzirangi House in Kizimkazi.",
        badgeText: cfg.hero_badge_text || "ZANZIBAR, TANZANIA",
        primaryCtaText: cfg.hero_primary_cta_text || "Reserve Sanctuary",
        primaryCtaLink: cfg.hero_primary_cta_link || "#stay",
        secondaryCtaText: cfg.hero_secondary_cta_text || "Explore Sanctuary",
        secondaryCtaLink: cfg.hero_secondary_cta_link || "#itinerary",
        heroImage: cfg.hero_image || "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2400&q=90",
        autoPlayIntervalSeconds: cfg.auto_play_interval || 6,
        slides: slideRows.map((s) => ({
          id: s.id,
          title: s.title,
          subtitle: s.subtitle,
          description: s.description,
          badgeText: s.badge_text,
          primaryCtaText: s.primary_cta_text,
          primaryCtaLink: s.primary_cta_link,
          secondaryCtaText: s.secondary_cta_text,
          secondaryCtaLink: s.secondary_cta_link,
          imageUrl: s.image_url,
          videoUrl: s.video_url,
          alignment: s.alignment || "center",
          overlayOpacity: parseFloat(s.overlay_opacity || "0.4"),
          order: s.sort_order || 0,
          visible: Boolean(s.visible)
        }))
      },
      intro: {
        eyebrow: cfg.intro_eyebrow || "MORE THAN A STAY",
        title: cfg.intro_title || "An intimate sanctuary between the ocean breeze and Swahili heritage",
        description: cfg.intro_description || "Zanzirangi House is an ultra-boutique retreat featuring 8 private plunge-pool villas secluded along the peaceful southern coast of Zanzibar in Kizimkazi Dimbani."
      },
      contact: {
        phone: cfg.contact_phone || "+255 777 890 123",
        email: cfg.contact_email || "concierge@zanzirangihouse.com",
        whatsappNumber: cfg.contact_whatsapp || "255777890123",
        address: cfg.contact_address || "Kizimkazi Dimbani, South Coast, Zanzibar, Tanzania"
      },
      sections: secRows.map((sec) => ({
        id: sec.id,
        label: sec.label,
        description: sec.description,
        order: sec.sort_order,
        visible: Boolean(sec.visible)
      })),
      socials,
      footer: {
        copyrightText: cfg.footer_copyright || "\xA9 2026 Zanzirangi House. All rights reserved.",
        tagline: cfg.footer_tagline || "A tranquil coastal sanctuary in Kizimkazi Dimbani."
      },
      meta: {
        lastUpdated: cfg.meta_last_updated ? new Date(cfg.meta_last_updated).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
        updatedBy: cfg.meta_updated_by || "system"
      }
    };
  }
  async updateHomepage(data, userEmail) {
    const pool = this.getPool();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      if (data.hero) {
        await conn.query(
          `UPDATE homepage_config SET 
            hero_title = ?, hero_subtitle = ?, hero_description = ?, hero_badge_text = ?, 
            hero_primary_cta_text = ?, hero_primary_cta_link = ?, hero_secondary_cta_text = ?, 
            hero_secondary_cta_link = ?, hero_image = ?, auto_play_interval = ?, 
            meta_last_updated = NOW(), meta_updated_by = ? 
           WHERE id = 1`,
          [
            data.hero.title,
            data.hero.subtitle,
            data.hero.description,
            data.hero.badgeText,
            data.hero.primaryCtaText,
            data.hero.primaryCtaLink,
            data.hero.secondaryCtaText,
            data.hero.secondaryCtaLink,
            data.hero.heroImage,
            data.hero.autoPlayIntervalSeconds || 6,
            userEmail
          ]
        );
        if (Array.isArray(data.hero.slides)) {
          await conn.query("DELETE FROM hero_slides");
          for (let i = 0; i < data.hero.slides.length; i++) {
            const s = data.hero.slides[i];
            await conn.query(
              `INSERT INTO hero_slides 
                (id, title, subtitle, description, badge_text, primary_cta_text, primary_cta_link, 
                 secondary_cta_text, secondary_cta_link, image_url, video_url, alignment, overlay_opacity, sort_order, visible) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                s.id || `slide-${i + 1}`,
                s.title,
                s.subtitle,
                s.description,
                s.badgeText,
                s.primaryCtaText,
                s.primaryCtaLink,
                s.secondaryCtaText,
                s.secondaryCtaLink,
                s.imageUrl || s.heroImage || "",
                s.videoUrl,
                s.alignment || "center",
                s.overlayOpacity || 0.4,
                s.order ?? i,
                s.visible !== false ? 1 : 0
              ]
            );
          }
        }
      }
      if (data.intro) {
        await conn.query(
          "UPDATE homepage_config SET intro_eyebrow = ?, intro_title = ?, intro_description = ? WHERE id = 1",
          [data.intro.eyebrow, data.intro.title, data.intro.description]
        );
      }
      if (data.contact) {
        await conn.query(
          "UPDATE homepage_config SET contact_phone = ?, contact_email = ?, contact_whatsapp = ?, contact_address = ? WHERE id = 1",
          [data.contact.phone, data.contact.email, data.contact.whatsappNumber, data.contact.address]
        );
      }
      if (data.socials) {
        await conn.query("UPDATE homepage_config SET socials_json = ? WHERE id = 1", [JSON.stringify(data.socials)]);
      }
      if (data.footer) {
        await conn.query(
          "UPDATE homepage_config SET footer_copyright = ?, footer_tagline = ? WHERE id = 1",
          [data.footer.copyrightText, data.footer.tagline]
        );
      }
      if (Array.isArray(data.sections)) {
        for (const sec of data.sections) {
          await conn.query(
            `INSERT INTO homepage_sections (id, label, description, sort_order, visible) 
             VALUES (?, ?, ?, ?, ?) 
             ON DUPLICATE KEY UPDATE label = VALUES(label), description = VALUES(description), 
             sort_order = VALUES(sort_order), visible = VALUES(visible)`,
            [sec.id, sec.label || sec.name, sec.description, sec.order, sec.visible !== false ? 1 : 0]
          );
        }
      }
      await conn.query(
        "INSERT INTO audit_logs (action, user_email, details) VALUES (?, ?, ?)",
        ["HOMEPAGE_UPDATED", userEmail, "Updated homepage configuration & layout"]
      );
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
    return this.getHomepage();
  }
  // --- Villas ---
  async getVillas() {
    const pool = this.getPool();
    const [villaRows] = await pool.query("SELECT * FROM villas ORDER BY sort_order ASC");
    const [amenityRows] = await pool.query("SELECT * FROM villa_amenities ORDER BY sort_order ASC");
    const [imageRows] = await pool.query("SELECT * FROM villa_images ORDER BY sort_order ASC");
    const amenitiesMap = /* @__PURE__ */ new Map();
    for (const a of amenityRows) {
      if (!amenitiesMap.has(a.villa_id)) amenitiesMap.set(a.villa_id, []);
      amenitiesMap.get(a.villa_id).push(a.amenity_name);
    }
    const imagesMap = /* @__PURE__ */ new Map();
    for (const img of imageRows) {
      if (!imagesMap.has(img.villa_id)) imagesMap.set(img.villa_id, []);
      imagesMap.get(img.villa_id).push(img.image_url);
    }
    return villaRows.map((v) => {
      const roomNum = v.id && v.id.startsWith("villa-") ? `VILLA ${v.id.replace("villa-", "").padStart(2, "0").toUpperCase()}` : "VILLA 01";
      const sizeStr = v.size_sqm ? `${v.size_sqm} m\xB2 (${Math.round(v.size_sqm * 10.7639).toLocaleString()} sq ft)` : "85 m\xB2 (915 sq ft)";
      const rawPrice = v.price_per_night !== void 0 && v.price_per_night !== null ? String(v.price_per_night) : "400";
      const priceStr = rawPrice.startsWith("$") ? rawPrice : `$${parseFloat(rawPrice)}`;
      const rawPromo = v.promotional_price !== void 0 && v.promotional_price !== null ? String(v.promotional_price) : "";
      const promoStr = rawPromo ? rawPromo.startsWith("$") ? rawPromo : `$${parseFloat(rawPromo)}` : void 0;
      const imagesList = imagesMap.get(v.id) || (v.hero_image ? [v.hero_image] : []);
      return {
        id: v.id,
        roomNumber: roomNum,
        name: v.name,
        shortName: v.short_name || v.name,
        type: v.type,
        subtitle: v.subtitle || "",
        shortDescription: v.short_description || "",
        description: v.description,
        pricePerNight: priceStr,
        priceUnit: v.price_unit || "USD",
        promotionalPrice: promoStr,
        size: sizeStr,
        sizeSqm: v.size_sqm,
        capacity: v.max_guests || 2,
        maxGuests: v.max_guests || 2,
        bedrooms: v.bedrooms || 1,
        bathrooms: v.bathrooms || 1,
        beds: v.beds_count || 1,
        bed: v.bed_type || "King Bed",
        bathroom: v.bathroom_type || "En-suite",
        view: v.view_type || "Ocean View",
        architecturalFeature: v.architectural_feature || "",
        heroImage: v.hero_image,
        coverImage: v.cover_image || v.hero_image,
        images: imagesList,
        gallery: imagesList,
        status: v.status || "published",
        availability: v.status === "published",
        featured: Boolean(v.featured),
        order: v.sort_order || 0,
        amenities: amenitiesMap.get(v.id) || []
      };
    });
  }
  async getVillaById(id) {
    const villas = await this.getVillas();
    return villas.find((v) => v.id === id) || null;
  }
  async saveVilla(villa, userEmail) {
    const pool = this.getPool();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(
        `INSERT INTO villas 
          (id, name, short_name, type, subtitle, short_description, description, price_per_night, 
           price_unit, promotional_price, size_sqm, max_guests, bedrooms, bathrooms, beds_count, 
           bed_type, bathroom_type, view_type, architectural_feature, hero_image, cover_image, 
           status, featured, sort_order) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE 
           name = VALUES(name), short_name = VALUES(short_name), type = VALUES(type), 
           subtitle = VALUES(subtitle), short_description = VALUES(short_description), 
           description = VALUES(description), price_per_night = VALUES(price_per_night), 
           price_unit = VALUES(price_unit), promotional_price = VALUES(promotional_price), 
           size_sqm = VALUES(size_sqm), max_guests = VALUES(max_guests), bedrooms = VALUES(bedrooms), 
           bathrooms = VALUES(bathrooms), beds_count = VALUES(beds_count), bed_type = VALUES(bed_type), 
           bathroom_type = VALUES(bathroom_type), view_type = VALUES(view_type), 
           architectural_feature = VALUES(architectural_feature), hero_image = VALUES(hero_image), 
           cover_image = VALUES(cover_image), status = VALUES(status), featured = VALUES(featured), 
           sort_order = VALUES(sort_order)`,
        [
          villa.id,
          villa.name,
          villa.shortName || villa.name,
          villa.type,
          villa.subtitle || "",
          villa.shortDescription || "",
          villa.description,
          villa.pricePerNight,
          villa.priceUnit || "USD",
          villa.promotionalPrice || null,
          villa.sizeSqm || 85,
          villa.maxGuests || 2,
          villa.bedrooms || 1,
          villa.bathrooms || 1,
          villa.beds || 1,
          villa.bed || "King Bed",
          villa.bathroom || "En-suite",
          villa.view || "Ocean View",
          villa.architecturalFeature || "",
          villa.heroImage || villa.coverImage || "",
          villa.coverImage || villa.heroImage || "",
          villa.status || "published",
          villa.featured ? 1 : 0,
          villa.order || 0
        ]
      );
      await conn.query("DELETE FROM villa_amenities WHERE villa_id = ?", [villa.id]);
      if (Array.isArray(villa.amenities)) {
        for (let i = 0; i < villa.amenities.length; i++) {
          await conn.query(
            "INSERT INTO villa_amenities (villa_id, amenity_name, sort_order) VALUES (?, ?, ?)",
            [villa.id, villa.amenities[i], i]
          );
        }
      }
      await conn.query("DELETE FROM villa_images WHERE villa_id = ?", [villa.id]);
      if (Array.isArray(villa.gallery)) {
        for (let i = 0; i < villa.gallery.length; i++) {
          await conn.query(
            "INSERT INTO villa_images (villa_id, image_url, sort_order) VALUES (?, ?, ?)",
            [villa.id, villa.gallery[i], i]
          );
        }
      }
      await conn.query(
        "INSERT INTO audit_logs (action, user_email, details) VALUES (?, ?, ?)",
        ["VILLA_SAVED", userEmail, `Saved villa: ${villa.name} (${villa.id})`]
      );
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
    return villa;
  }
  async deleteVilla(id, userEmail) {
    const pool = this.getPool();
    const [result] = await pool.query("DELETE FROM villas WHERE id = ?", [id]);
    if (result.affectedRows > 0) {
      await this.addAuditLog({
        action: "VILLA_DELETED",
        userEmail,
        details: `Deleted villa: ${id}`
      });
      return true;
    }
    return false;
  }
  // --- Gallery ---
  async getGallery() {
    const pool = this.getPool();
    const [rows] = await pool.query("SELECT * FROM gallery_items ORDER BY sort_order ASC");
    return rows.map((r) => ({
      id: r.id,
      category: r.category,
      title: r.title,
      caption: r.caption,
      description: r.description,
      image: r.image_url,
      aspectRatio: r.aspect_ratio || "4/3",
      order: r.sort_order,
      published: Boolean(r.published)
    }));
  }
  async saveGalleryItem(item, userEmail) {
    const pool = this.getPool();
    await pool.query(
      `INSERT INTO gallery_items 
        (id, category, title, caption, description, image_url, aspect_ratio, sort_order, published) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
        category = VALUES(category), title = VALUES(title), caption = VALUES(caption), 
        description = VALUES(description), image_url = VALUES(image_url), aspect_ratio = VALUES(aspect_ratio), 
        sort_order = VALUES(sort_order), published = VALUES(published)`,
      [
        item.id,
        item.category,
        item.title,
        item.caption || item.description || "",
        item.description || item.caption || "",
        item.image,
        item.aspectRatio || "4/3",
        item.order || 0,
        item.published !== false ? 1 : 0
      ]
    );
    await this.addAuditLog({
      action: "GALLERY_SAVED",
      userEmail,
      details: `Saved photograph: ${item.title} (${item.id})`
    });
    return item;
  }
  async deleteGalleryItem(id, userEmail) {
    const pool = this.getPool();
    const [res] = await pool.query("DELETE FROM gallery_items WHERE id = ?", [id]);
    if (res.affectedRows > 0) {
      await this.addAuditLog({ action: "GALLERY_DELETED", userEmail, details: `Removed item ${id}` });
      return true;
    }
    return false;
  }
  // --- Facilities ---
  async getFacilities() {
    const pool = this.getPool();
    const [rows] = await pool.query("SELECT * FROM facilities ORDER BY sort_order ASC");
    return rows.map((f) => ({
      id: f.id,
      title: f.title,
      category: f.category,
      description: f.description,
      hours: f.hours,
      highlight: f.highlight,
      image: f.image_url,
      icon: f.icon,
      order: f.sort_order,
      visible: Boolean(f.visible)
    }));
  }
  async saveFacility(facility, userEmail) {
    const pool = this.getPool();
    await pool.query(
      `INSERT INTO facilities 
        (id, title, category, description, hours, highlight, image_url, icon, sort_order, visible) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
        title = VALUES(title), category = VALUES(category), description = VALUES(description), 
        hours = VALUES(hours), highlight = VALUES(highlight), image_url = VALUES(image_url), 
        icon = VALUES(icon), sort_order = VALUES(sort_order), visible = VALUES(visible)`,
      [
        facility.id,
        facility.title,
        facility.category,
        facility.description,
        facility.hours,
        facility.highlight,
        facility.image,
        facility.icon || "Sparkles",
        facility.order || 0,
        facility.visible !== false ? 1 : 0
      ]
    );
    await this.addAuditLog({
      action: "FACILITY_SAVED",
      userEmail,
      details: `Saved facility: ${facility.title} (${facility.id})`
    });
    return facility;
  }
  // --- Testimonials ---
  async getTestimonials() {
    const pool = this.getPool();
    const [rows] = await pool.query("SELECT * FROM testimonials ORDER BY sort_order ASC");
    return rows.map((t) => ({
      id: t.id,
      guestName: t.guest_name,
      country: t.country,
      avatar: t.avatar_url,
      rating: t.rating,
      stayDate: t.stay_date,
      villaStayed: t.villa_stayed,
      title: t.title,
      reviewText: t.review_text,
      verifiedStay: Boolean(t.verified_stay),
      featured: Boolean(t.featured),
      order: t.sort_order,
      visible: Boolean(t.visible)
    }));
  }
  async saveTestimonial(testimonial, userEmail) {
    const pool = this.getPool();
    await pool.query(
      `INSERT INTO testimonials 
        (id, guest_name, country, avatar_url, rating, stay_date, villa_stayed, title, review_text, verified_stay, featured, sort_order, visible) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
        guest_name = VALUES(guest_name), country = VALUES(country), avatar_url = VALUES(avatar_url), 
        rating = VALUES(rating), stay_date = VALUES(stay_date), villa_stayed = VALUES(villa_stayed), 
        title = VALUES(title), review_text = VALUES(review_text), verified_stay = VALUES(verified_stay), 
        featured = VALUES(featured), sort_order = VALUES(sort_order), visible = VALUES(visible)`,
      [
        testimonial.id,
        testimonial.guestName,
        testimonial.country,
        testimonial.avatar || "",
        testimonial.rating || 5,
        testimonial.stayDate,
        testimonial.villaStayed,
        testimonial.title,
        testimonial.reviewText,
        testimonial.verifiedStay !== false ? 1 : 0,
        testimonial.featured ? 1 : 0,
        testimonial.order || 0,
        testimonial.visible !== false ? 1 : 0
      ]
    );
    await this.addAuditLog({
      action: "TESTIMONIAL_SAVED",
      userEmail,
      details: `Saved review: ${testimonial.guestName} (${testimonial.id})`
    });
    return testimonial;
  }
  async deleteTestimonial(id, userEmail) {
    const pool = this.getPool();
    const [res] = await pool.query("DELETE FROM testimonials WHERE id = ?", [id]);
    if (res.affectedRows > 0) {
      await this.addAuditLog({ action: "TESTIMONIAL_DELETED", userEmail, details: `Removed testimonial ${id}` });
      return true;
    }
    return false;
  }
  // --- Videos ---
  async getVideos() {
    const pool = this.getPool();
    const [rows] = await pool.query("SELECT * FROM video_storyboard WHERE id = 1 LIMIT 1");
    const r = rows[0] || {};
    let scenes = [];
    if (r.scenes_json) {
      try {
        scenes = JSON.parse(r.scenes_json);
      } catch {
      }
    }
    return {
      videoUrl: r.video_url || "https://assets.zanzirangihouse.com/videos/brand-reel-4k.mp4",
      posterImage: r.poster_image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85",
      scenes
    };
  }
  async updateVideos(data, userEmail) {
    const pool = this.getPool();
    const current = await this.getVideos();
    const merged = { ...current, ...data };
    await pool.query(
      `INSERT INTO video_storyboard (id, video_url, poster_image, scenes_json) 
       VALUES (1, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
        video_url = VALUES(video_url), poster_image = VALUES(poster_image), scenes_json = VALUES(scenes_json)`,
      [merged.videoUrl, merged.posterImage, JSON.stringify(merged.scenes || [])]
    );
    await this.addAuditLog({
      action: "VIDEOS_UPDATED",
      userEmail,
      details: "Updated 4K cinematic film & storyboard scenes"
    });
    return merged;
  }
  // --- SEO ---
  async getSeo() {
    const pool = this.getPool();
    const [rows] = await pool.query("SELECT * FROM seo_routes");
    const routes = {};
    for (const r of rows) {
      routes[r.route_path] = {
        title: r.title,
        description: r.description,
        canonical: r.canonical_url,
        ogTitle: r.og_title,
        ogDescription: r.og_description,
        ogImage: r.og_image,
        robots: r.robots
      };
    }
    return {
      siteTitle: "Zanzibar Luxury Villa - Zanzirangi House | Private Pool Retreat",
      defaultOgImage: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2400&q=90",
      routes
    };
  }
  async updateSeo(data, userEmail) {
    const pool = this.getPool();
    if (data.routes) {
      for (const [routePath, r] of Object.entries(data.routes)) {
        await pool.query(
          `INSERT INTO seo_routes 
            (route_path, title, description, canonical_url, og_title, og_description, og_image, robots) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
           ON DUPLICATE KEY UPDATE 
            title = VALUES(title), description = VALUES(description), canonical_url = VALUES(canonical_url), 
            og_title = VALUES(og_title), og_description = VALUES(og_description), og_image = VALUES(og_image), 
            robots = VALUES(robots)`,
          [
            routePath,
            r.title,
            r.description || "",
            r.canonical || "",
            r.ogTitle || r.title || "",
            r.ogDescription || r.description || "",
            r.ogImage || "",
            r.robots || "index, follow"
          ]
        );
      }
    }
    await this.addAuditLog({
      action: "SEO_UPDATED",
      userEmail,
      details: "Updated SERP metadata routes"
    });
    return this.getSeo();
  }
  // --- Media ---
  async getMedia() {
    const pool = this.getPool();
    const [rows] = await pool.query("SELECT * FROM media_assets ORDER BY created_at DESC");
    return rows.map((m) => ({
      id: m.id,
      filename: m.filename,
      url: m.url || m.public_url,
      mimeType: m.mime_type,
      sizeBytes: Number(m.size_bytes || m.size || 0),
      width: m.width,
      height: m.height,
      altText: m.alt_text,
      caption: m.caption,
      createdAt: m.created_at ? new Date(m.created_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
      usageCount: m.usage_count || 0
    }));
  }
  async saveMedia(asset, userEmail) {
    const pool = this.getPool();
    await pool.query(
      `INSERT INTO media_assets 
        (id, filename, original_filename, url, public_url, mime_type, size, size_bytes, width, height, alt_text, title, caption, usage_count) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
        filename = VALUES(filename), url = VALUES(url), public_url = VALUES(public_url), mime_type = VALUES(mime_type), 
        size = VALUES(size), size_bytes = VALUES(size_bytes), width = VALUES(width), height = VALUES(height), 
        alt_text = VALUES(alt_text), title = VALUES(title), caption = VALUES(caption), usage_count = VALUES(usage_count)`,
      [
        asset.id,
        asset.filename,
        asset.filename,
        asset.url,
        asset.url,
        asset.mimeType,
        asset.sizeBytes,
        asset.sizeBytes,
        asset.width || null,
        asset.height || null,
        asset.altText || "",
        asset.altText || asset.filename,
        asset.caption || "",
        asset.usageCount || asset.referenceCount || 0
      ]
    );
    await this.addAuditLog({
      action: "MEDIA_SAVED",
      userEmail,
      details: `Saved media asset: ${asset.filename}`
    });
    return asset;
  }
  async deleteMedia(id, userEmail) {
    const pool = this.getPool();
    const [res] = await pool.query("DELETE FROM media_assets WHERE id = ?", [id]);
    if (res.affectedRows > 0) {
      await this.addAuditLog({ action: "MEDIA_DELETED", userEmail, details: `Deleted media ID ${id}` });
      return true;
    }
    return false;
  }
  // --- Settings ---
  async getSettings() {
    const pool = this.getPool();
    const [rows] = await pool.query("SELECT * FROM site_settings WHERE id = 1 LIMIT 1");
    const r = rows[0] || {};
    return {
      siteName: r.site_name || "Zanzirangi House",
      tagline: r.tagline || "Private Luxury Villas & Sanctuary in Kizimkazi, Zanzibar",
      defaultCurrency: r.default_currency || "USD ($)",
      currency: r.currency || "USD",
      defaultLanguage: r.default_language || "en",
      phone: r.phone || r.concierge_phone || "+255 777 890 123",
      conciergePhone: r.concierge_phone || "+255 777 890 123",
      whatsapp: r.whatsapp || "+255 777 890 123",
      email: r.email || "info@zanzirangihouse.com",
      reservationNotificationEmail: r.reservation_notification_email || "reservations@zanzirangihouse.com",
      reservationEmail: r.reservation_email || r.reservation_notification_email || "reservations@zanzirangihouse.com",
      address: r.address || "Kizimkazi Dimbani, South Coast, Zanzibar, Tanzania",
      instagram: r.instagram || "https://instagram.com/zanzirangi.house",
      facebook: r.facebook || "https://facebook.com/zanzirangihouse",
      youtube: r.youtube || "https://youtube.com/@zanzirangihouse",
      bookingUrl: r.booking_url || "https://zanzirangihouse.com/#stay",
      logo: r.logo || "/src/assets/zanzirangi-logo-new.jpeg",
      favicon: r.favicon || "/favicon.svg",
      maintenanceMode: Boolean(r.maintenance_mode)
    };
  }
  async updateSettings(data, userEmail) {
    const pool = this.getPool();
    const current = await this.getSettings();
    const merged = { ...current, ...data };
    await pool.query(
      `INSERT INTO site_settings 
        (id, site_name, tagline, phone, concierge_phone, whatsapp, email, reservation_notification_email, 
         reservation_email, address, instagram, facebook, youtube, booking_url, currency, default_currency, 
         default_language, logo, favicon, maintenance_mode) 
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
        site_name = VALUES(site_name), tagline = VALUES(tagline), phone = VALUES(phone), 
        concierge_phone = VALUES(concierge_phone), whatsapp = VALUES(whatsapp), email = VALUES(email), 
        reservation_notification_email = VALUES(reservation_notification_email), 
        reservation_email = VALUES(reservation_email), address = VALUES(address), 
        instagram = VALUES(instagram), facebook = VALUES(facebook), youtube = VALUES(youtube), 
        booking_url = VALUES(booking_url), currency = VALUES(currency), default_currency = VALUES(default_currency), 
        default_language = VALUES(default_language), logo = VALUES(logo), favicon = VALUES(favicon), 
        maintenance_mode = VALUES(maintenance_mode)`,
      [
        merged.siteName || "Zanzirangi House",
        merged.tagline || "",
        merged.phone || merged.conciergePhone || "+255 777 890 123",
        merged.conciergePhone || "+255 777 890 123",
        merged.whatsapp || "+255 777 890 123",
        merged.email || "info@zanzirangihouse.com",
        merged.reservationNotificationEmail || "reservations@zanzirangihouse.com",
        merged.reservationEmail || merged.reservationNotificationEmail || "reservations@zanzirangihouse.com",
        merged.address || "Kizimkazi Dimbani, South Coast, Zanzibar, Tanzania",
        merged.instagram || "https://instagram.com/zanzirangi.house",
        merged.facebook || "https://facebook.com/zanzirangihouse",
        merged.youtube || "https://youtube.com/@zanzirangihouse",
        merged.bookingUrl || "https://zanzirangihouse.com/#stay",
        merged.currency || "USD",
        merged.defaultCurrency || "USD ($)",
        merged.defaultLanguage || "en",
        merged.logo || "/src/assets/zanzirangi-logo-new.jpeg",
        merged.favicon || "/favicon.svg",
        merged.maintenanceMode ? 1 : 0
      ]
    );
    await this.addAuditLog({
      action: "SETTINGS_UPDATED",
      userEmail,
      details: "Updated sanctuary site settings"
    });
    return this.getSettings();
  }
  // --- Users & Auth ---
  async findUserByEmail(email) {
    const pool = this.getPool();
    const [rows] = await pool.query("SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1", [
      email.trim().toLowerCase()
    ]);
    if (!rows || rows.length === 0) return null;
    const u = rows[0];
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      passwordHash: u.password_hash,
      createdAt: u.created_at ? new Date(u.created_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
      lastLogin: u.last_login ? new Date(u.last_login).toISOString() : void 0
    };
  }
  async saveUser(user) {
    const pool = this.getPool();
    await pool.query(
      `INSERT INTO users (id, email, name, role, password_hash, created_at, last_login) 
       VALUES (?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
        name = VALUES(name), role = VALUES(role), password_hash = VALUES(password_hash), 
        last_login = VALUES(last_login)`,
      [
        user.id,
        user.email.toLowerCase(),
        user.name,
        user.role,
        user.passwordHash,
        user.createdAt || /* @__PURE__ */ new Date(),
        user.lastLogin || null
      ]
    );
  }
  async listUsers() {
    const pool = this.getPool();
    const [rows] = await pool.query("SELECT id, email, name, role, created_at, last_login FROM users");
    return rows.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.created_at ? new Date(u.created_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
      lastLogin: u.last_login ? new Date(u.last_login).toISOString() : void 0
    }));
  }
  // --- Audit Logs ---
  async getAuditLogs(limit = 20) {
    const pool = this.getPool();
    const [rows] = await pool.query("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?", [limit]);
    return rows.map((a) => ({
      id: String(a.id),
      action: a.action,
      userEmail: a.user_email,
      details: a.details,
      ipAddress: a.ip_address,
      timestamp: a.created_at ? new Date(a.created_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString()
    }));
  }
  async addAuditLog(entry) {
    const pool = this.getPool();
    await pool.query("INSERT INTO audit_logs (action, user_email, details, ip_address) VALUES (?, ?, ?, ?)", [
      entry.action,
      entry.userEmail,
      entry.details || null,
      entry.ipAddress || null
    ]);
  }
  // --- Dashboard Stats ---
  async getDashboardStats() {
    const pool = this.getPool();
    const [villasCount] = await pool.query('SELECT COUNT(*) as total, SUM(CASE WHEN status="published" THEN 1 ELSE 0 END) as pub FROM villas');
    const [galleryCount] = await pool.query("SELECT COUNT(*) as total FROM gallery_items");
    const [facilitiesCount] = await pool.query("SELECT COUNT(*) as total FROM facilities");
    const [testimonialsCount] = await pool.query("SELECT COUNT(*) as total FROM testimonials");
    const [mediaCount] = await pool.query("SELECT COUNT(*) as total FROM media_assets");
    const [hpMeta] = await pool.query("SELECT meta_last_updated, meta_updated_by FROM homepage_config WHERE id = 1");
    const recentLogs = await this.getAuditLogs(10);
    const meta = hpMeta[0] || {};
    return {
      status: "Connected",
      lastPublished: meta.meta_last_updated ? new Date(meta.meta_last_updated).toISOString() : null,
      publishedBy: meta.meta_updated_by || null,
      counts: {
        villasPublished: Number(villasCount[0]?.pub || 0),
        villasTotal: Number(villasCount[0]?.total || 0),
        galleryItems: Number(galleryCount[0]?.total || 0),
        facilities: Number(facilitiesCount[0]?.total || 0),
        testimonials: Number(testimonialsCount[0]?.total || 0),
        mediaAssets: Number(mediaCount[0]?.total || 0)
      },
      recentUpdates: recentLogs.map((l) => ({
        action: l.action,
        userEmail: l.userEmail,
        timestamp: l.timestamp,
        details: l.details
      }))
    };
  }
};

// server/database/index.ts
init_env();
init_connection();

// server/database/repositories/homepageRepository.ts
var HomepageRepository = class {
  async getHomepage() {
    return getDatabaseAdapter().getHomepage();
  }
  async updateHomepage(data, userEmail) {
    return getDatabaseAdapter().updateHomepage(data, userEmail);
  }
};
var homepageRepository = new HomepageRepository();

// server/database/repositories/villasRepository.ts
var VillasRepository = class {
  async getAll() {
    return getDatabaseAdapter().getVillas();
  }
  async getById(id) {
    return getDatabaseAdapter().getVillaById(id);
  }
  async save(villa, userEmail) {
    return getDatabaseAdapter().saveVilla(villa, userEmail);
  }
  async delete(id, userEmail) {
    return getDatabaseAdapter().deleteVilla(id, userEmail);
  }
};
var villasRepository = new VillasRepository();

// server/database/repositories/galleryRepository.ts
var GalleryRepository = class {
  async getAll() {
    return getDatabaseAdapter().getGallery();
  }
  async save(item, userEmail) {
    return getDatabaseAdapter().saveGalleryItem(item, userEmail);
  }
  async delete(id, userEmail) {
    return getDatabaseAdapter().deleteGalleryItem(id, userEmail);
  }
};
var galleryRepository = new GalleryRepository();

// server/database/repositories/videosRepository.ts
var VideosRepository = class {
  async get() {
    return getDatabaseAdapter().getVideos();
  }
  async update(data, userEmail) {
    return getDatabaseAdapter().updateVideos(data, userEmail);
  }
};
var videosRepository = new VideosRepository();

// server/database/repositories/facilitiesRepository.ts
var FacilitiesRepository = class {
  async getAll() {
    return getDatabaseAdapter().getFacilities();
  }
  async save(facility, userEmail) {
    return getDatabaseAdapter().saveFacility(facility, userEmail);
  }
};
var facilitiesRepository = new FacilitiesRepository();

// server/database/repositories/testimonialsRepository.ts
var TestimonialsRepository = class {
  async getAll() {
    return getDatabaseAdapter().getTestimonials();
  }
  async save(testimonial, userEmail) {
    return getDatabaseAdapter().saveTestimonial(testimonial, userEmail);
  }
  async delete(id, userEmail) {
    return getDatabaseAdapter().deleteTestimonial(id, userEmail);
  }
};
var testimonialsRepository = new TestimonialsRepository();

// server/database/repositories/contactRepository.ts
var ContactRepository = class {
  async getContactInfo() {
    const settings = await getDatabaseAdapter().getSettings();
    return {
      phone: settings.phone || settings.conciergePhone || "+255 777 890 123",
      conciergePhone: settings.conciergePhone || "+255 777 890 123",
      whatsapp: settings.whatsapp || "+255 777 890 123",
      email: settings.email || "info@zanzirangihouse.com",
      reservationEmail: settings.reservationEmail || settings.reservationNotificationEmail || "reservations@zanzirangihouse.com",
      address: settings.address || "Kizimkazi Dimbani, South Coast, Zanzibar, Tanzania",
      bookingUrl: settings.bookingUrl || "https://zanzirangihouse.com/#stay",
      instagram: settings.instagram || "https://instagram.com/zanzirangi.house",
      facebook: settings.facebook || "https://facebook.com/zanzirangihouse",
      youtube: settings.youtube || "https://youtube.com/@zanzirangihouse"
    };
  }
  async updateContactInfo(data, userEmail) {
    const updatedSettings = await getDatabaseAdapter().updateSettings(
      {
        phone: data.phone,
        conciergePhone: data.conciergePhone || data.phone,
        whatsapp: data.whatsapp,
        email: data.email,
        reservationEmail: data.reservationEmail,
        reservationNotificationEmail: data.reservationEmail,
        address: data.address,
        bookingUrl: data.bookingUrl,
        instagram: data.instagram,
        facebook: data.facebook,
        youtube: data.youtube
      },
      userEmail
    );
    return {
      phone: updatedSettings.phone || updatedSettings.conciergePhone,
      conciergePhone: updatedSettings.conciergePhone,
      whatsapp: updatedSettings.whatsapp || "+255 777 890 123",
      email: updatedSettings.email || "info@zanzirangihouse.com",
      reservationEmail: updatedSettings.reservationEmail || updatedSettings.reservationNotificationEmail,
      address: updatedSettings.address || "",
      bookingUrl: updatedSettings.bookingUrl || "",
      instagram: updatedSettings.instagram || "",
      facebook: updatedSettings.facebook || "",
      youtube: updatedSettings.youtube || ""
    };
  }
};
var contactRepository = new ContactRepository();

// server/database/repositories/seoRepository.ts
var SeoRepository = class {
  async getSeo() {
    return getDatabaseAdapter().getSeo();
  }
  async updateSeo(data, userEmail) {
    return getDatabaseAdapter().updateSeo(data, userEmail);
  }
};
var seoRepository = new SeoRepository();

// server/database/repositories/mediaRepository.ts
var MediaRepository = class {
  async getAll() {
    return getDatabaseAdapter().getMedia();
  }
  async save(asset, userEmail) {
    return getDatabaseAdapter().saveMedia(asset, userEmail);
  }
  async delete(id, userEmail) {
    return getDatabaseAdapter().deleteMedia(id, userEmail);
  }
};
var mediaRepository = new MediaRepository();

// server/database/repositories/settingsRepository.ts
var SettingsRepository = class {
  async getSettings() {
    return getDatabaseAdapter().getSettings();
  }
  async updateSettings(data, userEmail) {
    return getDatabaseAdapter().updateSettings(data, userEmail);
  }
};
var settingsRepository = new SettingsRepository();

// server/database/repositories/usersRepository.ts
var UsersRepository = class {
  async findByEmail(email) {
    return getDatabaseAdapter().findUserByEmail(email);
  }
  async save(user) {
    return getDatabaseAdapter().saveUser(user);
  }
  async list() {
    return getDatabaseAdapter().listUsers();
  }
};
var usersRepository = new UsersRepository();

// server/database/repositories/auditRepository.ts
var AuditRepository = class {
  async getLogs(limit = 50) {
    return getDatabaseAdapter().getAuditLogs(limit);
  }
  async log(entry) {
    return getDatabaseAdapter().addAuditLog(entry);
  }
};
var auditRepository = new AuditRepository();

// server/database/repositories/supportRepository.ts
init_connection();
function toIso(val) {
  if (!val) return (/* @__PURE__ */ new Date()).toISOString();
  if (val instanceof Date) return val.toISOString();
  try {
    return new Date(val).toISOString();
  } catch {
    return (/* @__PURE__ */ new Date()).toISOString();
  }
}
function parseJson(val) {
  if (val === null || val === void 0) return null;
  if (typeof val === "object") return val;
  try {
    return JSON.parse(val);
  } catch {
    return null;
  }
}
var SupportRepository = class {
  // -------------------------------------------------------------
  // Conversations
  // -------------------------------------------------------------
  async getConversations(filter) {
    const pool = getMysqlPool();
    let query = `
      SELECT 
        c.*,
        COUNT(m.id) as message_count,
        (
          SELECT m2.message 
          FROM support_messages m2 
          WHERE m2.conversation_id = c.id 
          ORDER BY m2.created_at DESC 
          LIMIT 1
        ) as last_message_text
      FROM support_conversations c
      LEFT JOIN support_messages m ON m.conversation_id = c.id
      WHERE 1=1
    `;
    const params = [];
    if (filter?.status && filter.status !== "ALL") {
      query += " AND c.status = ?";
      params.push(filter.status);
    }
    if (filter?.search) {
      const q = `%${filter.search.trim().toLowerCase()}%`;
      query += ` AND (
        LOWER(c.id) LIKE ? OR 
        LOWER(c.visitor_id) LIKE ? OR 
        LOWER(JSON_UNQUOTE(JSON_EXTRACT(c.metadata, '$.fullName'))) LIKE ? OR
        LOWER(JSON_UNQUOTE(JSON_EXTRACT(c.metadata, '$.email'))) LIKE ? OR
        LOWER(JSON_UNQUOTE(JSON_EXTRACT(c.metadata, '$.villaName'))) LIKE ?
      )`;
      params.push(q, q, q, q, q);
    }
    query += " GROUP BY c.id ORDER BY c.last_message_at DESC";
    if (filter?.limit && filter.limit > 0) {
      query += " LIMIT ?";
      params.push(Number(filter.limit));
    }
    const [rows] = await pool.query(query, params);
    return rows.map((r) => ({
      id: r.id,
      visitor_id: r.visitor_id,
      session_id: r.session_id,
      status: r.status,
      language: r.language || "en",
      assigned_admin_id: r.assigned_admin_id || null,
      current_page: r.current_page || "/",
      booking_id: r.booking_id || null,
      metadata: parseJson(r.metadata),
      created_at: toIso(r.created_at),
      updated_at: toIso(r.updated_at),
      last_message_at: toIso(r.last_message_at),
      messageCount: Number(r.message_count || 0),
      lastMessageText: r.last_message_text || void 0
    }));
  }
  async getConversationById(id) {
    const pool = getMysqlPool();
    const [rows] = await pool.query(
      "SELECT * FROM support_conversations WHERE id = ? LIMIT 1",
      [id]
    );
    if (!rows || rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      visitor_id: r.visitor_id,
      session_id: r.session_id,
      status: r.status,
      language: r.language || "en",
      assigned_admin_id: r.assigned_admin_id || null,
      current_page: r.current_page || "/",
      booking_id: r.booking_id || null,
      metadata: parseJson(r.metadata),
      created_at: toIso(r.created_at),
      updated_at: toIso(r.updated_at),
      last_message_at: toIso(r.last_message_at)
    };
  }
  async getActiveConversationByVisitor(visitorId) {
    const pool = getMysqlPool();
    const [rows] = await pool.query(
      `SELECT * FROM support_conversations 
       WHERE visitor_id = ? AND status NOT IN ('CLOSED', 'RESOLVED')
       ORDER BY last_message_at DESC 
       LIMIT 1`,
      [visitorId]
    );
    if (rows && rows.length > 0) {
      const r2 = rows[0];
      return {
        id: r2.id,
        visitor_id: r2.visitor_id,
        session_id: r2.session_id,
        status: r2.status,
        language: r2.language || "en",
        assigned_admin_id: r2.assigned_admin_id || null,
        current_page: r2.current_page || "/",
        booking_id: r2.booking_id || null,
        metadata: parseJson(r2.metadata),
        created_at: toIso(r2.created_at),
        updated_at: toIso(r2.updated_at),
        last_message_at: toIso(r2.last_message_at)
      };
    }
    const [fallbackRows] = await pool.query(
      `SELECT * FROM support_conversations 
       WHERE visitor_id = ? 
       ORDER BY last_message_at DESC 
       LIMIT 1`,
      [visitorId]
    );
    if (!fallbackRows || fallbackRows.length === 0) return null;
    const r = fallbackRows[0];
    return {
      id: r.id,
      visitor_id: r.visitor_id,
      session_id: r.session_id,
      status: r.status,
      language: r.language || "en",
      assigned_admin_id: r.assigned_admin_id || null,
      current_page: r.current_page || "/",
      booking_id: r.booking_id || null,
      metadata: parseJson(r.metadata),
      created_at: toIso(r.created_at),
      updated_at: toIso(r.updated_at),
      last_message_at: toIso(r.last_message_at)
    };
  }
  async createConversation(data) {
    const pool = getMysqlPool();
    const id = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const status = data.status || "AI_ACTIVE";
    const language = data.language || "en";
    const currentPage = data.current_page || "/";
    const bookingId = data.booking_id || null;
    const metadataStr = data.metadata ? JSON.stringify(data.metadata) : null;
    await pool.query(
      `INSERT INTO support_conversations 
        (id, visitor_id, session_id, status, language, current_page, booking_id, metadata, created_at, updated_at, last_message_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [id, data.visitor_id, data.session_id, status, language, currentPage, bookingId, metadataStr]
    );
    const created = await this.getConversationById(id);
    return created;
  }
  async updateConversation(id, updates) {
    const pool = getMysqlPool();
    const setClauses = [];
    const params = [];
    if (updates.status !== void 0) {
      setClauses.push("status = ?");
      params.push(updates.status);
    }
    if (updates.language !== void 0) {
      setClauses.push("language = ?");
      params.push(updates.language);
    }
    if (updates.assigned_admin_id !== void 0) {
      setClauses.push("assigned_admin_id = ?");
      params.push(updates.assigned_admin_id);
    }
    if (updates.current_page !== void 0) {
      setClauses.push("current_page = ?");
      params.push(updates.current_page);
    }
    if (updates.booking_id !== void 0) {
      setClauses.push("booking_id = ?");
      params.push(updates.booking_id);
    }
    if (updates.metadata !== void 0) {
      setClauses.push("metadata = ?");
      params.push(updates.metadata ? JSON.stringify(updates.metadata) : null);
    }
    if (updates.last_message_at !== void 0) {
      setClauses.push("last_message_at = ?");
      params.push(new Date(updates.last_message_at));
    }
    setClauses.push("updated_at = CURRENT_TIMESTAMP");
    if (setClauses.length === 1) {
      return this.getConversationById(id);
    }
    params.push(id);
    await pool.query(
      `UPDATE support_conversations SET ${setClauses.join(", ")} WHERE id = ?`,
      params
    );
    return this.getConversationById(id);
  }
  // -------------------------------------------------------------
  // Messages
  // -------------------------------------------------------------
  async getMessages(conversationId) {
    const pool = getMysqlPool();
    const [rows] = await pool.query(
      "SELECT * FROM support_messages WHERE conversation_id = ? ORDER BY created_at ASC",
      [conversationId]
    );
    return rows.map((r) => ({
      id: r.id,
      conversation_id: r.conversation_id,
      sender_type: r.sender_type,
      sender_id: r.sender_id,
      message: r.message,
      message_type: r.message_type || "TEXT",
      ai_confidence: r.ai_confidence !== null && r.ai_confidence !== void 0 ? parseFloat(r.ai_confidence) : null,
      metadata: parseJson(r.metadata),
      created_at: toIso(r.created_at)
    }));
  }
  async createMessage(data) {
    const pool = getMysqlPool();
    const id = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const messageType = data.message_type || "TEXT";
    const confidence = data.ai_confidence !== void 0 ? data.ai_confidence : null;
    const metadataStr = data.metadata ? JSON.stringify(data.metadata) : null;
    await pool.query(
      `INSERT INTO support_messages 
        (id, conversation_id, sender_type, sender_id, message, message_type, ai_confidence, metadata, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [id, data.conversation_id, data.sender_type, data.sender_id, data.message, messageType, confidence, metadataStr]
    );
    await pool.query(
      "UPDATE support_conversations SET last_message_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [data.conversation_id]
    );
    return {
      id,
      conversation_id: data.conversation_id,
      sender_type: data.sender_type,
      sender_id: data.sender_id,
      message: data.message,
      message_type: messageType,
      ai_confidence: confidence,
      metadata: data.metadata || null,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  // -------------------------------------------------------------
  // Knowledge Base
  // -------------------------------------------------------------
  async getKnowledgeBase(filter) {
    const pool = getMysqlPool();
    let query = "SELECT * FROM support_knowledge_base WHERE 1=1";
    const params = [];
    if (filter?.category && filter.category !== "ALL") {
      query += " AND LOWER(category) = LOWER(?)";
      params.push(filter.category);
    }
    if (filter?.language && filter.language !== "ALL") {
      query += ' AND (language = ? OR language = "all")';
      params.push(filter.language);
    }
    if (filter?.status && filter.status !== "ALL") {
      query += " AND status = ?";
      params.push(filter.status);
    }
    if (filter?.search) {
      const q = `%${filter.search.trim().toLowerCase()}%`;
      query += " AND (LOWER(question) LIKE ? OR LOWER(answer) LIKE ?)";
      params.push(q, q);
    }
    query += " ORDER BY updated_at DESC";
    const [rows] = await pool.query(query, params);
    return rows.map((r) => ({
      id: r.id,
      question: r.question,
      answer: r.answer,
      category: r.category || "General",
      language: r.language || "en",
      status: r.status,
      source: r.source,
      created_at: toIso(r.created_at),
      updated_at: toIso(r.updated_at)
    }));
  }
  async getKnowledgeItem(id) {
    const pool = getMysqlPool();
    const [rows] = await pool.query(
      "SELECT * FROM support_knowledge_base WHERE id = ? LIMIT 1",
      [id]
    );
    if (!rows || rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      question: r.question,
      answer: r.answer,
      category: r.category || "General",
      language: r.language || "en",
      status: r.status,
      source: r.source,
      created_at: toIso(r.created_at),
      updated_at: toIso(r.updated_at)
    };
  }
  async saveKnowledgeItem(data) {
    const pool = getMysqlPool();
    const id = data.id || `kb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const category = data.category || "General";
    const language = data.language || "en";
    const status = data.status || "PUBLISHED";
    const source = data.source || "MANUAL";
    await pool.query(
      `INSERT INTO support_knowledge_base 
        (id, question, answer, category, language, status, source, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE 
        question = VALUES(question),
        answer = VALUES(answer),
        category = VALUES(category),
        language = VALUES(language),
        status = VALUES(status),
        source = VALUES(source),
        updated_at = CURRENT_TIMESTAMP`,
      [id, data.question.trim(), data.answer.trim(), category, language, status, source]
    );
    const saved = await this.getKnowledgeItem(id);
    return saved;
  }
  async deleteKnowledgeItem(id) {
    const pool = getMysqlPool();
    const [res] = await pool.query(
      "DELETE FROM support_knowledge_base WHERE id = ?",
      [id]
    );
    return res.affectedRows > 0;
  }
  // -------------------------------------------------------------
  // AI Events & Audit Trail
  // -------------------------------------------------------------
  async logAiEvent(data) {
    const pool = getMysqlPool();
    const id = `aie_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await pool.query(
      `INSERT INTO support_ai_events 
        (id, conversation_id, message_id, intent, confidence, knowledge_source, decision, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [id, data.conversation_id, data.message_id, data.intent, data.confidence, data.knowledge_source, data.decision]
    );
    return {
      id,
      conversation_id: data.conversation_id,
      message_id: data.message_id,
      intent: data.intent,
      confidence: data.confidence,
      knowledge_source: data.knowledge_source,
      decision: data.decision,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  async getAiEvents(conversationId) {
    const pool = getMysqlPool();
    const [rows] = await pool.query(
      "SELECT * FROM support_ai_events WHERE conversation_id = ? ORDER BY created_at ASC",
      [conversationId]
    );
    return rows.map((r) => ({
      id: r.id,
      conversation_id: r.conversation_id,
      message_id: r.message_id,
      intent: r.intent,
      confidence: parseFloat(r.confidence),
      knowledge_source: r.knowledge_source,
      decision: r.decision,
      created_at: toIso(r.created_at)
    }));
  }
  // -------------------------------------------------------------
  // Analytics
  // -------------------------------------------------------------
  async getAnalytics() {
    const pool = getMysqlPool();
    const [convRows] = await pool.query("SELECT status, assigned_admin_id FROM support_conversations");
    const [eventRows] = await pool.query("SELECT intent FROM support_ai_events");
    const totalConversations = convRows.length;
    const aiResolved = convRows.filter((c) => c.status === "RESOLVED" && !c.assigned_admin_id).length;
    const humanAssisted = convRows.filter((c) => c.assigned_admin_id || c.status === "HUMAN_ACTIVE").length;
    const waiting = convRows.filter((c) => c.status === "WAITING_HUMAN").length;
    const unresolved = convRows.filter((c) => c.status !== "RESOLVED" && c.status !== "CLOSED").length;
    const aiResolutionRate = totalConversations > 0 ? Math.round(aiResolved / totalConversations * 100) : 0;
    const categoryCounts = {
      "Check-in": 0,
      "Pricing": 0,
      "Villa": 0,
      "Airport Transfer": 0,
      "Safari": 0,
      "Dining": 0,
      "Wi-Fi": 0,
      "Wellness": 0,
      "Family": 0,
      "Other": 0
    };
    eventRows.forEach((e) => {
      const intent = (e.intent || "").toLowerCase();
      if (intent.includes("checkin") || intent.includes("checkout") || intent.includes("time")) {
        categoryCounts["Check-in"]++;
      } else if (intent.includes("price") || intent.includes("rate") || intent.includes("payment")) {
        categoryCounts["Pricing"]++;
      } else if (intent.includes("villa") || intent.includes("room") || intent.includes("pool")) {
        categoryCounts["Villa"]++;
      } else if (intent.includes("airport") || intent.includes("transfer") || intent.includes("shuttle")) {
        categoryCounts["Airport Transfer"]++;
      } else if (intent.includes("safari") || intent.includes("serengeti") || intent.includes("ngorongoro")) {
        categoryCounts["Safari"]++;
      } else if (intent.includes("din") || intent.includes("food") || intent.includes("breakfast")) {
        categoryCounts["Dining"]++;
      } else if (intent.includes("wifi") || intent.includes("internet") || intent.includes("starlink")) {
        categoryCounts["Wi-Fi"]++;
      } else if (intent.includes("spa") || intent.includes("wellness") || intent.includes("massage")) {
        categoryCounts["Wellness"]++;
      } else if (intent.includes("family") || intent.includes("children") || intent.includes("kid")) {
        categoryCounts["Family"]++;
      } else {
        categoryCounts["Other"]++;
      }
    });
    const totalCategoryHits = Object.values(categoryCounts).reduce((a, b) => a + b, 0) || 1;
    const categories = Object.entries(categoryCounts).map(([cat, count]) => ({
      category: cat,
      count,
      percentage: Math.round(count / totalCategoryHits * 100)
    }));
    return {
      totalConversations,
      aiResolved,
      humanAssisted,
      waiting,
      unresolved,
      aiResolutionRate,
      avgAiResponseTimeSec: 0.8,
      avgHumanResponseTimeMin: 4.2,
      categories
    };
  }
};
var supportRepository = new SupportRepository();

// server/database/index.ts
var adapterInstance = null;
function getDatabaseAdapter() {
  if (!adapterInstance) {
    if (env.DATABASE_PROVIDER === "mysql") {
      adapterInstance = new MysqlDatabaseAdapter();
    } else {
      if (env.NODE_ENV === "production") {
        throw new Error("\u{1F4A5} CRITICAL: JsonDatabaseAdapter cannot be instantiated in production mode. Set DATABASE_PROVIDER=mysql.");
      }
      adapterInstance = new JsonDatabaseAdapter();
    }
  }
  return adapterInstance;
}

// server/auth.ts
import jwt from "jsonwebtoken";
import bcrypt2 from "bcryptjs";
init_env();
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN || "7d" }
  );
}
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
}
async function authenticateAdmin(req, res, next) {
  let token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  } else if (req.cookies && req.cookies.zanzirangi_admin_token) {
    token = req.cookies.zanzirangi_admin_token;
  }
  if (!token) {
    res.status(401).json({
      success: false,
      error: "Authentication required. Please log in to Zanzirangi CMS."
    });
    return;
  }
  const user = verifyToken(token);
  if (!user) {
    res.status(401).json({
      success: false,
      error: "Invalid or expired session. Please log in again."
    });
    return;
  }
  try {
    const dbUser = await getDatabaseAdapter().findUserByEmail(user.email);
    if (!dbUser) {
      res.status(403).json({
        success: false,
        error: "User account is no longer authorized."
      });
      return;
    }
    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role
    };
    next();
  } catch (err) {
    console.error("Authentication verification error:", err.message);
    res.status(500).json({ success: false, error: "Database verification failed." });
  }
}
async function loginUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await getDatabaseAdapter().findUserByEmail(normalizedEmail);
  if (!user) {
    return { success: false, error: "Invalid email or password." };
  }
  const isMatch = await bcrypt2.compare(password, user.passwordHash);
  if (!isMatch) {
    return { success: false, error: "Invalid email or password." };
  }
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };
  const token = generateToken(payload);
  return {
    success: true,
    user: payload,
    token
  };
}

// server/storage/LocalMediaStorage.ts
init_env();
import fs2 from "fs";
import path3 from "path";
import crypto2 from "crypto";
var ALLOWED_MIME_TYPES = /* @__PURE__ */ new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/avif",
  "video/mp4",
  "video/webm",
  "application/pdf"
]);
var FORBIDDEN_EXTENSIONS = /* @__PURE__ */ new Set([
  ".php",
  ".phtml",
  ".php3",
  ".php4",
  ".php5",
  ".phps",
  ".js",
  ".cjs",
  ".mjs",
  ".ts",
  ".sh",
  ".bash",
  ".exe",
  ".bat",
  ".cmd",
  ".py",
  ".pl",
  ".cgi",
  ".htaccess",
  ".env"
]);
var LocalMediaStorage = class {
  constructor(customStorageDir) {
    this.storageDir = customStorageDir || env.MEDIA_STORAGE_PATH || path3.resolve(process.cwd(), "uploads");
    this.ensureDirectoryExists();
  }
  ensureDirectoryExists() {
    if (!fs2.existsSync(this.storageDir)) {
      fs2.mkdirSync(this.storageDir, { recursive: true });
    }
  }
  getStorageDirectory() {
    return this.storageDir;
  }
  getStoragePath() {
    return this.storageDir;
  }
  async saveFile(buffer, originalName, mimeType) {
    this.ensureDirectoryExists();
    const ext = path3.extname(originalName).toLowerCase();
    if (FORBIDDEN_EXTENSIONS.has(ext)) {
      throw new Error(`Security Exception: Uploading files with extension '${ext}' is strictly prohibited.`);
    }
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new Error(`Security Exception: MIME type '${mimeType}' is not permitted.`);
    }
    const maxBytes = env.MAX_UPLOAD_SIZE_MB * 1024 * 1024;
    if (buffer.length > maxBytes) {
      throw new Error(`File size (${(buffer.length / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of ${env.MAX_UPLOAD_SIZE_MB}MB.`);
    }
    const hash = crypto2.randomBytes(16).toString("hex");
    const safeBaseName = path3.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 32);
    const uniqueFilename = `${safeBaseName}_${Date.now()}_${hash.substring(0, 8)}${ext}`;
    const destinationPath = path3.resolve(this.storageDir, uniqueFilename);
    if (!destinationPath.startsWith(path3.resolve(this.storageDir))) {
      throw new Error("Security Exception: Invalid destination path traversal detected.");
    }
    await fs2.promises.writeFile(destinationPath, buffer);
    return {
      filename: uniqueFilename,
      originalFilename: originalName,
      url: `/uploads/${uniqueFilename}`,
      size: buffer.length,
      mimeType,
      storagePath: destinationPath
    };
  }
  async deleteFile(filename) {
    const safeFilename = path3.basename(filename);
    const filePath = path3.resolve(this.storageDir, safeFilename);
    if (!filePath.startsWith(path3.resolve(this.storageDir))) {
      throw new Error("Security Exception: Path traversal attempt prevented.");
    }
    if (fs2.existsSync(filePath)) {
      await fs2.promises.unlink(filePath);
      return true;
    }
    return false;
  }
  exists(filename) {
    const safeFilename = path3.basename(filename);
    const filePath = path3.resolve(this.storageDir, safeFilename);
    return fs2.existsSync(filePath);
  }
  getUrl(filename) {
    const safeFilename = path3.basename(filename);
    return `/uploads/${safeFilename}`;
  }
};

// server/storage/HostingerMediaStorage.ts
import fs3 from "fs";
import path4 from "path";
init_env();
var HostingerMediaStorage = class extends LocalMediaStorage {
  constructor(customStorageDir) {
    const hostingerDir = customStorageDir || env.MEDIA_STORAGE_PATH || path4.resolve(process.cwd(), "uploads");
    super(hostingerDir);
    this.enforceDirectorySecurity();
  }
  /**
   * Drops a protective .htaccess file inside the uploads directory to prevent
   * any potential executable file execution on Hostinger Apache/LiteSpeed web servers.
   */
  enforceDirectorySecurity() {
    try {
      const storageDir = this.getStorageDirectory();
      const htaccessPath = path4.join(storageDir, ".htaccess");
      const htaccessContent = [
        "# Zanzirangi House: Security Lockdown for Uploads Directory",
        "# Prohibit any script execution on Hostinger Apache / LiteSpeed",
        '<FilesMatch "\\.(php|phtml|php3|php4|php5|phps|pl|py|cgi|sh|bash|exe)$">',
        "  Order Allow,Deny",
        "  Deny from all",
        "</FilesMatch>",
        "Options -ExecCGI -Indexes",
        "RemoveHandler .php .phtml .php3 .php4 .php5 .phps",
        "RemoveType .php .phtml .php3 .php4 .php5 .phps",
        ""
      ].join("\n");
      if (!fs3.existsSync(htaccessPath)) {
        fs3.writeFileSync(htaccessPath, htaccessContent, "utf-8");
      }
    } catch (e) {
      console.warn("\u26A0\uFE0F Notice: Could not write protective .htaccess to uploads directory:", e.message);
    }
  }
};

// server/storage/index.ts
init_env();
var storageInstance = null;
function getMediaStorage() {
  if (!storageInstance) {
    if (env.NODE_ENV === "production") {
      storageInstance = new HostingerMediaStorage();
    } else {
      storageInstance = new LocalMediaStorage();
    }
  }
  return storageInstance;
}
var mediaStorage = getMediaStorage();

// server/api.ts
init_env();

// server/supportApiRoutes.ts
import { Router } from "express";

// server/services/supportAiEngine.ts
var HANDOFF_MESSAGES = {
  en: "I'd be happy to help with that. Let me check this with our concierge team and get back to you.",
  fr: "Je serais ravi de vous aider. Laissez-moi v\xE9rifier cela aupr\xE8s de notre \xE9quipe de conciergerie et je reviens vers vous.",
  sw: "Ningefurahi kukusaidia kwa hilo. Ngoja nithibitishe hili na timu yetu ya makaribisho kisha nitakujulisha.",
  es: "Con gusto le ayudo con eso. Perm\xEDtame consultar con nuestro equipo de conserjer\xEDa y me pondr\xE9 en contacto con usted.",
  it: "Sar\xF2 lieto di aiutarvi. Permettetemi di verificare con il nostro team concierge e vi ricontatter\xF2 a breve.",
  pl: "Z przyjemno\u015Bci\u0105 w tym pomog\u0119. Pozw\xF3l, \u017Ce skonsultuj\u0119 to z naszym zespo\u0142em konsjer\u017Ca i wr\xF3c\u0119 do Ciebie z odpowiedzi\u0105.",
  ar: "\u064A\u0633\u0639\u062F\u0646\u064A \u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0641\u064A \u0630\u0644\u0643. \u062F\u0639\u0646\u064A \u0623\u062A\u062D\u0642\u0642 \u0645\u0646 \u0647\u0630\u0627 \u0627\u0644\u0623\u0645\u0631 \u0645\u0639 \u0641\u0631\u064A\u0642 \u0627\u0644\u0643\u0648\u0646\u0633\u064A\u0631\u062C \u0648\u0633\u0623\u0639\u0627\u0648\u062F \u0627\u0644\u0631\u062F \u0639\u0644\u064A\u0643.",
  zh: "\u975E\u5E38\u4E50\u610F\u4E3A\u60A8\u534F\u52A9\u3002\u8BF7\u7A0D\u7B49\uFF0C\u6211\u5C06\u4E0E\u6211\u4EEC\u7684\u79C1\u4EBA\u793C\u5BBE\u7BA1\u5BB6\u56E2\u961F\u786E\u8BA4\u540E\u7ACB\u5373\u5411\u60A8\u7B54\u590D\u3002"
};
var SupportAiEngine = class {
  /**
   * Evaluates a visitor query through the Support Decision Layer:
   * 1. Inspect dynamic Knowledge Base (published items)
   * 2. Inspect deterministic FAQ rules
   * 3. Detect high-constraint parameters (dates, large groups, discounts) requiring human review
   * 4. Compute decision: AUTO_ANSWER, SAFE_ANSWER, or HANDOFF_TO_HUMAN
   */
  async evaluateQuery(query, lang = "en", _currentPage = "/") {
    const q = query.trim().toLowerCase();
    const fallbackHandoff = HANDOFF_MESSAGES[lang] || HANDOFF_MESSAGES.en;
    const hasImmediateDate = /\b(tomorrow|tonight|today|besok|malam ini|demain|ce soir|mañana|domani|jutro|غدا|اليوم|明天|今晚)\b/i.test(q);
    const hasSpecificLargeGroup = /\b(1[0-9]|[2-9][0-9])\s*(people|guests|persons|orang|personnes|personas|persone|osób|شخص|位|人)\b/i.test(q) || /\b(for|untuk|pour|para|per|dla|li|共)\s*(1[0-9]|[2-9][0-9])\b/i.test(q);
    if (hasImmediateDate && hasSpecificLargeGroup) {
      return {
        replyText: fallbackHandoff,
        intent: "large_group_immediate_availability_inquiry",
        confidence: 0.5,
        knowledge_source: "NONE",
        decision: "HANDOFF_TO_HUMAN",
        handoffReason: "Visitor requested immediate availability for a large group (10+ guests), requiring human concierge verification."
      };
    }
    if (hasSpecificLargeGroup && (q.includes("dinner") || q.includes("candlelight") || q.includes("safari") || q.includes("tour") || q.includes("villa"))) {
      return {
        replyText: fallbackHandoff,
        intent: "large_group_custom_arrangement",
        confidence: 0.52,
        knowledge_source: "NONE",
        decision: "HANDOFF_TO_HUMAN",
        handoffReason: "Large group custom arrangement requires concierge catering and logistics coordination."
      };
    }
    try {
      const kbItems = await supportRepository.getKnowledgeBase({
        status: "PUBLISHED"
      });
      for (const item of kbItems) {
        const itemQ = item.question.toLowerCase();
        if (q === itemQ || q.length > 15 && itemQ.includes(q) || itemQ.length > 15 && q.includes(itemQ)) {
          return {
            replyText: item.answer,
            intent: `kb_${item.category.toLowerCase().replace(/\s+/g, "_")}`,
            confidence: 0.95,
            knowledge_source: `KNOWLEDGE_BASE_${item.id}`,
            decision: "AUTO_ANSWER"
          };
        }
      }
    } catch {
    }
    if (q.includes("serengeti") || q.includes("great migration")) {
      return {
        replyText: "Serengeti National Park is an extraordinary safari experience. Zanzirangi House arranges direct chartered fly-in safaris from Zanzibar airport (approx. 1h 45m) with luxury partner tented camps overlooking migration corridors.",
        action: { label: "View Safari Destinations", actionType: "SCROLL", target: "tanzania" },
        intent: "safari_serengeti",
        confidence: 0.95,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
      };
    }
    if (q.includes("ngorongoro") || q.includes("crater")) {
      return {
        replyText: "Ngorongoro Crater offers Africa\u2019s densest predator populations inside a UNESCO volcanic caldera. We organize chartered fly-in packages combining your beach retreat with panoramic crater floor game drives.",
        action: { label: "Explore Ngorongoro", actionType: "SCROLL", target: "tanzania" },
        intent: "safari_ngorongoro",
        confidence: 0.95,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
      };
    }
    if (q.includes("kilimanjaro")) {
      return {
        replyText: "Mount Kilimanjaro expeditions and scenic fly-over safaris are arranged through our certified mainland mountain guide partners. We can curate pre-climb acclimatization stays or relaxing post-climb beach recovery.",
        action: { label: "Plan Safari & Kilimanjaro", actionType: "SCROLL", target: "tanzania" },
        intent: "safari_kilimanjaro",
        confidence: 0.92,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
      };
    }
    if (q.includes("tarangire")) {
      return {
        replyText: "Tarangire National Park is celebrated for iconic baobab trees and vast elephant herds along the Tarangire River. We arrange chartered flight itineraries directly from Zanzibar.",
        action: { label: "View Tarangire Safaris", actionType: "SCROLL", target: "tanzania" },
        intent: "safari_tarangire",
        confidence: 0.92,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
      };
    }
    const checkinKeywords = ["check-in", "checkin", "check out", "checkout", "horaires", "muda wa kuingia", "horario", "arrived", "departure", "jam masuk", "waktu masuk", "wymeldowani", "zameldowani", "\u5165\u4F4F", "\u9000\u623F", "\u0627\u0644\u0648\u0635\u0648\u0644", "\u0627\u0644\u0645\u063A\u0627\u062F\u0631\u0629"];
    if (checkinKeywords.some((k) => q.includes(k))) {
      return {
        replyText: "Standard check-in is from 14:00 (2:00 PM) and check-out is until 11:00 AM. Flexible early check-in or late checkout can be accommodated based on villa availability.",
        action: { label: "Book a Villa", actionType: "MODAL", target: "booking_modal" },
        intent: "faq_checkin_checkout",
        confidence: 0.94,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
      };
    }
    const wifiKeywords = ["wifi", "wi-fi", "internet", "speed", "starlink", "network", "connect", "online", "\u0633\u062A\u0627\u0631\u0644\u064A\u0646\u0643", "\u661F\u94FE", "\u65E0\u7EBF"];
    if (wifiKeywords.some((k) => q.includes(k))) {
      return {
        replyText: "High-speed Starlink satellite Wi-Fi (150+ Mbps) is complimentary across all private villas, gardens, and dining pavilions, ensuring reliable connectivity for streaming or remote work.",
        action: { label: "Check Villa Features", actionType: "SCROLL", target: "stay" },
        intent: "faq_starlink_wifi",
        confidence: 0.95,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
      };
    }
    const paymentKeywords = ["payment", "pay", "cancel", "deposit", "card", "visa", "mastercard", "amex", "paiement", "pago", "malipo", "bayar", "pembayaran", "p\u0142atno\u015B", "anulac", "\u0627\u0644\u062F\u0641\u0639", "\u0625\u0644\u063A\u0627\u0621", "\u4ED8\u6B3E", "\u53D6\u6D88"];
    if (paymentKeywords.some((k) => q.includes(k))) {
      return {
        replyText: "We accept major credit cards (Visa, MasterCard, Amex), international bank transfers, and mobile payments. Cancellation terms offer full flexibility up to 14 days prior to arrival.",
        action: { label: "Reserve a Villa", actionType: "MODAL", target: "booking_modal" },
        intent: "faq_payment_cancellation",
        confidence: 0.9,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
      };
    }
    const dolphinKeywords = ["dolphin", "pomboo", "dauphin", "delfin", "delfini", "\u062F\u0644\u0627\u0641\u064A\u0646", "\u062F\u0644\u0641\u064A\u0646", "\u6D77\u8C5A"];
    if (dolphinKeywords.some((k) => q.includes(k))) {
      return {
        replyText: "Kizimkazi is world-famous for resident dolphin pods in the Menai Bay Conservation Area. We organize ethical sunrise dolphin safaris directly from our shore.",
        action: { label: "Explore Dolphin Safaris", actionType: "SCROLL", target: "experiences" },
        intent: "experience_dolphins",
        confidence: 0.93,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
      };
    }
    const dhowKeywords = ["dhow", "jahazi", "dau", "voilier", "velero", "\u0642\u0627\u0631\u0628", "\u0627\u0644\u062F\u0627\u0648", "\u6728\u8239", "\u5E06\u8239"];
    if (dhowKeywords.some((k) => q.includes(k))) {
      return {
        replyText: "Glide across the turquoise Indian Ocean aboard a handcrafted wooden dhow while enjoying chilled Champagne and fresh Swahili canap\xE9s as the sun sets.",
        action: { label: "View Sunset Sailing", actionType: "SCROLL", target: "experiences" },
        intent: "experience_sunset_dhow",
        confidence: 0.93,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
      };
    }
    const candleKeywords = ["candle", "candlelight", "chandelles", "romantique", "mishumaa", "vela", "velas", "\u0634\u0645\u0648\u0639", "\u0634\u0645\u0639", "\u70DB\u5149", "\u015Bwiec"];
    if (candleKeywords.some((k) => q.includes(k))) {
      return {
        replyText: "We arrange unforgettable candlelit dinners directly on the soft white sands or elevated coral terraces with torchlight and a custom 5-course seafood tasting menu.",
        action: { label: "Taste Dining Moments", actionType: "SCROLL", target: "dining" },
        intent: "dining_candlelight",
        confidence: 0.88,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
      };
    }
    const spaKeywords = ["spa", "massage", "masaji", "bien-\xEAtre", "bienestar", "odnowa", "\u062A\u062F\u0644\u064A\u0643", "\u0633\u0628a", "\u6C34\u7597", "\u6309\u6469", "wellness", "therap"];
    if (spaKeywords.some((k) => q.includes(k))) {
      return {
        replyText: "Our in-villa wellness treatments feature cold-pressed Zanzibari coconut oils, clove and cinnamon body scrubs, and soothing deep-tissue massages performed on your private ocean deck.",
        action: { label: "View Wellness & Spa", actionType: "SCROLL", target: "experiences" },
        intent: "experience_spa",
        confidence: 0.92,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
      };
    }
    const stonetownKeywords = ["stone town", "spice", "\xE9pices", "viungo", "especias", "spezie", "\u0627\u0644\u062A\u0648\u0627\u0628\u0644", "\u0627\u0644\u0645\u062F\u064A\u0646\u0629 \u0627\u0644\u062D\u062C\u0631\u064A\u0629", "\u77F3\u5934\u57CE", "\u9999\u6599", "przypraw"];
    if (stonetownKeywords.some((k) => q.includes(k))) {
      return {
        replyText: "We organize private cultural journeys with local historians through UNESCO-listed Stone Town and organic spice plantations celebrating vanilla, cloves, and cardamom.",
        action: { label: "Discover Island Tours", actionType: "SCROLL", target: "experiences" },
        intent: "experience_stone_town",
        confidence: 0.92,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
      };
    }
    const familyKeywords = ["family", "children", "child", "kid", "famille", "enfant", "familia", "ni\xF1o", "watoto", "bambin", "\u0639\u0627\u0626\u0644", "\u0623\u0637\u0641\u0627\u0644", "\u5BB6\u5EAD", "\u513F\u7AE5", "rodzin"];
    if (familyKeywords.some((k) => q.includes(k))) {
      return {
        replyText: "Families are warmly welcomed. We offer interconnecting villa sanctuaries, extra beds, tailored kids menus, and professional babysitting upon request.",
        action: { label: "Explore Family Villas", actionType: "SCROLL", target: "stay" },
        intent: "faq_family_children",
        confidence: 0.9,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
      };
    }
    const honeymoonKeywords = ["honeymoon", "anniversary", "lune de miel", "fungate", "luna de miel", "luna di miele", "\u0639\u0633\u0644", "\u0631\u0648\u0645\u0627\u0646\u0633", "\u871C\u6708", "m\u0142od", "po\u015Blubn"];
    if (honeymoonKeywords.some((k) => q.includes(k))) {
      return {
        replyText: "For honeymooners, we prepare complimentary chilled Champagne, fresh tropical floral arrangements, a private sunset dhow sail, and a romantic beach dinner under the stars.",
        action: { label: "Plan Honeymoon Escape", actionType: "MODAL", target: "booking_modal" },
        intent: "faq_honeymoon",
        confidence: 0.91,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
      };
    }
    const divingKeywords = ["dive", "diving", "snorkel", "snorkeling", "plong\xE9e", "kuzamia", "buceo", "immersi", "\u063A\u0648\u0635", "\u0633\u0646\u0648\u0631\u0643\u0644", "\u6F5C\u6C34", "\u6D6E\u6F5C", "nurkowan", "reef", "coral"];
    if (divingKeywords.some((k) => q.includes(k))) {
      return {
        replyText: "Partnering with certified PADI dive masters, we take you to the pristine reefs of Mnemba Atoll and Kizimkazi to observe sea turtles, manta rays, and vibrant marine life.",
        action: { label: "Explore Marine Safaris", actionType: "SCROLL", target: "experiences" },
        intent: "experience_diving",
        confidence: 0.92,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
      };
    }
    const poolKeywords = ["pool", "plunge", "swim", "beach", "ocean", "piscine", "bwawa", "piscina", "pantai", "kolam", "basen", "\u0627\u0644\u0645\u0633\u0628\u062D", "\u0627\u0644\u0634\u0627\u0637\u0626", "\u6CF3\u6C60", "\u6C99\u6EE9"];
    if (poolKeywords.some((k) => q.includes(k))) {
      return {
        replyText: "Every single one of our 8 luxury sanctuaries features its own private freshwater plunge pool, sun loungers, and direct private pathway access to the pristine shores of the Indian Ocean.",
        action: { label: "View Private Villas", actionType: "SCROLL", target: "stay" },
        intent: "faq_pools_beach",
        confidence: 0.89,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
      };
    }
    const villaKeywords = ["villa", "rate", "price", "stay", "room", "availab", "suite", "bungalow", "prix", "chambre", "bei", "chumba", "precio", "tarifa", "\u0641\u0644\u0644", "\u0641\u064A\u0644\u0627", "\u0633\u0639\u0631", "\u522B\u5885", "\u4EF7\u683C"];
    if (villaKeywords.some((k) => q.includes(k))) {
      return {
        replyText: "We feature 8 handcrafted luxury sanctuaries including oceanfront pool villas and secluded garden bungalows. Would you like to check dates and availability?",
        action: { label: "Check Villa Availability", actionType: "MODAL", target: "booking_modal" },
        intent: "faq_villas_rates",
        confidence: 0.86,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
      };
    }
    const transferKeywords = ["airport", "transfer", "location", "where", "car", "distance", "arrive", "driver", "taxi", "shuttle", "a\xE9roport", "usafiri", "aeropuerto", "\u0645\u0637\u0627\u0631", "\u63A5\u9001"];
    if (transferKeywords.some((k) => q.includes(k))) {
      return {
        replyText: "We provide private VIP meet-and-greet and chauffeur shuttle transfers from Abeid Amani Karume International Airport (ZNZ) directly to our sanctuary in Kizimkazi (approx. 55 minutes).",
        action: { label: "View Transfer Details", actionType: "SCROLL", target: "shuttle" },
        intent: "faq_transfers",
        confidence: 0.88,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
      };
    }
    const diningKeywords = ["din", "food", "restaurant", "chef", "breakfast", "menu", "lunch", "eat", "drink", "cuisine", "nourriture", "chakula", "comida", "\u0645\u0637\u0639\u0645", "\u9910\u5385"];
    if (diningKeywords.some((k) => q.includes(k))) {
      return {
        replyText: "Our gastronomic philosophy embraces organic garden-to-table produce and line-caught seafood with authentic Swahili and fine international dining.",
        action: { label: "Taste Dining & Garden Menu", actionType: "SCROLL", target: "dining" },
        intent: "faq_dining",
        confidence: 0.86,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
      };
    }
    return {
      replyText: fallbackHandoff,
      intent: "unrecognized_visitor_inquiry",
      confidence: 0.4,
      knowledge_source: "NONE",
      decision: "HANDOFF_TO_HUMAN",
      handoffReason: "Query contains unfamiliar, highly specific, or unverified inquiry requirements."
    };
  }
  /**
   * Generates a suggested reply for the human admin when HUMAN_ACTIVE is set.
   */
  generateSuggestedReplyForAdmin(lastVisitorMessage, _history) {
    const q = lastVisitorMessage.toLowerCase();
    if (q.includes("dinner") && (q.includes("candlelight") || q.includes("beach"))) {
      return "Yes, we can check availability for a private candlelight dinner on the beach. May I confirm the preferred date, time, and any specific dietary preferences for your party?";
    }
    if (q.includes("transfer") || q.includes("airport") || q.includes("pickup")) {
      return "Yes, private VIP airport transfers can be arranged subject to availability. May I confirm your flight number and expected arrival date?";
    }
    if (q.includes("safari") || q.includes("serengeti") || q.includes("ngorongoro")) {
      return "We would be delighted to customize your Tanzania safari fly-in itinerary. How many nights would you like to dedicate to the game drives, and do you have a preferred travel month?";
    }
    if (q.includes("villa") || q.includes("room") || q.includes("book") || q.includes("stay")) {
      return "Jambo! I would be pleased to review our direct sanctuary availability for your requested dates. Could you kindly share your preferred check-in and check-out schedule?";
    }
    return "Jambo! Thank you for contacting our concierge team directly. I am reviewing the details of your inquiry right now and will assist you immediately.";
  }
};
var supportAiEngine = new SupportAiEngine();

// server/supportApiRoutes.ts
var supportRouter = Router();
function toStr(val) {
  if (Array.isArray(val)) return String(val[0] || "");
  return typeof val === "string" ? val : val !== void 0 && val !== null ? String(val) : "";
}
supportRouter.post("/conversation", async (req, res) => {
  try {
    const { visitor_id, session_id, language, current_page, booking_id, metadata } = req.body;
    if (!visitor_id || !session_id) {
      return res.status(400).json({ success: false, error: "visitor_id and session_id are required" });
    }
    let conv = await supportRepository.getActiveConversationByVisitor(toStr(visitor_id));
    if (!conv) {
      conv = await supportRepository.createConversation({
        visitor_id: toStr(visitor_id),
        session_id: toStr(session_id),
        language: toStr(language) || "en",
        current_page: toStr(current_page) || "/",
        booking_id: booking_id ? toStr(booking_id) : null,
        metadata: metadata || null,
        status: "AI_ACTIVE"
      });
    } else if (booking_id || metadata) {
      conv = await supportRepository.updateConversation(conv.id, {
        booking_id: booking_id ? toStr(booking_id) : conv.booking_id,
        metadata: metadata ? { ...conv.metadata, ...metadata } : conv.metadata,
        language: language ? toStr(language) : conv.language,
        current_page: current_page ? toStr(current_page) : conv.current_page
      });
    }
    const messages = await supportRepository.getMessages(conv.id);
    res.json({
      success: true,
      data: {
        conversation: conv,
        messages
      }
    });
  } catch (err) {
    console.error("Error initializing support conversation:", err.message);
    res.status(500).json({ success: false, error: "Failed to initialize conversation" });
  }
});
supportRouter.get("/conversation/:id", async (req, res) => {
  try {
    const id = toStr(req.params.id);
    const visitor_id = toStr(req.query.visitor_id) || toStr(req.headers["x-visitor-id"]);
    const conv = await supportRepository.getConversationById(id);
    if (!conv) {
      return res.status(404).json({ success: false, error: "Conversation not found" });
    }
    if (visitor_id && conv.visitor_id !== visitor_id) {
      return res.status(403).json({ success: false, error: "Access denied to this conversation" });
    }
    const messages = await supportRepository.getMessages(id);
    res.json({ success: true, data: { conversation: conv, messages } });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve conversation" });
  }
});
supportRouter.post("/conversation/:id/messages", async (req, res) => {
  try {
    const id = toStr(req.params.id);
    const { message, visitor_id, metadata } = req.body;
    const msgText = toStr(message).trim();
    if (!msgText) {
      return res.status(400).json({ success: false, error: "Message cannot be empty" });
    }
    const conv = await supportRepository.getConversationById(id);
    if (!conv) {
      return res.status(404).json({ success: false, error: "Conversation not found" });
    }
    const vId = toStr(visitor_id);
    if (vId && conv.visitor_id !== vId) {
      return res.status(403).json({ success: false, error: "Access denied to this conversation" });
    }
    const userMsg = await supportRepository.createMessage({
      conversation_id: id,
      sender_type: "VISITOR",
      sender_id: conv.visitor_id,
      message: msgText,
      message_type: "TEXT",
      metadata
    });
    if (conv.status === "HUMAN_ACTIVE") {
      return res.json({
        success: true,
        data: {
          userMessage: userMsg,
          botMessage: null,
          conversationStatus: "HUMAN_ACTIVE"
        }
      });
    }
    const evaluation = await supportAiEngine.evaluateQuery(
      msgText,
      conv.language,
      conv.current_page
    );
    await supportRepository.logAiEvent({
      conversation_id: id,
      message_id: userMsg.id,
      intent: evaluation.intent,
      confidence: evaluation.confidence,
      knowledge_source: evaluation.knowledge_source,
      decision: evaluation.decision
    });
    let botMsg = null;
    let nextStatus = conv.status;
    if (evaluation.decision === "HANDOFF_TO_HUMAN") {
      nextStatus = "WAITING_HUMAN";
      await supportRepository.updateConversation(id, {
        status: "WAITING_HUMAN"
      });
      botMsg = await supportRepository.createMessage({
        conversation_id: id,
        sender_type: "AI",
        sender_id: "juma_concierge_ai",
        message: evaluation.replyText,
        message_type: "TEXT",
        ai_confidence: evaluation.confidence,
        metadata: {
          handoffReason: evaluation.handoffReason
        }
      });
    } else {
      botMsg = await supportRepository.createMessage({
        conversation_id: id,
        sender_type: "AI",
        sender_id: "juma_concierge_ai",
        message: evaluation.replyText,
        message_type: evaluation.action ? "ACTION" : "TEXT",
        ai_confidence: evaluation.confidence,
        metadata: {
          action: evaluation.action
        }
      });
    }
    res.json({
      success: true,
      data: {
        userMessage: userMsg,
        botMessage: botMsg,
        conversationStatus: nextStatus
      }
    });
  } catch (err) {
    console.error("Error posting visitor support message:", err.message);
    res.status(500).json({ success: false, error: "Failed to process support message" });
  }
});
supportRouter.get("/conversation/:id/poll", async (req, res) => {
  try {
    const id = toStr(req.params.id);
    const after = toStr(req.query.after);
    const visitor_id = toStr(req.query.visitor_id) || toStr(req.headers["x-visitor-id"]);
    const conv = await supportRepository.getConversationById(id);
    if (!conv) {
      return res.status(404).json({ success: false, error: "Conversation not found" });
    }
    if (visitor_id && conv.visitor_id !== visitor_id) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }
    let messages = await supportRepository.getMessages(id);
    if (after) {
      const afterTime = new Date(after).getTime();
      messages = messages.filter((m) => new Date(m.created_at).getTime() > afterTime);
    }
    res.json({
      success: true,
      data: {
        status: conv.status,
        messages
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to poll messages" });
  }
});
supportRouter.get("/admin/conversations", authenticateAdmin, async (req, res) => {
  try {
    const status = toStr(req.query.status);
    const search = toStr(req.query.search);
    const limit = req.query.limit ? parseInt(toStr(req.query.limit), 10) : void 0;
    const conversations = await supportRepository.getConversations({
      status: status || void 0,
      search: search || void 0,
      limit
    });
    const allConvs = await supportRepository.getConversations();
    const counts = {
      all: allConvs.length,
      waiting: allConvs.filter((c) => c.status === "WAITING_HUMAN").length,
      aiActive: allConvs.filter((c) => c.status === "AI_ACTIVE").length,
      humanActive: allConvs.filter((c) => c.status === "HUMAN_ACTIVE").length,
      resolved: allConvs.filter((c) => c.status === "RESOLVED").length,
      closed: allConvs.filter((c) => c.status === "CLOSED").length
    };
    res.json({
      success: true,
      data: {
        conversations,
        counts
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch conversations" });
  }
});
supportRouter.get("/admin/conversations/:id", authenticateAdmin, async (req, res) => {
  try {
    const id = toStr(req.params.id);
    const conv = await supportRepository.getConversationById(id);
    if (!conv) {
      return res.status(404).json({ success: false, error: "Conversation not found" });
    }
    const messages = await supportRepository.getMessages(id);
    const aiEvents = await supportRepository.getAiEvents(id);
    res.json({
      success: true,
      data: {
        conversation: conv,
        messages,
        aiEvents
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve conversation details" });
  }
});
supportRouter.post("/admin/conversations/:id/messages", authenticateAdmin, async (req, res) => {
  try {
    const id = toStr(req.params.id);
    const { message, action, suggestedByAi } = req.body;
    const msgText = toStr(message).trim();
    if (!msgText) {
      return res.status(400).json({ success: false, error: "Message cannot be empty" });
    }
    const conv = await supportRepository.getConversationById(id);
    if (!conv) {
      return res.status(404).json({ success: false, error: "Conversation not found" });
    }
    const adminEmail = req.user?.email || "admin@zanzirangihouse.com";
    const newMsg = await supportRepository.createMessage({
      conversation_id: id,
      sender_type: "ADMIN",
      sender_id: adminEmail,
      message: msgText,
      message_type: action ? "ACTION" : "TEXT",
      metadata: {
        action,
        suggestedByAi: !!suggestedByAi
      }
    });
    const updatedConv = await supportRepository.updateConversation(id, {
      status: "HUMAN_ACTIVE",
      assigned_admin_id: adminEmail
    });
    res.json({
      success: true,
      data: {
        message: newMsg,
        conversation: updatedConv
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to send admin message" });
  }
});
supportRouter.patch("/admin/conversations/:id/status", authenticateAdmin, async (req, res) => {
  try {
    const id = toStr(req.params.id);
    const status = toStr(req.body.status);
    const validStatuses = [
      "AI_ACTIVE",
      "WAITING_HUMAN",
      "HUMAN_ACTIVE",
      "WAITING_FOR_VISITOR",
      "RESOLVED",
      "CLOSED"
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid status: ${status}` });
    }
    const adminEmail = req.user?.email || "admin@zanzirangihouse.com";
    const updates = { status };
    if (status === "HUMAN_ACTIVE") {
      updates.assigned_admin_id = adminEmail;
    } else if (status === "AI_ACTIVE") {
      updates.assigned_admin_id = null;
    }
    const updated = await supportRepository.updateConversation(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, error: "Conversation not found" });
    }
    let sysText = "";
    if (status === "HUMAN_ACTIVE") {
      sysText = `Concierge staff (${adminEmail}) has taken over the conversation. AI auto-replies are paused.`;
    } else if (status === "AI_ACTIVE") {
      sysText = `Conversation returned to AI Concierge (Juma).`;
    } else if (status === "RESOLVED") {
      sysText = `Conversation marked as resolved by ${adminEmail}.`;
    } else if (status === "CLOSED") {
      sysText = `Conversation closed.`;
    }
    if (sysText) {
      await supportRepository.createMessage({
        conversation_id: id,
        sender_type: "SYSTEM",
        sender_id: "system",
        message: sysText,
        message_type: "SYSTEM_EVENT"
      });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update conversation status" });
  }
});
supportRouter.get("/admin/conversations/:id/suggested-reply", authenticateAdmin, async (req, res) => {
  try {
    const id = toStr(req.params.id);
    const messages = await supportRepository.getMessages(id);
    const visitorMsgs = messages.filter((m) => m.sender_type === "VISITOR");
    const lastVisitorMsg = visitorMsgs[visitorMsgs.length - 1]?.message || "";
    const history = messages.map((m) => ({
      sender: m.sender_type,
      text: m.message
    }));
    const suggestedReply = supportAiEngine.generateSuggestedReplyForAdmin(lastVisitorMsg, history);
    res.json({
      success: true,
      data: {
        suggestedReply,
        lastVisitorMessage: lastVisitorMsg
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to generate suggested reply" });
  }
});
supportRouter.get("/admin/knowledge-base", authenticateAdmin, async (req, res) => {
  try {
    const category = toStr(req.query.category);
    const language = toStr(req.query.language);
    const status = toStr(req.query.status);
    const search = toStr(req.query.search);
    const items = await supportRepository.getKnowledgeBase({
      category: category || void 0,
      language: language || void 0,
      status: status || void 0,
      search: search || void 0
    });
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch knowledge base" });
  }
});
supportRouter.post("/admin/knowledge-base", authenticateAdmin, async (req, res) => {
  try {
    const { question, answer, category, language, status, source } = req.body;
    const qText = toStr(question).trim();
    const aText = toStr(answer).trim();
    if (!qText || !aText) {
      return res.status(400).json({ success: false, error: "Question and answer are required" });
    }
    const saved = await supportRepository.saveKnowledgeItem({
      question: qText,
      answer: aText,
      category: toStr(category) || "General",
      language: toStr(language) || "en",
      status: toStr(status) || "PUBLISHED",
      source: toStr(source) || "MANUAL"
    });
    res.json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to save knowledge item" });
  }
});
supportRouter.put("/admin/knowledge-base/:id", authenticateAdmin, async (req, res) => {
  try {
    const id = toStr(req.params.id);
    const { question, answer, category, language, status } = req.body;
    const saved = await supportRepository.saveKnowledgeItem({
      id,
      question: toStr(question),
      answer: toStr(answer),
      category: toStr(category),
      language: toStr(language),
      status: toStr(status)
    });
    res.json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update knowledge item" });
  }
});
supportRouter.delete("/admin/knowledge-base/:id", authenticateAdmin, async (req, res) => {
  try {
    const id = toStr(req.params.id);
    const deleted = await supportRepository.deleteKnowledgeItem(id);
    res.json({ success: deleted });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to delete knowledge item" });
  }
});
supportRouter.get("/admin/analytics", authenticateAdmin, async (req, res) => {
  try {
    const analytics = await supportRepository.getAnalytics();
    res.json({ success: true, data: analytics });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch support analytics" });
  }
});

// server/api.ts
var apiApp = express();
apiApp.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  if (env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});
var corsOrigin = env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN;
apiApp.use(cors({ origin: corsOrigin, credentials: true }));
apiApp.use(cookieParser());
apiApp.use(express.json({ limit: `${env.MAX_UPLOAD_SIZE_MB}mb` }));
apiApp.use(express.urlencoded({ extended: true, limit: `${env.MAX_UPLOAD_SIZE_MB}mb` }));
apiApp.use("/uploads", express.static(mediaStorage.getStorageDirectory()));
var loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: env.NODE_ENV === "production" ? 10 : 1e3,
  // Strict 10 in production, relaxed in dev
  skip: () => env.NODE_ENV === "development",
  // Skip in development
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many login attempts. Please try again after 15 minutes."
  }
});
apiApp.get("/health", async (_req, res) => {
  const dbHealth = await getDatabaseAdapter().healthCheck();
  res.json({
    status: "ok",
    database: {
      provider: dbHealth.provider,
      connected: dbHealth.connected
    },
    service: "Zanzirangi House CMS Engine",
    version: env.APP_VERSION,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
apiApp.get("/health/database", authenticateAdmin, async (_req, res) => {
  try {
    const { testDatabaseConnection: testDatabaseConnection2 } = await Promise.resolve().then(() => (init_connection(), connection_exports));
    const diagnostic = await testDatabaseConnection2();
    res.json({
      status: diagnostic.success ? "ok" : "degraded",
      diagnostic
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      error: err.message
    });
  }
});
apiApp.post("/auth/login", loginRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: "Email and password are required."
      });
      return;
    }
    const result = await loginUser(email, password);
    if (!result.success) {
      res.status(401).json(result);
      return;
    }
    res.cookie("zanzirangi_admin_token", result.token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1e3
      // 7 days
    });
    await auditRepository.log({
      action: "USER_LOGIN",
      userEmail: result.user.email,
      details: "Administrator logged into Zanzirangi CMS",
      ipAddress: req.ip
    });
    res.json({
      success: true,
      user: result.user,
      token: result.token
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      error: env.NODE_ENV === "production" ? "Internal server error during login." : err.message
    });
  }
});
apiApp.post("/auth/logout", async (req, res) => {
  res.clearCookie("zanzirangi_admin_token");
  res.json({ success: true, message: "Successfully logged out." });
});
apiApp.get("/auth/me", authenticateAdmin, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});
apiApp.get("/content/homepage", async (_req, res) => {
  try {
    const data = await homepageRepository.getHomepage();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve published homepage content." });
  }
});
apiApp.get("/content/villas", async (_req, res) => {
  try {
    const villas = await villasRepository.getAll();
    const published = villas.filter((v) => v.status === "published");
    res.json({ success: true, data: published });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve villas." });
  }
});
apiApp.get("/content/gallery", async (_req, res) => {
  try {
    const gallery = await galleryRepository.getAll();
    const published = gallery.filter((g) => g.published !== false);
    res.json({ success: true, data: published });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve gallery items." });
  }
});
apiApp.get("/content/facilities", async (_req, res) => {
  try {
    const facilities = await facilitiesRepository.getAll();
    const visible = facilities.filter((f) => f.visible !== false);
    res.json({ success: true, data: visible });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve facilities." });
  }
});
apiApp.get("/content/testimonials", async (_req, res) => {
  try {
    const testimonials = await testimonialsRepository.getAll();
    const visible = testimonials.filter((t) => t.visible !== false);
    res.json({ success: true, data: visible });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve testimonials." });
  }
});
apiApp.get("/content/videos", async (_req, res) => {
  try {
    const videos = await videosRepository.get();
    res.json({ success: true, data: videos });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve video details." });
  }
});
apiApp.get("/content/seo", async (_req, res) => {
  try {
    const seo = await seoRepository.getSeo();
    res.json({ success: true, data: seo });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve SEO configuration." });
  }
});
apiApp.get("/content/contact", async (_req, res) => {
  try {
    const contactInfo = await contactRepository.getContactInfo();
    res.json({ success: true, data: contactInfo });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve contact information." });
  }
});
apiApp.get("/content/settings", async (_req, res) => {
  try {
    const s = await settingsRepository.getSettings();
    res.json({
      success: true,
      data: {
        siteName: s.siteName,
        tagline: s.tagline,
        defaultCurrency: s.defaultCurrency,
        currency: s.currency || "USD",
        defaultLanguage: s.defaultLanguage || "en",
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
        maintenanceMode: s.maintenanceMode
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve site settings." });
  }
});
apiApp.get("/admin/homepage", authenticateAdmin, async (_req, res) => {
  try {
    const data = await homepageRepository.getHomepage();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch homepage data." });
  }
});
apiApp.put("/admin/homepage", authenticateAdmin, async (req, res) => {
  try {
    const body = req.body;
    if (!body || typeof body !== "object") {
      res.status(400).json({ success: false, error: "Invalid payload structure." });
      return;
    }
    const updated = await homepageRepository.updateHomepage(body, req.user?.email || "admin");
    res.json({
      success: true,
      message: "Homepage content successfully published to live website.",
      data: updated
    });
  } catch (err) {
    console.error("Homepage save error:", err);
    res.status(500).json({ success: false, error: "Failed to save homepage changes." });
  }
});
apiApp.get("/admin/villas", authenticateAdmin, async (_req, res) => {
  try {
    const data = await villasRepository.getAll();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve villas." });
  }
});
apiApp.post("/admin/villas", authenticateAdmin, async (req, res) => {
  try {
    const newVilla = {
      ...req.body,
      id: req.body.id || `villa-${Date.now()}`,
      order: req.body.order || 0,
      status: req.body.status || "published"
    };
    const saved = await villasRepository.save(newVilla, req.user?.email || "admin");
    res.json({ success: true, data: saved, message: "Villa successfully created." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to create villa." });
  }
});
apiApp.put("/admin/villas/:id", authenticateAdmin, async (req, res) => {
  try {
    const id = String(req.params.id);
    const existing = await villasRepository.getById(id);
    if (!existing) {
      res.status(404).json({ success: false, error: "Villa not found." });
      return;
    }
    const merged = { ...existing, ...req.body, id };
    const saved = await villasRepository.save(merged, req.user?.email || "admin");
    res.json({ success: true, data: saved, message: "Villa updated successfully." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update villa." });
  }
});
apiApp.delete("/admin/villas/:id", authenticateAdmin, async (req, res) => {
  try {
    const id = String(req.params.id);
    const deleted = await villasRepository.delete(id, req.user?.email || "admin");
    if (!deleted) {
      res.status(404).json({ success: false, error: "Villa not found." });
      return;
    }
    res.json({ success: true, message: "Villa deleted successfully." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to delete villa." });
  }
});
apiApp.get("/admin/gallery", authenticateAdmin, async (_req, res) => {
  try {
    const data = await galleryRepository.getAll();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve gallery items." });
  }
});
apiApp.post("/admin/gallery", authenticateAdmin, async (req, res) => {
  try {
    const newItem = {
      ...req.body,
      id: req.body.id || `g-${Date.now()}`,
      order: req.body.order || 0,
      published: req.body.published !== false
    };
    const saved = await galleryRepository.save(newItem, req.user?.email || "admin");
    res.json({ success: true, data: saved, message: "Gallery item added." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to add gallery item." });
  }
});
apiApp.put("/admin/gallery/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const items = await galleryRepository.getAll();
    const existing = items.find((g) => g.id === id);
    if (!existing) {
      res.status(404).json({ success: false, error: "Gallery item not found." });
      return;
    }
    const merged = { ...existing, ...req.body, id };
    const saved = await galleryRepository.save(merged, req.user?.email || "admin");
    res.json({ success: true, data: saved, message: "Gallery item updated." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update gallery item." });
  }
});
apiApp.delete("/admin/gallery/:id", authenticateAdmin, async (req, res) => {
  try {
    const id = String(req.params.id);
    const deleted = await galleryRepository.delete(id, req.user?.email || "admin");
    if (!deleted) {
      res.status(404).json({ success: false, error: "Gallery item not found." });
      return;
    }
    res.json({ success: true, message: "Gallery item deleted." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to delete gallery item." });
  }
});
apiApp.get("/admin/facilities", authenticateAdmin, async (_req, res) => {
  try {
    const data = await facilitiesRepository.getAll();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve facilities." });
  }
});
apiApp.put("/admin/facilities/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const facilities = await facilitiesRepository.getAll();
    const existing = facilities.find((f) => f.id === id);
    if (!existing) {
      res.status(404).json({ success: false, error: "Facility not found." });
      return;
    }
    const merged = { ...existing, ...req.body, id };
    const saved = await facilitiesRepository.save(merged, req.user?.email || "admin");
    res.json({ success: true, data: saved, message: "Facility updated." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update facility." });
  }
});
apiApp.get("/admin/testimonials", authenticateAdmin, async (_req, res) => {
  try {
    const data = await testimonialsRepository.getAll();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve testimonials." });
  }
});
apiApp.post("/admin/testimonials", authenticateAdmin, async (req, res) => {
  try {
    const newTestimonial = {
      ...req.body,
      id: req.body.id || `rev-${Date.now()}`,
      order: req.body.order || 0,
      visible: req.body.visible !== false,
      rating: req.body.rating || 5
    };
    const saved = await testimonialsRepository.save(newTestimonial, req.user?.email || "admin");
    res.json({ success: true, data: saved, message: "Testimonial added." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to add testimonial." });
  }
});
apiApp.put("/admin/testimonials/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const testimonials = await testimonialsRepository.getAll();
    const existing = testimonials.find((t) => t.id === id);
    if (!existing) {
      res.status(404).json({ success: false, error: "Testimonial not found." });
      return;
    }
    const merged = { ...existing, ...req.body, id };
    const saved = await testimonialsRepository.save(merged, req.user?.email || "admin");
    res.json({ success: true, data: saved, message: "Testimonial updated." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update testimonial." });
  }
});
apiApp.delete("/admin/testimonials/:id", authenticateAdmin, async (req, res) => {
  try {
    const id = String(req.params.id);
    const deleted = await testimonialsRepository.delete(id, req.user?.email || "admin");
    if (!deleted) {
      res.status(404).json({ success: false, error: "Testimonial not found." });
      return;
    }
    res.json({ success: true, message: "Testimonial deleted." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to delete testimonial." });
  }
});
apiApp.get("/admin/videos", authenticateAdmin, async (_req, res) => {
  try {
    const data = await videosRepository.get();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch video details." });
  }
});
apiApp.put("/admin/videos", authenticateAdmin, async (req, res) => {
  try {
    const updated = await videosRepository.update(req.body, req.user?.email || "admin");
    res.json({ success: true, data: updated, message: "Promotional video details updated." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update videos." });
  }
});
apiApp.get("/admin/seo", authenticateAdmin, async (_req, res) => {
  try {
    const data = await seoRepository.getSeo();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch SEO configuration." });
  }
});
apiApp.put("/admin/seo", authenticateAdmin, async (req, res) => {
  try {
    const updated = await seoRepository.updateSeo(req.body, req.user?.email || "admin");
    res.json({ success: true, data: updated, message: "SEO configuration saved." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update SEO." });
  }
});
apiApp.get("/admin/media", authenticateAdmin, async (_req, res) => {
  try {
    const data = await mediaRepository.getAll();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch media assets." });
  }
});
apiApp.post("/admin/media", authenticateAdmin, async (req, res) => {
  try {
    const newMedia = {
      ...req.body,
      id: req.body.id || `med-${Date.now()}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString(),
      usageCount: 0
    };
    const saved = await mediaRepository.save(newMedia, req.user?.email || "admin");
    res.json({ success: true, data: saved, message: "Media asset added to registry." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to save media." });
  }
});
apiApp.delete("/admin/media/:id", authenticateAdmin, async (req, res) => {
  try {
    const id = String(req.params.id);
    const deleted = await mediaRepository.delete(id, req.user?.email || "admin");
    if (!deleted) {
      res.status(404).json({ success: false, error: "Media asset not found." });
      return;
    }
    res.json({ success: true, message: "Media asset removed." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to delete media asset." });
  }
});
apiApp.post("/admin/media/upload", authenticateAdmin, async (req, res) => {
  try {
    const { fileBase64, filename, mimeType, altText } = req.body;
    if (!fileBase64 || !filename || !mimeType) {
      res.status(400).json({ success: false, error: "fileBase64, filename, and mimeType are required." });
      return;
    }
    const base64Data = fileBase64.replace(/^data:([A-Za-z-+/]+);base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    const uploadRes = await mediaStorage.saveFile(buffer, filename, mimeType);
    const assetRecord = {
      id: `med-${Date.now()}`,
      filename: uploadRes.filename,
      url: uploadRes.url,
      mimeType: uploadRes.mimeType,
      sizeBytes: uploadRes.size,
      altText: altText || uploadRes.filename,
      caption: "",
      usageCount: 0,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const saved = await mediaRepository.save(assetRecord, req.user?.email || "admin");
    res.json({ success: true, data: saved, message: "File uploaded and registered successfully." });
  } catch (err) {
    console.error("File upload error:", err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});
apiApp.get("/admin/settings", authenticateAdmin, async (_req, res) => {
  try {
    const data = await settingsRepository.getSettings();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch settings." });
  }
});
apiApp.put("/admin/settings", authenticateAdmin, async (req, res) => {
  try {
    const updated = await settingsRepository.updateSettings(req.body, req.user?.email || "admin");
    res.json({ success: true, data: updated, message: "Settings saved." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update settings." });
  }
});
apiApp.get("/admin/dashboard-stats", authenticateAdmin, async (_req, res) => {
  try {
    const stats = await getDatabaseAdapter().getDashboardStats();
    res.json({
      success: true,
      ...stats
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch dashboard metrics." });
  }
});
apiApp.get(["/admin/audit-logs", "/admin/audit"], authenticateAdmin, async (req, res) => {
  try {
    const limit = parseInt(String(req.query.limit || "50"), 10);
    const logs = await auditRepository.getLogs(limit);
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch audit logs." });
  }
});
apiApp.use("/support", supportRouter);

// server/index.ts
init_env();
validateEnvironment();
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path5.dirname(__filename2);
var app = express2();
getDatabaseAdapter().connect().then(() => {
  console.log(`\u{1F680} Database engine initialized [Provider: ${env.DATABASE_PROVIDER}]`);
}).catch((err) => {
  console.error("\u274C Failed to initialize database on startup:", err.message);
  if (env.DATABASE_PROVIDER === "mysql") {
    console.error("\u{1F4A5} Critical Database Failure: Hostinger MySQL unreachable. Silent fallback to JSON is strictly prohibited.");
    if (env.NODE_ENV === "production") {
      console.error("\u{1F4A5} Terminating production process to prevent inconsistent data state.");
      process.exit(1);
    }
  }
});
app.use("/uploads", express2.static(mediaStorage.getStorageDirectory()));
app.use("/api", apiApp);
var distPath = fs4.existsSync(path5.resolve(__dirname2, "../dist")) ? path5.resolve(__dirname2, "../dist") : path5.resolve(__dirname2, "./dist");
app.use(express2.static(distPath));
app.use((req, res, next) => {
  if (req.method !== "GET") return next();
  if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
    return next();
  }
  const indexPath = path5.join(distPath, "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send("Zanzirangi House - Frontend distribution not built yet. Please run `npm run build`.");
    }
  });
});
var PORT = env.PORT || 3e3;
var HOST = "0.0.0.0";
var server;
if (process.argv[1] && process.argv[1].endsWith("index.ts") || process.argv[1]?.endsWith("index.js") || process.argv[1]?.endsWith("server.js") || process.env.NODE_ENV === "production") {
  server = app.listen(PORT, HOST, () => {
    console.log(`\u{1F3F0} Zanzirangi House Production Engine running on ${env.APP_URL} (Host: ${HOST}, Port: ${PORT})`);
  });
  const shutdown = async (signal) => {
    console.log(`
\u{1F6D1} Received ${signal}. Initiating graceful shutdown...`);
    if (server) {
      server.close(async () => {
        try {
          await getDatabaseAdapter().disconnect();
          console.log("\u2705 Closed database connections.");
        } catch (e) {
          console.error("Error closing database connections:", e.message);
        }
        console.log("\u{1F3C1} Application process exited cleanly.");
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}
export {
  app
};
