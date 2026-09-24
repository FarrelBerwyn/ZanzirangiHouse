#!/usr/bin/env node
/**
 * SEO & GEO (Generative Engine Optimization) Audit Script
 * Usage: node scripts/seo_audit.js [url]
 */

import https from 'node:https';
import http from 'node:http';
import { URL } from 'node:url';

const targetUrl = process.argv[2] || 'https://zanzirangihouse.com/';
console.log(`\n============================================================`);
console.log(`🔍 RUNNING SEO & GEO AUDIT FOR: ${targetUrl}`);
console.log(`============================================================\n`);

function fetchUrl(target, options = {}) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(target);
      const client = parsed.protocol === 'https:' ? https : http;
      const start = Date.now();
      const req = client.get(
        parsed,
        {
          headers: {
            'User-Agent': options.userAgent || 'Mozilla/5.0 (compatible; SEOGEOAuditor/2.0)',
            ...(options.headers || {})
          }
        },
        (res) => {
          let body = '';
          res.on('data', (c) => (body += c));
          res.on('end', () => {
            resolve({
              url: target,
              statusCode: res.statusCode,
              headers: res.headers,
              durationMs: Date.now() - start,
              body
            });
          });
        }
      );
      req.on('error', (err) => resolve({ url: target, error: err.message, durationMs: Date.now() - start, body: '' }));
      req.setTimeout(10000, () => {
        req.destroy();
        resolve({ url: target, error: 'Connection timed out', durationMs: Date.now() - start, body: '' });
      });
    } catch (e) {
      resolve({ url: target, error: e.message, body: '' });
    }
  });
}

async function runAudit() {
  const parsedTarget = new URL(targetUrl);
  const baseUrl = `${parsedTarget.protocol}//${parsedTarget.host}`;

  // 1. Audit Main Page
  console.log('--- [1] Checking Main Webpage ---');
  const mainRes = await fetchUrl(targetUrl);
  if (mainRes.error) {
    console.error(`❌ Connection Error: ${mainRes.error}`);
    return;
  }
  console.log(`Status Code : HTTP ${mainRes.statusCode}`);
  console.log(`Response Time: ${mainRes.durationMs}ms`);

  const html = mainRes.body || '';

  // Title
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : 'MISSING';
  console.log(`Title Tag    : ${title} (${title.length} chars) ${title.length >= 30 && title.length <= 65 ? '✅ Optimal' : '⚠️ Warning'}`);

  // Meta Description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
                    html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
  const desc = descMatch ? descMatch[1].trim() : 'MISSING';
  console.log(`Meta Desc    : ${desc.slice(0, 80)}... (${desc.length} chars) ${desc.length >= 80 && desc.length <= 170 ? '✅ Optimal' : '⚠️ Warning'}`);

  // Canonical
  const canonMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
  console.log(`Canonical URL: ${canonMatch ? canonMatch[1] : '❌ MISSING'}`);

  // OG Image
  const ogImgMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);
  const ogImg = ogImgMatch ? ogImgMatch[1] : 'MISSING';
  const isOgAbsolute = ogImg.startsWith('http');
  console.log(`OG Image     : ${ogImg} ${isOgAbsolute ? '✅ Absolute URL' : '⚠️ Relative URL (Not recommended for crawlers)'}`);

  // Schema Markup (JSON-LD)
  const schemaMatches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  console.log(`JSON-LD Schema: ${schemaMatches.length > 0 ? `✅ Present (${schemaMatches.length} block(s))` : '❌ MISSING'}`);
  if (schemaMatches.length > 0) {
    try {
      const parsedSchema = JSON.parse(schemaMatches[0][1]);
      console.log(`  Schema Types: ${JSON.stringify(parsedSchema['@graph'] ? parsedSchema['@graph'].map(g => g['@type']) : parsedSchema['@type'])}`);
    } catch {
      console.log(`  ⚠️ Schema JSON parsing notice`);
    }
  }

  // 2. Robots.txt
  console.log('\n--- [2] Checking robots.txt ---');
  const robotsRes = await fetchUrl(`${baseUrl}/robots.txt`);
  const hasRobots = robotsRes.statusCode === 200 && !robotsRes.body.includes('This Page Does Not Exist') && !robotsRes.body.includes('<!DOCTYPE html');
  console.log(`robots.txt Status: ${robotsRes.statusCode} ${hasRobots ? '✅ Found' : '❌ Missing or 404'}`);
  if (hasRobots) {
    console.log(`robots.txt preview:\n${robotsRes.body.split('\n').slice(0, 10).join('\n')}`);
  }

  // 3. Sitemap.xml
  console.log('\n--- [3] Checking sitemap.xml ---');
  const sitemapRes = await fetchUrl(`${baseUrl}/sitemap.xml`);
  const hasSitemap = sitemapRes.statusCode === 200 && (sitemapRes.body.includes('<urlset') || sitemapRes.body.includes('<sitemapindex'));
  console.log(`sitemap.xml Status: ${sitemapRes.statusCode} ${hasSitemap ? '✅ Valid XML Sitemap' : '❌ Missing or 404'}`);

  // 4. llms.txt (Generative Engine Optimization)
  console.log('\n--- [4] Checking llms.txt (GEO / AI Context) ---');
  const llmsRes = await fetchUrl(`${baseUrl}/llms.txt`);
  const hasLlms = llmsRes.statusCode === 200 && !llmsRes.body.includes('This Page Does Not Exist') && !llmsRes.body.includes('<!DOCTYPE html');
  console.log(`llms.txt Status  : ${llmsRes.statusCode} ${hasLlms ? '✅ Present' : '❌ Missing or 404'}`);

  // 5. AI Bot Access Verification
  console.log('\n--- [5] Testing AI Bot Crawler Access ---');
  const bots = [
    { name: 'Googlebot', ua: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
    { name: 'Bingbot', ua: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)' },
    { name: 'PerplexityBot', ua: 'PerplexityBot/1.0 (+https://perplexity.ai/perplexitybot)' },
    { name: 'ChatGPT-User', ua: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ChatGPT-User/1.0; +https://openai.com/bot)' },
    { name: 'ClaudeBot', ua: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)' },
    { name: 'anthropic-ai', ua: 'anthropic-ai' },
    { name: 'GPTBot', ua: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)' }
  ];

  for (const bot of bots) {
    const res = await fetchUrl(targetUrl, { userAgent: bot.ua });
    const status = res.statusCode;
    const ok = status === 200 || status === 301 || status === 302;
    console.log(`  ${bot.name.padEnd(16)}: HTTP ${status} ${ok ? '✅ Allowed' : '⚠️ Warning/Rate limited'}`);
  }

  console.log(`\n============================================================`);
  console.log(`🏁 AUDIT COMPLETED`);
  console.log(`============================================================\n`);
}

runAudit();
