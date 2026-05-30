import { LayoutDashboard, MessageSquareMore, Sparkles, Inbox, LineChart, MessageSquareDot, Clock, Gem, Shield } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadCount: number;
  isPremium: boolean;
  setIsPremium: (val: boolean) => void;
  onOpenUpgradeModal: () => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  unreadCount,
  isPremium,
  setIsPremium,
  onOpenUpgradeModal
}: SidebarProps) {
  const menuItems = [
    {
      id: 'overview',
      name: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Unified metrics & diagnostics',
    },
    {
      id: 'scheduler',
      name: 'Post Scheduler',
      icon: Clock,
      description: 'Campaign scheduling studio',
    },
    {
      id: 'feed',
      name: 'Posts Feed',
      icon: MessageSquareDot,
      description: 'Reviews, comments & replies',
    },
    {
      id: 'stories',
      name: 'Stories Studio',
      icon: Sparkles,
      description: 'Story expiration feedback',
    },
    {
      id: 'inbox',
      name: 'Direct Inbox',
      icon: Inbox,
      description: 'Conversational AI assists',
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      id: 'insights',
      name: 'Insights Desk',
      icon: LineChart,
      description: 'Synthesized CRM analytics',
    },
  ];

  return (
    <aside id="app-sidebar" className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0">
      {/* Brand Header */}
      <div id="sidebar-header" className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div id="logo-icon" className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <div className="w-4 h-4 bg-white rounded-sm"></div>
        </div>
        <div>
          <h2 className="font-sans font-bold text-white tracking-tight leading-none text-base">SocialHub Pro</h2>
          <span className="text-[10px] font-mono text-slate-500 mt-1 block uppercase tracking-wider">Unified Workspace</span>
        </div>
      </div>

      {/* Navigation Options */}
      <nav id="sidebar-navigation" className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 outline-none group border ${
                isActive
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white border-transparent'
              }`}
            >
              <div className={`p-1 rounded shrink-0 transition-colors ${
                isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`font-sans font-medium text-xs block leading-none ${isActive ? 'text-white font-bold' : 'text-slate-300'}`}>{item.name}</span>
                  {item.badge !== undefined && (
                    <span id={`sidebar-badge-${item.id}`} className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                      isActive ? 'bg-white text-indigo-600' : 'bg-indigo-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] block mt-1 leading-normal truncate ${isActive ? 'text-indigo-200' : 'text-slate-500 group-hover:text-slate-400'}`}>{item.description}</span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Subscription Plan Module */}
      <div id="sidebar-subscription-card" className="mx-4 mb-4 p-3.5 rounded-xl bg-slate-800/40 border border-slate-850 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {isPremium ? (
              <Gem className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            ) : (
              <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
            <span className="text-[10px] font-mono font-bold text-slate-450 uppercase tracking-widest block leading-none">
              PLAN TIER
            </span>
          </div>
          <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold font-mono uppercase tracking-wider ${
            isPremium 
              ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' 
              : 'bg-slate-700 text-slate-350 border border-slate-600'
          }`}>
            {isPremium ? 'Premium (Pro)' : 'Basic (Free)'}
          </span>
        </div>

        {isPremium ? (
          <div className="space-y-2">
            <p className="text-[10px] font-sans text-slate-400 leading-normal font-semibold">
              ✓ All CRM tools, Crisis Shields, Brand FAQ, and SWOT Recon engines are fully enabled.
            </p>
            <button
              id="sidebar-downgrade-btn"
              onClick={() => {
                setIsPremium(false);
                localStorage.setItem('crm_is_premium', 'false');
              }}
              className="w-full py-1 text-center font-mono text-[9px] text-slate-450 hover:text-white border border-dashed border-slate-800 hover:border-slate-600 rounded-lg transition-colors cursor-pointer"
            >
              Simulate Basic Mode
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="space-y-1">
              <p className="text-[10.5px] text-slate-300 font-sans font-bold leading-tight">
                Unlock SWOT Recon & Alerts
              </p>
              <p className="text-[9.5px] leading-relaxed text-slate-500 font-medium">
                Structured JSON categorization and crisis SMS alerts require upgrade.
              </p>
            </div>
            <button
              id="sidebar-upgrade-btn"
              onClick={onOpenUpgradeModal}
              className="w-full py-2 bg-gradient-to-r from-amber-550 to-yellow-500 hover:from-amber-450 hover:to-yellow-450 text-slate-950 text-xs font-sans font-black rounded-lg transition-all cursor-pointer shadow-md shadow-amber-500/5 flex items-center justify-center gap-1.5"
            >
              <Gem className="w-3.5 h-3.5 text-slate-950" />
              <span>Upgrade to Premium</span>
            </button>
          </div>
        )}
      </div>

      {/* Creator Info Footer */}
      <div id="sidebar-footer" className="p-4 border-t border-slate-800 bg-slate-900/60 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono text-slate-300">System Live</span>
        </div>
        <p className="text-[10px] font-mono text-slate-500 leading-normal">
          dawadiyaman123@gmail.com
        </p>
      </div>
    </aside>
  );
}
