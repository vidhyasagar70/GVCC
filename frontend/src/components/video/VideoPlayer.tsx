import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play, Pause, Volume2, VolumeX,
  Maximize, Minimize, SkipBack, SkipForward, Settings,
} from 'lucide-react';
import type { VideoPlayerProps } from '../../types';

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${m}:${String(s).padStart(2,'0')}`;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, onTimeUpdate, videoRef }) => {
  const [isPlaying, setIsPlaying]       = useState(false);
  const [currentTime, setCurrentTime]   = useState(0);
  const [duration, setDuration]         = useState(0);
  const [volume, setVolume]             = useState(1);
  const [isMuted, setIsMuted]           = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering]   = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const containerRef  = useRef<HTMLDivElement>(null);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    if (isPlaying) {
      controlsTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  useEffect(() => () => { if (controlsTimer.current) clearTimeout(controlsTimer.current); }, []);

  const handleTimeUpdate = () => {
    const vid = videoRef.current;
    if (!vid) return;
    setCurrentTime(vid.currentTime);
    onTimeUpdate?.(vid.currentTime);
  };

  const handleLoadedMetadata = () => { const vid = videoRef.current; if (vid) setDuration(vid.duration); };
  const handlePlay    = () => setIsPlaying(true);
  const handlePause   = () => { setIsPlaying(false); setShowControls(true); };
  const handleWaiting = () => setIsBuffering(true);
  const handleCanPlay = () => setIsBuffering(false);
  const handleEnded   = () => { setIsPlaying(false); setShowControls(true); };

  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) void vid.play(); else vid.pause();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vid = videoRef.current;
    if (!vid) return;
    const time = Number(e.target.value);
    vid.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vid = videoRef.current;
    if (!vid) return;
    const vol = Number(e.target.value);
    vid.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const skip = (sec: number) => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.currentTime = Math.max(0, Math.min(vid.currentTime + sec, duration));
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const setRate = (rate: number) => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimer}
      onMouseEnter={resetControlsTimer}
      onMouseLeave={() => { if (isPlaying) setShowControls(false); }}
      className="relative w-full bg-zinc-950 rounded-lg overflow-hidden"
      style={{ aspectRatio: '16/9' }}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={video.videoUrl}
        poster={video.thumbnailUrl}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={handlePlay}
        onPause={handlePause}
        onWaiting={handleWaiting}
        onCanPlay={handleCanPlay}
        onEnded={handleEnded}
        onClick={togglePlay}
        playsInline
      />

      {/* Buffering */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Centre play button */}
      {!isPlaying && !isBuffering && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center"
          aria-label="Play"
        >
          <div className="p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors duration-150">
            <Play size={28} className="text-white fill-white ml-0.5" />
          </div>
        </button>
      )}

      {/* Controls */}
      <div
        className={[
          'absolute bottom-0 left-0 right-0 transition-all duration-200',
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none',
        ].join(' ')}
      >
        {/* Gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        <div className="relative px-3 pb-3 pt-8 flex flex-col gap-2">
          {/* Progress bar */}
          <input
            type="range" min={0} max={duration || 100} value={currentTime} step={0.1}
            onChange={handleSeek}
            className="w-full h-0.5 appearance-none rounded-full cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
                       [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:opacity-0
                       hover:[&::-webkit-slider-thumb]:opacity-100 [&::-webkit-slider-thumb]:transition-opacity"
            style={{ background: `linear-gradient(to right,#fff ${progress}%,rgba(255,255,255,0.25) ${progress}%)` }}
            aria-label="Video progress"
          />

          {/* Bottom row */}
          <div className="flex items-center justify-between">
            {/* Left */}
            <div className="flex items-center gap-0.5">
              <button onClick={() => skip(-10)} className="p-1.5 text-white/70 hover:text-white transition-colors" aria-label="Rewind 10s">
                <SkipBack size={16} />
              </button>
              <button onClick={togglePlay} className="p-1.5 text-white hover:text-white/80 transition-colors" aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current" />}
              </button>
              <button onClick={() => skip(10)} className="p-1.5 text-white/70 hover:text-white transition-colors" aria-label="Skip 10s">
                <SkipForward size={16} />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-1.5 group/vol ml-1">
                <button onClick={toggleMute} className="p-1.5 text-white/70 hover:text-white transition-colors" aria-label={isMuted ? 'Unmute' : 'Mute'}>
                  {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <input
                  type="range" min={0} max={1} step={0.05} value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-0 group-hover/vol:w-16 h-0.5 appearance-none rounded-full cursor-pointer transition-all duration-200
                             [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5
                             [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white overflow-hidden"
                  style={{ background: `linear-gradient(to right,#fff ${(isMuted ? 0 : volume)*100}%,rgba(255,255,255,0.25) ${(isMuted ? 0 : volume)*100}%)` }}
                  aria-label="Volume"
                />
              </div>

              {/* Time */}
              <span className="text-xs text-white/60 font-mono ml-1.5 hidden sm:block tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-0.5 relative">
              {/* Speed */}
              <div className="relative">
                <button
                  onClick={() => setShowSettings(p => !p)}
                  className="flex items-center gap-1 px-2 py-1 text-white/70 hover:text-white transition-colors text-xs font-mono"
                  aria-label="Playback speed"
                >
                  <Settings size={14} />
                  <span className="hidden sm:block">{playbackRate}x</span>
                </button>
                {showSettings && (
                  <div className="absolute bottom-8 right-0 bg-zinc-900 border border-zinc-700 rounded-lg p-1.5 min-w-[100px] shadow-xl animate-fade-in">
                    <p className="text-[10px] text-zinc-500 px-2 pb-1 uppercase tracking-wide">Speed</p>
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map(r => (
                      <button
                        key={r}
                        onClick={() => setRate(r)}
                        className={[
                          'w-full text-left text-xs px-2 py-1 rounded transition-colors',
                          playbackRate === r ? 'text-white bg-zinc-700' : 'text-zinc-400 hover:text-white hover:bg-zinc-800',
                        ].join(' ')}
                      >
                        {r === 1 ? 'Normal' : `${r}×`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={toggleFullscreen} className="p-1.5 text-white/70 hover:text-white transition-colors" aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
                {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Title bar */}
      <div className={`absolute top-0 left-0 right-0 transition-all duration-200 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
        <p className="relative px-3 pt-2.5 text-xs font-medium text-white/80 truncate">{video.title}</p>
      </div>
    </div>
  );
};
