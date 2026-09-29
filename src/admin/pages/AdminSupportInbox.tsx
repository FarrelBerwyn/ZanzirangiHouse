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
} from 'lucide-react';
import { supportApi } from '../../services/supportApi';
import {
  SupportConversationRecord,
  SupportMessageRecord,
  SupportKnowledgeRecord,
  SupportAiEventRecord,
  SupportAnalyticsSummary,
  SupportConversationStatus,
} from '../../../server/database/supportTypes';

export const AdminSupportInbox: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'inbox' | 'knowledge' | 'analytics'>('inbox');

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

  // -------------------------------------------------------------
  // Data Loaders
  // -------------------------------------------------------------
  const loadConversations = async (autoSelect = false) => {
    try {
      const res = await supportApi.adminGetConversations({
        status: filterStatus === 'ALL' ? undefined : filterStatus,
        search: searchQuery || undefined,
      });
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
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#22211F] border border-[#3C3B38] text-[#8C8880] flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Resolved</span>
          </span>
        );
      case 'CLOSED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#181716] border border-[#2C2B28] text-[#6B6862]">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#2C2B28] gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#C4A27A]">
              CONCIERGE & SUPPORT
            </span>
            {counts.waiting > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500 text-[#141413] font-bold animate-bounce">
                {counts.waiting} Waiting
              </span>
            )}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#FAF8F5] tracking-wide mt-1">
            Customer Support Platform
          </h1>
          <p className="text-xs text-[#8E8B85] mt-0.5">
            Unified AI Concierge + Human Support Inbox with booking context and live knowledge base.
          </p>
        </div>

        {/* Sub-Tabs: Inbox | Knowledge Base | Analytics */}
        <div className="flex items-center bg-[#1C1B1A] border border-[#2C2B28] p-1 rounded-xl space-x-1">
          <button
            onClick={() => setActiveSubTab('inbox')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
              activeSubTab === 'inbox'
                ? 'bg-[#B8966C] text-[#141413] shadow'
                : 'text-[#D8CCB8] hover:text-[#FAF8F5]'
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
                ? 'bg-[#B8966C] text-[#141413] shadow'
                : 'text-[#D8CCB8] hover:text-[#FAF8F5]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Knowledge Base</span>
          </button>

          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
              activeSubTab === 'analytics'
                ? 'bg-[#B8966C] text-[#141413] shadow'
                : 'text-[#D8CCB8] hover:text-[#FAF8F5]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>
        </div>
      </div>

      {/* ============================================================= */}
      {/* VIEW 1: SUPPORT INBOX (3-COLUMN LAYOUT)                       */}
      {/* ============================================================= */}
      {activeSubTab === 'inbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-230px)] min-h-[640px]">
          {/* ---------------- LEFT PANEL: Conversation List (3.5 cols) ---------------- */}
          <div className="lg:col-span-4 xl:col-span-3 bg-[#1C1B1A] border border-[#2C2B28] rounded-2xl flex flex-col overflow-hidden shadow-xl">
            {/* Filter Tabs & Search */}
            <div className="p-3.5 border-b border-[#2C2B28] space-y-3 bg-[#171615]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#8C8880] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search guests, email, villa..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    loadConversations();
                  }}
                  className="w-full bg-[#141413] border border-[#2C2B28] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#FAF8F5] placeholder-[#8C8880] focus:outline-none focus:border-[#C4A27A]"
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
                        ? 'bg-[#B8966C] text-[#141413] font-bold shadow'
                        : 'bg-[#141413] text-[#A09C94] hover:text-[#FAF8F5]'
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className="text-[10px] opacity-75 font-mono">({f.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation Items List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#242321]">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-[#8C8880] text-xs">
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
                          ? 'bg-[#22211F] border-l-4 border-l-[#C4A27A]'
                          : 'hover:bg-[#1F1E1D]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-xs text-[#FAF8F5] truncate max-w-[130px]">
                            {c.metadata?.fullName || `Visitor ${c.visitor_id.substring(4, 9)}`}
                          </span>
                          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-[#2C2B28] text-[#C4A27A] font-mono">
                            {c.language}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#8C8880] font-mono">{time}</span>
                      </div>

                      <p className="text-xs text-[#A09C94] line-clamp-1 mb-2">
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
          <div className="lg:col-span-5 xl:col-span-6 bg-[#1C1B1A] border border-[#2C2B28] rounded-2xl flex flex-col overflow-hidden shadow-xl">
            {selectedConv ? (
              <>
                {/* Thread Header with Take Over & Return to AI Controls */}
                <div className="px-5 py-3.5 bg-[#171615] border-b border-[#2C2B28] flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-[#2C2B28] border border-[#C4A27A]/50 flex items-center justify-center text-[#C4A27A]">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-xs sm:text-sm text-[#FAF8F5]">
                          {selectedConv.metadata?.fullName || `Visitor (${selectedConv.visitor_id})`}
                        </h3>
                        {getStatusBadge(selectedConv.status)}
                      </div>
                      <span className="text-[10px] text-[#8C8880] font-mono">
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
                        className="px-3 py-1.5 bg-[#2C2B28] hover:bg-[#3C3B38] text-[#FAF8F5] rounded-lg text-xs font-medium flex items-center space-x-1 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Resolve</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange('HUMAN_ACTIVE')}
                        className="px-3 py-1.5 bg-[#2C2B28] hover:bg-[#3C3B38] text-[#D8CCB8] rounded-lg text-xs font-medium cursor-pointer"
                      >
                        Re-open
                      </button>
                    )}
                  </div>
                </div>

                {/* Message Bubbles Container */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0F0E0E]/90 text-xs">
                  {messages.map((m) => {
                    const time = new Date(m.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    if (m.sender_type === 'SYSTEM') {
                      return (
                        <div key={m.id} className="text-center py-1">
                          <span className="text-[10px] font-mono text-[#8C8880] bg-[#1C1B1A] border border-[#2C2B28] px-3 py-1 rounded-full inline-block">
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
                              ? 'bg-[#22211F] text-[#FAF8F5] border border-[#2C2B28] rounded-tl-none'
                              : isAdmin
                              ? 'bg-[#B8966C] text-[#141413] font-medium rounded-tr-none'
                              : 'bg-[#181716] text-[#D8CCB8] border border-[#2C2B28] rounded-tr-none'
                          }`}
                        >
                          <div className="flex items-center space-x-1.5 mb-1 opacity-75 text-[10px] font-mono">
                            {isVisitor && <span>Visitor</span>}
                            {isAi && (
                              <span className="flex items-center space-x-1 text-[#C4A27A]">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>Juma AI</span>
                              </span>
                            )}
                            {isAdmin && (
                              <span className="flex items-center space-x-1 text-[#141413] font-bold">
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

                        <span className="text-[9px] text-[#6B6862] mt-1 px-1 font-mono">{time}</span>
                      </div>
                    );
                  })}
                  <div ref={threadEndRef} />
                </div>

                {/* AI Suggested Reply Banner (Appears when HUMAN_ACTIVE or WAITING_HUMAN) */}
                {suggestedReply && (
                  <div className="p-3 bg-gradient-to-r from-[#1E1B18] via-[#24211D] to-[#1E1B18] border-t border-[#C4A27A]/40 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-1.5 text-[#C4A27A]">
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
                          className="px-2.5 py-1 bg-[#2C2B28] hover:bg-[#3C3B38] text-[#D8CCB8] text-[11px] font-mono rounded flex items-center space-x-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleSendMessage(undefined, suggestedReply)}
                          className="px-3 py-1 bg-[#B8966C] hover:bg-[#C4A27A] text-[#141413] text-[11px] font-bold rounded flex items-center space-x-1 cursor-pointer shadow"
                        >
                          <Check className="w-3 h-3" />
                          <span>Use Reply</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-[#FAF8F5]/90 italic bg-[#141413]/60 p-2 rounded-lg border border-[#2C2B28]">
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
                              className="text-[#8C8880] hover:text-white text-[11px] cursor-pointer"
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
                    <p className="text-[11px] text-[#A09C94] mt-1 truncate">
                      Q: {knowledgeCandidatePrompt.question}
                    </p>
                  </div>
                )}

                {/* Reply Input Bar with Contextual Quick Link Attachments */}
                <form onSubmit={handleSendMessage} className="p-3 bg-[#171615] border-t border-[#2C2B28] space-y-2">
                  {/* Contextual Link Buttons */}
                  <div className="flex items-center space-x-1.5 text-[10px] font-mono text-[#8C8880] overflow-x-auto no-scrollbar">
                    <span className="flex items-center space-x-1 flex-shrink-0">
                      <LinkIcon className="w-3 h-3 text-[#C4A27A]" />
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
                        className="px-2 py-0.5 bg-[#1C1B1A] hover:bg-[#2C2B28] border border-[#2C2B28] rounded text-[#D8CCB8] hover:text-white transition-colors flex-shrink-0 cursor-pointer"
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
                      className="flex-1 bg-[#141413] border border-[#2C2B28] rounded-xl px-3.5 py-2.5 text-xs text-[#FAF8F5] placeholder-[#8C8880] focus:outline-none focus:border-[#C4A27A]"
                    />
                    <button
                      type="submit"
                      disabled={!replyText.trim() || isSending}
                      className="px-4 py-2.5 bg-[#B8966C] hover:bg-[#C4A27A] disabled:opacity-40 disabled:cursor-not-allowed text-[#141413] font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-[#8C8880] text-xs">
                Select a conversation from the left to view messages and reply.
              </div>
            )}
          </div>

          {/* ---------------- RIGHT PANEL: Visitor & Booking Context (3.5 cols) ---------------- */}
          <div className="lg:col-span-3 xl:col-span-3 space-y-4 overflow-y-auto">
            {selectedConv ? (
              <>
                {/* Visitor Profile Card */}
                <div className="bg-[#1C1B1A] border border-[#2C2B28] rounded-2xl p-4 space-y-3 shadow-xl text-xs">
                  <div className="flex items-center space-x-2 pb-2 border-b border-[#2C2B28]">
                    <User className="w-4 h-4 text-[#C4A27A]" />
                    <h3 className="font-semibold text-xs uppercase tracking-wider text-[#FAF8F5] font-mono">
                      Visitor Context
                    </h3>
                  </div>

                  <div className="space-y-1.5 font-mono text-[11px] text-[#A09C94]">
                    <p>
                      <strong className="text-[#FAF8F5]">Visitor ID:</strong> {selectedConv.visitor_id}
                    </p>
                    <p>
                      <strong className="text-[#FAF8F5]">Language:</strong> {selectedConv.language.toUpperCase()}
                    </p>
                    <p>
                      <strong className="text-[#FAF8F5]">Current Page:</strong> {selectedConv.current_page}
                    </p>
                    <p>
                      <strong className="text-[#FAF8F5]">Started:</strong>{' '}
                      {new Date(selectedConv.created_at).toLocaleString([], {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </p>
                    <p>
                      <strong className="text-[#FAF8F5]">Status:</strong> {selectedConv.status}
                    </p>
                    {selectedConv.assigned_admin_id && (
                      <p>
                        <strong className="text-[#FAF8F5]">Assigned:</strong> {selectedConv.assigned_admin_id}
                      </p>
                    )}
                  </div>
                </div>

                {/* Booking Context Card (if attached) */}
                {selectedConv.metadata && (selectedConv.metadata.villaName || selectedConv.metadata.checkIn) && (
                  <div className="bg-gradient-to-br from-[#1C1B1A] to-[#24211D] border border-[#C4A27A]/50 rounded-2xl p-4 space-y-3 shadow-xl text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-[#2C2B28]">
                      <div className="flex items-center space-x-2">
                        <Home className="w-4 h-4 text-[#C4A27A]" />
                        <h3 className="font-semibold text-xs uppercase tracking-wider text-[#FAF8F5] font-mono">
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
                          <span className="text-[#8C8880] block text-[10px]">VILLA:</span>
                          <span className="text-[#FAF8F5] font-semibold">{selectedConv.metadata.villaName}</span>
                        </div>
                      )}

                      {(selectedConv.metadata.checkIn || selectedConv.metadata.checkOut) && (
                        <div className="flex items-center space-x-3">
                          <div>
                            <span className="text-[#8C8880] block text-[10px]">CHECK-IN:</span>
                            <span className="text-[#FAF8F5]">{selectedConv.metadata.checkIn}</span>
                          </div>
                          <div>
                            <span className="text-[#8C8880] block text-[10px]">CHECK-OUT:</span>
                            <span className="text-[#FAF8F5]">{selectedConv.metadata.checkOut}</span>
                          </div>
                        </div>
                      )}

                      {selectedConv.metadata.guests && (
                        <div>
                          <span className="text-[#8C8880] block text-[10px]">GUESTS:</span>
                          <span className="text-[#FAF8F5]">{selectedConv.metadata.guests} Guests</span>
                        </div>
                      )}

                      {selectedConv.metadata.fullName && (
                        <div>
                          <span className="text-[#8C8880] block text-[10px]">CONTACT NAME:</span>
                          <span className="text-[#FAF8F5]">{selectedConv.metadata.fullName}</span>
                        </div>
                      )}

                      {selectedConv.metadata.email && (
                        <div>
                          <span className="text-[#8C8880] block text-[10px]">EMAIL:</span>
                          <span className="text-[#C4A27A]">{selectedConv.metadata.email}</span>
                        </div>
                      )}

                      {selectedConv.metadata.phone && (
                        <div>
                          <span className="text-[#8C8880] block text-[10px]">PHONE:</span>
                          <span className="text-[#FAF8F5]">{selectedConv.metadata.phone}</span>
                        </div>
                      )}

                      {selectedConv.metadata.specialRequests && (
                        <div>
                          <span className="text-[#8C8880] block text-[10px]">SPECIAL REQUESTS:</span>
                          <p className="text-[#D8CCB8] italic bg-[#141413]/70 p-2 rounded border border-[#2C2B28]">
                            "{selectedConv.metadata.specialRequests}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* AI Decision Audit Trail */}
                <div className="bg-[#1C1B1A] border border-[#2C2B28] rounded-2xl p-4 space-y-3 shadow-xl text-xs">
                  <div className="flex items-center space-x-2 pb-2 border-b border-[#2C2B28]">
                    <Sparkles className="w-4 h-4 text-[#C4A27A]" />
                    <h3 className="font-semibold text-xs uppercase tracking-wider text-[#FAF8F5] font-mono">
                      AI Audit Trail ({aiEvents.length})
                    </h3>
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto font-mono text-[10px]">
                    {aiEvents.length === 0 ? (
                      <p className="text-[#8C8880] italic">No AI decision events logged.</p>
                    ) : (
                      aiEvents.map((e) => (
                        <div key={e.id} className="p-2 bg-[#141413] rounded-lg border border-[#2C2B28] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[#C4A27A] font-bold">{e.intent}</span>
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
                          <div className="flex items-center justify-between text-[#8C8880]">
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
              <div className="bg-[#1C1B1A] border border-[#2C2B28] rounded-2xl p-6 text-center text-[#8C8880] text-xs">
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
                className="bg-[#1C1B1A] border border-[#2C2B28] rounded-xl px-3.5 py-2 text-xs text-[#FAF8F5] placeholder-[#8C8880] focus:outline-none focus:border-[#C4A27A] w-64"
              />

              {/* Category Filter */}
              <select
                value={kbCategoryFilter}
                onChange={(e) => setKbCategoryFilter(e.target.value)}
                className="bg-[#1C1B1A] border border-[#2C2B28] rounded-xl px-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C4A27A]"
              >
                <option value="ALL">All Categories</option>
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
              className="px-4 py-2 bg-[#B8966C] hover:bg-[#C4A27A] text-[#141413] rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Knowledge Item</span>
            </button>
          </div>

          {/* Knowledge Items Table / Grid */}
          <div className="bg-[#1C1B1A] border border-[#2C2B28] rounded-2xl overflow-hidden shadow-xl">
            <div className="divide-y divide-[#2C2B28]">
              {kbItems.map((item) => (
                <div key={item.id} className="p-4 hover:bg-[#201F1E] transition-colors flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#2C2B28] text-[#C4A27A] font-semibold">
                        {item.category}
                      </span>
                      <span className="text-[10px] font-mono uppercase text-[#8C8880]">
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
                    <h4 className="font-serif text-sm text-[#FAF8F5] font-medium">{item.question}</h4>
                    <p className="text-xs text-[#A09C94] leading-relaxed">{item.answer}</p>
                  </div>

                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      onClick={() => {
                        setEditingKbItem(item);
                        setIsKbModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg hover:bg-[#2C2B28] text-[#D8CCB8] hover:text-white transition-colors cursor-pointer"
                      title="Edit Item"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteKbItem(item.id)}
                      className="p-1.5 rounded-lg hover:bg-red-950/50 text-[#8C8880] hover:text-red-400 transition-colors cursor-pointer"
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
              <div className="bg-[#1C1B1A] border border-[#2C2B28] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
                <h3 className="font-serif text-lg text-[#FAF8F5]">
                  {editingKbItem.id ? 'Edit Knowledge Base Item' : 'New Knowledge Base Item'}
                </h3>

                <form onSubmit={handleSaveKbItem} className="space-y-4">
                  <div>
                    <label className="text-[11px] font-mono uppercase text-[#A09C94] block mb-1">
                      Question / Visitor Query
                    </label>
                    <input
                      type="text"
                      required
                      value={editingKbItem.question || ''}
                      onChange={(e) => setEditingKbItem({ ...editingKbItem, question: e.target.value })}
                      placeholder="e.g. Can we arrange airport pickup at 11 PM?"
                      className="w-full bg-[#141413] border border-[#2C2B28] rounded-xl px-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C4A27A]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase text-[#A09C94] block mb-1">
                      Authoritative Answer
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={editingKbItem.answer || ''}
                      onChange={(e) => setEditingKbItem({ ...editingKbItem, answer: e.target.value })}
                      placeholder="Provide precise, authoritative answer for Juma AI to utilize..."
                      className="w-full bg-[#141413] border border-[#2C2B28] rounded-xl px-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C4A27A]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-mono uppercase text-[#A09C94] block mb-1">
                        Category
                      </label>
                      <select
                        value={editingKbItem.category || 'General'}
                        onChange={(e) => setEditingKbItem({ ...editingKbItem, category: e.target.value })}
                        className="w-full bg-[#141413] border border-[#2C2B28] rounded-xl px-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C4A27A]"
                      >
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
                      <label className="text-[11px] font-mono uppercase text-[#A09C94] block mb-1">
                        Status
                      </label>
                      <select
                        value={editingKbItem.status || 'PUBLISHED'}
                        onChange={(e) => setEditingKbItem({ ...editingKbItem, status: e.target.value as any })}
                        className="w-full bg-[#141413] border border-[#2C2B28] rounded-xl px-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#C4A27A]"
                      >
                        <option value="PUBLISHED">Published</option>
                        <option value="DRAFT">Draft</option>
                        <option value="UNPUBLISHED">Unpublished</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#2C2B28]">
                    <button
                      type="button"
                      onClick={() => setIsKbModalOpen(false)}
                      className="px-4 py-2 border border-[#2C2B28] hover:bg-[#2C2B28] rounded-xl text-xs text-[#D8CCB8] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#B8966C] hover:bg-[#C4A27A] text-[#141413] font-bold rounded-xl text-xs cursor-pointer shadow"
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
            <div className="bg-[#1C1B1A] border border-[#2C2B28] p-4 rounded-2xl shadow">
              <span className="text-[10px] font-mono uppercase text-[#8C8880] block">Total Conversations</span>
              <span className="font-serif text-3xl text-[#FAF8F5] mt-1 block font-light">
                {analytics.totalConversations}
              </span>
            </div>

            <div className="bg-[#1C1B1A] border border-[#2C2B28] p-4 rounded-2xl shadow">
              <span className="text-[10px] font-mono uppercase text-[#8C8880] block">AI Resolution Rate</span>
              <span className="font-serif text-3xl text-emerald-400 mt-1 block font-light">
                {analytics.aiResolutionRate}%
              </span>
            </div>

            <div className="bg-[#1C1B1A] border border-[#2C2B28] p-4 rounded-2xl shadow">
              <span className="text-[10px] font-mono uppercase text-[#8C8880] block">Human Assisted</span>
              <span className="font-serif text-3xl text-[#C4A27A] mt-1 block font-light">
                {analytics.humanAssisted}
              </span>
            </div>

            <div className="bg-[#1C1B1A] border border-[#2C2B28] p-4 rounded-2xl shadow">
              <span className="text-[10px] font-mono uppercase text-[#8C8880] block">Avg AI Speed</span>
              <span className="font-serif text-3xl text-[#FAF8F5] mt-1 block font-light">
                {analytics.avgAiResponseTimeSec}s
              </span>
            </div>
          </div>

          {/* Top Question Categories Breakdown */}
          <div className="bg-[#1C1B1A] border border-[#2C2B28] rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="font-serif text-base text-[#FAF8F5]">
              Top Inquired Topics & Categories
            </h3>

            <div className="space-y-3">
              {analytics.categories.map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#D8CCB8]">{cat.category}</span>
                    <span className="text-[#C4A27A] font-bold">
                      {cat.count} inquiries ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#141413] rounded-full overflow-hidden border border-[#2C2B28]">
                    <div
                      className="h-full bg-gradient-to-r from-[#B8966C] to-[#C4A27A] rounded-full"
                      style={{ width: `${Math.max(cat.percentage, 4)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
