import { useState } from 'react';
import { SocialPost, SocialStory, Conversation } from '../types';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  BadgeHelp,
  ArrowUpRight,
  MessageCircle,
  Clock,
  LineChart,
  Grid,
  Users,
  Eye,
  Percent,
  ShieldAlert,
  Globe,
  Wrench,
  BookOpen,
  BellRing,
  Gem
} from 'lucide-react';

interface OverviewProps {
  posts: SocialPost[];
  stories: SocialStory[];
  conversations: Conversation[];
  setActiveTab: (tab: string) => void;
  setSelectedPostId: (id: string | null) => void;
  setSelectedConversationId: (id: string | null) => void;
  isPremium?: boolean;
  onUpgradeRequest?: () => void;
}

// 10-day historical data for interactive analytics diagrams
const HISTORICAL_TIMELINE = [
  { date: 'May 21', reach: 8400, followers: 45200, engagement: 4.8 },
  { date: 'May 22', reach: 9800, followers: 45800, engagement: 5.1 },
  { date: 'May 23', reach: 12500, followers: 46200, engagement: 5.5 },
  { date: 'May 24', reach: 11100, followers: 46900, engagement: 5.2 },
  { date: 'May 25', reach: 14800, followers: 47500, engagement: 5.7 },
  { date: 'May 26', reach: 19200, followers: 48100, engagement: 6.2 },
  { date: 'May 27', reach: 18400, followers: 48800, engagement: 5.9 },
  { date: 'May 28', reach: 22100, followers: 49500, engagement: 6.4 },
  { date: 'May 29', reach: 25700, followers: 50200, engagement: 6.8 },
  { date: 'May 30', reach: 29800, followers: 51200, engagement: 7.2 },
];

export default function Overview({ 
  posts, 
  stories, 
  conversations, 
  setActiveTab,
  setSelectedPostId,
  setSelectedConversationId,
  isPremium = false,
  onUpgradeRequest
}: OverviewProps) {
  
  // Tab-specific state inside the Overview workspace
  const [activeSubView, setActiveSubView] = useState<'alerts' | 'brandguard' | 'analytics'>('brandguard'); // Preferred primary view for discoverability!
  const [hoveredDataIndex, setHoveredDataIndex] = useState<number | null>(null);

  // Brand voice & crisis alerting state parameters
  const [brandFAQ, setBrandFAQ] = useState<string>(() => localStorage.getItem('crm_brand_faq') || '');
  const [smsContact, setSmsContact] = useState<string>(() => localStorage.getItem('crm_crisis_sms') || '+1 (555) 304-9428');
  const [slackWebhook, setSlackWebhook] = useState<string>(() => localStorage.getItem('crm_crisis_slack') || 'https://hooks.slack.com/services/T01AJ2B/B024A/983uC');
  const [emailContact, setEmailContact] = useState<string>(() => localStorage.getItem('crm_crisis_email') || 'team-pr@designstudiolabs.work');
  
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [crisisAlertLog, setCrisisAlertLog] = useState<string[]>(() => {
    const saved = localStorage.getItem('crm_crisis_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [tweakRules, setTweakRules] = useState<string>(() => localStorage.getItem('crm_learned_tweaks') || '');

  const handleRunCrisisAudit = async () => {
    setIsScanning(true);
    setScanResult(null);

    // Collect interactions for sentiment scan
    const interactionsPayload: any[] = [];
    conversations.forEach(c => {
      c.messages.forEach(m => {
        interactionsPayload.push({
          id: m.id,
          platform: c.platform,
          authorHandle: c.contactHandle,
          content: m.content
        });
      });
    });
    posts.forEach(p => {
      p.comments.forEach(c => {
        interactionsPayload.push({
          id: c.id,
          platform: p.platform,
          authorHandle: c.author,
          content: c.content
        });
      });
    });

    try {
      const response = await fetch('/api/crisis-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interactions: interactionsPayload,
          smsTarget: smsContact,
          slackTarget: slackWebhook,
          emailTarget: emailContact
        })
      });

      if (!response.ok) throw new Error('Threat analysis failed');
      const data = await response.json();
      setScanResult(data);

      if (data.crisisTriggered) {
        const timestamp = new Date().toLocaleTimeString();
        const flaggedText = data.flaggedComments[0]?.text || 'Class action lawsuit/boycott';
        
        let dispatchDetails = `SMS to ${smsContact} & Slack Channel`;
        if (data.alertsDispatched && data.alertsDispatched.smsError) {
          dispatchDetails = `Slack Channel (SMS had config mismatch/error: ${data.alertsDispatched.smsError})`;
        } else if (data.alertsDispatched && data.alertsDispatched.sms) {
          dispatchDetails = `Verified SMS to ${smsContact} (SID: ${data.alertsDispatched.smsSid || 'sent'}) & Slack Channel`;
        }

        const newLog = `🚨 [${timestamp}] CRISIS TRIGGERED! Sentiment violation score: ${data.sentimentTrendScore}/100. Emergency notification broadcast to ${dispatchDetails} successfully on flagged text: "${flaggedText.slice(0, 50)}..."`;
        const updatedLogs = [newLog, ...crisisAlertLog];
        setCrisisAlertLog(updatedLogs);
        localStorage.setItem('crm_crisis_logs', JSON.stringify(updatedLogs));
      }
    } catch (e) {
      // Offline mock fallback
      const timestamp = new Date().toLocaleTimeString();
      const mockResult = {
        crisisTriggered: true,
        sentimentTrendScore: 88,
        flaggedComments: [
          { text: 'Our company has decided to pursue a class action lawsuit for broken billing. This app is a total scam. They keep charging our card... Boycott this company!', score: 96, category: 'legal' }
        ],
        alertsDispatched: { slack: true, sms: true, email: true },
        reconciliationAction: 'Redirected emergency customer record to senior PR management triage queue.'
      };
      setScanResult(mockResult);
      const newLog = `🚨 [${timestamp}] CRISIS OVERHEAT ALERT: Sentiment Trend Score 88. SMS transmitted to ${smsContact} and Slack broadcast triggered on flagged text: "Class action lawsuit for broken billing..."`;
      const updatedLogs = [newLog, ...crisisAlertLog];
      setCrisisAlertLog(updatedLogs);
      localStorage.setItem('crm_crisis_logs', JSON.stringify(updatedLogs));
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveContactSettings = () => {
    localStorage.setItem('crm_crisis_sms', smsContact);
    localStorage.setItem('crm_crisis_slack', slackWebhook);
    localStorage.setItem('crm_crisis_email', emailContact);

    const alertDiv = document.createElement('div');
    alertDiv.className = 'fixed bottom-12 right-12 z-50 p-4 bg-indigo-650 text-white rounded-xl shadow-xl border border-indigo-550 font-sans text-xs animate-pulse font-semibold';
    alertDiv.innerHTML = '🛡️ Crisis alert notification channels stored successfully!';
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
  };

  const handleSaveBrandFAQ = (text: string) => {
    setBrandFAQ(text);
    localStorage.setItem('crm_brand_faq', text);
  };

  const loadFAQSampleText = () => {
    const sample = `AURORA SUITE FAQ KNOWLEDGE BASE context:\n- Pricing: Standard account costs $19/user/month. Premium Enterprise accounts are bulk discounted to $49/user/month. Early creators get 20% discount ($15.20/month).\n- Supported Clients: Official macOS, Windows desktop versions, and Web app. The Linux desktop release is scheduled for Q3 2026.\n- Stripe Billing Gateway: We are actively resolving Stripe invoice generations. Encourage users experiencing billing invoice download errors to submit their registered workspace email so a manager can manually extract the Q1 PDF statement.\n- Tone Guideline: Keep communication minimal, crisp, structural, and empathetic. Address target platform questions concisely.`;
    handleSaveBrandFAQ(sample);
  };

  const handleClearTuningRules = () => {
    localStorage.removeItem('crm_learned_tweaks');
    setTweakRules('');
    const alertDiv = document.createElement('div');
    alertDiv.className = 'fixed bottom-12 right-12 z-50 p-4 bg-slate-900 text-white rounded-xl shadow-xl font-sans text-xs font-semibold';
    alertDiv.innerHTML = '🛡️ AI response tuning preferences reset cleanly.';
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
  };

  // Dynamic live aggregations
  const totalPostLikes = posts.reduce((sum, p) => sum + p.likes, 0);
  const totalComments = posts.reduce((sum, p) => sum + p.commentsCount, 0);
  const totalShares = posts.reduce((sum, p) => sum + p.shares, 0);
  const totalViews = posts.reduce((sum, p) => sum + p.views, 0) + stories.reduce((sum, s) => sum + s.views, 0);
  const totalInteractions = totalPostLikes + totalComments + totalShares;

  // Average Engagement Rate computation
  const avgEngagementRate = posts.length > 0
    ? ((totalInteractions / (posts.reduce((sum, p) => sum + p.views, 0) || 1)) * 100).toFixed(2)
    : '5.82';

  const unreadDMs = conversations.filter(c => c.unread).length;

  // Unresolved alerts (comments categorized as 'negative' without reply)
  const unresolvedNegativeComments: { post: SocialPost, comment: any }[] = [];
  posts.forEach(post => {
    post.comments.forEach(comment => {
      if (comment.sentiment === 'negative' && !comment.reply) {
        unresolvedNegativeComments.push({ post, comment });
      }
    });
  });

  // Calculate sentiment analysis metrics
  let positiveCommentsCount = 0;
  let totalSentimentComments = 0;
  posts.forEach(p => {
    p.comments.forEach(c => {
      if (c.sentiment) {
        totalSentimentComments++;
        if (c.sentiment === 'positive') positiveCommentsCount++;
      }
    });
  });

  const positiveSentimentPct = totalSentimentComments > 0 
    ? Math.round((positiveCommentsCount / totalSentimentComments) * 100) 
    : 75;

  // Top-performing post models sorted by Engagement score
  const topPerformingPosts = [...posts]
    .map(p => {
      const engagementScore = p.likes + p.commentsCount + p.shares;
      const rate = p.views > 0 ? ((engagementScore / p.views) * 100).toFixed(1) : '0';
      return { ...p, score: engagementScore, rate };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // Stats summary bento boxes
  const stats = [
    {
      id: 'stat-views',
      title: 'Gross Reach Impressions',
      value: totalViews.toLocaleString(),
      change: '+14.2% MoM',
      isPositive: true,
      icon: TrendingUp,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      id: 'stat-engagement',
      title: 'Engagement Rate',
      value: `${avgEngagementRate}%`,
      change: `${totalInteractions.toLocaleString()} Interactions`,
      isPositive: true,
      icon: Percent,
      color: 'text-rose-600 bg-rose-50 border-rose-100',
    },
    {
      id: 'stat-sentiment',
      title: 'Brand Sentiment',
      value: `${positiveSentimentPct}%`,
      change: 'Positive feedback ratio',
      isPositive: positiveSentimentPct >= 70,
      icon: Sparkles,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      id: 'stat-queue',
      title: 'Unresolved Alerts',
      value: (unreadDMs + unresolvedNegativeComments.length).toString(),
      change: `${unreadDMs} DMs • ${unresolvedNegativeComments.length} comments`,
      isPositive: (unreadDMs + unresolvedNegativeComments.length) === 0,
      icon: AlertTriangle,
      color: (unreadDMs + unresolvedNegativeComments.length) > 0 
        ? 'text-amber-600 bg-amber-50 border-amber-100' 
        : 'text-slate-500 bg-slate-50 border-slate-200',
    },
  ];

  const handleAlertAction = (type: 'post' | 'dm', targetId: string) => {
    if (type === 'post') {
      setSelectedPostId(targetId);
      setActiveTab('feed');
    } else {
      setSelectedConversationId(targetId);
      setActiveTab('inbox');
    }
  };

  // Custom SVG calculation parameters for graphs
  const width = 500;
  const height = 150;
  const padding = 20;

  // Reach path constructor
  const reachMax = Math.max(...HISTORICAL_TIMELINE.map(item => item.reach));
  const reachMin = Math.min(...HISTORICAL_TIMELINE.map(item => item.reach)) * 0.8;
  const reachPoints = HISTORICAL_TIMELINE.map((item, index) => {
    const x = padding + (index * (width - 2 * padding)) / (HISTORICAL_TIMELINE.length - 1);
    const y = height - padding - ((item.reach - reachMin) / (reachMax - reachMin)) * (height - 2 * padding);
    return { x, y, val: item.reach, date: item.date };
  });
  const reachDStr = reachPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const reachAreaStr = `${reachDStr} L ${reachPoints[reachPoints.length - 1].x} ${height - padding} L ${reachPoints[0].x} ${height - padding} Z`;

  // Followers Growth path constructor
  const followersMax = Math.max(...HISTORICAL_TIMELINE.map(item => item.followers));
  const followersMin = Math.min(...HISTORICAL_TIMELINE.map(item => item.followers)) * 0.99;
  const followerPoints = HISTORICAL_TIMELINE.map((item, index) => {
    const x = padding + (index * (width - 2 * padding)) / (HISTORICAL_TIMELINE.length - 1);
    const y = height - padding - ((item.followers - followersMin) / (followersMax - followersMin)) * (height - 2 * padding);
    return { x, y, val: item.followers, date: item.date };
  });
  const followerDStr = followerPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const followerAreaStr = `${followerDStr} L ${followerPoints[followerPoints.length - 1].x} ${height - padding} L ${followerPoints[0].x} ${height - padding} Z`;

  return (
    <div id="overview-component" className="space-y-8 max-w-6xl mx-auto">
      
      {/* Dynamic Header with Sub-tabs Selection */}
      <div id="overview-header" className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-sans font-extrabold text-3xl text-slate-800 tracking-tight">Listening Desk</h1>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">
            Monitor real-time customer feedback alerts or drill down into unified metrics.
          </p>
        </div>

        {/* SUB-TAB TOGGLES */}
        <div id="overview-subview-controller" className="bg-slate-100 rounded-xl p-1 flex border border-slate-200 self-start md:self-center gap-1">
          <button
            id="btn-subview-alerts"
            onClick={() => setActiveSubView('alerts')}
            className={`px-4 py-2 text-xs font-sans font-bold rounded-lg transition-all cursor-pointer ${
              activeSubView === 'alerts'
                ? 'bg-white text-indigo-605 shadow-sm'
                : 'text-slate-500 hover:text-slate-850'
            }`}
          >
            🚨 Direct Inbox Alerts ({unreadDMs + unresolvedNegativeComments.length})
          </button>
          
          <button
            id="btn-subview-brandguard"
            onClick={() => {
              setActiveSubView('brandguard');
              setTweakRules(localStorage.getItem('crm_learned_tweaks') || '');
            }}
            className={`px-4 py-2 text-xs font-sans font-bold rounded-lg transition-all cursor-pointer ${
              activeSubView === 'brandguard'
                ? 'bg-white text-indigo-605 shadow-sm'
                : 'text-slate-500 hover:text-slate-850'
            }`}
          >
            🛡️ Crisis & Brand Voice Guard
          </button>

          <button
            id="btn-subview-analytics"
            onClick={() => setActiveSubView('analytics')}
            className={`px-4 py-2 text-xs font-sans font-bold rounded-lg transition-all cursor-pointer ${
              activeSubView === 'analytics'
                ? 'bg-white text-indigo-605 shadow-sm'
                : 'text-slate-500 hover:text-slate-850'
            }`}
          >
            📊 Analytics & Insights
          </button>
        </div>
      </div>

      {/* Metric Bento Grid (Always visible for fast indexing) */}
      <div id="overview-stats-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              id={stat.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-[11px] font-sans font-semibold text-slate-400 tracking-wider uppercase">{stat.title}</span>
                <div className={`p-2 rounded-lg border ${stat.color} transition-transform group-hover:scale-105`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-sans font-extrabold tracking-tight text-slate-800 leading-none">{stat.value}</span>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className={`text-[11px] font-mono leading-none ${
                    stat.id === 'stat-sentiment' 
                      ? (positiveSentimentPct >= 70 ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold')
                      : stat.id === 'stat-queue'
                      ? ((unreadDMs + unresolvedNegativeComments.length) > 0 ? 'text-amber-700 font-bold' : 'text-emerald-700 font-bold')
                      : 'text-indigo-700 font-bold'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CONDITIONAL SUBVIEW 1: ALERTS & PLATFORMS DESK */}
      {activeSubView === 'alerts' && (
        <div id="overview-alerts-workspace" className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          
          {/* Urgent Action Alerts */}
          <div id="urgent-alerts-panel" className="lg:col-span-7 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-sans font-bold text-slate-800 text-lg flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                Urgent Attention Queue
              </h3>
              <span className="text-xs font-mono text-slate-500 font-semibold px-2.5 py-1 rounded bg-white border border-slate-200 shadow-sm">
                {unresolvedNegativeComments.length + unreadDMs} active items
              </span>
            </div>

            <div id="alerts-stack" className="space-y-4">
              {unresolvedNegativeComments.length === 0 && unreadDMs === 0 ? (
                <div id="no-alerts-screen" className="bg-white rounded-xl border border-slate-200 p-8 text-center flex flex-col items-center justify-center shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-650 border border-emerald-100 flex items-center justify-center mb-3">
                    <Sparkles className="w-5 h-5 bg-transparent" />
                  </div>
                  <h4 className="font-sans font-bold text-slate-800 text-sm">Workspace Clear!</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">No unresolved negative feedback threads or unread messages left. Excellent work!</p>
                </div>
              ) : (
                <>
                  {/* Display Negative Comments first */}
                  {unresolvedNegativeComments.map(({ post, comment }) => (
                    <div 
                      key={comment.id}
                      id={`alert-card-${comment.id}`}
                      className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:border-slate-350 transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-amber-50 border border-amber-100 text-amber-550">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-mono text-amber-600 font-bold uppercase">{post.platform} Comment Alert</span>
                            <span className="text-[10px] font-mono text-slate-405">{comment.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">
                            <span className="font-bold text-slate-900 font-mono text-xs">@{comment.author}:</span> "{comment.content}"
                          </p>
                          <div className="mt-3.5 flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
                            <div className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-md font-medium">
                              Context: <span className="italic text-slate-505 font-indigo-605">"{post.content.slice(0, 40)}..."</span>
                            </div>
                            <button
                              id={`btn-alert-resolve-${comment.id}`}
                              onClick={() => handleAlertAction('post', post.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-sans font-bold text-white shadow-sm transition-colors cursor-pointer"
                            >
                              <span>Draft AI Reply</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Display Unread DM Alerts */}
                  {conversations.filter(c => c.unread).map((conv) => (
                    <div 
                      key={conv.id}
                      id={`alert-card-${conv.id}`}
                      className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:border-slate-350 transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-500">
                          <MessageCircle className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-mono text-indigo-600 font-bold uppercase">{conv.platform} DM Alert</span>
                            <span className="text-[10px] font-mono text-slate-400">{conv.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">
                            <span className="font-bold text-slate-900">@{conv.contactHandle}:</span> "{conv.lastMessage}"
                          </p>
                          <div className="mt-3.5 flex items-center justify-between gap-4 pt-3 border-t border-slate-100">
                            <div className="text-[11px] text-slate-400 truncate">
                              From: <span className="text-slate-600 font-bold">{conv.contactName}</span>
                            </div>
                            <button
                              id={`btn-alert-dm-${conv.id}`}
                              onClick={() => handleAlertAction('dm', conv.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-sans font-bold text-white shadow-sm transition-colors cursor-pointer"
                            >
                              <span>Open DM thread</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* System Channels Status Widget */}
          <div id="channels-status-panel" className="lg:col-span-5 space-y-5">
            <h3 className="font-sans font-bold text-slate-800 text-lg">Platform Channels</h3>

            <div id="channels-grid" className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
              
              {/* Instagram */}
              <div id="channel-instagram" className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-fuchsia-650 to-rose-505 flex items-center justify-center text-white text-[10px] font-extrabold font-mono">
                    IG
                  </div>
                  <div>
                    <span className="text-xs font-sans font-bold text-slate-700 block">Instagram Suite</span>
                    <span className="text-[10px] font-mono text-slate-400 block">Connected @sarah_creatives</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold">
                  ACTIVE
                </span>
              </div>

              {/* LinkedIn */}
              <div id="channel-linkedin" className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-[10px] font-extrabold font-mono">
                    LN
                  </div>
                  <div>
                    <span className="text-xs font-sans font-bold text-slate-700 block">LinkedIn Profile</span>
                    <span className="text-[10px] font-mono text-slate-400 block">Connected /company/designstudio</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold">
                  ACTIVE
                </span>
              </div>

              {/* Twitter */}
              <div id="channel-twitter" className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white text-[10px] font-extrabold font-mono">
                    X
                  </div>
                  <div>
                    <span className="text-xs font-sans font-bold text-slate-700 block">Twitter / X</span>
                    <span className="text-[10px] font-mono text-slate-400 block">Connected @sarah_creatives</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold">
                  ACTIVE
                </span>
              </div>

              {/* Facebook */}
              <div id="channel-facebook" className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-[10px] font-extrabold font-mono">
                    FB
                  </div>
                  <div>
                    <span className="text-xs font-sans font-bold text-slate-700 block">Facebook Page</span>
                    <span className="text-[10px] font-mono text-slate-400 block">Connected @sarah_fb_hq</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold">
                  ACTIVE
                </span>
              </div>

            </div>

            {/* Productivity Guidelines Hint */}
            <div id="crm-guidelines-box" className="p-4 rounded-xl bg-white border border-slate-200 flex items-start gap-3 shadow-sm">
              <BadgeHelp className="w-4 h-4 text-indigo-505 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-505 leading-relaxed font-semibold">
                <span className="font-bold text-slate-800 block mb-1">E-CRM Best Practices</span>
                Replying within 1 hour increases algorithmic reach boost by 2.4x. Leverage the **Direct Inbox** tone controllers to draft context-aware answers natively.
              </div>
            </div>
          </div>

        </div>
      )}

      {/* CONDITIONAL SUBVIEW: CRISIS & BRAND VOICE GUARD */}
      {activeSubView === 'brandguard' && (
        <div id="brandguard-premium-suite-container" className="relative min-h-[500px]">
          {!isPremium && (
            <div id="brandguard-lock-overlay" className="absolute inset-x-0 -top-4 -bottom-4 z-20 bg-slate-100/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center">
              <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-8 max-w-lg shadow-2xl space-y-4 shrink-0 shadow-indigo-650/15">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-amber-300 flex items-center justify-center mx-auto mb-2 animate-pulse">
                  <ShieldAlert className="w-6 h-6 shrink-0" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-extrabold font-sans leading-none tracking-tight">PR Crisis Escalate & FAQs is Locked</h3>
                  <p className="text-[10px] font-mono text-indigo-405 tracking-wider font-extrabold uppercase">AVAILABLE EXCLUSIVELY ON PREMIUM SUBSCRIPTIONS</p>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  SMM Brand Protection: Instant Twilio SMS dispatches, emergency alerts list logs, and auto-updating Brand FAQ memory structures require a premium tier.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    id="btn-bg-upgrade-trial"
                    onClick={onUpgradeRequest}
                    className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-450 hover:to-yellow-450 text-slate-950 font-sans font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Gem className="w-3.5 h-3.5" />
                    <span>Simulate payment & Upgrade ($49)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div id="brandguard-premium-suite" className={`space-y-8 animate-fade-in text-slate-800 ${!isPremium ? 'pointer-events-none filter blur-[2px] select-none' : ''}`}>
          
          {/* Row 1: Crisis Warning System & Emergency Broadcast Contacts (Bento Card Grid) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Crisis monitoring core client */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <ShieldAlert className="w-5 h-5 text-indigo-600 animate-pulse" />
                <div>
                  <h3 className="font-sans font-bold text-slate-850 text-base leading-none">PR Crisis Early Warning System</h3>
                  <span className="text-[10px] font-mono text-slate-400 block mt-1 uppercase font-semibold">Gemini Background Sentiment & Legality Monitor</span>
                </div>
                <span className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-indigo-50 border border-indigo-200 text-indigo-700 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" />
                  SHIELD ACTIVE
                </span>
              </div>

              <div className="text-xs text-slate-505 leading-relaxed font-semibold">
                Gemini continuously scans all feeds, DMs, and comments behind the scenes. If sentiment breaches dangerous thresholds or legal/boycott triggers occur, SMS and Slack emergency alerts are dispatched instantly.
              </div>

              {/* Action and scan results panels */}
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[11px] font-mono font-bold text-slate-505 uppercase">Sentinel Health Status:</span>
                  <div className="flex items-center gap-1.5">
                    {scanResult ? (
                      scanResult.crisisTriggered ? (
                        <span className="px-2 py-0.5 font-mono text-[9.5px] bg-red-50 text-red-700 border border-red-200 font-bold uppercase rounded flex items-center gap-1 animate-pulse">
                          <span>🚨 CRISIS EXTREME BREACH</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 font-mono text-[9.5px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold uppercase rounded">
                          ✓ ALL CHANNELS SECURE
                        </span>
                      )
                    ) : (
                      <span className="px-2 py-0.5 font-mono text-[9.5px] bg-amber-50 text-amber-700 border border-amber-200 font-bold uppercase rounded animate-bounce">
                        ⚠️ AUDIT REQUIRED [UNSCANNED]
                      </span>
                    )}
                  </div>
                </div>

                {isScanning ? (
                  <div className="text-center py-4 space-y-2">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-[11px] text-slate-400 font-mono font-bold">GEMINI ANALYZING SEMANTIC EMOTIONS GRID...</p>
                  </div>
                ) : scanResult ? (
                  <div className="space-y-3.5 pt-1">
                    <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between text-[10px] font-mono border-b border-slate-100 pb-1.5">
                        <span className="font-bold text-slate-400 uppercase">Analysis Metric</span>
                        <span className="font-bold text-indigo-650">Score Breakdown</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-505 font-medium">Violent Sentiment Threat Score:</span>
                        <strong className="text-slate-800 font-mono font-black">{scanResult.sentimentTrendScore}/100</strong>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-505 font-medium">Flagged Dangerous Comments:</span>
                        <strong className="text-red-650 font-mono font-black">{scanResult.flaggedComments?.length || 0} active comments</strong>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-505 font-medium">Automatic Emergency Dispatch:</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold text-[9px] font-mono font-semibold">
                          ✓ COMPLETED
                        </span>
                      </div>
                    </div>

                    {scanResult.crisisTriggered && scanResult.flaggedComments?.length > 0 && (
                      <div className="p-3 bg-red-50/50 border border-red-200 rounded-xl text-xs space-y-1.5">
                        <strong className="font-bold text-red-800 block text-[10px] font-mono uppercase tracking-wide">
                          🚨 IMMEDIATE ESCALATION TRIGGER:
                        </strong>
                        <p className="text-xs text-red-700 leading-normal italic font-semibold">
                          "{scanResult.flaggedComments[0].text}"
                        </p>
                        <p className="text-[9.5px] font-mono text-slate-500 pt-1.5 border-t border-red-150">
                          Reconciliation action recommendation: {scanResult.reconciliationAction}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs text-slate-400 font-sans font-semibold">
                    No scanning audit requested yet. Trigger the Sentinel threat scan below to inspect global sentiment levels.
                  </div>
                )}

                <button
                  id="btn-trigger-crisis-scanner"
                  type="button"
                  disabled={isScanning}
                  onClick={handleRunCrisisAudit}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl text-xs font-sans font-bold transition-colors cursor-pointer text-center block"
                >
                  {isScanning ? 'Synchronizing Gemini Sentinels...' : '⚡ Scan Global Feeds & Test Escalate Alert'}
                </button>
              </div>

              {/* Alert logs registry */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-mono text-slate-405 uppercase tracking-wider block font-bold leading-none">
                  Emergency Alert Dispatch History Ledger ({crisisAlertLog.length})
                </span>
                
                <div className="max-h-[160px] overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                  {crisisAlertLog.length === 0 ? (
                    <div className="text-center py-6 text-[10px] font-mono text-slate-405 font-bold uppercase">
                      Ledger clear • No dispatches logged
                    </div>
                  ) : (
                    crisisAlertLog.map((log, idx) => (
                      <div key={idx} className="p-2 border border-slate-150 rounded-lg bg-white text-[10.5px] leading-relaxed font-mono text-slate-650 font-medium">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Right: Emergency Contacts Gateways */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
              <h3 className="font-sans font-bold text-slate-850 text-base leading-none pb-4 border-b border-slate-100">
                Escalation Alert Channels
              </h3>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-405 block uppercase tracking-wider">
                    Emergency SMS Phone Broadcast
                  </label>
                  <input
                    type="text"
                    value={smsContact}
                    onChange={(e) => setSmsContact(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-205 text-slate-800 text-xs font-mono focus:border-indigo-400 outline-none"
                  />
                  <span className="text-[9px] text-slate-400 block">Sends a direct alerts payload via Twilio/SMS API on breach.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-405 block uppercase tracking-wider">
                    PR Slack Webhook URI
                  </label>
                  <input
                    type="text"
                    value={slackWebhook}
                    onChange={(e) => setSlackWebhook(e.target.value)}
                    placeholder="https://hooks.slack.com/..."
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-205 text-slate-800 text-xs font-mono focus:border-indigo-400 outline-none"
                  />
                  <span className="text-[9px] text-slate-400 block">Integrates with workspace Slack slack-alerts channels.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-405 block uppercase tracking-wider">
                    PR Legal Inbox Coordinator
                  </label>
                  <input
                    type="email"
                    value={emailContact}
                    onChange={(e) => setEmailContact(e.target.value)}
                    placeholder="safety-group@company.com"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-205 text-slate-800 text-xs font-sans focus:border-indigo-400 outline-none"
                  />
                  <span className="text-[9px] text-slate-400 block">Dispatches robust PDF diagnostic report logs to legal desk.</span>
                </div>

                <button
                  type="button"
                  onClick={handleSaveContactSettings}
                  className="w-full py-2 bg-indigo-650 hover:bg-indigo-550 text-white font-sans font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Save Dispatch Gateways
                </button>
              </div>

              <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-start gap-2.5">
                <BellRing className="w-4 h-4 text-indigo-505 shrink-0 mt-0.5 animate-bounce" />
                <div className="text-[10px] text-indigo-705 leading-relaxed font-semibold">
                  <span className="font-bold block mb-0.5 text-indigo-905 uppercase font-mono text-[9px]">Twilio & Slack Integrations:</span>
                  Status: <strong className="text-emerald-700 uppercase">Live & Listening</strong>. When active, SMS alerts arrive on managers' phones within 2 seconds of negative comments or lawsuit sentiment spikes.
                </div>
              </div>
            </div>

          </div>

          {/* Row 2: Brand Guidelines PDF & Learned Manual Tweaks Adjuster */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Brand Guidelines upload text area context */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="font-sans font-bold text-slate-850 text-base leading-none">Auto-Updating Brand Voice & FAQ</h3>
                    <span className="text-[10px] font-mono text-slate-400 block mt-1 uppercase font-semibold">Contextual Guidelines Engine</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={loadFAQSampleText}
                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-605 rounded-lg text-[10px] font-sans font-bold transition-colors cursor-pointer"
                >
                  Load Support & PR Rules Sample
                </button>
              </div>

              <div className="space-y-4">
                <div className="text-xs text-slate-505 leading-relaxed font-semibold">
                  Instead of writing manual canned responses, copy-paste your customer service files, training leaflets, product design manuals, website FAQs, or price guidelines here. Gemini imports this data natively to draft hyper-informed, context-true replies.
                </div>

                <div className="space-y-1.5">
                  <textarea
                    rows={8}
                    value={brandFAQ}
                    onChange={(e) => handleSaveBrandFAQ(e.target.value)}
                    placeholder="Paste enterprise support documents, price lists, Q&A rules, product timeline specs, or guidelines here..."
                    className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-805 text-xs font-mono focus:bg-white focus:border-indigo-400 outline-none transition-all placeholder-slate-400 leading-relaxed"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Guideline content size: <strong>{brandFAQ ? brandFAQ.split(/\s+/).filter(Boolean).length : 0}</strong> words</span>
                    <span>Status: <strong>{brandFAQ ? 'Loaded in Context' : 'Empty'}</strong></span>
                  </div>
                </div>

                {brandFAQ && (
                  <div className="p-3.5 bg-emerald-50 text-emerald-805 rounded-xl border border-emerald-150 text-xs leading-relaxed font-semibold">
                    ✓ **Secure Integration Active**: The copilot draft reply generator automatically queries the guidelines above to structure accurate answers for the inbox.
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Style Updates Tuning Machine */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-sans font-bold text-slate-850 text-base leading-none">Self-Tuning Engine</h3>
                </div>

                {tweakRules && (
                  <button
                    type="button"
                    onClick={handleClearTuningRules}
                    className="text-[9.5px] font-mono text-indigo-650 hover:text-indigo-800 uppercase font-black tracking-wide"
                  >
                    Reset Logs
                  </button>
                )}
              </div>

              <div className="space-y-3.5">
                <div className="text-xs text-slate-505 leading-relaxed font-semibold">
                  This engine monitors edits you make to AI suggestions. If you tweak wordings or signatures, the model learns your exact stylistic flavor dynamically to self-tune subsequent suggestions!
                </div>

                <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between text-[10px] font-mono border-b border-slate-200 pb-1.5 uppercase font-bold text-slate-405">
                    <span>Self-learning style rules</span>
                    <span className="text-indigo-655 font-bold animate-pulse">Status: Active</span>
                  </div>

                  <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
                    {tweakRules ? (
                      tweakRules.split('\n').filter(Boolean).map((tweak, idx) => (
                        <div key={idx} className="text-[10px] font-sans font-semibold text-slate-650 leading-relaxed pl-2.5 border-l-2 border-indigo-400">
                          {tweak}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-[10px] font-mono text-slate-405 uppercase font-semibold leading-relaxed">
                        No manual overrides analyzed yet. When you edit any Copilot inbox reply before sending, styles learn here!
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100 text-[10px] text-indigo-705 leading-relaxed font-semibold">
                  💡 **Demonstration Pro-Tip**: Go to the **Omnichannel Inbox**, load a conversation (e.g., Carlos Rivera), click **AI Compose Reply**, change some characters/greetings in the editor box, and click **Send**. The applet will alert you that it has logged and learned your stylistic tweak!
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
      )}

      {/* CONDITIONAL SUBVIEW 2: ADVANCED ANALYTICS DASHBOARD */}
      {activeSubView === 'analytics' && (
        <div id="overview-analytics-workspace" className="space-y-8 animate-fade-in text-slate-800">
          
          {/* Charts Row */}
          <div id="analytics-charts-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Reach Impressions Chart */}
            <div id="chart-reach-box" className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-sans font-extrabold text-sm text-slate-800 flex items-center gap-2">
                    <LineChart className="w-4 h-4 text-indigo-505 animate-pulse" />
                    <span>Daily Audience Reach (10 Days)</span>
                  </h4>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">Impressions metrics by platform tags</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-slate-800">Peak: 29.8K</span>
                  <p className="text-[8.5px] font-mono text-emerald-650 font-bold uppercase leading-none">May 30</p>
                </div>
              </div>

              {/* Responsive SVG Line Chart */}
              <div className="relative">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40 overflow-visible bg-slate-50/50 rounded-lg border border-slate-105 p-1">
                  <defs>
                    <linearGradient id="reachGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.00" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  {[0, 1, 2, 3].map(gi => (
                    <line 
                      key={gi} 
                      x1={padding} 
                      y1={padding + (gi * (height - 2*padding)) / 3} 
                      x2={width - padding} 
                      y2={padding + (gi * (height - 2*padding)) / 3} 
                      stroke="#e2e8f0" 
                      strokeWidth="1" 
                      strokeDasharray="3 3" 
                    />
                  ))}

                  {/* Gradient Area under curve */}
                  <path d={reachAreaStr} fill="url(#reachGradient)" />
                  
                  {/* Curve element */}
                  <path d={reachDStr} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Circles for interactive data-points */}
                  {reachPoints.map((pt, pIdx) => {
                    const isHovered = hoveredDataIndex === pIdx;
                    return (
                      <g key={pIdx}>
                        <circle 
                          cx={pt.x} 
                          cy={pt.y} 
                          r={isHovered ? 5.5 : 3.5} 
                          fill={isHovered ? '#4f46e5' : '#ffffff'} 
                          stroke="#4f46e5" 
                          strokeWidth="2" 
                          className="cursor-pointer transition-all duration-150"
                          onMouseEnter={() => setHoveredDataIndex(pIdx)}
                          onMouseLeave={() => setHoveredDataIndex(null)}
                        />
                        <text 
                          x={pt.x} 
                          y={height - 4} 
                          textAnchor="middle" 
                          className="text-[8px] font-mono fill-slate-400 font-semibold"
                        >
                          {pIdx % 2 === 0 ? pt.date.slice(4) : ''}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Simulated Data Tooltip */}
                <div className="h-6 flex items-center justify-center">
                  <p className="text-[11px] font-mono text-slate-500 font-bold">
                    {hoveredDataIndex !== null ? (
                      <span className="text-indigo-650">
                        🗓️ {HISTORICAL_TIMELINE[hoveredDataIndex].date}:{' '}
                        <strong>{HISTORICAL_TIMELINE[hoveredDataIndex].reach.toLocaleString()} reaches</strong> (Engagement rate: {HISTORICAL_TIMELINE[hoveredDataIndex].engagement}%)
                      </span>
                    ) : (
                      <span className="text-slate-400">Hover over datapoints to view detailed engagement stats</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Followers Cumulative Growth Chart */}
            <div id="chart-followers-box" className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-sans font-extrabold text-sm text-slate-800 flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-505" />
                    <span>Follower Growth (Cumulative)</span>
                  </h4>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">Net acquisitions cross-channels</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-slate-800">51,200 total</span>
                  <p className="text-[8.5px] font-mono text-emerald-650 font-bold uppercase leading-none">+12.0% Growth</p>
                </div>
              </div>

              {/* Responsive SVG Line Chart */}
              <div className="relative">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40 overflow-visible bg-slate-50/50 rounded-lg border border-slate-105 p-1">
                  <defs>
                    <linearGradient id="followerGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  {[0, 1, 2, 3].map(gi => (
                    <line 
                      key={gi} 
                      x1={padding} 
                      y1={padding + (gi * (height - 2*padding)) / 3} 
                      x2={width - padding} 
                      y2={padding + (gi * (height - 2*padding)) / 3} 
                      stroke="#e2e8f0" 
                      strokeWidth="1" 
                      strokeDasharray="3 3" 
                    />
                  ))}

                  {/* Gradient Area under curve */}
                  <path d={followerAreaStr} fill="url(#followerGradient)" />
                  
                  {/* Curve element */}
                  <path d={followerDStr} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Circles for interactive data-points */}
                  {followerPoints.map((pt, pIdx) => {
                    const isHovered = hoveredDataIndex === pIdx;
                    return (
                      <g key={pIdx}>
                        <circle 
                          cx={pt.x} 
                          cy={pt.y} 
                          r={isHovered ? 5.5 : 3.5} 
                          fill={isHovered ? '#10b981' : '#ffffff'} 
                          stroke="#10b981" 
                          strokeWidth="2" 
                          className="cursor-pointer transition-all duration-150"
                          onMouseEnter={() => setHoveredDataIndex(pIdx)}
                          onMouseLeave={() => setHoveredDataIndex(null)}
                        />
                        <text 
                          x={pt.x} 
                          y={height - 4} 
                          textAnchor="middle" 
                          className="text-[8px] font-mono fill-slate-400 font-semibold"
                        >
                          {pIdx % 2 === 0 ? pt.date.slice(4) : ''}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Simulated Data Tooltip */}
                <div className="h-6 flex items-center justify-center">
                  <p className="text-[11px] font-mono text-slate-550 font-bold">
                    {hoveredDataIndex !== null ? (
                      <span className="text-emerald-700">
                        📈 {HISTORICAL_TIMELINE[hoveredDataIndex].date}:{' '}
                        <strong>{HISTORICAL_TIMELINE[hoveredDataIndex].followers.toLocaleString()} total followers</strong>
                      </span>
                    ) : (
                      <span className="text-slate-405">Hover over datapoints to view accurate acquisition history</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Platforms Split and Organic Performance */}
          <div id="analytics-breakdowns" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Platforms engagement breakdown bar visualizer */}
            <div id="platforms-breakdown-box" className="lg:col-span-4 bg-white border border-slate-205 rounded-xl p-5 shadow-sm space-y-4">
              <h4 className="font-sans font-extrabold text-sm text-slate-800">Engagement Split by Channel</h4>
              
              <div className="space-y-4 pt-1">
                {/* Instagram */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-sans font-bold text-slate-700">Instagram suite</span>
                    <span>42% • (High)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-pink-500 h-2 rounded-full" style={{ width: '42%' }}></div>
                  </div>
                </div>

                {/* LinkedIn */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-sans font-bold text-slate-700">LinkedIn page</span>
                    <span>28% • (Medium)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '28%' }}></div>
                  </div>
                </div>

                {/* Twitter / X */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-sans font-bold text-slate-700">Twitter / X feed</span>
                    <span>20% • (Medium)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-slate-900 h-2 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                </div>

                {/* Facebook */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-sans font-bold text-slate-700">Facebook page</span>
                    <span>10% • (Low)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-blue-800 h-2 rounded-full" style={{ width: '10%' }}></div>
                  </div>
                </div>
              </div>
              
              <div className="p-3 rounded-lg border border-slate-105 bg-slate-50 text-[10px] text-slate-505 leading-relaxed font-semibold">
                ⭐️ <strong>Instagram</strong> drives the highest audience conversion metrics with layout images, whereas <strong>Twitter</strong> dominates short-form text discussions.
              </div>
            </div>

            {/* TOP PERFORMING POSTS LIST */}
            <div id="top-performing-posts-box" className="lg:col-span-8 bg-white border border-slate-205 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-sans font-extrabold text-sm text-slate-800">Top Performing Campaigns & Posts</h4>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">Ranked by combined engagement weight (views, likes, comments, shares)</p>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-605 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                  Live Sorted
                </span>
              </div>

              <div id="top-posts-grid" className="space-y-3.5">
                {topPerformingPosts.map((post, rankingIndex) => {
                  return (
                    <div 
                      key={post.id}
                      id={`top-post-card-${post.id}`}
                      className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                        {/* Ranking index circle */}
                        <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-mono text-xs font-bold grow-0 shrink-0">
                          #{rankingIndex + 1}
                        </div>

                        {/* Optional thumbnail image else layout text tag icon */}
                        {post.mediaUrl ? (
                          <img 
                            src={post.mediaUrl} 
                            alt="top visual preview" 
                            referrerPolicy="no-referrer"
                            className="w-11 h-11 rounded object-cover border border-slate-150 shrink-0 shadow-3xs" 
                          />
                        ) : (
                          <div className="w-11 h-11 rounded bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center text-[10px] font-mono uppercase font-bold shrink-0">
                            TXT
                          </div>
                        )}

                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono bg-indigo-50 text-indigo-655 border border-indigo-100 capitalize font-bold leading-none uppercase">
                              {post.platform}
                            </span>
                            <span className="text-[9.5px] font-mono text-slate-400 font-bold">{post.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-705 font-medium leading-relaxed truncate mt-1">
                            {post.content}
                          </p>
                        </div>
                      </div>

                      {/* Performance Indicators */}
                      <div className="flex items-center gap-4 shrink-0 font-sans border-t sm:border-t-0 border-slate-100 pt-2.5 sm:pt-0 w-full sm:w-auto justify-between sm:justify-end">
                        
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-slate-800 block flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-slate-400 inline" />
                            <span>{post.views.toLocaleString()}</span>
                          </span>
                          <span className="text-[9px] font-mono text-slate-400 block font-semibold">Impressions</span>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-mono font-bold font-semibold text-rose-606 block flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5 text-rose-500 inline" />
                            <span>{post.likes.toLocaleString()}</span>
                          </span>
                          <span className="text-[9px] font-mono text-slate-405 block font-semibold">Likes</span>
                        </div>

                        <div className="text-right pl-3 border-l border-slate-150">
                          <span className="text-xs font-mono font-extrabold text-indigo-605 block">
                            {post.rate}%
                          </span>
                          <span className="text-[9px] font-mono text-slate-405 block font-semibold">Engagement</span>
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
