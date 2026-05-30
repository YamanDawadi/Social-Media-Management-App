import { useState, useEffect, FormEvent } from 'react';
import { SocialPost, SocialPlatform, ScheduledPost } from '../types';
import { 
  Clock, 
  Calendar, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Sparkles, 
  ArrowRight, 
  Globe, 
  Image, 
  FileText,
  AlertCircle,
  Play
} from 'lucide-react';

interface PostSchedulerProps {
  posts: SocialPost[];
  setPosts: (posts: SocialPost[]) => void;
  scheduledPosts: ScheduledPost[];
  setScheduledPosts: (scheds: ScheduledPost[]) => void;
  virtualTime: string; // ISO String for simulated app time
  setVirtualTime: (time: string | ((prev: string) => string)) => void;
}

const TEMPLATE_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80', name: 'Minimal Workspace Code' },
  { url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80', name: 'UI design layout wireframe' },
  { url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80', name: 'Creative Notebook & Ideas' },
  { url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80', name: 'Dynamic Team Sync Huddle' },
];

export default function PostScheduler({
  posts,
  setPosts,
  scheduledPosts,
  setScheduledPosts,
  virtualTime,
  setVirtualTime,
}: PostSchedulerProps) {
  // Post Draft Form State
  const [draftContent, setDraftContent] = useState<string>('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(['instagram']);
  const [scheduledDateTime, setScheduledDateTime] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [mediaType, setMediaType] = useState<'image' | 'text'>('text');
  
  // Editing state
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // Status Alerts
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Set default scheduled date (e.g. 2 hours from current virtual time)
  useEffect(() => {
    if (virtualTime) {
      const vDate = new Date(virtualTime);
      vDate.setHours(vDate.getHours() + 2);
      
      // format as YYYY-MM-DDTHH:MM
      const year = vDate.getFullYear();
      const month = String(vDate.getMonth() + 1).padStart(2, '0');
      const day = String(vDate.getDate()).padStart(2, '0');
      const hours = String(vDate.getHours()).padStart(2, '0');
      const minutes = String(vDate.getMinutes()).padStart(2, '0');
      setScheduledDateTime(`${year}-${month}-${day}T${hours}:${minutes}`);
    }
  }, [virtualTime]);

  const togglePlatform = (plat: SocialPlatform) => {
    if (selectedPlatforms.includes(plat)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter(p => p !== plat));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, plat]);
    }
  };

  const handleScheduleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!draftContent.trim()) {
      setAlertMsg({ type: 'error', text: 'Please enter post drafts text caption.' });
      return;
    }
    if (selectedPlatforms.length === 0) {
      setAlertMsg({ type: 'error', text: 'Please select at least one social target channel.' });
      return;
    }
    if (!scheduledDateTime) {
      setAlertMsg({ type: 'error', text: 'Please pick a valid future publish date and time.' });
      return;
    }

    if (editingPostId) {
      // Editing Mode
      setScheduledPosts(scheduledPosts.map(sp => {
        if (sp.id === editingPostId) {
          return {
            ...sp,
            content: draftContent,
            platforms: selectedPlatforms,
            scheduledTime: scheduledDateTime,
            mediaType: mediaType,
            mediaUrl: mediaType === 'image' ? selectedImage : undefined,
          };
        }
        return sp;
      }));
      setAlertMsg({ type: 'success', text: 'Post draft updated successfully' });
      setEditingPostId(null);
    } else {
      // Create new scheduled post
      const newScheduled: ScheduledPost = {
        id: `sched-${Date.now()}`,
        content: draftContent,
        platforms: selectedPlatforms,
        scheduledTime: scheduledDateTime,
        mediaType: mediaType,
        mediaUrl: mediaType === 'image' ? (selectedImage || TEMPLATE_IMAGES[0].url) : undefined,
        status: 'scheduled',
        tags: ['scheduled', 'social_crm']
      };

      setScheduledPosts([newScheduled, ...scheduledPosts]);
      setAlertMsg({ type: 'success', text: 'Social post scheduled successfully!' });
    }

    // Reset Form
    setDraftContent('');
    setSelectedImage('');
    setMediaType('text');
  };

  const handleEditInit = (post: ScheduledPost) => {
    setEditingPostId(post.id);
    setDraftContent(post.content);
    setSelectedPlatforms(post.platforms);
    setScheduledDateTime(post.scheduledTime);
    setMediaType(post.mediaType);
    if (post.mediaUrl) {
      setSelectedImage(post.mediaUrl);
    }
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setDraftContent('');
    setSelectedImage('');
    setMediaType('text');
  };

  const handleDeletePost = (id: string) => {
    setScheduledPosts(scheduledPosts.filter(sp => sp.id !== id));
    setAlertMsg({ type: 'success', text: 'Scheduled post removed.' });
  };

  // Immediate Publish Now action
  const handlePublishNow = (schedPost: ScheduledPost) => {
    // For each platform, register a live post under appropriate publisher profiles
    const newLivePosts: SocialPost[] = schedPost.platforms.map((plat, idx) => ({
      id: `live-published-${Date.now()}-${idx}`,
      platform: plat,
      author: 'Design Studio LLC',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      content: schedPost.content,
      mediaUrl: schedPost.mediaUrl,
      mediaType: schedPost.mediaType,
      timestamp: 'Published Just Now',
      likes: 0,
      commentsCount: 0,
      shares: 0,
      views: 0,
      comments: [],
      tags: schedPost.tags
    }));

    // Update global state
    setPosts([...newLivePosts, ...posts]);
    
    // Update scheduled list Status to "published"
    setScheduledPosts(scheduledPosts.map(sp => {
      if (sp.id === schedPost.id) {
        return { ...sp, status: 'published' };
      }
      return sp;
    }));

    setAlertMsg({ 
      type: 'success', 
      text: `Successfully went live on: ${schedPost.platforms.join(', ')}!` 
    });
  };

  // Advance clock simulation helper
  const handleAdvanceTime = (minutes: number) => {
    setVirtualTime(prev => {
      const d = new Date(prev);
      d.setMinutes(d.getMinutes() + minutes);
      return d.toISOString();
    });
  };

  // Watcher: Automatically check virtual time trigger publishing
  useEffect(() => {
    const currentSimSecs = new Date(virtualTime).getTime();
    
    // Find all "scheduled" posts whose scheduledTime has arrived or passed
    const toPublish = scheduledPosts.filter(sp => {
      if (sp.status !== 'scheduled') return false;
      const schedSecs = new Date(sp.scheduledTime).getTime();
      return currentSimSecs >= schedSecs;
    });

    if (toPublish.length > 0) {
      let createdLive: SocialPost[] = [];
      
      toPublish.forEach(sp => {
        sp.platforms.forEach((plat, idx) => {
          createdLive.push({
            id: `auto-live-${sp.id}-${plat}-${idx}`,
            platform: plat,
            author: 'Design Studio LLC',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            content: sp.content,
            mediaUrl: sp.mediaUrl,
            mediaType: sp.mediaType,
            timestamp: `Just now (Simulated Auto-publish)`,
            likes: Math.floor(Math.random() * 24) + 1,
            commentsCount: 0,
            shares: 0,
            views: Math.floor(Math.random() * 200) + 50,
            comments: [],
            tags: sp.tags
          });
        });
      });

      // Update states
      setPosts([...createdLive, ...posts]);
      setScheduledPosts(scheduledPosts.map(sp => {
        const schedSecs = new Date(sp.scheduledTime).getTime();
        if (sp.status === 'scheduled' && currentSimSecs >= schedSecs) {
          return { ...sp, status: 'published' };
        }
        return sp;
      }));

      setAlertMsg({ 
        type: 'success', 
        text: `🤖 Auto-Publisher triggered! published ${toPublish.length} post(s) automatically based on simulated clock advance.` 
      });
    }
  }, [virtualTime, scheduledPosts, posts]);

  // Render nicely formatted time
  const formatVirtualClock = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return iso;
    }
  };

  return (
    <div id="scheduler-workspace" className="max-w-6xl mx-auto space-y-6">
      
      {/* Header section with Virtual Clock */}
      <div id="scheduler-header" className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="font-sans font-extrabold text-2.5xl text-slate-800">Dynamic Post Scheduler</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Draft, select target platforms, and assign automatic campaign publishing dates.
          </p>
        </div>

        {/* CLOCK SIMULATION DOCK */}
        <div id="scheduler-simulation-clock" className="bg-white border border-indigo-100 rounded-xl p-3 shadow-3xs flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse shrink-0" />
            <div className="text-left">
              <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase tracking-wider">Simulated Server Time</span>
              <span className="text-xs font-sans font-extrabold text-slate-700 block whitespace-nowrap">
                {formatVirtualClock(virtualTime)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 border-t sm:border-t-0 sm:border-l border-slate-100 pt-2 sm:pt-0 sm:pl-3">
            <button
              id="btn-time-advance-1h"
              onClick={() => handleAdvanceTime(60)}
              className="px-2.5 py-1 text-[10px] font-sans font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-605 rounded border border-indigo-100 transition-colors cursor-pointer"
            >
              +1 Hour
            </button>
            <button
              id="btn-time-advance-1d"
              onClick={() => handleAdvanceTime(1440)}
              className="px-2.5 py-1 text-[10px] font-sans font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-605 rounded border border-indigo-100 transition-colors cursor-pointer"
            >
              +1 Day
            </button>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {alertMsg && (
        <div 
          id="scheduler-alert-banner"
          className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs transition-all ${
            alertMsg.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{alertMsg.text}</div>
          <button 
            onClick={() => setAlertMsg(null)} 
            className="text-slate-400 hover:text-slate-600 font-bold font-mono uppercase bg-transparent border-none cursor-pointer text-[10px]"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Grid: Editor Left, Scheduled List Right */}
      <div id="scheduler-content-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Post Draft Creator Form */}
        <div id="scheduler-form-lane" className="lg:col-span-5 space-y-4">
          <span className="text-xs font-sans font-bold text-slate-500 tracking-wider uppercase block">
            {editingPostId ? '🔧 Editorial Override Draft' : '✍️ Draft Direct Social Campaign'}
          </span>

          <form id="schedule-post-form" onSubmit={handleScheduleSubmit} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            
            {/* Target Platform Picker */}
            <div className="space-y-2">
              <label className="text-xs font-sans font-bold text-slate-600 block">Select Target Platform(s)</label>
              <div className="grid grid-cols-4 gap-2">
                {(['facebook', 'instagram', 'twitter', 'linkedin'] as SocialPlatform[]).map(plat => {
                  const isSelected = selectedPlatforms.includes(plat);
                  return (
                    <button
                      key={plat}
                      type="button"
                      id={`btn-target-plat-${plat}`}
                      onClick={() => togglePlatform(plat)}
                      className={`py-2 px-1 rounded-lg border text-center transition-all cursor-pointer font-mono text-[10px] font-bold capitalize flex flex-col items-center justify-center gap-1 ${
                        isSelected 
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm' 
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                      }`}
                    >
                      <span className="text-[11px] leading-none">
                        {plat === 'facebook' ? 'FB' : plat === 'instagram' ? 'IG' : plat === 'twitter' ? 'X' : 'LN'}
                      </span>
                      <span className="text-[8px] opacity-80 font-sans tracking-tight">{plat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Caption Text Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-sans font-bold text-slate-600 block">Caption and Tags Content</label>
              <textarea
                id="text-post-caption-draft"
                required
                rows={4}
                className="w-full rounded-lg border border-slate-200 p-3 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-400 outline-none font-sans shadow-3xs"
                placeholder="What are we announcing today? Add relevant hashtags like #design minimalism..."
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
              />
            </div>

            {/* Post Media Type Switcher */}
            <div className="space-y-2">
              <label className="text-xs font-sans font-bold text-slate-600 block">Post Style</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  id="btn-post-style-text"
                  onClick={() => setMediaType('text')}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-sans font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                    mediaType === 'text'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Text Status</span>
                </button>
                <button
                  type="button"
                  id="btn-post-style-image"
                  onClick={() => setMediaType('image')}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-sans font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                    mediaType === 'image'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Image className="w-3.5 h-3.5" />
                  <span>Image Visual</span>
                </button>
              </div>
            </div>

            {/* Template Visual Gallery Choices if Image Selected */}
            {mediaType === 'image' && (
              <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <label className="text-[10px] font-sans font-bold text-slate-500 block uppercase tracking-wider">Choose Campaign Cover Visual</label>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATE_IMAGES.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      id={`btn-camp-visual-choice-${idx}`}
                      onClick={() => setSelectedImage(img.url)}
                      className={`relative rounded border overflow-hidden h-14 cursor-pointer transition-all ${
                        selectedImage === img.url 
                          ? 'ring-2 ring-indigo-505 border-transparent scale-95 shadow-xs' 
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <img 
                        src={img.url} 
                        alt={img.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-black/40 text-[7.5px] text-white p-0.5 truncate text-left leading-none">
                        {img.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Datetime Selection Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-sans font-bold text-slate-600 block flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span>Date & Time to Automatically Go Live</span>
              </label>
              <input
                id="datetime-schedule-input"
                type="datetime-local"
                required
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-400 outline-none font-sans shadow-3xs"
                value={scheduledDateTime}
                onChange={(e) => setScheduledDateTime(e.target.value)}
              />
            </div>

            {/* Actions Panel */}
            <div className="flex items-center gap-2 pt-2">
              {editingPostId && (
                <button
                  type="button"
                  id="btn-cancel-post-edit"
                  onClick={handleCancelEdit}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-505 hover:bg-slate-50 font-bold transition-all cursor-pointer"
                >
                  Cancel Override
                </button>
              )}
              <button
                type="submit"
                id="btn-submit-scheduled-post"
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-550 text-xs font-bold text-white transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
              >
                {editingPostId ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Apply Override</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Schedule Media Post</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* RIGHT COLUMN: Scheduled queue card deck */}
        <div id="scheduler-deck-lane" className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans font-bold text-slate-500 tracking-wider uppercase block">
              Active Campaign Timeline Queue
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">
              {scheduledPosts.length} post models
            </span>
          </div>

          <div id="scheduler-cards-timeline" className="space-y-4 max-h-[640px] overflow-y-auto pr-1">
            {scheduledPosts.length === 0 ? (
              <div id="scheduler-empty-state" className="bg-white rounded-xl border border-slate-205 p-12 text-center flex flex-col items-center justify-center shadow-sm">
                <Clock className="w-8 h-8 text-indigo-405 mb-2 animate-bounce" />
                <h4 className="font-sans font-bold text-slate-850">Empty Campaign Desk</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
                  You have no pending scheduled campaigns. Use the creator form on the left to queue automatic platform releases.
                </p>
              </div>
            ) : (
              scheduledPosts.map(post => {
                const isPublished = post.status === 'published';
                const scheduledTimeFormatted = formatVirtualClock(post.scheduledTime);
                const isOverdue = new Date(post.scheduledTime).getTime() <= new Date(virtualTime).getTime();

                return (
                  <div 
                    key={post.id}
                    id={`sched-item-card-${post.id}`}
                    className={`p-5 rounded-xl border bg-white shadow-3xs transition-all relative overflow-hidden group ${
                      isPublished 
                        ? 'border-slate-105 opacity-80' 
                        : (isOverdue ? 'border-amber-200 bg-amber-50/10' : 'border-slate-200 hover:border-slate-350')
                    }`}
                  >
                    {/* Top alignment row */}
                    <div className="flex items-start justify-between gap-3">
                      
                      {/* Social targeted channel indicators */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {post.platforms.map(plat => (
                          <span 
                            key={plat}
                            className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border ${
                              plat === 'instagram' ? 'bg-pink-50 text-pink-650 border-pink-100' :
                              plat === 'linkedin' ? 'bg-blue-50 text-blue-650 border-blue-100' :
                              plat === 'facebook' ? 'bg-indigo-50 text-indigo-650 border-indigo-100' :
                              'bg-slate-50 text-slate-700 border-slate-205'
                            }`}
                          >
                            {plat.slice(0, 3)}
                          </span>
                        ))}

                        {/* Status alert badge */}
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8.5px] font-sans font-extrabold uppercase ml-2 ${
                          isPublished 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold' 
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold animate-pulse'
                        }`}>
                          <Calendar className="w-2.5 h-2.5" />
                          <span>{isPublished ? 'Live Published' : 'Scheduled Queue'}</span>
                        </span>
                      </div>

                      {/* Display scheduled target timer */}
                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                        {scheduledTimeFormatted}
                      </span>
                    </div>

                    {/* Middle grid: visuals + text caption */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 my-3.5 items-start">
                      
                      {/* Optional visual thumbnail */}
                      {post.mediaUrl && (
                        <div className="md:col-span-3 aspect-video md:aspect-square rounded border border-slate-150 overflow-hidden bg-slate-100 max-h-16 md:max-h-none">
                          <img 
                            src={post.mediaUrl} 
                            alt="Media thumbnail" 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      )}

                      <div className={post.mediaUrl ? 'md:col-span-9' : 'md:col-span-12'}>
                        <p className="text-xs text-slate-750 font-sans leading-relaxed whitespace-pre-wrap">
                          {post.content}
                        </p>
                      </div>

                    </div>

                    {/* Action Footer row */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 flex-wrap gap-2">
                      
                      <div className="flex items-center gap-1 text-[10px] font-mono text-slate-405 font-bold">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Target: {post.mediaType.toUpperCase()} status</span>
                      </div>

                      {!isPublished && (
                        <div className="flex items-center gap-2">
                          <button
                            id={`btn-edit-sched-${post.id}`}
                            onClick={() => handleEditInit(post)}
                            className="p-1 px-2.2 text-[10px] font-sans font-bold text-slate-550 hover:text-slate-800 bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3 inline mr-1" />
                            <span>Override</span>
                          </button>
                          
                          <button
                            id={`btn-delete-sched-${post.id}`}
                            onClick={() => handleDeletePost(post.id)}
                            className="p-1 text-slate-405 hover:text-rose-600 bg-rose-50/40 hover:bg-rose-50 rounded border border-transparent hover:border-rose-100 transition-all cursor-pointer"
                            title="Cancel campaign post"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            id={`btn-publish-now-${post.id}`}
                            onClick={() => handlePublishNow(post)}
                            className="px-3 py-1 text-[10.5px] font-sans font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <Play className="w-2.5 h-2.5" />
                            <span>Force Live</span>
                          </button>
                        </div>
                      )}

                      {isPublished && (
                        <span className="text-[10px] font-mono text-emerald-600 font-bold">
                          ✓ Appended to live feed metrics
                        </span>
                      )}

                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
