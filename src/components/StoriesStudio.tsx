import { useState, FormEvent } from 'react';
import { SocialStory, StoryReaction, PostComment } from '../types';
import { Sparkles, Eye, Flame, Heart, Smile, RefreshCw, Send, Plus, CheckCircle2, Copy } from 'lucide-react';

interface StoriesStudioProps {
  stories: SocialStory[];
  setStories: (stories: SocialStory[]) => void;
}

export default function StoriesStudio({ stories, setStories }: StoriesStudioProps) {
  const [selectedStoryId, setSelectedStoryId] = useState<string>(stories[0]?.id || '');
  
  // Simulation for reactions
  const [addingEmojiId, setAddingEmojiId] = useState<string | null>(null);

  // Brainstorm state
  const [focusTopic, setFocusTopic] = useState<string>('Wallpaper Giveaway');
  const [loadingBrainstorm, setLoadingBrainstorm] = useState(false);
  const [brainstormError, setBrainstormError] = useState<string | null>(null);
  const [brainstormResult, setBrainstormResult] = useState<{
    title: string;
    platform: string;
    content: string;
    justification: string;
  } | null>(null);

  const activeStory = stories.find(s => s.id === selectedStoryId) || null;

  // React to a story
  const handleSimulateReaction = (emoji: string) => {
    if (!activeStory) return;
    
    const updatedStories = stories.map(s => {
      if (s.id === activeStory.id) {
        return {
          ...s,
          reactions: s.reactions.map(r => {
            if (r.emoji === emoji) {
              return { ...r, count: r.count + 1 };
            }
            return r;
          })
        };
      }
      return s;
    });

    setStories(updatedStories);
    setAddingEmojiId(emoji);
    setTimeout(() => setAddingEmojiId(null), 800);
  };

  // Brainstorm a story using Gemini
  const handleBrainstormStory = async (e: FormEvent) => {
    e.preventDefault();
    setLoadingBrainstorm(true);
    setBrainstormError(null);
    setBrainstormResult(null);

    try {
      const response = await fetch('/api/generate-post-concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comments: [
            `Followers want to know about: ${focusTopic}`,
            `Prior story reactions: ${activeStory?.reactions.map(r => `${r.emoji} (count: ${r.count})`).join(', ')}`,
            'Request to see premium high contrast mobile dark wallpapers',
            'Request for customizable shortcut options'
          ]
        }),
      });

      if (!response.ok) {
        throw new Error('Brainstorm API returned status error.');
      }

      const data = await response.json();
      setBrainstormResult(data);
    } catch (err: any) {
      console.error(err);
      setBrainstormError(err.message || 'Error occurred while contacting Gemini Brainstormer.');
      // Fallback
      setBrainstormResult({
        title: `Dynamic story: ${focusTopic}`,
        platform: 'instagram',
        content: `🎨 SNEAK PEEK ARCHIVE 🎨 \n\nWe heard you! You wanted the Midnight Blue abstract gradients on mobile. Tap the link in our bio to grab our high-res smartphone wallpapers free for the next 24 hours! 🌌💨\n\n💬 Q: Which layout config should we draft next?`,
        justification: `Directly answers follower story queries requesting wallpapers in a snackable portrait formats.`
      });
    } finally {
      setLoadingBrainstorm(false);
    }
  };

  // Add Brainstormed Story as a mock new active story
  const handlePublishBrainstormed = () => {
    if (!brainstormResult) return;

    const newStory: SocialStory = {
      id: `story-custom-${Date.now()}`,
      platform: 'instagram',
      author: 'Design Studio LLC',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      mediaType: 'image',
      timestamp: 'Just now',
      views: 1,
      reactions: [
        { emoji: '🔥', count: 0 },
        { emoji: '❤️', count: 0 },
        { emoji: '😮', count: 0 }
      ],
      replies: []
    };

    setStories([newStory, ...stories]);
    setSelectedStoryId(newStory.id);
    setBrainstormResult(null);
  };

  return (
    <div id="stories-studio-workspace" className="max-w-6xl mx-auto space-y-6">
      
      <div id="stories-header" className="pb-4 border-b border-slate-200">
        <h1 className="font-sans font-extrabold text-2.5xl text-slate-800">Stories Studio & Brainstormer</h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">Manage vertical stories, monitor reaction counts, and brainstorm visual concept scripts.</p>
      </div>

      <div id="stories-split-body" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COMPONENT: Adaptive Interactive Story Mockup frame */}
        <div id="active-story-mockup-frame" className="lg:col-span-4 flex flex-col gap-4">
          <span className="text-xs font-sans font-bold text-slate-500 tracking-wider uppercase block">Interactive Stories Studio</span>
          
          <div className="flex gap-2.5 overflow-x-auto pb-1" id="stories-circles-list">
            {stories.map(story => {
              const isActive = story.id === selectedStoryId;
              return (
                <button
                  key={story.id || 'story-circle'}
                  id={`story-circle-${story.id}`}
                  onClick={() => {
                    setSelectedStoryId(story.id);
                  }}
                  className={`relative shrink-0 w-14 h-14 rounded-full p-[2.5px] transition-transform cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-tr from-yellow-500 via-rose-500 to-indigo-600' 
                      : 'bg-slate-200 hover:scale-105 shadow-sm'
                  }`}
                >
                  <img
                    src={story.mediaUrl}
                    alt="preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full rounded-full object-cover border-2 border-white"
                  />
                </button>
              );
            })}
          </div>

          {activeStory ? (
            <div id={`story-visual-canvas-${activeStory.id}`} className="relative aspect-[9/16] w-full max-w-[280px] mx-auto rounded-3xl bg-neutral-950 border border-neutral-850 overflow-hidden shadow-2xl flex flex-col justify-between p-4 group">
              {/* Background cover image */}
              <img
                src={activeStory.mediaUrl}
                alt="Story Background"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none opacity-85"
              />
              {/* Subtle glassmorphism overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-neutral-950/40 pointer-events-none" />

              {/* Top Details (Avatar & username) */}
              <div className="relative flex items-center justify-between gap-3 w-full z-10">
                <div className="flex items-center gap-2">
                  <img
                    src={activeStory.avatar}
                    alt={activeStory.author}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full border border-pink-500 object-cover"
                  />
                  <div>
                    <span className="text-[10px] font-sans font-semibold text-neutral-100 block">@{activeStory.author}</span>
                    <span className="text-[8px] font-mono text-neutral-400 block">{activeStory.timestamp}</span>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[8px] uppercase font-mono bg-pink-900/50 text-pink-300 border border-pink-800/40">
                  {activeStory.platform}
                </span>
                <span className="text-[8px] uppercase font-mono text-neutral-400">Expiring</span>
              </div>

              {/* Center Decorative Reaction float if triggered */}
              <div className="relative flex-1 flex items-center justify-center z-10 pointer-events-none">
                {addingEmojiId && (
                  <div className="animate-bounce p-3 bg-neutral-900/80 rounded-full border border-neutral-750 text-2xl">
                    {addingEmojiId}
                  </div>
                )}
              </div>

              {/* Bottom details & quick simulator reactions */}
              <div className="relative space-y-3 z-10 w-full">
                {/* Views count */}
                <div className="flex items-center gap-1.5 justify-center text-[10px] font-mono text-neutral-300 bg-neutral-900/70 py-1 rounded border border-neutral-800/40">
                  <Eye className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{activeStory.views} story impressions</span>
                </div>

                {/* Simulated reaction grid */}
                <div className="bg-neutral-900/85 backdrop-blur-md rounded-2xl border border-neutral-800/60 p-2.5 space-y-1.5">
                  <span className="text-[8px] font-mono text-neutral-400 uppercase tracking-widest block text-center">React to Story</span>
                  <div className="flex items-center justify-around gap-1.5">
                    {['🔥', '❤️', '😮', '😂'].map(emoji => (
                      <button
                        key={emoji}
                        id={`btn-react-sim-${emoji}`}
                        onClick={() => handleSimulateReaction(emoji)}
                        className="p-1.5 hover:bg-neutral-805/30 transition-colors text-sm rounded-lg cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-xs text-slate-400 font-mono py-12">
              No active story.
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Active Reactions dashboard + brainstorm suite */}
        <div id="stories-management-cockpit" className="lg:col-span-8 space-y-6">
          {activeStory && (
            <div id="story-metrics-card" className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-sm">
              <h3 className="font-sans font-bold text-slate-800 text-sm">Active Story Reactions Ledger</h3>
              
              <div className="grid grid-cols-3 gap-4" id="reactions-counters-grid">
                {activeStory.reactions.map((reaction: StoryReaction) => (
                  <div 
                    key={reaction.emoji} 
                    id={`cnt-reaction-${reaction.emoji}`}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-between shadow-3xs hover:bg-slate-100/55 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{reaction.emoji}</span>
                      <span className="text-xs text-slate-500 font-sans font-semibold">Reaction</span>
                    </div>
                    <span className="text-lg font-mono font-bold text-slate-800">{reaction.count}</span>
                  </div>
                ))}
              </div>

              {/* Feed of comment replies on story */}
              {activeStory.replies && activeStory.replies.length > 0 && (
                <div id="story-replies-section" className="space-y-3 pt-4 border-t border-slate-100">
                  <span className="text-xs font-sans font-bold text-slate-500 uppercase block">Follower Story Comments ({activeStory.replies.length})</span>
                  <div className="space-y-2 max-h-[140px] overflow-y-auto">
                    {activeStory.replies.map((reply: PostComment) => (
                      <div key={reply.id} className="p-3 rounded-lg bg-slate-50 border border-slate-150 flex items-start gap-2 text-xs">
                        <img src={reply.avatar} alt="Author" className="w-5 h-5 rounded-full object-cover shrink-0" />
                        <div>
                          <span className="font-bold text-slate-800">@{reply.author}:</span>
                          <span className="text-slate-600 ml-1.5 font-medium">"{reply.content}"</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI brainstorm platform */}
          <div id="story-brainstorm-deck" className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-sm">
            <h3 className="font-sans font-bold text-slate-800 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Gemini Expiring Story Brainstormer
            </h3>

            <p className="text-xs text-slate-500 leading-normal font-medium">
              Based on active customer comments, questions, and reaction sentiment, prompt Gemini to design a high-converting portrait story theme, written with optimal calls to action.
            </p>

            <form onSubmit={handleBrainstormStory} className="space-y-3.5" id="brainstorm-topic-form">
              <div className="space-y-1.5 text-xs">
                <label htmlFor="brainstorm-focus" className="font-sans font-bold text-slate-600">Target Segment Topic</label>
                <input
                  id="brainstorm-focus"
                  required
                  type="text"
                  placeholder="e.g. macOS Keyboard Customizer, Midnight wallpaper download"
                  value={focusTopic}
                  onChange={(e) => setFocusTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 focus:border-indigo-400 outline-none shadow-3xs"
                />
              </div>

              <div className="flex gap-2">
                <button
                  id="btn-brainstorm-trigger"
                  type="submit"
                  disabled={loadingBrainstorm}
                  className="inline-flex items-center justify-center gap-1.5 w-full bg-indigo-600 hover:bg-indigo-505 disabled:bg-slate-100 text-white disabled:text-slate-400 border disabled:border-slate-200 py-2.5 rounded-lg text-xs font-sans font-bold transition-colors cursor-pointer shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingBrainstorm ? 'animate-spin' : ''}`} />
                  <span>{loadingBrainstorm ? 'Concocting Layouts via Gemini...' : 'Brainstorm Expiring Story Theme'}</span>
                </button>
              </div>
            </form>

            {/* Display result */}
            {brainstormResult && (
              <div id="brainstorm-results-box" className="p-5 rounded-xl border border-indigo-100 bg-slate-50 space-y-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-505" />
                    <span>Story Concept Brainstorm Complete</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono bg-pink-50 text-pink-600 border border-pink-100 font-bold capitalize">
                    {brainstormResult.platform} Layout
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block tracking-wider">Concept Slide Subject</span>
                  <p className="text-sm font-bold text-slate-800">{brainstormResult.title}</p>
                </div>

                <div className="space-y-1.5 text-xs">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block tracking-wider">Draft Script & Captions</span>
                  <div className="p-3.5 bg-white rounded-lg text-slate-700 font-sans text-xs border border-slate-150 whitespace-pre-wrap leading-relaxed relative">
                    {brainstormResult.content}
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-500 bg-white border border-slate-150 p-3 rounded-lg leading-normal">
                  <span className="font-bold text-slate-700 block mb-0.5 uppercase tracking-wider font-mono text-[9px]">Follower Alignment:</span>
                  {brainstormResult.justification}
                </div>

                <div className="flex justify-end gap-2 text-xs font-sans pt-1">
                  <button
                    id="btn-brainstorm-discard"
                    type="button"
                    onClick={() => setBrainstormResult(null)}
                    className="px-3.5 py-1.5 text-slate-400 hover:text-slate-650 font-bold"
                  >
                    Discard Draft
                  </button>
                  <button
                    id="btn-brainstorm-mock-publish"
                    type="button"
                    onClick={handlePublishBrainstormed}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-505 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Add to Active Stories</span>
                  </button>
                </div>
              </div>
            )}

            {brainstormError && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs font-mono text-amber-600">
                ⚠️ {brainstormError} (Demo fallback loaded)
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
