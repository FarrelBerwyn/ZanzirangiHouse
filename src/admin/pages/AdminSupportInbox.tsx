import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Sparkles,
  UserCheck,
  Bot,
  User,
  CheckCircle2,
  Clock,
  Send,
  Plus,
  Trash2,
  Edit2,
  Search,
  BookOpen,
  BarChart3,
  Calendar,
  Home,
  Users,
  Link as LinkIcon,
  RefreshCw,
  Info,
  Check,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';
import { supportApi } from '../../services/supportApi';
import { contentApi } from '../../services/contentApi';
import { DEFAULT_SETTINGS } from '../../data/seedDefaults';
import { ImageCropperModal } from '../components/ImageCropperModal';
import {
  SupportConversationRecord,
  SupportMessageRecord,
  SupportKnowledgeRecord,
  SupportAiEventRecord,
  SupportAnalyticsSummary,
  SupportConversationStatus,
} from '../../../server/database/supportTypes';

export const AdminSupportInbox: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'inbox' | 'knowledge' | 'analytics' | 'profile'>('inbox');

  // -------------------------------------------------------------
  // INBOX STATE
  // -------------------------------------------------------------
  const [conversations, setConversations] = useState<
    (SupportConversationRecord & { messageCount: number; lastMessageText?: string })[]
  >([]);
  const [counts, setCounts] = useState<{
    all: number;
    waiting: number;
    aiActive: number;
    humanActive: number;
    resolved: number;
    closed: number;
  }>({
    all: 0,
    waiting: 0,
    aiActive: 0,
    humanActive: 0,
    resolved: 0,
    closed: 0,
  });

  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);

  // Selected Conversation Data
  const [selectedConv, setSelectedConv] = useState<SupportConversationRecord | null>(null);
  const [messages, setMessages] = useState<SupportMessageRecord[]>([]);
  const [aiEvents, setAiEvents] = useState<SupportAiEventRecord[]>([]);

  // Reply Input & Actions
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [suggestedReply, setSuggestedReply] = useState<string | null>(null);
  const [isLoadingSuggested, setIsLoadingSuggested] = useState(false);
  const [knowledgeCandidatePrompt, setKnowledgeCandidatePrompt] = useState<{
    question: string;
    answer: string;
  } | null>(null);
  const [candidateSaved, setCandidateSaved] = useState(false);

  // -------------------------------------------------------------
  // KNOWLEDGE BASE STATE
  // -------------------------------------------------------------
  const [kbItems, setKbItems] = useState<SupportKnowledgeRecord[]>([]);
  const [kbCategoryFilter, setKbCategoryFilter] = useState('ALL');
  const [kbSearch, setKbSearch] = useState('');
  const [editingKbItem, setEditingKbItem] = useState<Partial<SupportKnowledgeRecord> | null>(null);
  const [isKbModalOpen, setIsKbModalOpen] = useState(false);

  // -------------------------------------------------------------
  // ANALYTICS STATE
  // -------------------------------------------------------------
  const [analytics, setAnalytics] = useState<SupportAnalyticsSummary | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const threadEndRef = useRef<HTMLDivElement>(null);
  const prevWaitingCountRef = useRef<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('zanzirangi_admin_sound') !== 'false';
    } catch {
      return true;
    }
  });
  const [hasNotificationPermission, setHasNotificationPermission] = useState<boolean>(
    typeof Notification !== 'undefined' && Notification.permission === 'granted'
  );

  // -------------------------------------------------------------
  // SUPPORT AVATAR & PROFILE STATE
  // -------------------------------------------------------------
  const [supportAvatar, setSupportAvatar] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('zanzirangi_support_profile');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.supportAvatar) return parsed.supportAvatar;
        }
      } catch {}
    }
    return DEFAULT_SETTINGS.supportAvatar || '/uploads/avatar-1790937078607_1790937078818_0381644b.jpg';
  });
  const [supportName, setSupportName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('zanzirangi_support_profile');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.supportName) return parsed.supportName;
        }
      } catch {}
    }
    return DEFAULT_SETTINGS.supportName || 'Elena';
  });
  const [supportTitle, setSupportTitle] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('zanzirangi_support_profile');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.supportTitle) return parsed.supportTitle;
        }
      } catch {}
    }
    return DEFAULT_SETTINGS.supportTitle || 'Customer Support';
  });
  const [supportStatus, setSupportStatus] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('zanzirangi_support_profile');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.supportStatus) return parsed.supportStatus;
        }
      } catch {}
    }
    return DEFAULT_SETTINGS.supportStatus || 'Active 24/7';
  });
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [selectedCropFile, setSelectedCropFile] = useState<File | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadSupportSettings = async () => {
    try {
      const s = await contentApi.getAdminSettings();
      if (s.supportAvatar) setSupportAvatar(s.supportAvatar);
      if (s.supportName) setSupportName(s.supportName);
      if (s.supportTitle) setSupportTitle(s.supportTitle);
      if (s.supportStatus) setSupportStatus(s.supportStatus);
    } catch (e) {
      console.error('Failed to load support profile settings', e);
    }
  };

  useEffect(() => {
    loadSupportSettings();
  }, []);

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setProfileSaving(true);
      setProfileMessage(null);
      await contentApi.updateSettings({
        supportAvatar,
        supportName,
        supportTitle,
        supportStatus,
      });
      setProfileMessage('✓ Avatar & Customer Support profile updated successfully!');
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(
            'zanzirangi_support_profile',
            JSON.stringify({ supportAvatar, supportName, supportTitle, supportStatus })
          );
        } catch {}
        window.dispatchEvent(
          new CustomEvent('zanzirangi-support-profile-updated', {
            detail: { supportAvatar, supportName, supportTitle, supportStatus },
          })
        );
      }
      setTimeout(() => setProfileMessage(null), 4000);
    } catch (err: any) {
      setProfileMessage(`Error: ${err.message || 'Failed to save support profile'}`);
    } finally {
      setProfileSaving(false);
    }
  };

  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Note 1 (D5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.6);

      // Note 2 (A5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.12);
      gain2.gain.setValueAtTime(0.25, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.8);
    } catch (e) {
      console.warn('Audio chime warning:', e);
    }
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('zanzirangi_admin_sound', String(next));
      } catch {}
      if (next) playChime();
      return next;
    });
  };

  const requestDesktopPermission = async () => {
    if (typeof Notification === 'undefined') return;
    try {
      const res = await Notification.requestPermission();
      setHasNotificationPermission(res === 'granted');
      if (res === 'granted') {
        new Notification('Zanzirangi House Alerts Enabled', {
          body: 'You will receive desktop alerts when a guest requests human assistance or submits a booking.',
          icon: '/favicon-32x32.png',
        });
      }
    } catch (e) {
      console.warn('Notification permission error:', e);
    }
  };

  // -------------------------------------------------------------
  // Data Loaders
  // -------------------------------------------------------------
  const loadConversations = async (autoSelect = false) => {
    try {
      const res = await supportApi.adminGetConversations({
        status: filterStatus === 'ALL' ? undefined : filterStatus,
        search: searchQuery || undefined,
      });

      // Check if waiting human count has increased (New urgent guest!)
      if (!autoSelect && res.counts.waiting > prevWaitingCountRef.current) {
        if (soundEnabled) {
          playChime();
        }
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification('🏨 Zanzirangi Guest Alert', {
            body: `${res.counts.waiting} guest(s) waiting for human response or booking inquiry!`,
            icon: '/favicon-32x32.png',
          });
        }
      }
      prevWaitingCountRef.current = res.counts.waiting;

      setConversations(res.conversations);
      setCounts(res.counts);

      if (autoSelect && res.conversations.length > 0 && !selectedConvId) {
        setSelectedConvId(res.conversations[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadConversationDetail = async (id: string) => {
    try {
      const res = await supportApi.adminGetConversation(id);
      setSelectedConv(res.conversation);
      setMessages(res.messages);
      setAiEvents(res.aiEvents);

      // If conversation is WAITING_HUMAN or HUMAN_ACTIVE, fetch suggested reply
      if (res.conversation.status === 'WAITING_HUMAN' || res.conversation.status === 'HUMAN_ACTIVE') {
        loadSuggestedReply(id);
      } else {
        setSuggestedReply(null);
      }
    } catch (err) {
      console.error('Failed to load conversation details:', err);
    }
  };

  const loadSuggestedReply = async (id: string) => {
    setIsLoadingSuggested(true);
    try {
      const res = await supportApi.adminGetSuggestedReply(id);
      setSuggestedReply(res.suggestedReply);
    } catch {
      setSuggestedReply(null);
    } finally {
      setIsLoadingSuggested(false);
    }
  };

  const loadKnowledgeBase = async () => {
    try {
      const items = await supportApi.adminGetKnowledgeBase({
        category: kbCategoryFilter === 'ALL' ? undefined : kbCategoryFilter,
        search: kbSearch || undefined,
      });
      setKbItems(items);
    } catch (err) {
      console.error('Failed to load knowledge base:', err);
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await supportApi.adminGetAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  };

  useEffect(() => {
    loadConversations(true);
  }, [filterStatus]);

  useEffect(() => {
    if (selectedConvId) {
      loadConversationDetail(selectedConvId);
    }
  }, [selectedConvId]);

  useEffect(() => {
    if (activeSubTab === 'knowledge') {
      loadKnowledgeBase();
    } else if (activeSubTab === 'analytics') {
      loadAnalytics();
    }
  }, [activeSubTab, kbCategoryFilter]);

  // Polling for inbox updates (every 4 seconds)
  useEffect(() => {
    if (activeSubTab !== 'inbox') return;

    const interval = setInterval(() => {
      loadConversations(false);
      if (selectedConvId) {
        supportApi.adminGetConversation(selectedConvId).then((res) => {
          setSelectedConv(res.conversation);
          setMessages(res.messages);
          setAiEvents(res.aiEvents);
        }).catch(() => {});
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [activeSubTab, selectedConvId, filterStatus]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // -------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------
  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const text = customText || replyText;
    if (!text.trim() || !selectedConvId) return;

    setIsSending(true);
    try {
      const isFromSuggested = text === suggestedReply;
      const res = await supportApi.adminSendMessage(selectedConvId, text.trim(), undefined, isFromSuggested);
      setMessages((prev) => [...prev, res.message]);
      setSelectedConv(res.conversation);
      setReplyText('');
      setSuggestedReply(null);

      // Check if we answered an unanswered question -> offer Knowledge Candidate
      const lastVisitorMsg = [...messages].reverse().find((m) => m.sender_type === 'VISITOR');
      if (lastVisitorMsg && (selectedConv?.status === 'WAITING_HUMAN' || selectedConv?.status === 'HUMAN_ACTIVE')) {
        setKnowledgeCandidatePrompt({
          question: lastVisitorMsg.message,
          answer: text.trim(),
        });
        setCandidateSaved(false);
      }

      loadConversations();
    } catch (err: any) {
      alert(`Error sending message: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusChange = async (newStatus: SupportConversationStatus) => {
    if (!selectedConvId) return;
    try {
      const updated = await supportApi.adminUpdateStatus(selectedConvId, newStatus);
      setSelectedConv(updated);
      loadConversationDetail(selectedConvId);
      loadConversations();
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  const handleSaveCandidate = async () => {
    if (!knowledgeCandidatePrompt) return;
    try {
      await supportApi.adminSaveKnowledgeItem({
        question: knowledgeCandidatePrompt.question,
        answer: knowledgeCandidatePrompt.answer,
        category: 'General',
        source: 'CANDIDATE_FROM_ADMIN',
        status: 'PUBLISHED',
      });
      setCandidateSaved(true);
      setTimeout(() => {
        setKnowledgeCandidatePrompt(null);
        setCandidateSaved(false);
      }, 3000);
    } catch (err: any) {
      alert(`Failed to save candidate: ${err.message}`);
    }
  };

  const handleSaveKbItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKbItem?.question || !editingKbItem?.answer) return;

    try {
      await supportApi.adminSaveKnowledgeItem({
        id: editingKbItem.id,
        question: editingKbItem.question,
        answer: editingKbItem.answer,
        category: editingKbItem.category || 'General',
        language: editingKbItem.language || 'en',
        status: editingKbItem.status || 'PUBLISHED',
      });
      setIsKbModalOpen(false);
      setEditingKbItem(null);
      loadKnowledgeBase();
    } catch (err: any) {
      alert(`Failed to save knowledge item: ${err.message}`);
    }
  };

  const handleDeleteKbItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Knowledge Base item?')) return;
    try {
      await supportApi.adminDeleteKnowledgeItem(id);
      loadKnowledgeBase();
    } catch (err: any) {
      alert(`Failed to delete item: ${err.message}`);
    }
  };

  const getStatusBadge = (status: SupportConversationStatus) => {
    switch (status) {
      case 'WAITING_HUMAN':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-950/80 border border-amber-600/70 text-amber-300 flex items-center space-x-1 animate-pulse">
            <Clock className="w-3 h-3" />
            <span>Waiting Human</span>
          </span>
        );
      case 'HUMAN_ACTIVE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-950/80 border border-emerald-500/70 text-emerald-300 flex items-center space-x-1">
            <UserCheck className="w-3 h-3" />
            <span>Human Active</span>
          </span>
        );
      case 'AI_ACTIVE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-blue-950/80 border border-blue-600/70 text-blue-300 flex items-center space-x-1">
            <Bot className="w-3 h-3" />
            <span>AI Active</span>
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-adm-raised border border-adm-line-strong text-adm-muted flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Resolved</span>
          </span>
        );
      case 'CLOSED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-adm-panel border border-adm-line text-adm-faint">
            Closed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* ---------------- Top Section Header & Sub-Tabs ---------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-adm-line gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-adm-accent">
              CONCIERGE & SUPPORT
            </span>
            {counts.waiting > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500 text-adm-on-accent font-bold animate-bounce">
                {counts.waiting} Waiting
              </span>
            )}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-adm-text tracking-wide mt-1">
            Customer Support Platform
          </h1>
          <p className="text-xs text-adm-muted mt-0.5">
            Unified AI Concierge + Human Support Inbox with booking context and live knowledge base.
          </p>
        </div>

        {/* Right side controls: Alerts & Sub-Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Audio Chime & Browser Notification Toggles */}
          <div className="flex items-center bg-adm-surface border border-adm-line p-1 rounded-xl space-x-1">
            <button
              type="button"
              onClick={toggleSound}
              title={soundEnabled ? 'Alert Chime Sound: ON' : 'Alert Chime Sound: MUTED'}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/40'
                  : 'text-adm-muted hover:text-adm-text'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="text-[11px] font-mono hidden sm:inline">{soundEnabled ? 'Chime ON' : 'Muted'}</span>
            </button>

            <button
              type="button"
              onClick={requestDesktopPermission}
              title={hasNotificationPermission ? 'Desktop Alerts: ENABLED' : 'Click to Enable Desktop Push Alerts'}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                hasNotificationPermission
                  ? 'bg-sky-950/50 text-sky-300 border border-sky-800/40'
                  : 'text-adm-muted hover:text-adm-text'
              }`}
            >
              {hasNotificationPermission ? <Bell className="w-3.5 h-3.5 text-sky-400" /> : <BellOff className="w-3.5 h-3.5" />}
              <span className="text-[11px] font-mono hidden sm:inline">{hasNotificationPermission ? 'Desktop ON' : 'Enable Push'}</span>
            </button>
          </div>

          {/* Sub-Tabs: Inbox | Knowledge Base | Analytics */}
          <div className="flex items-center bg-adm-surface border border-adm-line p-1 rounded-xl space-x-1">
          <button
            onClick={() => setActiveSubTab('inbox')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
              activeSubTab === 'inbox'
                ? 'bg-adm-accent-fill text-adm-on-accent shadow'
                : 'text-adm-text-2 hover:text-adm-text'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Inbox</span>
            {counts.waiting > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-red-600 text-white font-bold">
                {counts.waiting}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('knowledge')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
              activeSubTab === 'knowledge'
                ? 'bg-adm-accent-fill text-adm-on-accent shadow'
                : 'text-adm-text-2 hover:text-adm-text'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Knowledge Base</span>
          </button>

          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
              activeSubTab === 'analytics'
                ? 'bg-adm-accent-fill text-adm-on-accent shadow'
                : 'text-adm-text-2 hover:text-adm-text'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => setActiveSubTab('profile')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
              activeSubTab === 'profile'
                ? 'bg-adm-accent-fill text-adm-on-accent shadow'
                : 'text-adm-text-2 hover:text-adm-text'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Avatar & Profile</span>
          </button>
        </div>
      </div>
    </div>

      {/* ============================================================= */}
      {/* VIEW 1: SUPPORT INBOX (3-COLUMN LAYOUT)                       */}
      {/* ============================================================= */}
      {activeSubTab === 'inbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-230px)] min-h-[640px]">
          {/* ---------------- LEFT PANEL: Conversation List (3.5 cols) ---------------- */}
          <div className="lg:col-span-4 xl:col-span-3 bg-adm-surface border border-adm-line rounded-2xl flex flex-col overflow-hidden shadow-xl">
            {/* Filter Tabs & Search */}
            <div className="p-3.5 border-b border-adm-line space-y-3 bg-adm-panel">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-adm-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search guests, email, villa..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    loadConversations();
                  }}
                  className="w-full bg-adm-bg border border-adm-line rounded-xl pl-9 pr-3 py-1.5 text-xs text-adm-text placeholder-adm-faint focus:outline-none focus:border-adm-accent"
                />
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center space-x-1 overflow-x-auto pb-1 no-scrollbar text-[11px]">
                {[
                  { key: 'ALL', label: 'All', count: counts.all },
                  { key: 'WAITING_HUMAN', label: 'Waiting', count: counts.waiting },
                  { key: 'HUMAN_ACTIVE', label: 'Human', count: counts.humanActive },
                  { key: 'AI_ACTIVE', label: 'AI', count: counts.aiActive },
                  { key: 'RESOLVED', label: 'Resolved', count: counts.resolved },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilterStatus(f.key)}
                    className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1 ${
                      filterStatus === f.key
                        ? 'bg-adm-accent-fill text-adm-on-accent font-bold shadow'
                        : 'bg-adm-bg text-adm-muted hover:text-adm-text'
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className="text-[10px] opacity-75 font-mono">({f.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation Items List */}
            <div className="flex-1 overflow-y-auto divide-y divide-adm-raised">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-adm-muted text-xs">
                  <p>No conversations found.</p>
                </div>
              ) : (
                conversations.map((c) => {
                  const isSelected = c.id === selectedConvId;
                  const time = new Date(c.last_message_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedConvId(c.id)}
                      className={`p-3.5 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-adm-raised border-l-4 border-l-adm-accent'
                          : 'hover:bg-adm-surface'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-xs text-adm-text truncate max-w-[130px]">
                            {c.metadata?.fullName || `Visitor ${c.visitor_id.substring(4, 9)}`}
                          </span>
                          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-adm-line text-adm-accent font-mono">
                            {c.language}
                          </span>
                        </div>
                        <span className="text-[10px] text-adm-muted font-mono">{time}</span>
                      </div>

                      <p className="text-xs text-adm-muted line-clamp-1 mb-2">
                        {c.lastMessageText || 'Conversation started'}
                      </p>

                      <div className="flex items-center justify-between">
                        {getStatusBadge(c.status)}

                        {c.booking_id && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-700/60 text-emerald-400">
                            Booking Inquiry
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ---------------- CENTER PANEL: Conversation Thread (5.5 cols) ---------------- */}
          <div className="lg:col-span-5 xl:col-span-6 bg-adm-surface border border-adm-line rounded-2xl flex flex-col overflow-hidden shadow-xl">
            {selectedConv ? (
              <>
                {/* Thread Header with Take Over & Return to AI Controls */}
                <div className="px-5 py-3.5 bg-adm-panel border-b border-adm-line flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-adm-line border border-adm-accent/50 flex items-center justify-center text-adm-accent">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-xs sm:text-sm text-adm-text">
                          {selectedConv.metadata?.fullName || `Visitor (${selectedConv.visitor_id})`}
                        </h3>
                        {getStatusBadge(selectedConv.status)}
                      </div>
                      <span className="text-[10px] text-adm-muted font-mono">
                        Page: {selectedConv.current_page} • Lang: {selectedConv.language.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Operational Control Buttons */}
                  <div className="flex items-center space-x-2">
                    {selectedConv.status !== 'HUMAN_ACTIVE' && (
                      <button
                        onClick={() => handleStatusChange('HUMAN_ACTIVE')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shadow cursor-pointer"
                        title="Take over this conversation. AI auto-replies will stop."
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Take Over</span>
                      </button>
                    )}

                    {selectedConv.status === 'HUMAN_ACTIVE' && (
                      <button
                        onClick={() => handleStatusChange('AI_ACTIVE')}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shadow cursor-pointer"
                        title="Return control to Juma AI concierge"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>Return to AI</span>
                      </button>
                    )}

                    {selectedConv.status !== 'RESOLVED' ? (
                      <button
                        onClick={() => handleStatusChange('RESOLVED')}
                        className="px-3 py-1.5 bg-adm-line hover:bg-adm-line-strong text-adm-text rounded-lg text-xs font-medium flex items-center space-x-1 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Resolve</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange('HUMAN_ACTIVE')}
                        className="px-3 py-1.5 bg-adm-line hover:bg-adm-line-strong text-adm-text-2 rounded-lg text-xs font-medium cursor-pointer"
                      >
                        Re-open
                      </button>
                    )}
                  </div>
                </div>

                {/* Message Bubbles Container */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-adm-bg/90 text-xs">
                  {messages.map((m) => {
                    const time = new Date(m.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    if (m.sender_type === 'SYSTEM') {
                      return (
                        <div key={m.id} className="text-center py-1">
                          <span className="text-[10px] font-mono text-adm-muted bg-adm-surface border border-adm-line px-3 py-1 rounded-full inline-block">
                            {m.message}
                          </span>
                        </div>
                      );
                    }

                    const isVisitor = m.sender_type === 'VISITOR';
                    const isAi = m.sender_type === 'AI';
                    const isAdmin = m.sender_type === 'ADMIN';

                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isVisitor ? 'items-start' : 'items-end'}`}
                      >
                        <div
                          className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed shadow ${
                            isVisitor
                              ? 'bg-adm-raised text-adm-text border border-adm-line rounded-tl-none'
                              : isAdmin
                              ? 'bg-adm-accent-fill text-adm-on-accent font-medium rounded-tr-none'
                              : 'bg-adm-panel text-adm-text-2 border border-adm-line rounded-tr-none'
                          }`}
                        >
                          <div className="flex items-center space-x-1.5 mb-1 opacity-75 text-[10px] font-mono">
                            {isVisitor && <span>Visitor</span>}
                            {isAi && (
                              <span className="flex items-center space-x-1 text-adm-accent">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>Juma AI</span>
                              </span>
                            )}
                            {isAdmin && (
                              <span className="flex items-center space-x-1 text-adm-on-accent font-bold">
                                <UserCheck className="w-2.5 h-2.5" />
                                <span>Staff Concierge ({m.sender_id})</span>
                              </span>
                            )}
                          </div>

                          <p className="whitespace-pre-wrap">{m.message}</p>

                          {m.metadata?.action && (
                            <div className="mt-2 pt-2 border-t border-black/10 text-[10px] font-mono">
                              CTA Action: <strong>{m.metadata.action.label}</strong> ({m.metadata.action.target})
                            </div>
                          )}
                        </div>

                        <span className="text-[9px] text-adm-faint mt-1 px-1 font-mono">{time}</span>
                      </div>
                    );
                  })}
                  <div ref={threadEndRef} />
                </div>

                {/* AI Suggested Reply Banner (Appears when HUMAN_ACTIVE or WAITING_HUMAN) */}
                {suggestedReply && (
                  <div className="p-3 bg-gradient-to-r from-adm-surface via-adm-raised to-adm-surface border-t border-adm-accent/40 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-1.5 text-adm-accent">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="font-semibold text-[11px] uppercase tracking-wider font-mono">
                          AI Suggested Reply
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => {
                            setReplyText(suggestedReply);
                          }}
                          className="px-2.5 py-1 bg-adm-line hover:bg-adm-line-strong text-adm-text-2 text-[11px] font-mono rounded flex items-center space-x-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleSendMessage(undefined, suggestedReply)}
                          className="px-3 py-1 bg-adm-accent-fill hover:bg-adm-accent-hover text-adm-on-accent text-[11px] font-bold rounded flex items-center space-x-1 cursor-pointer shadow"
                        >
                          <Check className="w-3 h-3" />
                          <span>Use Reply</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-adm-text/90 italic bg-adm-bg/60 p-2 rounded-lg border border-adm-line">
                      "{suggestedReply}"
                    </p>
                  </div>
                )}

                {/* Knowledge Candidate Offer Banner (When human answers unanswered question) */}
                {knowledgeCandidatePrompt && (
                  <div className="p-3 bg-emerald-950/40 border-t border-emerald-700/60 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-emerald-400">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span className="font-semibold font-mono text-[11px]">
                          Create Knowledge Candidate?
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {candidateSaved ? (
                          <span className="text-emerald-400 font-bold flex items-center space-x-1 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Saved to Knowledge Base!</span>
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => setKnowledgeCandidatePrompt(null)}
                              className="text-adm-muted hover:text-adm-text text-[11px] cursor-pointer"
                            >
                              Ignore
                            </button>
                            <button
                              onClick={handleSaveCandidate}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold cursor-pointer shadow"
                            >
                              Add to Knowledge Base
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-adm-muted mt-1 truncate">
                      Q: {knowledgeCandidatePrompt.question}
                    </p>
                  </div>
                )}

                {/* Reply Input Bar with Contextual Quick Link Attachments */}
                <form onSubmit={handleSendMessage} className="p-3 bg-adm-panel border-t border-adm-line space-y-2">
                  {/* Contextual Link Buttons */}
                  <div className="flex items-center space-x-1.5 text-[10px] font-mono text-adm-muted overflow-x-auto no-scrollbar">
                    <span className="flex items-center space-x-1 flex-shrink-0">
                      <LinkIcon className="w-3 h-3 text-adm-accent" />
                      <span>Quick Link:</span>
                    </span>
                    {[
                      { label: '+ Villas', link: 'View our luxury villas at #stay' },
                      { label: '+ Dining', link: 'Discover oceanfront dining at #dining' },
                      { label: '+ Experiences', link: 'Explore island tours at #experiences' },
                      { label: '+ Safari', link: 'Plan mainland safaris at #tanzania' },
                      { label: '+ Shuttle', link: 'Airport VIP transfers details at #shuttle' },
                    ].map((lnk) => (
                      <button
                        key={lnk.label}
                        type="button"
                        onClick={() => setReplyText((prev) => `${prev} ${lnk.link}`.trim())}
                        className="px-2 py-0.5 bg-adm-surface hover:bg-adm-line border border-adm-line rounded text-adm-text-2 hover:text-adm-text transition-colors flex-shrink-0 cursor-pointer"
                      >
                        {lnk.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder={`Reply as staff concierge (${selectedConv.language.toUpperCase()})...`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 bg-adm-bg border border-adm-line rounded-xl px-3.5 py-2.5 text-xs text-adm-text placeholder-adm-faint focus:outline-none focus:border-adm-accent"
                    />
                    <button
                      type="submit"
                      disabled={!replyText.trim() || isSending}
                      className="px-4 py-2.5 bg-adm-accent-fill hover:bg-adm-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-adm-on-accent font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-adm-muted text-xs">
                Select a conversation from the left to view messages and reply.
              </div>
            )}
          </div>

          {/* ---------------- RIGHT PANEL: Visitor & Booking Context (3.5 cols) ---------------- */}
          <div className="lg:col-span-3 xl:col-span-3 space-y-4 overflow-y-auto">
            {selectedConv ? (
              <>
                {/* Visitor Profile Card */}
                <div className="bg-adm-surface border border-adm-line rounded-2xl p-4 space-y-3 shadow-xl text-xs">
                  <div className="flex items-center space-x-2 pb-2 border-b border-adm-line">
                    <User className="w-4 h-4 text-adm-accent" />
                    <h3 className="font-semibold text-xs uppercase tracking-wider text-adm-text font-mono">
                      Visitor Context
                    </h3>
                  </div>

                  <div className="space-y-1.5 font-mono text-[11px] text-adm-muted">
                    <p>
                      <strong className="text-adm-text">Visitor ID:</strong> {selectedConv.visitor_id}
                    </p>
                    <p>
                      <strong className="text-adm-text">Language:</strong> {selectedConv.language.toUpperCase()}
                    </p>
                    <p>
                      <strong className="text-adm-text">Current Page:</strong> {selectedConv.current_page}
                    </p>
                    <p>
                      <strong className="text-adm-text">Started:</strong>{' '}
                      {new Date(selectedConv.created_at).toLocaleString([], {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </p>
                    <p>
                      <strong className="text-adm-text">Status:</strong> {selectedConv.status}
                    </p>
                    {selectedConv.assigned_admin_id && (
                      <p>
                        <strong className="text-adm-text">Assigned:</strong> {selectedConv.assigned_admin_id}
                      </p>
                    )}
                  </div>
                </div>

                {/* Booking Context Card (if attached) */}
                {selectedConv.metadata && (selectedConv.metadata.villaName || selectedConv.metadata.checkIn) && (
                  <div className="bg-gradient-to-br from-adm-surface to-adm-raised border border-adm-accent/50 rounded-2xl p-4 space-y-3 shadow-xl text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-adm-line">
                      <div className="flex items-center space-x-2">
                        <Home className="w-4 h-4 text-adm-accent" />
                        <h3 className="font-semibold text-xs uppercase tracking-wider text-adm-text font-mono">
                          Booking Inquiry
                        </h3>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 font-mono text-[9px] font-bold">
                        ACTIVE
                      </span>
                    </div>

                    <div className="space-y-2 font-mono text-[11px]">
                      {selectedConv.metadata.villaName && (
                        <div>
                          <span className="text-adm-muted block text-[10px]">VILLA:</span>
                          <span className="text-adm-text font-semibold">{selectedConv.metadata.villaName}</span>
                        </div>
                      )}

                      {(selectedConv.metadata.checkIn || selectedConv.metadata.checkOut) && (
                        <div className="flex items-center space-x-3">
                          <div>
                            <span className="text-adm-muted block text-[10px]">CHECK-IN:</span>
                            <span className="text-adm-text">{selectedConv.metadata.checkIn}</span>
                          </div>
                          <div>
                            <span className="text-adm-muted block text-[10px]">CHECK-OUT:</span>
                            <span className="text-adm-text">{selectedConv.metadata.checkOut}</span>
                          </div>
                        </div>
                      )}

                      {selectedConv.metadata.guests && (
                        <div>
                          <span className="text-adm-muted block text-[10px]">GUESTS:</span>
                          <span className="text-adm-text">{selectedConv.metadata.guests} Guests</span>
                        </div>
                      )}

                      {selectedConv.metadata.fullName && (
                        <div>
                          <span className="text-adm-muted block text-[10px]">CONTACT NAME:</span>
                          <span className="text-adm-text">{selectedConv.metadata.fullName}</span>
                        </div>
                      )}

                      {selectedConv.metadata.email && (
                        <div>
                          <span className="text-adm-muted block text-[10px]">EMAIL:</span>
                          <span className="text-adm-accent">{selectedConv.metadata.email}</span>
                        </div>
                      )}

                      {selectedConv.metadata.phone && (
                        <div>
                          <span className="text-adm-muted block text-[10px]">PHONE:</span>
                          <span className="text-adm-text">{selectedConv.metadata.phone}</span>
                        </div>
                      )}

                      {selectedConv.metadata.specialRequests && (
                        <div>
                          <span className="text-adm-muted block text-[10px]">SPECIAL REQUESTS:</span>
                          <p className="text-adm-text-2 italic bg-adm-bg/70 p-2 rounded border border-adm-line">
                            "{selectedConv.metadata.specialRequests}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* AI Decision Audit Trail */}
                <div className="bg-adm-surface border border-adm-line rounded-2xl p-4 space-y-3 shadow-xl text-xs">
                  <div className="flex items-center space-x-2 pb-2 border-b border-adm-line">
                    <Sparkles className="w-4 h-4 text-adm-accent" />
                    <h3 className="font-semibold text-xs uppercase tracking-wider text-adm-text font-mono">
                      AI Audit Trail ({aiEvents.length})
                    </h3>
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto font-mono text-[10px]">
                    {aiEvents.length === 0 ? (
                      <p className="text-adm-muted italic">No AI decision events logged.</p>
                    ) : (
                      aiEvents.map((e) => (
                        <div key={e.id} className="p-2 bg-adm-bg rounded-lg border border-adm-line space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-adm-accent font-bold">{e.intent}</span>
                            <span
                              className={`px-1 rounded text-[9px] ${
                                e.decision === 'AUTO_ANSWER'
                                  ? 'bg-emerald-950 text-emerald-400'
                                  : 'bg-amber-950 text-amber-400'
                              }`}
                            >
                              {e.decision}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-adm-muted">
                            <span>Conf: {(e.confidence * 100).toFixed(0)}%</span>
                            <span>{new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-adm-surface border border-adm-line rounded-2xl p-6 text-center text-adm-muted text-xs">
                No conversation selected.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* VIEW 2: KNOWLEDGE BASE MANAGER                                */}
      {/* ============================================================= */}
      {activeSubTab === 'knowledge' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search questions or answers..."
                value={kbSearch}
                onChange={(e) => {
                  setKbSearch(e.target.value);
                  loadKnowledgeBase();
                }}
                className="bg-adm-surface border border-adm-line rounded-xl px-3.5 py-2 text-xs text-adm-text placeholder-adm-faint focus:outline-none focus:border-adm-accent w-64"
              />

              {/* Category Filter */}
              <select
                value={kbCategoryFilter}
                onChange={(e) => setKbCategoryFilter(e.target.value)}
                className="bg-adm-surface border border-adm-line rounded-xl px-3 py-2 text-xs text-adm-text focus:outline-none focus:border-adm-accent"
              >
                <option value="ALL">All Categories</option>
                <option value="General">General</option>
                <option value="Greetings">Greetings</option>
                <option value="Check-in">Check-in</option>
                <option value="Pricing">Pricing</option>
                <option value="Villa">Villa</option>
                <option value="Airport Transfer">Airport Transfer</option>
                <option value="Safari">Safari</option>
                <option value="Dining">Dining</option>
                <option value="Wi-Fi">Wi-Fi</option>
                <option value="Wellness">Wellness</option>
                <option value="Family">Family</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <button
              onClick={() => {
                setEditingKbItem({
                  question: '',
                  answer: '',
                  category: 'General',
                  language: 'en',
                  status: 'PUBLISHED',
                });
                setIsKbModalOpen(true);
              }}
              className="px-4 py-2 bg-adm-accent-fill hover:bg-adm-accent-hover text-adm-on-accent rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Knowledge Item</span>
            </button>
          </div>

          {/* Knowledge Items Table / Grid */}
          <div className="bg-adm-surface border border-adm-line rounded-2xl overflow-hidden shadow-xl">
            <div className="divide-y divide-adm-line">
              {kbItems.map((item) => (
                <div key={item.id} className="p-4 hover:bg-adm-surface transition-colors flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-adm-line text-adm-accent font-semibold">
                        {item.category}
                      </span>
                      <span className="text-[10px] font-mono uppercase text-adm-muted">
                        {item.language}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase ${
                          item.status === 'PUBLISHED'
                            ? 'bg-emerald-950/80 text-emerald-300'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {item.status}
                      </span>
                      {item.source === 'CANDIDATE_FROM_ADMIN' && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300">
                          Staff Candidate
                        </span>
                      )}
                    </div>
                    <h4 className="font-serif text-sm text-adm-text font-medium">{item.question}</h4>
                    <p className="text-xs text-adm-muted leading-relaxed">{item.answer}</p>
                  </div>

                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      onClick={() => {
                        setEditingKbItem(item);
                        setIsKbModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg hover:bg-adm-line text-adm-text-2 hover:text-adm-text transition-colors cursor-pointer"
                      title="Edit Item"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteKbItem(item.id)}
                      className="p-1.5 rounded-lg hover:bg-red-950/50 text-adm-muted hover:text-red-400 transition-colors cursor-pointer"
                      title="Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal for Create / Edit Knowledge Item */}
          {isKbModalOpen && editingKbItem && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-adm-surface border border-adm-line rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
                <h3 className="font-serif text-lg text-adm-text">
                  {editingKbItem.id ? 'Edit Knowledge Base Item' : 'New Knowledge Base Item'}
                </h3>

                <form onSubmit={handleSaveKbItem} className="space-y-4">
                  <div>
                    <label className="text-[11px] font-mono uppercase text-adm-muted block mb-1">
                      Question / Visitor Query
                    </label>
                    <input
                      type="text"
                      required
                      value={editingKbItem.question || ''}
                      onChange={(e) => setEditingKbItem({ ...editingKbItem, question: e.target.value })}
                      placeholder="e.g. Hello / Hi / Greetings"
                      className="w-full bg-adm-bg border border-adm-line rounded-xl px-3 py-2 text-xs text-adm-text focus:outline-none focus:border-adm-accent"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-mono uppercase text-adm-muted">
                        Authoritative Answer
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const current = editingKbItem.answer || '';
                          setEditingKbItem({
                            ...editingKbItem,
                            answer: current + (current ? ' ' : '') + '{name}',
                          });
                        }}
                        className="text-[10px] font-mono text-adm-accent hover:underline flex items-center gap-1 cursor-pointer"
                        title="Click to insert dynamic recent concierge name placeholder"
                      >
                        + Insert <span className="font-bold">{'{name}'}</span>
                      </button>
                    </div>
                    <textarea
                      required
                      rows={4}
                      value={editingKbItem.answer || ''}
                      onChange={(e) => setEditingKbItem({ ...editingKbItem, answer: e.target.value })}
                      placeholder="Provide precise answer. Use {name} to dynamically insert the recent active concierge name..."
                      className="w-full bg-adm-bg border border-adm-line rounded-xl px-3 py-2 text-xs text-adm-text focus:outline-none focus:border-adm-accent"
                    />
                    <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between text-[10px] text-adm-muted gap-1">
                      <span>💡 <strong>{'{name}'}</strong> automatically resolves to active concierge name.</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingKbItem({
                              ...editingKbItem,
                              question: 'Hello / Hi / Greetings',
                              answer: 'Hello and welcome to Zanzirangi House! My name is {name}, your private concierge. How may I assist your stay in Zanzibar today?',
                              category: 'Greetings',
                              language: 'en',
                            });
                          }}
                          className="hover:text-adm-accent transition-colors underline cursor-pointer"
                        >
                          Preset 1: Hello
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingKbItem({
                              ...editingKbItem,
                              question: 'Good morning / Good afternoon / Good evening',
                              answer: 'Jambo and warmest greetings! I am {name}, your personal concierge at Zanzirangi House. How may I be of service to you today?',
                              category: 'Greetings',
                              language: 'en',
                            });
                          }}
                          className="hover:text-adm-accent transition-colors underline cursor-pointer"
                        >
                          Preset 2: Jambo
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-mono uppercase text-adm-muted block mb-1">
                        Category
                      </label>
                      <select
                        value={editingKbItem.category || 'General'}
                        onChange={(e) => setEditingKbItem({ ...editingKbItem, category: e.target.value })}
                        className="w-full bg-adm-bg border border-adm-line rounded-xl px-3 py-2 text-xs text-adm-text focus:outline-none focus:border-adm-accent"
                      >
                        <option value="General">General</option>
                        <option value="Greetings">Greetings</option>
                        <option value="Check-in">Check-in</option>
                        <option value="Pricing">Pricing</option>
                        <option value="Villa">Villa</option>
                        <option value="Airport Transfer">Airport Transfer</option>
                        <option value="Safari">Safari</option>
                        <option value="Dining">Dining</option>
                        <option value="Wi-Fi">Wi-Fi</option>
                        <option value="Wellness">Wellness</option>
                        <option value="Family">Family</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-mono uppercase text-adm-muted block mb-1">
                        Status
                      </label>
                      <select
                        value={editingKbItem.status || 'PUBLISHED'}
                        onChange={(e) => setEditingKbItem({ ...editingKbItem, status: e.target.value as any })}
                        className="w-full bg-adm-bg border border-adm-line rounded-xl px-3 py-2 text-xs text-adm-text focus:outline-none focus:border-adm-accent"
                      >
                        <option value="PUBLISHED">Published</option>
                        <option value="DRAFT">Draft</option>
                        <option value="UNPUBLISHED">Unpublished</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-3 border-t border-adm-line">
                    <button
                      type="button"
                      onClick={() => setIsKbModalOpen(false)}
                      className="px-4 py-2 border border-adm-line hover:bg-adm-line rounded-xl text-xs text-adm-text-2 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-adm-accent-fill hover:bg-adm-accent-hover text-adm-on-accent font-bold rounded-xl text-xs cursor-pointer shadow"
                    >
                      Save Knowledge Item
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* VIEW 3: SUPPORT ANALYTICS                                     */}
      {/* ============================================================= */}
      {activeSubTab === 'analytics' && analytics && (
        <div className="space-y-6">
          {/* Key KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-adm-surface border border-adm-line p-4 rounded-2xl shadow">
              <span className="text-[10px] font-mono uppercase text-adm-muted block">Total Conversations</span>
              <span className="font-serif text-3xl text-adm-text mt-1 block font-light">
                {analytics.totalConversations}
              </span>
            </div>

            <div className="bg-adm-surface border border-adm-line p-4 rounded-2xl shadow">
              <span className="text-[10px] font-mono uppercase text-adm-muted block">AI Resolution Rate</span>
              <span className="font-serif text-3xl text-emerald-400 mt-1 block font-light">
                {analytics.aiResolutionRate}%
              </span>
            </div>

            <div className="bg-adm-surface border border-adm-line p-4 rounded-2xl shadow">
              <span className="text-[10px] font-mono uppercase text-adm-muted block">Human Assisted</span>
              <span className="font-serif text-3xl text-adm-accent mt-1 block font-light">
                {analytics.humanAssisted}
              </span>
            </div>

            <div className="bg-adm-surface border border-adm-line p-4 rounded-2xl shadow">
              <span className="text-[10px] font-mono uppercase text-adm-muted block">Avg AI Speed</span>
              <span className="font-serif text-3xl text-adm-text mt-1 block font-light">
                {analytics.avgAiResponseTimeSec}s
              </span>
            </div>
          </div>

          {/* Top Question Categories Breakdown */}
          <div className="bg-adm-surface border border-adm-line rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="font-serif text-base text-adm-text">
              Top Inquired Topics & Categories
            </h3>

            <div className="space-y-3">
              {analytics.categories.map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-adm-text-2">{cat.category}</span>
                    <span className="text-adm-accent font-bold">
                      {cat.count} inquiries ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-adm-bg rounded-full overflow-hidden border border-adm-line">
                    <div
                      className="h-full bg-gradient-to-r from-adm-accent-fill to-adm-accent rounded-full"
                      style={{ width: `${Math.max(cat.percentage, 4)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* VIEW 4: CUSTOMER SUPPORT AVATAR & WIDGET PROFILE              */}
      {/* ============================================================= */}
      {activeSubTab === 'profile' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-adm-surface border border-adm-line rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-adm-line gap-3">
              <div>
                <h2 className="font-serif text-xl text-adm-text">
                  Customer Support Profile & Avatar
                </h2>
                <p className="text-xs text-adm-muted mt-0.5">
                  Customize the floating concierge avatar, agent name, and active badge displayed on the website.
                </p>
              </div>

              {profileMessage && (
                <div
                  className={`text-xs font-mono px-3 py-1.5 rounded-lg flex items-center space-x-1.5 ${
                    profileMessage.startsWith('✓')
                      ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60'
                      : 'bg-red-950/70 text-red-300 border border-red-800/60'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{profileMessage}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Left Column: Avatar & 1:1 Cropper Trigger */}
              <div className="md:col-span-5 flex flex-col items-center p-6 bg-adm-panel rounded-2xl border border-adm-line space-y-4 text-center">
                <span className="text-[11px] font-mono uppercase tracking-wider text-adm-text-2">
                  Live Avatar Preview
                </span>

                {/* Glowing Circle Avatar with Golden Ring */}
                <div className="relative">
                  <div className="w-28 h-28 rounded-full overflow-hidden p-1 bg-gradient-to-tr from-[#B8966C] via-[#C4A27A] to-[#FAF8F5] shadow-2xl">
                    <div className="w-full h-full rounded-full overflow-hidden bg-[#141413]">
                      <img
                        src={supportAvatar}
                        alt={supportName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Active pulsing radar indicator */}
                  <span className="absolute top-1 right-1 flex h-6 w-6">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                    <span className="relative inline-flex rounded-full h-6 w-6 bg-emerald-500 border-2 border-[#141413] shadow-[0_0_8px_#10b981]" />
                  </span>
                </div>

                <div className="space-y-2 w-full pt-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png,image/jpeg,image/webp,image/avif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedCropFile(file);
                        setIsCropperOpen(true);
                      }
                      e.target.value = '';
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 px-4 bg-adm-accent-fill hover:bg-adm-accent-hover text-adm-on-accent text-xs font-mono font-bold uppercase tracking-wider rounded-xl shadow flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Upload Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSupportAvatar(
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'
                      );
                    }}
                    className="w-full py-1.5 text-[11px] font-mono text-adm-muted hover:text-adm-text hover:bg-adm-bg rounded-lg transition-colors cursor-pointer"
                  >
                    Restore Default Juma Photo
                  </button>
                </div>
              </div>

              {/* Right Column: Name, Title & Status Settings */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1.5">
                    Concierge / Agent Name
                  </label>
                  <input
                    type="text"
                    value={supportName}
                    onChange={(e) => setSupportName(e.target.value)}
                    placeholder="e.g. Juma"
                    className="w-full px-3.5 py-2.5 bg-adm-bg border border-adm-line rounded-xl text-xs font-mono text-adm-text focus:outline-none focus:border-adm-accent"
                  />
                  <span className="text-[10px] text-adm-muted mt-1 block">
                    Displayed on mobile widget pill and greeting message.
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1.5">
                    Widget Badge Title
                  </label>
                  <input
                    type="text"
                    value={supportTitle}
                    onChange={(e) => setSupportTitle(e.target.value)}
                    placeholder="e.g. Customer Support"
                    className="w-full px-3.5 py-2.5 bg-adm-bg border border-adm-line rounded-xl text-xs font-mono text-adm-text focus:outline-none focus:border-adm-accent"
                  />
                  <span className="text-[10px] text-adm-muted mt-1 block">
                    Main title displayed on desktop floating pill and chat window top bar.
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-adm-text-2 mb-1.5">
                    Active Availability Subtitle
                  </label>
                  <input
                    type="text"
                    value={supportStatus}
                    onChange={(e) => setSupportStatus(e.target.value)}
                    placeholder="e.g. Active 24/7 or Online • Juma"
                    className="w-full px-3.5 py-2.5 bg-adm-bg border border-adm-line rounded-xl text-xs font-mono text-adm-text focus:outline-none focus:border-adm-accent"
                  />
                  <span className="text-[10px] text-adm-muted mt-1 block">
                    Subtitle beside the pulsing green dot indicating live concierge presence.
                  </span>
                </div>

                <div className="pt-4 border-t border-adm-line flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => handleSaveProfile()}
                    disabled={profileSaving}
                    className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-adm-accent-fill hover:bg-adm-accent-hover text-adm-on-accent text-xs font-mono uppercase tracking-widest font-bold shadow-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    {profileSaving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Save Support Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1:1 Image Cropper Modal */}
      <ImageCropperModal
        isOpen={isCropperOpen}
        onClose={() => setIsCropperOpen(false)}
        imageFile={selectedCropFile}
        initialImageUrl={supportAvatar}
        supportName={supportName}
        supportTitle={supportTitle}
        supportStatus={supportStatus}
        onCroppedAndUploaded={(url) => {
          setSupportAvatar(url);
          // Auto save immediately so the admin does not need to click twice
          contentApi.updateSettings({
            supportAvatar: url,
            supportName,
            supportTitle,
            supportStatus,
          }).then(() => {
            setProfileMessage('✓ Avatar cropped, uploaded, and saved successfully!');
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem(
                  'zanzirangi_support_profile',
                  JSON.stringify({ supportAvatar: url, supportName, supportTitle, supportStatus })
                );
              } catch {}
              window.dispatchEvent(
                new CustomEvent('zanzirangi-support-profile-updated', {
                  detail: { supportAvatar: url, supportName, supportTitle, supportStatus },
                })
              );
            }
            setTimeout(() => setProfileMessage(null), 4000);
          }).catch((err) => {
            setProfileMessage(`Error: ${err?.message || 'Failed to save avatar'}`);
          });
        }}
      />
    </div>
  );
};
