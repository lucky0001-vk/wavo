'use client';

import React, { useEffect, useState } from 'react';

export interface FloatingReaction {
  id: string;
  emoji: string;
  nickname: string;
  leftPercent: number; // 10% to 90%
}

interface EmojiReactionOverlayProps {
  reactions: FloatingReaction[];
}

export const EmojiReactionOverlay: React.FC<EmojiReactionOverlayProps> = ({ reactions }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {reactions.map((r) => (
        <div
          key={r.id}
          className="absolute bottom-6 flex flex-col items-center animate-float-up"
          style={{ left: `${r.leftPercent}%` }}
        >
          <span className="text-4xl filter drop-shadow-lg select-none transform hover:scale-125 transition-transform">
            {r.emoji}
          </span>
          <span className="px-2 py-0.5 mt-1 rounded-full bg-cinema-950/70 border border-cinema-800 text-[10px] font-medium text-cinema-200 backdrop-blur-sm">
            {r.nickname}
          </span>
        </div>
      ))}
    </div>
  );
};
