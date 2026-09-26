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
} from 'lucide-react';
import { contentApi, DashboardStats } from '../../services/contentApi';

interface AdminDashboardHomeProps {
  onNavigateToTab: (tab: string) => void;
}

export const AdminDashboardHome: React.FC<AdminDashboardHomeProps> = ({ onNavigateToTab }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const data = await contentApi.getDashboardStats();
      setStats(data);
    } catch (e) {
      console.error('Error fetching dashboard stats', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const quickModules = [
    {
      key: 'homepage',
      label: 'Homepage & Carousel',
      icon: Home,
      stat: 'Multi-Slide & Sections',
      desc: 'Hero slides, narrative intro, section show/hide & order.',
    },
    {
      key: 'rooms',
      label: 'Rooms & Villas',
      icon: BedDouble,
      stat: `${stats?.counts?.villasPublished || 8} Published Villas`,
      desc: '8 private plunge pool villas, pricing, amenities & photos.',
    },
    {
      key: 'gallery',
      label: 'Photo Gallery',
      icon: ImageIcon,
      stat: `${stats?.counts?.galleryItems || 11} Photos`,
      desc: '7 luxury categories with lightbox captions & order.',
    },
    {
      key: 'videos',
      label: 'Videos & Reel',
      icon: Video,
      stat: '4K Brand Reel',
      desc: 'Video reel URL, poster thumbnail, and storyboard scenes.',
    },
    {
      key: 'facilities',
      label: 'Facilities & Spa',
      icon: Sparkles,
      stat: `${stats?.counts?.facilities || 6} Facilities`,
      desc: 'Infinity pool, dining pavilion, botanical spa, and hours.',
    },
    {
      key: 'testimonials',
      label: 'Guest Reviews',
      icon: MessageSquareQuote,
      stat: `${stats?.counts?.testimonials || 5} Reviews`,
      desc: 'Verified guest reviews, 1-5 star ratings, and dates.',
    },
    {
      key: 'contact',
      label: 'Concierge & Socials',
      icon: Phone,
      stat: '24/7 Channels',
      desc: 'Direct telephone, WhatsApp, map links & social media.',
    },
    {
      key: 'seo',
      label: 'SEO & Metadata',
      icon: Search,
      stat: 'Organic SERP',
      desc: 'Meta titles, descriptions, canonical URLs, and OpenGraph.',
    },
    {
      key: 'media',
      label: 'Media Library',
      icon: FolderOpen,
      stat: `${stats?.counts?.mediaAssets || 4} Assets`,
      desc: 'Central asset storage, image URLs & usage tracking.',
    },
    {
      key: 'settings',
      label: 'System Settings',
      icon: Settings,
      stat: 'Online Health',
      desc: 'Brand name, alert emails, and authorized admin users.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Page Title */}
      <div>
        <span className="text-[11px] font-mono tracking-[0.25em] uppercase text-[#C4A27A] block mb-1">
          SANCTUARY OVERVIEW
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-[#FAF8F5] font-light tracking-wide">
          CMS Control Dashboard
        </h2>
        <p className="text-sm text-[#A39F98] mt-1">
          Real-time database status, live inventory metrics, and quick management actions.
        </p>
      </div>

      {/* Website Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status 1: Database Live */}
        <div className="bg-[#1C1B1A] border border-[#2C2B28] rounded-xl p-5 flex items-start space-x-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-950/50 border border-emerald-700/50 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8E8B85] block">
              Website Database Status
            </span>
            <span className="text-lg font-serif text-[#FAF8F5] block mt-0.5">
              ● Connected Live
            </span>
            <span className="text-[11px] text-[#A39F98] mt-0.5 block">
              Atomic JSON Store Engine
            </span>
          </div>
        </div>

        {/* Status 2: Last Content Publish */}
        <div className="bg-[#1C1B1A] border border-[#2C2B28] rounded-xl p-5 flex items-start space-x-4">
          <div className="w-10 h-10 rounded-lg bg-[#B8966C]/10 border border-[#C4A27A]/30 flex items-center justify-center text-[#C4A27A] shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8E8B85] block">
              Last Content Publish
            </span>
            <span className="text-xs font-mono text-[#FAF8F5] block mt-1 truncate max-w-[180px]">
              {stats?.lastPublished
                ? new Date(stats.lastPublished).toLocaleString()
                : 'Initial Baseline'}
            </span>
            <span className="text-[11px] text-[#A39F98] mt-0.5 block truncate max-w-[180px]">
              By: {stats?.publishedBy || 'System'}
            </span>
          </div>
        </div>

        {/* Status 3: Production Target */}
        <div className="bg-[#1C1B1A] border border-[#2C2B28] rounded-xl p-5 flex items-start space-x-4">
          <div className="w-10 h-10 rounded-lg bg-[#141413] border border-[#2C2B28] flex items-center justify-center text-[#B8966C] shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8E8B85] block">
              Production Target
            </span>
            <span className="text-sm font-serif text-[#FAF8F5] block mt-0.5">
              zanzirangihouse.com
            </span>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-[#C4A27A] hover:underline inline-flex items-center space-x-1 mt-0.5"
            >
              <span>View Live Website</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Management Modules Quick Actions */}
      <div className="bg-[#1C1B1A] border border-[#2C2B28] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-xl text-[#FAF8F5] font-light">
            Sanctuary Content Modules
          </h3>
          <span className="text-xs font-mono text-[#C4A27A]">All Modules Active (LIVE)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.key}
                onClick={() => onNavigateToTab(mod.key)}
                id={`quick-nav-${mod.key}`}
                className="p-4 rounded-lg bg-[#22211F] hover:bg-[#2C2B28] border border-[#383632] hover:border-[#C4A27A]/60 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-5 h-5 text-[#C4A27A]" />
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-700/60 text-emerald-300">
                    LIVE
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#FAF8F5] font-semibold">
                    {mod.label}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#8E8B85] group-hover:text-[#FAF8F5] transition-colors" />
                </div>
                <span className="text-[11px] font-mono text-[#C4A27A] mt-1 block">
                  {mod.stat}
                </span>
                <span className="text-[11px] text-[#A39F98] mt-1 block line-clamp-2">
                  {mod.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Real Audit Trail & Recent Updates */}
      <div className="bg-[#1C1B1A] border border-[#2C2B28] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif text-xl text-[#FAF8F5] font-light">
              Audit Trail & Activity Log
            </h3>
            <p className="text-xs text-[#8E8B85]">
              Real-time chronological record of administrative actions and published changes.
            </p>
          </div>
          <button
            onClick={fetchStats}
            title="Refresh logs"
            className="p-1.5 rounded-lg bg-[#22211F] text-[#8E8B85] hover:text-[#FAF8F5] cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {stats?.recentUpdates && stats.recentUpdates.length > 0 ? (
            stats.recentUpdates.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-[#141413] border border-[#282725] text-xs font-mono"
              >
                <div className="flex items-center space-x-3 truncate mr-2">
                  <span className="w-2 h-2 rounded-full bg-[#C4A27A] shrink-0" />
                  <span className="font-bold text-[#FAF8F5] uppercase shrink-0">
                    {item.action}
                  </span>
                  <span className="text-[#A39F98] truncate">{item.details || '—'}</span>
                </div>
                <div className="text-right text-[11px] text-[#8E8B85] shrink-0 flex flex-col sm:flex-row sm:items-center sm:space-x-3">
                  <span className="text-[#C4A27A]">{item.userEmail}</span>
                  <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs font-mono text-[#8E8B85] py-4 text-center">
              No recent changes recorded.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
