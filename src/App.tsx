import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Overview from './components/Overview';
import FeedAndFeedback from './components/FeedAndFeedback';
import StoriesStudio from './components/StoriesStudio';
import MessagingInbox from './components/MessagingInbox';
import InsightsDesk from './components/InsightsDesk';
import PostScheduler from './components/PostScheduler';
import GeminiStatusIndicator from './components/GeminiStatusIndicator';

import { SocialPost, SocialStory, Conversation, ScheduledPost, SocialPlatform } from './types';
import { INITIAL_POSTS, INITIAL_STORIES, INITIAL_CONVERSATIONS } from './data';
import { Mail, MessageCircle, AlertTriangle, Sparkles, Send, Gem, Shield, Check, X, CreditCard, Award } from 'lucide-react';

// Default pre-populated list for social scheduling queue
const INITIAL_SCHEDULED: ScheduledPost[] = [
  {
    id: 'sched-mock-1',
    content: 'A sneak peek into our upcoming minimalist Aurora Workspace expansion. We are finalizing support for custom keyboard overrides and fluid drag pane layout! 🖥️✨ #workspace #productivity #coding',
    platforms: ['instagram', 'facebook'],
    scheduledTime: '2026-05-30T13:40:00', // 2 hours after local time
    mediaUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80',
    mediaType: 'image',
    status: 'scheduled',
    tags: ['teaser', 'productivity', 'minimalism']
  },
  {
    id: 'sched-mock-2',
    content: 'Native Markdown support is officially rolling out in next week\'s beta suite. Say goodbye to plain text fatigue and enjoy seamless styled syntax blocks natively! ⚡️ Let us know what you think!',
    platforms: ['twitter', 'linkedin'],
    scheduledTime: '2026-05-31T09:15:00', // 1 day after
    mediaType: 'text',
    status: 'scheduled',
    tags: ['qualityoflife', 'markdown', 'remotework']
  }
];

// Initial omnichannel brand mentions queue
const INITIAL_MENTIONS = [
  {
    id: "mention-1",
    platform: "twitter" as SocialPlatform,
    authorName: "Alex Mercer",
    authorHandle: "alex_growth",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    content: "Highly impressed by the sleek workspaces layout from @DesignStudioLLC. The glassmorphic dashboards are top-tier for real-time campaign tracking. 🌐🔥",
    timestamp: "1 hour ago",
    unread: true,
    replies: []
  },
  {
    id: "mention-2",
    platform: "facebook" as SocialPlatform,
    authorName: "Sarah Jenkins",
    authorHandle: "sarah_innovates",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    content: "Just migrated our entire team workspace onto @DesignStudioLLC Aurora Suite. Task velocity is up 40% and our feedback loops are zero latency! Credit where credit is due.",
    timestamp: "4 hours ago",
    unread: false,
    replies: ["We are absolutely thrilled to hear that, Sarah! Team velocity is our absolute focus."]
  }
];

export default function App() {
  const [activeTab, setActiveTab ] = useState<string>('overview');

  // Subscription Pricing Tier states
  const [isPremium, setIsPremium] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('crm_is_premium');
      // Default to false so they can visual-click "Upgrade" to see our gorgeous, high-fidelity check-out simulator!
      return saved === 'true'; 
    } catch (e) {
      return false;
    }
  });
  const [upgradeModalOpen, setUpgradeModalOpen] = useState<boolean>(false);

  // Simulated Checkout credit card inputs
  const [paymentLoading, setPaymentLoading] = useState<boolean>(false);
  const [cardNumber, setCardNumber] = useState<string>('4111 2293 8404 1928');
  const [cardHolder, setCardHolder] = useState<string>('Yaman Dawadi');
  const [cardExpiry, setCardExpiry] = useState<string>('08/29');
  const [cardCvc, setCardCvc] = useState<string>('304');

  // Multi-platform state engine with localStorage persistence
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [stories, setStories] = useState<SocialStory[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [mentions, setMentions] = useState<any[]>([]);
  const [virtualTime, setVirtualTime] = useState<string>('2026-05-30T11:38:30Z');

  // Navigation link states
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Initialize state from local storage or mock defaults
  useEffect(() => {
    try {
      const savedPosts = localStorage.getItem('crm_posts_feed');
      const savedStories = localStorage.getItem('crm_stories');
      const savedConversations = localStorage.getItem('crm_conversations');
      const savedScheduled = localStorage.getItem('crm_scheduled_posts');
      const savedMentions = localStorage.getItem('crm_brand_mentions');
      const savedTime = localStorage.getItem('crm_virtual_time');

      if (savedPosts) setPosts(JSON.parse(savedPosts));
      else setPosts(INITIAL_POSTS);

      if (savedStories) setStories(JSON.parse(savedStories));
      else setStories(INITIAL_STORIES);

      if (savedConversations) setConversations(JSON.parse(savedConversations));
      else setConversations(INITIAL_CONVERSATIONS);

      if (savedScheduled) setScheduledPosts(JSON.parse(savedScheduled));
      else setScheduledPosts(INITIAL_SCHEDULED);

      if (savedMentions) setMentions(JSON.parse(savedMentions));
      else setMentions(INITIAL_MENTIONS);

      if (savedTime) setVirtualTime(savedTime);
      else setVirtualTime('2026-05-30T11:38:30Z');
    } catch (e) {
      console.error('Local Storage read fail:', e);
      setPosts(INITIAL_POSTS);
      setStories(INITIAL_STORIES);
      setConversations(INITIAL_CONVERSATIONS);
      setScheduledPosts(INITIAL_SCHEDULED);
      setMentions(INITIAL_MENTIONS);
      setVirtualTime('2026-05-30T11:38:30Z');
    }
  }, []);

  // Sync to local storage on edits
  useEffect(() => {
    if (posts.length > 0) {
      localStorage.setItem('crm_posts_feed', JSON.stringify(posts));
    }
  }, [posts]);

  useEffect(() => {
    if (stories.length > 0) {
      localStorage.setItem('crm_stories', JSON.stringify(stories));
    }
  }, [stories]);

  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('crm_conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('crm_scheduled_posts', JSON.stringify(scheduledPosts));
  }, [scheduledPosts]);

  useEffect(() => {
    localStorage.setItem('crm_brand_mentions', JSON.stringify(mentions));
  }, [mentions]);

  useEffect(() => {
    localStorage.setItem('crm_virtual_time', virtualTime);
  }, [virtualTime]);

  // Aggregate global unread counts (DMs + unread Mentions + negative comments)
  const unreadMessagesCount = conversations.filter(c => c.unread).length + mentions.filter(m => m.unread).length;

  return (
    <div id="app-root-workspace" className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      {/* Sidebar Command Rail */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        unreadCount={unreadMessagesCount} 
        isPremium={isPremium}
        setIsPremium={setIsPremium}
        onOpenUpgradeModal={() => setUpgradeModalOpen(true)}
      />

      {/* Main Panel Content viewport */}
      <main id="app-main-viewport" className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
        
        {/* Core Top Bar header */}
        <header id="workspace-top-bar" className="h-16 border-b border-slate-200 px-8 flex items-center justify-between bg-white shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-405 uppercase tracking-widest leading-none block font-semibold">ACTIVE WORKSPACE</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-sans text-slate-600 font-semibold leading-none block">Multi-Channel Sandbox Connected</span>
          </div>

          <div className="flex items-center gap-5">
            {/* Display plan badge directly in top bar for quick reference */}
            <button
              id="topbar-plan-badge"
              onClick={() => {
                if (!isPremium) setUpgradeModalOpen(true);
              }}
              className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                isPremium 
                  ? 'bg-amber-400/10 text-amber-600 border-amber-350 hover:bg-amber-400/20' 
                  : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              {isPremium ? (
                <>
                  <Gem className="w-3 h-3 text-amber-500" />
                  <span>Licensed Premium Subscription</span>
                </>
              ) : (
                <>
                  <Shield className="w-3 h-3 text-indigo-500 animate-bounce" />
                  <span>Basic Tier (Click to Upgrade)</span>
                </>
              )}
            </button>

            {/* Status indicators */}
            <GeminiStatusIndicator />
            <div className="h-4 w-px bg-slate-200" />
            <span id="user-email-badge" className="text-xs font-mono text-slate-500 font-semibold">dawadiyaman123@gmail.com</span>
          </div>
        </header>

        {/* Dynamic content sandbox */}
        <div id="workspace-content-pane" className="flex-1 overflow-y-auto p-8 select-text">
          {activeTab === 'overview' && (
            <Overview
              posts={posts}
              stories={stories}
              conversations={conversations}
              setActiveTab={setActiveTab}
              setSelectedPostId={setSelectedPostId}
              setSelectedConversationId={setSelectedConversationId}
              isPremium={isPremium}
              onUpgradeRequest={() => setUpgradeModalOpen(true)}
            />
          )}

          {activeTab === 'scheduler' && (
            <PostScheduler
              posts={posts}
              setPosts={setPosts}
              scheduledPosts={scheduledPosts}
              setScheduledPosts={setScheduledPosts}
              virtualTime={virtualTime}
              setVirtualTime={setVirtualTime}
            />
          )}

          {activeTab === 'feed' && (
            <FeedAndFeedback
              posts={posts}
              setPosts={setPosts}
              selectedPostId={selectedPostId}
              setSelectedPostId={setSelectedPostId}
            />
          )}

          {activeTab === 'stories' && (
            <StoriesStudio
              stories={stories}
              setStories={setStories}
            />
          )}

          {activeTab === 'inbox' && (
            <MessagingInbox
              conversations={conversations}
              setConversations={setConversations}
              posts={posts}
              setPosts={setPosts}
              mentions={mentions}
              setMentions={setMentions}
              selectedInteractionId={selectedConversationId}
              setSelectedInteractionId={setSelectedConversationId}
              isPremium={isPremium}
              onUpgradeRequest={() => setUpgradeModalOpen(true)}
            />
          )}

          {activeTab === 'insights' && (
            <InsightsDesk
              posts={posts}
              conversations={conversations}
              isPremium={isPremium}
              onUpgradeRequest={() => setUpgradeModalOpen(true)}
            />
          )}
        </div>

        {/* Global CRM Workspace Footer */}
        <footer id="app-workspace-footer" className="h-10 bg-white border-t border-slate-200 px-8 flex items-center justify-between text-[10px] font-mono text-slate-500 shrink-0 select-none shadow-sm shadow-indigo-100/50">
          <span>System Environment: Cloud Run Sandbox</span>
          <span>© 2026 SocialHub Pro • Social CRM Listening Deck</span>
        </footer>

      </main>

      {/* Premium Upgrade Checkout Simulation Modal */}
      {upgradeModalOpen && (
        <div id="payment-upgrade-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/85 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in select-text">
          <div id="payment-upgrade-modal-card" className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
            
            {/* Left Column: Pricing Plan Features Grid */}
            <div className="bg-indigo-950 p-6 md:p-8 text-white md:w-5/12 flex flex-col justify-between shrink-0">
              <div className="space-y-6">
                <div>
                  <span className="p-1 px-2.5 rounded-full text-[9px] font-mono bg-amber-400/20 text-yellow-300 border border-yellow-300/30 uppercase tracking-widest font-black inline-block">
                    PRO LEVEL UP
                  </span>
                  <h3 className="font-sans font-extrabold text-2xl text-white mt-2 tracking-tight">SocialHub Premium</h3>
                  <p className="text-xs text-indigo-200 mt-1 leading-relaxed font-semibold">
                    Elevate SMM tracking with active crisis warning and SWAT competitor listening.
                  </p>
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-start gap-2 text-xs">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white block">Structured JSON Tagging</span>
                      <span className="text-[10px] text-indigo-300 leading-normal">Deep cognitive intent classification</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 text-xs">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white block">PR Crisis Early Warnings</span>
                      <span className="text-[10px] text-indigo-300 leading-normal">Sentiment breaches sent to SMS & Slack</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-xs">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white block">Brand Knowledge Base FAQ</span>
                      <span className="text-[10px] text-indigo-300 leading-normal">Custom context in drafting AI replies</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-xs">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white block">Competitor SWOT Recon</span>
                      <span className="text-[10px] text-indigo-300 leading-normal">SMM gap analysis & viral TikTok scripts</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-indigo-900/60 pt-4 mt-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white tracking-tight">$49</span>
                  <span className="text-xs text-indigo-200">/ user / mo</span>
                </div>
                <span className="text-[9px] font-mono text-indigo-300 mt-0.5 block font-semibold leading-normal">Unused features auto-unlock instantly on payment</span>
              </div>
            </div>

            {/* Right Column: Checkout credit card form */}
            <div className="p-6 md:p-8 flex-1 flex flex-col justify-between text-slate-800">
              
              {/* Close Button */}
              <button
                id="btn-close-upgrade-modal"
                onClick={() => setUpgradeModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-5">
                <div>
                  <h4 className="font-sans font-extrabold text-slate-850 text-base">Complete Subscription Checkout</h4>
                  <p className="text-xs text-slate-505 font-semibold mt-0.5">Secure payment simulated sandbox engine.</p>
                </div>

                <div className="space-y-3.5">
                  {/* Cardholder Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Cardholder Name</label>
                    <input
                      id="checkout-cardholder-name"
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-205 text-xs font-semibold focus:border-indigo-400 bg-slate-50 focus:bg-white outline-none"
                    />
                  </div>

                  {/* Card Number Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Card Number</label>
                    <div className="relative">
                      <input
                        id="checkout-card-number"
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-205 text-xs font-mono focus:border-indigo-400 bg-slate-50 focus:bg-white outline-none"
                      />
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  {/* Grid for MM/YY and CVC */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Expiry Date</label>
                      <input
                        id="checkout-card-expiry"
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-205 text-xs font-mono focus:border-indigo-400 bg-slate-50 focus:bg-white outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">CVC Security</label>
                      <input
                        id="checkout-card-cvc"
                        type="text"
                        placeholder="3-digit"
                        maxLength={3}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-205 text-xs font-mono focus:border-indigo-400 bg-slate-50 focus:bg-white outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-405 font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <Shield className="w-3.5 h-3.5 text-indigo-500 shrink-0 animate-pulse" />
                  <span className="font-semibold">Stripe simulator sandbox protocol. No real transaction occurs.</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3 mt-6">
                <button
                  id="checkout-cancel-btn"
                  type="button"
                  onClick={() => setUpgradeModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-sans font-bold hover:bg-slate-50 text-slate-500 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                >
                  Cancel
                </button>
                <button
                  id="checkout-pay-btn"
                  type="button"
                  disabled={paymentLoading}
                  onClick={() => {
                    setPaymentLoading(true);
                    setTimeout(() => {
                      setPaymentLoading(false);
                      setIsPremium(true);
                      localStorage.setItem('crm_is_premium', 'true');
                      setUpgradeModalOpen(false);

                      // Spark confirmation banner alert
                      const alertDiv = document.createElement('div');
                      alertDiv.className = 'fixed bottom-12 right-12 z-50 p-5 bg-slate-900 border border-slate-800 text-white rounded-xl shadow-2xl font-sans text-xs flex flex-col gap-1.5 animate-bounce max-w-sm';
                      alertDiv.innerHTML = `
                        <div class="flex items-center gap-2">
                          <span class="text-base">👑</span>
                          <span class="font-bold">Subscription Upgrade Successful!</span>
                        </div>
                        <p class="text-[10px] text-slate-400 mt-1 leading-normal font-semibold">SocialHub Pro has authorized your simulated card. Crisis alerts, Brand FAQs, and SWOT Recon engines are now unlocked!</p>
                      `;
                      document.body.appendChild(alertDiv);
                      setTimeout(() => alertDiv.remove(), 5050);
                    }, 1200);
                  }}
                  className="px-6 py-2 bg-slate-900 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 hover:from-indigo-900 text-white text-xs font-sans font-bold rounded-lg transition-all cursor-pointer shadow-md shadow-indigo-650/15 flex items-center gap-2"
                >
                  {paymentLoading ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating simulated card...</span>
                    </>
                  ) : (
                    <>
                      <Gem className="w-3.5 h-3.5 text-amber-300" />
                      <span>Activate Premium ($49/mo)</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
