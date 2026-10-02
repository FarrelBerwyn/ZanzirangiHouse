import React, { useEffect, useState } from 'react';
import {
  Globe,
  CheckCircle2,
  Clock,
  ArrowRight,
  Home,
  BedDouble,
  Image as ImageIcon,
  Video,
  Sparkles,
  MessageSquareQuote,
  Phone,
  Search,
  FolderOpen,
  Settings,
  RefreshCw,
  ExternalLink,
  FileText,
  Car,
  UtensilsCrossed,
  Compass,
  Binoculars,
  Users,
  Shield,
  Layers,
  Database,
  MessageSquare,
  Languages,
  AlertTriangle,
} from 'lucide-react';
import { contentApi, DashboardStats } from '../../services/contentApi';
import { authApi, AdminUser } from '../../services/authApi';

interface AdminDashboardHomeProps {
  onNavigateToTab: (tab: string) => void;
}

/**
 * Permission required to open each admin tab — mirrors the server route guards.
 * An array means any one of the listed permissions grants access.
 * 'superadmin' marks tabs that are restricted by role (not grantable as a permission).
 */
const TAB_PERMISSIONS: Record<string, string | string[]> = {
  dashboard: 'dashboard',
  support: 'support',
  homepage: 'homepage',
  pages: 'pages',
  whystay: ['homepage', 'pages'],
  global: 'settings',
  translations: 'pages',
  rooms: 'villas',
  dining: 'dining',
  experiences: 'experiences',
  safari: 'safari',
  transfers: 'transfers',
  facilities: 'facilities',
  gallery: 'gallery',
  videos: 'videos',
  testimonials: 'testimonials',
  media: 'media',
  contact: 'contact',
  seo: 'seo',
  settings: 'settings',
  'admin-access': 'superadmin',
};

/** Formats a count from the API; shows a dash while it is unknown instead of a made-up number. */
const fmtCount = (value: number | undefined | null) => (typeof value === 'number' ? String(value) : '—');

export const AdminDashboardHome: React.FC<AdminDashboardHomeProps> = ({ onNavigateToTab }) => {
  const currentUser = authApi.getUser() as (AdminUser & { permissions?: unknown }) | null;
  const isSuperadmin = currentUser?.role === 'superadmin';
  const userPerms: string[] = Array.isArray(currentUser?.permissions) ? (currentUser!.permissions as string[]) : [];

  const canOpen = (tabKey: string) => {
    if (isSuperadmin) return true;
    const required = TAB_PERMISSIONS[tabKey];
    if (!required) return false;
    if (required === 'superadmin') return false;
    const list = Array.isArray(required) ? required : [required];
    return list.some((perm) => userPerms.includes(perm));
  };

  const canViewStats = canOpen('dashboard');

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(canViewStats);
  const [statsError, setStatsError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!canViewStats) return;
    try {
      setIsLoading(true);
      setStatsError(null);
      const data = await contentApi.getDashboardStats();
      setStats(data);
    } catch (e: any) {
      console.error('Error fetching dashboard stats', e);
      setStatsError(e?.message || 'Could not load dashboard metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 4 Featured Priority Workflows (Primary Actions)
  const allPriorityWorkflows = [
    {
      key: 'pages',
      title: 'All Pages CMS',
      category: 'CONTENT & STRUCTURE',
      desc: 'Top-to-bottom section-based editing for all 8 website pages.',
      stat: '8 Public Pages',
      icon: FileText,
      accent: 'border-adm-accent/30 hover:border-adm-accent',
    },
    {
      key: 'rooms',
      title: 'Villas & Suites',
      category: 'HOSPITALITY INVENTORY',
      desc: 'Manage room specifications, pricing, amenities, and pool suite photo galleries.',
      stat: `${fmtCount(stats?.counts?.villasPublished)} Published Villas`,
      icon: BedDouble,
      accent: 'border-adm-accent/30 hover:border-adm-accent',
    },
    {
      key: 'contact',
      title: 'Contact & Concierge',
      category: 'COMMUNICATION CHANNELS',
      desc: 'Update direct reservation phone, WhatsApp hotline, email, and social coordinates.',
      stat: 'Phone, Email & WhatsApp',
      icon: Phone,
      accent: 'border-adm-accent/30 hover:border-adm-accent',
    },
    {
      key: 'admin-access',
      title: 'Admin Access Control',
      category: 'SECURITY & GOVERNANCE',
      desc: 'Manage authorized team members, roles, password resets, and granular permissions.',
      stat: 'Max 6 Admins (RBAC)',
      icon: Users,
      accent: 'border-adm-accent/30 hover:border-adm-accent',
    },
  ];
  const priorityWorkflows = allPriorityWorkflows.filter((item) => canOpen(item.key));

  // Grouped Sanctuary Directory (Clean & Categorized)
  const allDirectoryGroups = [
    {
      title: 'Pages & Narrative',
      description: 'Public page layout and story sections',
      icon: Layers,
      items: [
        { key: 'homepage', label: 'Homepage & Carousel', detail: 'Hero slides, narrative & section order', icon: Home },
        { key: 'pages', label: 'All Pages CMS', detail: 'Full section-based editor (8 pages)', icon: FileText },
        { key: 'whystay', label: 'Why Stay / Sanctuary Difference', detail: '4 core pillars & philosophy quotes', icon: Sparkles },
        { key: 'global', label: 'Global Navigation & Footer', detail: 'Site-wide header, footer & legal', icon: Globe },
        { key: 'translations', label: 'Translations', detail: 'Per-language overrides for CMS content', icon: Languages },
      ],
    },
    {
      title: 'Hospitality Collections',
      description: 'Guest services, dining and adventures',
      icon: Compass,
      items: [
        { key: 'support', label: 'Guest Messages', detail: 'Live chat inbox & AI-assisted replies', icon: MessageSquare },
        { key: 'rooms', label: 'Villas & Suites', detail: '8 plunge pool suites & pricing', icon: BedDouble },
        { key: 'transfers', label: 'VIP Chauffeur & Transfers', detail: 'Airport arrival greeting & luxury fleet', icon: Car },
        { key: 'dining', label: 'Taste Zanzibar Dining', detail: 'Culinary menus & private dining', icon: UtensilsCrossed },
        { key: 'experiences', label: 'Curated Experiences', detail: 'Dolphin safaris & island tours', icon: Compass },
        { key: 'safari', label: 'Beyond Zanzibar Safari', detail: 'Serengeti & fly-in wildlife expeditions', icon: Binoculars },
      ],
    },
    {
      title: 'Media, Relations & System',
      description: 'Visual assets, social proof and settings',
      icon: Shield,
      items: [
        { key: 'gallery', label: 'Photo Gallery', detail: stats ? `${fmtCount(stats.counts?.galleryItems)} photos in the gallery` : 'Gallery photos & categories', icon: ImageIcon },
        { key: 'videos', label: 'Videos & Reel', detail: '4K brand video & storyboards', icon: Video },
        { key: 'facilities', label: 'Facilities & Spa', detail: stats ? `${fmtCount(stats.counts?.facilities)} facilities listed` : 'Botanical spa & pavilion specs', icon: Sparkles },
        { key: 'testimonials', label: 'Guest Reviews', detail: stats ? `${fmtCount(stats.counts?.testimonials)} guest testimonials` : 'Guest testimonials', icon: MessageSquareQuote },
        { key: 'contact', label: 'Contact & WhatsApp', detail: 'Direct WhatsApp & phone hotline', icon: Phone },
        { key: 'seo', label: 'SEO & Meta Tags', detail: 'Search indexing, titles & OpenGraph', icon: Search },
        { key: 'media', label: 'Media Library', detail: stats ? `${fmtCount(stats.counts?.mediaAssets)} stored media assets` : 'Central asset management & storage', icon: FolderOpen },
        { key: 'admin-access', label: 'Admin Access Management', detail: 'User management & permissions', icon: Users },
        { key: 'settings', label: 'System Settings', detail: 'Brand config & email alerts', icon: Settings },
      ],
    },
  ];
  const directoryGroups = allDirectoryGroups
    .map((group) => ({ ...group, items: group.items.filter((item) => canOpen(item.key)) }))
    .filter((group) => group.items.length > 0);
  const visibleModuleCount = directoryGroups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* ---------------- 1. EXECUTIVE HEADER ---------------- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-adm-line pb-6">
        <div>
          <span className="text-[11px] font-mono tracking-[0.25em] uppercase text-adm-accent block mb-1.5 font-medium">
            SANCTUARY OVERVIEW & CONTROL
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-adm-text font-light tracking-wide">
            CMS Control Dashboard
          </h2>
          <p className="text-sm text-adm-muted mt-1.5 flex items-center space-x-2">
            <span>Directly connected to Production Cloud MySQL</span>
            <span>•</span>
            <span className="text-emerald-400 font-mono text-xs inline-flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-time Live Sync</span>
            </span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {canViewStats && (
            <button
              onClick={fetchStats}
              disabled={isLoading}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-adm-surface border border-adm-line hover:border-adm-accent/50 text-xs font-mono text-adm-text-2 hover:text-adm-text transition-all cursor-pointer disabled:opacity-50"
              title="Refresh dashboard metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-adm-accent ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Updating...' : 'Refresh Metrics'}</span>
            </button>
          )}

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-adm-accent-fill hover:bg-adm-accent-hover text-adm-on-accent text-xs font-medium font-sans tracking-wide transition-all shadow-sm"
          >
            <span>View Public Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {statsError && (
        <div className="flex items-start space-x-2.5 p-3.5 rounded-xl bg-red-950/30 border border-red-800/40 text-xs text-red-300">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Dashboard metrics could not be loaded: {statsError}</span>
        </div>
      )}

      {/* ---------------- 2. TOP METRIC CARDS (CLEAN & BALANCED) ---------------- */}
      {canViewStats && (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Database Cloud Status */}
        <div className="bg-adm-surface border border-adm-line rounded-xl p-4.5 flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-950/40 border border-emerald-700/40 flex items-center justify-center text-emerald-400 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-wider text-adm-muted block truncate">
              Database Engine
            </span>
            <span className="text-base text-adm-text block font-semibold mt-0.5">
              Cloud MySQL
            </span>
            <span
              className={`text-[10px] font-mono block truncate ${
                stats ? 'text-emerald-400' : statsError ? 'text-red-300' : 'text-adm-muted'
              }`}
            >
              {stats ? `Connected${stats.status ? ` (${stats.status})` : ''}` : statsError ? 'Not reachable' : 'Checking...'}
            </span>
          </div>
        </div>

        {/* KPI 2: Published Villas */}
        <div className="bg-adm-surface border border-adm-line rounded-xl p-4.5 flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-adm-accent/10 border border-adm-accent/25 flex items-center justify-center text-adm-accent shrink-0">
            <BedDouble className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-wider text-adm-muted block truncate">
              Villa Suites
            </span>
            <span className="text-base text-adm-text block font-semibold mt-0.5">
              {fmtCount(stats?.counts?.villasPublished)} Published Villas
            </span>
            <span className="text-[10px] font-mono text-adm-accent block truncate">
              {fmtCount(stats?.counts?.villasTotal)} villas in total
            </span>
          </div>
        </div>

        {/* KPI 3: Public CMS Pages */}
        <div className="bg-adm-surface border border-adm-line rounded-xl p-4.5 flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-adm-accent/10 border border-adm-accent/25 flex items-center justify-center text-adm-accent shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-wider text-adm-muted block truncate">
              Public Pages
            </span>
            <span className="text-base text-adm-text block font-semibold mt-0.5">
              8 CMS Pages
            </span>
            <span className="text-[10px] font-mono text-adm-accent block truncate">
              Fully Editable Sections
            </span>
          </div>
        </div>

        {/* KPI 4: Visual & Social Proof Assets */}
        <div className="bg-adm-surface border border-adm-line rounded-xl p-4.5 flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-adm-accent/10 border border-adm-accent/25 flex items-center justify-center text-adm-accent shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-wider text-adm-muted block truncate">
              Media & Reviews
            </span>
            <span className="text-base text-adm-text block font-semibold mt-0.5">
              {fmtCount(stats?.counts?.galleryItems)} Photos • {fmtCount(stats?.counts?.testimonials)} Reviews
            </span>
            <span className="text-[10px] font-mono text-adm-muted block truncate">
              {stats?.lastPublished ? `Updated ${new Date(stats.lastPublished).toLocaleDateString()}` : 'No publish recorded yet'}
            </span>
          </div>
        </div>
      </div>
      )}

      {/* ---------------- 3. PRIMARY QUICK ACTIONS (FEATURED WORKFLOWS) ---------------- */}
      {priorityWorkflows.length > 0 && (
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h3 className="font-serif text-xl text-adm-text font-light">
              Primary Management Hub
            </h3>
            <p className="text-xs text-adm-muted">
              Direct access to the most frequently updated sanctuary operations.
            </p>
          </div>
          <span className="hidden sm:inline-block text-[11px] font-mono text-adm-accent">
            Quick Shortcuts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {priorityWorkflows.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => onNavigateToTab(item.key)}
                className={`p-5 rounded-xl bg-adm-surface border ${item.accent} text-left transition-all group cursor-pointer relative overflow-hidden flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-adm-accent font-medium">
                      {item.category}
                    </span>
                    <span className="text-[11px] font-mono text-adm-text-2 bg-adm-raised px-2 py-0.5 rounded">
                      {item.stat}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-adm-raised flex items-center justify-center text-adm-accent group-hover:bg-adm-accent-hover group-hover:text-adm-on-accent transition-colors shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="font-serif text-lg text-adm-text font-normal group-hover:text-adm-accent transition-colors">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-xs text-adm-muted leading-relaxed line-clamp-2">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-adm-raised flex items-center justify-between text-xs font-mono text-adm-accent group-hover:text-adm-text transition-colors">
                  <span>Open Section Manager</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
      )}

      {/* ---------------- 4. ORGANIZED COMPLETE DIRECTORY (3 BALANCED COLUMNS) ---------------- */}
      <div className="bg-adm-surface border border-adm-line rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 border-b border-adm-line pb-4">
          <div>
            <h3 className="font-serif text-xl text-adm-text font-light">
              Sanctuary CMS Modules Directory
            </h3>
            <p className="text-xs text-adm-muted">
              Categorized overview of all editable website areas and system configurations.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-full self-start sm:self-auto">
            ● {visibleModuleCount} {visibleModuleCount === 1 ? 'module' : 'modules'} available to you
          </span>
        </div>

        {directoryGroups.length === 0 && (
          <p className="text-xs font-mono text-adm-muted py-4 text-center">
            Your account has no content permissions yet. Ask a superadmin to grant access.
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {directoryGroups.map((group, gIdx) => {
            const GroupIcon = group.icon;
            return (
              <div
                key={gIdx}
                className="bg-adm-panel border border-adm-raised rounded-xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2.5 mb-1 text-adm-accent">
                    <GroupIcon className="w-4 h-4" />
                    <h4 className="font-serif text-base text-adm-text font-medium">
                      {group.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-adm-muted mb-4">
                    {group.description}
                  </p>

                  <div className="space-y-1.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.key}
                          onClick={() => onNavigateToTab(item.key)}
                          id={`dir-nav-${item.key}`}
                          className="w-full p-2.5 rounded-lg bg-adm-surface hover:bg-adm-raised border border-transparent hover:border-adm-accent/40 text-left transition-all group cursor-pointer flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                            <Icon className="w-3.5 h-3.5 text-adm-accent group-hover:text-adm-text shrink-0 transition-colors" />
                            <div className="min-w-0">
                              <span className="text-xs font-medium text-adm-text block truncate group-hover:text-adm-accent transition-colors">
                                {item.label}
                              </span>
                              <span className="text-[10px] text-adm-muted block truncate">
                                {item.detail}
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="w-3 h-3 text-adm-faint group-hover:text-adm-text transition-colors shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ---------------- 5. AUDIT TRAIL & RECENT UPDATES ---------------- */}
      {canViewStats && (
      <div className="bg-adm-surface border border-adm-line rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif text-xl text-adm-text font-light">
              Audit Trail & Activity Log
            </h3>
            <p className="text-xs text-adm-muted">
              Real-time chronological record of administrative actions and published changes.
            </p>
          </div>
          <button
            onClick={fetchStats}
            title="Refresh logs"
            className="p-1.5 rounded-lg bg-adm-raised text-adm-muted hover:text-adm-text cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {stats?.recentUpdates && stats.recentUpdates.length > 0 ? (
            stats.recentUpdates.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-adm-bg border border-adm-raised text-xs font-mono"
              >
                <div className="flex items-center space-x-3 truncate mr-2">
                  <span className="w-2 h-2 rounded-full bg-adm-accent-fill shrink-0" />
                  <span className="font-bold text-adm-text uppercase shrink-0">
                    {item.action}
                  </span>
                  <span className="text-adm-muted truncate">{item.details || '—'}</span>
                </div>
                <div className="text-right text-[11px] text-adm-muted shrink-0 flex flex-col sm:flex-row sm:items-center sm:space-x-3">
                  <span className="text-adm-accent">{item.userEmail}</span>
                  <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs font-mono text-adm-muted py-4 text-center">
              No recent changes recorded.
            </p>
          )}
        </div>
      </div>
      )}
    </div>
  );
};
