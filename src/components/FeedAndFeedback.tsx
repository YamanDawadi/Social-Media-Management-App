import { useState, FormEvent } from 'react';
import { SocialPost, PostComment, AICopilotTone, FeedbackSentiment } from '../types';
import { TONE_PRESETS } from '../data';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Eye, 
  Sparkles,
  RefreshCw,
  Send,
  User,
  PlusCircle,
  MessageCircle,
  Clock,
  ExternalLink,
  Plus
} from 'lucide-react';

interface FeedAndFeedbackProps {
  posts: SocialPost[];
  setPosts: (posts: SocialPost[]) => void;
  selectedPostId: string | null;
  setSelectedPostId: (id: string | null) => void;
}

export default function FeedAndFeedback({ 
  posts, 
  setPosts, 
  selectedPostId, 
  setSelectedPostId 
}: FeedAndFeedbackProps) {
  const [platformFilter, setPlatformFilter] = useState<'all' | 'instagram' | 'linkedin' | 'twitter'>('all');
  
  // State for AI Reply generator
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [currentToneId, setCurrentToneId] = useState<string>('enthusiastic');
  const [draftReply, setDraftReply] = useState<string>('');
  const [draftReason, setDraftReason] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Simulated new commenter state
  const [newCommentAuthor, setNewCommentAuthor] = useState('');
  const [newCommentContent, setNewCommentContent] = useState('');
  const [showAddCommentCard, setShowAddCommentCard] = useState(false);

  // Active Post Context
  const activePost = posts.find(p => p.id === selectedPostId) || null;

  // Filtered post list
  const filteredPosts = posts.filter(p => platformFilter === 'all' || p.platform === platformFilter);

  // Call API to generate reply
  const handleGenerateReply = async (comment: PostComment) => {
    setLoadingAI(true);
    setAiError(null);
    setDraftReply('');
    setDraftReason('');

    const activeTone = TONE_PRESETS.find(t => t.id === currentToneId);
    try {
      const response = await fetch('/api/generate-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: comment.content,
          handle: comment.author,
          toneInstruction: activeTone?.instruction || 'Be helpful and warm',
          context: activePost?.content,
        }),
      });

      if (!response.ok) {
        throw new Error('API server returned error state.');
      }

      const data = await response.json();
      setDraftReply(data.reply);
      setDraftReason(data.explanation);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Error occurred while contacting the Gemini server.');
      // Offline fallback text
      setDraftReply(`Hi @${comment.author}! Thank you for raising this point. We appreciate your valuable feedback and are looking directly into these layout customizer details. Let us know if we can assist you with anything else!`);
      setDraftReason("Demonstration mode fallback drafted securely on client side.");
    } finally {
      setLoadingAI(false);
    }
  };

  // Submit/Post feedback reply to state
  const handlePostReplySubmit = (commentId: string) => {
    if (!draftReply.trim() || !activePost) return;

    const updatedPosts = posts.map(p => {
      if (p.id === activePost.id) {
        return {
          ...p,
          comments: p.comments.map(c => {
            if (c.id === commentId) {
              return { ...c, reply: draftReply };
            }
            return c;
          })
        };
      }
      return p;
    });

    setPosts(updatedPosts);
    // Reset draft panels
    setSelectedCommentId(null);
    setDraftReply('');
    setDraftReason('');
  };

  // Simulate sentiment categorization locally
  const determineLocalSentiment = (content: string): FeedbackSentiment => {
    const text = content.toLowerCase();
    if (text.includes('love') || text.includes('great') || text.includes('stunning') || text.includes('clean') || text.includes('milestone') || text.includes('wow')) return 'positive';
    if (text.includes('bad') || text.includes('bugged') || text.includes('hater') || text.includes('dont need') || text.includes('leak') || text.includes('limit') || text.includes('ram')) return 'negative';
    return 'neutral';
  };

  // Add Comment simulator
  const handleAddCommentSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newCommentAuthor.trim() || !newCommentContent.trim() || !activePost) return;

    const newComment: PostComment = {
      id: `comment-custom-${Date.now()}`,
      author: newCommentAuthor.trim(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      content: newCommentContent.trim(),
      timestamp: 'Just now',
      likes: 0,
      sentiment: determineLocalSentiment(newCommentContent),
      isCustom: true
    };

    // Update posts with new comment count & active comment
    const updatedPosts = posts.map(p => {
      if (p.id === activePost.id) {
        return {
          ...p,
          commentsCount: p.commentsCount + 1,
          comments: [newComment, ...p.comments]
        };
      }
      return p;
    });

    setPosts(updatedPosts);
    setNewCommentAuthor('');
    setNewCommentContent('');
    setShowAddCommentCard(false);
  };

  // Platform styling class resolvers
  const getPlatformColors = (platform: string) => {
    switch (platform) {
      case 'instagram': return 'bg-pink-50 text-pink-600 border-pink-200';
      case 'linkedin': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'twitter': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  const getSentimentBadge = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
      case 'negative': return 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
      default: return 'bg-slate-100 text-slate-600 border-slate-200 font-bold';
    }
  };

  return (
    <div id="posts-feedback-workspace" className="max-w-6xl mx-auto space-y-6">
      {/* Platform Tabs & Filter Header */}
      <div id="feedback-controls-header" className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="font-sans font-extrabold text-2.5xl text-slate-800">Social Posts Feedback</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Moderate follower comments, analyze sentiment, and draft responses via Gemini co-pilot.</p>
        </div>

        <div id="platform-tabs" className="flex items-center gap-1.5 p-1 bg-white rounded-lg border border-slate-200 text-xs font-mono shadow-sm">
          {(['all', 'instagram', 'linkedin', 'twitter'] as const).map(p => (
            <button
              key={p}
              id={`filter-tab-${p}`}
              onClick={() => {
                setPlatformFilter(p);
                setSelectedPostId(posts.find(post => p === 'all' || post.platform === p)?.id || null);
                setSelectedCommentId(null);
              }}
              className={`px-3 py-1.5 rounded-md transition-colors capitalize cursor-pointer ${
                platformFilter === p 
                  ? 'bg-slate-900 text-white font-semibold' 
                  : 'text-slate-500 hover:text-slate-850'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Grid - Split Screen */}
      <div id="posts-workspace-body" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Posts Feed List */}
        <div id="posts-list-column" className="lg:col-span-4 space-y-4">
          <span className="text-xs font-sans font-bold text-slate-500 tracking-wider uppercase block">Published Posts</span>
          {filteredPosts.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs font-mono text-slate-400">
              No matching published posts.
            </div>
          ) : (
            filteredPosts.map(post => {
              const isActive = post.id === selectedPostId;
              return (
                <button
                  key={post.id}
                  id={`post-list-item-${post.id}`}
                  onClick={() => {
                    setSelectedPostId(post.id);
                    setSelectedCommentId(null);
                    setDraftReply('');
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 outline-none flex flex-col gap-3 group cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 border-slate-800 text-white shadow-md'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 w-full">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono border font-bold ${getPlatformColors(post.platform)}`}>
                      {post.platform}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{post.timestamp}</span>
                  </div>

                  <p className={`text-xs font-sans leading-relaxed line-clamp-3 ${isActive ? 'text-slate-200' : 'text-slate-600'}`}>
                    {post.content}
                  </p>

                  <div className={`flex items-center gap-4 text-[11px] font-mono pt-2 w-full border-t ${isActive ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-400'}`}>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-500" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-slate-400" />
                      {post.comments.length}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="w-3 h-3 text-indigo-500" />
                      {post.shares}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* RIGHT COLUMN: Active Post Comments Moderation Terminal */}
        <div id="comments-terminal-column" className="lg:col-span-8">
          {activePost ? (
            <div id="comments-pane-container" className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-sm">
              
              {/* Active Post Card Header */}
              <div id="active-post-details" className="p-4 rounded-xl bg-slate-50 border border-slate-150 flex gap-4">
                <img
                  id="active-post-avatar"
                  src={activePost.avatar}
                  alt={activePost.author}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full border border-slate-200 shrink-0 object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="font-sans font-bold text-sm text-slate-800">{activePost.author}</h4>
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">{activePost.platform}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap font-medium">{activePost.content}</p>
                </div>
              </div>

              {/* Comments moderation segment */}
              <div id="comments-moderation-segment" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-sans font-bold text-slate-800 text-sm">Follower Feed Comments ({activePost.comments.length})</h3>
                  <button
                    id="btn-simulate-comment-trigger"
                    onClick={() => setShowAddCommentCard(!showAddCommentCard)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-sans font-semibold cursor-pointer transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Simulate Feed Interaction</span>
                  </button>
                </div>

                {/* Simulated feedback Comment Input Box */}
                {showAddCommentCard && (
                  <form 
                    id="add-comment-sim-form"
                    onSubmit={handleAddCommentSubmit} 
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
                  >
                    <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 uppercase font-mono">
                      <span>Simulated Follower Client Interaction</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        id="comment-sim-author"
                        required
                        type="text"
                        placeholder="Follower @username"
                        value={newCommentAuthor}
                        onChange={(e) => setNewCommentAuthor(e.target.value)}
                        className="sm:col-span-1 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs focus:border-indigo-400 outline-none placeholder-slate-400 text-slate-700 shadow-3xs"
                      />
                      <input
                        id="comment-sim-content"
                        required
                        type="text"
                        placeholder="Write constructive or critical feedback..."
                        value={newCommentContent}
                        onChange={(e) => setNewCommentContent(e.target.value)}
                        className="sm:col-span-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs focus:border-indigo-400 outline-none placeholder-slate-400 text-slate-700 shadow-3xs"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button 
                        id="comment-sim-cancel"
                        type="button" 
                        onClick={() => setShowAddCommentCard(false)} 
                        className="px-3 py-1 text-xs text-slate-400 hover:text-slate-600 outline-none font-medium"
                      >
                        Cancel
                      </button>
                      <button 
                        id="comment-sim-submit"
                        type="submit" 
                        className="px-3.5 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-505 text-white rounded-lg font-semibold shadow-sm transition-colors cursor-pointer"
                      >
                        Post simulated feedback
                      </button>
                    </div>
                  </form>
                )}

                {/* Comment feeds container */}
                <div id="comments-stack-feed" className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
                  {activePost.comments.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400 font-mono">
                      No active comments on this thread.
                    </div>
                  ) : (
                    activePost.comments.map(comment => {
                      const isSelected = selectedCommentId === comment.id;
                      return (
                        <div 
                          key={comment.id}
                          id={`comment-box-${comment.id}`}
                          className={`p-4 rounded-xl border transition-all duration-200 ${
                            isSelected 
                              ? 'bg-slate-50 border-indigo-450 shadow-md ring-1 ring-indigo-100' 
                              : 'bg-white border-slate-150 hover:bg-slate-50/55 shadow-3xs'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <img
                              src={comment.avatar}
                              alt={comment.author}
                              referrerPolicy="no-referrer"
                              className="w-8 h-8 rounded-full border border-slate-200 shrink-0 object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-3 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs text-slate-800">@{comment.author}</span>
                                  {comment.sentiment && (
                                    <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-mono tracking-wider border ${getSentimentBadge(comment.sentiment)}`}>
                                      {comment.sentiment}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] font-mono text-slate-400">{comment.timestamp}</span>
                              </div>

                              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                {comment.content}
                              </p>

                              {/* Official Reply block if active or already stored */}
                              {comment.reply ? (
                                <div id={`official-reply-${comment.id}`} className="mt-3.5 p-3 rounded-lg bg-indigo-50/50 border-l-2 border-indigo-600 space-y-1">
                                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-indigo-600 font-bold uppercase">
                                    <Sparkles className="w-3 h-3 text-indigo-500" />
                                    <span>Sent Official Account response</span>
                                  </div>
                                  <p className="text-xs text-slate-700 leading-normal font-sans">
                                    {comment.reply}
                                  </p>
                                </div>
                              ) : (
                                !isSelected && (
                                  <div className="mt-3.5 flex justify-end">
                                    <button
                                      id={`btn-moderator-engage-${comment.id}`}
                                      onClick={() => {
                                        setSelectedCommentId(comment.id);
                                        setDraftReply('');
                                      }}
                                      className="inline-flex items-center gap-1 text-[11px] font-sans font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors shadow-3xs cursor-pointer"
                                    >
                                      <Sparkles className="w-3 h-3 text-indigo-500" />
                                      <span>Compose AI Response</span>
                                    </button>
                                  </div>
                                )
                              )}

                              {/* Selected AI Response composer frame */}
                              {isSelected && !comment.reply && (
                                <div id={`ai-composer-${comment.id}`} className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-4 shadow-3xs">
                                  
                                  {/* Tone Settings */}
                                  <div className="space-y-2">
                                    <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest block">Choose Response Vibe</span>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                      {TONE_PRESETS.map(tone => (
                                        <button
                                          key={tone.id}
                                          id={`btn-tone-${tone.id}`}
                                          type="button"
                                          onClick={() => setCurrentToneId(tone.id)}
                                          className={`py-1.5 px-2 rounded-lg text-left flex items-center gap-1.5 border leading-tight transition-all text-xs outline-none cursor-pointer ${
                                            currentToneId === tone.id
                                              ? 'bg-indigo-600 border-indigo-500 text-white font-bold shadow-sm'
                                              : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-600'
                                          }`}
                                        >
                                          <span className="text-xs shrink-0">{tone.emoji}</span>
                                          <span className="font-sans font-medium">{tone.name}</span>
                                        </button>
                                      ))}
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-mono italic">
                                      "{TONE_PRESETS.find(t => t.id === currentToneId)?.instruction}"
                                    </p>
                                  </div>

                                  {/* Action compose trigger */}
                                  <div className="flex gap-2">
                                    <button
                                      id="btn-trigger-ai-reply"
                                      type="button"
                                      disabled={loadingAI}
                                      onClick={() => handleGenerateReply(comment)}
                                      className="inline-flex items-center justify-center gap-1.5 w-full bg-indigo-600 hover:bg-indigo-505 disabled:bg-slate-200 text-white disabled:text-slate-400 border disabled:border-slate-200 rounded-lg py-2.5 text-xs font-sans font-semibold transition-all shadow shadow-indigo-600/10 cursor-pointer disabled:cursor-not-allowed"
                                    >
                                      <RefreshCw className={`w-3.5 h-3.5 ${loadingAI ? 'animate-spin' : ''}`} />
                                      <span>{loadingAI ? 'Consulting Gemini flash 3.5...' : 'Draft Response with AI'}</span>
                                    </button>
                                  </div>

                                  {/* Output draft review */}
                                  {(draftReply || aiError) && (
                                    <div className="space-y-3.5 pt-3.5 border-t border-slate-200">
                                      
                                      {aiError && (
                                        <p className="text-[11px] text-amber-600 font-mono bg-amber-50 p-2 rounded border border-amber-200">
                                          ⚠️ {aiError} (Demo fallback loaded)
                                        </p>
                                      )}

                                      {draftReason && (
                                        <div className="text-[11px] text-slate-500 leading-relaxed bg-white p-2.5 rounded border border-slate-201 shadow-3xs">
                                          <span className="font-bold text-slate-700 block mb-0.5 font-mono text-[10px] uppercase">Copilot Alignment Reasoning:</span>
                                          {draftReason}
                                        </div>
                                      )}

                                      <div className="space-y-1.5 text-xs">
                                        <label htmlFor="draft-reply-input" className="font-sans font-bold text-slate-500">Response Editor (Make manual tweaks if desired)</label>
                                        <textarea
                                          id="draft-reply-input"
                                          rows={3}
                                          value={draftReply}
                                          onChange={(e) => setDraftReply(e.target.value)}
                                          className="w-full p-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs focus:border-indigo-400 outline-none resize-none font-sans leading-relaxed shadow-3xs"
                                        />
                                      </div>

                                      <div className="flex justify-end gap-2 text-xs font-sans">
                                        <button
                                          id="btn-editor-cancel"
                                          type="button"
                                          onClick={() => {
                                            setSelectedCommentId(null);
                                            setDraftReply('');
                                            setDraftReason('');
                                          }}
                                          className="px-3.5 py-1.5 text-slate-400 hover:text-slate-600 font-semibold"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          id="btn-editor-submit"
                                          type="button"
                                          onClick={() => handlePostReplySubmit(comment.id)}
                                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-505 text-white font-bold shadow shadow-indigo-600/10 transition-colors cursor-pointer"
                                        >
                                          <span>Post Reply Draft</span>
                                          <Send className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div id="no-post-selected" className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm flex flex-col items-center justify-center">
              <MessageSquare className="w-8 h-8 text-indigo-400 mb-2" />
              <h4 className="font-sans font-bold text-slate-800">No Post Selected</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm font-medium">Select one of the social posts from the left column feed to moderate comments and trigger Gemini solutions.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
