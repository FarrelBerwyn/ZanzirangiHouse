import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
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
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  MessageSquare,
  FileText,
  Car,
  UtensilsCrossed,
  Compass,
  Binoculars,
  Globe,
  Users,
  ChevronDown,
  ChevronUp,
  Layers,
  Sun,
  Moon,
  Languages,
  Bell,
} from 'lucide-react';
import { AdminUser } from '../services/authApi';
import { useAdminTheme } from './useAdminTheme';
import zanzirangiLogo from '../assets/zanzirangi-logo-new.jpeg';

interface AdminLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
  user: AdminUser | null;
  children: React.ReactNode;
  hasUnsavedChanges?: boolean;
}

/** A single permission key, or a list of keys where any one of them grants access. */
type NavPermission = string | string[];

interface SubNavItem {
  key: string;
  label: string;
  icon: any;
  permission?: NavPermission;
  superadminOnly?: boolean;
}

interface NavGroup {
  id: string;
  label: string;
  icon: any;
  directKey?: string; // if standalone clickable tab
  permission?: NavPermission;
  superadminOnly?: boolean;
  subItems?: SubNavItem[];
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  onLogout,
  user,
  children,
  hasUnsavedChanges = false,
}) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useAdminTheme();

  const isSuperadmin = user?.role === 'superadmin';
  const userPerms: string[] = Array.isArray((user as any)?.permissions) ? (user as any).permissions : [];

  // Mirrors the server route guards: superadmin sees everything; otherwise the user needs
  // the item's permission (or, for an array, at least one of the listed permissions).
  const hasAccess = (item: { permission?: NavPermission; superadminOnly?: boolean }) => {
    if (isSuperadmin) return true;
    if (item.superadminOnly) return false;
    if (!item.permission) return true;
    const required = Array.isArray(item.permission) ? item.permission : [item.permission];
    return required.some((perm) => userPerms.includes(perm));
  };

  // Close account menu when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    if (accountMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [accountMenuOpen]);

  // Main Navigation Groups (Reorganized for layperson admins with clear terminology)
  const navGroups: NavGroup[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      directKey: 'dashboard',
      permission: 'dashboard',
    },
    {
      id: 'support',
      label: 'Guest Messages',
      icon: MessageSquare,
      directKey: 'support',
      permission: 'support',
    },
    {
      id: 'pages-group',
      label: 'Website Pages',
      icon: Layers,
      subItems: [
        { key: 'homepage', label: 'Homepage', icon: Home, permission: 'homepage' },
        { key: 'whystay', label: 'Why Stay (4 Pillars)', icon: Sparkles, permission: ['homepage', 'pages'] },
        { key: 'pages', label: 'Info & Legal Pages', icon: FileText, permission: 'pages' },
        { key: 'global', label: 'Navigation & Footer', icon: Globe, permission: 'settings' },
        { key: 'translations', label: 'Translations', icon: Languages, permission: 'pages' },
      ],
    },
    {
      id: 'hospitality-group',
      label: 'Stays & Experiences',
      icon: BedDouble,
      subItems: [
        { key: 'rooms', label: 'Rooms & Villas', icon: BedDouble, permission: 'villas' },
        { key: 'dining', label: 'Dining & Menus', icon: UtensilsCrossed, permission: 'dining' },
        { key: 'experiences', label: 'Experiences', icon: Compass, permission: 'experiences' },
        { key: 'safari', label: 'Safari Packages', icon: Binoculars, permission: 'safari' },
        { key: 'transfers', label: 'Airport Transfers', icon: Car, permission: 'transfers' },
        { key: 'facilities', label: 'Facilities & Spa', icon: Sparkles, permission: 'facilities' },
      ],
    },
    {
      id: 'media-group',
      label: 'Gallery & Reviews',
      icon: ImageIcon,
      subItems: [
        { key: 'gallery', label: 'Photo Gallery', icon: ImageIcon, permission: 'gallery' },
        { key: 'videos', label: 'Video Reel 4K', icon: Video, permission: 'videos' },
        { key: 'testimonials', label: 'Guest Reviews', icon: MessageSquareQuote, permission: 'testimonials' },
        { key: 'media', label: 'Media Library', icon: FolderOpen, permission: 'media' },
      ],
    },
    {
      id: 'channels-group',
      label: 'Contact & Marketing',
      icon: Phone,
      subItems: [
        { key: 'contact', label: 'Contact & WhatsApp', icon: Phone, permission: 'contact' },
        { key: 'seo', label: 'SEO Settings', icon: Search, permission: 'seo' },
      ],
    },
  ];

  // Collapsible state for each group
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navGroups.forEach((group) => {
      if (group.subItems) {
        // Expand the group that contains currentTab by default
        const containsActive = group.subItems.some((sub) => sub.key === currentTab);
        initial[group.id] = containsActive;
      }
    });
    return initial;
  });

  // Whenever currentTab changes, auto-expand the parent group so user sees where they are
  useEffect(() => {
    navGroups.forEach((group) => {
      if (group.subItems && group.subItems.some((sub) => sub.key === currentTab)) {
        setExpandedGroups((prev) => ({
          ...prev,
          [group.id]: true,
        }));
      }
    });
  }, [currentTab]);

  // Deployed release (from package.json via /api/health) so staff and TKS can see which version is live.
  const [systemRelease, setSystemRelease] = useState<{ version: string; releaseDate: string | null } | null>(null);
  useEffect(() => {
    fetch('/api/health', { cache: 'no-store' })
      .then((r) => r.json())
      .then((h) => {
        if (typeof h?.version === 'string') setSystemRelease({ version: h.version, releaseDate: h.releaseDate ?? null });
      })
      .catch(() => undefined);
  }, []);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleNavClick = (tabKey: string) => {
    if (hasUnsavedChanges && currentTab !== tabKey) {
      const confirmLeave = window.confirm(
        'You have unsaved changes in the editor. Are you sure you want to navigate away without saving?'
      );
      if (!confirmLeave) return;
    }
    onSelectTab(tabKey);
    setMobileDrawerOpen(false);
  };

  const renderNavList = () => {
    return (
      <div className="space-y-1.5">
        {navGroups.map((group) => {
          // If standalone item
          if (group.directKey) {
            if (!hasAccess(group)) return null;
            const Icon = group.icon;
            const isActive = currentTab === group.directKey;

            return (
              <button
                key={group.id}
                id={`nav-${group.directKey}`}
                onClick={() => handleNavClick(group.directKey!)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-adm-accent-fill text-adm-on-accent font-semibold shadow-sm'
                    : 'text-adm-text-2 font-medium hover:text-adm-text hover:bg-adm-raised'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  <span className="truncate">{group.label}</span>
                </div>
              </button>
            );
          }

          // If collapsible Main Tab with sub-items
          const accessibleSubs = (group.subItems || []).filter(hasAccess);
          if (accessibleSubs.length === 0) return null;

          const isExpanded = !!expandedGroups[group.id];
          const hasActiveChild = accessibleSubs.some((sub) => sub.key === currentTab);
          const GroupIcon = group.icon;

          return (
            <div key={group.id} className="pt-1">
              {/* Main Tab Header (Collapsible Toggle) */}
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] transition-all text-left cursor-pointer select-none ${
                  hasActiveChild
                    ? 'text-adm-text bg-adm-raised font-semibold'
                    : 'text-adm-text-2 font-medium hover:text-adm-text hover:bg-adm-raised'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0 pr-1">
                  <GroupIcon
                    className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                      hasActiveChild ? 'text-adm-accent' : 'text-adm-muted'
                    }`}
                  />
                  <span className="truncate">
                    {group.label}
                  </span>
                  {hasActiveChild && (
                    <span className="w-1.5 h-1.5 rounded-full bg-adm-accent-fill shrink-0" />
                  )}
                </div>

                <div className="flex items-center space-x-1.5 shrink-0">
                  <span className="text-[10px] text-adm-faint font-mono">
                    {accessibleSubs.length}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-adm-muted transition-transform duration-200 ${
                      isExpanded ? 'transform rotate-0 text-adm-accent' : 'transform -rotate-90'
                    }`}
                  />
                </div>
              </button>

              {/* Sub Tabs Container (Collapsible Accordion) */}
              {isExpanded && (
                <div className="ml-5 pl-3 my-1 space-y-0.5 border-l border-adm-line animate-fadeIn">
                  {accessibleSubs.map((sub) => {
                    const SubIcon = sub.icon;
                    const isSubActive = currentTab === sub.key;

                    return (
                      <button
                        key={sub.key}
                        id={`nav-${sub.key}`}
                        onClick={() => handleNavClick(sub.key)}
                        className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-xs transition-all text-left cursor-pointer ${
                          isSubActive
                            ? 'bg-adm-accent-fill text-adm-on-accent font-semibold shadow-sm'
                            : 'text-adm-muted font-medium hover:text-adm-text hover:bg-adm-raised'
                        }`}
                      >
                        <SubIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Floating Account & System Settings Menu at the bottom of Sidebar
  const renderAccountMenu = () => {
    const isSystemActive =
      currentTab === 'admin-access' || currentTab === 'settings' || currentTab === 'notifications';

    return (
      <div ref={accountMenuRef} className="relative">
        {/* Dropdown Popover (Opens Upward) */}
        {accountMenuOpen && (
          <div className="absolute bottom-full mb-2.5 left-0 right-0 bg-adm-surface border border-adm-line-strong rounded-xl shadow-2xl p-2 z-50 animate-fadeIn">
            {/* User Profile Header */}
            <div className="px-3 py-2.5 border-b border-adm-line mb-1.5">
              <div className="flex items-center space-x-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-adm-accent shrink-0" />
                <span className="text-xs font-mono font-medium text-adm-text truncate">
                  {user?.email || 'admin@zanzirangi'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-adm-accent/20 text-adm-accent font-semibold">
                  {user?.role || 'SUPERADMIN'}
                </span>
                <span className="text-[10px] font-mono text-adm-muted">System Control</span>
              </div>
            </div>

            {/* System & Security Dropdown Actions */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  handleNavClick('notifications');
                  setAccountMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-mono tracking-wide transition-all text-left cursor-pointer ${
                  currentTab === 'notifications'
                    ? 'bg-adm-accent-fill text-adm-on-accent font-bold shadow-sm'
                    : 'text-adm-text-2 hover:text-adm-text hover:bg-adm-raised'
                }`}
              >
                <Bell className="w-3.5 h-3.5 text-adm-accent" />
                <span>Account & Notifications</span>
              </button>

              {hasAccess({ superadminOnly: true }) && (
                <button
                  type="button"
                  onClick={() => {
                    handleNavClick('admin-access');
                    setAccountMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-mono tracking-wide transition-all text-left cursor-pointer ${
                    currentTab === 'admin-access'
                      ? 'bg-adm-accent-fill text-adm-on-accent font-bold shadow-sm'
                      : 'text-adm-text-2 hover:text-adm-text hover:bg-adm-raised'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-adm-accent" />
                  <span>Admin Access (RBAC)</span>
                </button>
              )}

              {hasAccess({ permission: 'settings' }) && (
                <button
                  type="button"
                  onClick={() => {
                    handleNavClick('settings');
                    setAccountMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-mono tracking-wide transition-all text-left cursor-pointer ${
                    currentTab === 'settings'
                      ? 'bg-adm-accent-fill text-adm-on-accent font-bold shadow-sm'
                      : 'text-adm-text-2 hover:text-adm-text hover:bg-adm-raised'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5 text-adm-accent" />
                  <span>System Settings</span>
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-adm-line my-1.5" />

            {/* Logout Action */}
            <button
              type="button"
              onClick={() => {
                setAccountMenuOpen(false);
                onLogout();
              }}
              id="admin-logout-btn"
              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-mono tracking-wider uppercase text-red-300 hover:text-red-100 hover:bg-red-950/40 border border-transparent hover:border-red-800/40 transition-all text-left cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Trigger Button Pinned at Bottom of Sidebar */}
        <button
          type="button"
          onClick={() => setAccountMenuOpen(!accountMenuOpen)}
          className={`w-full flex items-center justify-between p-2 rounded-xl transition-all text-left cursor-pointer group select-none ${
            isSystemActive || accountMenuOpen
              ? 'bg-adm-raised border border-adm-accent/50 shadow-md'
              : 'bg-adm-surface hover:bg-adm-raised border border-adm-line hover:border-adm-line-strong'
          }`}
        >
          <div className="flex items-center space-x-2.5 min-w-0 pr-1">
            <div className="w-9 h-9 rounded-full bg-adm-accent-fill flex items-center justify-center text-adm-on-accent shrink-0 font-bold text-sm">
              {user?.email ? user.email.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-adm-text block truncate group-hover:text-adm-accent transition-colors">
                {user?.email || 'admin@zanzirangi'}
              </span>
              <span className="text-[10px] font-mono text-adm-muted uppercase tracking-wider block">
                {user?.role || 'Admin'} • System
              </span>
            </div>
          </div>
          <ChevronUp
            className={`w-4 h-4 text-adm-muted transition-transform duration-200 shrink-0 ${
              accountMenuOpen ? 'transform rotate-180 text-adm-accent' : 'group-hover:text-adm-text'
            }`}
          />
        </button>
      </div>
    );
  };

  return (
    <div
      data-admin-theme={theme}
      className="adm-root h-screen bg-adm-bg text-adm-text flex flex-col font-sans selection:bg-adm-accent/30 selection:text-adm-text overflow-hidden"
    >
      {/* ---------------- Top Administration Bar (Clean & Fixed) ---------------- */}
      <header className="shrink-0 h-16 bg-adm-panel/95 backdrop-blur-md border-b border-adm-line px-4 sm:px-6 flex items-center justify-between z-40">
        <div className="flex items-center space-x-3">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="md:hidden p-2 rounded-xl bg-adm-surface border border-adm-line text-adm-text"
            aria-label="Toggle navigation drawer"
          >
            {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo / Sanctuary Brand */}
          <div className="flex items-center space-x-2.5">
            <img
              src={zanzirangiLogo}
              alt="Zanzirangi House"
              className="w-9 h-9 rounded-xl object-cover border border-adm-accent/40 shadow-sm"
            />
            <div>
              <span className="adm-brand text-lg tracking-wider uppercase text-adm-text block font-medium leading-none">
                Zanzirangi House
              </span>
              <span className="text-[10px] font-semibold tracking-[0.2em] text-adm-accent uppercase block mt-0.5">
                Admin Panel
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Status, Theme Toggle & Live Link */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Real-time DB Status */}
          <div className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-[11px] font-medium text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Cloud Live</span>
          </div>

          {/* Light / Dark Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            id="admin-theme-toggle"
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-adm-surface border border-adm-line hover:border-adm-accent/50 text-adm-text-2 hover:text-adm-accent transition-all cursor-pointer"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* View Live Public Website */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-adm-surface border border-adm-line hover:border-adm-accent/50 text-xs font-medium text-adm-text-2 hover:text-adm-accent transition-all"
            title="Open live public website in new tab"
          >
            <span>View Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* ---------------- Main Layout Body (Independent Scrolling) ---------------- */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Sidebar Navigation (Desktop): Fixed h-full with independent scroll */}
        <aside className="hidden md:flex flex-col w-64 bg-adm-panel border-r border-adm-line shrink-0 h-full overflow-hidden">
          {/* Scrollable Nav Area */}
          <div className="flex-1 overflow-y-auto px-3.5 py-5 space-y-3">
            <div className="px-3 pb-1">
              <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-adm-faint block">
                Navigation
              </span>
            </div>

            {renderNavList()}
          </div>

          {/* Floating Bottom Account & System Dropdown Area */}
          <div className="shrink-0 border-t border-adm-line p-3 bg-adm-panel">
            {renderAccountMenu()}
            {systemRelease && (
              <p className="mt-2 px-1 text-[10px] font-mono text-adm-faint" title="Version of the website currently running">
                System Version v{systemRelease.version}
                {' · '}
                {systemRelease.releaseDate ? `Last Updated ${systemRelease.releaseDate}` : 'Pre-release build'}
              </p>
            )}
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden bg-black/80 backdrop-blur-sm flex">
            <div className="w-72 bg-adm-panel border-r border-adm-line h-full flex flex-col justify-between overflow-hidden">
              <div className="p-4 border-b border-adm-line flex items-center justify-between shrink-0">
                <span className="adm-brand text-base uppercase tracking-wider text-adm-text">Sanctuary CMS</span>
                <button onClick={() => setMobileDrawerOpen(false)} className="p-1 text-adm-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {renderNavList()}
              </div>

              <div className="p-3 border-t border-adm-line bg-adm-panel shrink-0">
                {renderAccountMenu()}
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileDrawerOpen(false)} />
          </div>
        )}

        {/* Main Content Area: Independent Vertical Scrollable Container */}
        <main className="flex-1 overflow-y-auto h-full p-4 sm:p-6 lg:p-8 bg-adm-bg">
          {children}
        </main>
      </div>
    </div>
  );
};
