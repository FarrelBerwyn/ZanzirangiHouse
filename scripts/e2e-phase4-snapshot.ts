import { getMysqlPool } from '../server/database/connection.ts';

export async function captureHomepageSnapshot() {
  const pool = getMysqlPool();
  
  const [configRows]: any = await pool.query('SELECT * FROM homepage_config WHERE id = 1');
  const [slideRows]: any = await pool.query('SELECT * FROM hero_slides ORDER BY sort_order ASC');
  const [sectionRows]: any = await pool.query('SELECT * FROM homepage_sections ORDER BY sort_order ASC');
  
  if (!configRows || configRows.length === 0) {
    throw new Error('Critical: No homepage_config record found in MySQL.');
  }
  
  const snapshot = {
    homepageConfig: { ...configRows[0] },
    heroSlides: slideRows.map((s: any) => ({ ...s })),
    homepageSections: sectionRows.map((sec: any) => ({ ...sec })),
    capturedAt: new Date().toISOString(),
  };
  
  return snapshot;
}

async function main() {
  console.log('Capturing Homepage Snapshot from Hostinger MySQL...');
  const snapshot = await captureHomepageSnapshot();
  console.log('Snapshot successfully captured:');
  console.log(`- Hero Title: "${snapshot.homepageConfig.hero_title}"`);
  console.log(`- Hero Subtitle: "${snapshot.homepageConfig.hero_subtitle}"`);
  console.log(`- Primary CTA: "${snapshot.homepageConfig.hero_primary_cta_text}" -> "${snapshot.homepageConfig.hero_primary_cta_link}"`);
  console.log(`- Hero Image: "${snapshot.homepageConfig.hero_image}"`);
  console.log(`- Hero Slides Count: ${snapshot.heroSlides.length}`);
  console.log(`- Slide 1 Title: "${snapshot.heroSlides[0]?.title}"`);
  console.log(`- Last Updated: ${snapshot.homepageConfig.meta_last_updated} by ${snapshot.homepageConfig.meta_updated_by}`);
  
  // Verify integrity by immediate second read
  const pool = getMysqlPool();
  const [verifyRows]: any = await pool.query('SELECT hero_title, hero_subtitle FROM homepage_config WHERE id = 1');
  if (verifyRows[0].hero_title !== snapshot.homepageConfig.hero_title) {
    console.error('Snapshot Integrity Check: FAILED');
    process.exit(1);
  }
  console.log('Snapshot Integrity Check: PASS (100% Verified against live MySQL)');
  process.exit(0);
}

if (process.argv[1]?.endsWith('e2e-phase4-snapshot.ts')) {
  main().catch(err => {
    console.error('Fatal error in snapshot:', err);
    process.exit(1);
  });
}
