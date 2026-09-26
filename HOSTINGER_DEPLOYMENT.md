# Hostinger Deployment Guide: Zanzirangi House
## SEO & GEO Sitelinks-Ready Deployment

> **Target Domain:** [https://zanzirangihouse.com/](https://zanzirangihouse.com/)  
> **Deployment File:** `zanzirangi-house-deploy.zip`  
> **Document Root:** `public_html/`  

---

### 1. Overview of Deployment Package

The file `zanzirangi-house-deploy.zip` contains the complete, pre-rendered production build. Every canonical route (`/villas`, `/dining`, `/experiences`, `/safari`, `/about`, `/contact`, `/privacy`, `/terms`) has a physical directory with a pre-rendered `index.html` containing unique `<title>`, `<meta name="description">`, `<link rel="canonical">`, OpenGraph, Twitter, and Breadcrumbs structured data.

---

### 2. Step-by-Step Hostinger Upload Instructions

#### Step 1: Open Hostinger File Manager
1. Log in to your **Hostinger hPanel**.
2. Go to **Websites** > select `zanzirangihouse.com` > click **Manage**.
3. In the sidebar, select **Files** > **File Manager** (Access files of `zanzirangihouse.com`).

#### Step 2: Navigate to `public_html`
1. Double-click the `public_html` directory.
2. If previous build files exist in `public_html`, you may back them up or delete old assets/HTML files so that a clean slate is deployed.

#### Step 3: Upload `zanzirangi-house-deploy.zip`
1. Click the **Upload** icon (top right) > choose **File**.
2. Select `zanzirangi-house-deploy.zip` from your project folder:
   `D:\Farrel Folder\Programming\Project\Zanzirangi House\zanzirangi-house-v2\zanzirangi-house-deploy.zip`
3. Wait for the upload to reach 100%.

#### Step 4: Extract Directly into `public_html`
1. Right-click `zanzirangi-house-deploy.zip` > click **Extract**.
2. In the extraction destination folder path, enter:
   `.` (current directory) or `public_html`
   *(Do NOT extract into a subfolder like `public_html/dist/` or `public_html/zanzirangi-house-deploy/`)*.
3. Click **Extract**.

#### Step 5: Verify the Directory Structure
Ensure that inside `public_html/`, the files appear directly:
```text
public_html/
├── .htaccess
├── index.html
├── robots.txt
├── sitemap.xml
├── llms.txt
├── villas/
│   └── index.html
├── dining/
│   └── index.html
├── experiences/
│   └── index.html
├── safari/
│   └── index.html
├── about/
│   └── index.html
├── contact/
│   └── index.html
├── privacy/
│   └── index.html
├── terms/
│   └── index.html
└── assets/
    ├── index-[hash].js
    ├── index-[hash].css
    └── ...
```
4. Delete `zanzirangi-house-deploy.zip` from `public_html` once extraction is verified.

---

### 3. Post-Deployment Verification & Smoke Test

Open your web browser and test each of the following URLs:

| Test Item | Target URL | Expected Status |
| :--- | :--- | :--- |
| **Homepage** | `https://zanzirangihouse.com/` | `HTTP 200` |
| **Robots.txt** | `https://zanzirangihouse.com/robots.txt` | `HTTP 200` (Allows bots & specifies sitemap) |
| **Sitemap** | `https://zanzirangihouse.com/sitemap.xml` | `HTTP 200` (Valid XML containing 9 canonical routes) |
| **LLMs Factsheet** | `https://zanzirangihouse.com/llms.txt` | `HTTP 200` (Plaintext fact file for AI engines) |
| **Private Villas** | `https://zanzirangihouse.com/villas` | `HTTP 200` (Unique title & villa inventory) |
| **Dining** | `https://zanzirangihouse.com/dining` | `HTTP 200` (Oceanfront menus & dining experiences) |
| **Experiences** | `https://zanzirangihouse.com/experiences` | `HTTP 200` (Menai Bay dolphin tours & island trips) |
| **Safari** | `https://zanzirangihouse.com/safari` | `HTTP 200` (Fly-in Serengeti & Ngorongoro safaris) |
| **About Sanctuary** | `https://zanzirangihouse.com/about` | `HTTP 200` (Heritage, architecture & location) |
| **Contact** | `https://zanzirangihouse.com/contact` | `HTTP 200` (Concierge phone, WhatsApp, map) |
| **Privacy Policy** | `https://zanzirangihouse.com/privacy` | `HTTP 200` (Guest data privacy policy) |
| **Terms** | `https://zanzirangihouse.com/terms` | `HTTP 200` (Reservation terms and conditions) |

---

### 4. Google Search Console & Sitelinks Submission

1. Log in to [Google Search Console](https://search.google.com/search-console).
2. Go to **Sitemaps** > Submit `sitemap.xml`.
3. Use the **URL Inspection** tool on `https://zanzirangihouse.com/` and click **Request Indexing**.
4. Test structured data in [Google Rich Results Test](https://search.google.com/test/rich-results) for `https://zanzirangihouse.com/` and `https://zanzirangihouse.com/villas`. All previous warnings are resolved.
