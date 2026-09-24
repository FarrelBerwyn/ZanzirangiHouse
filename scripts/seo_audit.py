#!/usr/bin/env python3
"""
SEO & GEO (Generative Engine Optimization) Audit Script
Usage: python3 scripts/seo_audit.py "https://zanzirangihouse.com"
"""

import sys
import time
import urllib.request
import urllib.parse
import re
import json

target_url = sys.argv[1] if len(sys.argv) > 1 else "https://zanzirangihouse.com/"

print("\n" + "=" * 60)
print(f"🔍 RUNNING SEO & GEO AUDIT FOR: {target_url}")
print("=" * 60 + "\n")

def fetch(url, user_agent="Mozilla/5.0 (compatible; SEOGEOAuditor/2.0)"):
    headers = {"User-Agent": user_agent}
    req = urllib.request.Request(url, headers=headers)
    start = time.time()
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            body = response.read().decode("utf-8", errors="ignore")
            elapsed = int((time.time() - start) * 1000)
            return {"status": response.status, "duration": elapsed, "body": body, "error": None}
    except Exception as e:
        elapsed = int((time.time() - start) * 1000)
        status = getattr(e, "code", 500) if hasattr(e, "code") else 0
        return {"status": status, "duration": elapsed, "body": "", "error": str(e)}

parsed = urllib.parse.urlparse(target_url)
base_url = f"{parsed.scheme}://{parsed.netloc}"

# 1. Main Page
print("--- [1] Checking Main Webpage ---")
res = fetch(target_url)
print(f"Status Code  : HTTP {res['status']}")
print(f"Response Time: {res['duration']}ms")

html = res["body"]

title_match = re.search(r"<title>([^<]+)</title>", html, re.I)
title = title_match.group(1).strip() if title_match else "MISSING"
print(f"Title Tag    : {title} ({len(title)} chars) {'✅ Optimal' if 30 <= len(title) <= 65 else '⚠️ Warning'}")

desc_match = re.search(r'<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']*)["\']', html, re.I)
desc = desc_match.group(1).strip() if desc_match else "MISSING"
print(f"Meta Desc    : {desc[:80]}... ({len(desc)} chars) {'✅ Optimal' if 80 <= len(desc) <= 170 else '⚠️ Warning'}")

canon_match = re.search(r'<link[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']*)["\']', html, re.I)
print(f"Canonical URL: {canon_match.group(1) if canon_match else '❌ MISSING'}")

# 2. robots.txt
print("\n--- [2] Checking robots.txt ---")
robots = fetch(f"{base_url}/robots.txt")
has_robots = robots["status"] == 200 and "This Page Does Not Exist" not in robots["body"]
print(f"robots.txt Status: HTTP {robots['status']} {'✅ Found' if has_robots else '❌ Missing or 404'}")

# 3. sitemap.xml
print("\n--- [3] Checking sitemap.xml ---")
sitemap = fetch(f"{base_url}/sitemap.xml")
has_sitemap = sitemap["status"] == 200 and "<urlset" in sitemap["body"]
print(f"sitemap.xml Status: HTTP {sitemap['status']} {'✅ Valid XML Sitemap' if has_sitemap else '❌ Missing or 404'}")

# 4. AI Bots Verification
print("\n--- [4] Testing AI Bot Crawler Access ---")
bots = [
    ("Googlebot", "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"),
    ("Bingbot", "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)"),
    ("PerplexityBot", "PerplexityBot/1.0 (+https://perplexity.ai/perplexitybot)"),
    ("ChatGPT-User", "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ChatGPT-User/1.0; +https://openai.com/bot)"),
    ("ClaudeBot", "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)"),
    ("anthropic-ai", "anthropic-ai"),
    ("GPTBot", "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)")
]

for name, ua in bots:
    r = fetch(target_url, user_agent=ua)
    ok = r["status"] in (200, 301, 302)
    print(f"  {name:<16}: HTTP {r['status']} {'✅ Allowed' if ok else '⚠️ Warning'}")

print("\n" + "=" * 60)
print("🏁 AUDIT COMPLETED")
print("=" * 60 + "\n")
