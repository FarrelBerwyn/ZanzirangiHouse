import React, { useState } from 'react';
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
  Radio,
  MessageSquare,
} from 'lucide-react';
import { AdminUser, authApi } from '../services/authApi';
import zanzirangiLogo from '../assets/zanzirangi-logo-new.jpeg';

interface AdminLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
  user: AdminUser | null;
  children: React.ReactNode;
  hasUnsavedChanges?: boolean;
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

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, ready: true },
    { key: 'support', label: 'Customer Support', icon: MessageSquare, ready: true },
    { key: 'homepage', label: 'Homepage', icon: Home, ready: true },
    { key: 'rooms', label: 'Villas', icon: BedDouble, ready: true },
    { key: 'gallery', label: 'Gallery', icon: ImageIcon, ready: true },
    { key: 'videos', label: 'Videos', icon: Video, ready: true },
    { key: 'facilities', label: 'Facilities', icon: Sparkles, ready: true },
    { key: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote, ready: true },
    { key: 'contact', label: 'Contact', icon: Phone, ready: true },
    { key: 'seo', label: 'SEO', icon: Search, ready: true },
    { key: 'media', label: 'Media Library', icon: FolderOpen, ready: true },
    { key: 'settings', label: 'Settings', icon: Settings, ready: true },
  ];

  return (
    <div className="min-h-screen bg-[#141413] text-[#FAF8F5] flex flex-col font-sans selection:bg-[#B8966C]/30 selection:text-[#FAF8F5]">
      {/* ---------------- Top Administration Bar ---------------- */}
      <header className="sticky top-0 z-40 bg-[#141413]/95 backdrop-blur-md border-b border-[#2C2B28] px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="md:hidden p-2 rounded-lg bg-[#1C1B1A] border border-[#2C2B28] text-[#FAF8F5]"
            aria-label="Toggle navigation drawer"
          >
            {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo / Sanctuary Brand */}
          <div className="flex items-center space-x-2.5">
            <img
              src={zanzirangiLogo}
              alt="Zanzirangi House"
              className="w-8 h-8 rounded-full object-cover border border-[#C4A27A]/40 shadow-sm"
            />
            <div>
              <span className="font-serif text-base tracking-wider uppercase text-[#FAF8F5] block font-light leading-none">
                ZANZIRANGI HOUSE
              </span>
              <span className="text-[10px] font-mono tracking-[0.2em] text-[#C4A27A] uppercase block">
                ADMIN PANEL
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Status Indicator, Live Link & User Logout */}
        <div className="flex items-center space-x-3 sm:space-x-5">
          {/* Real-time DB Status */}
          <div className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#1C1B1A] border border-[#2C2B28] text-[11px] font-mono text-[#D8CCB8]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Connected</span>
          </div>

          {/* View Live Public Website */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center space-x-1 text-xs text-[#D8CCB8] hover:text-[#C4A27A] transition-colors"
            title="Open live public website in new tab"
          >
            <span>View Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* User Email Pill */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-[#1C1B1A] border border-[#2C2B28] rounded-full text-xs text-[#FAF8F5]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C4A27A]" />
            <span className="font-mono text-[11px] text-[#D8CCB8] truncate max-w-[180px]">
              {user?.email || 'admin@zanzirangi'}
            </span>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            id="admin-logout-btn"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#2C2B28]/60 hover:bg-red-950/40 border border-[#383632] hover:border-red-800/80 text-xs font-mono tracking-wider uppercase text-[#D8CCB8] hover:text-red-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* ---------------- Main Layout Body ---------------- */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation (Desktop) */}
        <aside className="hidden md:flex flex-col w-64 bg-[#181716] border-r border-[#2C2B28] shrink-0 p-4 justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#8E8B85] px-3 block mb-2">
              MANAGEMENT MODULES
            </span>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.key;
              return (
                <button
                  key={item.key}
                  id={`nav-${item.key}`}
                  onClick={() => handleNavClick(item.key)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs tracking-wider uppercase font-mono transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#B8966C] text-[#141413] font-bold shadow-md'
                      : 'text-[#D8CCB8]/80 hover:text-[#FAF8F5] hover:bg-[#22211F]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {!item.ready && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/30 border border-white/10 text-[#8E8B85]">
                      Soon
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer Info */}
          <div className="pt-4 border-t border-[#2C2B28] text-[11px] font-mono text-[#8E8B85]">
            <p className="text-[#C4A27A]">Zanzirangi House v3.0</p>
            <p className="text-[10px] text-[#6B6862]">Self-Managed CMS</p>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden bg-black/80 backdrop-blur-sm flex">
            <div className="w-72 bg-[#181716] border-r border-[#2C2B28] h-full p-4 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-3 border-b border-[#2C2B28]">
                  <span className="font-serif text-sm uppercase text-[#FAF8F5]">Menu</span>
                  <button onClick={() => setMobileDrawerOpen(false)} className="p-1 text-[#8E8B85]">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleNavClick(item.key)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all text-left ${
                        isActive
                          ? 'bg-[#B8966C] text-[#141413] font-bold'
                          : 'text-[#D8CCB8] hover:bg-[#22211F]'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {!item.ready && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/30 text-[#8E8B85]">
                          Soon
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-[#2C2B28]">
                <button
                  onClick={onLogout}
                  className="w-full py-2 px-3 bg-red-950/40 border border-red-800/60 rounded text-xs font-mono text-red-200 flex items-center justify-center space-x-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileDrawerOpen(false)} />
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#141413]">
          {children}
        </main>
      </div>
    </div>
  );
};
