import React from 'react';
import Image from 'next/image';

interface WavoLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const WavoLogo: React.FC<WavoLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const height = size === 'sm' ? 28 : size === 'md' ? 36 : 48;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* High-res Wavo Logo */}
      <div className="relative flex items-center justify-center shrink-0">
        <img
          src="/wavo-logo.png"
          alt="Wavo Logo"
          className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105 duration-200"
        />
      </div>
    </div>
  );
};

export const WavoIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 28,
}) => {
  return (
    <img
      src="/wavo-icon.png"
      alt="Wavo Icon"
      style={{ height: size, width: 'auto' }}
      className={`object-contain ${className}`}
    />
  );
};
