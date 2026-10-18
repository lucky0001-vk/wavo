'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoodId, FilterPreferences } from '@/types';
import { GENRE_OPTIONS, TIME_OPTIONS, TASTE_OPTIONS } from '@/lib/constants';
import { SlidersHorizontal, ArrowRight, Check } from 'lucide-react';

interface MoodCardItem {
  id: MoodId;
  label: string;
  iconName: string;
  vibePercent: string;
  description: string;
  tags: string[];
  theme: 'cyan' | 'crimson' | 'amber' | 'purple' | 'pink' | 'emerald' | 'blue' | 'yellow';
}

const EXTENDED_MOOD_CARDS: MoodCardItem[] = [
  {
    id: 'happy',
    label: 'Cozy & Chill',
    iconName: 'water_drop',
    vibePercent: '24% Vibe',
    description: 'Low-pulse serenity, comforting banter, rain on nocturnal glass, and tranquil pacing.',
    tags: ['feel-good', 'warm', 'lighthearted'],
    theme: 'amber',
  },
  {
    id: 'adventurous',
    label: 'Adrenaline Rush',
    iconName: 'bolt',
    vibePercent: '18% Vibe',
    description: 'Kinetic camera work, 140 BPM soundscapes, heist escapes, and edge-of-seat momentum.',
    tags: ['high-octane', 'action', 'chases'],
    theme: 'crimson',
  },
  {
    id: 'curious',
    label: 'Mind-Bending & Cosmic',
    iconName: 'cyclone',
    vibePercent: 'Party Match: 95%',
    description: 'Warped relativity, layered realities, existential queries, and transcendent symphonies.',
    tags: ['psychological', 'twists', 'sci-fi', 'surreal'],
    theme: 'cyan',
  },
  {
    id: 'scared',
    label: 'Late-Night Thrills & Chills',
    iconName: 'dark_mode',
    vibePercent: '31% Vibe',
    description: 'Paranoid dread, shadowy corners, relentless psychological tension, and shocking twists.',
    tags: ['horror', 'suspense', 'eerie', 'tension'],
    theme: 'purple',
  },
  {
    id: 'romantic',
    label: 'Heartfelt & Romantic',
    iconName: 'favorite',
    vibePercent: '22% Vibe',
    description: 'Tender glances, bittersweet longing, swooning melodies, and honest emotional vulnerability.',
    tags: ['romance', 'intimate', 'comfort', 'love'],
    theme: 'pink',
  },
  {
    id: 'bored',
    label: 'Laugh-Out-Loud Riot',
    iconName: 'sentiment_very_satisfied',
    vibePercent: '29% Vibe',
    description: 'Unfiltered wit, hilarious timing, chaotic ensemble energy, and pure joyous laughter.',
    tags: ['comedy', 'satire', 'witty', 'feel-good'],
    theme: 'yellow',
  },
  {
    id: 'inspired',
    label: 'Deep & Thoughtful',
    iconName: 'psychology',
    vibePercent: '15% Vibe',
    description: 'Philosophical character studies, moral dilemmas, poetic cinematography, and haunting depth.',
    tags: ['drama', 'auteur', 'reflective', 'indie'],
    theme: 'emerald',
  },
  {
    id: 'nostalgic',
    label: 'Nostalgic Rewind',
    iconName: 'history',
    vibePercent: '20% Vibe',
    description: 'Golden-age film grain, 80s/90s analog warmth, coming-of-age heart, and timeless memories.',
    tags: ['retro', 'classics', 'comfort', '90s'],
    theme: 'blue',
  },
  {
    id: 'surprise',
    label: 'Awe & Cosmic Wonder',
    iconName: 'auto_awesome',
    vibePercent: '25% Vibe',
    description: 'Lush animation, grand mythical scope, soaring worldbuilding, and childlike wonder.',
    tags: ['fantasy', 'animation', 'epic', 'visuals'],
    theme: 'cyan',
  },
];

interface MoodSelectorProps {
  initialMood?: MoodId;
  onSelect?: (prefs: FilterPreferences) => void;
  compact?: boolean;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  initialMood = 'curious',
  onSelect,
  compact = false,
}) => {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<MoodId>(initialMood);
  const [matchMode, setMatchMode] = useState<'solo' | 'group'>('group');
  const [votesCount, setVotesCount] = useState(4);
  const [hasVoted, setHasVoted] = useState(false);

  const [showPreferences, setShowPreferences] = useState(false);
  const [timeLimit, setTimeLimit] = useState<FilterPreferences['timeLimit']>('any');
  const [genre, setGenre] = useState<string>('Any');
  const [taste, setTaste] = useState<FilterPreferences['taste']>('any');
  const [language, setLanguage] = useState<string>('Any');

  const handleMoodClick = (id: MoodId) => {
    setSelectedMood(id);
    if (!hasVoted) {
      setHasVoted(true);
      setVotesCount((v) => Math.min(5, v + 1));
    }
    if (onSelect) {
      onSelect({
        mood: id,
        timeLimit,
        genre,
        taste,
        language,
      });
    }
  };

  const handleFindMovie = () => {
    const params = new URLSearchParams();
    if (selectedMood) params.set('mood', selectedMood);
    if (timeLimit && timeLimit !== 'any') params.set('time', timeLimit);
    if (genre && genre !== 'Any') params.set('genre', genre);
    if (taste && taste !== 'any') params.set('taste', taste);
    if (language && language !== 'Any') params.set('lang', language);

    router.push(`/discover?${params.toString()}`);
  };

  const handleWatchTogether = () => {
    router.push(`/watch-together?mood=${selectedMood}`);
  };

  const activeCard = EXTENDED_MOOD_CARDS.find((m) => m.id === selectedMood) || EXTENDED_MOOD_CARDS[2];

  return (
    <div className="w-full max-w-6xl mx-auto text-left">
      {/* Header & Mode Switcher Controls */}
      <div className="flex flex-col items-center text-center gap-4 mb-8">
        {/* Mode Selector Switcher */}
        <div className="flex flex-col sm:flex-row items-center gap-3 p-1.5 rounded-full bg-surface-container-low/80 backdrop-blur-xl shadow-lg border border-surface-container-highest/60">
          <div className="flex items-center p-1 rounded-full bg-surface-container/60 gap-1">
            <button
              type="button"
              onClick={() => setMatchMode('solo')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-xs transition-all ${
                matchMode === 'solo'
                  ? 'bg-gradient-to-r from-primary-container to-secondary-container text-on-primary shadow-glow-violet'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">person</span>
              <span>Solo Pick</span>
            </button>
            <button
              type="button"
              onClick={() => setMatchMode('group')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-xs transition-all ${
                matchMode === 'group'
                  ? 'bg-gradient-to-r from-primary-container to-secondary-container text-on-primary shadow-[0_0_20px_rgba(128,131,255,0.45)]'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span
                className="material-symbols-outlined text-[16px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                groups
              </span>
              <span>Vote with Party Members</span>
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-highest/60 text-secondary border border-surface-container-high">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary shadow-[0_0_8px_#4cd7f6]"></span>
            </span>
            <span className="text-xs font-semibold tracking-wide text-on-surface">
              Live Tally: {votesCount} / 5 Voted
            </span>
            <div className="flex -space-x-1.5 ml-1">
              <span className="inline-block w-5 h-5 rounded-full bg-primary-container text-[10px] font-bold text-center leading-5 text-on-primary">
                M
              </span>
              <span className="inline-block w-5 h-5 rounded-full bg-secondary-container text-[10px] font-bold text-center leading-5 text-on-secondary">
                A
              </span>
              <span className="inline-block w-5 h-5 rounded-full bg-tertiary-container text-[10px] font-bold text-center leading-5 text-on-tertiary">
                K
              </span>
              <span className="inline-block w-5 h-5 rounded-full bg-surface-bright text-[10px] font-bold text-center leading-5 text-on-surface">
                +1
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Sensoria Bar */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
            Active Sensoria
          </span>
          <span className="text-outline text-xs">/</span>
          <span className="text-xs text-secondary font-semibold">Select to reshape feed</span>
        </div>
        <span className="text-xs text-on-surface-variant hidden sm:inline">
          Tap to trigger synchrony pulse
        </span>
      </div>

      {/* Mood Cards Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {EXTENDED_MOOD_CARDS.map((card) => {
          const isSelected = selectedMood === card.id;

          return (
            <div
              key={card.id}
              onClick={() => handleMoodClick(card.id)}
              className={`group relative p-6 rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden border ${
                isSelected
                  ? 'bg-surface-container/95 border-secondary/70 backdrop-blur-2xl shadow-[0_0_36px_rgba(76,215,246,0.35)] scale-[1.02]'
                  : 'bg-surface-container-low/70 border-surface-container-high/80 hover:bg-surface-container/80 hover:border-surface-variant backdrop-blur-xl hover:scale-[1.01]'
              }`}
            >
              {/* Glow Overlay */}
              {isSelected ? (
                <>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-secondary/15 via-primary-container/20 to-transparent" />
                  <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-secondary-container/30 blur-2xl animate-pulse" />
                </>
              ) : (
                <div className="pointer-events-none absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary-fixed-dim/10 blur-2xl group-hover:scale-150 transition-all duration-500" />
              )}

              {/* Card Header: Icon & Vibe badge */}
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div
                  className={`p-2.5 rounded-full shadow-inner flex items-center justify-center ${
                    isSelected
                      ? 'bg-secondary-container/40 text-secondary shadow-[0_0_16px_rgba(76,215,246,0.6)]'
                      : 'bg-surface-container-high/90 text-primary'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[24px]"
                    style={{ fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {card.iconName}
                  </span>
                </div>

                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    isSelected
                      ? 'bg-secondary/20 text-secondary border border-secondary/30'
                      : 'bg-surface-container/70 text-on-surface-variant'
                  }`}
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />}
                  <span>{card.vibePercent}</span>
                </div>
              </div>

              {/* Card Title */}
              <div className="flex items-center gap-2 relative z-10 mb-1.5">
                <h3 className="text-base font-bold text-on-surface tracking-tight">{card.label}</h3>
                {isSelected && (
                  <span
                    className="material-symbols-outlined text-secondary text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-on-surface-variant mb-4 relative z-10 leading-relaxed">
                {card.description}
              </p>

              {/* Tag Pills */}
              <div className="flex flex-wrap gap-1.5 relative z-10">
                {card.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                      isSelected
                        ? 'bg-secondary/15 text-secondary border border-secondary/20'
                        : 'bg-surface-container-highest/60 text-on-surface-variant group-hover:text-on-surface'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Optional Refinements Drawer Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3.5 px-5 rounded-2xl bg-surface-container-low/80 border border-surface-container-high mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">tune</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface">
              Selected Vibe:{' '}
              <span className="text-secondary font-bold">{activeCard.label}</span>
            </p>
            <p className="text-[11px] text-on-surface-variant line-clamp-1">
              {activeCard.description}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowPreferences(!showPreferences)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${
            showPreferences
              ? 'bg-secondary/20 border-secondary/40 text-secondary'
              : 'bg-surface-container border-surface-container-highest text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <SlidersHorizontal size={14} />
          <span>{showPreferences ? 'Hide Filters' : 'Fine-Tune (Time, Genre)'}</span>
        </button>
      </div>

      {/* Expandable Preferences Drawer */}
      {showPreferences && (
        <div className="mb-6 p-5 rounded-2xl bg-surface-container-low border border-surface-container-high grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in text-xs">
          {/* Runtime */}
          <div>
            <label className="block font-medium text-on-surface-variant mb-1.5">Runtime</label>
            <select
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value as any)}
              className="w-full py-2.5 px-3 rounded-xl bg-surface-container border border-surface-container-highest text-on-surface focus:outline-none focus:border-secondary"
            >
              {TIME_OPTIONS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Genre */}
          <div>
            <label className="block font-medium text-on-surface-variant mb-1.5">Genre</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-surface-container border border-surface-container-highest text-on-surface focus:outline-none focus:border-secondary"
            >
              {GENRE_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Taste */}
          <div>
            <label className="block font-medium text-on-surface-variant mb-1.5">Film Vibe</label>
            <select
              value={taste}
              onChange={(e) => setTaste(e.target.value as any)}
              className="w-full py-2.5 px-3 rounded-xl bg-surface-container border border-surface-container-highest text-on-surface focus:outline-none focus:border-secondary"
            >
              {TASTE_OPTIONS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block font-medium text-on-surface-variant mb-1.5">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-surface-container border border-surface-container-highest text-on-surface focus:outline-none focus:border-secondary"
            >
              <option value="Any">Any Language</option>
              <option value="English">English</option>
              <option value="Japanese">Japanese</option>
              <option value="French">French</option>
              <option value="Korean">Korean</option>
            </select>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!compact && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          {/* Primary CTA */}
          <button
            type="button"
            onClick={handleFindMovie}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-primary-container to-secondary-container text-on-primary font-bold text-sm transition-all duration-200 shadow-[0_0_24px_rgba(99,102,241,0.45)] hover:shadow-[0_0_32px_rgba(76,215,246,0.6)] flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Curate Films for {activeCard.label}</span>
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>

          {/* Secondary CTA */}
          <button
            type="button"
            onClick={handleWatchTogether}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface border border-surface-container-highest font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">groups</span>
            <span>Launch Synchronized Watch Party</span>
          </button>
        </div>
      )}
    </div>
  );
};
