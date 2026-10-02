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
import fs2 from "fs";
import path2 from "path";
function parseCorsOrigin(val) {
  if (!val || val === "*") return "*";
  if (val.includes(",")) {
    return val.split(",").map((s) => s.trim());
  }
  return val.trim();
}
function readJson(file) {
  try {
    return JSON.parse(fs2.readFileSync(path2.resolve(process.cwd(), file), "utf8"));
  } catch {
    return null;
  }
}
function readReleaseInfo() {
  const pkg = readJson("package.json");
  const stamp = readJson("release.json");
  const str = (v) => typeof v === "string" && v.trim() ? v.trim().slice(0, 64) : null;
  const deployment = stamp && str(stamp.commit) ? {
    tag: str(stamp.tag),
    commit: str(stamp.commit).slice(0, 12),
    build: str(String(stamp.build ?? "")) || "unknown",
    environment: str(stamp.environment) || "unknown",
    deployedAt: str(stamp.deployedAt) || "unknown"
  } : null;
  return {
    version: str(pkg?.version) || process.env.npm_package_version || "unknown",
    releaseDate: str(pkg?.releaseDate),
    deployment
  };
}
function defaultProductionMediaPath() {
  const cwd = process.cwd().replace(/\\/g, "/");
  const versioned = cwd.match(/^(.*?)\/hbuilds\/versions\/[^/]+/);
  return versioned ? `${versioned[1]}/zanzirangi-media` : path2.resolve(process.cwd(), "..", "zanzirangi-media");
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
var isProductionRuntime, nodeEnv, releaseInfo, env;
var init_env = __esm({
  "server/config/env.ts"() {
    isProductionRuntime = process.env.NODE_ENV === "production";
    if (!isProductionRuntime) {
      dotenv.config({ path: path2.resolve(process.cwd(), ".env.local"), quiet: true });
    }
    dotenv.config({ path: path2.resolve(process.cwd(), ".env"), quiet: true });
    nodeEnv = process.env.NODE_ENV || "development";
    releaseInfo = readReleaseInfo();
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
      // Production default lives OUTSIDE the deployed app directory so uploads survive redeploys
      // (each Hostinger build replaces the app directory). Override with MEDIA_STORAGE_PATH.
      MEDIA_STORAGE_PATH: process.env.MEDIA_STORAGE_PATH || (nodeEnv === "production" ? defaultProductionMediaPath() : path2.resolve(process.cwd(), "uploads")),
      MAX_UPLOAD_SIZE_MB: parseInt(process.env.MAX_UPLOAD_SIZE || process.env.MAX_UPLOAD_SIZE_MB || "25", 10),
      CORS_ORIGIN: parseCorsOrigin(process.env.CORS_ORIGIN || (nodeEnv === "production" ? "https://zanzirangihouse.com" : "http://localhost:3000")),
      LOG_LEVEL: process.env.LOG_LEVEL || (nodeEnv === "production" ? "info" : "debug"),
      APP_VERSION: releaseInfo.version,
      APP_RELEASE_DATE: releaseInfo.releaseDate,
      APP_DEPLOYMENT: releaseInfo.deployment,
      SITE_NOINDEX: process.env.SITE_NOINDEX === "true"
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
    const user = process.env.DB_USER || env.MYSQL_USER || "";
    const password = process.env.DB_PASSWORD || env.MYSQL_PASSWORD || "";
    const database = process.env.DB_NAME || env.MYSQL_DATABASE || "";
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
  const user = process.env.DB_USER || env.MYSQL_USER || "";
  const database = process.env.DB_NAME || env.MYSQL_DATABASE || "";
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
import fs5 from "fs";
import path5 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";

// server/api.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import bcrypt3 from "bcryptjs";

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
  address: "Kwa Lila 31, Bwejuu 72111, Zanzibar, Tanzania",
  instagram: "https://instagram.com/zanzirangi.house",
  facebook: "https://facebook.com/zanzirangihouse",
  youtube: "https://youtube.com/@zanzirangihouse",
  bookingUrl: "https://zanzirangihouse.com/#stay",
  logo: "/src/assets/zanzirangi-logo-new.jpeg",
  favicon: "/favicon.svg",
  maintenanceMode: false,
  supportAvatar: "/uploads/avatar-1790937078607_1790937078818_0381644b.jpg",
  supportName: "Elena",
  supportTitle: "Customer Support",
  supportStatus: "Active 24/7"
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
    email: "info@zanzirangihouse.com",
    whatsappNumber: "255777890123",
    address: "Kwa Lila 31, Bwejuu 72111, Zanzibar, Tanzania",
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
  async deleteFacility(id, userEmail) {
    const db = getDatabase();
    const before = (db.facilities || []).length;
    db.facilities = (db.facilities || []).filter((f) => f.id !== id);
    if (db.facilities.length === before) return false;
    db.auditLog.push({ action: "FACILITY_DELETED", userEmail, timestamp: (/* @__PURE__ */ new Date()).toISOString(), details: `Removed facility ${id}` });
    saveDatabase(db);
    return true;
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
      status: u.status || "active",
      permissions: u.permissions || [],
      tokenVersion: u.tokenVersion ?? 1,
      passwordHash: u.passwordHash,
      createdAt: u.createdAt,
      lastLogin: u.lastLogin ?? void 0
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
  async findUserById(id) {
    const db = getDatabase();
    return db.users.find((u) => u.id === id) || null;
  }
  async listUsers() {
    const db = getDatabase();
    return db.users.map(({ passwordHash, ...safe }) => safe);
  }
  async createUser(user) {
    const db = getDatabase();
    db.users.push(user);
    saveDatabase(db);
    return user;
  }
  async updateUser(id, data) {
    const db = getDatabase();
    const idx = db.users.findIndex((u) => u.id === id);
    if (idx < 0) throw new Error(`User with ID ${id} not found.`);
    const current = db.users[idx];
    const next = {
      ...current,
      name: data.name ?? current.name,
      role: data.role ?? current.role,
      status: data.status ?? current.status,
      permissions: data.permissions ?? current.permissions
    };
    const accessChanged = next.role !== current.role || next.status !== current.status || JSON.stringify(next.permissions || []) !== JSON.stringify(current.permissions || []);
    next.tokenVersion = (current.tokenVersion ?? 1) + (accessChanged ? 1 : 0);
    db.users[idx] = next;
    saveDatabase(db);
    return next;
  }
  async disableUser(id) {
    const db = getDatabase();
    const idx = db.users.findIndex((u) => u.id === id);
    if (idx >= 0) {
      db.users[idx].status = "disabled";
      db.users[idx].tokenVersion = (db.users[idx].tokenVersion ?? 1) + 1;
      saveDatabase(db);
    }
  }
  async enableUser(id) {
    const db = getDatabase();
    const idx = db.users.findIndex((u) => u.id === id);
    if (idx >= 0) {
      db.users[idx].status = "active";
      db.users[idx].tokenVersion = (db.users[idx].tokenVersion ?? 1) + 1;
      saveDatabase(db);
    }
  }
  async resetPassword(id, newPasswordHash) {
    const db = getDatabase();
    const idx = db.users.findIndex((u) => u.id === id);
    if (idx >= 0) {
      db.users[idx].passwordHash = newPasswordHash;
      db.users[idx].tokenVersion = (db.users[idx].tokenVersion ?? 1) + 1;
      saveDatabase(db);
    }
  }
  async getActiveUserCount() {
    const db = getDatabase();
    return (db.users || []).filter((u) => u.status !== "disabled").length;
  }
  async updateLastLogin(id) {
    const db = getDatabase();
    const u = db.users.find((x) => x.id === id);
    if (u) {
      u.lastLogin = (/* @__PURE__ */ new Date()).toISOString();
      saveDatabase(db);
    }
  }
  async revokeUserSessions(id) {
    const db = getDatabase();
    const u = db.users.find((x) => x.id === id);
    if (u) {
      u.tokenVersion = (u.tokenVersion ?? 1) + 1;
      saveDatabase(db);
    }
  }
  // --- Extended CMS Coverage Fallbacks ---
  async getPageContent(id) {
    return null;
  }
  async getAllPages() {
    return [];
  }
  async updatePageContent(id, data, userEmail) {
    return { id, slug: id, title: id, ...data };
  }
  async getChauffeurConfig() {
    return {
      eyebrow: "VIP CHAUFFEUR & TRANSFERS",
      heading: "ARRIVE. RELAX. WE'LL TAKE CARE OF THE REST.",
      subhead: "From the moment your flight touches down in Zanzibar...",
      routeLabel: "ABEID AMANI KARUME INT'L (ZNZ) \u2192 ZANZIRANGI HOUSE",
      routeTitle: "Private Coastal Chauffeur Service",
      vehicleImage: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=85",
      specsEyebrow: "TRANSFER SPECIFICATIONS",
      cardTitle: "Private Sanctuary Chauffeur",
      airportTitle: "AIRPORT TRANSFER",
      airportDesc: "Direct tarmac welcome and luggage assistance upon arrival.",
      shuttleTitle: "PRIVATE SHUTTLE",
      shuttleDesc: "Exclusive vehicles reserved solely for your traveling party.",
      vehicleTypeTitle: "VEHICLE TYPE",
      vehicleTypeDesc: "Executive SUV / Luxury Van (Details available on request)",
      passengerLuggageTitle: "PASSENGER & LUGGAGE",
      passengerLuggageDesc: "Tailored to group size (Details available on request)",
      amenitiesNote: "Complimentary chilled mineral water, cool hand towels, and high-speed in-car Wi-Fi provided for every transfer.",
      ctaRequestLabel: "REQUEST AIRPORT TRANSFER",
      ctaAddBookingLabel: "ADD TO BOOKING"
    };
  }
  async updateChauffeurConfig(data, userEmail) {
    return { ...await this.getChauffeurConfig(), ...data };
  }
  async getWhyStayConfig() {
    return {
      eyebrow: "THE SANCTUARY DIFFERENCE",
      heading: "WHY ZANZIRANGI HOUSE",
      subhead: "Four guiding values define every moment at our retreat.",
      pillars: []
    };
  }
  async updateWhyStayConfig(data, userEmail) {
    return { ...await this.getWhyStayConfig(), ...data };
  }
  async getDiningConfig() {
    return {
      eyebrow: "Gastronomic Soul",
      heading: "TASTE ZANZIBAR",
      subhead: '"Fresh ingredients, island flavours and authentic Tanzanian hospitality."',
      intro: "Centuries of Swahili, Omani, and Indian Ocean sea trade come together at our tables.",
      gardenEyebrow: "Culinary Storytelling",
      gardenBadge: "Estate Garden",
      gardenTitle: "FROM OUR GARDEN TO YOUR TABLE",
      gardenDesc: "Tucked within the grounds of Zanzirangi House is our private botanical garden...",
      tagZeroMiles: "\u{1F331} Zero Food Miles",
      tagSpices: "\u{1F336} Hand-Picked Daily Spices",
      tagSeafood: "\u{1F41F} Sustainable Coastal Seafood",
      moments: []
    };
  }
  async updateDiningConfig(data, userEmail) {
    return { ...await this.getDiningConfig(), ...data };
  }
  async getDiningCategories() {
    return [];
  }
  async saveDiningCategory(category, userEmail) {
    return category;
  }
  async deleteDiningCategory(id, userEmail) {
    return true;
  }
  async getExperiences() {
    return [];
  }
  async saveExperience(item, userEmail) {
    return item;
  }
  async deleteExperience(id, userEmail) {
    return true;
  }
  async getSafariDestinations() {
    return [];
  }
  async saveSafariDestination(item, userEmail) {
    return item;
  }
  async deleteSafariDestination(id, userEmail) {
    return true;
  }
  async getGlobalContent() {
    return {
      brandName: "Zanzirangi House",
      navLinks: [],
      ctaPlanStayLabel: "PLAN YOUR STAY",
      ctaPlanStayLink: "#stay"
    };
  }
  async updateGlobalContent(data, userEmail) {
    return { ...await this.getGlobalContent(), ...data };
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
  // --- Content Translations ---
  async getContentTranslations(lang) {
    const db = getDatabase();
    return db.contentTranslations?.[lang] || [];
  }
  async saveContentTranslations(lang, entries, userEmail) {
    const db = getDatabase();
    db.contentTranslations = db.contentTranslations || {};
    const list = db.contentTranslations[lang] || [];
    for (const e of entries) {
      const i = list.findIndex((x) => x.entity === e.entity && x.path === e.path);
      if (!e.value || !e.value.trim()) {
        if (i >= 0) list.splice(i, 1);
        continue;
      }
      const record = { ...e, updatedAt: (/* @__PURE__ */ new Date()).toISOString(), updatedBy: userEmail };
      if (i >= 0) list[i] = record;
      else list.push(record);
    }
    db.contentTranslations[lang] = list;
    saveDatabase(db);
    return entries.length;
  }
};

// server/database/mysqlAdapter.ts
init_connection();
init_env();
var CHAUFFEUR_COLUMN_FIELDS = [
  "eyebrow",
  "heading",
  "subhead",
  "routeLabel",
  "routeTitle",
  "vehicleImage",
  "specsEyebrow",
  "cardTitle",
  "airportTitle",
  "airportDesc",
  "shuttleTitle",
  "shuttleDesc",
  "vehicleTypeTitle",
  "vehicleTypeDesc",
  "passengerLuggageTitle",
  "passengerLuggageDesc",
  "amenitiesNote",
  "ctaRequestLabel",
  "ctaAddBookingLabel",
  "specItems"
];
var WHY_STAY_COLUMN_FIELDS = ["eyebrow", "heading", "subhead", "pillars"];
var DINING_CONFIG_COLUMN_FIELDS = [
  "eyebrow",
  "heading",
  "subhead",
  "intro",
  "gardenEyebrow",
  "gardenBadge",
  "gardenTitle",
  "gardenDesc",
  "tagZeroMiles",
  "tagSpices",
  "tagSeafood",
  "moments"
];
var GLOBAL_COLUMN_FIELDS = [
  "brandName",
  "navLinks",
  "ctaPlanStayLabel",
  "ctaPlanStayLink",
  "footerTagline",
  "footerCopyright",
  "contactPhone",
  "contactEmail",
  "contactWhatsapp",
  "contactAddress",
  "socials"
];
var EXPERIENCE_COLUMN_FIELDS = [
  "title",
  "category",
  "duration",
  "tag",
  "priceNote",
  "shortDescription",
  "description",
  "imageUrl",
  "whatsappMessage",
  "order",
  "visible"
];
var SAFARI_COLUMN_FIELDS = [
  "name",
  "tagline",
  "region",
  "flightTimeFromZanzibar",
  "heroImage",
  "description",
  "highlights",
  "bestFor",
  "safariType",
  "order",
  "visible"
];
var DINING_CATEGORY_COLUMN_FIELDS = ["name", "tabLabel", "subtitle", "description", "imageUrl", "signatureDishes", "order", "visible"];
var MysqlDatabaseAdapter = class {
  constructor() {
    this.provider = "mysql";
    // --- Extra CMS fields ---
    // Content tables store their main fields in columns. Any additional editor field (visibility toggles,
    // extra labels, images…) is kept in an `extras_json` column so saves never silently drop data.
    this.extrasColumnReady = /* @__PURE__ */ new Set();
    // --- Content Translations ---
    this.translationsTableReady = false;
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
      const db = process.env.DB_NAME || env.MYSQL_DATABASE || "";
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
    await this.ensureExtrasColumn("homepage_config");
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
          // The admin editor and HeroSection read/write `heroImage`.
          heroImage: s.image_url,
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
        email: cfg.contact_email || "info@zanzirangihouse.com",
        whatsappNumber: cfg.contact_whatsapp || "255777890123",
        address: cfg.contact_address || "Kwa Lila 31, Bwejuu 72111, Zanzibar, Tanzania",
        googleMapsUrl: this.parseExtras(cfg.extras_json).contactGoogleMapsUrl || void 0
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
    await this.ensureExtrasColumn("homepage_config");
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
                s.heroImage || s.imageUrl || "",
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
        if (data.contact.googleMapsUrl !== void 0) {
          const [extraRows] = await conn.query("SELECT extras_json FROM homepage_config WHERE id = 1");
          const extras = this.parseExtras(extraRows[0]?.extras_json);
          extras.contactGoogleMapsUrl = data.contact.googleMapsUrl || void 0;
          await conn.query("UPDATE homepage_config SET extras_json = ? WHERE id = 1", [JSON.stringify(extras)]);
        }
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
  async deleteFacility(id, userEmail) {
    const pool = this.getPool();
    const [res] = await pool.query("DELETE FROM facilities WHERE id = ?", [id]);
    if (res.affectedRows > 0) {
      await this.addAuditLog({ action: "FACILITY_DELETED", userEmail, details: `Removed facility ${id}` });
      return true;
    }
    return false;
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
      address: r.address || "Kwa Lila 31, Bwejuu 72111, Zanzibar, Tanzania",
      instagram: r.instagram || "https://instagram.com/zanzirangi.house",
      facebook: r.facebook || "https://facebook.com/zanzirangihouse",
      youtube: r.youtube || "https://youtube.com/@zanzirangihouse",
      bookingUrl: r.booking_url || "https://zanzirangihouse.com/#stay",
      logo: r.logo || "/src/assets/zanzirangi-logo-new.jpeg",
      favicon: r.favicon || "/favicon.svg",
      maintenanceMode: Boolean(r.maintenance_mode),
      supportAvatar: r.support_avatar || "/uploads/avatar-1790937078607_1790937078818_0381644b.jpg",
      supportName: r.support_name || "Elena",
      supportTitle: r.support_title || "Customer Support",
      supportStatus: r.support_status || "Active 24/7"
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
         default_language, logo, favicon, maintenance_mode, support_avatar, support_name, support_title, support_status) 
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
        site_name = VALUES(site_name), tagline = VALUES(tagline), phone = VALUES(phone), 
        concierge_phone = VALUES(concierge_phone), whatsapp = VALUES(whatsapp), email = VALUES(email), 
        reservation_notification_email = VALUES(reservation_notification_email), 
        reservation_email = VALUES(reservation_email), address = VALUES(address), 
        instagram = VALUES(instagram), facebook = VALUES(facebook), youtube = VALUES(youtube), 
        booking_url = VALUES(booking_url), currency = VALUES(currency), default_currency = VALUES(default_currency), 
        default_language = VALUES(default_language), logo = VALUES(logo), favicon = VALUES(favicon), 
        maintenance_mode = VALUES(maintenance_mode), support_avatar = VALUES(support_avatar),
        support_name = VALUES(support_name), support_title = VALUES(support_title),
        support_status = VALUES(support_status)`,
      [
        merged.siteName || "Zanzirangi House",
        merged.tagline || "",
        merged.phone || merged.conciergePhone || "+255 777 890 123",
        merged.conciergePhone || "+255 777 890 123",
        merged.whatsapp || "+255 777 890 123",
        merged.email || "info@zanzirangihouse.com",
        merged.reservationNotificationEmail || "reservations@zanzirangihouse.com",
        merged.reservationEmail || merged.reservationNotificationEmail || "reservations@zanzirangihouse.com",
        merged.address || "Kwa Lila 31, Bwejuu 72111, Zanzibar, Tanzania",
        merged.instagram || "https://instagram.com/zanzirangi.house",
        merged.facebook || "https://facebook.com/zanzirangihouse",
        merged.youtube || "https://youtube.com/@zanzirangihouse",
        merged.bookingUrl || "https://zanzirangihouse.com/#stay",
        merged.currency || "USD",
        merged.defaultCurrency || "USD ($)",
        merged.defaultLanguage || "en",
        merged.logo || "/src/assets/zanzirangi-logo-new.jpeg",
        merged.favicon || "/favicon.svg",
        merged.maintenanceMode ? 1 : 0,
        merged.supportAvatar || "/uploads/avatar-1790937078607_1790937078818_0381644b.jpg",
        merged.supportName || "Elena",
        merged.supportTitle || "Customer Support",
        merged.supportStatus || "Active 24/7"
      ]
    );
    await this.addAuditLog({
      action: "SETTINGS_UPDATED",
      userEmail,
      details: "Updated sanctuary site settings"
    });
    return this.getSettings();
  }
  // --- Users & Admin Access Management ---
  async findUserByEmail(email) {
    const pool = this.getPool();
    const [rows] = await pool.query("SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1", [
      email.trim().toLowerCase()
    ]);
    if (!rows || rows.length === 0) return null;
    const u = rows[0];
    let perms = [];
    if (u.permissions) {
      try {
        perms = typeof u.permissions === "string" ? JSON.parse(u.permissions) : u.permissions;
      } catch {
        perms = [];
      }
    }
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      status: u.status || "active",
      permissions: perms,
      tokenVersion: u.token_version ?? 1,
      passwordHash: u.password_hash,
      createdAt: u.created_at ? new Date(u.created_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
      lastLogin: u.last_login ? new Date(u.last_login).toISOString() : void 0
    };
  }
  async findUserById(id) {
    const pool = this.getPool();
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ? LIMIT 1", [id]);
    if (!rows || rows.length === 0) return null;
    const u = rows[0];
    let perms = [];
    if (u.permissions) {
      try {
        perms = typeof u.permissions === "string" ? JSON.parse(u.permissions) : u.permissions;
      } catch {
        perms = [];
      }
    }
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      status: u.status || "active",
      permissions: perms,
      tokenVersion: u.token_version ?? 1,
      passwordHash: u.password_hash,
      createdAt: u.created_at ? new Date(u.created_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
      lastLogin: u.last_login ? new Date(u.last_login).toISOString() : void 0
    };
  }
  async saveUser(user) {
    const pool = this.getPool();
    const permsJson = JSON.stringify(user.permissions || []);
    await pool.query(
      `INSERT INTO users (id, email, name, role, status, permissions, token_version, password_hash, created_at, last_login) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
        name = VALUES(name), role = VALUES(role), status = VALUES(status), 
        permissions = VALUES(permissions), token_version = VALUES(token_version),
        password_hash = VALUES(password_hash), last_login = VALUES(last_login)`,
      [
        user.id,
        user.email.toLowerCase().trim(),
        user.name,
        user.role,
        user.status || "active",
        permsJson,
        user.tokenVersion ?? 1,
        user.passwordHash,
        user.createdAt || /* @__PURE__ */ new Date(),
        user.lastLogin || null
      ]
    );
  }
  async listUsers() {
    const pool = this.getPool();
    const [rows] = await pool.query("SELECT id, email, name, role, status, permissions, token_version, created_at, last_login FROM users ORDER BY created_at ASC");
    return rows.map((u) => {
      let perms = [];
      if (u.permissions) {
        try {
          perms = typeof u.permissions === "string" ? JSON.parse(u.permissions) : u.permissions;
        } catch {
          perms = [];
        }
      }
      return {
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        status: u.status || "active",
        permissions: perms,
        tokenVersion: u.token_version ?? 1,
        createdAt: u.created_at ? new Date(u.created_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
        lastLogin: u.last_login ? new Date(u.last_login).toISOString() : void 0
      };
    });
  }
  async createUser(user) {
    const pool = this.getPool();
    const permsJson = JSON.stringify(user.permissions || []);
    await pool.query(
      `INSERT INTO users (id, email, name, role, status, permissions, token_version, password_hash, created_at, last_login)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        user.email.toLowerCase().trim(),
        user.name,
        user.role,
        user.status || "active",
        permsJson,
        user.tokenVersion ?? 1,
        user.passwordHash,
        user.createdAt || /* @__PURE__ */ new Date(),
        user.lastLogin || null
      ]
    );
    return user;
  }
  async updateUser(id, data) {
    const pool = this.getPool();
    const existing = await this.findUserById(id);
    if (!existing) throw new Error(`User with ID ${id} not found.`);
    const merged = {
      ...existing,
      name: data.name !== void 0 ? data.name : existing.name,
      role: data.role !== void 0 ? data.role : existing.role,
      status: data.status !== void 0 ? data.status : existing.status,
      permissions: data.permissions !== void 0 ? data.permissions : existing.permissions
    };
    const accessChanged = merged.role !== existing.role || merged.status !== existing.status || JSON.stringify(merged.permissions || []) !== JSON.stringify(existing.permissions || []);
    merged.tokenVersion = (existing.tokenVersion ?? 1) + (accessChanged ? 1 : 0);
    await pool.query(
      `UPDATE users 
       SET name = ?, role = ?, status = ?, permissions = ?, token_version = ?
       WHERE id = ?`,
      [
        merged.name,
        merged.role,
        merged.status || "active",
        JSON.stringify(merged.permissions || []),
        merged.tokenVersion,
        id
      ]
    );
    return merged;
  }
  async disableUser(id) {
    const pool = this.getPool();
    await pool.query('UPDATE users SET status = "disabled", token_version = token_version + 1 WHERE id = ?', [id]);
  }
  async enableUser(id) {
    const pool = this.getPool();
    await pool.query('UPDATE users SET status = "active", token_version = token_version + 1 WHERE id = ?', [id]);
  }
  async resetPassword(id, newPasswordHash) {
    const pool = this.getPool();
    await pool.query("UPDATE users SET password_hash = ?, token_version = token_version + 1 WHERE id = ?", [
      newPasswordHash,
      id
    ]);
  }
  async getActiveUserCount() {
    const pool = this.getPool();
    const [rows] = await pool.query("SELECT COUNT(*) as activeCount FROM users WHERE COALESCE(status, 'active') <> 'disabled'");
    return Number(rows[0]?.activeCount || 0);
  }
  async updateLastLogin(id) {
    await this.getPool().query("UPDATE users SET last_login = NOW() WHERE id = ?", [id]);
  }
  async revokeUserSessions(id) {
    await this.getPool().query("UPDATE users SET token_version = token_version + 1 WHERE id = ?", [id]);
  }
  // --- Extended CMS Coverage: Pages ---
  async getPageContent(id) {
    const pool = this.getPool();
    const [rows] = await pool.query("SELECT * FROM page_contents WHERE id = ? OR slug = ? LIMIT 1", [id, id]);
    if (!rows || rows.length === 0) return null;
    const r = rows[0];
    let sectionsConfig = [];
    let contentJson = null;
    if (r.sections_config) {
      try {
        sectionsConfig = typeof r.sections_config === "string" ? JSON.parse(r.sections_config) : r.sections_config;
      } catch {
      }
    }
    if (r.content_json) {
      try {
        contentJson = typeof r.content_json === "string" ? JSON.parse(r.content_json) : r.content_json;
      } catch {
      }
    }
    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      eyebrow: r.eyebrow,
      heading: r.heading,
      subheading: r.subheading,
      description: r.description,
      heroImage: r.hero_image,
      sectionsConfig,
      contentJson,
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : void 0,
      updatedBy: r.updated_by
    };
  }
  async getAllPages() {
    const pool = this.getPool();
    const [rows] = await pool.query("SELECT * FROM page_contents ORDER BY id ASC");
    return rows.map((r) => {
      let sectionsConfig = [];
      let contentJson = null;
      if (r.sections_config) {
        try {
          sectionsConfig = typeof r.sections_config === "string" ? JSON.parse(r.sections_config) : r.sections_config;
        } catch {
        }
      }
      if (r.content_json) {
        try {
          contentJson = typeof r.content_json === "string" ? JSON.parse(r.content_json) : r.content_json;
        } catch {
        }
      }
      return {
        id: r.id,
        slug: r.slug,
        title: r.title,
        eyebrow: r.eyebrow,
        heading: r.heading,
        subheading: r.subheading,
        description: r.description,
        heroImage: r.hero_image,
        sectionsConfig,
        contentJson,
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : void 0,
        updatedBy: r.updated_by
      };
    });
  }
  async updatePageContent(id, data, userEmail) {
    const pool = this.getPool();
    const existing = await this.getPageContent(id);
    if (!existing) throw new Error(`Page '${id}' not found.`);
    const merged = {
      ...existing,
      ...data,
      id: existing.id,
      slug: data.slug || existing.slug,
      updatedBy: userEmail,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await pool.query(
      `UPDATE page_contents 
       SET title = ?, eyebrow = ?, heading = ?, subheading = ?, description = ?, hero_image = ?, sections_config = ?, content_json = ?, updated_by = ?
       WHERE id = ?`,
      [
        merged.title,
        merged.eyebrow || null,
        merged.heading || null,
        merged.subheading || null,
        merged.description || null,
        merged.heroImage || null,
        JSON.stringify(merged.sectionsConfig || []),
        merged.contentJson ? JSON.stringify(merged.contentJson) : null,
        userEmail,
        // `id` may be a slug (e.g. 'home' for row 'page_home'); always target the resolved row id.
        existing.id
      ]
    );
    await this.addAuditLog({
      action: "PAGE_UPDATED",
      userEmail,
      details: `Updated page content for ${id} (${merged.title})`
    });
    return merged;
  }
  // --- Extended CMS Coverage: Chauffeur & Transfers ---
  async getChauffeurConfig() {
    const pool = this.getPool();
    await this.ensureExtrasColumn("chauffeur_config");
    const [rows] = await pool.query("SELECT * FROM chauffeur_config WHERE id = 1 LIMIT 1");
    const r = rows[0] || {};
    let specItems = [];
    if (r.spec_items_json) {
      try {
        specItems = typeof r.spec_items_json === "string" ? JSON.parse(r.spec_items_json) : r.spec_items_json;
      } catch {
      }
    }
    return {
      ...this.parseExtras(r.extras_json),
      id: 1,
      eyebrow: r.eyebrow || "VIP CHAUFFEUR & TRANSFERS",
      heading: r.heading || "ARRIVE. RELAX. WE'LL TAKE CARE OF THE REST.",
      subhead: r.subhead || "From the moment your flight touches down in Zanzibar, our private chauffeur service ensures your transition to Zanzirangi House is completely effortless, serene, and secure.",
      routeLabel: r.route_label || "ABEID AMANI KARUME INT'L (ZNZ) \u2192 ZANZIRANGI HOUSE",
      routeTitle: r.route_title || "Private Coastal Chauffeur Service",
      vehicleImage: r.vehicle_image || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=85",
      specsEyebrow: r.specs_eyebrow || "TRANSFER SPECIFICATIONS",
      cardTitle: r.card_title || "Private Sanctuary Chauffeur",
      airportTitle: r.airport_title || "AIRPORT TRANSFER",
      airportDesc: r.airport_desc || "Direct tarmac welcome and luggage assistance upon arrival.",
      shuttleTitle: r.shuttle_title || "PRIVATE SHUTTLE",
      shuttleDesc: r.shuttle_desc || "Exclusive vehicles reserved solely for your traveling party.",
      vehicleTypeTitle: r.vehicle_type_title || "VEHICLE TYPE",
      vehicleTypeDesc: r.vehicle_type_desc || "Executive SUV / Luxury Van (Details available on request)",
      passengerLuggageTitle: r.passenger_luggage_title || "PASSENGER & LUGGAGE",
      passengerLuggageDesc: r.passenger_luggage_desc || "Tailored to group size (Details available on request)",
      amenitiesNote: r.amenities_note || "Complimentary chilled mineral water, cool hand towels, and high-speed in-car Wi-Fi provided for every transfer.",
      ctaRequestLabel: r.cta_request_label || "REQUEST AIRPORT TRANSFER",
      ctaAddBookingLabel: r.cta_add_booking_label || "ADD TO BOOKING",
      specItems,
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : void 0,
      updatedBy: r.updated_by
    };
  }
  async updateChauffeurConfig(data, userEmail) {
    const pool = this.getPool();
    const current = await this.getChauffeurConfig();
    const merged = {
      ...current,
      ...this.definedOnly(data),
      updatedBy: userEmail,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await pool.query(
      `UPDATE chauffeur_config 
       SET eyebrow = ?, heading = ?, subhead = ?, route_label = ?, route_title = ?, vehicle_image = ?,
           specs_eyebrow = ?, card_title = ?, airport_title = ?, airport_desc = ?, shuttle_title = ?, shuttle_desc = ?,
           vehicle_type_title = ?, vehicle_type_desc = ?, passenger_luggage_title = ?, passenger_luggage_desc = ?,
           amenities_note = ?, cta_request_label = ?, cta_add_booking_label = ?, spec_items_json = ?, extras_json = ?, updated_by = ?
       WHERE id = 1`,
      [
        merged.eyebrow,
        merged.heading,
        merged.subhead,
        merged.routeLabel,
        merged.routeTitle,
        merged.vehicleImage,
        merged.specsEyebrow,
        merged.cardTitle,
        merged.airportTitle,
        merged.airportDesc,
        merged.shuttleTitle,
        merged.shuttleDesc,
        merged.vehicleTypeTitle,
        merged.vehicleTypeDesc,
        merged.passengerLuggageTitle,
        merged.passengerLuggageDesc,
        merged.amenitiesNote,
        merged.ctaRequestLabel,
        merged.ctaAddBookingLabel,
        JSON.stringify(merged.specItems || []),
        this.collectExtras(merged, CHAUFFEUR_COLUMN_FIELDS),
        userEmail
      ]
    );
    await this.addAuditLog({
      action: "TRANSFERS_UPDATED",
      userEmail,
      details: "Updated VIP Chauffeur & Transfers configuration"
    });
    return merged;
  }
  // --- Extended CMS Coverage: Why Stay / Pillars ---
  async getWhyStayConfig() {
    const pool = this.getPool();
    await this.ensureExtrasColumn("why_stay_config");
    const [rows] = await pool.query("SELECT * FROM why_stay_config WHERE id = 1 LIMIT 1");
    const r = rows[0] || {};
    let pillars = [];
    if (r.pillars_json) {
      try {
        pillars = typeof r.pillars_json === "string" ? JSON.parse(r.pillars_json) : r.pillars_json;
      } catch {
      }
    }
    return {
      ...this.parseExtras(r.extras_json),
      id: 1,
      eyebrow: r.eyebrow || "THE SANCTUARY DIFFERENCE",
      heading: r.heading || "WHY ZANZIRANGI HOUSE",
      subhead: r.subhead || "Four guiding values define every moment at our retreat, creating a rare atmosphere of calm, exclusivity, and profound connection to Tanzania.",
      pillars,
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : void 0,
      updatedBy: r.updated_by
    };
  }
  async updateWhyStayConfig(data, userEmail) {
    const pool = this.getPool();
    const current = await this.getWhyStayConfig();
    const merged = {
      ...current,
      ...this.definedOnly(data),
      updatedBy: userEmail,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await pool.query(
      `UPDATE why_stay_config 
       SET eyebrow = ?, heading = ?, subhead = ?, pillars_json = ?, extras_json = ?, updated_by = ?
       WHERE id = 1`,
      [
        merged.eyebrow,
        merged.heading,
        merged.subhead,
        JSON.stringify(merged.pillars || []),
        this.collectExtras(merged, WHY_STAY_COLUMN_FIELDS),
        userEmail
      ]
    );
    await this.addAuditLog({
      action: "WHY_STAY_UPDATED",
      userEmail,
      details: "Updated Why Stay / Sanctuary Difference configuration"
    });
    return merged;
  }
  // --- Extended CMS Coverage: Dining ---
  async getDiningConfig() {
    const pool = this.getPool();
    await this.ensureExtrasColumn("dining_config");
    const [rows] = await pool.query("SELECT * FROM dining_config WHERE id = 1 LIMIT 1");
    const r = rows[0] || {};
    let moments = [];
    if (r.moments_json) {
      try {
        moments = typeof r.moments_json === "string" ? JSON.parse(r.moments_json) : r.moments_json;
      } catch {
      }
    }
    return {
      ...this.parseExtras(r.extras_json),
      id: 1,
      eyebrow: r.eyebrow || "Gastronomic Soul",
      heading: r.heading || "TASTE ZANZIBAR",
      subhead: r.subhead || '"Fresh ingredients, island flavours and authentic Tanzanian hospitality."',
      intro: r.intro || "Centuries of Swahili, Omani, and Indian Ocean sea trade come together at our tables.",
      gardenEyebrow: r.garden_eyebrow || "Culinary Storytelling",
      gardenBadge: r.garden_badge || "Estate Garden",
      gardenTitle: r.garden_title || "FROM OUR GARDEN TO YOUR TABLE",
      gardenDesc: r.garden_desc || "Tucked within the grounds of Zanzirangi House is our private botanical garden...",
      tagZeroMiles: r.tag_zero_miles || "\u{1F331} Zero Food Miles",
      tagSpices: r.tag_spices || "\u{1F336} Hand-Picked Daily Spices",
      tagSeafood: r.tag_seafood || "\u{1F41F} Sustainable Coastal Seafood",
      moments,
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : void 0,
      updatedBy: r.updated_by
    };
  }
  async updateDiningConfig(data, userEmail) {
    const pool = this.getPool();
    const current = await this.getDiningConfig();
    const merged = {
      ...current,
      ...this.definedOnly(data),
      updatedBy: userEmail,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await pool.query(
      `UPDATE dining_config 
       SET eyebrow = ?, heading = ?, subhead = ?, intro = ?, garden_eyebrow = ?, garden_badge = ?, 
           garden_title = ?, garden_desc = ?, tag_zero_miles = ?, tag_spices = ?, tag_seafood = ?, moments_json = ?, extras_json = ?, updated_by = ?
       WHERE id = 1`,
      [
        merged.eyebrow,
        merged.heading,
        merged.subhead,
        merged.intro,
        merged.gardenEyebrow,
        merged.gardenBadge,
        merged.gardenTitle,
        merged.gardenDesc,
        merged.tagZeroMiles,
        merged.tagSpices,
        merged.tagSeafood,
        JSON.stringify(merged.moments || []),
        this.collectExtras(merged, DINING_CONFIG_COLUMN_FIELDS),
        userEmail
      ]
    );
    await this.addAuditLog({
      action: "DINING_CONFIG_UPDATED",
      userEmail,
      details: "Updated Dining page narrative and garden story"
    });
    return merged;
  }
  async getDiningCategories() {
    const pool = this.getPool();
    await this.ensureExtrasColumn("dining_categories");
    const [rows] = await pool.query("SELECT * FROM dining_categories ORDER BY sort_order ASC");
    return rows.map((r) => {
      let signatureDishes = [];
      if (r.dishes_json) {
        try {
          signatureDishes = typeof r.dishes_json === "string" ? JSON.parse(r.dishes_json) : r.dishes_json;
        } catch {
        }
      }
      return {
        ...this.parseExtras(r.extras_json),
        id: r.id,
        name: r.name,
        tabLabel: r.tab_label,
        subtitle: r.subtitle,
        description: r.description,
        imageUrl: r.image_url,
        signatureDishes,
        order: Number(r.sort_order || 0),
        visible: Boolean(r.visible !== 0 && r.visible !== false)
      };
    });
  }
  async saveDiningCategory(input, userEmail) {
    const pool = this.getPool();
    const existing = (await this.getDiningCategories()).find((c) => c.id === input.id);
    const category = {
      name: "",
      tabLabel: "",
      description: "",
      imageUrl: "",
      signatureDishes: [],
      order: 0,
      visible: true,
      ...existing || {},
      ...this.definedOnly(input)
    };
    if (!category.tabLabel) category.tabLabel = category.name;
    await pool.query(
      `INSERT INTO dining_categories (id, name, tab_label, subtitle, description, image_url, dishes_json, sort_order, visible, extras_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
        name = VALUES(name), tab_label = VALUES(tab_label), subtitle = VALUES(subtitle),
        description = VALUES(description), image_url = VALUES(image_url), dishes_json = VALUES(dishes_json),
        sort_order = VALUES(sort_order), visible = VALUES(visible), extras_json = VALUES(extras_json)`,
      [
        category.id,
        category.name,
        category.tabLabel,
        category.subtitle || null,
        category.description || "",
        category.imageUrl || "",
        JSON.stringify(category.signatureDishes || []),
        Number(category.order) || 0,
        category.visible === false ? 0 : 1,
        this.collectExtras(category, DINING_CATEGORY_COLUMN_FIELDS)
      ]
    );
    await this.addAuditLog({
      action: "DINING_CATEGORY_SAVED",
      userEmail,
      details: `Saved dining category: ${category.name} (${category.id})`
    });
    return category;
  }
  async deleteDiningCategory(id, userEmail) {
    const pool = this.getPool();
    const [result] = await pool.query("DELETE FROM dining_categories WHERE id = ?", [id]);
    const deleted = result && result.affectedRows > 0;
    if (deleted) {
      await this.addAuditLog({
        action: "DINING_CATEGORY_DELETED",
        userEmail,
        details: `Deleted dining category: ${id}`
      });
    }
    return deleted;
  }
  // --- Extended CMS Coverage: Experiences ---
  async getExperiences() {
    const pool = this.getPool();
    await this.ensureExtrasColumn("experiences");
    const [rows] = await pool.query("SELECT * FROM experiences ORDER BY sort_order ASC");
    return rows.map((r) => ({
      ...this.parseExtras(r.extras_json),
      id: r.id,
      title: r.title,
      category: r.category,
      duration: r.duration,
      tag: r.tag,
      priceNote: r.price_note,
      shortDescription: r.short_description,
      description: r.description,
      imageUrl: r.image_url,
      whatsappMessage: r.whatsapp_message,
      order: Number(r.sort_order || 0),
      visible: Boolean(r.visible !== 0 && r.visible !== false)
    }));
  }
  async saveExperience(input, userEmail) {
    const pool = this.getPool();
    const existing = (await this.getExperiences()).find((e) => e.id === input.id);
    const item = {
      title: "",
      category: "cultural",
      duration: "",
      tag: "",
      priceNote: "",
      shortDescription: "",
      description: "",
      imageUrl: "",
      order: 0,
      visible: true,
      ...existing || {},
      ...this.definedOnly(input)
    };
    await pool.query(
      `INSERT INTO experiences (id, title, category, duration, tag, price_note, short_description, description, image_url, whatsapp_message, sort_order, visible, extras_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
        title = VALUES(title), category = VALUES(category), duration = VALUES(duration),
        tag = VALUES(tag), price_note = VALUES(price_note), short_description = VALUES(short_description),
        description = VALUES(description), image_url = VALUES(image_url), whatsapp_message = VALUES(whatsapp_message),
        sort_order = VALUES(sort_order), visible = VALUES(visible), extras_json = VALUES(extras_json)`,
      [
        item.id,
        item.title,
        item.category,
        item.duration,
        item.tag,
        item.priceNote,
        item.shortDescription,
        item.description,
        item.imageUrl,
        item.whatsappMessage || null,
        Number(item.order) || 0,
        item.visible === false ? 0 : 1,
        this.collectExtras(item, EXPERIENCE_COLUMN_FIELDS)
      ]
    );
    await this.addAuditLog({
      action: "EXPERIENCE_SAVED",
      userEmail,
      details: `Saved experience: ${item.title} (${item.id})`
    });
    return item;
  }
  async deleteExperience(id, userEmail) {
    const pool = this.getPool();
    const [result] = await pool.query("DELETE FROM experiences WHERE id = ?", [id]);
    const deleted = result && result.affectedRows > 0;
    if (deleted) {
      await this.addAuditLog({
        action: "EXPERIENCE_DELETED",
        userEmail,
        details: `Deleted experience: ${id}`
      });
    }
    return deleted;
  }
  // --- Extended CMS Coverage: Safari Destinations ---
  async getSafariDestinations() {
    const pool = this.getPool();
    await this.ensureExtrasColumn("safari_destinations");
    const [rows] = await pool.query("SELECT * FROM safari_destinations ORDER BY sort_order ASC");
    return rows.map((r) => {
      let highlights = [];
      if (r.highlights_json) {
        try {
          highlights = typeof r.highlights_json === "string" ? JSON.parse(r.highlights_json) : r.highlights_json;
        } catch {
        }
      }
      return {
        ...this.parseExtras(r.extras_json),
        id: r.id,
        name: r.name,
        tagline: r.tagline,
        region: r.region,
        flightTimeFromZanzibar: r.flight_time,
        heroImage: r.hero_image,
        description: r.description,
        highlights,
        bestFor: r.best_for,
        safariType: r.safari_type,
        order: Number(r.sort_order || 0),
        visible: Boolean(r.visible !== 0 && r.visible !== false)
      };
    });
  }
  async saveSafariDestination(input, userEmail) {
    const pool = this.getPool();
    const existing = (await this.getSafariDestinations()).find((d) => d.id === input.id);
    const item = {
      name: "",
      tagline: "",
      region: "",
      flightTimeFromZanzibar: "",
      heroImage: "",
      description: "",
      highlights: [],
      bestFor: "",
      safariType: "",
      order: 0,
      visible: true,
      ...existing || {},
      ...this.definedOnly(input)
    };
    await pool.query(
      `INSERT INTO safari_destinations (id, name, tagline, region, flight_time, hero_image, description, highlights_json, best_for, safari_type, sort_order, visible, extras_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
        name = VALUES(name), tagline = VALUES(tagline), region = VALUES(region),
        flight_time = VALUES(flight_time), hero_image = VALUES(hero_image), description = VALUES(description),
        highlights_json = VALUES(highlights_json), best_for = VALUES(best_for), safari_type = VALUES(safari_type),
        sort_order = VALUES(sort_order), visible = VALUES(visible), extras_json = VALUES(extras_json)`,
      [
        item.id,
        item.name,
        item.tagline,
        item.region,
        item.flightTimeFromZanzibar,
        item.heroImage,
        item.description,
        JSON.stringify(Array.isArray(item.highlights) ? item.highlights : []),
        item.bestFor,
        item.safariType,
        Number(item.order) || 0,
        item.visible === false ? 0 : 1,
        this.collectExtras(item, SAFARI_COLUMN_FIELDS)
      ]
    );
    await this.addAuditLog({
      action: "SAFARI_DESTINATION_SAVED",
      userEmail,
      details: `Saved safari destination: ${item.name} (${item.id})`
    });
    return item;
  }
  async deleteSafariDestination(id, userEmail) {
    const pool = this.getPool();
    const [result] = await pool.query("DELETE FROM safari_destinations WHERE id = ?", [id]);
    const deleted = result && result.affectedRows > 0;
    if (deleted) {
      await this.addAuditLog({
        action: "SAFARI_DESTINATION_DELETED",
        userEmail,
        details: `Deleted safari destination: ${id}`
      });
    }
    return deleted;
  }
  // --- Extended CMS Coverage: Global Content ---
  async getGlobalContent() {
    const pool = this.getPool();
    await this.ensureExtrasColumn("global_content");
    const [rows] = await pool.query("SELECT * FROM global_content WHERE id = 1 LIMIT 1");
    const r = rows[0] || {};
    let navLinks = [];
    let socials = void 0;
    if (r.nav_links_json) {
      try {
        navLinks = typeof r.nav_links_json === "string" ? JSON.parse(r.nav_links_json) : r.nav_links_json;
      } catch {
      }
    }
    if (r.socials_json) {
      try {
        socials = typeof r.socials_json === "string" ? JSON.parse(r.socials_json) : r.socials_json;
      } catch {
      }
    }
    return {
      ...this.parseExtras(r.extras_json),
      id: 1,
      brandName: r.brand_name || "Zanzirangi House",
      navLinks,
      ctaPlanStayLabel: r.cta_plan_stay_label || "PLAN YOUR STAY",
      ctaPlanStayLink: r.cta_plan_stay_link || "#stay",
      footerTagline: r.footer_tagline,
      footerCopyright: r.footer_copyright,
      contactPhone: r.contact_phone,
      contactEmail: r.contact_email,
      contactWhatsapp: r.contact_whatsapp,
      contactAddress: r.contact_address,
      socials,
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : void 0,
      updatedBy: r.updated_by
    };
  }
  async updateGlobalContent(data, userEmail) {
    const pool = this.getPool();
    const current = await this.getGlobalContent();
    const merged = {
      ...current,
      ...this.definedOnly(data),
      updatedBy: userEmail,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await pool.query(
      `UPDATE global_content 
       SET brand_name = ?, nav_links_json = ?, cta_plan_stay_label = ?, cta_plan_stay_link = ?,
           footer_tagline = ?, footer_copyright = ?, contact_phone = ?, contact_email = ?,
           contact_whatsapp = ?, contact_address = ?, socials_json = ?, extras_json = ?, updated_by = ?
       WHERE id = 1`,
      [
        merged.brandName,
        JSON.stringify(merged.navLinks || []),
        merged.ctaPlanStayLabel,
        merged.ctaPlanStayLink,
        merged.footerTagline || null,
        merged.footerCopyright || null,
        merged.contactPhone || null,
        merged.contactEmail || null,
        merged.contactWhatsapp || null,
        merged.contactAddress || null,
        merged.socials ? JSON.stringify(merged.socials) : null,
        this.collectExtras(merged, GLOBAL_COLUMN_FIELDS),
        userEmail
      ]
    );
    await this.addAuditLog({
      action: "GLOBAL_CONTENT_UPDATED",
      userEmail,
      details: "Updated global navigation, header CTA, and footer configuration"
    });
    return merged;
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
    const [pagesCount] = await pool.query("SELECT COUNT(*) as total FROM page_contents");
    const [expCount] = await pool.query("SELECT COUNT(*) as total FROM experiences");
    const [diningCount] = await pool.query("SELECT COUNT(*) as total FROM dining_categories");
    const [usersCount] = await pool.query('SELECT COUNT(*) as total FROM users WHERE status = "active"');
    const [hpMeta] = await pool.query("SELECT meta_last_updated, meta_updated_by FROM homepage_config WHERE id = 1");
    const recentLogs = await this.getAuditLogs(10);
    const meta = hpMeta[0] || {};
    const host = env.MYSQL_HOST || "unknown";
    return {
      status: "Connected Live",
      databaseProvider: "mysql",
      databaseEngine: "Cloud \u2022 MariaDB/MySQL",
      databaseHost: host,
      lastPublished: meta.meta_last_updated ? new Date(meta.meta_last_updated).toISOString() : null,
      publishedBy: meta.meta_updated_by || null,
      counts: {
        villasPublished: Number(villasCount[0]?.pub || 0),
        villasTotal: Number(villasCount[0]?.total || 0),
        galleryItems: Number(galleryCount[0]?.total || 0),
        facilities: Number(facilitiesCount[0]?.total || 0),
        testimonials: Number(testimonialsCount[0]?.total || 0),
        mediaAssets: Number(mediaCount[0]?.total || 0),
        pagesTotal: Number(pagesCount[0]?.total || 0),
        experiencesTotal: Number(expCount[0]?.total || 0),
        diningCategories: Number(diningCount[0]?.total || 0),
        activeAdmins: Number(usersCount[0]?.total || 0)
      },
      recentUpdates: recentLogs.map((l) => ({
        action: l.action,
        userEmail: l.userEmail,
        timestamp: l.timestamp,
        details: l.details
      }))
    };
  }
  async ensureExtrasColumn(table) {
    if (this.extrasColumnReady.has(table)) return;
    const pool = this.getPool();
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS n FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = 'extras_json'`,
      [table]
    );
    if (!Number(rows[0]?.n)) {
      await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN extras_json LONGTEXT NULL`);
      console.log(`[DATABASE] Added extras_json column to ${table}`);
    }
    this.extrasColumnReady.add(table);
  }
  parseExtras(raw) {
    if (!raw) return {};
    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
  /** Every field of `record` that has no dedicated column, serialized for extras_json. */
  collectExtras(record, columnFields) {
    const skip = /* @__PURE__ */ new Set([...columnFields, "id", "updatedAt", "updatedBy"]);
    const extras = {};
    Object.entries(record).forEach(([k, v]) => {
      if (!skip.has(k) && v !== void 0 && v !== null) extras[k] = v;
    });
    return Object.keys(extras).length > 0 ? JSON.stringify(extras) : null;
  }
  /** Drops undefined values so partial updates (e.g. `{ visible }`) keep the existing fields. */
  definedOnly(data) {
    return Object.fromEntries(Object.entries(data || {}).filter(([, v]) => v !== void 0));
  }
  async ensureTranslationsTable() {
    if (this.translationsTableReady) return;
    await this.getPool().query(`
      CREATE TABLE IF NOT EXISTS content_translations (
        lang VARCHAR(8) NOT NULL,
        entity VARCHAR(64) NOT NULL,
        path VARCHAR(255) NOT NULL,
        value MEDIUMTEXT NOT NULL,
        source MEDIUMTEXT NULL,
        updated_by VARCHAR(255) NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (lang, entity, path)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    this.translationsTableReady = true;
  }
  async getContentTranslations(lang) {
    await this.ensureTranslationsTable();
    const [rows] = await this.getPool().query(
      "SELECT entity, path, value, source, updated_at, updated_by FROM content_translations WHERE lang = ?",
      [lang]
    );
    return rows.map((r) => ({
      entity: r.entity,
      path: r.path,
      value: r.value,
      source: r.source ?? void 0,
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : void 0,
      updatedBy: r.updated_by ?? void 0
    }));
  }
  async saveContentTranslations(lang, entries, userEmail) {
    await this.ensureTranslationsTable();
    const conn = await this.getPool().getConnection();
    try {
      await conn.beginTransaction();
      const removals = entries.filter((e) => !e.value || !e.value.trim());
      const upserts = entries.filter((e) => e.value && e.value.trim());
      for (const e of removals) {
        await conn.query("DELETE FROM content_translations WHERE lang = ? AND entity = ? AND path = ?", [lang, e.entity, e.path]);
      }
      const CHUNK = 200;
      for (let i = 0; i < upserts.length; i += CHUNK) {
        const chunk = upserts.slice(i, i + CHUNK);
        await conn.query(
          `INSERT INTO content_translations (lang, entity, path, value, source, updated_by)
           VALUES ${chunk.map(() => "(?, ?, ?, ?, ?, ?)").join(", ")}
           ON DUPLICATE KEY UPDATE value = VALUES(value), source = VALUES(source), updated_by = VALUES(updated_by)`,
          chunk.flatMap((e) => [lang, e.entity, e.path, e.value, e.source ?? null, userEmail])
        );
      }
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
    await this.addAuditLog({
      action: "TRANSLATIONS_UPDATED",
      userEmail,
      details: `Updated ${entries.length} ${lang.toUpperCase()} translation entries`
    });
    return entries.length;
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
      address: settings.address || "Kwa Lila 31, Bwejuu 72111, Zanzibar, Tanzania",
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
  async findById(id) {
    return getDatabaseAdapter().findUserById(id);
  }
  async save(user) {
    return getDatabaseAdapter().saveUser(user);
  }
  async create(user) {
    return getDatabaseAdapter().createUser(user);
  }
  async update(id, data) {
    return getDatabaseAdapter().updateUser(id, data);
  }
  async disable(id) {
    return getDatabaseAdapter().disableUser(id);
  }
  async enable(id) {
    return getDatabaseAdapter().enableUser(id);
  }
  async resetPassword(id, newPasswordHash) {
    return getDatabaseAdapter().resetPassword(id, newPasswordHash);
  }
  async getActiveCount() {
    return getDatabaseAdapter().getActiveUserCount();
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
  // -------------------------------------------------------------
  // Web Push Subscriptions
  // -------------------------------------------------------------
  async savePushSubscription(data) {
    const pool = getMysqlPool();
    const id = `push_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await pool.query(
      `INSERT INTO support_push_subscriptions (id, user_email, role, endpoint, p256dh, auth, user_agent, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE 
         user_email = VALUES(user_email),
         role = VALUES(role),
         p256dh = VALUES(p256dh),
         auth = VALUES(auth),
         user_agent = VALUES(user_agent),
         updated_at = NOW()`,
      [id, data.user_email, data.role || "STAFF", data.endpoint, data.p256dh, data.auth, data.user_agent || null]
    );
    return {
      id,
      user_email: data.user_email,
      role: data.role || "STAFF",
      endpoint: data.endpoint,
      p256dh: data.p256dh,
      auth: data.auth,
      user_agent: data.user_agent,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  async deletePushSubscription(endpoint) {
    const pool = getMysqlPool();
    await pool.query("DELETE FROM support_push_subscriptions WHERE endpoint = ?", [endpoint]);
  }
  async getPushSubscriptions(role) {
    const pool = getMysqlPool();
    let query = "SELECT * FROM support_push_subscriptions";
    const params = [];
    if (role && role !== "ALL") {
      query += ' WHERE role = ? OR role = "SUPER_ADMIN"';
      params.push(role);
    }
    const [rows] = await pool.query(query, params);
    return rows.map((r) => ({
      id: r.id,
      user_email: r.user_email,
      role: r.role,
      endpoint: r.endpoint,
      p256dh: r.p256dh,
      auth: r.auth,
      user_agent: r.user_agent,
      created_at: toIso(r.created_at),
      updated_at: toIso(r.updated_at)
    }));
  }
  // -------------------------------------------------------------
  // Staff Duty Tracking (On Duty / Off Duty)
  // -------------------------------------------------------------
  async getStaffDutyList() {
    const pool = getMysqlPool();
    const [rows] = await pool.query("SELECT * FROM support_staff_duty ORDER BY is_on_duty DESC, name ASC");
    return rows.map((r) => ({
      id: r.id,
      user_email: r.user_email,
      name: r.name,
      role: r.role,
      is_on_duty: Boolean(r.is_on_duty),
      last_active_at: toIso(r.last_active_at),
      updated_at: toIso(r.updated_at)
    }));
  }
  async getOnDutyStaff() {
    const pool = getMysqlPool();
    const [rows] = await pool.query("SELECT * FROM support_staff_duty WHERE is_on_duty = TRUE");
    return rows.map((r) => ({
      id: r.id,
      user_email: r.user_email,
      name: r.name,
      role: r.role,
      is_on_duty: true,
      last_active_at: toIso(r.last_active_at),
      updated_at: toIso(r.updated_at)
    }));
  }
  async updateStaffDuty(email, isOnDuty, name, role = "STAFF") {
    const pool = getMysqlPool();
    const displayName = name || email.split("@")[0];
    const id = `duty_${Buffer.from(email).toString("hex").slice(0, 16)}`;
    await pool.query(
      `INSERT INTO support_staff_duty (id, user_email, name, role, is_on_duty, last_active_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE
         is_on_duty = VALUES(is_on_duty),
         name = IF(VALUES(name) != '', VALUES(name), name),
         role = IF(VALUES(role) != '', VALUES(role), role),
         last_active_at = NOW(),
         updated_at = NOW()`,
      [id, email, displayName, role, isOnDuty]
    );
    return {
      id,
      user_email: email,
      name: displayName,
      role,
      is_on_duty: isOnDuty,
      last_active_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  // -------------------------------------------------------------
  // Support Escalation Queue (Multi-Tier Escalation)
  // -------------------------------------------------------------
  async createEscalationQueueItem(conversationId, visitorMessage) {
    const pool = getMysqlPool();
    const id = `esc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await pool.query(
      `INSERT INTO support_escalation_queue 
       (id, conversation_id, visitor_message, triggered_at, reminder_2m_sent, reminder_5m_sent, reminder_10m_sent, resolved_at)
       VALUES (?, ?, ?, NOW(), FALSE, FALSE, FALSE, NULL)`,
      [id, conversationId, visitorMessage]
    );
    return {
      id,
      conversation_id: conversationId,
      visitor_message: visitorMessage,
      triggered_at: (/* @__PURE__ */ new Date()).toISOString(),
      reminder_2m_sent: false,
      reminder_5m_sent: false,
      reminder_10m_sent: false,
      resolved_at: null
    };
  }
  async resolveEscalationQueueItem(conversationId) {
    const pool = getMysqlPool();
    await pool.query(
      `UPDATE support_escalation_queue 
       SET resolved_at = NOW() 
       WHERE conversation_id = ? AND resolved_at IS NULL`,
      [conversationId]
    );
  }
  async getPendingEscalations() {
    const pool = getMysqlPool();
    const [rows] = await pool.query(
      `SELECT * FROM support_escalation_queue 
       WHERE resolved_at IS NULL 
       ORDER BY triggered_at ASC`
    );
    return rows.map((r) => ({
      id: r.id,
      conversation_id: r.conversation_id,
      visitor_message: r.visitor_message,
      triggered_at: toIso(r.triggered_at),
      reminder_2m_sent: Boolean(r.reminder_2m_sent),
      reminder_5m_sent: Boolean(r.reminder_5m_sent),
      reminder_10m_sent: Boolean(r.reminder_10m_sent),
      resolved_at: r.resolved_at ? toIso(r.resolved_at) : null
    }));
  }
  async updateEscalationReminders(id, fields) {
    const pool = getMysqlPool();
    const sets = [];
    const vals = [];
    if (fields.reminder_2m_sent !== void 0) {
      sets.push("reminder_2m_sent = ?");
      vals.push(fields.reminder_2m_sent);
    }
    if (fields.reminder_5m_sent !== void 0) {
      sets.push("reminder_5m_sent = ?");
      vals.push(fields.reminder_5m_sent);
    }
    if (fields.reminder_10m_sent !== void 0) {
      sets.push("reminder_10m_sent = ?");
      vals.push(fields.reminder_10m_sent);
    }
    if (sets.length > 0) {
      vals.push(id);
      await pool.query(`UPDATE support_escalation_queue SET ${sets.join(", ")} WHERE id = ?`, vals);
    }
  }
};
var supportRepository = new SupportRepository();

// server/database/repositories/pageContentsRepository.ts
var PageContentsRepository = class {
  async getById(id) {
    return getDatabaseAdapter().getPageContent(id);
  }
  async getAll() {
    return getDatabaseAdapter().getAllPages();
  }
  async update(id, data, userEmail) {
    return getDatabaseAdapter().updatePageContent(id, data, userEmail);
  }
};
var pageContentsRepository = new PageContentsRepository();

// server/database/repositories/chauffeurRepository.ts
var ChauffeurRepository = class {
  async get() {
    return getDatabaseAdapter().getChauffeurConfig();
  }
  async update(data, userEmail) {
    return getDatabaseAdapter().updateChauffeurConfig(data, userEmail);
  }
};
var chauffeurRepository = new ChauffeurRepository();

// server/database/repositories/whyStayRepository.ts
var WhyStayRepository = class {
  async get() {
    return getDatabaseAdapter().getWhyStayConfig();
  }
  async update(data, userEmail) {
    return getDatabaseAdapter().updateWhyStayConfig(data, userEmail);
  }
};
var whyStayRepository = new WhyStayRepository();

// server/database/repositories/diningRepository.ts
var DiningRepository = class {
  async getConfig() {
    return getDatabaseAdapter().getDiningConfig();
  }
  async updateConfig(data, userEmail) {
    return getDatabaseAdapter().updateDiningConfig(data, userEmail);
  }
  async getCategories() {
    return getDatabaseAdapter().getDiningCategories();
  }
  async saveCategory(category, userEmail) {
    return getDatabaseAdapter().saveDiningCategory(category, userEmail);
  }
  async deleteCategory(id, userEmail) {
    return getDatabaseAdapter().deleteDiningCategory(id, userEmail);
  }
};
var diningRepository = new DiningRepository();

// server/database/repositories/experiencesRepository.ts
var ExperiencesRepository = class {
  async getAll() {
    return getDatabaseAdapter().getExperiences();
  }
  async save(item, userEmail) {
    return getDatabaseAdapter().saveExperience(item, userEmail);
  }
  async delete(id, userEmail) {
    return getDatabaseAdapter().deleteExperience(id, userEmail);
  }
};
var experiencesRepository = new ExperiencesRepository();

// server/database/repositories/safariRepository.ts
var SafariRepository = class {
  async getAll() {
    return getDatabaseAdapter().getSafariDestinations();
  }
  async save(item, userEmail) {
    return getDatabaseAdapter().saveSafariDestination(item, userEmail);
  }
  async delete(id, userEmail) {
    return getDatabaseAdapter().deleteSafariDestination(id, userEmail);
  }
};
var safariRepository = new SafariRepository();

// server/database/repositories/globalContentRepository.ts
var GlobalContentRepository = class {
  async get() {
    return getDatabaseAdapter().getGlobalContent();
  }
  async update(data, userEmail) {
    return getDatabaseAdapter().updateGlobalContent(data, userEmail);
  }
};
var globalContentRepository = new GlobalContentRepository();

// server/database/repositories/translationsRepository.ts
var SUPPORTED_TRANSLATION_LANGS = ["pl", "ar", "zh", "fr", "sw", "es", "it"];
var TranslationsRepository = class {
  async getForLanguage(lang) {
    return getDatabaseAdapter().getContentTranslations(lang);
  }
  /** Public shape: { entity: { path: value } } */
  async getMapForLanguage(lang) {
    const rows = await this.getForLanguage(lang);
    const map = {};
    rows.forEach((r) => {
      if (!r.value) return;
      (map[r.entity] = map[r.entity] || {})[r.path] = r.value;
    });
    return map;
  }
  async save(lang, entries, userEmail) {
    return getDatabaseAdapter().saveContentTranslations(lang, entries, userEmail);
  }
};
var translationsRepository = new TranslationsRepository();

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
var ADMIN_PERMISSIONS = [
  "dashboard",
  "pages",
  "homepage",
  "villas",
  "gallery",
  "videos",
  "facilities",
  "testimonials",
  "dining",
  "experiences",
  "safari",
  "transfers",
  "contact",
  "seo",
  "media",
  "settings",
  "support"
];
function sanitizePermissions(value) {
  if (!Array.isArray(value)) return [];
  const allowed = new Set(ADMIN_PERMISSIONS);
  return Array.from(new Set(value.filter((p) => typeof p === "string" && allowed.has(p))));
}
var DUMMY_PASSWORD_HASH = bcrypt2.hashSync("zanzirangi-timing-equalizer", 12);
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      permissions: user.permissions,
      tokenVersion: user.tokenVersion ?? 1
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
  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(401).json({
      success: false,
      error: "Invalid or expired session. Please log in again."
    });
    return;
  }
  try {
    const dbUser = await getDatabaseAdapter().findUserByEmail(decoded.email);
    if (!dbUser || decoded.id && dbUser.id !== decoded.id) {
      res.status(403).json({
        success: false,
        error: "User account is no longer authorized."
      });
      return;
    }
    if (dbUser.status === "disabled") {
      res.status(403).json({
        success: false,
        error: "Your account has been deactivated. Please contact Superadmin."
      });
      return;
    }
    if ((decoded.tokenVersion ?? 1) !== (dbUser.tokenVersion ?? 1)) {
      res.status(401).json({
        success: false,
        error: "Session has been invalidated. Please log in again."
      });
      return;
    }
    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      status: dbUser.status || "active",
      permissions: dbUser.permissions || [],
      tokenVersion: dbUser.tokenVersion ?? 1
    };
    next();
  } catch (err) {
    console.error("Authentication verification error:", err.message);
    res.status(500).json({ success: false, error: "Database verification failed." });
  }
}
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Authentication required." });
      return;
    }
    if (req.user.role === "superadmin") {
      next();
      return;
    }
    const userPermissions = Array.isArray(req.user.permissions) ? req.user.permissions : [];
    if (userPermissions.includes(permission) || userPermissions.includes("all")) {
      next();
      return;
    }
    res.status(403).json({
      success: false,
      error: `Access denied. You do not have permission to manage the '${permission}' module.`
    });
  };
}
function requireAnyPermission(permissions) {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Authentication required." });
      return;
    }
    const userPermissions = Array.isArray(req.user.permissions) ? req.user.permissions : [];
    if (req.user.role === "superadmin" || userPermissions.includes("all") || permissions.some((p) => userPermissions.includes(p))) {
      next();
      return;
    }
    res.status(403).json({
      success: false,
      error: `Access denied. Requires one of these permissions: ${permissions.join(", ")}.`
    });
  };
}
function requireSuperadmin(req, res, next) {
  if (!req.user) {
    res.status(401).json({ success: false, error: "Authentication required." });
    return;
  }
  if (req.user.role !== "superadmin") {
    res.status(403).json({
      success: false,
      error: "Superadmin privileges required to access this resource."
    });
    return;
  }
  next();
}
async function loginUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await getDatabaseAdapter().findUserByEmail(normalizedEmail);
  const isMatch = await bcrypt2.compare(password, user?.passwordHash || DUMMY_PASSWORD_HASH);
  if (!user || !isMatch) {
    return { success: false, error: "Invalid email or password." };
  }
  if (user.status === "disabled") {
    return { success: false, error: "Your administrator account has been deactivated. Please contact Superadmin." };
  }
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status || "active",
    permissions: user.permissions || [],
    tokenVersion: user.tokenVersion ?? 1
  };
  const token = generateToken(payload);
  try {
    await getDatabaseAdapter().updateLastLogin(user.id);
  } catch (err) {
    console.warn("Could not update last login timestamp:", err.message);
  }
  return {
    success: true,
    user: payload,
    token
  };
}

// server/storage/LocalMediaStorage.ts
init_env();
import fs3 from "fs";
import path3 from "path";
import crypto2 from "crypto";
var ALLOWED_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".pdf": "application/pdf"
};
function matchesSignature(buffer, mimeType) {
  const hex = buffer.subarray(0, 16).toString("hex");
  const ascii = buffer.subarray(0, 16).toString("latin1");
  switch (mimeType) {
    case "image/jpeg":
      return hex.startsWith("ffd8ff");
    case "image/png":
      return hex.startsWith("89504e470d0a1a0a");
    case "image/gif":
      return ascii.startsWith("GIF87a") || ascii.startsWith("GIF89a");
    case "image/webp":
      return ascii.startsWith("RIFF") && ascii.substring(8, 12) === "WEBP";
    case "image/avif":
      return ascii.substring(4, 8) === "ftyp" && /avi[fs]/.test(ascii.substring(8, 12));
    case "video/mp4":
      return ascii.substring(4, 8) === "ftyp";
    case "video/webm":
      return hex.startsWith("1a45dfa3");
    case "application/pdf":
      return ascii.startsWith("%PDF-");
    default:
      return false;
  }
}
var LocalMediaStorage = class {
  constructor(customStorageDir) {
    this.storageDir = customStorageDir || env.MEDIA_STORAGE_PATH || path3.resolve(process.cwd(), "uploads");
    this.ensureDirectoryExists();
  }
  ensureDirectoryExists() {
    if (!fs3.existsSync(this.storageDir)) {
      fs3.mkdirSync(this.storageDir, { recursive: true });
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
    const expectedMime = ALLOWED_TYPES[ext];
    if (!expectedMime) {
      throw new Error(
        `File type '${ext || "unknown"}' is not allowed. Allowed: ${Object.keys(ALLOWED_TYPES).join(", ")}.`
      );
    }
    if (mimeType && mimeType !== expectedMime) {
      throw new Error(`File extension '${ext}' does not match its type '${mimeType}'.`);
    }
    if (!matchesSignature(buffer, expectedMime)) {
      throw new Error(`The file content is not a valid ${expectedMime} file.`);
    }
    mimeType = expectedMime;
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
    await fs3.promises.writeFile(destinationPath, buffer);
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
    if (fs3.existsSync(filePath)) {
      await fs3.promises.unlink(filePath);
      return true;
    }
    return false;
  }
  exists(filename) {
    const safeFilename = path3.basename(filename);
    const filePath = path3.resolve(this.storageDir, safeFilename);
    return fs3.existsSync(filePath);
  }
  getUrl(filename) {
    const safeFilename = path3.basename(filename);
    return `/uploads/${safeFilename}`;
  }
};

// server/storage/HostingerMediaStorage.ts
import fs4 from "fs";
import path4 from "path";
init_env();
var HostingerMediaStorage = class _HostingerMediaStorage extends LocalMediaStorage {
  constructor(customStorageDir) {
    super(_HostingerMediaStorage.resolveWritableDirectory(customStorageDir || env.MEDIA_STORAGE_PATH));
    this.enforceDirectorySecurity();
  }
  /**
   * Uses the configured persistent directory (outside the deployed app, so uploads survive
   * redeploys). If it cannot be created, falls back to ./uploads and says so loudly.
   */
  static resolveWritableDirectory(preferred) {
    try {
      fs4.mkdirSync(preferred, { recursive: true });
      fs4.accessSync(preferred, fs4.constants.W_OK);
      console.log(`[MEDIA] Persistent media storage: ${preferred}`);
      return preferred;
    } catch (e) {
      const fallback = path4.resolve(process.cwd(), "uploads");
      console.error(
        `[MEDIA] Cannot use media directory ${preferred} (${e.code || e.message}). Falling back to ${fallback} \u2014 files there are replaced on every redeploy. Set MEDIA_STORAGE_PATH.`
      );
      return fallback;
    }
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
      if (!fs4.existsSync(htaccessPath)) {
        fs4.writeFileSync(htaccessPath, htaccessContent, "utf-8");
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
  id: "Pertanyaan detail Anda telah kami teruskan langsung ke Admin / Tim Concierge Zanzirangi House. Staf kami akan segera membalas pesan Anda di sini secara langsung. Terima kasih atas kesabaran Anda!",
  en: "Your detailed request has been forwarded directly to our Admin & Concierge team. A staff member will assist you shortly here in the chat. Thank you for your patience!",
  fr: "Votre demande d\xE9taill\xE9e a \xE9t\xE9 transmise directement \xE0 notre \xE9quipe de conciergerie. Un membre de notre \xE9quipe vous r\xE9pondra sous peu.",
  sw: "Ombi lako la kina limetumwa moja kwa moja kwa wasimamizi wetu. Mhudumu wetu atakujibu hapa punde si punde.",
  es: "Su consulta detallada ha sido enviada a nuestro equipo de conserjer\xEDa. Un miembro del personal le responder\xE1 en breve.",
  it: "La vostra richiesta dettagliata \xE8 stata inoltrata al nostro team concierge. Un nostro collaboratore vi risponder\xE0 a breve.",
  pl: "Twoje szczeg\xF3\u0142owe zapytanie zosta\u0142o przekazane bezpo\u015Brednio do naszego zespo\u0142u konsjer\u017Ca. Nasz pracownik wkr\xF3tce Ci odpowie.",
  ar: "\u062A\u0645 \u062A\u0648\u062C\u064A\u0647 \u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0643 \u0627\u0644\u062A\u0641\u0635\u064A\u0644\u064A \u0645\u0628\u0627\u0634\u0631\u0629 \u0625\u0644\u0649 \u0641\u0631\u064A\u0642 \u0627\u0644\u0643\u0648\u0646\u0633\u064A\u0631\u062C \u0648\u0633\u064A\u0642\u0648\u0645 \u0623\u062D\u062F \u0645\u0648\u0638\u0641\u064A\u0646\u0627 \u0628\u0627\u0644\u0631\u062F \u0639\u0644\u064A\u0643 \u0647\u0646\u0627 \u0642\u0631\u064A\u0628\u0627\u064B.",
  zh: "\u60A8\u7684\u8BE6\u7EC6\u54A8\u8BE2\u5DF2\u76F4\u63A5\u8F6C\u4EA4\u7ED9\u6211\u4EEC\u7684\u79C1\u4EBA\u793C\u5BBE\u7BA1\u5BB6\u56E2\u961F\uFF0C\u5DE5\u4F5C\u4EBA\u5458\u5C06\u5F88\u5FEB\u5728\u6B64\u4E3A\u60A8\u89E3\u7B54\uFF0C\u611F\u8C22\u60A8\u7684\u8010\u5FC3\u7B49\u5F85\uFF01"
};
var SupportAiEngine = class {
  /**
   * Evaluates a visitor query through the Support Decision Layer:
   * 1. Simple greetings, pleasantries & FAQs -> AUTO_ANSWER immediately by Elena
   * 2. Detailed questions, custom quotes, discounts, or explicit human requests -> HANDOFF_TO_HUMAN (routed to Admin with email alert)
   * 3. Seamless Indonesian and multi-language comprehension
   */
  async evaluateQuery(query, lang = "en", _currentPage = "/") {
    const q = query.trim().toLowerCase();
    const isIndonesian = lang === "id" || /\b(malam|pagi|siang|sore|halo|hai|bisa|berapa|kamar|kolam|sarapan|makan|pantai|tolong|terima kasih|makasih|siapa|admin|staf|dimana|apakah|tanya|pesan|sewa|harga|villa|jemput|bandara|diskon|promo|rombongan|orang|ada|nginap|menginap)\b/i.test(
      q
    );
    const fallbackHandoff = isIndonesian ? HANDOFF_MESSAGES.id : HANDOFF_MESSAGES[lang] || HANDOFF_MESSAGES.en;
    const asksForHuman = /\b(admin|staf|staff|human|manusia|orang|manager|manajer|owner|pemilik|hubungi|bicara|talk to|speak to|contact|bantuan langsung|operator|customer care)\b/i.test(
      q
    );
    if (asksForHuman) {
      return {
        replyText: isIndonesian ? "Tentu! Pesan Anda telah kami teruskan langsung ke Admin Zanzirangi House. Staf kami akan segera merespons Anda di sini dalam hitungan menit." : HANDOFF_MESSAGES[lang] || HANDOFF_MESSAGES.en,
        intent: "human_concierge_requested",
        confidence: 0.98,
        knowledge_source: "NONE",
        decision: "HANDOFF_TO_HUMAN",
        handoffReason: "Visitor explicitly requested to communicate with a human staff member / admin."
      };
    }
    const hasDiscountInquiry = /\b(diskon|discount|promo|potongan|tawar|nego|best price|special rate)\b/i.test(q);
    const hasEventInquiry = /\b(wedding|nikah|pernikahan|event|acara|gathering|party|anniversary khusus|charter)\b/i.test(q);
    const hasImmediateDate = /\b(tomorrow|tonight|today|besok|malam ini|demain|ce soir|mañana|domani|jutro|غدا|اليوم|明天|今晚)\b/i.test(q);
    const hasSpecificLargeGroup = /\b(1[0-9]|[2-9][0-9])\s*(people|guests|persons|orang|personnes|personas|persone|osób|شخص|位|人)\b/i.test(q) || /\b(for|untuk|pour|para|per|dla|li|共)\s*(1[0-9]|[2-9][0-9])\b/i.test(q);
    if (hasDiscountInquiry || hasEventInquiry || hasImmediateDate && hasSpecificLargeGroup) {
      return {
        replyText: isIndonesian ? "Untuk permintaan khusus, penawaran harga terbaik, serta ketersediaan rombongan detail, pertanyaan Anda sedang kami teruskan langsung ke Admin / Manajer Reservasi kami untuk dikonfirmasi secepatnya." : fallbackHandoff,
        intent: "custom_inquiry_handoff",
        confidence: 0.92,
        knowledge_source: "NONE",
        decision: "HANDOFF_TO_HUMAN",
        handoffReason: "Visitor inquired about discounts, events, or specific high-constraint bookings requiring human management approval."
      };
    }
    if (/\b(malam|selamat malam|good evening|soir|bonsoir|buonasera|buenas noches|dobry wieczór|مساء الخير|晚上好)\b/i.test(q)) {
      return {
        replyText: isIndonesian ? "Jambo & selamat malam! Senang bisa menyapa Anda di Zanzirangi House. Saya Elena, concierge Anda. Ada yang bisa kami bantu seputar reservasi villa, fasilitas, atau pengalaman safari & wisata di Zanzibar?" : "Jambo and good evening! Welcome to Zanzirangi House. My name is Elena, your private concierge. How may I assist your stay or inquiries in Zanzibar tonight?",
        action: { label: isIndonesian ? "Lihat Pilihan Villa" : "View Villas", actionType: "SCROLL", target: "stay" },
        intent: "greeting_evening",
        confidence: 0.98,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
      };
    }
    if (/\b(pagi|selamat pagi|siang|selamat siang|sore|selamat sore|good morning|good afternoon|bonjour|buongiorno|buenos días|dzień dobry|صباح الخير|早上好|下午好)\b/i.test(q)) {
      return {
        replyText: isIndonesian ? "Jambo & selamat datang! Saya Elena, concierge pribadi Anda di Zanzirangi House. Ada yang bisa kami bantu hari ini seputar pilihan villa, dining, atau safari di Zanzibar?" : "Jambo and welcome! My name is Elena, your personal concierge at Zanzirangi House. How may I assist you today regarding our luxury villas, dining, or safari experiences?",
        action: { label: isIndonesian ? "Lihat Pilihan Villa" : "View Villas", actionType: "SCROLL", target: "stay" },
        intent: "greeting_daytime",
        confidence: 0.98,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
      };
    }
    if (/^(halo|hai|hi|hello|hey|jambo|habari|hola|ciao|salut|cześć|مرحبا|你好)[\s!.?]*$/i.test(q) || /\b(halo elena|hi elena|hello elena|selamat datang)\b/i.test(q)) {
      return {
        replyText: isIndonesian ? "Jambo! Halo, senang Anda menghubungi kami di Zanzirangi House. Saya Elena, concierge Anda. Silakan tanyakan apa pun seputar reservasi villa, check-in, antar-jemput bandara, atau pengalaman menarik di Zanzibar!" : "Jambo! Welcome to Zanzirangi House. I am Elena, your personal concierge. Feel free to ask about our private villas, check-in, transfers, dining, or bespoke safari journeys!",
        action: { label: isIndonesian ? "Eksplorasi Sanctuary" : "Explore Sanctuary", actionType: "SCROLL", target: "itinerary" },
        intent: "greeting_general",
        confidence: 0.98,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
      };
    }
    if (/\b(terima kasih|makasih|matur suwun|thank you|thanks|asante|merci|grazie|gracias|dzięk|شكرا|谢谢)\b/i.test(q)) {
      return {
        replyText: isIndonesian ? "Sama-sama! Dengan senang hati. Jika Anda membutuhkan informasi lebih lanjut atau ingin memesan villa, tim kami selalu siap membantu." : "You are most welcome! It is our pleasure. Please let us know if there is anything else we can arrange for your luxury retreat in Zanzibar.",
        intent: "polite_thank_you",
        confidence: 0.96,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
      };
    }
    if (/^(ok|oke|okay|baik|siap|noted|siap kak|siap min|roger|alright|fine|yes|ya)[\s!.?]*$/i.test(q)) {
      return {
        replyText: isIndonesian ? "Baik, terima kasih! Silakan beri tahu kami kapan pun Anda siap melakukan reservasi atau membutuhkan bantuan lainnya." : "Wonderful! We are right here whenever you need assistance with your booking or stay arrangements. Enjoy your time!",
        intent: "polite_acknowledgement",
        confidence: 0.95,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
      };
    }
    if (/\b(siapa kamu|kamu siapa|who are you|siapa ini|bot atau|apakah bot|elena itu siapa)\b/i.test(q)) {
      return {
        replyText: isIndonesian ? "Saya Elena, Customer Support & Concierge pribadi Anda di Zanzirangi House. Saya siap menjawab pertanyaan Anda seputar sanctuary kami, dan staf admin kami juga selalu terhubung langsung di sini jika Anda membutuhkan bantuan khusus." : "I am Elena, your personal Customer Support & Concierge at Zanzirangi House. I am here to assist with all your questions, and our human admin team is also directly connected here whenever you need specialized assistance.",
        intent: "faq_identity",
        confidence: 0.95,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
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
    const checkinKeywords = ["check-in", "checkin", "check out", "checkout", "horaires", "muda wa kuingia", "horario", "arrived", "departure", "jam masuk", "waktu masuk", "jam berapa masuk", "jam keluar", "wymeldowani", "zameldowani", "\u5165\u4F4F", "\u9000\u623F", "\u0627\u0644\u0648\u0635\u0648\u0644", "\u0627\u0644\u0645\u063A\u0627\u062F\u0631\u0629"];
    if (checkinKeywords.some((k) => q.includes(k))) {
      return {
        replyText: isIndonesian ? "Waktu check-in standar kami mulai pukul 14:00 (2:00 siang) dan check-out hingga pukul 11:00 pagi. Early check-in atau late check-out dapat disesuaikan secara fleksibel tergantung ketersediaan villa Anda." : "Standard check-in is from 14:00 (2:00 PM) and check-out is until 11:00 AM. Flexible early check-in or late checkout can be accommodated based on villa availability.",
        action: { label: isIndonesian ? "Reservasi Villa" : "Book a Villa", actionType: "MODAL", target: "booking_modal" },
        intent: "faq_checkin_checkout",
        confidence: 0.94,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
      };
    }
    const wifiKeywords = ["wifi", "wi-fi", "internet", "speed", "starlink", "network", "koneksi", "sinyal", "connect", "online", "\u0633\u062A\u0627\u0631\u0644\u064A\u0646\u0643", "\u661F\u94FE", "\u65E0\u7EBF"];
    if (wifiKeywords.some((k) => q.includes(k))) {
      return {
        replyText: isIndonesian ? "Internet satelit Starlink kecepatan tinggi (150+ Mbps) tersedia gratis tanpa batas di seluruh private villa, taman santuari, dan paviliun restoran kami untuk kenyamanan streaming maupun remote work." : "High-speed Starlink satellite Wi-Fi (150+ Mbps) is complimentary across all private villas, gardens, and dining pavilions, ensuring reliable connectivity for streaming or remote work.",
        action: { label: isIndonesian ? "Cek Fasilitas Villa" : "Check Villa Features", actionType: "SCROLL", target: "stay" },
        intent: "faq_starlink_wifi",
        confidence: 0.95,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
      };
    }
    const poolKeywords = ["pool", "plunge", "swim", "beach", "ocean", "piscine", "bwawa", "piscina", "pantai", "kolam", "renang", "basen", "\u0627\u0644\u0645\u0633\u0628\u062D", "\u0627\u0644\u0634\u0627\u0637\u0626", "\u6CF3\u6C60", "\u6C99\u6EE9"];
    if (poolKeywords.some((k) => q.includes(k))) {
      return {
        replyText: isIndonesian ? "Setiap villa dari 8 private sanctuary kami memiliki kolam renang pribadi (freshwater plunge pool), sun loungers, dan akses jalur pribadi langsung ke pantai Kizimkazi Samudra Hindia yang tenang." : "Every single one of our 8 luxury sanctuaries features its own private freshwater plunge pool, sun loungers, and direct private pathway access to the pristine shores of the Indian Ocean.",
        action: { label: isIndonesian ? "Lihat Private Villa" : "View Private Villas", actionType: "SCROLL", target: "stay" },
        intent: "faq_pools_beach",
        confidence: 0.94,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
      };
    }
    const transferKeywords = ["airport", "transfer", "location", "where", "car", "distance", "arrive", "driver", "taxi", "shuttle", "jemput", "antar jemput", "bandara", "lokasi", "dimana", "alamat", "jauh", "usafiri", "\u0645\u0637\u0627\u0631", "\u63A5\u9001"];
    if (transferKeywords.some((k) => q.includes(k))) {
      return {
        replyText: isIndonesian ? "Zanzirangi House berlokasi di Kizimkazi Dimbani, pesisir selatan Zanzibar. Kami menyediakan layanan antar-jemput VIP chauffeur pribadi dari Bandara Internasional Zanzibar (ZNZ) langsung ke sanctuary (~55 menit perjalanan)." : "We provide private VIP meet-and-greet and chauffeur shuttle transfers from Abeid Amani Karume International Airport (ZNZ) directly to our sanctuary in Kizimkazi (approx. 55 minutes).",
        action: { label: isIndonesian ? "Detail Layanan Transfer" : "View Transfer Details", actionType: "SCROLL", target: "shuttle" },
        intent: "faq_transfers",
        confidence: 0.92,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
      };
    }
    const diningKeywords = ["din", "food", "restaurant", "chef", "breakfast", "menu", "lunch", "eat", "drink", "makan", "makanan", "sarapan", "restoran", "kuliner", "halal", "seafood", "cuisine", "chakula", "comida", "\u0645\u0637\u0639\u0645", "\u9910\u5385"];
    if (diningKeywords.some((k) => q.includes(k))) {
      return {
        replyText: isIndonesian ? "Filosofi kuliner kami menyajikan hasil bumi organik dari kebun sendiri (garden-to-table) dan hidangan seafood segar tangkapan harian nelayan lokal dengan sentuhan Swahili otentik dan menu internasional mewah." : "Our gastronomic philosophy embraces organic garden-to-table produce and line-caught seafood with authentic Swahili and fine international dining.",
        action: { label: isIndonesian ? "Lihat Menu & Dining" : "Taste Dining & Garden Menu", actionType: "SCROLL", target: "dining" },
        intent: "faq_dining",
        confidence: 0.92,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
      };
    }
    if (q.includes("serengeti") || q.includes("great migration")) {
      return {
        replyText: isIndonesian ? "Taman Nasional Serengeti adalah pengalaman safari legendaris. Zanzirangi House mengatur safari terbang carter langsung dari Zanzibar (\xB11 jam 45 menit) dengan akomodasi tenda mewah mitra kami." : "Serengeti National Park is an extraordinary safari experience. Zanzirangi House arranges direct chartered fly-in safaris from Zanzibar airport (approx. 1h 45m) with luxury partner tented camps overlooking migration corridors.",
        action: { label: isIndonesian ? "Lihat Destinasi Safari" : "View Safari Destinations", actionType: "SCROLL", target: "tanzania" },
        intent: "safari_serengeti",
        confidence: 0.95,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
      };
    }
    if (q.includes("ngorongoro") || q.includes("crater")) {
      return {
        replyText: isIndonesian ? "Kawah Ngorongoro menyimpan populasi predator terpadat di Afrika di dalam kaldera vulkanik UNESCO. Kami menyediakan paket safari terbang kombinasi liburan pantai dan game drive kawah." : "Ngorongoro Crater offers Africa\u2019s densest predator populations inside a UNESCO volcanic caldera. We organize chartered fly-in packages combining your beach retreat with panoramic crater floor game drives.",
        action: { label: isIndonesian ? "Eksplorasi Ngorongoro" : "Explore Ngorongoro", actionType: "SCROLL", target: "tanzania" },
        intent: "safari_ngorongoro",
        confidence: 0.95,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
      };
    }
    if (q.includes("kilimanjaro")) {
      return {
        replyText: isIndonesian ? "Ekspedisi Gunung Kilimanjaro dan safari penerbangan panorama diatur bersama mitra pemandu gunung resmi kami, lengkap dengan aklimatisasi sebelum pendakian atau istirahat relaksasi setelahnya." : "Mount Kilimanjaro expeditions and scenic fly-over safaris are arranged through our certified mainland mountain guide partners. We can curate pre-climb acclimatization stays or relaxing post-climb beach recovery.",
        action: { label: isIndonesian ? "Rencanakan Safari & Kilimanjaro" : "Plan Safari & Kilimanjaro", actionType: "SCROLL", target: "tanzania" },
        intent: "safari_kilimanjaro",
        confidence: 0.92,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
      };
    }
    const dolphinKeywords = ["dolphin", "lumba", "pomboo", "dauphin", "delfin", "\u062F\u0644\u0627\u0641\u064A\u0646", "\u6D77\u8C5A"];
    if (dolphinKeywords.some((k) => q.includes(k))) {
      return {
        replyText: isIndonesian ? "Kizimkazi terkenal di dunia dengan kawanan lumba-lumba di Kawasan Konservasi Menai Bay. Kami mengadakan safari lumba-lumba etis saat matahari terbit langsung dari tepi pantai kami." : "Kizimkazi is world-famous for resident dolphin pods in the Menai Bay Conservation Area. We organize ethical sunrise dolphin safaris directly from our shore.",
        action: { label: isIndonesian ? "Eksplorasi Safari Lumba-Lumba" : "Explore Dolphin Safaris", actionType: "SCROLL", target: "experiences" },
        intent: "experience_dolphins",
        confidence: 0.94,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
      };
    }
    const dhowKeywords = ["dhow", "sunset", "perahu", "kapal", "jahazi", "layar", "senja", "matahari terbenam", "voilier", "\u0642\u0627\u0631\u0628", "\u0627\u0644\u062F\u0627\u0648", "\u6728\u8239"];
    if (dhowKeywords.some((k) => q.includes(k))) {
      return {
        replyText: isIndonesian ? "Nikmati pelayaran magis di atas perahu kayu tradisional Dhow menyusuri Samudra Hindia pirus sambil menikmati Champagne dingin dan canap\xE9 Swahili saat matahari terbenam." : "Glide across the turquoise Indian Ocean aboard a handcrafted wooden dhow while enjoying chilled Champagne and fresh Swahili canap\xE9s as the sun sets.",
        action: { label: isIndonesian ? "Lihat Sunset Sailing" : "View Sunset Sailing", actionType: "SCROLL", target: "experiences" },
        intent: "experience_sunset_dhow",
        confidence: 0.93,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
      };
    }
    const spaKeywords = ["spa", "massage", "pijat", "masaji", "relaksasi", "bien-\xEAtre", "\u062A\u062F\u0644\u064A\u0643", "\u6C34\u7597", "\u6309\u6469", "wellness"];
    if (spaKeywords.some((k) => q.includes(k))) {
      return {
        replyText: isIndonesian ? "Layanan spa & wellness in-villa kami menggunakan minyak kelapa Zanzibari murni, scrub cengkeh & kayu manis, serta deep-tissue massage yang menenangkan langsung di dek oceanfront pribadi Anda." : "Our in-villa wellness treatments feature cold-pressed Zanzibari coconut oils, clove and cinnamon body scrubs, and soothing deep-tissue massages performed on your private ocean deck.",
        action: { label: isIndonesian ? "Lihat Layanan Spa" : "View Wellness & Spa", actionType: "SCROLL", target: "experiences" },
        intent: "experience_spa",
        confidence: 0.92,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
      };
    }
    const villaKeywords = ["villa", "rate", "price", "stay", "room", "kamar", "harga", "sewa", "tarif", "tipe", "bungalow", "availab", "chambre", "chumba", "\u0641\u0644\u0644", "\u522B\u5885"];
    if (villaKeywords.some((k) => q.includes(k))) {
      return {
        replyText: isIndonesian ? "Zanzirangi House menyediakan 8 private pool sanctuary eksklusif termasuk oceanfront villa dan garden sanctuary yang tenang. Apakah Anda ingin mengecek tanggal dan ketersediaan sekarang?" : "We feature 8 handcrafted luxury sanctuaries including oceanfront pool villas and secluded garden bungalows. Would you like to check dates and availability?",
        action: { label: isIndonesian ? "Cek Ketersediaan Villa" : "Check Villa Availability", actionType: "MODAL", target: "booking_modal" },
        intent: "faq_villas_rates",
        confidence: 0.9,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
      };
    }
    const paymentKeywords = ["payment", "pay", "cancel", "deposit", "card", "visa", "mastercard", "bayar", "pembayaran", "batal", "pembatalan", "kartu kredit", "malipo", "\u0627\u0644\u062F\u0641\u0639"];
    if (paymentKeywords.some((k) => q.includes(k))) {
      return {
        replyText: isIndonesian ? "Kami menerima kartu kredit utama (Visa, MasterCard, Amex), transfer bank internasional, dan pembayaran digital. Kebijakan pembatalan fleksibel penuh hingga 14 hari sebelum tanggal kedatangan." : "We accept major credit cards (Visa, MasterCard, Amex), international bank transfers, and mobile payments. Cancellation terms offer full flexibility up to 14 days prior to arrival.",
        action: { label: isIndonesian ? "Reservasi Sekarang" : "Reserve a Villa", actionType: "MODAL", target: "booking_modal" },
        intent: "faq_payment_cancellation",
        confidence: 0.9,
        knowledge_source: "DETERMINISTIC_FAQ",
        decision: "AUTO_ANSWER"
      };
    }
    return {
      replyText: fallbackHandoff,
      intent: "detailed_inquiry_handed_to_admin",
      confidence: 0.45,
      knowledge_source: "NONE",
      decision: "HANDOFF_TO_HUMAN",
      handoffReason: "Query contains detailed, unverified, or specialized requirements forwarded for direct admin response."
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

// server/services/emailService.ts
import nodemailer from "nodemailer";
import dotenv2 from "dotenv";
dotenv2.config();
var EmailService = class {
  getTransporter() {
    const host = process.env.SMTP_HOST || "smtp.hostinger.com";
    const port = Number(process.env.SMTP_PORT || 465);
    const secure = process.env.SMTP_SECURE !== "false";
    const user = process.env.SMTP_USER || "";
    const pass = process.env.SMTP_PASS || "";
    if (!user || !pass) {
      return null;
    }
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass
      }
    });
  }
  async getRecipientEmail() {
    try {
      const global = await globalContentRepository.get();
      if (global?.contactEmail) {
        return global.contactEmail;
      }
    } catch {
    }
    return process.env.ADMIN_ALERT_EMAIL || process.env.ALERT_NOTIFICATION_EMAIL || process.env.SMTP_USER || "info@zanzirangihouse.com";
  }
  /**
   * Sends an immediate email notification when a guest submits a villa booking inquiry
   */
  async sendBookingAlert(payload) {
    try {
      const transporter = this.getTransporter();
      if (!transporter) {
        console.log("[EMAIL] Hostinger SMTP not configured (SMTP_USER/SMTP_PASS missing). Skipped sending booking alert email.");
        return false;
      }
      const toEmail = await this.getRecipientEmail();
      const fromEmail = process.env.SMTP_USER || "info@zanzirangihouse.com";
      const appUrl = process.env.APP_URL || "https://zanzirangihouse.com";
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FAF8F5; margin: 0; padding: 24px; color: #1C1B1A; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #E7DFD2; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .header { background: #141413; padding: 28px 32px; text-align: center; }
    .gold-title { color: #A07E54; font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; font-weight: 700; margin-bottom: 6px; }
    .main-title { color: #FAF8F5; font-size: 22px; font-weight: 300; margin: 0; }
    .body { padding: 32px; }
    .badge { display: inline-block; background: #FEF3C7; color: #92400E; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; margin-bottom: 20px; }
    .info-table { width: 100%; border-collapse: collapse; margin: 16px 0 24px; }
    .info-table td { padding: 10px 12px; border-bottom: 1px solid #F4EFE6; font-size: 13px; }
    .info-table td.label { width: 38%; color: #6B6862; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; }
    .info-table td.value { color: #141413; font-weight: 500; }
    .requests-box { background: #F4EFE6; border-left: 3px solid #A07E54; padding: 14px 16px; margin: 20px 0; font-size: 13px; color: #3A3835; font-style: italic; }
    .btn { display: block; width: fit-content; margin: 28px auto 8px; background: #B8966C; color: #141413; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; text-align: center; }
    .footer { padding: 20px 32px; text-align: center; font-size: 11px; color: #8F8B84; border-top: 1px solid #F4EFE6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="gold-title">Zanzirangi House Zanzibar</div>
      <h1 class="main-title">New Villa Reservation Alert</h1>
    </div>
    <div class="body">
      <div class="badge">Immediate Action Required</div>
      <p style="font-size: 14px; line-height: 1.6; margin-top: 0;">A guest has just submitted a direct reservation inquiry on <strong>zanzirangihouse.com</strong>:</p>
      
      <table class="info-table">
        <tr>
          <td class="label">Guest Name</td>
          <td class="value"><strong>${payload.fullName}</strong></td>
        </tr>
        <tr>
          <td class="label">Guest Email</td>
          <td class="value"><a href="mailto:${payload.email}" style="color: #A07E54;">${payload.email}</a></td>
        </tr>
        <tr>
          <td class="label">Phone / WhatsApp</td>
          <td class="value">${payload.phone || "Not provided"}</td>
        </tr>
        <tr>
          <td class="label">Country of Origin</td>
          <td class="value">${payload.country || "Not specified"}</td>
        </tr>
        <tr>
          <td class="label">Villa Selection</td>
          <td class="value"><strong>${payload.villaName}</strong> ${payload.roomNumber ? `(${payload.roomNumber})` : ""}</td>
        </tr>
        <tr>
          <td class="label">Stay Dates</td>
          <td class="value"><strong>${payload.checkIn} \u2192 ${payload.checkOut}</strong></td>
        </tr>
        <tr>
          <td class="label">Party Size</td>
          <td class="value">${payload.guests} Guests</td>
        </tr>
        <tr>
          <td class="label">Airport Transfer</td>
          <td class="value">${payload.airportTransfer ? "Yes (Requested)" : "No"}</td>
        </tr>
      </table>

      ${payload.specialRequests ? `
      <div class="label" style="font-size: 11px; font-weight: 700; color: #6B6862; text-transform: uppercase;">Special Requests:</div>
      <div class="requests-box">"${payload.specialRequests}"</div>
      ` : ""}

      <a href="${appUrl}/admin/support" class="btn">Open Support Inbox & Reply</a>
    </div>
    <div class="footer">
      Zanzirangi House \u2022 Luxury Private Sanctuary \u2022 Kizimkazi Dimbani, Zanzibar<br>
      Hostinger Automated Alert Engine
    </div>
  </div>
</body>
</html>
      `;
      await transporter.sendMail({
        from: `"Zanzirangi House Concierge" <${fromEmail}>`,
        to: toEmail,
        subject: `\u{1F3E8} [NEW BOOKING] ${payload.fullName} - ${payload.villaName} (${payload.checkIn} to ${payload.checkOut})`,
        html: htmlContent
      });
      console.log(`[EMAIL] \u2713 Booking alert successfully sent via Hostinger SMTP to ${toEmail}`);
      return true;
    } catch (err) {
      console.error("[EMAIL] Failed to send booking alert email via Hostinger SMTP:", err.message);
      return false;
    }
  }
  /**
   * Sends an urgent alert when a live chat visitor requests human concierge support
   */
  async sendHumanSupportAlert(payload) {
    try {
      const transporter = this.getTransporter();
      if (!transporter) {
        console.log("[EMAIL] Hostinger SMTP not configured (SMTP_USER/SMTP_PASS missing). Skipped sending human support alert email.");
        return false;
      }
      const toEmail = await this.getRecipientEmail();
      const fromEmail = process.env.SMTP_USER || "info@zanzirangihouse.com";
      const appUrl = process.env.APP_URL || "https://zanzirangihouse.com";
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FAF8F5; margin: 0; padding: 24px; color: #1C1B1A; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #E7DFD2; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .header { background: #92400E; padding: 24px 32px; text-align: center; }
    .gold-title { color: #FEF3C7; font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; font-weight: 700; margin-bottom: 6px; }
    .main-title { color: #ffffff; font-size: 20px; font-weight: 400; margin: 0; }
    .body { padding: 32px; }
    .badge { display: inline-block; background: #FEE2E2; color: #991B1B; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; margin-bottom: 16px; }
    .message-box { background: #F4EFE6; border-left: 4px solid #B8966C; padding: 16px; border-radius: 4px; margin: 16px 0; font-size: 14px; line-height: 1.5; color: #141413; }
    .info-list { font-size: 12px; color: #6B6862; margin: 16px 0; }
    .btn { display: block; width: fit-content; margin: 28px auto 8px; background: #141413; color: #FAF8F5; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; text-align: center; }
    .footer { padding: 20px 32px; text-align: center; font-size: 11px; color: #8F8B84; border-top: 1px solid #F4EFE6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="gold-title">Live Chat Concierge Alert</div>
      <h1 class="main-title">Guest Waiting for Human Support</h1>
    </div>
    <div class="body">
      <div class="badge">URGENT: Visitor Waiting</div>
      <p style="font-size: 14px; margin-top: 0;">A guest on <strong>zanzirangihouse.com</strong> has requested to speak with a human concierge or asked a question requiring staff intervention:</p>
      
      <div class="message-box">
        <strong>Guest Query:</strong><br>
        "${payload.lastMessage}"
      </div>

      <div class="info-list">
        \u2022 <strong>Visitor ID:</strong> ${payload.visitorId}<br>
        \u2022 <strong>Language:</strong> ${payload.language.toUpperCase()}<br>
        \u2022 <strong>Active Page:</strong> ${payload.currentPage || "/"}<br>
        \u2022 <strong>Handoff Reason:</strong> ${payload.handoffReason || "Guest requested human assistance"}
      </div>

      <a href="${appUrl}/admin/support" class="btn">Open Inbox & Reply Now</a>
    </div>
    <div class="footer">
      Zanzirangi House Hostinger Alert Dispatcher \u2022 Fast response increases direct booking conversion.
    </div>
  </div>
</body>
</html>
      `;
      await transporter.sendMail({
        from: `"Zanzirangi House Alert" <${fromEmail}>`,
        to: toEmail,
        subject: `\u26A0\uFE0F [ACTION REQUIRED] Guest Needs Human Response on Zanzirangi House`,
        html: htmlContent
      });
      console.log(`[EMAIL] \u2713 Human support alert successfully sent via Hostinger SMTP to ${toEmail}`);
      return true;
    } catch (err) {
      console.error("[EMAIL] Failed to send human support alert email via Hostinger SMTP:", err.message);
      return false;
    }
  }
  /**
   * Tests the Hostinger SMTP connection
   */
  async testConnection(targetEmail) {
    try {
      const transporter = this.getTransporter();
      if (!transporter) {
        return {
          success: false,
          message: "SMTP credentials missing. Please set SMTP_USER and SMTP_PASS in your environment or Admin settings."
        };
      }
      await transporter.verify();
      if (targetEmail) {
        const fromEmail = process.env.SMTP_USER || "info@zanzirangihouse.com";
        await transporter.sendMail({
          from: `"Zanzirangi House Test" <${fromEmail}>`,
          to: targetEmail,
          subject: "\u2705 Hostinger SMTP Test - Zanzirangi House",
          html: "<p>Congratulations! Your Hostinger SMTP email integration is working perfectly. You will now receive instant alerts for villa bookings and guest support requests.</p>"
        });
      }
      return {
        success: true,
        message: "Hostinger SMTP connection verified successfully! Test email delivered."
      };
    } catch (err) {
      return {
        success: false,
        message: `SMTP Connection error: ${err.message}`
      };
    }
  }
};
var emailService = new EmailService();

// server/services/webPushService.ts
import webpush from "web-push";
var VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "BI6ZzUgSWdCiNylYuSYHQJ6one6Xxi3xln1zxIZ_TIK0_u-tb08uxhdwQRiqFife81rWgGmGM9ETDjU_SUCJtsM";
var VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "QdvTfruhF5J5Namm7FHzOROFwMF8QFxFHr6ks9Y2Rdo";
var VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:info@zanzirangihouse.com";
try {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} catch (e) {
  console.warn("[WEB_PUSH] VAPID initialization notice:", e.message);
}
var WebPushService = class {
  getPublicKey() {
    return VAPID_PUBLIC_KEY;
  }
  /**
   * Dispatches push notifications to staff mobile devices and desktop browsers.
   * If on-duty staff exist, prioritizes them; otherwise alerts all registered staff.
   */
  async sendNotificationToStaff(payload, role) {
    const subscriptions = await supportRepository.getPushSubscriptions(role);
    if (!subscriptions || subscriptions.length === 0) {
      console.log("[WEB_PUSH] No active push subscriptions found for staff.");
      return { sent: 0, failed: 0 };
    }
    const targetUrl = payload.url || (payload.conversationId ? `/admin?tab=inbox&conversation=${payload.conversationId}` : "/admin");
    const pushData = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || "/favicon-48x48.png",
      badge: payload.badge || "/favicon-32x32.png",
      data: {
        url: targetUrl,
        conversationId: payload.conversationId || null,
        timestamp: Date.now()
      }
    });
    let sent = 0;
    let failed = 0;
    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth
            }
          };
          await webpush.sendNotification(pushSubscription, pushData, {
            TTL: 60 * 60,
            // 1 hour TTL
            urgency: "high"
          });
          sent++;
        } catch (err) {
          failed++;
          if (err.statusCode === 404 || err.statusCode === 410) {
            console.log(`[WEB_PUSH] Pruning expired subscription for ${sub.user_email} (${err.statusCode})`);
            await supportRepository.deletePushSubscription(sub.endpoint).catch(() => {
            });
          } else {
            console.warn(`[WEB_PUSH] Failed to send push to ${sub.user_email}:`, err.message);
          }
        }
      })
    );
    console.log(`[WEB_PUSH] Dispatched push alerts: ${sent} sent, ${failed} failed across ${subscriptions.length} devices.`);
    return { sent, failed };
  }
};
var webPushService = new WebPushService();

// server/services/supportEscalationService.ts
var SupportEscalationService = class {
  constructor() {
    this.timer = null;
  }
  /**
   * Initializes the recurring escalation monitor that checks for unanswered guest inquiries.
   */
  startEscalationMonitor() {
    if (this.timer) return;
    if (process.env.NODE_ENV === "test" || process.env.ZANZIRANGI_NO_LISTEN === "1") {
      return;
    }
    console.log("[SUPPORT_ESCALATION] Escalation monitor started (30s polling cycle).");
    this.timer = setInterval(() => {
      this.checkEscalations().catch((e) => console.error("[SUPPORT_ESCALATION] Escalation check error:", e.message));
    }, 3e4);
    this.timer.unref();
  }
  stopEscalationMonitor() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
  /**
   * Triggered immediately when AI / visitor triggers HUMAN_REQUIRED.
   * Multi-layer notification:
   * 1. 🔔 Web Dashboard (status updated)
   * 2. 📱 Web Push to HP Staff
   * 3. 📧 Urgent Email via Hostinger SMTP
   * 4. 💬 WhatsApp / Telegram Fallback (if configured)
   */
  async triggerHumanRequired(params) {
    const { conversationId, visitorMessage, visitorId = "Guest", language = "en", currentPage = "/", handoffReason } = params;
    console.log(`[SUPPORT_ESCALATION] \u{1F6A8} HUMAN_REQUIRED triggered for conversation ${conversationId}`);
    const onDutyStaff = await supportRepository.getOnDutyStaff().catch(() => []);
    const hasAgentOnline = onDutyStaff.length > 0;
    const pushBody = hasAgentOnline ? `Guest requires assistance:
"${visitorMessage.slice(0, 95)}"` : `\u26A0\uFE0F NO AGENT ON DUTY! Guest waiting:
"${visitorMessage.slice(0, 90)}"`;
    webPushService.sendNotificationToStaff({
      title: hasAgentOnline ? "\u{1F514} Zanzirangi House \u2013 Customer Support" : "\u{1F6A8} URGENT: Guest Waiting (No Agent On Duty)",
      body: pushBody,
      conversationId
    }).catch((e) => console.warn("[SUPPORT_ESCALATION] Web push error:", e.message));
    emailService.sendHumanSupportAlert({
      conversationId,
      visitorId,
      language,
      currentPage,
      lastMessage: visitorMessage,
      handoffReason: handoffReason || (hasAgentOnline ? "Guest inquiry handed off to staff" : "URGENT: No staff currently on duty!")
    }).catch((e) => console.error("[SUPPORT_ESCALATION] Email alert error:", e.message));
    this.sendWebhookFallback({
      title: "\u{1F6A8} Zanzirangi Support Alert (HUMAN REQUIRED)",
      message: visitorMessage,
      conversationId,
      hasAgentOnline
    }).catch(() => {
    });
    await supportRepository.createEscalationQueueItem(conversationId, visitorMessage).catch(
      (e) => console.warn("[SUPPORT_ESCALATION] Failed to insert queue item:", e.message)
    );
  }
  /**
   * Called when a human staff member replies to the customer.
   * Clears the escalation queue for this conversation.
   */
  async resolveEscalation(conversationId) {
    console.log(`[SUPPORT_ESCALATION] \u2713 Resolving escalation for conversation ${conversationId}`);
    await supportRepository.resolveEscalationQueueItem(conversationId).catch(() => {
    });
  }
  /**
   * Periodically checks pending escalations for 2m, 5m, and 10m thresholds.
   */
  async checkEscalations() {
    const pending = await supportRepository.getPendingEscalations();
    if (!pending || pending.length === 0) return;
    const now = Date.now();
    for (const item of pending) {
      const triggeredTime = new Date(item.triggered_at).getTime();
      const elapsedMinutes = (now - triggeredTime) / 6e4;
      if (elapsedMinutes >= 2 && !item.reminder_2m_sent) {
        console.log(`[SUPPORT_ESCALATION] \u23F1\uFE0F 2m Reminder for conversation ${item.conversation_id}`);
        await webPushService.sendNotificationToStaff({
          title: "\u26A0\uFE0F Zanzirangi Support Reminder (2m)",
          body: `Unread guest inquiry waiting 2+ minutes:
"${item.visitor_message.slice(0, 80)}"`,
          conversationId: item.conversation_id
        });
        await supportRepository.updateEscalationReminders(item.id, { reminder_2m_sent: true });
      }
      if (elapsedMinutes >= 5 && !item.reminder_5m_sent) {
        console.log(`[SUPPORT_ESCALATION] \u23F1\uFE0F 5m Escalation for conversation ${item.conversation_id}`);
        await emailService.sendHumanSupportAlert({
          conversationId: item.conversation_id,
          visitorId: "Urgent Escalation",
          language: "en",
          lastMessage: `[UNANSWERED FOR 5 MINUTES] ${item.visitor_message}`,
          handoffReason: "Guest message has been unanswered for 5 minutes. Please respond immediately."
        });
        await supportRepository.updateEscalationReminders(item.id, { reminder_5m_sent: true });
      }
      if (elapsedMinutes >= 10 && !item.reminder_10m_sent) {
        console.log(`[SUPPORT_ESCALATION] \u{1F6A8} 10m Critical Escalation for conversation ${item.conversation_id}`);
        await webPushService.sendNotificationToStaff({
          title: "\u{1F6A8} CRITICAL ESCALATION (10m Unanswered)",
          body: `Guest has been waiting 10 minutes without a reply:
"${item.visitor_message.slice(0, 80)}"`,
          conversationId: item.conversation_id
        });
        await this.sendWebhookFallback({
          title: "\u{1F6A8} CRITICAL 10M UNANSWERED SUPPORT INQUIRY",
          message: item.visitor_message,
          conversationId: item.conversation_id,
          hasAgentOnline: false
        });
        await supportRepository.updateEscalationReminders(item.id, { reminder_10m_sent: true });
      }
    }
  }
  /**
   * Optional fallback to Telegram or WhatsApp Webhook if configured in environment variables.
   */
  async sendWebhookFallback(data) {
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;
    const whatsappWebhook = process.env.WHATSAPP_WEBHOOK_URL;
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const text = `${data.title}

Message: "${data.message}"

Link: ${appUrl}/admin?tab=inbox&conversation=${data.conversationId}`;
    if (telegramToken && telegramChatId) {
      try {
        await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text,
            parse_mode: "HTML"
          })
        });
      } catch (err) {
        console.warn("[SUPPORT_ESCALATION] Telegram fallback failed:", err.message);
      }
    }
    if (whatsappWebhook) {
      try {
        await fetch(whatsappWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "support_escalation",
            conversationId: data.conversationId,
            text
          })
        });
      } catch (err) {
        console.warn("[SUPPORT_ESCALATION] WhatsApp webhook fallback failed:", err.message);
      }
    }
  }
};
var supportEscalationService = new SupportEscalationService();

// server/supportApiRoutes.ts
var requireSupport = requirePermission("support");
var auditSupport = (req, action, details) => auditRepository.log({ action, userEmail: req.user?.email || "admin", details, ipAddress: req.ip }).catch((e) => console.error("[AUDIT] Support audit failed:", e.message));
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
    if (!visitor_id || conv.visitor_id !== visitor_id) {
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
    if (!vId || conv.visitor_id !== vId) {
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
      await supportEscalationService.triggerHumanRequired({
        conversationId: id,
        visitorMessage: msgText,
        visitorId: conv.visitor_id,
        language: conv.language,
        currentPage: conv.current_page,
        handoffReason: evaluation.handoffReason
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
      if (conv.status === "HUMAN_ACTIVE") {
        nextStatus = "HUMAN_ACTIVE";
      }
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
    if (!visitor_id || conv.visitor_id !== visitor_id) {
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
supportRouter.get("/admin/conversations", authenticateAdmin, requireSupport, async (req, res) => {
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
supportRouter.get("/admin/conversations/:id", authenticateAdmin, requireSupport, async (req, res) => {
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
supportRouter.post("/admin/conversations/:id/messages", authenticateAdmin, requireSupport, async (req, res) => {
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
    await supportEscalationService.resolveEscalation(id);
    await auditSupport(req, "SUPPORT_REPLY_SENT", `Replied in conversation ${id}`);
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
supportRouter.patch("/admin/conversations/:id/status", authenticateAdmin, requireSupport, async (req, res) => {
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
    await auditSupport(req, "SUPPORT_STATUS_CHANGED", `Conversation ${id} \u2192 ${status}`);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update conversation status" });
  }
});
supportRouter.get("/admin/conversations/:id/suggested-reply", authenticateAdmin, requireSupport, async (req, res) => {
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
supportRouter.get("/admin/knowledge-base", authenticateAdmin, requireSupport, async (req, res) => {
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
supportRouter.post("/admin/knowledge-base", authenticateAdmin, requireSupport, async (req, res) => {
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
    await auditSupport(req, "KNOWLEDGE_ITEM_CREATED", `Created knowledge item: ${qText.slice(0, 80)}`);
    res.json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to save knowledge item" });
  }
});
supportRouter.put("/admin/knowledge-base/:id", authenticateAdmin, requireSupport, async (req, res) => {
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
    await auditSupport(req, "KNOWLEDGE_ITEM_UPDATED", `Updated knowledge item ${id}`);
    res.json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update knowledge item" });
  }
});
supportRouter.delete("/admin/knowledge-base/:id", authenticateAdmin, requireSupport, async (req, res) => {
  try {
    const id = toStr(req.params.id);
    const deleted = await supportRepository.deleteKnowledgeItem(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Knowledge item not found" });
    }
    await auditSupport(req, "KNOWLEDGE_ITEM_DELETED", `Deleted knowledge item ${id}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to delete knowledge item" });
  }
});
supportRouter.get("/admin/analytics", authenticateAdmin, requireSupport, async (req, res) => {
  try {
    const analytics = await supportRepository.getAnalytics();
    res.json({ success: true, data: analytics });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch support analytics" });
  }
});
supportRouter.post("/booking-alert", async (req, res) => {
  try {
    const booking = req.body;
    if (!booking || !booking.fullName || !booking.villaName) {
      return res.status(400).json({ success: false, error: "Incomplete booking details" });
    }
    emailService.sendBookingAlert(booking).catch((err) => {
      console.error("[EMAIL] Background booking alert failed:", err.message);
    });
    res.json({ success: true, message: "Booking alert dispatched successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
supportRouter.post("/admin/test-email", authenticateAdmin, requireSupport, async (req, res) => {
  try {
    const { targetEmail } = req.body;
    const to = targetEmail || req.user?.email || "info@zanzirangihouse.com";
    const result = await emailService.testConnection(to);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
supportRouter.get("/push/public-key", (_req, res) => {
  res.json({ success: true, publicKey: webPushService.getPublicKey() });
});
supportRouter.post("/push/subscribe", authenticateAdmin, requireSupport, async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ success: false, error: "Invalid push subscription payload" });
    }
    const email = req.user?.email || "admin@zanzirangihouse.com";
    const role = req.user?.role || "STAFF";
    const saved = await supportRepository.savePushSubscription({
      user_email: email,
      role,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      user_agent: req.headers["user-agent"] || null
    });
    res.json({ success: true, subscription: saved });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
supportRouter.post("/push/unsubscribe", authenticateAdmin, requireSupport, async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (endpoint) {
      await supportRepository.deletePushSubscription(endpoint);
    }
    res.json({ success: true, message: "Unsubscribed successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
supportRouter.post("/push/test", authenticateAdmin, requireSupport, async (req, res) => {
  try {
    const email = req.user?.email || "Staff";
    const result = await webPushService.sendNotificationToStaff({
      title: "\u{1F514} Zanzirangi House Support \u2013 Test Alert",
      body: `Hi ${email.split("@")[0]}! Your phone is connected to Zanzirangi Support Alerts. When guests require human assistance, you will receive real-time notifications here.`,
      url: "/admin"
    });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
supportRouter.get("/duty/status", authenticateAdmin, requireSupport, async (req, res) => {
  try {
    const staffList = await supportRepository.getStaffDutyList();
    const myEmail = req.user?.email || "";
    const myDuty = staffList.find((s) => s.user_email.toLowerCase() === myEmail.toLowerCase());
    res.json({
      success: true,
      staff: staffList,
      isOnDuty: Boolean(myDuty?.is_on_duty),
      hasAgentOnline: staffList.some((s) => s.is_on_duty)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
supportRouter.post("/duty/toggle", authenticateAdmin, requireSupport, async (req, res) => {
  try {
    const { isOnDuty } = req.body;
    const email = req.user?.email || "admin@zanzirangihouse.com";
    const name = req.user?.name || email.split("@")[0];
    const role = req.user?.role || "STAFF";
    const updated = await supportRepository.updateStaffDuty(email, Boolean(isOnDuty), name, role);
    const staffList = await supportRepository.getStaffDutyList();
    res.json({
      success: true,
      duty: updated,
      staff: staffList,
      hasAgentOnline: staffList.some((s) => s.is_on_duty)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// server/runtime.ts
var runtimeState = {
  startedAt: (/* @__PURE__ */ new Date()).toISOString(),
  pid: process.pid,
  /** True once the database adapter connected and verified its schema. */
  databaseReady: false,
  /** Last database startup error (message only, never credentials). */
  databaseError: null,
  shuttingDown: false
};
var uptimeSeconds = () => Math.round(process.uptime());

// server/api.ts
var apiApp = express();
apiApp.set("trust proxy", 1);
apiApp.disable("x-powered-by");
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
var JSON_BODY_LIMIT_MB = Math.ceil(env.MAX_UPLOAD_SIZE_MB * 1.4) + 1;
apiApp.use(express.json({ limit: `${JSON_BODY_LIMIT_MB}mb` }));
apiApp.use(express.urlencoded({ extended: true, limit: `${env.MAX_UPLOAD_SIZE_MB}mb` }));
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
  let dbHealth;
  try {
    dbHealth = await getDatabaseAdapter().healthCheck();
  } catch (err) {
    dbHealth = { connected: false, provider: env.DATABASE_PROVIDER, error: err?.message };
  }
  const healthy = dbHealth.connected && !runtimeState.shuttingDown;
  res.status(healthy ? 200 : 503).json({
    status: healthy ? "ok" : "degraded",
    database: {
      provider: dbHealth.provider,
      connected: dbHealth.connected,
      ...healthy ? {} : { error: runtimeState.databaseError || dbHealth.error || "Database unavailable" }
    },
    runtime: {
      uptimeSeconds: uptimeSeconds(),
      startedAt: runtimeState.startedAt,
      shuttingDown: runtimeState.shuttingDown
    },
    service: "Zanzirangi House CMS Engine",
    version: env.APP_VERSION,
    releaseDate: env.APP_RELEASE_DATE,
    // Pipeline deployment stamp (tag, short commit, CI build, environment, time) — null for manual deploys.
    // The repository is public, so none of this is sensitive; it lets TKS prove exactly what is live.
    release: env.APP_DEPLOYMENT,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
apiApp.get("/health/database", authenticateAdmin, requireSuperadmin, async (_req, res) => {
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
      await auditRepository.log({
        action: "USER_LOGIN_FAILED",
        userEmail: String(email).trim().toLowerCase().slice(0, 255),
        details: "Failed administrator login attempt",
        ipAddress: req.ip
      }).catch(() => void 0);
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
  const header = req.headers.authorization;
  const token = header && header.startsWith("Bearer ") ? header.substring(7).trim() : req.cookies?.zanzirangi_admin_token;
  const decoded = token ? verifyToken(token) : null;
  if (decoded?.id) {
    try {
      await getDatabaseAdapter().revokeUserSessions(decoded.id);
      await auditRepository.log({
        action: "USER_LOGOUT",
        userEmail: decoded.email,
        details: "Administrator logged out (sessions revoked)",
        ipAddress: req.ip
      });
    } catch (err) {
      console.error("[AUTH] Logout revocation failed:", err.message);
    }
  }
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
        maintenanceMode: s.maintenanceMode,
        supportAvatar: s.supportAvatar,
        supportName: s.supportName,
        supportTitle: s.supportTitle,
        supportStatus: s.supportStatus
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve site settings." });
  }
});
apiApp.get("/content/pages", async (_req, res) => {
  try {
    const pages = await pageContentsRepository.getAll();
    res.json({ success: true, data: pages });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve pages." });
  }
});
apiApp.get("/content/pages/:id", async (req, res) => {
  try {
    const page = await pageContentsRepository.getById(String(req.params.id));
    if (!page) {
      res.status(404).json({ success: false, error: "Page not found." });
      return;
    }
    res.json({ success: true, data: page });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve page content." });
  }
});
var HOME_PAGE_ID = "home";
apiApp.get("/content/home-sections", async (_req, res) => {
  try {
    const page = await pageContentsRepository.getById(HOME_PAGE_ID);
    res.json({ success: true, data: page?.contentJson?.homeSections || {} });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve homepage sections." });
  }
});
apiApp.get("/content/translations/:lang", async (req, res) => {
  const lang = String(req.params.lang);
  if (!SUPPORTED_TRANSLATION_LANGS.includes(lang)) {
    res.json({ success: true, data: {} });
    return;
  }
  try {
    const data = await translationsRepository.getMapForLanguage(lang);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve translations." });
  }
});
apiApp.get("/content/chauffeur", async (_req, res) => {
  try {
    const data = await chauffeurRepository.get();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve chauffeur configuration." });
  }
});
apiApp.get("/content/whystay", async (_req, res) => {
  try {
    const data = await whyStayRepository.get();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve sanctuary differentiators." });
  }
});
apiApp.get("/content/dining", async (_req, res) => {
  try {
    const config = await diningRepository.getConfig();
    const categories = await diningRepository.getCategories();
    res.json({
      success: true,
      data: {
        ...config,
        categories: categories.filter((c) => c.visible)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve dining content." });
  }
});
apiApp.get("/content/dining/categories", async (_req, res) => {
  try {
    const categories = await diningRepository.getCategories();
    res.json({ success: true, data: categories.filter((c) => c.visible) });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve dining categories." });
  }
});
apiApp.get("/content/experiences", async (_req, res) => {
  try {
    const items = await experiencesRepository.getAll();
    res.json({ success: true, data: items.filter((item) => item.visible) });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve experiences." });
  }
});
apiApp.get("/content/safari", async (_req, res) => {
  try {
    const items = await safariRepository.getAll();
    res.json({ success: true, data: items.filter((item) => item.visible) });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve safari destinations." });
  }
});
apiApp.get("/content/global", async (_req, res) => {
  try {
    const data = await globalContentRepository.get();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve global content." });
  }
});
apiApp.get("/admin/homepage", authenticateAdmin, requirePermission("homepage"), async (_req, res) => {
  try {
    const data = await homepageRepository.getHomepage();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch homepage data." });
  }
});
apiApp.put("/admin/homepage", authenticateAdmin, requirePermission("homepage"), async (req, res) => {
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
var CONTACT_FIELDS = ["phone", "email", "whatsappNumber", "address", "googleMapsUrl"];
var SOCIAL_FIELDS = ["instagram", "facebook", "tiktok", "youtube", "whatsapp"];
apiApp.get("/admin/contact-info", authenticateAdmin, requirePermission("contact"), async (_req, res) => {
  try {
    const home = await homepageRepository.getHomepage();
    res.json({ success: true, data: { contact: home.contact, socials: home.socials || {} } });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to load contact information." });
  }
});
apiApp.put("/admin/contact-info", authenticateAdmin, requirePermission("contact"), async (req, res) => {
  try {
    const body = req.body || {};
    const home = await homepageRepository.getHomepage();
    const contact = { ...home.contact };
    const socials = { ...home.socials || {} };
    if (body.contact && typeof body.contact === "object") {
      for (const k of CONTACT_FIELDS) if (typeof body.contact[k] === "string") contact[k] = body.contact[k].trim();
    }
    if (body.socials && typeof body.socials === "object") {
      for (const k of SOCIAL_FIELDS) if (typeof body.socials[k] === "string") socials[k] = body.socials[k].trim();
    }
    if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      res.status(400).json({ success: false, error: "Please provide a valid contact email address." });
      return;
    }
    const updated = await homepageRepository.updateHomepage({ contact, socials }, req.user?.email || "admin");
    res.json({
      success: true,
      data: { contact: updated.contact, socials: updated.socials || {} },
      message: "Contact information saved and published."
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to save contact information." });
  }
});
apiApp.get("/admin/villas", authenticateAdmin, requirePermission("villas"), async (_req, res) => {
  try {
    const data = await villasRepository.getAll();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve villas." });
  }
});
apiApp.post("/admin/villas", authenticateAdmin, requirePermission("villas"), async (req, res) => {
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
apiApp.put("/admin/villas/:id", authenticateAdmin, requirePermission("villas"), async (req, res) => {
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
apiApp.delete("/admin/villas/:id", authenticateAdmin, requirePermission("villas"), async (req, res) => {
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
apiApp.get("/admin/gallery", authenticateAdmin, requirePermission("gallery"), async (_req, res) => {
  try {
    const data = await galleryRepository.getAll();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve gallery items." });
  }
});
apiApp.post("/admin/gallery", authenticateAdmin, requirePermission("gallery"), async (req, res) => {
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
apiApp.put("/admin/gallery/:id", authenticateAdmin, requirePermission("gallery"), async (req, res) => {
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
apiApp.delete("/admin/gallery/:id", authenticateAdmin, requirePermission("gallery"), async (req, res) => {
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
apiApp.get("/admin/facilities", authenticateAdmin, requirePermission("facilities"), async (_req, res) => {
  try {
    const data = await facilitiesRepository.getAll();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve facilities." });
  }
});
apiApp.put("/admin/facilities/:id", authenticateAdmin, requirePermission("facilities"), async (req, res) => {
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
apiApp.post("/admin/facilities", authenticateAdmin, requirePermission("facilities"), async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.title || typeof body.title !== "string") {
      res.status(400).json({ success: false, error: "A facility title is required." });
      return;
    }
    const facilities = await facilitiesRepository.getAll();
    const id = String(body.id || `facility-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, "-");
    if (facilities.some((f) => f.id === id)) {
      res.status(400).json({ success: false, error: `A facility with id '${id}' already exists.` });
      return;
    }
    const saved = await facilitiesRepository.save(
      {
        category: "",
        description: "",
        hours: "",
        highlight: "",
        image: "",
        icon: "Sparkles",
        order: facilities.length + 1,
        visible: true,
        ...body,
        id
      },
      req.user?.email || "admin"
    );
    res.json({ success: true, data: saved, message: "Facility created." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to create facility." });
  }
});
apiApp.delete("/admin/facilities/:id", authenticateAdmin, requirePermission("facilities"), async (req, res) => {
  try {
    const deleted = await getDatabaseAdapter().deleteFacility(String(req.params.id), req.user?.email || "admin");
    if (!deleted) {
      res.status(404).json({ success: false, error: "Facility not found." });
      return;
    }
    res.json({ success: true, message: "Facility deleted." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to delete facility." });
  }
});
apiApp.get("/admin/testimonials", authenticateAdmin, requirePermission("testimonials"), async (_req, res) => {
  try {
    const data = await testimonialsRepository.getAll();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve testimonials." });
  }
});
apiApp.post("/admin/testimonials", authenticateAdmin, requirePermission("testimonials"), async (req, res) => {
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
apiApp.put("/admin/testimonials/:id", authenticateAdmin, requirePermission("testimonials"), async (req, res) => {
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
apiApp.delete("/admin/testimonials/:id", authenticateAdmin, requirePermission("testimonials"), async (req, res) => {
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
apiApp.get("/admin/videos", authenticateAdmin, requirePermission("videos"), async (_req, res) => {
  try {
    const data = await videosRepository.get();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch video details." });
  }
});
apiApp.put("/admin/videos", authenticateAdmin, requirePermission("videos"), async (req, res) => {
  try {
    const updated = await videosRepository.update(req.body, req.user?.email || "admin");
    res.json({ success: true, data: updated, message: "Promotional video details updated." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update videos." });
  }
});
apiApp.get("/admin/seo", authenticateAdmin, requirePermission("seo"), async (_req, res) => {
  try {
    const data = await seoRepository.getSeo();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch SEO configuration." });
  }
});
apiApp.put("/admin/seo", authenticateAdmin, requirePermission("seo"), async (req, res) => {
  try {
    const updated = await seoRepository.updateSeo(req.body, req.user?.email || "admin");
    res.json({ success: true, data: updated, message: "SEO configuration saved." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update SEO." });
  }
});
apiApp.get("/admin/media", authenticateAdmin, requirePermission("media"), async (_req, res) => {
  try {
    const data = await mediaRepository.getAll();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch media assets." });
  }
});
apiApp.post("/admin/media", authenticateAdmin, requirePermission("media"), async (req, res) => {
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
apiApp.delete("/admin/media/:id", authenticateAdmin, requirePermission("media"), async (req, res) => {
  try {
    const id = String(req.params.id);
    const asset = (await mediaRepository.getAll()).find((m) => m.id === id);
    const deleted = await mediaRepository.delete(id, req.user?.email || "admin");
    if (!deleted) {
      res.status(404).json({ success: false, error: "Media asset not found." });
      return;
    }
    let fileRemoved = false;
    if (asset?.url && String(asset.url).startsWith("/uploads/")) {
      try {
        fileRemoved = await mediaStorage.deleteFile(String(asset.url).replace("/uploads/", ""));
      } catch (e) {
        console.error("[MEDIA] Could not delete stored file:", e.message);
      }
    }
    res.json({ success: true, message: fileRemoved ? "Media asset and file removed." : "Media asset removed." });
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
    const base64Data = String(fileBase64).replace(/^data:[^;,]+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    if (buffer.length === 0) {
      res.status(400).json({ success: false, error: "The uploaded file is empty or not valid base64." });
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
apiApp.get("/admin/settings", authenticateAdmin, requirePermission("settings"), async (_req, res) => {
  try {
    const data = await settingsRepository.getSettings();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch settings." });
  }
});
apiApp.put("/admin/settings", authenticateAdmin, requirePermission("settings"), async (req, res) => {
  try {
    const updated = await settingsRepository.updateSettings(req.body, req.user?.email || "admin");
    res.json({ success: true, data: updated, message: "Settings saved." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update settings." });
  }
});
apiApp.get("/admin/pages", authenticateAdmin, requirePermission("pages"), async (_req, res) => {
  try {
    const pages = await pageContentsRepository.getAll();
    res.json({ success: true, data: pages });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch pages." });
  }
});
apiApp.get("/admin/pages/:id", authenticateAdmin, requirePermission("pages"), async (req, res) => {
  try {
    const page = await pageContentsRepository.getById(String(req.params.id));
    if (!page) {
      res.status(404).json({ success: false, error: "Page not found." });
      return;
    }
    res.json({ success: true, data: page });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch page content." });
  }
});
apiApp.put("/admin/pages/:id", authenticateAdmin, requirePermission("pages"), async (req, res) => {
  try {
    const id = String(req.params.id);
    const body = { ...req.body || {} };
    const existing = await pageContentsRepository.getById(id);
    if (existing?.contentJson?.homeSections) {
      body.contentJson = { ...body.contentJson || {}, homeSections: existing.contentJson.homeSections };
    }
    const updated = await pageContentsRepository.update(id, body, req.user?.email || "admin");
    res.json({ success: true, data: updated, message: `Page '${updated.title}' saved and published.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to update page." });
  }
});
apiApp.get("/admin/translations/:lang", authenticateAdmin, requirePermission("pages"), async (req, res) => {
  const lang = String(req.params.lang);
  if (!SUPPORTED_TRANSLATION_LANGS.includes(lang)) {
    res.status(400).json({ success: false, error: `Unsupported language '${lang}'.` });
    return;
  }
  try {
    const data = await translationsRepository.getForLanguage(lang);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch translations." });
  }
});
apiApp.put("/admin/translations/:lang", authenticateAdmin, requirePermission("pages"), async (req, res) => {
  const lang = String(req.params.lang);
  const entries = req.body?.entries;
  if (!SUPPORTED_TRANSLATION_LANGS.includes(lang)) {
    res.status(400).json({ success: false, error: `Unsupported language '${lang}'.` });
    return;
  }
  const valid = Array.isArray(entries) && entries.every(
    (e) => e && typeof e.entity === "string" && typeof e.path === "string" && e.path.length <= 255 && typeof e.value === "string" && (e.source === void 0 || typeof e.source === "string")
  );
  if (!valid) {
    res.status(400).json({ success: false, error: "Invalid translations payload." });
    return;
  }
  try {
    const saved = await translationsRepository.save(lang, entries, req.user?.email || "admin");
    res.json({ success: true, data: { saved }, message: `${saved} ${lang.toUpperCase()} translations saved and published.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to save translations." });
  }
});
apiApp.get("/admin/home-sections", authenticateAdmin, requirePermission("homepage"), async (_req, res) => {
  try {
    const page = await pageContentsRepository.getById(HOME_PAGE_ID);
    res.json({ success: true, data: page?.contentJson?.homeSections || {} });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch homepage sections." });
  }
});
apiApp.put("/admin/home-sections", authenticateAdmin, requirePermission("homepage"), async (req, res) => {
  try {
    const homeSections = req.body;
    if (!homeSections || typeof homeSections !== "object" || Array.isArray(homeSections)) {
      res.status(400).json({ success: false, error: "Invalid homepage sections payload." });
      return;
    }
    const existing = await pageContentsRepository.getById(HOME_PAGE_ID);
    if (!existing) {
      res.status(404).json({ success: false, error: "Home page record not found in page_contents." });
      return;
    }
    const updated = await pageContentsRepository.update(
      HOME_PAGE_ID,
      { contentJson: { ...existing.contentJson || {}, homeSections } },
      req.user?.email || "admin"
    );
    res.json({ success: true, data: updated.contentJson?.homeSections || {}, message: "Homepage sections saved and published." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to update homepage sections." });
  }
});
apiApp.get("/admin/chauffeur", authenticateAdmin, requirePermission("transfers"), async (_req, res) => {
  try {
    const data = await chauffeurRepository.get();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch chauffeur configuration." });
  }
});
apiApp.put("/admin/chauffeur", authenticateAdmin, requirePermission("transfers"), async (req, res) => {
  try {
    const updated = await chauffeurRepository.update(req.body, req.user?.email || "admin");
    res.json({ success: true, data: updated, message: "VIP Chauffeur & Transfers configuration published." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to update chauffeur configuration." });
  }
});
apiApp.get("/admin/whystay", authenticateAdmin, requireAnyPermission(["homepage", "pages"]), async (_req, res) => {
  try {
    const data = await whyStayRepository.get();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch sanctuary differentiators." });
  }
});
apiApp.put("/admin/whystay", authenticateAdmin, requireAnyPermission(["homepage", "pages"]), async (req, res) => {
  try {
    const updated = await whyStayRepository.update(req.body, req.user?.email || "admin");
    res.json({ success: true, data: updated, message: "Why Stay / Sanctuary Difference configuration published." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to update sanctuary differentiators." });
  }
});
apiApp.get("/admin/dining", authenticateAdmin, requirePermission("dining"), async (_req, res) => {
  try {
    const config = await diningRepository.getConfig();
    const categories = await diningRepository.getCategories();
    res.json({ success: true, data: { ...config, categories } });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch dining content." });
  }
});
apiApp.put("/admin/dining", authenticateAdmin, requirePermission("dining"), async (req, res) => {
  try {
    const updated = await diningRepository.updateConfig(req.body, req.user?.email || "admin");
    res.json({ success: true, data: updated, message: "Dining narrative published." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to update dining config." });
  }
});
apiApp.get("/admin/dining/categories", authenticateAdmin, requirePermission("dining"), async (_req, res) => {
  try {
    const categories = await diningRepository.getCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch dining categories." });
  }
});
apiApp.post("/admin/dining/categories", authenticateAdmin, requirePermission("dining"), async (req, res) => {
  try {
    const cat = {
      ...req.body,
      id: req.body.id || `dining-${Date.now()}`,
      order: req.body.order || 0,
      visible: req.body.visible !== false,
      signatureDishes: req.body.signatureDishes || []
    };
    const saved = await diningRepository.saveCategory(cat, req.user?.email || "admin");
    res.json({ success: true, data: saved, message: "Dining category created." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to create dining category." });
  }
});
apiApp.put("/admin/dining/categories/:id", authenticateAdmin, requirePermission("dining"), async (req, res) => {
  try {
    const id = String(req.params.id);
    const cat = {
      ...req.body,
      id
    };
    const saved = await diningRepository.saveCategory(cat, req.user?.email || "admin");
    res.json({ success: true, data: saved, message: "Dining category updated." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to update dining category." });
  }
});
apiApp.delete("/admin/dining/categories/:id", authenticateAdmin, requirePermission("dining"), async (req, res) => {
  try {
    const deleted = await diningRepository.deleteCategory(String(req.params.id), req.user?.email || "admin");
    if (!deleted) {
      res.status(404).json({ success: false, error: "Dining category not found." });
      return;
    }
    res.json({ success: true, message: "Dining category deleted." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to delete dining category." });
  }
});
apiApp.get("/admin/experiences", authenticateAdmin, requirePermission("experiences"), async (_req, res) => {
  try {
    const items = await experiencesRepository.getAll();
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch experiences." });
  }
});
apiApp.post("/admin/experiences", authenticateAdmin, requirePermission("experiences"), async (req, res) => {
  try {
    const item = {
      ...req.body,
      id: req.body.id || `exp-${Date.now()}`,
      order: req.body.order || 0,
      visible: req.body.visible !== false
    };
    const saved = await experiencesRepository.save(item, req.user?.email || "admin");
    res.json({ success: true, data: saved, message: "Experience created successfully." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to create experience." });
  }
});
apiApp.put("/admin/experiences/:id", authenticateAdmin, requirePermission("experiences"), async (req, res) => {
  try {
    const item = {
      ...req.body,
      id: String(req.params.id)
    };
    const saved = await experiencesRepository.save(item, req.user?.email || "admin");
    res.json({ success: true, data: saved, message: "Experience updated successfully." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to update experience." });
  }
});
apiApp.delete("/admin/experiences/:id", authenticateAdmin, requirePermission("experiences"), async (req, res) => {
  try {
    const deleted = await experiencesRepository.delete(String(req.params.id), req.user?.email || "admin");
    if (!deleted) {
      res.status(404).json({ success: false, error: "Experience not found." });
      return;
    }
    res.json({ success: true, message: "Experience deleted successfully." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to delete experience." });
  }
});
apiApp.get("/admin/safari", authenticateAdmin, requirePermission("safari"), async (_req, res) => {
  try {
    const items = await safariRepository.getAll();
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch safari destinations." });
  }
});
apiApp.post("/admin/safari", authenticateAdmin, requirePermission("safari"), async (req, res) => {
  try {
    const item = {
      ...req.body,
      id: req.body.id || `safari-${Date.now()}`,
      order: req.body.order || 0,
      visible: req.body.visible !== false,
      highlights: req.body.highlights || []
    };
    const saved = await safariRepository.save(item, req.user?.email || "admin");
    res.json({ success: true, data: saved, message: "Safari destination created successfully." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to create safari destination." });
  }
});
apiApp.put("/admin/safari/:id", authenticateAdmin, requirePermission("safari"), async (req, res) => {
  try {
    const item = {
      ...req.body,
      id: String(req.params.id)
    };
    const saved = await safariRepository.save(item, req.user?.email || "admin");
    res.json({ success: true, data: saved, message: "Safari destination updated successfully." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to update safari destination." });
  }
});
apiApp.delete("/admin/safari/:id", authenticateAdmin, requirePermission("safari"), async (req, res) => {
  try {
    const deleted = await safariRepository.delete(String(req.params.id), req.user?.email || "admin");
    if (!deleted) {
      res.status(404).json({ success: false, error: "Safari destination not found." });
      return;
    }
    res.json({ success: true, message: "Safari destination deleted successfully." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to delete safari destination." });
  }
});
apiApp.get("/admin/global", authenticateAdmin, requirePermission("settings"), async (_req, res) => {
  try {
    const data = await globalContentRepository.get();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch global content." });
  }
});
apiApp.put("/admin/global", authenticateAdmin, requirePermission("settings"), async (req, res) => {
  try {
    const updated = await globalContentRepository.update(req.body, req.user?.email || "admin");
    res.json({ success: true, data: updated, message: "Global navigation and footer content published." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to update global content." });
  }
});
var MAX_ACTIVE_ADMINS = 6;
var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var countActiveSuperadmins = async () => (await usersRepository.list()).filter((u) => u.role === "superadmin" && u.status !== "disabled").length;
apiApp.get("/admin/users", authenticateAdmin, requireSuperadmin, async (_req, res) => {
  try {
    const users = await usersRepository.list();
    const activeCount = users.filter((u) => u.status !== "disabled").length;
    res.json({
      success: true,
      data: users,
      meta: {
        activeCount,
        maxActive: MAX_ACTIVE_ADMINS,
        availableSlots: Math.max(0, MAX_ACTIVE_ADMINS - activeCount)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch administrators." });
  }
});
apiApp.post("/admin/users", authenticateAdmin, requireSuperadmin, async (req, res) => {
  try {
    const name = req.body.name || req.body.fullName;
    const { email, password, role, permissions } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ success: false, error: "Full name, email, and password are required." });
      return;
    }
    if (typeof password !== "string" || password.length < 8 || password.length > 72) {
      res.status(400).json({ success: false, error: "Password must be between 8 and 72 characters long." });
      return;
    }
    const cleanEmail = String(email).trim().toLowerCase();
    if (!EMAIL_PATTERN.test(cleanEmail)) {
      res.status(400).json({ success: false, error: "Please provide a valid email address." });
      return;
    }
    const existing = await usersRepository.findByEmail(cleanEmail);
    if (existing) {
      res.status(400).json({ success: false, error: "An administrator with this email already exists." });
      return;
    }
    const activeCount = await usersRepository.getActiveCount();
    if (activeCount >= MAX_ACTIVE_ADMINS) {
      res.status(400).json({
        success: false,
        error: `Maximum active administrators limit reached (${MAX_ACTIVE_ADMINS}/${MAX_ACTIVE_ADMINS}). Please disable an existing user before adding a new one.`
      });
      return;
    }
    const passwordHash = await bcrypt3.hash(password, 12);
    const assignedRole = role === "superadmin" ? "superadmin" : "admin";
    const assignedPermissions = Array.isArray(permissions) ? sanitizePermissions(permissions) : [...ADMIN_PERMISSIONS];
    const newUser = await usersRepository.create({
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      role: assignedRole,
      status: "active",
      permissions: assignedPermissions,
      tokenVersion: 1,
      passwordHash,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    await auditRepository.log({
      action: "ADMIN_USER_CREATED",
      userEmail: req.user.email,
      details: `Created administrator ${newUser.name} (${newUser.email}) with role ${newUser.role}`,
      ipAddress: req.ip
    });
    res.json({
      success: true,
      message: "Administrator successfully created.",
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        permissions: newUser.permissions,
        createdAt: newUser.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to create administrator." });
  }
});
apiApp.get("/admin/users/:id", authenticateAdmin, requireSuperadmin, async (req, res) => {
  try {
    const user = await usersRepository.findById(String(req.params.id));
    if (!user) {
      res.status(404).json({ success: false, error: "User not found." });
      return;
    }
    const { passwordHash, ...safe } = user;
    res.json({ success: true, data: safe });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch administrator." });
  }
});
apiApp.put("/admin/users/:id", authenticateAdmin, requireSuperadmin, async (req, res) => {
  try {
    const id = String(req.params.id);
    const existing = await usersRepository.findById(id);
    if (!existing) {
      res.status(404).json({ success: false, error: "User not found." });
      return;
    }
    const body = req.body || {};
    const changes = {};
    if (body.name !== void 0) {
      const name = String(body.name).trim();
      if (!name || name.length > 120) {
        res.status(400).json({ success: false, error: "Name must be between 1 and 120 characters." });
        return;
      }
      changes.name = name;
    }
    if (body.role !== void 0) {
      if (body.role !== "superadmin" && body.role !== "admin") {
        res.status(400).json({ success: false, error: "Role must be 'superadmin' or 'admin'." });
        return;
      }
      changes.role = body.role;
    }
    if (body.status !== void 0) {
      if (body.status !== "active" && body.status !== "disabled") {
        res.status(400).json({ success: false, error: "Status must be 'active' or 'disabled'." });
        return;
      }
      changes.status = body.status;
    }
    if (body.permissions !== void 0) {
      if (!Array.isArray(body.permissions)) {
        res.status(400).json({ success: false, error: "Permissions must be a list." });
        return;
      }
      changes.permissions = sanitizePermissions(body.permissions);
    }
    const isSelf = id === req.user?.id;
    const losesSuperadmin = existing.role === "superadmin" && existing.status !== "disabled" && (changes.role && changes.role !== "superadmin" || changes.status === "disabled");
    if (isSelf && (changes.status === "disabled" || changes.role && changes.role !== existing.role)) {
      res.status(400).json({ success: false, error: "You cannot disable or change the role of your own account." });
      return;
    }
    if (losesSuperadmin && await countActiveSuperadmins() <= 1) {
      res.status(400).json({ success: false, error: "Cannot disable or demote the last remaining active Superadmin." });
      return;
    }
    if (existing.status === "disabled" && changes.status === "active") {
      const activeCount = await usersRepository.getActiveCount();
      if (activeCount >= MAX_ACTIVE_ADMINS) {
        res.status(400).json({
          success: false,
          error: `Maximum active administrators limit reached (${MAX_ACTIVE_ADMINS}/${MAX_ACTIVE_ADMINS}).`
        });
        return;
      }
    }
    const updated = await usersRepository.update(id, changes);
    const { passwordHash, ...safe } = updated;
    const changeSummary = [
      changes.name !== void 0 && changes.name !== existing.name ? "name" : null,
      changes.role !== void 0 && changes.role !== existing.role ? `role ${existing.role} \u2192 ${changes.role}` : null,
      changes.status !== void 0 && changes.status !== existing.status ? `status ${existing.status || "active"} \u2192 ${changes.status}` : null,
      changes.permissions !== void 0 && JSON.stringify(changes.permissions) !== JSON.stringify(existing.permissions || []) ? `permissions [${changes.permissions.join(", ")}]` : null
    ].filter(Boolean);
    await auditRepository.log({
      action: "ADMIN_USER_UPDATED",
      userEmail: req.user.email,
      details: `Updated administrator ${safe.name} (${safe.email})${changeSummary.length ? `: ${changeSummary.join("; ")}` : ""}`,
      ipAddress: req.ip
    });
    res.json({ success: true, data: safe, message: "Administrator profile updated." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to update administrator." });
  }
});
apiApp.post("/admin/users/:id/disable", authenticateAdmin, requireSuperadmin, async (req, res) => {
  try {
    const id = String(req.params.id);
    const target = await usersRepository.findById(id);
    if (!target) {
      res.status(404).json({ success: false, error: "User not found." });
      return;
    }
    if (id === req.user?.id) {
      res.status(400).json({ success: false, error: "You cannot disable your own currently active account." });
      return;
    }
    if (target.role === "superadmin") {
      const allUsers = await usersRepository.list();
      const activeSuperadmins = allUsers.filter((u) => u.role === "superadmin" && u.status !== "disabled");
      if (activeSuperadmins.length <= 1) {
        res.status(400).json({ success: false, error: "Cannot disable the last remaining active Superadmin." });
        return;
      }
    }
    await usersRepository.disable(id);
    await auditRepository.log({
      action: "ADMIN_USER_DISABLED",
      userEmail: req.user.email,
      details: `Deactivated administrator ${target.name} (${target.email})`,
      ipAddress: req.ip
    });
    res.json({ success: true, message: `Administrator ${target.name} has been deactivated.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to disable administrator." });
  }
});
apiApp.post("/admin/users/:id/enable", authenticateAdmin, requireSuperadmin, async (req, res) => {
  try {
    const id = String(req.params.id);
    const target = await usersRepository.findById(id);
    if (!target) {
      res.status(404).json({ success: false, error: "User not found." });
      return;
    }
    if (target.status !== "disabled") {
      res.json({ success: true, message: `Administrator ${target.name} is already active.` });
      return;
    }
    const activeCount = await usersRepository.getActiveCount();
    if (activeCount >= MAX_ACTIVE_ADMINS) {
      res.status(400).json({
        success: false,
        error: `Maximum active administrators limit reached (${MAX_ACTIVE_ADMINS}/${MAX_ACTIVE_ADMINS}). Please disable an existing user first.`
      });
      return;
    }
    await usersRepository.enable(id);
    await auditRepository.log({
      action: "ADMIN_USER_ENABLED",
      userEmail: req.user.email,
      details: `Activated administrator ${target.name} (${target.email})`,
      ipAddress: req.ip
    });
    res.json({ success: true, message: `Administrator ${target.name} has been activated.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to enable administrator." });
  }
});
apiApp.post("/admin/users/:id/reset-password", authenticateAdmin, requireSuperadmin, async (req, res) => {
  try {
    const id = String(req.params.id);
    const { newPassword } = req.body;
    if (typeof newPassword !== "string" || newPassword.length < 8 || newPassword.length > 72) {
      res.status(400).json({ success: false, error: "New password must be between 8 and 72 characters long." });
      return;
    }
    const target = await usersRepository.findById(id);
    if (!target) {
      res.status(404).json({ success: false, error: "User not found." });
      return;
    }
    const newHash = await bcrypt3.hash(newPassword, 12);
    await usersRepository.resetPassword(id, newHash);
    await auditRepository.log({
      action: "ADMIN_PASSWORD_RESET",
      userEmail: req.user.email,
      details: `Reset password for administrator ${target.name} (${target.email}). Active sessions invalidated.`,
      ipAddress: req.ip
    });
    res.json({ success: true, message: "Password has been reset successfully. Active sessions invalidated." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Failed to reset password." });
  }
});
apiApp.get("/admin/dashboard-stats", authenticateAdmin, requirePermission("dashboard"), async (_req, res) => {
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
apiApp.get(["/admin/audit-logs", "/admin/audit"], authenticateAdmin, requireSuperadmin, async (req, res) => {
  try {
    const requested = parseInt(String(req.query.limit || "50"), 10);
    const limit = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), 500) : 50;
    const logs = await auditRepository.getLogs(limit);
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch audit logs." });
  }
});
apiApp.use("/support", supportRouter);
apiApp.use((req, res) => {
  res.status(404).json({ success: false, error: `API endpoint not found: ${req.method} ${req.baseUrl}${req.path}` });
});
apiApp.use((err, req, res, _next) => {
  if (err?.type === "entity.too.large") {
    res.status(413).json({ success: false, error: `Request is too large (limit ${env.MAX_UPLOAD_SIZE_MB} MB).` });
    return;
  }
  if (err?.type === "entity.parse.failed") {
    res.status(400).json({ success: false, error: "Malformed JSON request body." });
    return;
  }
  console.error(`[API] Unhandled error on ${req.method} ${req.originalUrl}: ${err?.stack || err}`);
  res.status(err?.status || 500).json({
    success: false,
    error: env.NODE_ENV === "production" ? "Internal server error." : String(err?.message || err)
  });
});

// server/index.ts
init_env();
try {
  validateEnvironment();
} catch (err) {
  console.error(`[STARTUP] Invalid environment configuration: ${err.message}`);
  process.exit(1);
}
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path5.dirname(__filename2);
var app = express2();
app.set("trust proxy", 1);
app.disable("x-powered-by");
if (env.SITE_NOINDEX) {
  app.use((req, res, next) => {
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    if (req.path === "/robots.txt") {
      res.type("text/plain").send("User-agent: *\nDisallow: /\n");
      return;
    }
    next();
  });
}
var uploadHeaders = (res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Content-Security-Policy", "default-src 'none'; img-src 'self'; media-src 'self'; sandbox");
  res.setHeader("Cache-Control", "public, no-cache");
};
var mediaDirs = Array.from(/* @__PURE__ */ new Set([mediaStorage.getStorageDirectory(), path5.resolve(process.cwd(), "uploads")]));
mediaDirs.forEach((dir) => {
  if (fs5.existsSync(dir)) {
    app.use("/uploads", express2.static(dir, { setHeaders: uploadHeaders, index: false }));
  }
});
app.use("/api", apiApp);
var distCandidates = [path5.resolve(__dirname2, "dist"), path5.resolve(__dirname2, "../dist")];
var distPath = distCandidates.find((p) => fs5.existsSync(path5.join(p, "index.html"))) || distCandidates[0];
app.use(
  "/assets",
  express2.static(path5.join(distPath, "assets"), { maxAge: "1y", immutable: true, index: false, fallthrough: false })
);
app.use(
  express2.static(distPath, {
    index: false,
    redirect: false,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) res.setHeader("Cache-Control", "no-cache");
    }
  })
);
app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") return next();
  if (req.path.startsWith("/api") || req.path.startsWith("/uploads") || req.path.startsWith("/assets")) {
    return next();
  }
  if (path5.extname(req.path)) {
    res.status(404).type("text/plain").send("Not found");
    return;
  }
  const routeDir = path5.resolve(distPath, "." + req.path.replace(/\/+$/, ""));
  const prerendered = path5.join(routeDir, "index.html");
  const target = routeDir.startsWith(distPath) && req.path !== "/" && fs5.existsSync(prerendered) ? prerendered : path5.join(distPath, "index.html");
  res.setHeader("Cache-Control", "no-cache");
  res.sendFile(target, (err) => {
    if (err && !res.headersSent) {
      res.status(503).type("text/plain").send("Zanzirangi House: frontend build is missing on the server.");
    }
  });
});
var dbRetryTimer = null;
async function connectDatabase(attempt = 1) {
  try {
    await getDatabaseAdapter().connect();
    runtimeState.databaseReady = true;
    runtimeState.databaseError = null;
    console.log(`[DATABASE] Ready [provider: ${env.DATABASE_PROVIDER}, attempt ${attempt}]`);
  } catch (err) {
    runtimeState.databaseReady = false;
    runtimeState.databaseError = err?.message || "Unknown database error";
    const delay = Math.min(60, 5 * attempt);
    console.error(
      `[DATABASE] Connection failed (attempt ${attempt}): ${runtimeState.databaseError}. Retrying in ${delay}s.`
    );
    if (!runtimeState.shuttingDown) {
      dbRetryTimer = setTimeout(() => connectDatabase(attempt + 1), delay * 1e3);
    }
  }
}
var PORT = env.PORT || 3e3;
var HOST = "0.0.0.0";
var embedded = process.env.ZANZIRANGI_NO_LISTEN === "1";
var server = embedded ? null : app.listen(PORT, HOST, () => {
  console.log(
    `[STARTUP] Zanzirangi House ready [env: ${env.NODE_ENV}, provider: ${env.DATABASE_PROVIDER}, bind: ${HOST}:${PORT}, pid: ${process.pid}, url: ${env.APP_URL}]`
  );
});
server?.on("error", (err) => {
  console.error(`[STARTUP] HTTP server error: ${err.code || ""} ${err.message}`);
  if (err.code === "EADDRINUSE" || err.code === "EACCES") process.exit(1);
});
connectDatabase();
supportEscalationService.startEscalationMonitor();
async function shutdown(signal, exitCode = 0) {
  if (runtimeState.shuttingDown) return;
  runtimeState.shuttingDown = true;
  console.log(`[SHUTDOWN] ${signal} received (pid ${process.pid}, uptime ${uptimeSeconds()}s). Shutting down gracefully...`);
  supportEscalationService.stopEscalationMonitor();
  if (dbRetryTimer) clearTimeout(dbRetryTimer);
  const forceExit = setTimeout(() => {
    console.error("[SHUTDOWN] Graceful shutdown timed out after 10s. Forcing exit.");
    process.exit(exitCode || 1);
  }, 1e4);
  forceExit.unref();
  if (server) {
    await new Promise((resolve) => server.close(() => resolve()));
    console.log("[SHUTDOWN] HTTP server closed.");
  }
  try {
    await getDatabaseAdapter().disconnect();
    console.log("[SHUTDOWN] Database connections closed.");
  } catch (e) {
    console.error(`[SHUTDOWN] Error closing database connections: ${e.message}`);
  }
  console.log(`[SHUTDOWN] Process exit (${exitCode}).`);
  process.exit(exitCode);
}
if (!embedded) {
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("unhandledRejection", (reason) => {
    console.error(`[RUNTIME] Unhandled promise rejection: ${reason?.stack || reason}`);
  });
  process.on("uncaughtException", (err) => {
    console.error(`[RUNTIME] Uncaught exception: ${err.stack || err.message}`);
    shutdown("uncaughtException", 1);
  });
}
export {
  app,
  server
};
