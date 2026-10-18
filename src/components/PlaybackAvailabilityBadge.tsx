'use client';

import React from 'react';
import { PlaybackAvailabilityStatus } from '@/types/media-browser';
import { AVAILABILITY_CONFIGS, getPrimaryAvailability } from '@/lib/playback-source';
import { Movie } from '@/types';
import { Play, FolderOpen, ShieldAlert, AlertCircle, Sparkles } from 'lucide-react';

interface PlaybackAvailabilityBadgeProps {
  status?: PlaybackAvailabilityStatus;
  movie?: Movie;
  compact?: boolean;
  className?: string;
}

export const PlaybackAvailabilityBadge: React.FC<PlaybackAvailabilityBadgeProps> = ({
  status,
  movie,
  compact = false,
  className = '',
}) => {
  const config = status
    ? AVAILABILITY_CONFIGS[status]
    : movie
    ? getPrimaryAvailability(movie)
    : AVAILABILITY_CONFIGS.playable_in_app;

  const renderIcon = () => {
    switch (config.status) {
      case 'playable_in_app':
        return <Play size={compact ? 10 : 12} className="fill-current shrink-0" />;
      case 'youtube_player':
        return <Play size={compact ? 10 : 12} className="fill-current shrink-0" />;
      case 'local_file_required':
        return <FolderOpen size={compact ? 10 : 12} className="shrink-0" />;
      case 'provider_integration_required':
        return <ShieldAlert size={compact ? 10 : 12} className="shrink-0" />;
      case 'unavailable':
      default:
        return <AlertCircle size={compact ? 10 : 12} className="shrink-0" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border transition-colors ${
        config.badgeBg
      } ${config.badgeBorder} ${config.textColor} ${
        compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } ${className}`}
      title={config.description}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor} shrink-0`} />
      {renderIcon()}
      <span className="whitespace-nowrap font-medium tracking-tight">{config.label}</span>
    </span>
  );
};
