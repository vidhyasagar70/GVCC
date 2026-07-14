import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import api from './lib/api';
import {
  PlayCircle, BookMarked, Info, ChevronRight,
  Clock, GraduationCap, Search, Menu, X,
  ShieldCheck, Tag, WifiOff, Play,
} from 'lucide-react';

import { VideoPlayer }      from './components/video/VideoPlayer';
import { BookmarkManager }  from './components/video/BookmarkManager';
import { ScreenshotShield } from './components/video/ScreenshotShield';
import { Button }           from './components/ui/Button';
import type { Video }       from './types';
import './index.css';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

type TabId = 'bookmarks' | 'overview' | 'details';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'bookmarks', label: 'Bookmarks', icon: <BookMarked size={13} /> },
  { id: 'overview',  label: 'Overview',  icon: <Info size={13} /> },
  { id: 'details',   label: 'Details',   icon: <Tag size={13} /> },
];

export default function App() {
  const [videos, setVideos]          = useState<Video[]>([]);
  const [selected, setSelected]      = useState<Video | null>(null);
  const [activeTab, setActiveTab]    = useState<TabId>('bookmarks');
  const [loadingVids, setLoadingVids]= useState(true);
  const [vidsError, setVidsError]    = useState<string | null>(null);
  const [search, setSearch]          = useState('');
  const [sidebarOpen, setSidebar]    = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    async function load() {
      setLoadingVids(true);
      setVidsError(null);
      try {
        const { data } = await api.get<Video[]>('/api/videos');
        setVideos(data);
        if (data.length > 0) setSelected(data[0]);
      } catch {
        setVidsError('Cannot reach the server. Make sure the backend is running on port 5000.');
      } finally {
        setLoadingVids(false);
      }
    }
    void load();
  }, []);

  const getCurrentTime = useCallback(() => videoRef.current?.currentTime ?? 0, []);

  const handleSeek = useCallback((time: number) => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.currentTime = time;
    void vid.play();
  }, []);

  const filtered = videos.filter(v =>
    v.title.toLowerCase().includes(search.toLowerCase()) ||
    v.description.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#18181b', color: '#fafafa', fontSize: '13px', borderRadius: '6px', border: '1px solid #3f3f46' },
        }}
      />

      {/* ── Header ──────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 h-12 flex items-center justify-between px-4 sm:px-6
                         border-b border-zinc-200 bg-white/90 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {/* Mobile toggle */}
          <button
            id="sidebar-toggle"
            onClick={() => setSidebar(p => !p)}
            className="lg:hidden p-1.5 rounded text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-zinc-900 flex items-center justify-center">
              <GraduationCap size={14} className="text-white" />
            </div>
            <span className="font-semibold text-zinc-900 text-sm tracking-tight">LearnPortal</span>
          </div>
        </div>

        {/* Right badges */}
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <div className="hidden sm:flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-zinc-400" />
            <span>DRM Protected</span>
          </div>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
        <aside
          className={[
            'flex-shrink-0 w-64 xl:w-72 border-r border-zinc-200 bg-white flex flex-col',
            'fixed lg:relative inset-y-0 left-0 z-30 top-12 transition-transform duration-200',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          ].join(' ')}
        >
          {/* Search */}
          <div className="p-3 border-b border-zinc-100">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                id="video-search"
                type="text"
                placeholder="Search lessons…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-md border border-zinc-200 bg-zinc-50
                           text-sm text-zinc-900 placeholder-zinc-400
                           focus:outline-none focus:border-zinc-900 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Label */}
          <div className="px-4 py-2 flex items-center justify-between border-b border-zinc-100">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Lessons</span>
            <span className="text-[10px] text-zinc-400">{filtered.length}</span>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto py-1">
            {loadingVids && (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="mx-2 my-1 h-14 rounded bg-zinc-100 animate-pulse" />
              ))
            )}

            {vidsError && !loadingVids && (
              <div className="p-4 text-center">
                <WifiOff size={20} className="text-zinc-300 mx-auto mb-2" />
                <p className="text-xs text-zinc-500">{vidsError}</p>
              </div>
            )}

            {!loadingVids && !vidsError && filtered.length === 0 && (
              <p className="text-xs text-zinc-400 text-center py-8">No results</p>
            )}

            {!loadingVids && filtered.map((video, idx) => {
              const isActive = selected?._id === video._id;
              return (
                <button
                  key={video._id}
                  id={`video-item-${video._id}`}
                  onClick={() => { setSelected(video); setSidebar(false); setActiveTab('bookmarks'); }}
                  className={[
                    'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors duration-100 group',
                    isActive
                      ? 'bg-zinc-100 border-l-2 border-zinc-900'
                      : 'border-l-2 border-transparent hover:bg-zinc-50 hover:border-zinc-300',
                  ].join(' ')}
                >
                  {/* Thumbnail */}
                  <div className="relative flex-shrink-0 w-16 h-10 rounded overflow-hidden bg-zinc-200">
                    {video.thumbnailUrl
                      ? <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><Play size={14} className="text-zinc-400" /></div>
                    }
                    {isActive && (
                      <div className="absolute inset-0 bg-zinc-900/50 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                    )}
                    <div className="absolute bottom-0.5 right-0.5 px-1 py-0.5 rounded bg-black/70 text-[10px] font-mono text-white">
                      {formatDuration(video.duration)}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-zinc-400 font-mono mb-0.5">{String(idx + 1).padStart(2, '0')}</p>
                    <p className={`text-xs font-medium leading-snug line-clamp-2 ${isActive ? 'text-zinc-900' : 'text-zinc-700 group-hover:text-zinc-900'}`}>
                      {video.title}
                    </p>
                  </div>

                  <ChevronRight size={13} className={`flex-shrink-0 ${isActive ? 'text-zinc-700' : 'text-zinc-300 group-hover:text-zinc-500'}`} />
                </button>
              );
            })}
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-20 bg-black/30 lg:hidden" onClick={() => setSidebar(false)} />
        )}

        {/* ── Main ────────────────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 min-w-0">
          {selected ? (
            <div className="max-w-6xl mx-auto flex flex-col gap-6">

              {/* ── Theater + Panel ──────────────────────────────────────────── */}
              <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 items-start">

                {/* Player */}
                <div className="flex flex-col gap-3">
                  <ScreenshotShield className="rounded-lg overflow-hidden">
                    <VideoPlayer video={selected} videoRef={videoRef} />
                  </ScreenshotShield>

                  {/* Meta row */}
                  <div className="flex flex-col gap-1">
                    <h1 className="text-base font-semibold text-zinc-900 leading-snug">{selected.title}</h1>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-zinc-400" />
                        {formatDuration(selected.duration)}
                      </span>
                      {selected.instructor && (
                        <span className="flex items-center gap-1">
                          <GraduationCap size={12} className="text-zinc-400" />
                          {selected.instructor}
                        </span>
                      )}
                      {selected.tags?.map(tag => (
                        <span key={tag} className="px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-500">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── Side Panel ────────────────────────────────────────────── */}
                <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden flex flex-col h-[560px] xl:h-[calc(100vh-152px)]">
                  {/* Tabs */}
                  <div className="flex border-b border-zinc-200 flex-shrink-0">
                    {TABS.map(tab => (
                      <button
                        key={tab.id}
                        id={`tab-${tab.id}`}
                        onClick={() => setActiveTab(tab.id)}
                        className={[
                          'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors',
                          activeTab === tab.id
                            ? 'text-zinc-900 border-b-2 border-zinc-900 -mb-px bg-white'
                            : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50',
                        ].join(' ')}
                      >
                        {tab.icon}
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab body */}
                  <div className="flex-1 overflow-hidden p-4 animate-fade-in">
                    {activeTab === 'bookmarks' && (
                      <BookmarkManager
                        videoId={selected._id}
                        getCurrentTime={getCurrentTime}
                        onSeek={handleSeek}
                      />
                    )}

                    {activeTab === 'overview' && (
                      <div className="h-full overflow-y-auto flex flex-col gap-4 text-sm">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1.5">About</p>
                          <p className="text-zinc-700 leading-relaxed">
                            {selected.description || 'No description available.'}
                          </p>
                        </div>
                        {selected.tags && selected.tags.length > 0 && (
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1.5">Topics</p>
                            <div className="flex flex-wrap gap-1.5">
                              {selected.tags.map(tag => (
                                <span key={tag} className="px-2 py-0.5 rounded border border-zinc-200 text-xs text-zinc-600 bg-zinc-50">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'details' && (
                      <div className="h-full overflow-y-auto">
                        <table className="w-full text-xs">
                          <tbody className="divide-y divide-zinc-100">
                            {[
                              { label: 'Duration',   value: formatDuration(selected.duration) },
                              { label: 'Instructor', value: selected.instructor ?? '—' },
                              { label: 'ID',         value: selected._id },
                              { label: 'Added',      value: selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : '—' },
                            ].map(r => (
                              <tr key={r.label}>
                                <td className="py-2.5 pr-4 text-zinc-400 font-medium uppercase tracking-wide w-24">{r.label}</td>
                                <td className="py-2.5 text-zinc-700 font-mono truncate max-w-[160px]">{r.value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Up Next ────────────────────────────────────────────────────── */}
              {(() => {
                const idx  = videos.findIndex(v => v._id === selected._id);
                const next = videos[idx + 1];
                if (!next) return null;
                return (
                  <div className="flex items-center gap-4 p-3 rounded-lg border border-zinc-200 bg-white hover:border-zinc-300 transition-colors">
                    <div className="flex-shrink-0 w-20 h-12 rounded overflow-hidden bg-zinc-100">
                      {next.thumbnailUrl && <img src={next.thumbnailUrl} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium mb-0.5">Up next</p>
                      <p className="text-sm font-medium text-zinc-900 truncate">{next.title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{formatDuration(next.duration)}</p>
                    </div>
                    <Button
                      id="play-next-btn"
                      variant="secondary"
                      size="sm"
                      icon={<PlayCircle size={14} />}
                      onClick={() => { setSelected(next); setActiveTab('bookmarks'); }}
                    >
                      Play
                    </Button>
                  </div>
                );
              })()}
            </div>
          ) : (
            /* ── Empty state ──────────────────────────────────────────────────── */
            <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
              {loadingVids ? (
                <>
                  <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
                  <p className="text-sm text-zinc-500">Loading content…</p>
                </>
              ) : vidsError ? (
                <>
                  <WifiOff size={28} className="text-zinc-300" />
                  <div>
                    <p className="text-sm font-medium text-zinc-900">Backend unreachable</p>
                    <p className="text-xs text-zinc-500 mt-1 max-w-xs">{vidsError}</p>
                  </div>
                  <Button variant="primary" size="sm" onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </>
              ) : (
                <>
                  <PlayCircle size={32} className="text-zinc-300" />
                  <div>
                    <p className="text-sm font-medium text-zinc-900">Select a lesson</p>
                    <p className="text-xs text-zinc-500 mt-1">Choose from the sidebar to start watching</p>
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
