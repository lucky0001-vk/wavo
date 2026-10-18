'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Compass,
  Tv,
  Film,
  FolderOpen,
  Download,
  Clock,
  ExternalLink,
  ShieldCheck,
  Search,
  Plus,
  Play,
  Trash2,
  AlertTriangle,
  Sparkles,
  Subtitles,
  ArrowRight,
  Maximize2,
  Lock,
  Radio,
  FileVideo,
  Info,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { STREAMING_PROVIDERS, validateStreamingUrl, extractYouTubeVideoId } from '@/lib/streaming-providers';
import { StreamingProvider, LocalMediaItem, SubtitleTrack } from '@/types/media-browser';
import { UniversalVideoPlayer } from '@/components/UniversalVideoPlayer';
import { PlaybackAvailabilityBadge } from '@/components/PlaybackAvailabilityBadge';
import { MediaSourceSelectorModal } from '@/components/MediaSourceSelectorModal';
import { saveRecentMedia, getRecentMedia, removeRecentMedia, clearRecentMedia } from '@/lib/local-media-db';
import { createSubtitleTrackFromFile } from '@/lib/subtitle-parser';
import { CURATED_MOVIES } from '@/lib/movies-data';

export default function MediaBrowserPage() {
  const router = useRouter();

  const [activeSection, setActiveSection] = useState<'streaming' | 'youtube' | 'local' | 'downloads' | 'recent'>('streaming');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<StreamingProvider>(STREAMING_PROVIDERS[0]);

  // Local media state
  const [currentLocalVideo, setCurrentLocalVideo] = useState<{
    file?: File;
    blobUrl?: string;
    name: string;
    size: number;
    duration?: number;
  } | null>(null);

  const [recentMediaList, setRecentMediaList] = useState<LocalMediaItem[]>([]);
  const [subtitles, setSubtitles] = useState<SubtitleTrack[]>([]);
  const [folderFiles, setFolderFiles] = useState<File[]>([]);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  // YouTube player state
  const [youtubeVideoId, setYoutubeVideoId] = useState('ByXuk9QqQkk');
  const [youtubeInput, setYoutubeInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const subtitleInputRef = useRef<HTMLInputElement>(null);

  // Load recently played media from IndexedDB on mount
  useEffect(() => {
    loadRecentMedia();
  }, []);

  const loadRecentMedia = async () => {
    try {
      const items = await getRecentMedia();
      setRecentMediaList(items);
    } catch (e) {
      console.warn('Failed to load recent media:', e);
    }
  };

  // Clean up Blob URLs on unmount
  useEffect(() => {
    return () => {
      if (currentLocalVideo?.blobUrl) {
        URL.revokeObjectURL(currentLocalVideo.blobUrl);
      }
      subtitles.forEach((s) => URL.revokeObjectURL(s.blobUrl));
    };
  }, [currentLocalVideo, subtitles]);

  // Handle single file selection
  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    loadLocalFile(file);
  };

  const loadLocalFile = async (file: File) => {
    // Revoke previous blob
    if (currentLocalVideo?.blobUrl) {
      URL.revokeObjectURL(currentLocalVideo.blobUrl);
    }

    const blobUrl = URL.createObjectURL(file);
    const itemData = {
      file,
      blobUrl,
      name: file.name,
      size: file.size,
    };

    setCurrentLocalVideo(itemData);
    setActiveSection('local');

    // Save metadata to IndexedDB
    const recentItem: LocalMediaItem = {
      id: `${file.name}_${file.size}_${file.lastModified}`,
      name: file.name,
      size: file.size,
      type: file.type || 'video/mp4',
      lastModified: file.lastModified,
      addedAt: Date.now(),
    };
    await saveRecentMedia(recentItem);
    loadRecentMedia();

    setStatusFeedback(`Loaded "${file.name}" locally (${(file.size / (1024 * 1024)).toFixed(1)} MB)`);
    setTimeout(() => setStatusFeedback(null), 3500);
  };

  // Handle directory selection via File System Access API or standard fallback
  const handleBrowseFolder = async () => {
    if (typeof window !== 'undefined' && 'showDirectoryPicker' in window) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker();
        const files: File[] = [];

        for await (const entry of dirHandle.values()) {
          if (entry.kind === 'file') {
            const file = await entry.getFile();
            if (file.type.startsWith('video/') || /\.(mp4|webm|mkv|mov|avi)$/i.test(file.name)) {
              files.push(file);
            }
          }
        }

        setFolderFiles(files);
        setStatusFeedback(`Found ${files.length} video file(s) in selected folder.`);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Directory Picker error, falling back:', err);
          folderInputRef.current?.click();
        }
      }
    } else {
      // Mobile Chrome / Safari does not expose directory picking
      setStatusFeedback('Folder browsing is available on desktop. Opening your phone file picker.');
      setTimeout(() => setStatusFeedback(null), 3500);
      fileInputRef.current?.click();
    }
  };

  const handleFolderInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(
      (f) => f.type.startsWith('video/') || /\.(mp4|webm|mkv|mov|avi)$/i.test(f.name)
    );
    setFolderFiles(files);
    setStatusFeedback(`Found ${files.length} video file(s).`);
  };

  // Subtitle file selection (.srt / .vtt)
  const handleSelectSubtitle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const track = await createSubtitleTrackFromFile(file);
      setSubtitles((prev) => [...prev, track]);
      setStatusFeedback(`Subtitles "${file.name}" added successfully.`);
      setTimeout(() => setStatusFeedback(null), 3000);
    } catch (err) {
      console.error('Subtitle parse error:', err);
      setStatusFeedback('Could not parse subtitle file.');
    }
  };

  // Handle YouTube URL or ID search
  const handleLoadYouTube = (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeInput.trim()) return;

    const extracted = extractYouTubeVideoId(youtubeInput);
    if (extracted) {
      setYoutubeVideoId(extracted);
      setStatusFeedback(`Loaded YouTube video ID: ${extracted}`);
    } else {
      setStatusFeedback('Could not extract a valid 11-character YouTube video ID.');
    }
  };

  // Launch Watch Together party with local movie
  const handleStartLocalWatchParty = () => {
    if (!currentLocalVideo) return;
    const encodedName = encodeURIComponent(currentLocalVideo.name);
    router.push(`/watch-together?create=true&localMovie=${encodedName}&mode=shared_session`);
  };

  // Filter streaming providers by search
  const filteredProviders = STREAMING_PROVIDERS.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tagline.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-matroska,.mp4,.webm,.mkv,.mov"
        onChange={handleSelectFile}
        className="hidden"
      />
      <input
        ref={folderInputRef}
        type="file"
        // @ts-ignore
        webkitdirectory="true"
        directory="true"
        onChange={handleFolderInputChange}
        className="hidden"
      />
      <input
        ref={subtitleInputRef}
        type="file"
        accept=".srt,.vtt,text/vtt"
        onChange={handleSelectSubtitle}
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-cinema/15 text-amber-cinema text-xs font-semibold uppercase tracking-wider mb-2">
            <Compass size={14} />
            <span>Media Browser & Unified Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Media Browser
          </h1>
          <p className="text-xs sm:text-sm text-cinema-400 mt-1 max-w-2xl">
            Stream official online platforms, watch embeddable YouTube videos, browse local video libraries, and launch synchronized watch parties.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3.5 top-3 text-cinema-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search providers or titles..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cinema-900 border border-cinema-750 text-cinema-100 placeholder-cinema-500 text-xs focus:outline-none focus:border-amber-cinema"
          />
        </div>
      </div>

      {/* Status feedback toast */}
      {statusFeedback && (
        <div className="mb-6 p-3.5 rounded-2xl bg-amber-cinema/15 border border-amber-cinema/30 text-amber-cinema text-xs flex items-center gap-2 animate-fade-in">
          <Sparkles size={15} />
          <span>{statusFeedback}</span>
        </div>
      )}

      {/* Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none border-b border-cinema-850">
        <button
          onClick={() => setActiveSection('streaming')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeSection === 'streaming'
              ? 'bg-amber-cinema text-cinema-950 shadow-glow-amber'
              : 'bg-cinema-900 border border-cinema-800 text-cinema-300 hover:text-white'
          }`}
        >
          <Tv size={14} />
          <span>Online Streaming</span>
        </button>

        <button
          onClick={() => setActiveSection('youtube')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeSection === 'youtube'
              ? 'bg-amber-cinema text-cinema-950 shadow-glow-amber'
              : 'bg-cinema-900 border border-cinema-800 text-cinema-300 hover:text-white'
          }`}
        >
          <Film size={14} />
          <span>YouTube Player & Sync</span>
        </button>

        <button
          onClick={() => setActiveSection('local')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeSection === 'local'
              ? 'bg-amber-cinema text-cinema-950 shadow-glow-amber'
              : 'bg-cinema-900 border border-cinema-800 text-cinema-300 hover:text-white'
          }`}
        >
          <FolderOpen size={14} />
          <span>Local Movies</span>
          {currentLocalVideo && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveSection('downloads')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeSection === 'downloads'
              ? 'bg-amber-cinema text-cinema-950 shadow-glow-amber'
              : 'bg-cinema-900 border border-cinema-800 text-cinema-300 hover:text-white'
          }`}
        >
          <Download size={14} />
          <span>Downloads Browser</span>
          {folderFiles.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-cinema-750 text-[10px] font-mono">
              {folderFiles.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSection('recent')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeSection === 'recent'
              ? 'bg-amber-cinema text-cinema-950 shadow-glow-amber'
              : 'bg-cinema-900 border border-cinema-800 text-cinema-300 hover:text-white'
          }`}
        >
          <Clock size={14} />
          <span>Recent Media ({recentMediaList.length})</span>
        </button>
      </div>

      {/* SECTION 1: ONLINE STREAMING & PROVIDER ACCESS */}
      {activeSection === 'streaming' && (
        <div className="space-y-8 animate-fade-in">
          {/* Provider Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProviders.map((provider) => {
              const isSelected = selectedProvider.id === provider.id;
              const isYouTube = provider.id === 'youtube';
              return (
                <div
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider)}
                  className={`p-6 rounded-3xl bg-cinema-850 border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-cinema shadow-glow-amber'
                      : 'border-cinema-750/70 hover:border-cinema-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className="px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide"
                        style={{
                          backgroundColor: `${provider.accentColor}25`,
                          color: provider.accentColor,
                        }}
                      >
                        {provider.badge}
                      </span>

                      <PlaybackAvailabilityBadge
                        status={isYouTube ? 'youtube_player' : 'provider_integration_required'}
                        compact={true}
                      />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-1">{provider.name}</h3>
                    <p className="text-xs text-amber-cinema font-medium mb-3">{provider.tagline}</p>
                    <p className="text-xs text-cinema-300 leading-relaxed mb-4">
                      {provider.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-cinema-800 flex items-center justify-between">
                    <span className="text-[11px] text-cinema-400">
                      {provider.syncSupported ? '✓ 100% In-App Sync' : '• Partner SDK Required'}
                    </span>

                    {isYouTube ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSection('youtube');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-cinema text-cinema-950 font-bold text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        <Play size={12} className="fill-cinema-950" />
                        <span>Stream In-App</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedProvider(provider)}
                        className="px-3 py-1.5 rounded-xl bg-cinema-800 hover:bg-cinema-750 text-cinema-200 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Info size={13} />
                        <span>Check Status</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Provider Playback Status Panel */}
          {selectedProvider.id !== 'youtube' && (
            <div className="p-6 rounded-3xl bg-cinema-850 border border-amber-cinema/30 text-cinema-200 space-y-4 animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-cinema/15 text-amber-cinema flex items-center justify-center shrink-0">
                  <ShieldAlert size={22} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-base font-bold text-white">
                      In-app playback unavailable for {selectedProvider.name}
                    </h3>
                    <PlaybackAvailabilityBadge status="provider_integration_required" compact={true} />
                  </div>
                  <p className="text-xs text-cinema-300 leading-relaxed">
                    {selectedProvider.name} enforces hardware DRM ({selectedProvider.drmType}) and security headers (X-Frame-Options: DENY). Standard web browsers cannot embed proprietary video players without violating browser security or provider DRM.
                  </p>
                  <p className="text-xs text-amber-cinema mt-1">
                    Requirements for in-app video: Official streaming partner SDK, Widevine CDM licensing, or a native desktop WebView container.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-cinema-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-cinema-300">Playable in this app right now:</span>
                  <button
                    onClick={() => setActiveSection('youtube')}
                    className="px-3 py-1.5 rounded-xl bg-cinema-900 hover:bg-cinema-800 text-cinema-100 border border-cinema-750 text-xs font-medium flex items-center gap-1.5"
                  >
                    <Play size={12} className="fill-current text-red-500" />
                    <span>Watch Trailers & YouTube</span>
                  </button>
                  <button
                    onClick={() => setActiveSection('local')}
                    className="px-3 py-1.5 rounded-xl bg-cinema-900 hover:bg-cinema-800 text-cinema-100 border border-cinema-750 text-xs font-medium flex items-center gap-1.5"
                  >
                    <FolderOpen size={12} className="text-blue-400" />
                    <span>Load Local Movie</span>
                  </button>
                  <button
                    onClick={() => router.push('/watch-together')}
                    className="px-3 py-1.5 rounded-xl bg-amber-cinema text-cinema-950 font-bold text-xs flex items-center gap-1.5"
                  >
                    <Users size={12} />
                    <span>Discover in Watch Together</span>
                  </button>
                </div>

                <div className="text-xs text-cinema-400 flex items-center gap-1.5 self-end sm:self-auto bg-cinema-900 border border-cinema-750 px-3 py-1.5 rounded-xl">
                  <ShieldCheck size={14} className="text-amber-cinema" />
                  <span>Hardware DRM Active • Stay in Wavo for Synced Party</span>
                </div>
              </div>
            </div>
          )}

          {/* Provider Security & Architecture Explanation Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-cinema-900 border border-cinema-750/80">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-cinema/15 text-amber-cinema flex items-center justify-center shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-white mb-1">
                  Provider Authentication & DRM Security Standards
                </h3>
                <p className="text-xs text-cinema-300 leading-relaxed mb-3">
                  Wavo strictly follows modern web standards. We never proxy login credentials, collect third-party passwords, or circumvent Widevine / PlayReady DRM.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-cinema-400 pt-2">
                  <div className="p-3 rounded-xl bg-cinema-950 border border-cinema-800">
                    <span className="font-semibold text-white block mb-0.5">Web Application Mode</span>
                    <span>Commercial services enforce frame-busting security headers. They open securely in isolated official tabs.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-cinema-950 border border-cinema-800">
                    <span className="font-semibold text-white block mb-0.5">Desktop Native WebView Mode</span>
                    <span>When running via desktop shells, partitioned isolated webviews allow embedded sign-in without credential sharing.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: YOUTUBE PLAYER & EXPLORER */}
      {activeSection === 'youtube' && (
        <div className="space-y-6 animate-fade-in">
          {/* YouTube Search / Input */}
          <div className="p-6 rounded-3xl bg-cinema-850 border border-cinema-750/80">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Film size={18} className="text-red-500" />
              <span>Official YouTube Player & Sync Integration</span>
            </h2>
            <p className="text-xs text-cinema-400 mb-4">
              Paste any YouTube video link or 11-character video ID to stream using the official YouTube Player API.
            </p>

            <form onSubmit={handleLoadYouTube} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={youtubeInput}
                onChange={(e) => setYoutubeInput(e.target.value)}
                placeholder="Paste YouTube URL (e.g. https://www.youtube.com/watch?v=ByXuk9QqQkk) or video ID"
                className="flex-1 px-4 py-2.5 rounded-xl bg-cinema-900 border border-cinema-750 text-cinema-100 text-xs sm:text-sm focus:outline-none focus:border-amber-cinema"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-cinema hover:bg-amber-hover text-cinema-950 font-semibold text-xs transition-colors shrink-0"
              >
                Load Video
              </button>
            </form>
          </div>

          {/* YouTube In-App Player Embed */}
          <div className="relative aspect-video w-full rounded-3xl overflow-hidden border border-cinema-800 bg-black shadow-2xl">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}?rel=0&modestbranding=1&enablejsapi=1`}
              title="YouTube Player"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Quick Party Launcher from YouTube */}
          <div className="p-5 rounded-2xl bg-cinema-850 border border-cinema-750/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-white">Watch this video with friends?</h4>
              <p className="text-xs text-cinema-400">Launch a synchronized Wavo room with live chat and emoji bursts.</p>
            </div>
            <Link
              href={`/watch-together?create=true&youtubeId=${youtubeVideoId}`}
              className="px-5 py-2.5 rounded-xl bg-amber-cinema hover:bg-amber-hover text-cinema-950 font-bold text-xs shadow-glow-amber flex items-center gap-2"
            >
              <Radio size={14} />
              <span>Create Watch Together Room</span>
            </Link>
          </div>
        </div>
      )}

      {/* SECTION 3: LOCAL MOVIES & UNIVERSAL PLAYER */}
      {activeSection === 'local' && (
        <div className="space-y-6 animate-fade-in">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-cinema-850 border border-cinema-750/80">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-amber-cinema hover:bg-amber-hover text-cinema-950 font-semibold text-xs flex items-center gap-2 shadow-glow-amber"
              >
                <FolderOpen size={16} />
                <span>Browse Video File</span>
              </button>

              <button
                onClick={handleBrowseFolder}
                className="px-4 py-2.5 rounded-xl bg-cinema-800 hover:bg-cinema-750 text-cinema-200 border border-cinema-700 text-xs font-medium flex items-center gap-2"
              >
                <FolderOpen size={16} className="text-amber-cinema" />
                <span>Browse Movie Folder</span>
              </button>

              <button
                onClick={() => subtitleInputRef.current?.click()}
                className="px-3.5 py-2.5 rounded-xl bg-cinema-900 hover:bg-cinema-800 text-cinema-300 border border-cinema-750 text-xs font-medium flex items-center gap-1.5"
                title="Add SRT or VTT subtitle track"
              >
                <Subtitles size={15} />
                <span>Add Subtitles (.srt/.vtt)</span>
              </button>
            </div>

            {currentLocalVideo && (
              <button
                onClick={handleStartLocalWatchParty}
                className="px-4 py-2.5 rounded-xl bg-cinema-800 hover:bg-amber-cinema hover:text-cinema-950 text-amber-cinema border border-amber-cinema/40 text-xs font-bold transition-all flex items-center gap-2"
              >
                <Radio size={14} />
                <span>Watch Party with this Video</span>
              </button>
            )}
          </div>

          {/* Universal Video Player for Local Video */}
          <UniversalVideoPlayer
            src={currentLocalVideo?.blobUrl}
            title={currentLocalVideo?.name}
            subtitles={subtitles}
            autoPlay={true}
          />

          {/* File details & privacy callout */}
          {currentLocalVideo && (
            <div className="p-4 rounded-2xl bg-cinema-850 border border-cinema-750 flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
              <div className="flex items-center gap-3">
                <FileVideo size={20} className="text-amber-cinema" />
                <div>
                  <span className="font-semibold text-white block">{currentLocalVideo.name}</span>
                  <span className="text-cinema-400">
                    {(currentLocalVideo.size / (1024 * 1024)).toFixed(1)} MB • Decoded locally by browser
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-cinema-400 flex items-center gap-1">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>100% Client-Side Playback — Zero File Upload</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: DOWNLOADS BROWSER */}
      {activeSection === 'downloads' && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-6 rounded-3xl bg-cinema-850 border border-cinema-750/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                  <Download size={18} className="text-amber-cinema" />
                  <span>Downloads & Local Directory Browser</span>
                </h2>
                <p className="text-xs text-cinema-400 max-w-xl">
                  Select a directory (such as your Downloads folder) to index and play compatible video files with permission.
                </p>
              </div>

              <button
                onClick={handleBrowseFolder}
                className="px-5 py-2.5 rounded-xl bg-amber-cinema hover:bg-amber-hover text-cinema-950 font-bold text-xs shrink-0 flex items-center gap-2 shadow-glow-amber"
              >
                <FolderOpen size={15} />
                <span>Select Folder to Index</span>
              </button>
            </div>

            {/* Folder inspection list */}
            {folderFiles.length === 0 ? (
              <div className="py-12 text-center rounded-2xl bg-cinema-900 border border-dashed border-cinema-750 p-6">
                <Download size={32} className="text-cinema-500 mx-auto mb-2" />
                <p className="text-xs font-medium text-cinema-300">No folder loaded yet</p>
                <p className="text-[11px] text-cinema-500 mt-1 max-w-md mx-auto">
                  Click "Select Folder to Index" above to grant permission to browse video files in your Downloads or Movies folder.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {folderFiles.map((file, idx) => (
                  <div
                    key={`${file.name}_${idx}`}
                    className="p-3.5 rounded-2xl bg-cinema-900 border border-cinema-750/70 hover:border-amber-cinema/50 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold text-white truncate">{file.name}</p>
                      <p className="text-[10px] text-cinema-400">
                        {(file.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>

                    <button
                      onClick={() => loadLocalFile(file)}
                      className="p-2 rounded-xl bg-cinema-800 hover:bg-amber-cinema hover:text-cinema-950 text-cinema-200 transition-colors shrink-0"
                      title="Play this file"
                    >
                      <Play size={14} className="ml-0.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 5: RECENT MEDIA HISTORY */}
      {activeSection === 'recent' && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-6 rounded-3xl bg-cinema-850 border border-cinema-750/80">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                  <Clock size={18} className="text-amber-cinema" />
                  <span>Recently Opened Media</span>
                </h2>
                <p className="text-xs text-cinema-400">
                  Track your local playback sessions stored securely in your browser's IndexedDB.
                </p>
              </div>

              {recentMediaList.length > 0 && (
                <button
                  onClick={async () => {
                    await clearRecentMedia();
                    loadRecentMedia();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-cinema-900 hover:bg-red-500/20 text-cinema-400 hover:text-red-400 text-xs font-medium border border-cinema-750 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 size={13} />
                  <span>Clear History</span>
                </button>
              )}
            </div>

            {recentMediaList.length === 0 ? (
              <div className="py-12 text-center rounded-2xl bg-cinema-900 p-6 text-cinema-500 text-xs">
                <Clock size={28} className="mx-auto mb-2 opacity-50" />
                <p>No recently played media recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentMediaList.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-cinema-900 border border-cinema-750/60 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-9 h-9 rounded-xl bg-cinema-800 text-amber-cinema flex items-center justify-center shrink-0">
                        <FileVideo size={18} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                        <p className="text-[10px] text-cinema-400">
                          {(item.size / (1024 * 1024)).toFixed(1)} MB • Last played{' '}
                          {new Date(item.addedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-amber-cinema/15 hover:bg-amber-cinema hover:text-cinema-950 text-amber-cinema text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <Play size={12} />
                        <span>Resume</span>
                      </button>

                      <button
                        onClick={async () => {
                          await removeRecentMedia(item.id);
                          loadRecentMedia();
                        }}
                        className="p-2 rounded-xl text-cinema-500 hover:text-red-400 hover:bg-cinema-800 transition-colors"
                        title="Remove from history"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
