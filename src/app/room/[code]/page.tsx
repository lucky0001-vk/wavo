'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { WatchRoom, PlaybackState, RoomParticipant, ChatMessage } from '@/types';
import { fetchWatchRoom, RealtimeRoomSession } from '@/lib/room-manager';
import { useAuth } from '@/lib/auth-context';
import { VideoPlayer } from '@/components/VideoPlayer';
import { UniversalVideoPlayer } from '@/components/UniversalVideoPlayer';
import { RoomChat } from '@/components/RoomChat';
import { RoomQrCodeModal } from '@/components/RoomQrCodeModal';
import { FloatingReaction } from '@/components/EmojiReactionOverlay';
import { Copy, Share2, Users, MessageSquare, LogOut, Crown, Check, AlertCircle, Sparkles, RefreshCw, FolderOpen, ShieldCheck, QrCode } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const roomCode = (params?.code as string)?.toUpperCase();
  const nicknameParam = searchParams.get('nickname');

  const [room, setRoom] = useState<WatchRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [playbackState, setPlaybackState] = useState<PlaybackState | null>(null);
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [mobileTab, setMobileTab] = useState<'chat' | 'details'>('chat');
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [localVideoFile, setLocalVideoFile] = useState<{ file: File; blobUrl: string } | null>(null);
  const localFileInputRef = useRef<HTMLInputElement>(null);

  const sessionRef = useRef<RealtimeRoomSession | null>(null);

  const currentNickname =
    nicknameParam || user?.displayName || `Viewer_${Math.floor(100 + Math.random() * 900)}`;
  const currentUserId = user?.id || `usr_${currentNickname}`;

  // 1. Fetch Room Details
  useEffect(() => {
    async function initRoom() {
      if (!roomCode) return;
      setLoading(true);
      setErrorMsg(null);

      try {
        const found = await fetchWatchRoom(roomCode);
        if (!found) {
          setErrorMsg('This room has ended or the invitation code is invalid.');
          setLoading(false);
          return;
        }

        setRoom(found);
        setPlaybackState(found.playback);

        const isHost = found.hostId === currentUserId;

        // Initialize Realtime session
        const session = new RealtimeRoomSession(roomCode, currentUserId, currentNickname, isHost, {
          onPlaybackChange: (newPlayback) => {
            setPlaybackState(newPlayback);
          },
          onParticipantChange: (newParticipants) => {
            setParticipants(newParticipants);
          },
          onChatMessage: (message) => {
            setMessages((prev) => [...prev, message]);
          },
          onReaction: (rx) => {
            // Trigger floating reaction animation
            const newFloating: FloatingReaction = {
              id: rx.id,
              emoji: rx.emoji,
              nickname: rx.nickname,
              leftPercent: Math.floor(15 + Math.random() * 70),
            };
            setFloatingReactions((prev) => [...prev, newFloating]);

            // Add reaction message to chat stream
            setMessages((prev) => [
              ...prev,
              {
                id: rx.id,
                userId: 'rx',
                nickname: rx.nickname,
                content: `reacted with ${rx.emoji}`,
                type: 'reaction',
                createdAt: Date.now(),
              },
            ]);

            // Clean up reaction after 2.5s
            setTimeout(() => {
              setFloatingReactions((prev) => prev.filter((item) => item.id !== rx.id));
            }, 2500);
          },
        });

        sessionRef.current = session;
      } catch (err: any) {
        console.error('Room init error:', err);
        setErrorMsg('Failed to connect to the watch room.');
      } finally {
        setLoading(false);
      }
    }

    initRoom();

    // Mobile backgrounding & reconnection listener
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && roomCode) {
        try {
          const fresh = await fetchWatchRoom(roomCode);
          if (fresh) {
            setPlaybackState(fresh.playback);
          }
        } catch (e) {
          // ignore
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (sessionRef.current) {
        sessionRef.current.leave();
      }
    };
  }, [roomCode]);

  // Host playback update action
  const handleHostUpdatePlayback = (action: 'play' | 'pause' | 'seek', position?: number) => {
    if (!room || !playbackState) return;

    const nextState: PlaybackState = {
      ...playbackState,
      status: action === 'play' ? 'playing' : 'paused',
      position: position !== undefined ? position : playbackState.position,
      updatedAt: Date.now(),
    };

    setPlaybackState(nextState);
    if (sessionRef.current) {
      sessionRef.current.broadcastPlayback(nextState);
    }
  };

  // Chat message send
  const handleSendMessage = (content: string, type: ChatMessage['type'] = 'text') => {
    if (!sessionRef.current) return;
    sessionRef.current.sendChat(content, type);
  };

  // Emoji Reaction
  const handleSendReaction = (emoji: string) => {
    if (!sessionRef.current) return;
    sessionRef.current.sendReaction(emoji);

    // If party emoji, trigger subtle confetti
    if (emoji === '🎉' || emoji === '✨') {
      try {
        confetti({
          particleCount: 25,
          spread: 50,
          origin: { y: 0.8 },
        });
      } catch (e) {
        // ignore
      }
    }
  };

  // Copy invitation link
  const handleCopyInvite = async () => {
    const inviteUrl = typeof window !== 'undefined' ? `${window.location.origin}/room/${roomCode}` : '';
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Copy invite error:', e);
    }
  };

  // Native share
  const handleShare = async () => {
    const inviteUrl = typeof window !== 'undefined' ? `${window.location.origin}/room/${roomCode}` : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join my watch party for ${room?.movie.title || 'Movie'}!`,
          text: `Join my watch party on Wavo with code ${roomCode}!`,
          url: inviteUrl,
        });
      } catch (e) {
        handleCopyInvite();
      }
    } else {
      handleCopyInvite();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cinema-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 rounded-full border-2 border-amber-cinema border-t-transparent animate-spin mb-4" />
        <h3 className="text-base font-semibold text-white">Connecting to Watch Room...</h3>
        <p className="text-xs text-cinema-400 mt-1">Establishing synchronized session</p>
      </div>
    );
  }

  if (errorMsg || !room || !playbackState) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6 bg-cinema-950">
        <div className="max-w-md w-full bg-cinema-850 border border-cinema-750 rounded-3xl p-8 text-center shadow-cinema-card">
          <div className="w-12 h-12 rounded-full bg-red-500/15 text-red-400 mx-auto flex items-center justify-center mb-4">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Room Unavailable</h2>
          <p className="text-xs text-cinema-400 leading-relaxed mb-6">
            {errorMsg || 'This room does not exist or has expired.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/watch-together')}
              className="px-5 py-2.5 rounded-xl bg-amber-cinema text-cinema-950 font-semibold text-xs"
            >
              Browse or Create Rooms
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2.5 rounded-xl bg-cinema-800 text-cinema-200 border border-cinema-700 text-xs font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isHost = room.hostId === currentUserId;

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Room Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-cinema-850 border border-cinema-750/80 mb-6 shadow-sm">
        {/* Left: Movie title & Host info */}
        <div className="flex items-center gap-3">
          <img
            src={room.movie.posterPath}
            alt={room.movie.title}
            className="w-10 h-14 object-cover rounded-lg border border-cinema-700 hidden sm:block"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white truncate max-w-[200px] sm:max-w-md">
                {room.movie.title}
              </h1>
              {isHost && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-cinema/15 text-amber-cinema border border-amber-cinema/30 text-[10px] font-semibold">
                  <Crown size={11} />
                  <span>Host</span>
                </span>
              )}
            </div>
            <p className="text-xs text-cinema-400">
              Session hosted by <span className="text-cinema-200 font-medium">{room.hostNickname}</span>
            </p>
          </div>
        </div>

        {/* Center: Unique Room Code with one-click copy */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cinema-900 border border-cinema-700 font-mono text-xs">
            <span className="text-cinema-400">CODE:</span>
            <span className="text-amber-cinema font-bold text-sm tracking-wider">{room.code}</span>
          </div>

          <button
            onClick={handleCopyInvite}
            className="p-2 rounded-xl bg-cinema-900 hover:bg-cinema-800 border border-cinema-700 text-cinema-300 hover:text-white transition-colors"
            title="Copy invitation link"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-cinema-900 hover:bg-cinema-800 border border-cinema-700 text-cinema-300 hover:text-white transition-colors"
            title="Share room invitation"
          >
            <Share2 size={16} />
          </button>

          <button
            onClick={() => setShowQrModal(true)}
            className="p-2 rounded-xl bg-cinema-900 hover:bg-cinema-800 border border-cinema-700 text-cinema-300 hover:text-white transition-colors"
            title="Show QR Code for phone camera"
          >
            <QrCode size={16} />
          </button>
        </div>

        {/* Right: Mobile toggle & Leave Room */}
        <div className="flex items-center gap-2">
          {/* Mobile Chat / Participants Drawer Button */}
          <button
            onClick={() => setMobilePanelOpen(!mobilePanelOpen)}
            className="lg:hidden p-2 rounded-xl bg-cinema-900 border border-cinema-700 text-cinema-300 hover:text-white flex items-center gap-1.5 text-xs"
          >
            <MessageSquare size={16} className="text-amber-cinema" />
            <span>Chat ({messages.length})</span>
          </button>

          <button
            onClick={() => router.push('/watch-together')}
            className="p-2 sm:px-3 py-2 rounded-xl bg-cinema-900 hover:bg-red-500/20 hover:text-red-400 border border-cinema-750 text-cinema-400 transition-colors flex items-center gap-1.5 text-xs"
            title="Leave watch party"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </div>

      {/* Main Social Cinema Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Video Viewing Area (8 cols on desktop) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <input
            ref={localFileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.mkv,.mov"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                if (localVideoFile?.blobUrl) URL.revokeObjectURL(localVideoFile.blobUrl);
                const blobUrl = URL.createObjectURL(file);
                setLocalVideoFile({ file, blobUrl });
              }
            }}
            className="hidden"
          />

          {room.movie.id.startsWith('local-') || room.playback.mediaType === 'mp4' ? (
            /* Mode A: Local Video Session */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-cinema/10 border border-amber-cinema/25 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={18} className="text-amber-cinema shrink-0" />
                  <div>
                    <span className="font-semibold text-white">Mode A: Shared Session (Local Copy)</span>
                    <p className="text-[11px] text-cinema-400">
                      Each participant selects their own local video file. Playback position remains synchronized!
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => localFileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-cinema hover:bg-amber-hover text-cinema-950 font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-sm"
                >
                  <FolderOpen size={13} />
                  <span>{localVideoFile ? 'Change Local Copy' : 'Choose Local File'}</span>
                </button>
              </div>

              {localVideoFile ? (
                <UniversalVideoPlayer
                  src={localVideoFile.blobUrl}
                  title={`${room.movie.title} (Local Sync)`}
                  autoPlay={playbackState.status === 'playing'}
                  onTimeUpdate={(curr) => {
                    if (isHost && Math.abs(curr - playbackState.position) > 3) {
                      handleHostUpdatePlayback('seek', curr);
                    }
                  }}
                />
              ) : (
                <div className="aspect-video w-full rounded-3xl bg-cinema-900 border border-cinema-750 flex flex-col items-center justify-center p-6 text-center">
                  <FolderOpen size={40} className="text-amber-cinema mb-3" />
                  <h3 className="text-base font-bold text-white mb-1">Select Your Local File to Sync</h3>
                  <p className="text-xs text-cinema-400 max-w-sm mb-4">
                    The host selected "{room.movie.title}". Choose your copy of this video to start watching in lockstep.
                  </p>
                  <button
                    onClick={() => localFileInputRef.current?.click()}
                    className="px-5 py-2.5 rounded-xl bg-amber-cinema text-cinema-950 font-bold text-xs shadow-glow-amber flex items-center gap-2"
                  >
                    <FolderOpen size={15} />
                    <span>Browse & Load Local Video</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Mode B: Supported Shared Online Video (YouTube) */
            <VideoPlayer
              mediaId={room.playback.mediaId}
              isHost={isHost}
              playbackState={playbackState}
              onHostUpdatePlayback={handleHostUpdatePlayback}
              reactions={floatingReactions}
            />
          )}

          {/* Film Details Banner Under Video */}
          <div className="p-5 rounded-2xl bg-cinema-850 border border-cinema-750/70 flex flex-col sm:flex-row items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-white mb-1">
                About {room.movie.title}
              </h2>
              <p className="text-xs text-cinema-300 leading-relaxed max-w-2xl line-clamp-2">
                {room.movie.overview}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 rounded-lg bg-cinema-900 border border-cinema-750 text-xs font-mono text-cinema-200">
                {room.movie.releaseYear}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-cinema-900 border border-cinema-750 text-xs text-amber-cinema font-medium">
                ★ {room.movie.rating}
              </span>
            </div>
          </div>

          {/* Mobile Inline Social Chat & Presence (Visible on phones below video) */}
          <div className="lg:hidden mt-2">
            <RoomChat
              participants={participants}
              messages={messages}
              onSendMessage={handleSendMessage}
              onSendReaction={handleSendReaction}
              currentUserId={currentUserId}
            />
          </div>
        </div>

        {/* Side Panel: Live Chat, Participants, Reactions (Desktop 4 cols / Mobile modal) */}
        <div
          className={`lg:col-span-4 ${
            mobilePanelOpen ? 'block fixed inset-x-4 bottom-4 top-20 z-50 lg:static lg:inset-auto' : 'hidden lg:block'
          }`}
        >
          {mobilePanelOpen && (
            <div className="lg:hidden flex justify-end mb-2">
              <button
                onClick={() => setMobilePanelOpen(false)}
                className="px-3 py-1 rounded-full bg-cinema-800 text-white text-xs"
              >
                Close Chat ✕
              </button>
            </div>
          )}

          <RoomChat
            participants={participants}
            messages={messages}
            onSendMessage={handleSendMessage}
            onSendReaction={handleSendReaction}
            currentUserId={currentUserId}
          />
        </div>
      </div>

      {/* Cross-Device Phone QR Pairing Modal */}
      <RoomQrCodeModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        roomCode={room.code}
        movieTitle={room.movie.title}
      />
    </div>
  );
}
