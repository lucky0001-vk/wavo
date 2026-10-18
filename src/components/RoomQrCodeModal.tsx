'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Share2, QrCode, Smartphone, Sparkles } from 'lucide-react';

interface RoomQrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
  movieTitle: string;
}

export const RoomQrCodeModal: React.FC<RoomQrCodeModalProps> = ({
  isOpen,
  onClose,
  roomCode,
  movieTitle,
}) => {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const inviteUrl = `${origin}/room/${roomCode}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&bgcolor=14-16-1b&color=d6-a8-5f&margin=2&data=${encodeURIComponent(
    inviteUrl
  )}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Copy error:', e);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Watch ${movieTitle} on Wavo`,
          text: `Join my watch party on Wavo with room code ${roomCode}!`,
          url: inviteUrl,
        });
      } catch (e) {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cinema-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm bg-cinema-850 border border-cinema-700/80 rounded-3xl p-6 shadow-cinema-card text-center text-cinema-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-cinema-400 hover:text-white hover:bg-cinema-800 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-amber-cinema/15 text-amber-cinema flex items-center justify-center mx-auto mb-3">
          <Smartphone size={24} />
        </div>

        <h3 className="text-lg font-bold text-white mb-1">Scan to Join on Phone</h3>
        <p className="text-xs text-cinema-400 mb-4">
          Point your phone's camera at the code below to open in Google Chrome.
        </p>

        {/* QR Code Container */}
        <div className="p-4 bg-cinema-900 rounded-2xl border border-cinema-750 inline-block mb-4 shadow-inner">
          <img
            src={qrImageUrl}
            alt={`QR Code for room ${roomCode}`}
            className="w-52 h-52 mx-auto rounded-xl"
            loading="lazy"
          />
        </div>

        {/* Room Code Badge */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <span className="text-xs text-cinema-400">ROOM CODE:</span>
          <span className="font-mono font-extrabold text-amber-cinema text-base tracking-wider bg-cinema-950 px-2.5 py-1 rounded-lg border border-cinema-800">
            {roomCode}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleCopy}
            className="py-2.5 px-3 rounded-xl bg-cinema-800 hover:bg-cinema-750 text-cinema-100 border border-cinema-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>

          <button
            onClick={handleShare}
            className="py-2.5 px-3 rounded-xl bg-amber-cinema hover:bg-amber-hover text-cinema-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <Share2 size={14} />
            <span>Share Link</span>
          </button>
        </div>
      </div>
    </div>
  );
};
