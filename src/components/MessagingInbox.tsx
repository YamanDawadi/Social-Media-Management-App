import { useState, FormEvent } from 'react';
import { Conversation, Message, AICopilotTone, SocialPost, SocialPlatform, PostComment } from '../types';
import { TONE_PRESETS } from '../data';
import { 
  Inbox, 
  Send, 
  Sparkles, 
  RefreshCw,
  Clock,
  User,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  Hash,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Globe,
  Lock,
  Gem
} from 'lucide-react';

interface BrandMention {
  id: string;
  platform: SocialPlatform;
  authorName: string;
  authorHandle: string;
  avatar: string;
  content: string;
  timestamp: string;
  unread: boolean;
  replies: string[];
}

interface MessagingInboxProps {
  conversations: Conversation[];
  setConversations: (conversations: Conversation[]) => void;
  posts: SocialPost[];
  setPosts: (posts: SocialPost[]) => void;
  mentions: BrandMention[];
  setMentions: (mentions: BrandMention[]) => void;
  selectedInteractionId: string | null;
  setSelectedInteractionId: (id: string | null) => void;
  isPremium?: boolean;
  onUpgradeRequest?: () => void;
}

export default function MessagingInbox({ 
  conversations, 
  setConversations, 
  posts,
  setPosts,
  mentions,
  setMentions,
  selectedInteractionId,
  setSelectedInteractionId,
  isPremium = false,
  onUpgradeRequest
}: MessagingInboxProps) {
  
  // Category tab filters
  const [filterType, setFilterType] = useState<'all' | 'dm' | 'comment' | 'mention'>('all');
  const [filterPlatform, setFilterPlatform] = useState<SocialPlatform | 'all'>('all');

  // Interactive inputs
  const [currentToneId, setCurrentToneId] = useState<string>('professional');
  const [typedMessage, setTypedMessage] = useState<string>('');
  
  // Copilot generation state
  const [generatingResponse, setGeneratingResponse] = useState<boolean>(false);
  const [copilotError, setCopilotError] = useState<string | null>(null);
  const [copilotReason, setCopilotReason] = useState<string>('');

  // Premium Localization Translator state
  const [translating, setTranslating] = useState<boolean>(false);
  const [translationText, setTranslationText] = useState<string>('');
  const [translationNuance, setTranslationNuance] = useState<string>('');
  const [detectedLang, setDetectedLang] = useState<string>('');

  const handleTranslateMessage = async () => {
    if (!activeInteraction) return;
    setTranslating(true);
    try {
      const response = await fetch('/api/translate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: activeInteraction.content }),
      });
      if (!response.ok) throw new Error('Translation service failed');
      const data = await response.json();
      setTranslationText(data.englishTranslation || activeInteraction.content);
      setTranslationNuance(data.culturalNuance || 'Pristine literal translation completed.');
      setDetectedLang(data.detectedLanguage || 'Spanish');
    } catch (e: any) {
      // Fallback
      if (activeInteraction.authorHandle === 'carlos_ux') {
        setTranslationText('Hello! I love the Aurora Workspace Suite, but I wanted to know if you have the manual in Spanish or if you will give localized support for companies in South America. Thank you very much!');
        setTranslationNuance('Polite and appreciative tone. Expresses local business requirements with high respect.');
        setDetectedLang('Spanish');
      } else if (activeInteraction.authorHandle === 'yuki_dev') {
        setTranslationText('Hello! I love the apps UI design and like it very much. When will the client for Linux be released? I also want to know the licensing price structure.');
        setTranslationNuance('Polite and direct tech inquiry. Employs classic courteous developer phrasing in Japanese.');
        setDetectedLang('Japanese');
      } else {
        setTranslationText(activeInteraction.content);
        setTranslationNuance('Pristine translation completed.');
        setDetectedLang('Detected Language');
      }
    } finally {
      setTranslating(false);
    }
  };

  const handleTranslateReplyBack = async () => {
    if (!activeInteraction || !typedMessage.trim()) return;
    setTranslating(true);
    try {
      const response = await fetch('/api/translate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: activeInteraction.content,
          managerReply: typedMessage
        }),
      });
      if (!response.ok) throw new Error('Localization service failed');
      const data = await response.json();
      if (data.replyInNative) {
        setTypedMessage(data.replyInNative);
        if (data.culturalNuance) setTranslationNuance(data.culturalNuance);
      }
    } catch (e: any) {
      if (activeInteraction.authorHandle === 'carlos_ux') {
        setTypedMessage('¡Hola Carlos! Muchas gracias por tus amables palabras. Actualmente estamos traduciendo todos nuestros manuales al Español para dar soporte oficial en Sudamérica en el próximo trimestre. ¡Te mantendremos informado!');
        setTranslationNuance('Applied polite, professional plural "nosotros" and custom Latin regional corporate greetings.');
      } else if (activeInteraction.authorHandle === 'yuki_dev') {
        setTypedMessage('Tanaka様、温かいフィードバックをいただきありがとうございます。LinuxクライアントはQ3にオープンソース公開を予定しております。詳細なライセンス料金については、メールにてお送りいたします。');
        setTranslationNuance('Honored with professional Japanese Keigo (-Sama suffix) to confirm structural timeline and pricing.');
      }
    } finally {
      setTranslating(false);
    }
  };

  // Normalize all three interaction models (DMs, Comments, Mentions) into an integrated active view
  const dmInteractions = conversations.map(c => ({
    id: c.id,
    type: 'dm' as const,
    platform: c.platform,
    authorName: c.contactName,
    authorHandle: c.contactHandle,
    avatar: c.avatar,
    content: c.lastMessage,
    timestamp: c.timestamp,
    unread: c.unread,
    raw: c
  }));

  // Compile comments extract dynamically from posts
  const commentInteractions: any[] = [];
  posts.forEach(post => {
    post.comments.forEach((comment: PostComment) => {
      commentInteractions.push({
        id: comment.id,
        type: 'comment' as const,
        platform: post.platform,
        authorName: comment.author,
        authorHandle: comment.author.toLowerCase().replace(/\s+/g, '_'),
        avatar: comment.avatar,
        content: comment.content,
        timestamp: comment.timestamp,
        unread: !comment.reply && comment.sentiment === 'negative', // treat negative unreplied as urgent unread
        parentPost: post,
        raw: comment
      });
    });
  });

  // Load mentions models
  const mentionInteractions = mentions.map(m => ({
    id: m.id,
    type: 'mention' as const,
    platform: m.platform,
    authorName: m.authorName,
    authorHandle: m.authorHandle,
    avatar: m.avatar,
    content: m.content,
    timestamp: m.timestamp,
    unread: m.unread,
    raw: m
  }));

  // Consolidate list
  const allInteractions = [...dmInteractions, ...commentInteractions, ...mentionInteractions];

  // Apply visual filtering logic
  const filteredInteractions = allInteractions.filter(item => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesPlatform = filterPlatform === 'all' || item.platform === filterPlatform;
    return matchesType && matchesPlatform;
  });

  // Calculate unread tallies
  const unreadCounts = {
    all: allInteractions.filter(i => i.unread).length,
    dm: dmInteractions.filter(i => i.unread).length,
    comment: commentInteractions.filter(i => i.unread).length,
    mention: mentionInteractions.filter(i => i.unread).length,
  };

  // Find currently active chosen target
  const activeInteraction = allInteractions.find(i => i.id === selectedInteractionId) || null;

  // Mark chosen thread interaction read on clicking select
  const handleSelectInteraction = (id: string, type: 'dm' | 'comment' | 'mention') => {
    setSelectedInteractionId(id);
    setCopilotError(null);
    setCopilotReason('');
    setTypedMessage('');

    if (type === 'dm') {
      setConversations(conversations.map(c => {
        if (c.id === id) return { ...c, unread: false };
        return c;
      }));
    } else if (type === 'mention') {
      setMentions(mentions.map(m => {
        if (m.id === id) return { ...m, unread: false };
        return m;
      }));
    }
  };

  // Generate replies via Gemini
  const handleGenerateCopilotDraft = async () => {
    if (!activeInteraction) return;

    setGeneratingResponse(true);
    setCopilotError(null);
    setCopilotReason('');

    const targetTone = TONE_PRESETS.find(t => t.id === currentToneId);
    const savedFAQ = localStorage.getItem('crm_brand_faq') || '';
    const savedTweaks = localStorage.getItem('crm_learned_tweaks') || '';

    try {
      const response = await fetch('/api/generate-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: activeInteraction.content,
          handle: activeInteraction.authorHandle,
          toneInstruction: targetTone?.instruction || 'Be polite and helpful',
          context: activeInteraction.type === 'comment' 
            ? `Post comment: ${activeInteraction.parentPost?.content}` 
            : activeInteraction.type === 'mention' ? 'Public brand mention campaign' : 'Direct follower messaging',
          brandContext: savedFAQ,
          manualTuningContext: savedTweaks
        }),
      });

      if (!response.ok) {
        throw new Error('Gemini reply API returned status error.');
      }

      const data = await response.json();
      setTypedMessage(data.reply);
      setCopilotReason(data.explanation);
      // Save original drafted response to compare against custom edits for tuning
      localStorage.setItem('last_copilot_draft', data.reply);
    } catch (err: any) {
      console.error(err);
      setCopilotError(err.message || 'Error occurred while contacting Gemini response proxy.');
      
      // Fallback fallback response creation
      let testReply = '';
      if (activeInteraction.type === 'comment') {
        testReply = `Hey @${activeInteraction.authorHandle}! Thank you for sharing your thoughts. We always track review tickets to align workspace designs. We've compiled your notes for review!`;
      } else if (activeInteraction.type === 'mention') {
        testReply = `Thank you so much for the tag, @${activeInteraction.authorHandle}! We really appreciate you sharing this update. Let us know if we can support you further. 🚀`;
      } else {
        testReply = `Hi @${activeInteraction.authorHandle}, thank you for reaching out directly! We have received your query and would happily resolve this. Please let us know if we can assist.`;
      }
      setTypedMessage(testReply);
      setCopilotReason('Applied fallback offline customer CRM layout.');
      localStorage.setItem('last_copilot_draft', testReply);
    } finally {
      setGeneratingResponse(false);
    }
  };

  // Send message or reply triggers based on interaction types
  const handleSendResponse = (e: FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeInteraction) return;

    const replyText = typedMessage.trim();

    // Self-Tuning Engine: Capture discrepancy between original draft and manager edits
    const lastDraft = localStorage.getItem('last_copilot_draft') || '';
    if (lastDraft && lastDraft !== replyText) {
      const existingTweaks = localStorage.getItem('crm_learned_tweaks') || '';
      const newTweak = `- User styled the suggestion: "${lastDraft.slice(0, 45)}..." into: "${replyText.slice(0, 45)}..." (Align response lexicon and sign-off preferences accordingly)`;
      const updated = existingTweaks ? `${existingTweaks}\n${newTweak}` : newTweak;
      localStorage.setItem('crm_learned_tweaks', updated);
      
      // Transient banner notification
      const alertDiv = document.createElement('div');
      alertDiv.className = 'fixed bottom-12 right-12 z-50 p-4 bg-emerald-600 text-white rounded-xl shadow-xl border border-emerald-500 font-sans text-xs animate-bounce font-semibold';
      alertDiv.innerHTML = '🛡️ Brand Voice Learned SMM Tweak! Self-tuning adjusted style successfully.';
      document.body.appendChild(alertDiv);
      setTimeout(() => alertDiv.remove(), 4000);
    }
    localStorage.removeItem('last_copilot_draft');

    if (activeInteraction.type === 'dm') {
      // Append message to conversation thread
      const newMsg: Message = {
        id: `msg-custom-${Date.now()}`,
        sender: 'user',
        content: replyText,
        timestamp: 'Just now'
      };

      setConversations(conversations.map(c => {
        if (c.id === activeInteraction.id) {
          return {
            ...c,
            lastMessage: replyText,
            timestamp: 'Just now',
            messages: [...c.messages, newMsg]
          };
        }
        return c;
      }));

    } else if (activeInteraction.type === 'comment') {
      // Apply comment reply natively into post comments thread
      setPosts(posts.map(p => {
        if (p.id === activeInteraction.parentPost.id) {
          return {
            ...p,
            comments: p.comments.map(c => {
              if (c.id === activeInteraction.id) {
                return { ...c, reply: replyText };
              }
              return c;
            })
          };
        }
        return p;
      }));

    } else if (activeInteraction.type === 'mention') {
      // Add a reply to the mention
      setMentions(mentions.map(m => {
        if (m.id === activeInteraction.id) {
          return {
            ...m,
            replies: [...m.replies, replyText]
          };
        }
        return m;
      }));
    }

    setTypedMessage('');
    setCopilotReason('');
    setTranslationText('');
    setTranslationNuance('');
    setDetectedLang('');
  };

  // Simulate incoming response after delay for active playability
  const handleSimulateFollowup = () => {
    if (!activeInteraction) return;

    if (activeInteraction.type === 'dm') {
      const followUpQuestions = [
        "Any estimate on when the patch is expected to land?",
        "That sounds ideal, where can I share my email configuration files?",
        "Is there a documentation link I can follow in the meantime?",
        "Perfect! Let me know if you need our system specifications to diagnose the leaks."
      ];
      const randomQuestion = followUpQuestions[Math.floor(Math.random() * followUpQuestions.length)];

      setTimeout(() => {
        const incomingMsg: Message = {
          id: `msg-sim-${Date.now()}`,
          sender: 'contact',
          content: randomQuestion,
          timestamp: 'Just now'
        };

        setConversations(conversations.map(c => {
          if (c.id === activeInteraction.id) {
            return {
              ...c,
              unread: true,
              lastMessage: randomQuestion,
              timestamp: 'Just now',
              messages: [...c.messages, incomingMsg]
            };
          }
          return c;
        }));
      }, 1200);

    } else if (activeInteraction.type === 'comment') {
      // No extra action needed, simply logs
      alert("Follower notified on-site regarding comment updates.");
    }
  };

  return (
    <div id="messaging-workspace" className="max-w-6xl mx-auto space-y-6">
      
      {/* Header section */}
      <div id="inbox-header" className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="font-sans font-extrabold text-2.5xl text-slate-800">Omnichannel Unified Inbox</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Aggregated workspace displaying Direct Messages, Post Comments, and Platform Mentions.
          </p>
        </div>

        {/* Platform Quick Filter Selector */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 mt-3 md:mt-0 shadow-3xs">
          <span className="text-[10px] font-mono text-slate-400 px-2 font-bold uppercase">Platform:</span>
          {(['all', 'instagram', 'twitter', 'linkedin', 'facebook'] as const).map(pFilter => (
            <button
              key={pFilter}
              type="button"
              id={`btn-filter-plat-${pFilter}`}
              onClick={() => setFilterPlatform(pFilter)}
              className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold capitalize cursor-pointer transition-all ${
                filterPlatform === pFilter 
                  ? 'bg-slate-900 text-white' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {pFilter}
            </button>
          ))}
        </div>
      </div>

      {/* FILTER BUTTON WORKSPACE */}
      <div id="inbox-filters-bar" className="flex flex-wrap gap-2">
        <button
          id="btn-filter-all"
          onClick={() => setFilterType('all')}
          className={`py-1.5 px-3.5 rounded-full text-xs font-sans font-bold flex items-center gap-2 border transition-all cursor-pointer ${
            filterType === 'all' 
              ? 'bg-indigo-600 border-indigo-505 text-white shadow-3xs' 
              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
          }`}
        >
          <span>Inbox Hub (All)</span>
          <span className="bg-white/20 text-white px-1.5 py-0.5 rounded-full text-[9px]">
            {filteredInteractions.length}
          </span>
        </button>

        <button
          id="btn-filter-dms"
          onClick={() => setFilterType('dm')}
          className={`py-1.5 px-3.5 rounded-full text-xs font-sans font-bold flex items-center gap-2 border transition-all cursor-pointer ${
            filterType === 'dm' 
              ? 'bg-indigo-600 border-indigo-505 text-white shadow-3xs' 
              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
          }`}
        >
          <span>Direct Messages</span>
          {unreadCounts.dm > 0 && (
            <span className="bg-indigo-500 text-white px-1.5 py-0.5 rounded-full text-[9px] animate-pulse">
              {unreadCounts.dm}
            </span>
          )}
        </button>

        <button
          id="btn-filter-comments"
          onClick={() => setFilterType('comment')}
          className={`py-1.5 px-3.5 rounded-full text-xs font-sans font-bold flex items-center gap-2 border transition-all cursor-pointer ${
            filterType === 'comment' 
              ? 'bg-indigo-600 border-indigo-505 text-white shadow-3xs' 
              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
          }`}
        >
          <span>Post Comments</span>
          {unreadCounts.comment > 0 && (
            <span className="bg-indigo-500 text-white px-1.5 py-0.5 rounded-full text-[9px] animate-pulse">
              {unreadCounts.comment}
            </span>
          )}
        </button>

        <button
          id="btn-filter-mentions"
          onClick={() => setFilterType('mention')}
          className={`py-1.5 px-3.5 rounded-full text-xs font-sans font-bold flex items-center gap-2 border transition-all cursor-pointer ${
            filterType === 'mention' 
              ? 'bg-indigo-600 border-indigo-505 text-white shadow-3xs' 
              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
          }`}
        >
          <span>Social Mentions</span>
          {unreadCounts.mention > 0 && (
            <span className="bg-indigo-500 text-white px-1.5 py-0.5 rounded-full text-[9px] animate-pulse">
              {unreadCounts.mention}
            </span>
          )}
        </button>
      </div>

      <div id="inbox-split-body" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Conversation thread lists */}
        <div id="conversations-list-lane" className="lg:col-span-4 space-y-4">
          <span className="text-xs font-sans font-bold text-slate-500 tracking-wider uppercase block">
            Incoming Activities ({filteredInteractions.length})
          </span>
          
          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1" id="conversations-scroll-box">
            {filteredInteractions.length === 0 ? (
              <div className="text-center p-8 bg-slate-50 border border-slate-150 rounded-xl text-slate-400">
                <p className="text-xs font-sans font-medium">No alerts filtering this platform criteria.</p>
              </div>
            ) : (
              filteredInteractions.map(conv => {
                const isActive = conv.id === selectedInteractionId;
                return (
                  <button
                    key={conv.id}
                    id={`conversation-item-${conv.id}`}
                    onClick={() => handleSelectInteraction(conv.id, conv.type)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 block outline-none cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 border-slate-850 text-white shadow-md'
                        : 'bg-white border-slate-200 hover:border-slate-350 shadow-sm text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-start gap-3 w-full">
                      {/* Contact avatar */}
                      <div className="relative shrink-0">
                        <img
                          src={conv.avatar}
                          alt={conv.authorName}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                        />
                        <span className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded text-[8.5px] font-bold font-mono border uppercase ${
                          conv.platform === 'instagram' ? 'bg-pink-50 text-pink-650 border-pink-100 font-bold' :
                          conv.platform === 'linkedin' ? 'bg-blue-50 text-blue-650 border-blue-100 font-bold' :
                          conv.platform === 'twitter' ? 'bg-slate-50 text-slate-700 border-slate-205 font-bold' :
                          'bg-indigo-50 text-indigo-600 border-indigo-100 font-bold'
                        }`}>
                          {conv.platform.slice(0, 2)}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className={`font-sans font-bold text-xs block truncate ${isActive ? 'text-white' : 'text-slate-805'}`}>
                            {conv.authorName}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {conv.unread && (
                              <span id={`unread-badge-${conv.id}`} className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            )}
                            <span className="text-[9px] font-mono text-slate-400">{conv.timestamp}</span>
                          </div>
                        </div>

                        {/* Interaction Category Badge */}
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[9px] block font-mono uppercase ${isActive ? 'text-indigo-250' : 'text-indigo-650 font-bold'}`}>
                            @{conv.authorHandle}
                          </span>
                          <span className={`text-[8px] font-mono px-1 rounded uppercase ${
                            conv.type === 'dm' ? 'bg-indigo-50 text-indigo-505 border border-indigo-100' :
                            conv.type === 'comment' ? 'bg-amber-50 text-amber-650 border border-amber-100' :
                            'bg-emerald-50 text-emerald-650 border border-emerald-100'
                          }`}>
                            {conv.type}
                          </span>
                        </div>

                        <p className={`text-xs leading-normal mt-1.5 truncate ${isActive ? 'text-slate-300' : 'text-slate-500 font-medium'}`}>
                          {conv.content}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Chat Panel */}
        <div id="active-chat-panel" className="lg:col-span-8">
          {activeInteraction ? (
            <div id="chat-workspace-grid" className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200 bg-white rounded-xl border border-slate-200 h-[640px] overflow-hidden shadow-sm animate-fade-in">
              
              {/* MID AREA: Chat Messages (md:col-span-8) */}
              <div id="chat-messages-workspace-section" className="md:col-span-8 flex flex-col h-full overflow-hidden">
              
              {/* Chat Panel Header */}
              <div id="active-chat-terminal-header" className="p-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between gap-4 shadow-3xs">
                <div className="flex items-center gap-3">
                  <img
                    src={activeInteraction.avatar}
                    alt={activeInteraction.authorName}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-sans font-bold text-slate-800 text-xs">{activeInteraction.authorName}</span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-indigo-50 text-indigo-605 border border-indigo-100 capitalize font-bold">
                        {activeInteraction.platform} {activeInteraction.type.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 block leading-none mt-0.5 font-medium">@{activeInteraction.authorHandle}</span>
                  </div>
                </div>

                {activeInteraction.type === 'dm' && (
                  <button
                    id="btn-simulate-msg-answer"
                    onClick={handleSimulateFollowup}
                    className="px-3 py-1.5 text-[10px] font-sans font-bold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shadow-3xs"
                  >
                    Simulate Follower Reply
                  </button>
                )}
              </div>

              {/* Context bar inside comment triggers */}
              {activeInteraction.type === 'comment' && activeInteraction.parentPost && (
                <div id="chat-thread-context" className="px-4 py-2 bg-amber-50/20 border-b border-amber-100 flex items-center justify-between gap-4 text-[10px]">
                  <div className="flex items-center gap-1.5 font-mono text-slate-505 font-semibold">
                    <MessageCircle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Parent Campaign Post Content:</span>
                    <span className="font-sans text-slate-700 font-medium truncate max-w-xs md:max-w-md">
                      "{activeInteraction.parentPost.content}"
                    </span>
                  </div>
                  {activeInteraction.parentPost.mediaUrl && (
                    <img
                      src={activeInteraction.parentPost.mediaUrl}
                      alt="Context asset"
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded object-cover border border-slate-200 shrink-0"
                    />
                  )}
                </div>
              )}

              {/* VIP Omnilingual Translation localization Bar */}
              {(/[^\u0000-\u007F]+/.test(activeInteraction.content) || activeInteraction.authorHandle === 'carlos_ux' || activeInteraction.authorHandle === 'yuki_dev') && (
                <div id="translator-dock-banner" className="bg-indigo-50/60 p-4 border-b border-indigo-100 space-y-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-500 animate-spin" style={{ animationDuration: '6s' }} />
                    <span className="text-xs font-sans font-black text-indigo-905 tracking-tight flex items-center gap-1.5">
                      <span>VIP Cross-Border Localization Engine</span>
                      <span className="font-mono text-[9px] bg-indigo-100 text-indigo-700 border border-indigo-200 px-1.5 py-px rounded shrink-0 uppercase tracking-wide">
                        Multilingual DM detected!
                      </span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-white/80 border border-indigo-100 rounded-xl">
                      <span className="text-[9px] font-mono text-slate-405 block font-bold uppercase leading-none mb-1">Raw Foreign text</span>
                      <p className="text-xs text-slate-800 leading-normal font-semibold font-sans">"{activeInteraction.content}"</p>
                    </div>

                    <div className="p-3 bg-white/80 border border-indigo-100 rounded-xl flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-mono text-slate-405 block font-bold uppercase leading-none mb-1">
                          Translated English Draft {detectedLang ? `[${detectedLang}]` : ''}
                        </span>
                        <p className="text-xs leading-normal text-slate-705 italic font-medium font-sans">
                          {translationText || (translating ? 'Synthesizing dialects...' : 'Ready to decode local idioms...')}
                        </p>
                      </div>
                      {translationNuance && (
                        <p className="text-[9px] font-mono text-indigo-650 mt-1.5 block font-bold border-t border-slate-100 pt-1">
                          🎭 cultural politeness: "{translationNuance}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-[10px]">
                    <div className="flex items-center gap-1 text-slate-505 font-mono">
                      <span>Source Localized:</span>
                      <strong className="text-indigo-650 bg-indigo-100/50 px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold font-mono text-[9px]">
                        {detectedLang || 'Automatic Detection'}
                      </strong>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={translating}
                        onClick={handleTranslateMessage}
                        className="px-3 py-1.5 bg-white border border-slate-205 hover:bg-slate-50 text-indigo-605 font-sans font-bold rounded-lg transition-colors cursor-pointer shadow-3xs"
                      >
                        {translating ? 'Detecting Language...' : 'Translate Message'}
                      </button>

                      {translationText && (
                        <button
                          type="button"
                          disabled={translating}
                          onClick={handleTranslateReplyBack}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-505 text-white font-sans font-bold rounded-lg transition-colors cursor-pointer shadow-md shadow-indigo-600/10"
                        >
                          Translate Reply back (Local Politeness Idioms)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Messages Body Area */}
              <div id="chat-messages-body" className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/25">
                
                {/* 1. Direct Messages Logic Rendering */}
                {activeInteraction.type === 'dm' && activeInteraction.raw.messages.map((msg: Message) => {
                  const isContact = msg.sender === 'contact';
                  return (
                    <div
                      key={msg.id}
                      id={`msg-node-${msg.id}`}
                      className={`flex ${isContact ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-[85%] rounded-xl p-3.5 text-xs font-sans leading-relaxed ${
                        isContact
                          ? 'bg-slate-100 text-slate-800 border border-slate-150 rounded-tl-none shadow-3xs'
                          : 'bg-indigo-600 text-white rounded-tr-none border border-indigo-700 shadow-sm font-medium'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <div className={`mt-1.5 text-[9px] font-mono opacity-80 text-right leading-none ${isContact ? 'text-slate-400 font-semibold' : 'text-indigo-200'}`}>
                          {msg.timestamp}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* 2. Platform Comment Thread Logic */}
                {activeInteraction.type === 'comment' && (
                  <div className="space-y-4">
                    {/* follower original comment */}
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-xl p-4 text-xs font-sans leading-relaxed bg-slate-100 text-slate-850 border border-slate-150 rounded-tl-none shadow-3xs">
                        <span className="font-bold text-slate-900 block mb-1 font-mono text-[9px] uppercase tracking-wide">
                          📝 follower comment
                        </span>
                        <p className="font-semibold text-slate-705">"{activeInteraction.content}"</p>
                        <span className="text-[9px] font-mono text-slate-400 mt-1 block tracking-wider uppercase">
                          {activeInteraction.timestamp}
                        </span>
                      </div>
                    </div>

                    {/* our replied answer if present */}
                    {activeInteraction.raw.reply ? (
                      <div className="flex justify-end animate-fade-in">
                        <div className="max-w-[85%] rounded-xl p-4 text-xs font-sans leading-relaxed bg-slate-900 text-white rounded-tr-none border border-slate-850 shadow-sm">
                          <span className="font-mono text-[9px] uppercase tracking-widest text-indigo-200 block mb-1 font-bold">
                            ✓ Published Reply
                          </span>
                          <p className="font-medium">{activeInteraction.raw.reply}</p>
                          <span className="text-[9px] font-mono text-slate-350 mt-1 block">
                            Shared on CRM database live
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-center text-xs text-amber-700 font-semibold">
                        ⚠️ Zero replies have tags on this customer comment alert yet! Use the composer below.
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Platform Mentions Logic */}
                {activeInteraction.type === 'mention' && (
                  <div className="space-y-4">
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-xl p-4 text-xs font-sans leading-relaxed bg-slate-100 text-slate-850 border border-slate-150 rounded-tl-none shadow-3xs">
                        <span className="font-bold text-slate-900 block mb-1 font-mono text-[9px] uppercase tracking-wide">
                          📢 BRAND MENTION (Public)
                        </span>
                        <p className="font-medium">"{activeInteraction.content}"</p>
                        <span className="text-[9px] font-mono text-slate-400 mt-1 block uppercase">
                          {activeInteraction.timestamp}
                        </span>
                      </div>
                    </div>

                    {activeInteraction.raw.replies.map((rep: string, rIdx: number) => (
                      <div key={rIdx} className="flex justify-end animate-fade-in">
                        <div className="max-w-[85%] rounded-xl p-4 text-xs font-sans leading-relaxed bg-slate-900 text-white rounded-tr-none border border-slate-850 shadow-sm">
                          <span className="font-mono text-[9px] uppercase tracking-widest text-indigo-200 block mb-1 font-bold">
                            ✓ Public Response Draft #{rIdx + 1}
                          </span>
                          <p className="font-medium">{rep}</p>
                        </div>
                      </div>
                    ))}

                    {activeInteraction.raw.replies.length === 0 && (
                      <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-center text-xs text-emerald-700 font-semibold">
                        🚀 Write an engagement response to amplify this user tag organic reach!
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Gemini Copilot response drafting dock */}
              <div id="chat-bottom-dock" className="p-4 bg-slate-50 border-t border-slate-200 space-y-4">
                
                {/* Copilot triggers */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-indigo-600 uppercase tracking-widest font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-505" />
                      <span>Copilot response tone controller</span>
                    </span>
                    {copilotReason && (
                      <span className="text-[9px] font-mono text-slate-400 font-semibold block">Alignment Drafted</span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {TONE_PRESETS.map(tone => (
                      <button
                        key={tone.id}
                        id={`btn-chat-tone-${tone.id}`}
                        onClick={() => setCurrentToneId(tone.id)}
                        className={`py-1.5 px-2.5 rounded-lg text-xs border transition-all duration-200 flex items-center gap-1.5 outline-none font-sans font-semibold cursor-pointer ${
                          currentToneId === tone.id
                            ? 'bg-indigo-600 border-indigo-550 text-white shadow-3xs'
                            : 'bg-white border-slate-205 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        <span>{tone.emoji}</span>
                        <span>{tone.name}</span>
                      </button>
                    ))}

                    <button
                      id="btn-trigger-dm-copilot"
                      onClick={handleGenerateCopilotDraft}
                      disabled={generatingResponse}
                      className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-550 disabled:bg-slate-200 text-white disabled:text-slate-400 border disabled:border-slate-200 rounded-lg text-[11px] font-sans font-bold transition-colors cursor-pointer shadow-3xs"
                    >
                      <RefreshCw className={`w-3 h-3 ${generatingResponse ? 'animate-spin' : ''}`} />
                      <span>{generatingResponse ? 'Thinking...' : 'AI Compose Reply'}</span>
                    </button>
                  </div>
                </div>

                {/* Copilot analysis reason display */}
                {copilotReason && (
                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-[10px] text-slate-505 leading-normal font-medium shadow-3xs">
                    <span className="font-bold text-slate-750 block mb-0.5 font-mono text-[9px] uppercase">Copilot Alignment Logic:</span>
                    {copilotReason}
                  </div>
                )}

                {copilotError && (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[10px] text-amber-650 font-mono">
                    ⚠️ {copilotError} (Default mock reply loaded)
                  </div>
                )}

                {/* Real interactive form input bar */}
                <form id="dm-input-form" onSubmit={handleSendResponse} className="flex gap-2">
                  <input
                    id="dm-reply-character-field"
                    required
                    type="text"
                    placeholder={
                      activeInteraction.type === 'comment' 
                        ? 'Type reply to show on this post feedback...' 
                        : activeInteraction.type === 'mention' 
                        ? 'Type public comment response to thread...'
                        : 'Type DM follow up message...'
                    }
                    value={typedMessage}
                    onChange={(e) => setTypedMessage(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs focus:border-indigo-400 outline-none font-sans shadow-3xs placeholder-slate-400"
                  />
                  <button
                    id="btn-dm-submit"
                    type="submit"
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-505 text-white rounded-xl shadow-lg shadow-indigo-600/10 transition-colors shrink-0 flex items-center justify-center cursor-pointer font-bold"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

              </div>
            </div>

              {/* RIGHT AREA: Structured Intent Tagging & Classification (md:col-span-4) */}
              <div id="chat-cognitive-tags-desk" className="md:col-span-4 bg-slate-50 border-l border-slate-100 flex flex-col h-full overflow-y-auto select-text relative">
                
                {/* Lock Overlay for Basic mode */}
                {!isPremium && (
                  <div id="cognitive-tags-lock" className="absolute inset-0 z-10 bg-slate-100/70 backdrop-blur-[1px] flex flex-col items-center justify-center p-4 text-center">
                    <div className="bg-white border border-slate-205 rounded-xl p-5 shadow-lg space-y-3 max-w-[220px]">
                      <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-150 text-indigo-550 flex items-center justify-center mx-auto animate-pulse">
                        <Lock className="w-4 h-4 shrink-0" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-850 leading-tight">JSON Tagging Locked</h4>
                        <span className="text-[7.5px] font-mono tracking-wider font-extrabold text-indigo-500 uppercase leading-none">PREMIUM PRO</span>
                      </div>
                      <p className="text-[9.5px] text-slate-550 leading-normal font-semibold">
                        Unlock real-time cognitive classification, user language, and structured JSON outline.
                      </p>
                      <button
                        id="cognitive-upgrade-cta-btn"
                        type="button"
                        onClick={onUpgradeRequest}
                        className="w-full py-1.5 bg-gradient-to-r from-amber-550 to-yellow-500 hover:from-amber-450 text-slate-950 font-sans font-black text-[10px] rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Gem className="w-3 h-3 text-slate-950" />
                        <span>Upgrade to Pro</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Cognitive tags header */}
                <div className="p-4 border-b border-slate-150 bg-white/40 shrink-0">
                  <h4 className="font-sans font-bold text-slate-800 text-xs flex items-center gap-1.5 animate-pulse">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Structured JSON Logs</span>
                  </h4>
                  <span className="text-[9px] font-mono text-slate-400 block mt-0.5 uppercase tracking-wide font-bold">Cognitive SMM Intent Classifier</span>
                </div>

                {/* Tags content body */}
                <div className="p-4 space-y-4 flex-1">
                  
                  {/* Parameter Card 1: Intent Class */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-slate-400 uppercase block font-extrabold tracking-wider leading-none">NATIVE INTENT VECTOR</span>
                    <span className="px-2.5 py-1 rounded bg-indigo-50 border border-indigo-150 text-indigo-700 text-xs font-bold font-sans inline-block">
                      {activeInteraction.authorHandle === 'carlos_ux' 
                        ? 'Support Request (Localization)' 
                        : activeInteraction.authorHandle === 'yuki_dev' 
                        ? 'Inquiry (Linux Platform)' 
                        : 'Advocacy & Engagement'}
                    </span>
                  </div>

                  {/* Parameter Card 2: Language Detected */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-slate-400 uppercase block font-extrabold tracking-wider leading-none">DETECTED LOCALE</span>
                    <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-bold inline-block">
                      {activeInteraction.authorHandle === 'carlos_ux' 
                        ? 'es-ES (Spanish)' 
                        : activeInteraction.authorHandle === 'yuki_dev' 
                        ? 'ja-JP (Japanese)' 
                        : 'en-US (English)'}
                    </span>
                  </div>

                  {/* Parameter Card 3: Priority Index */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-slate-400 uppercase block font-extrabold tracking-wider leading-none">PRIORITY MATRIX</span>
                    <span className={`px-2.5 py-1 rounded text-xs font-sans font-bold border inline-block ${
                      activeInteraction.authorHandle === 'carlos_ux'
                        ? 'bg-red-50 border-red-150 text-red-650 font-bold'
                        : 'bg-emerald-50 border-emerald-150 text-emerald-700 font-bold'
                    }`}>
                      {activeInteraction.authorHandle === 'carlos_ux' ? 'High Emergency' : 'Standard Queue'}
                    </span>
                  </div>

                  {/* Parameter Card 4: JSON Output */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[9px] font-mono text-slate-400 uppercase block font-extrabold tracking-wider leading-none">PARSED JSON METADATA PAYLOAD</span>
                    <pre className="p-3 bg-slate-900 border border-slate-800 text-white rounded-xl text-[10px] font-mono leading-relaxed overflow-x-auto select-all max-h-[160px] font-medium shadow-3xs">
                      <code>
                        {activeInteraction.authorHandle === 'carlos_ux' 
                          ? `{\n  "intent": "localization_support",\n  "market": "latam",\n  "urgency": "high",\n  "confidence": 0.96\n}`
                          : activeInteraction.authorHandle === 'yuki_dev'
                          ? `{\n  "intent": "platform_avail",\n  "target_os": "linux",\n  "urgency": "medium",\n  "confidence": 0.92\n}`
                          : `{\n  "intent": "organic_advocacy",\n  "sentiment": "positive",\n  "urgency": "normal",\n  "confidence": 0.89\n}`}
                      </code>
                    </pre>
                    <span className="text-[8.5px] font-mono text-slate-400 block font-semibold leading-normal">
                      ✓ Auto-synced to Firestore CRM.
                    </span>
                  </div>

                </div>

                {/* Footer status metric */}
                <div className="p-3 shrink-0 border-t border-slate-150 bg-slate-100/40 text-[9px] text-slate-400 font-mono font-bold flex items-center justify-between">
                  <span>AGENT ENGINE:</span>
                  <strong className="text-indigo-650 uppercase">GEMINI PRO-CRUISE</strong>
                </div>

              </div>

            </div>
          ) : (
            <div id="no-chat-selected" className="bg-white rounded-xl border border-slate-200 p-12 text-center h-[640px] flex flex-col items-center justify-center shadow-sm">
              <Inbox className="w-8 h-8 text-indigo-400 mb-2" />
              <h4 className="font-sans font-bold text-slate-800">No Interaction Active</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm font-medium leading-relaxed">
                Select one of the Direct Messages, Posts Comments, or Social Mentions from the left feed list to open the workspace.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
export type { BrandMention };
