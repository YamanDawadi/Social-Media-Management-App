import { useState, useEffect } from 'react';
import { SocialPost, Conversation, InsightSummaryResponse } from '../types';
import { 
  Sparkles, 
  BarChart3, 
  HelpCircle, 
  ArrowRight, 
  RefreshCw, 
  Layers, 
  CheckSquare,
  TrendingUp,
  UserSearch,
  ShieldAlert,
  Video,
  Zap,
  Award,
  FileText,
  Lock,
  Gem
} from 'lucide-react';

interface InsightsDeskProps {
  posts: SocialPost[];
  conversations: Conversation[];
  isPremium?: boolean;
  onUpgradeRequest?: () => void;
}

export default function InsightsDesk({ 
  posts, 
  conversations,
  isPremium = false,
  onUpgradeRequest
}: InsightsDeskProps) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<InsightSummaryResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Sub-tabs in insights lobby
  const [subView, setSubView] = useState<'feedback' | 'recon' | 'goldmines'>('feedback');

  // Competitor Recon state
  const [competitorHandle, setCompetitorHandle] = useState('@linear_collabs');
  const [reconLoading, setReconLoading] = useState(false);
  const [reconReport, setReconReport] = useState<any | null>(null);

  // Content Goldmines state
  const [goldminesLoading, setGoldminesLoading] = useState(false);
  const [goldminesReport, setGoldminesReport] = useState<any | null>(null);

  const handlePerformRecon = async () => {
    setReconLoading(true);
    try {
      const response = await fetch('/api/competitor-recon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: competitorHandle })
      });
      if (!response.ok) throw new Error('Recon audit failed');
      const data = await response.json();
      setReconReport(data);
    } catch (e) {
      // Mock gap fallback
      setReconReport({
        competitorName: competitorHandle || '@linear_collabs',
        weaknesses: [
          "Enterprise seat price starts at high baseline cost tier ($29/month/seat)",
          "Followers complain extensively about Electron canvas memory leaks in long sessions",
          "Lack of automatic PDF invoice billing generation templates during credit renewals"
        ],
        opportunities: [
          "Highlight Aurora standalone native C++ renderer benchmark speeds (under 150MB overhead)",
          "Run ad campaigns focusing on immediate standard receipt exports to resolve accounting blocks",
          "Acquire creators highlighting pricing stability with robust Linux/Ubuntu local packages"
        ],
        offensiveMarketingPlaybook: {
          linkedinHeadline: "RAM efficiency is the ultimate collaborative luxury.",
          hook: "Your team workspace shouldn't require custom hardware acceleration tweaks just to load standard charts.",
          videoScript: "Hook: Tired of watching your Mac battery level crumble just to read project timelines?\nBody: Traditional tools hoard up to 3GB of workspace cache. Aurora engines load in less than 5MB of standard assembly, running at double the refresh rates.\nCTA: Reclaim your focus. Deploy Aurora free today.",
          targetAudience: "Startups, technical leads, and visual designers prioritizing workspace speed."
        }
      });
    } finally {
      setReconLoading(false);
    }
  };

  const handleGenerateGoldmines = async () => {
    setGoldminesLoading(true);
    try {
      const response = await fetch('/api/content-goldmines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaints: [
            "Ram leakage crashing client on Mac M1 notebooks",
            "Stripe invoices are not automatically downloading on payment cycle",
            "Linux package is not released yet"
          ]
        })
      });
      if (!response.ok) throw new Error('Goldmines compilation failed');
      const data = await response.json();
      setGoldminesReport(data);
    } catch (e) {
      setGoldminesReport({
        goldmines: [
          {
            frustration: "Accounting billing receipt downloads requiring manual support tickets",
            hook: "You paid for software, but pulling the tax invoice requires a 3-day support queue. Sounds familiar?",
            marketingAngle: "Highlight Aurora's immediate 1-click ledger settings exports which bypass standard Stripe-friction blocks.",
            scriptExcerpt: "[Camera: zoom on frustrated CFO searching email threads] Hook: Stop waiting 4 business days just to extract tax PDF lines.\nBody: In Aurora, custom accounting ledgers are persistent and download on-demand. Done in 2 seconds.\nCTA: Try the fast, accounting-friendly CRM workspace now."
          },
          {
            frustration: "Mac RAM leakage and fan noise from massive desktop background Electron bundles",
            hook: "Why is your collaboration dock eating more CPU than a high-end 3D rendering suite?",
            marketingAngle: "Leverage other visual editors' heavy frameworks to showcase our 15x native hardware performance optimization.",
            scriptExcerpt: "[Visual: system activity board comparison stats] Hook: The main reason your workstation fans are screaming right now is this standard taskbar app.\nBody: Most tools use massive browser wrappers that lock active system threads. Aurora design structures are written in pure Native layers.\nCTA: Switch to speed. Sign up in 10 seconds."
          }
        ],
        recommendationSummary: "Leverage competitors' operational failures on billing and hardware requirements as direct high-intent hooks to acquire developers and financial analysts."
      });
    } finally {
      setGoldminesLoading(false);
    }
  };

  // Extract and aggregate all comments from our posts to analyze
  const getAggregatedComments = () => {
    const list: { author: string; content: string; platform: string }[] = [];
    
    posts.forEach(p => {
      p.comments.forEach(c => {
        list.push({
          author: c.author,
          content: c.content,
          platform: p.platform
        });
      });
    });

    conversations.forEach(c => {
      // Grab last message from contact
      const lastContact = [...c.messages].reverse().find(m => m.sender === 'contact');
      if (lastContact) {
        list.push({
          author: c.contactHandle,
          content: lastContact.content,
          platform: c.platform
        });
      }
    });

    return list;
  };

  const handleAggregateInsights = async () => {
    setLoading(true);
    setApiError(null);
    const commentsList = getAggregatedComments();

    try {
      const response = await fetch('/api/insight-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comments: commentsList }),
      });

      if (!response.ok) {
        throw new Error('Insights service returned status error.');
      }

      const data = await response.json();
      setInsights(data);
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'Error occurred while contacting Gemini Insights Desk.');
      
      // Fallback
      setInsights({
        summary: "Followers express enthusiastic support for Aurora's minimal aesthetic guidelines but raise structural concerns regarding desktop memory footprint and minor customer invoicing blocks. Responsive feedback loops will secure early core workspace beta loyalty.",
        painPoints: [
          {
            issue: "Desktop Client Memory Allocations (RAM leaks)",
            frequency: "High Intensity",
            solution: "Address desktop container thread garbage collection immediately in Q2. Direct support agents to recommend manual hardware acceleration configuration overrides."
          },
          {
            issue: "Invoice Generation Gateway Failing (Stripe logs)",
            frequency: "Medium Intensity",
            solution: "Manually compile Q1 billing files. Dispatch personalized apology templates prioritizing workspace verification."
          },
          {
            issue: "Platform Client Availability (Linux support)",
            frequency: "Medium Intensity",
            solution: "Draft roadmap story slide confirming terminal layout preview. Gather Linux distribution beta applications."
          }
        ],
        contentIdeas: [
          {
            title: "Aurora Custom Shortcut Layout Blueprint",
            type: "post",
            platform: "linkedin",
            concept: "Visual carousel outlining design macros. Invite key developers to verify layout customizability benchmarks."
          },
          {
            title: "Performance Patch: RAM Leak resolved",
            type: "post",
            platform: "twitter",
            concept: "Changelog log details showcasing 40% memory utilization reduction. Establishes brand commitment to core client performance."
          },
          {
            title: "How to export Workspace accounting sheets",
            type: "story",
            platform: "instagram",
            concept: "Short vertical screen capture recording showing standard workspace export details. Answers invoice inquiries concisely."
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  // Run on initial tabs load
  useEffect(() => {
    handleAggregateInsights();
  }, []);

  return (
    <div id="insights-lobby" className="max-w-6xl mx-auto space-y-6">
      
      <div id="insights-header" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="font-sans font-extrabold text-2.5xl text-slate-800">Brand Insights Desk</h1>
          <p className="text-xs text-slate-505 mt-1 font-medium">Aggregates social comments to synthesize core pain points and recommend content plans.</p>
        </div>

        <button
          id="btn-trigger-re-analysis"
          onClick={handleAggregateInsights}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-505 disabled:bg-slate-200 border border-indigo-700 rounded-xl text-xs font-sans font-bold text-white transition-all duration-150 cursor-pointer shadow-sm shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Analyzing Comments...' : 'Refresh Listening Insights'}</span>
        </button>
      </div>

      {/* INSIGHTS SUBVIEWS FILTER BAR */}
      <div id="insights-desk-subviews" className="bg-slate-100 rounded-xl p-1 flex border border-slate-200 self-start max-w-lg gap-1">
        <button
          id="btn-ins-view-feedback"
          type="button"
          onClick={() => setSubView('feedback')}
          className={`flex-1 text-center py-2 px-4 text-xs font-sans font-bold rounded-lg transition-all cursor-pointer ${
            subView === 'feedback'
              ? 'bg-white text-indigo-650 shadow-sm'
              : 'text-slate-500 hover:text-slate-850'
          }`}
        >
          📈 Audience Pain Points
        </button>
        <button
          id="btn-ins-view-recon"
          type="button"
          onClick={() => {
            setSubView('recon');
            if (!reconReport) handlePerformRecon();
          }}
          className={`flex-1 text-center py-2 px-4 text-xs font-sans font-bold rounded-lg transition-all cursor-pointer ${
            subView === 'recon'
              ? 'bg-white text-indigo-650 shadow-sm'
              : 'text-slate-500 hover:text-slate-850'
          }`}
        >
          👥 Competitor Recon
        </button>
        <button
          id="btn-ins-view-goldmines"
          type="button"
          onClick={() => {
            setSubView('goldmines');
            if (!goldminesReport) handleGenerateGoldmines();
          }}
          className={`flex-1 text-center py-2 px-4 text-xs font-sans font-bold rounded-lg transition-all cursor-pointer ${
            subView === 'goldmines'
              ? 'bg-white text-indigo-650 shadow-sm'
              : 'text-slate-500 hover:text-slate-850'
          }`}
        >
          💎 Content Goldmines
        </button>
      </div>

      {loading && (
        <div id="insights-loading" className="p-12 text-center flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 space-y-3 shadow-3xs">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Aggregating social feedback comment feeds & direct messages. Consulting Gemini diagnostic algorithms...</p>
        </div>
      )}

      {!loading && subView === 'feedback' && insights && (
        <div id="insights-grid-layout" className="space-y-6">
          
          {/* Executive diagnostics summary banner */}
          <div id="insights-summary-card" className="p-6 rounded-xl border border-indigo-100 bg-slate-50 space-y-3 shadow-3xs">
            <div className="flex items-center gap-1.5 text-xs font-mono text-indigo-600 font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-505" />
              <span>Gemini CRM Listening Executive Diagnostic</span>
            </div>
            <p className="text-sm text-slate-705 leading-relaxed font-sans font-medium max-w-4xl">
              {insights.summary}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COMPONENT: Pain Points Ledger */}
            <div id="pain-points-ledger-panel" className="lg:col-span-6 space-y-4">
              <span className="text-xs font-sans font-bold text-slate-500 tracking-wider uppercase block">Prioritized Follower Pain Points Grid</span>

              <div className="space-y-3" id="pain-points-ledgers">
                {insights.painPoints.map((point, index) => (
                  <div 
                    key={index} 
                    id={`pain-point-row-${index}`}
                    className="p-5 bg-white border border-slate-200 rounded-xl space-y-3 hover:border-slate-350 hover:shadow-3xs transition-all"
                  >
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <span className="text-xs font-sans font-bold text-slate-800 leading-none">{point.issue}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-mono border font-bold capitalize ${
                        point.frequency.toLowerCase().includes('high') 
                          ? 'bg-rose-50 text-rose-650 border-rose-100 animate-pulse' 
                          : 'bg-amber-50 text-amber-650 border border-amber-100'
                      }`}>
                        {point.frequency}
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-lg text-xs leading-normal text-slate-600 space-y-1">
                      <span className="font-mono text-[9px] uppercase tracking-wider font-bold text-slate-400 block">Suggested Response Guide:</span>
                      <p className="font-medium">{point.solution}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT COMPONENT: Strategic content calendar generation */}
            <div id="production-agenda-panel" className="lg:col-span-6 space-y-4">
              <span className="text-xs font-sans font-bold text-slate-500 tracking-wider uppercase block">Gemini Content Resolution Agenda</span>

              <div className="space-y-3" id="production-agenda-list">
                {insights.contentIdeas.map((idea, index) => (
                  <div 
                    key={index} 
                    id={`content-idea-row-${index}`}
                    className="p-5 bg-white border border-slate-200 rounded-xl space-y-3 flex flex-col justify-between hover:border-slate-350 shadow-3xs transition-all"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-3 font-medium">
                        <span className="px-2.5 py-0.5 rounded text-[8px] font-mono font-bold bg-indigo-50 text-indigo-605 border border-indigo-100 uppercase">
                          {idea.platform} {idea.type}
                        </span>
                        <span className="text-[10px] text-slate-405 font-mono font-semibold font-bold">Suggested Concept Draft</span>
                      </div>
                      <h4 className="text-sm font-sans font-bold text-slate-800">{idea.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium pt-1">{idea.concept}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex justify-end">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-indigo-605 font-bold">
                        <span>Aligns with feedback</span>
                        <ArrowRight className="w-3 h-3 text-indigo-600" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {apiError && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-600 font-mono">
              ⚠️ {apiError} (Loaded high contrast placeholder insights)
            </div>
          )}

        </div>
      )}

      {/* SUBVIEW 2: COMPETITOR RECON REPORTS */}
      {!loading && subView === 'recon' && (
        <div id="competitor-recon-container" className="relative min-h-[450px]">
          {!isPremium && (
            <div id="recon-lock-overlay" className="absolute inset-x-0 -top-4 -bottom-4 z-20 bg-slate-100/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-fade-in animate-duration-300">
              <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-8 max-w-lg shadow-2xl space-y-4 shrink-0 shadow-indigo-650/15">
                <div className="w-12 h-12 rounded-full bg-indigo-505/10 border border-indigo-500/20 text-amber-305 flex items-center justify-center mx-auto mb-2 animate-pulse">
                  <UserSearch className="w-6 h-6 shrink-0 text-amber-300" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-extrabold font-sans leading-none tracking-tight">Competitor SWOT Recon is Locked</h3>
                  <p className="text-[10px] font-mono text-indigo-405 tracking-wider font-extrabold uppercase">AVAILABLE EXCLUSIVELY ON PREMIUM SUBSCRIPTIONS</p>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  SMM Tactical Intelligence: Scan custom public competitor feeds, map their SWOT friction vectors, and construct proactive conversion ad schedules with a premium license.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    id="btn-recon-upgrade-trial"
                    type="button"
                    onClick={onUpgradeRequest}
                    className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-450 hover:to-yellow-450 text-slate-950 font-sans font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Gem className="w-3.5 h-3.5 animate-bounce" />
                    <span>Simulate payment & Upgrade ($49)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div id="competitor-recon-lobby" className={`space-y-6 animate-fade-in text-slate-800 ${!isPremium ? 'pointer-events-none filter blur-[2px] select-none' : ''}`}>
          
          {/* Header instructions bento block */}
          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1 md:max-w-2xl">
              <h3 className="font-sans font-extrabold text-slate-850 text-base flex items-center gap-2">
                <UserSearch className="w-5 h-5 text-indigo-605" />
                <span>Premium Competitor SWOT Recon Playbook</span>
              </h3>
              <p className="text-xs text-slate-505 leading-relaxed font-semibold">
                Input public handles for competitors. Gemini scans their user discussions, categorizes complaints, and automatically devises sharp, high-intent slogans and video playbooks.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <input
                id="competitor-handle-input"
                type="text"
                value={competitorHandle}
                onChange={(e) => setCompetitorHandle(e.target.value)}
                placeholder="@competitor_handle"
                className="px-3.5 py-1.5 rounded-lg bg-slate-50 border border-slate-205 text-slate-800 text-xs font-mono focus:bg-white outline-none focus:border-indigo-400"
              />
              <button
                id="btn-recon-submit"
                type="button"
                disabled={reconLoading}
                onClick={handlePerformRecon}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white text-xs font-sans font-bold rounded-lg transition-colors cursor-pointer"
              >
                {reconLoading ? 'Analyzing...' : '⚡ Scan Handle'}
              </button>
            </div>
          </div>

          {reconLoading ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-xl space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-650 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-mono">SCANNED PUBLIC FEEDS FOR {competitorHandle}. SUMMARIZING SWOT MATRIX...</p>
            </div>
          ) : reconReport ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* SWOT Matrix columns */}
              <div id="swot-matrix-panel" className="lg:col-span-6 space-y-5">
                
                {/* Competitor Weaknesses */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-3xs space-y-3.5">
                  <h4 className="text-xs font-mono font-bold text-red-650 flex items-center gap-1.5 uppercase">
                    <ShieldAlert className="w-4 h-4 bg-transparent shrink-0" />
                    <span>Analyzed Weaknesses for {reconReport.competitorName}</span>
                  </h4>
                  <ul className="space-y-2.5">
                    {reconReport.weaknesses?.map((weak, idx) => (
                      <li key={idx} className="text-xs text-slate-700 leading-relaxed font-semibold pl-2.5 border-l-2 border-red-400">
                        {weak}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Offensive Market Gap Opportunities */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-3xs space-y-3.5">
                  <h4 className="text-xs font-mono font-bold text-emerald-650 flex items-center gap-1.5 uppercase">
                    <TrendingUp className="w-4 h-4 bg-transparent shrink-0" />
                    <span>Aurora Marketing Advantage (Defensive Gap)</span>
                  </h4>
                  <ul className="space-y-2.5">
                    {reconReport.opportunities?.map((opp, idx) => (
                      <li key={idx} className="text-xs text-slate-700 leading-relaxed font-semibold pl-2.5 border-l-2 border-emerald-400">
                        {opp}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Marketing strategy guidelines playbook */}
              <div id="offensive-playbook-panel" className="lg:col-span-6 bg-white border border-slate-200 p-6 rounded-xl shadow-3xs space-y-5">
                <div className="border-b border-slate-105 pb-3">
                  <span className="text-[10px] font-mono font-bold text-indigo-650 uppercase tracking-widest block leading-none">
                    Gemini High-Intent Playbook
                  </span>
                  <h4 className="font-sans font-extrabold text-slate-850 text-base mt-2">
                    Offensive Acquisition Script
                  </h4>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9.5px] font-mono text-slate-400 font-bold uppercase block">Suggested Headline Slogan:</span>
                    <blockquote className="text-sm font-sans font-extrabold text-slate-850 leading-snug">
                      "{reconReport.offensiveMarketingPlaybook?.linkedinHeadline}"
                    </blockquote>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9.5px] font-mono text-slate-400 font-bold uppercase block">Opening Hook Angle:</span>
                    <p className="text-xs text-slate-705 leading-relaxed font-semibold">
                      "{reconReport.offensiveMarketingPlaybook?.hook}"
                    </p>
                  </div>

                  {/* Horizontal visual divider banner */}
                  <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/60 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-[9.5px] font-mono text-indigo-700 font-extrabold uppercase">
                      <Video className="w-3.5 h-3.5 text-indigo-505 shrink-0" />
                      <span>TikTok / Reels Short Video Script Draft</span>
                    </div>
                    <pre className="text-xs text-slate-705 font-sans leading-relaxed whitespace-pre-wrap font-semibold italic pl-3 border-l-2 border-indigo-500">
                      {reconReport.offensiveMarketingPlaybook?.videoScript}
                    </pre>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-405 font-bold uppercase bg-slate-50 p-2.5 border border-slate-200 rounded-lg">
                    <span>Target Audience Segment:</span>
                    <span className="text-slate-800">{reconReport.offensiveMarketingPlaybook?.targetAudience}</span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-10 bg-white border border-slate-200 rounded-xl text-xs text-slate-400 font-medium">
              Submit a competitor handle to compile gap opportunity playbooks.
            </div>
          )}

        </div>
      </div>
      )}

      {/* SUBVIEW 3: CONTENT GOLDMINES (Turning Complaints into Marketing) */}
      {!loading && subView === 'goldmines' && (
        <div id="content-goldmines-container" className="relative min-h-[450px]">
          {!isPremium && (
            <div id="goldmines-lock-overlay" className="absolute inset-x-0 -top-4 -bottom-4 z-20 bg-slate-100/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-fade-in animate-duration-300">
              <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-8 max-w-lg shadow-2xl space-y-4 shrink-0 shadow-indigo-650/15">
                <div className="w-12 h-12 rounded-full bg-indigo-550/10 border border-indigo-500/20 text-amber-305 flex items-center justify-center mx-auto mb-2 animate-pulse">
                  <Zap className="w-6 h-6 shrink-0 text-amber-300" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-extrabold font-sans leading-none tracking-tight">Content Goldmines is Locked</h3>
                  <p className="text-[10px] font-mono text-indigo-405 tracking-wider font-extrabold uppercase">AVAILABLE EXCLUSIVELY ON PREMIUM SUBSCRIPTIONS</p>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  Complaint-to-Campaign Strategy: Auto-crawl critical inbox bottlenecks and synthesize organic vertical video templates & viral LinkedIn scripts with a premium subscription.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    id="btn-goldmines-upgrade-trial"
                    type="button"
                    onClick={onUpgradeRequest}
                    className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-450 hover:to-yellow-450 text-slate-950 font-sans font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Gem className="w-3.5 h-3.5 animate-bounce" />
                    <span>Simulate payment & Upgrade ($49)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div id="content-goldmines-lobby" className={`space-y-6 animate-fade-in text-slate-800 ${!isPremium ? 'pointer-events-none filter blur-[2px] select-none' : ''}`}>
          
          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="font-sans font-extrabold text-slate-850 text-base flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-605" />
                <span>Content Goldmines: Customer Friction to Marketing Playbook</span>
              </h3>
              <p className="text-xs text-slate-505 leading-relaxed font-semibold">
                Gemini reviews the top 3 weekly customer frustrations from your Inbox aggregate, then outputs vertical video hooks to win clients proactively.
              </p>
            </div>

            <button
              id="btn-re-mine-gold"
              type="button"
              disabled={goldminesLoading}
              onClick={handleGenerateGoldmines}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white text-xs font-sans font-bold rounded-lg transition-colors shrink-0 cursor-pointer shadow-sm"
            >
              {goldminesLoading ? 'Mining Ideas...' : '⚡ Compile Goldmines'}
            </button>
          </div>

          {goldminesLoading ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-xl space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-650 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-mono">EXTRACTING TOP WEEKLY CUSTOMER PAIN POINTS. GENERATING SCRIPTS IN COGNITIVE LAYERS...</p>
            </div>
          ) : goldminesReport ? (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {goldminesReport.goldmines?.map((mine: any, idx: number) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-3xs space-y-4 hover:border-slate-350 transition-all">
                    
                    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2.5">
                      <span className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 font-extrabold font-mono text-[10px] uppercase">
                        Goldmine #{idx + 1}
                      </span>
                      <div className="text-right">
                        <span className="text-[9px] font-mono text-slate-405 font-bold uppercase block">Target Complaint:</span>
                        <span className="text-xs font-sans font-bold text-slate-800 tracking-tight leading-none block mt-1">{mine.frustration}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="text-xs">
                        <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase tracking-wide">Marketing Hook Slogan:</span>
                        <p className="font-sans font-extrabold text-slate-850 mt-1">"{mine.hook}"</p>
                      </div>

                      <div className="text-xs">
                        <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase tracking-wide">Brand Differentiation Angle:</span>
                        <p className="font-sans text-slate-605 mt-1 font-semibold">{mine.marketingAngle}</p>
                      </div>

                      <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-lg space-y-1.5">
                        <span className="text-[9.5px] font-mono text-indigo-605 font-black uppercase tracking-wider block">Short Script Excerpt Draft:</span>
                        <p className="text-xs font-sans text-slate-705 leading-relaxed font-semibold italic pl-2.5 border-l-2 border-indigo-405 whitespace-pre-wrap">
                          {mine.scriptExcerpt}
                        </p>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

              {/* Executive summary card */}
              <div className="p-5 rounded-xl border border-indigo-100 bg-indigo-50/40 text-xs text-indigo-805 leading-relaxed font-semibold flex items-start gap-3">
                <Award className="w-5 h-5 text-indigo-505 shrink-0 mt-0.5" />
                <div>
                  <span className="font-mono text-[9px] font-bold block uppercase text-indigo-905 tracking-wider pb-1">
                    Diamond Playbook Advisory
                  </span>
                  {goldminesReport.recommendationSummary}
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-10 bg-white border border-slate-200 rounded-xl text-xs text-slate-400 font-medium">
              Click 'Compile Goldmines' to transform unresolved consumer complaints into high-engagement viral acquisition loops.
            </div>
          )}

        </div>
      </div>
      )}
    </div>
  );
}
