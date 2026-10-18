'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Movie } from '@/types';
import { PlaybackSource, LocalMediaItem } from '@/types/media-browser';
import { CURATED_MOVIES } from '@/lib/movies-data';
import { createWatchRoom, fetchWatchRoom } from '@/lib/room-manager';
import { useAuth } from '@/lib/auth-context';
import { useWatchlist } from '@/lib/watchlist-context';
import { STREAMING_PROVIDERS, extractYouTubeVideoId } from '@/lib/streaming-providers';
import { getRecentMedia, saveRecentMedia } from '@/lib/local-media-db';
import { UniversalVideoPlayer } from '@/components/UniversalVideoPlayer';
import { PlaybackAvailabilityBadge } from '@/components/PlaybackAvailabilityBadge';
import { MediaSourceSelectorModal } from '@/components/MediaSourceSelectorModal';
import {
  Compass,
  Tv,
  Film,
  FolderOpen,
  Clock,
  Bookmark,
  Search,
  Users,
  Play,
  ArrowRight,
  Sparkles,
  KeyRound,
  Copy,
  Check,
  ShieldAlert,
  AlertCircle,
  Plus,
  Radio,
  SlidersHorizontal,
  Layers,
  Lock,
  Globe,
  Maximize2,
  X,
  History,
  Info,
} from 'lucide-react';

type WatchTogetherSection =
  | 'recommended'
  | 'browse'
  | 'search'
  | 'youtube'
  | 'streaming'
  | 'local'
  | 'recent'
  | 'watchlist'
  | 'continue_watching';

function WatchTogetherContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { watchlist } = useWatchlist();

  // Query parameters
  const initialMovieId = searchParams.get('movieId');
  const localMovieParam = searchParams.get('localMovie');
  const youtubeIdParam = searchParams.get('youtubeId');
  const initialCode = searchParams.get('code');
  const directJoin = searchParams.get('join') === 'true' || Boolean(initialCode);

  // Flow State: 'browse' | 'room_setup' | 'join_room' | 'in_app_watch'
  const [currentView, setCurrentView] = useState<'browse' | 'room_setup' | 'join_room' | 'in_app_watch'>(
    directJoin ? 'join_room' : 'browse'
  );

  // Active section inside the "What do you want to watch?" screen
  const [activeSection, setActiveSection] = useState<WatchTogetherSection>('recommended');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string>('all');

  // Media Selection State
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(() => {
    if (initialMovieId) {
      return CURATED_MOVIES.find((m) => m.id === initialMovieId) || CURATED_MOVIES[0];
    }
    return null;
  });

  const [selectedSource, setSelectedSource] = useState<PlaybackSource | null>(null);

  // Local media state
  const [currentLocalVideo, setCurrentLocalVideo] = useState<{
    file?: File;
    blobUrl?: string;
    name: string;
    size?: number;
  } | null>(null);

  const [recentMediaList, setRecentMediaList] = useState<LocalMediaItem[]>([]);
  const [folderFiles, setFolderFiles] = useState<File[]>([]);
  const [sourceModalMovie, setSourceModalMovie] = useState<Movie | null>(null);

  // YouTube Explorer state
  const [youtubeInput, setYoutubeInput] = useState('');
  const [youtubeExplorerId, setYoutubeExplorerId] = useState<string>('ByXuk9QqQkk');
  const [youtubePreviewActive, setYoutubePreviewActive] = useState(false);

  // In-App Solo Player state (Watch Now)
  const [soloPlayerMedia, setSoloPlayerMedia] = useState<{
    type: 'youtube' | 'local';
    idOrUrl: string;
    title: string;
  } | null>(null);

  // Room Setup options
  const [isPublicRoom, setIsPublicRoom] = useState(true);
  const [hostNickname, setHostNickname] = useState(user?.displayName || '');
  const [joinCode, setJoinCode] = useState(initialCode || '');
  const [guestNickname, setGuestNickname] = useState(user?.displayName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Refs for local files
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Keep nickname synced with auth user
  useEffect(() => {
    if (user?.displayName) {
      if (!hostNickname) setHostNickname(user.displayName);
      if (!guestNickname) setGuestNickname(user.displayName);
    }
  }, [user]);

  // Load Recent Media from IndexedDB
  useEffect(() => {
    async function loadRecent() {
      try {
        const items = await getRecentMedia();
        setRecentMediaList(items);
      } catch (err) {
        console.warn('Could not load recent media:', err);
      }
    }
    loadRecent();
  }, []);

  // Handle incoming query params carrying movie selections from other pages
  useEffect(() => {
    if (initialMovieId) {
      const found = CURATED_MOVIES.find((m) => m.id === initialMovieId);
      if (found) {
        setSelectedMovie(found);
        setSourceModalMovie(found);
      }
    } else if (localMovieParam) {
      const localTitle = decodeURIComponent(localMovieParam);
      const mockMovie: Movie = {
        id: `local-${Date.now()}`,
        title: localTitle,
        overview: 'Personal movie file session. Each participant synchronizes their local copy.',
        posterPath: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=780&q=80',
        backdropPath: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1280&q=80',
        releaseYear: 'Local File',
        runtime: 120,
        rating: 9.0,
        voteCount: 1,
        genres: ['Local Media', 'Personal Library'],
        language: 'Local',
        trailerYoutubeId: 'ByXuk9QqQkk',
        moodMatchReason: 'Mode A: Shared Session with individual local video copy.',
      };
      setSelectedMovie(mockMovie);
      setSelectedSource({
        id: 'local-active',
        name: `Local File: ${localTitle}`,
        type: 'local',
        availability: 'playable_in_app',
        isPlayableInApp: true,
      });
      setCurrentView('room_setup');
    } else if (youtubeIdParam) {
      const ytMovie: Movie = {
        id: `yt-${youtubeIdParam}`,
        title: 'YouTube Stream',
        overview: 'Synchronized YouTube video streaming session.',
        posterPath: `https://img.youtube.com/vi/${youtubeIdParam}/hqdefault.jpg`,
        backdropPath: `https://img.youtube.com/vi/${youtubeIdParam}/maxresdefault.jpg`,
        releaseYear: 'Online',
        runtime: 15,
        rating: 8.5,
        voteCount: 1,
        genres: ['YouTube', 'Video'],
        language: 'EN',
        trailerYoutubeId: youtubeIdParam,
      };
      setSelectedMovie(ytMovie);
      setSelectedSource({
        id: `yt-${youtubeIdParam}`,
        name: 'Official YouTube Stream',
        type: 'youtube',
        availability: 'youtube_player',
        isPlayableInApp: true,
        mediaId: youtubeIdParam,
      });
      setCurrentView('room_setup');
    }
  }, [initialMovieId, localMovieParam, youtubeIdParam]);

  // Clean up Blob URLs on unmount
  useEffect(() => {
    return () => {
      if (currentLocalVideo?.blobUrl) {
        URL.revokeObjectURL(currentLocalVideo.blobUrl);
      }
    };
  }, [currentLocalVideo]);

  // Handle local file selection
  const handleSelectLocalFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (currentLocalVideo?.blobUrl) {
      URL.revokeObjectURL(currentLocalVideo.blobUrl);
    }

    const blobUrl = URL.createObjectURL(file);
    const item = {
      file,
      blobUrl,
      name: file.name,
      size: file.size,
    };
    setCurrentLocalVideo(item);

    // Save to IndexedDB
    saveRecentMedia({
      id: `${file.name}_${file.size}_${file.lastModified}`,
      name: file.name,
      size: file.size,
      type: file.type || 'video/mp4',
      lastModified: file.lastModified,
      addedAt: Date.now(),
    });

    const localMovie: Movie = {
      id: `local-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      overview: `Personal video file (${(file.size / (1024 * 1024)).toFixed(1)} MB). Ready for in-app viewing or Mode A synchronized party.`,
      posterPath: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=780&q=80',
      backdropPath: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1280&q=80',
      releaseYear: 'Local Video',
      runtime: 100,
      rating: 9.0,
      voteCount: 1,
      genres: ['Local Media', 'Personal File'],
      language: 'Local',
      trailerYoutubeId: 'ByXuk9QqQkk',
    };

    setSelectedMovie(localMovie);
    setSelectedSource({
      id: 'local-file-active',
      name: file.name,
      type: 'local',
      availability: 'playable_in_app',
      isPlayableInApp: true,
      streamUrl: blobUrl,
    });
  };

  // Directory picker via File System Access API
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
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          folderInputRef.current?.click();
        }
      }
    } else {
      // Mobile Chrome fallback
      fileInputRef.current?.click();
    }
  };

  const handleFolderInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(
      (f) => f.type.startsWith('video/') || /\.(mp4|webm|mkv|mov|avi)$/i.test(f.name)
    );
    setFolderFiles(files);
  };

  // Launch In-App Solo Viewing (Watch Now)
  const handleWatchNow = (movie: Movie, source: PlaybackSource, localFile?: File) => {
    if (source.type === 'youtube') {
      setSoloPlayerMedia({
        type: 'youtube',
        idOrUrl: source.mediaId || movie.trailerYoutubeId || 'ByXuk9QqQkk',
        title: movie.title,
      });
      setCurrentView('in_app_watch');
    } else if (source.type === 'local') {
      if (currentLocalVideo?.blobUrl) {
        setSoloPlayerMedia({
          type: 'local',
          idOrUrl: currentLocalVideo.blobUrl,
          title: currentLocalVideo.name,
        });
        setCurrentView('in_app_watch');
      } else {
        fileInputRef.current?.click();
      }
    }
  };

  // Launch Watch Together Setup with Selected Movie and Source
  const handleSelectForWatchTogether = (
    movie: Movie,
    source: PlaybackSource,
    localFile?: File
  ) => {
    setSelectedMovie(movie);
    setSelectedSource(source);
    setSourceModalMovie(null);
    setCurrentView('room_setup');
  };

  // Handle Room Creation
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMovie) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const nickname = hostNickname.trim() || user?.displayName || 'CinemaHost';
      const isLocal = selectedSource?.type === 'local' || selectedMovie.id.startsWith('local-');

      const room = await createWatchRoom({
        movie: selectedMovie,
        hostId: user?.id || `host_${Date.now()}`,
        hostNickname: nickname,
        isPublic: isPublicRoom,
        initialPlayback: {
          mediaType: isLocal ? 'mp4' : 'youtube',
          mediaId: isLocal
            ? selectedMovie.title
            : selectedSource?.mediaId || selectedMovie.trailerYoutubeId || 'ByXuk9QqQkk',
        },
      });

      router.push(`/room/${room.code}`);
    } catch (err: any) {
      console.error('Error creating room:', err);
      setErrorMsg('Failed to create watch room. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Joining Existing Room
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = joinCode.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg('Please enter a room code.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const room = await fetchWatchRoom(cleanCode);
      if (!room) {
        setErrorMsg('Invalid or expired room code. Please check with your host.');
        setIsSubmitting(false);
        return;
      }

      const nickname = guestNickname.trim() || user?.displayName || 'GuestViewer';
      router.push(`/room/${cleanCode}?nickname=${encodeURIComponent(nickname)}`);
    } catch (err: any) {
      console.error('Error joining room:', err);
      setErrorMsg('Could not connect to room. Please check the code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter movies for browse and search
  const filteredMovies = CURATED_MOVIES.filter((m) => {
    const matchesSearch =
      !searchQuery.trim() ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.overview.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genres.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGenre = selectedGenre === 'All' || m.genres.includes(selectedGenre);
    const matchesMood =
      selectedMoodFilter === 'all' || (m.matchedMoods && m.matchedMoods.includes(selectedMoodFilter as any));

    return matchesSearch && matchesGenre && matchesMood;
  });

  const allGenres = ['All', 'Animation', 'Drama', 'Adventure', 'Sci-Fi', 'Romance', 'Comedy', 'Fantasy', 'Family'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.mkv,.mov"
        onChange={handleSelectLocalFile}
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

      {/* VIEW 1: IN-APP SOLO THEATER VIEW (Watch Now) */}
      {currentView === 'in_app_watch' && soloPlayerMedia && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-cinema-850 border border-cinema-750">
            <div>
              <span className="text-xs text-amber-cinema font-semibold uppercase tracking-wider block">
                In-App Viewing
              </span>
              <h2 className="text-xl font-bold text-white">{soloPlayerMedia.title}</h2>
              <p className="text-xs text-cinema-400">
                Playing inside Wavo without external redirects.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (selectedMovie) {
                    setCurrentView('room_setup');
                  } else {
                    setCurrentView('browse');
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-cinema hover:bg-amber-hover text-cinema-950 font-bold text-xs flex items-center gap-2 shadow-glow-amber"
              >
                <Users size={15} />
                <span>Invite Friends & Watch Together</span>
              </button>

              <button
                onClick={() => setCurrentView('browse')}
                className="px-4 py-2.5 rounded-xl bg-cinema-900 hover:bg-cinema-800 text-cinema-300 text-xs font-semibold border border-cinema-750"
              >
                Back to Browse
              </button>
            </div>
          </div>

          <div className="aspect-video w-full rounded-3xl overflow-hidden bg-black border border-cinema-750 shadow-2xl">
            {soloPlayerMedia.type === 'youtube' ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${soloPlayerMedia.idOrUrl}?autoplay=1&rel=0`}
                title={soloPlayerMedia.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <UniversalVideoPlayer
                src={soloPlayerMedia.idOrUrl}
                title={soloPlayerMedia.title}
                autoPlay={true}
              />
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: ROOM SETUP (After selecting content) */}
      {currentView === 'room_setup' && selectedMovie && (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          <div className="text-center space-y-2 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-cinema/15 text-amber-cinema text-xs font-semibold uppercase tracking-wider">
              <Users size={14} />
              <span>Step 2: Room Setup</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">Create Your Watch Room</h1>
            <p className="text-xs sm:text-sm text-cinema-400">
              Your movie and playback source are pre-loaded. Invite your people and start when ready.
            </p>
          </div>

          {/* Selected Media Confirmation Card */}
          <div className="p-6 rounded-3xl bg-cinema-850 border border-cinema-700/80 shadow-cinema-card">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <img
                src={selectedMovie.posterPath}
                alt={selectedMovie.title}
                className="w-24 sm:w-28 aspect-[2/3] object-cover rounded-2xl border border-cinema-700 shrink-0"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-cinema-900 text-cinema-300 font-mono text-[11px]">
                    {selectedMovie.releaseYear}
                  </span>
                  <span className="text-[11px] text-cinema-400">•</span>
                  <span className="text-[11px] text-cinema-400">{selectedMovie.runtime}m</span>
                  <span className="text-[11px] text-cinema-400">•</span>
                  <PlaybackAvailabilityBadge movie={selectedMovie} compact={true} />
                </div>

                <h3 className="text-xl font-bold text-white truncate mb-1">
                  {selectedMovie.title}
                </h3>
                <p className="text-xs text-cinema-300 line-clamp-2 leading-relaxed mb-4">
                  {selectedMovie.overview}
                </p>

                {/* Selected Source Status */}
                <div className="p-3 rounded-xl bg-cinema-900 border border-cinema-750 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-semibold text-cinema-200">
                      Source: {selectedSource?.name || 'Official In-App Stream'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSourceModalMovie(selectedMovie)}
                    className="text-amber-cinema hover:underline font-medium text-[11px]"
                  >
                    Change Source
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Room Configuration Form */}
          <form
            onSubmit={handleCreateRoom}
            className="p-6 sm:p-8 rounded-3xl bg-cinema-850 border border-cinema-700/80 space-y-6 shadow-cinema-card"
          >
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-cinema-300 uppercase tracking-wider mb-2">
                Your Host Nickname
              </label>
              <input
                type="text"
                value={hostNickname}
                onChange={(e) => setHostNickname(e.target.value)}
                placeholder="e.g. CinemaLover, Jordan"
                maxLength={30}
                required
                className="w-full px-4 py-3 rounded-xl bg-cinema-900 border border-cinema-750 text-cinema-100 text-sm focus:outline-none focus:border-amber-cinema"
              />
            </div>

            {/* Privacy toggle */}
            <div>
              <label className="block text-xs font-semibold text-cinema-300 uppercase tracking-wider mb-2">
                Room Privacy
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsPublicRoom(true)}
                  className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-colors ${
                    isPublicRoom
                      ? 'bg-amber-cinema/15 border-amber-cinema text-white'
                      : 'bg-cinema-900 border-cinema-800 text-cinema-400 hover:text-white'
                  }`}
                >
                  <Globe size={18} className={isPublicRoom ? 'text-amber-cinema' : ''} />
                  <div>
                    <span className="text-xs font-bold block">Public Room</span>
                    <span className="text-[11px] text-cinema-400">Anyone with code can join</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPublicRoom(false)}
                  className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-colors ${
                    !isPublicRoom
                      ? 'bg-amber-cinema/15 border-amber-cinema text-white'
                      : 'bg-cinema-900 border-cinema-800 text-cinema-400 hover:text-white'
                  }`}
                >
                  <Lock size={18} className={!isPublicRoom ? 'text-amber-cinema' : ''} />
                  <div>
                    <span className="text-xs font-bold block">Private Room</span>
                    <span className="text-[11px] text-cinema-400">Strict invite link only</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-cinema-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setCurrentView('browse')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cinema-900 hover:bg-cinema-800 text-cinema-300 text-xs font-semibold transition-colors"
              >
                ← Change Movie Selection
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-cinema hover:bg-amber-hover text-cinema-950 font-bold text-sm flex items-center justify-center gap-2 shadow-glow-amber transition-all"
              >
                {isSubmitting ? (
                  <span>Generating Room...</span>
                ) : (
                  <>
                    <Users size={16} />
                    <span>Create Room & Start Watching</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW 3: JOIN EXISTING ROOM */}
      {currentView === 'join_room' && (
        <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
          <div className="text-center space-y-2 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-cinema/15 text-amber-cinema text-xs font-semibold uppercase tracking-wider">
              <KeyRound size={14} />
              <span>Join a Watch Party</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">Enter Your Room Code</h1>
            <p className="text-xs sm:text-sm text-cinema-400">
              Have a code like <span className="font-mono text-amber-cinema">MOON-582</span> or <span className="font-mono text-amber-cinema">NOVA-482</span>? Enter it below.
            </p>
          </div>

          <form
            onSubmit={handleJoinRoom}
            className="p-6 sm:p-8 rounded-3xl bg-cinema-850 border border-cinema-700/80 space-y-6 shadow-cinema-card"
          >
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-cinema-300 uppercase tracking-wider mb-2">
                Room Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. NOVA-482"
                  maxLength={12}
                  required
                  className="w-full pl-4 pr-24 py-3.5 rounded-xl bg-cinema-900 border border-cinema-750 text-white font-mono text-lg tracking-wider focus:outline-none focus:border-amber-cinema uppercase"
                />
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      if (text) {
                        const codeMatch = text.match(/[A-Z0-9]+-[A-Z0-9]+/i) || [text.trim()];
                        setJoinCode(codeMatch[0].toUpperCase());
                      }
                    } catch (e) {
                      // ignore
                    }
                  }}
                  className="absolute right-2 top-2 px-3 py-1.5 rounded-lg bg-cinema-800 hover:bg-cinema-750 text-cinema-300 text-xs font-semibold transition-colors"
                >
                  Paste
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-cinema-300 uppercase tracking-wider mb-2">
                Your Nickname
              </label>
              <input
                type="text"
                value={guestNickname}
                onChange={(e) => setGuestNickname(e.target.value)}
                placeholder="e.g. Alex"
                maxLength={30}
                required
                className="w-full px-4 py-3 rounded-xl bg-cinema-900 border border-cinema-750 text-cinema-100 text-sm focus:outline-none focus:border-amber-cinema"
              />
            </div>

            <div className="pt-4 border-t border-cinema-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setCurrentView('browse')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cinema-900 hover:bg-cinema-800 text-cinema-300 text-xs font-semibold transition-colors"
              >
                ← Back to Movie Discovery
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-cinema hover:bg-amber-hover text-cinema-950 font-bold text-sm flex items-center justify-center gap-2 shadow-glow-amber transition-all"
              >
                <ArrowRight size={16} />
                <span>Join Room</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW 4: MAIN IN-APP MEDIA DISCOVERY FLOW ("What do you want to watch?") */}
      {currentView === 'browse' && (
        <div className="space-y-8 animate-fade-in">
          {/* Main Title & Supporting Text (Exact User Requirements) */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-cinema/15 text-amber-cinema text-xs font-semibold uppercase tracking-wider mb-2">
                <Compass size={14} />
                <span>In-App Discovery & Social Watch Platform</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                What do you want to watch?
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-cinema-400 mt-1 max-w-2xl">
                Find your movie, choose where to watch, and invite your friends when you're ready.
              </p>
            </div>

            {/* Quick Action: Join Room Shortcut */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView('join_room')}
                className="px-4 py-2.5 rounded-xl bg-cinema-900 hover:bg-cinema-850 text-cinema-200 border border-cinema-750 text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <KeyRound size={15} className="text-amber-cinema" />
                <span>Have a code? Join a Room</span>
              </button>
            </div>
          </div>

          {/* Search bar inside pre-watch flow */}
          <div className="relative w-full max-w-2xl">
            <Search size={18} className="absolute left-4 top-3.5 text-cinema-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim() && activeSection !== 'search') {
                  setActiveSection('search');
                }
              }}
              placeholder="Search movies, trailers, genres, or actors across all sources..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-cinema-900 border border-cinema-750 text-cinema-100 text-sm placeholder-cinema-500 focus:outline-none focus:border-amber-cinema shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-3.5 text-cinema-500 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Section Navigation Tabs (All 9 Requested Sections) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-cinema-850 scrollbar-none">
            <button
              onClick={() => setActiveSection('recommended')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeSection === 'recommended'
                  ? 'bg-amber-cinema text-cinema-950 shadow-glow-amber'
                  : 'bg-cinema-900 border border-cinema-800 text-cinema-300 hover:text-white'
              }`}
            >
              <Sparkles size={14} />
              <span>Recommended for You</span>
            </button>

            <button
              onClick={() => setActiveSection('browse')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeSection === 'browse'
                  ? 'bg-amber-cinema text-cinema-950 shadow-glow-amber'
                  : 'bg-cinema-900 border border-cinema-800 text-cinema-300 hover:text-white'
              }`}
            >
              <Film size={14} />
              <span>Browse Movies</span>
            </button>

            <button
              onClick={() => setActiveSection('search')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeSection === 'search'
                  ? 'bg-amber-cinema text-cinema-950 shadow-glow-amber'
                  : 'bg-cinema-900 border border-cinema-800 text-cinema-300 hover:text-white'
              }`}
            >
              <Search size={14} />
              <span>Search Movies & Shows</span>
            </button>

            <button
              onClick={() => setActiveSection('youtube')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeSection === 'youtube'
                  ? 'bg-amber-cinema text-cinema-950 shadow-glow-amber'
                  : 'bg-cinema-900 border border-cinema-800 text-cinema-300 hover:text-white'
              }`}
            >
              <Radio size={14} />
              <span>YouTube Videos & Trailers</span>
            </button>

            <button
              onClick={() => setActiveSection('streaming')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeSection === 'streaming'
                  ? 'bg-amber-cinema text-cinema-950 shadow-glow-amber'
                  : 'bg-cinema-900 border border-cinema-800 text-cinema-300 hover:text-white'
              }`}
            >
              <Tv size={14} />
              <span>Streaming Services</span>
            </button>

            <button
              onClick={() => setActiveSection('local')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeSection === 'local'
                  ? 'bg-amber-cinema text-cinema-950 shadow-glow-amber'
                  : 'bg-cinema-900 border border-cinema-800 text-cinema-300 hover:text-white'
              }`}
            >
              <FolderOpen size={14} />
              <span>Your Local Movies</span>
              {currentLocalVideo && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
            </button>

            <button
              onClick={() => setActiveSection('recent')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeSection === 'recent'
                  ? 'bg-amber-cinema text-cinema-950 shadow-glow-amber'
                  : 'bg-cinema-900 border border-cinema-800 text-cinema-300 hover:text-white'
              }`}
            >
              <History size={14} />
              <span>Recently Played ({recentMediaList.length})</span>
            </button>

            <button
              onClick={() => setActiveSection('watchlist')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeSection === 'watchlist'
                  ? 'bg-amber-cinema text-cinema-950 shadow-glow-amber'
                  : 'bg-cinema-900 border border-cinema-800 text-cinema-300 hover:text-white'
              }`}
            >
              <Bookmark size={14} />
              <span>Your Watchlist ({watchlist.length})</span>
            </button>

            <button
              onClick={() => setActiveSection('continue_watching')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeSection === 'continue_watching'
                  ? 'bg-amber-cinema text-cinema-950 shadow-glow-amber'
                  : 'bg-cinema-900 border border-cinema-800 text-cinema-300 hover:text-white'
              }`}
            >
              <Clock size={14} />
              <span>Continue Watching</span>
            </button>
          </div>

          {/* SECTION 1: RECOMMENDED FOR YOU */}
          {activeSection === 'recommended' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Recommended for Your Group</h2>
                  <p className="text-xs text-cinema-400">
                    Curated films verified for in-app synchronized playback.
                  </p>
                </div>
              </div>

              {/* Grid of Recommended Movies */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {CURATED_MOVIES.slice(0, 10).map((movie) => (
                  <div
                    key={movie.id}
                    onClick={() => setSourceModalMovie(movie)}
                    className="group relative rounded-2xl bg-cinema-850 border border-cinema-750/70 overflow-hidden hover:border-amber-cinema/60 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-cinema-900">
                      <img
                        src={movie.posterPath}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-cinema-950/90 via-transparent to-transparent opacity-80" />

                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-cinema-950/80 backdrop-blur-md text-amber-cinema text-[11px] font-semibold">
                        ★ {movie.rating}
                      </div>

                      <div className="absolute bottom-2 left-2 right-2">
                        <PlaybackAvailabilityBadge movie={movie} compact={true} />
                      </div>
                    </div>

                    <div className="p-3">
                      <h3 className="font-semibold text-xs sm:text-sm text-white truncate group-hover:text-amber-cinema transition-colors mb-1">
                        {movie.title}
                      </h3>
                      <div className="flex items-center justify-between text-[11px] text-cinema-400 mb-2">
                        <span>{movie.releaseYear}</span>
                        <span>{movie.runtime}m</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSourceModalMovie(movie);
                        }}
                        className="w-full py-1.5 rounded-xl bg-cinema-800 hover:bg-amber-cinema hover:text-cinema-950 text-cinema-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Play size={12} className="fill-current" />
                        <span>Watch Now</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: BROWSE MOVIES */}
          {activeSection === 'browse' && (
            <div className="space-y-6">
              {/* Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <span className="text-xs text-cinema-500 font-semibold uppercase tracking-wider shrink-0 mr-2">
                  Genre:
                </span>
                {allGenres.map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGenre(g)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      selectedGenre === g
                        ? 'bg-amber-cinema text-cinema-950 font-bold'
                        : 'bg-cinema-900 border border-cinema-800 text-cinema-300 hover:text-white'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {filteredMovies.map((movie) => (
                  <div
                    key={movie.id}
                    onClick={() => setSourceModalMovie(movie)}
                    className="group relative rounded-2xl bg-cinema-850 border border-cinema-750/70 overflow-hidden hover:border-amber-cinema/60 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-cinema-900">
                      <img
                        src={movie.posterPath}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-cinema-950/90 via-transparent to-transparent opacity-80" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <PlaybackAvailabilityBadge movie={movie} compact={true} />
                      </div>
                    </div>

                    <div className="p-3">
                      <h3 className="font-semibold text-xs sm:text-sm text-white truncate group-hover:text-amber-cinema transition-colors mb-1">
                        {movie.title}
                      </h3>
                      <div className="flex items-center justify-between text-[11px] text-cinema-400 mb-2">
                        <span>{movie.releaseYear}</span>
                        <span>★ {movie.rating}</span>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSourceModalMovie(movie);
                          }}
                          className="flex-1 py-1.5 rounded-xl bg-cinema-800 hover:bg-cinema-750 text-cinema-200 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                        >
                          <Play size={11} />
                          <span>Watch</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectForWatchTogether(movie, {
                              id: `yt-${movie.trailerYoutubeId}`,
                              name: 'Official In-App Stream',
                              type: 'youtube',
                              availability: 'youtube_player',
                              isPlayableInApp: true,
                              mediaId: movie.trailerYoutubeId,
                            });
                          }}
                          className="flex-1 py-1.5 rounded-xl bg-amber-cinema hover:bg-amber-hover text-cinema-950 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                        >
                          <Users size={11} />
                          <span>Together</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: SEARCH MOVIES AND SHOWS */}
          {activeSection === 'search' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">
                  Search Results {searchQuery && `for "${searchQuery}"`} ({filteredMovies.length})
                </h2>
              </div>

              {filteredMovies.length === 0 ? (
                <div className="p-12 rounded-3xl bg-cinema-900 border border-cinema-800 text-center">
                  <Film size={36} className="text-cinema-500 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-white mb-1">No movies matched your search</h3>
                  <p className="text-xs text-cinema-400">
                    Try searching for another title, director, or explore our curated collections.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                  {filteredMovies.map((movie) => (
                    <div
                      key={movie.id}
                      onClick={() => setSourceModalMovie(movie)}
                      className="group relative rounded-2xl bg-cinema-850 border border-cinema-750/70 overflow-hidden hover:border-amber-cinema/60 transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div className="relative aspect-[2/3] w-full overflow-hidden bg-cinema-900">
                        <img
                          src={movie.posterPath}
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-cinema-950/90 via-transparent to-transparent opacity-80" />
                        <div className="absolute bottom-2 left-2 right-2">
                          <PlaybackAvailabilityBadge movie={movie} compact={true} />
                        </div>
                      </div>

                      <div className="p-3">
                        <h3 className="font-semibold text-xs sm:text-sm text-white truncate group-hover:text-amber-cinema transition-colors mb-1">
                          {movie.title}
                        </h3>
                        <p className="text-[11px] text-cinema-400 line-clamp-1 mb-2">
                          {movie.genres.join(', ')}
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSourceModalMovie(movie);
                          }}
                          className="w-full py-1.5 rounded-xl bg-amber-cinema hover:bg-amber-hover text-cinema-950 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                        >
                          <Play size={12} className="fill-cinema-950" />
                          <span>Watch Now</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 4: YOUTUBE VIDEOS AND TRAILERS */}
          {activeSection === 'youtube' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-cinema-850 border border-cinema-750/80">
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <Film size={18} className="text-red-500" />
                  <span>Official YouTube In-App Player</span>
                </h3>
                <p className="text-xs text-cinema-400 mb-4">
                  Stream any public YouTube video or movie trailer. Test playback in-app before creating a room.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!youtubeInput.trim()) return;
                    const extracted = extractYouTubeVideoId(youtubeInput);
                    if (extracted) {
                      setYoutubeExplorerId(extracted);
                      setYoutubePreviewActive(true);
                    }
                  }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <input
                    type="text"
                    value={youtubeInput}
                    onChange={(e) => setYoutubeInput(e.target.value)}
                    placeholder="Paste YouTube video link or 11-char ID..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-cinema-900 border border-cinema-750 text-cinema-100 text-xs focus:outline-none focus:border-amber-cinema"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <Play size={14} className="fill-current" />
                    <span>Test In-App Video</span>
                  </button>
                </form>
              </div>

              {/* YouTube In-App Test Player */}
              {youtubePreviewActive && (
                <div className="p-6 rounded-3xl bg-cinema-900 border border-cinema-750 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Testing YouTube Playback (ID: {youtubeExplorerId})
                    </span>
                    <button
                      onClick={() => setYoutubePreviewActive(false)}
                      className="text-xs text-cinema-400 hover:text-white"
                    >
                      Hide Preview ✕
                    </button>
                  </div>

                  <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-cinema-800">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${youtubeExplorerId}?autoplay=1&rel=0`}
                      title="YouTube Preview"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => {
                        const ytMovie: Movie = {
                          id: `yt-${youtubeExplorerId}`,
                          title: 'Custom YouTube Stream',
                          overview: 'YouTube synchronized session.',
                          posterPath: `https://img.youtube.com/vi/${youtubeExplorerId}/hqdefault.jpg`,
                          backdropPath: `https://img.youtube.com/vi/${youtubeExplorerId}/maxresdefault.jpg`,
                          releaseYear: 'Online',
                          runtime: 15,
                          rating: 8.0,
                          voteCount: 1,
                          genres: ['YouTube', 'Video'],
                          language: 'EN',
                          trailerYoutubeId: youtubeExplorerId,
                        };
                        handleSelectForWatchTogether(ytMovie, {
                          id: `yt-${youtubeExplorerId}`,
                          name: 'YouTube Stream',
                          type: 'youtube',
                          availability: 'youtube_player',
                          isPlayableInApp: true,
                          mediaId: youtubeExplorerId,
                        });
                      }}
                      className="px-5 py-2.5 rounded-xl bg-amber-cinema hover:bg-amber-hover text-cinema-950 font-bold text-xs flex items-center gap-1.5 shadow-glow-amber"
                    >
                      <Users size={14} />
                      <span>Watch Together with Friends</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Curated YouTube Trailers */}
              <div>
                <h4 className="text-sm font-bold text-white mb-3">Popular Movie Trailers Ready to Stream</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {CURATED_MOVIES.slice(0, 6).map((movie) => (
                    <div
                      key={movie.id}
                      className="p-4 rounded-2xl bg-cinema-850 border border-cinema-750 flex items-center justify-between gap-3 hover:border-cinema-600 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={movie.posterPath}
                          alt={movie.title}
                          className="w-12 h-16 object-cover rounded-xl border border-cinema-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <h5 className="font-semibold text-xs text-white truncate">{movie.title}</h5>
                          <span className="text-[11px] text-cinema-400 block">{movie.releaseYear} • {movie.runtime}m</span>
                          <PlaybackAvailabilityBadge movie={movie} compact={true} />
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setYoutubeExplorerId(movie.trailerYoutubeId || 'ByXuk9QqQkk');
                          setYoutubePreviewActive(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-cinema-800 hover:bg-amber-cinema hover:text-cinema-950 text-cinema-200 text-xs font-semibold shrink-0 transition-colors flex items-center gap-1"
                      >
                        <Play size={12} className="fill-current" />
                        <span>Test</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: STREAMING SERVICES (Honest In-App Status & Requirements) */}
          {activeSection === 'streaming' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-cinema-850 border border-cinema-750/80">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
                    <ShieldAlert size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white mb-1">
                      Streaming Services & In-App Playback Standards
                    </h3>
                    <p className="text-xs text-cinema-300 leading-relaxed mb-3">
                      Commercial platforms enforce strict hardware DRM (Widevine L1 / PlayReady) and frame security (X-Frame-Options: DENY). We never proxy passwords or embed broken iframes.
                    </p>
                    <span className="text-[11px] text-amber-cinema font-medium">
                      ✓ Notice: Selecting a commercial provider will clearly identify in-app restrictions and offer playable alternatives without redirecting you away.
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {STREAMING_PROVIDERS.map((provider) => (
                  <div
                    key={provider.id}
                    className="p-5 rounded-3xl bg-cinema-850 border border-cinema-750 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                          style={{
                            backgroundColor: `${provider.accentColor}25`,
                            color: provider.accentColor,
                          }}
                        >
                          {provider.badge}
                        </span>
                        <PlaybackAvailabilityBadge
                          status={
                            provider.id === 'youtube'
                              ? 'youtube_player'
                              : 'provider_integration_required'
                          }
                          compact={true}
                        />
                      </div>

                      <h4 className="text-lg font-bold text-white mb-1">{provider.name}</h4>
                      <p className="text-xs text-cinema-300 mb-3 leading-relaxed">
                        {provider.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-cinema-800 text-[11px] text-cinema-400">
                      {provider.id === 'youtube' ? (
                        <span className="text-emerald-400 font-medium">
                          ✓ 100% In-App Playback & Synchronized Party Ready
                        </span>
                      ) : (
                        <span className="text-purple-400 font-medium">
                          • Requires Official Partner SDK for In-App Video
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 6: YOUR LOCAL MOVIES */}
          {activeSection === 'local' && (
            <div className="space-y-6">
              <div className="p-6 sm:p-8 rounded-3xl bg-cinema-850 border border-cinema-750/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                      <FolderOpen size={18} className="text-amber-cinema" />
                      <span>Personal Local Movie Library</span>
                    </h3>
                    <p className="text-xs text-cinema-400 max-w-xl">
                      Select video files from your computer or phone (.mp4, .webm, .mkv). Videos play 100% client-side without uploading to any server.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2.5 rounded-xl bg-amber-cinema hover:bg-amber-hover text-cinema-950 font-bold text-xs flex items-center gap-1.5 shadow-glow-amber"
                    >
                      <Plus size={14} />
                      <span>Browse Video File</span>
                    </button>

                    <button
                      onClick={handleBrowseFolder}
                      className="px-3.5 py-2.5 rounded-xl bg-cinema-800 hover:bg-cinema-750 text-cinema-200 text-xs font-semibold flex items-center gap-1.5 border border-cinema-700"
                    >
                      <FolderOpen size={14} />
                      <span>Browse Folder</span>
                    </button>
                  </div>
                </div>

                {/* Active Local Video Banner if selected */}
                {currentLocalVideo && (
                  <div className="p-4 rounded-2xl bg-cinema-900 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                        <Check size={20} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">
                          Loaded: {currentLocalVideo.name}
                        </span>
                        <span className="text-[11px] text-cinema-400">
                          {((currentLocalVideo.size || 0) / (1024 * 1024)).toFixed(1)} MB • Ready for in-app viewing
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSoloPlayerMedia({
                            type: 'local',
                            idOrUrl: currentLocalVideo.blobUrl!,
                            title: currentLocalVideo.name,
                          });
                          setCurrentView('in_app_watch');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-cinema-800 hover:bg-cinema-750 text-cinema-100 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Play size={13} className="fill-current" />
                        <span>Watch Now</span>
                      </button>

                      <button
                        onClick={() => {
                          if (selectedMovie) {
                            handleSelectForWatchTogether(selectedMovie, {
                              id: 'local-active',
                              name: currentLocalVideo.name,
                              type: 'local',
                              availability: 'playable_in_app',
                              isPlayableInApp: true,
                              streamUrl: currentLocalVideo.blobUrl,
                            });
                          }
                        }}
                        className="px-3.5 py-2 rounded-xl bg-amber-cinema text-cinema-950 font-bold text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        <Users size={13} />
                        <span>Watch Together</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Folder scanned video files */}
              {folderFiles.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-cinema-300 uppercase tracking-wider">
                    Files from Selected Folder ({folderFiles.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {folderFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-cinema-850 border border-cinema-750 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-white truncate block">
                            {file.name}
                          </span>
                          <span className="text-[11px] text-cinema-400">
                            {(file.size / (1024 * 1024)).toFixed(1)} MB
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            if (currentLocalVideo?.blobUrl) URL.revokeObjectURL(currentLocalVideo.blobUrl);
                            const blobUrl = URL.createObjectURL(file);
                            setCurrentLocalVideo({ file, blobUrl, name: file.name, size: file.size });
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-cinema-800 hover:bg-amber-cinema hover:text-cinema-950 text-cinema-200 text-xs font-medium transition-colors"
                        >
                          Select
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION 7: RECENTLY PLAYED */}
          {activeSection === 'recent' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Recently Played Media</h2>
                  <p className="text-xs text-cinema-400">
                    Locally stored playback history from your previous sessions.
                  </p>
                </div>
              </div>

              {recentMediaList.length === 0 ? (
                <div className="p-12 rounded-3xl bg-cinema-900 border border-cinema-800 text-center">
                  <Clock size={32} className="text-cinema-500 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-white mb-1">No recent media recorded</h3>
                  <p className="text-xs text-cinema-400">
                    Videos you open in the Media Browser or Watch Together will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentMediaList.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-cinema-850 border border-cinema-750 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                        <span className="text-[11px] text-cinema-400 block">
                          {(item.size / (1024 * 1024)).toFixed(1)} MB • {new Date(item.addedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-cinema-800 hover:bg-amber-cinema hover:text-cinema-950 text-cinema-200 text-xs font-semibold transition-colors"
                      >
                        Re-open
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 8: YOUR WATCHLIST */}
          {activeSection === 'watchlist' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Your Saved Watchlist</h2>
                  <p className="text-xs text-cinema-400">
                    Movies you've earmarked for your next movie night.
                  </p>
                </div>
              </div>

              {watchlist.length === 0 ? (
                <div className="p-12 rounded-3xl bg-cinema-900 border border-cinema-800 text-center">
                  <Bookmark size={32} className="text-cinema-500 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-white mb-1">Your watchlist is empty</h3>
                  <p className="text-xs text-cinema-400">
                    Browse movies or use Discover to add films to your watchlist.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {watchlist.map((item) => {
                    const movie = item.movie;
                    return (
                      <div
                        key={movie.id}
                        onClick={() => setSourceModalMovie(movie)}
                        className="group relative rounded-2xl bg-cinema-850 border border-cinema-750 overflow-hidden hover:border-amber-cinema/60 transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div className="relative aspect-[2/3] w-full overflow-hidden bg-cinema-900">
                          <img
                            src={movie.posterPath}
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-cinema-950/90 via-transparent to-transparent opacity-80" />
                          <div className="absolute bottom-2 left-2 right-2">
                            <PlaybackAvailabilityBadge movie={movie} compact={true} />
                          </div>
                        </div>

                        <div className="p-3">
                          <h4 className="font-semibold text-xs text-white truncate mb-1">
                            {movie.title}
                          </h4>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSourceModalMovie(movie);
                            }}
                            className="w-full py-1.5 rounded-xl bg-amber-cinema hover:bg-amber-hover text-cinema-950 text-xs font-bold transition-colors"
                          >
                            Select Movie
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SECTION 9: CONTINUE WATCHING */}
          {activeSection === 'continue_watching' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Continue Watching</h2>
                  <p className="text-xs text-cinema-400">
                    Pick up right where you left off in your recent sessions.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {CURATED_MOVIES.slice(0, 3).map((movie) => (
                  <div
                    key={movie.id}
                    onClick={() => setSourceModalMovie(movie)}
                    className="p-4 rounded-2xl bg-cinema-850 border border-cinema-750 flex items-center justify-between gap-3 hover:border-amber-cinema/50 transition-colors cursor-pointer"
                  >
                    <img
                      src={movie.posterPath}
                      alt={movie.title}
                      className="w-14 h-20 object-cover rounded-xl border border-cinema-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{movie.title}</h4>
                      <span className="text-[11px] text-cinema-400 block mb-1">
                        Last seen at 42:15 • {movie.runtime}m total
                      </span>
                      <PlaybackAvailabilityBadge movie={movie} compact={true} />
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSourceModalMovie(movie);
                      }}
                      className="p-2.5 rounded-xl bg-amber-cinema text-cinema-950 hover:bg-amber-hover transition-colors"
                    >
                      <Play size={14} className="fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* In-App Media Source Selector Modal (100% On-Domain) */}
      {sourceModalMovie && (
        <MediaSourceSelectorModal
          isOpen={Boolean(sourceModalMovie)}
          onClose={() => setSourceModalMovie(null)}
          movie={sourceModalMovie}
          initialLocalVideo={currentLocalVideo}
          onWatchNow={(source, localFile) => {
            setSourceModalMovie(null);
            handleWatchNow(sourceModalMovie, source, localFile);
          }}
          onWatchTogether={(movie, source, localFile) => {
            setSourceModalMovie(null);
            handleSelectForWatchTogether(movie, source, localFile);
          }}
        />
      )}
    </div>
  );
}

export default function WatchTogetherPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-amber-cinema border-t-transparent animate-spin" />
        </div>
      }
    >
      <WatchTogetherContent />
    </Suspense>
  );
}
