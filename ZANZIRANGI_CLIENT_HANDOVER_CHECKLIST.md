# Zanzirangi Client Handover Checklist

| | |
|---|---|
| Audit date | 2026-10-01 |
| Revision | `main` @ `2379f82` + uncommitted working tree |
| Purpose | Track what must be completed, verified and transferred before the Zanzirangi House website is handed over to the client |
| Companion | `ZANZIRANGI_PROJECT_BRIEF.md` |

Status legend: ✅ Ready · 🟠 Partial · ❌ Not ready / not found · ❔ Not verified (requires external verification)

> Items marked **[Contract]** depend on the commercial agreement and must be confirmed; nothing in the repository establishes ownership or obligations.

---

## 1. Summary

| Area | Status |
|---|---|
| Source code | 🟠 |
| Domain | ❔ |
| Hosting | ❔ |
| Admin credentials | ❔ |
| Documentation | 🟠 |
| Database | 🟠 |
| Backup | ❌ |
| Deployment | 🟠 |
| Maintenance | ❌ |
| Support | ❌ |
| Analytics | ❌ |
| Third-party accounts | ❔ |

**Handover readiness: NOT READY.**

---

## 2. Detailed Checklist

### 2.1 Source code
| Item | Status | Notes / evidence |
|---|---|---|
| Repository exists with full history | ✅ | Git, branch `main` |
| All production code committed | ❌ | 90 modified + 38 untracked paths (migration 003, 9 admin modules, new repositories, `server/runtime.ts`) |
| Release tagged (e.g. `v1.0.0`) | ❌ | No git tags |
| Version number consistent | ❌ | `package.json` 1.0.0 vs "v2.0" commits vs `-v3` folder |
| Build reproducible from clean checkout | 🟠 | `vite build` passes; `tsc` fails in `scripts/` |
| Build artefacts removed from VCS | ❌ | `server.js` committed |
| Unused dependencies removed | ❌ | `@google/genai` unused |
| Repository visibility & access list confirmed | ❔ | Private/public unknown |
| Code ownership / licence to client | ❔ | **[Contract]** — no LICENSE file |

### 2.2 Domain
| Item | Status | Notes |
|---|---|---|
| Domain `zanzirangihouse.com` registrant = client | ❔ | **[Contract]** |
| Registrar login transferred / shared | ❔ | |
| DNS records documented (A/AAAA, CNAME, MX, TXT/SPF/DMARC) | ❌ | Not in repo |
| Auto-renew & expiry date recorded | ❔ | |
| Domain naming consistent | ✅ | Consistent `zanzirangihouse.com` |

### 2.3 Hosting
| Item | Status | Notes |
|---|---|---|
| Hostinger account holder identified | ❔ | **[Contract]** |
| Plan, renewal date, billing owner recorded | ❔ | |
| Node.js app config documented (startup `server.js`, Node version, env var **names**) | 🟠 | `.env.example`; docs inconsistent |
| SSL certificate active & auto-renewing | ❔ | |
| Media storage path confirmed outside deploy folder | ❔ | Expected `<domain>/zanzirangi-media` |
| Legacy hosts (GitHub Pages, Vercel) decommissioned | ❌ | Workflow still deploys on push |

### 2.4 Admin credentials
| Item | Status | Notes |
|---|---|---|
| Client superadmin account created in production | ❔ | No documented provisioning procedure for MySQL (`scripts/create_admin.js` writes JSON DB only) |
| Developer/test admin accounts disabled or removed | ❔ | JSON seed historically created 5 initial admins |
| Credentials delivered via secure channel (password manager) | ❔ | |
| Client instructed to change password on first login | ❌ | No forced-change feature |
| MFA on hPanel, registrar, GitHub, Google accounts | ❔ | |

### 2.5 Documentation
| Item | Status | Notes |
|---|---|---|
| Project brief / architecture / readiness / security | ✅ | This audit set (`ZANZIRANGI_*.md`) |
| README current | ❌ | Describes obsolete static SPA + Gemini key |
| Admin user guide (how to edit content, upload media, manage chat) | ❌ | Not found |
| Operations runbook (deploy, rollback, restore, rotate secrets) | 🟠 | Fragments across `docs/`, inconsistent |
| Docs redacted of infrastructure identifiers | ❌ | See Security Checklist S-01 |
| Consolidated / archived historical audit docs | ❌ | 40+ overlapping files |

### 2.6 Database
| Item | Status | Notes |
|---|---|---|
| Schema documented | ✅ | `server/database/migrations/*.sql`; Architecture doc §4 |
| All migrations committed and applied in production | ❔ | 003 uncommitted; applied state unknown |
| DB engine (MySQL vs MariaDB) confirmed | ❔ | Affects migration 003 |
| DB credentials rotated after development | ❌ | Recommended (identifiers exposed in docs) |
| Remote MySQL access disabled/restricted | ❔ | |
| Test/forensic data removed from production | ❔ | Test scripts write `CMS_TEST`/forensic rows |

### 2.7 Backup
| Item | Status | Notes |
|---|---|---|
| Automated daily DB backup | ❌ | Not found |
| Media folder backup | ❌ | Not found |
| Off-site copy | ❌ | |
| Restore procedure documented & tested | ❌ | `scripts/restore-exact-baseline.ts` is a destructive dev tool, not a DR procedure |
| Responsibility for backups assigned | ❔ | **[Contract]** |

### 2.8 Deployment
| Item | Status | Notes |
|---|---|---|
| Build + package scripts | ✅ | `npm run build`, `npm run package:hostinger` |
| Verified production deployment with smoke test | ❌ | Not evidenced |
| Rollback procedure matching actual workflow | ❌ | `docs/ROLLBACK.md` assumes git-push deploy |
| Staging environment | ❌ | Not detected |

### 2.9 Maintenance
| Item | Status | Notes |
|---|---|---|
| Maintenance plan (updates, dependency audits) | ❌ | **[Contract]** |
| Monitoring & alerts configured | ❌ | Only `/api/health` exists |
| Error tracking | ❌ | |
| Log access for client | ❔ | Hostinger panel |

### 2.10 Support
| Item | Status | Notes |
|---|---|---|
| Support agreement / SLA | ❌ | **[Contract]** |
| Escalation contacts | ❌ | |
| Chat hand-off notification to staff | ❌ | Staff must watch the inbox manually |

### 2.11 Analytics
| Item | Status | Notes |
|---|---|---|
| Web analytics installed | ❌ | Not found |
| Google Search Console / Bing verified, sitemap submitted | ❔ | No verification tags in `index.html` |
| Google Business Profile linked | ❔ | Maps share link exists |
| Cookie/consent banner (if analytics added) | ❌ | |

### 2.12 Third-party accounts
| Account | Used for | Owner | Status |
|---|---|---|---|
| Hostinger | Hosting, MySQL, storage | ❔ | ❔ |
| Domain registrar | `zanzirangihouse.com` | ❔ | ❔ |
| GitHub | Source, Actions, Pages | Repo author `FarrelBerwyn` | ❔ transfer **[Contract]** |
| Google (Maps listing / Business Profile) | Map link | ❔ | ❔ |
| WhatsApp Business number | Guest contact | ❔ | ❔ — phone in code is a placeholder |
| Vercel | Legacy static deploy | ❔ | ❔ |
| Unsplash | Stock images in fallback content | n/a (licence terms) | ❔ confirm image rights |

### 2.13 Content & legal
| Item | Status | Notes |
|---|---|---|
| Property address & coordinates confirmed | ❌ | Bwejuu (map) vs Kizimkazi (JSON-LD/llms.txt) |
| Phone/WhatsApp confirmed | ❌ | Placeholder `+255 777 890 123` in `index.html`, `public/llms.txt`, fallbacks |
| Ratings / reviews / prices in structured data substantiated | ❌ | `AggregateRating` 4.9/142, OTA scores unverified |
| Privacy policy reflects actual data processing (chat logs, IPs in audit log, localStorage) | ❔ | `src/pages/PrivacyPage.tsx` — content not legally reviewed |
| Terms reviewed | ❔ | `src/pages/TermsPage.tsx` |
| Photo/video rights | ❔ | **[Contract]** |

---

## 3. Handover Pack (to deliver once items above are complete)

1. Tagged source release + changelog.
2. Redacted documentation set (this audit, runbook, admin guide).
3. Credential register (stored in client's password manager — never in documents).
4. Account ownership register (Section 2.12 completed).
5. Backup schedule + last successful restore test record.
6. Production verification record (Production Readiness §4 completed).
7. Signed acceptance and support/maintenance agreement **[Contract]**.
