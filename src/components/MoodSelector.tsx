'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoodId, FilterPreferences } from '@/types';
import { MOODS, GENRE_OPTIONS, TIME_OPTIONS, TASTE_OPTIONS } from '@/lib/constants';
import { SlidersHorizontal, Sparkles, Users, ArrowRight, Check } from 'lucide-react';

interface MoodSelectorProps {
  initialMood?: MoodId;
  onSelect?: (prefs: FilterPreferences) => void;
  compact?: boolean;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  initialMood = 'happy',
  onSelect,
  compact = false,
}) => {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<MoodId>(initialMood);
  const [showPreferences, setShowPreferences] = useState(false);
  const [timeLimit, setTimeLimit] = useState<FilterPreferences['timeLimit']>('any');
  const [genre, setGenre] = useState<string>('Any');
  const [taste, setTaste] = useState<FilterPreferences['taste']>('any');
  const [language, setLanguage] = useState<string>('Any');

  const handleMoodClick = (id: MoodId) => {
    setSelectedMood(id);
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

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* 12 Mood Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
        {MOODS.map((mood) => {
          const isSelected = selectedMood === mood.id;
          return (
            <button
              key={mood.id}
              onClick={() => handleMoodClick(mood.id)}
              className={`group relative text-left p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between h-32 sm:h-36 ${
                isSelected
                  ? 'bg-cinema-850 border-amber-cinema shadow-glow-amber scale-[1.02]'
                  : 'bg-cinema-900/60 border-cinema-800/80 hover:bg-cinema-850 hover:border-cinema-700/80'
              }`}
              style={{
                boxShadow: isSelected
                  ? `0 0 25px -4px ${mood.ambientGlow}`
                  : undefined,
              }}
            >
              {/* Subtle top-right check badge when active */}
              {isSelected && (
                <div
                  className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center text-cinema-950"
                  style={{ backgroundColor: mood.accentColor }}
                >
                  <Check size={10} className="stroke-[3]" />
                </div>
              )}

              {/* Emoji & Accent Glow */}
              <div className="flex items-center justify-between">
                <span className="text-2xl sm:text-3xl filter drop-shadow-md group-hover:scale-110 transition-transform duration-200">
                  {mood.emoji}
                </span>
                <span
                  className="w-2 h-2 rounded-full opacity-60"
                  style={{ backgroundColor: mood.accentColor }}
                />
              </div>

              {/* Mood title & tagline */}
              <div>
                <h3
                  className={`font-semibold text-sm sm:text-base leading-tight mb-0.5 transition-colors ${
                    isSelected ? 'text-white' : 'text-cinema-200 group-hover:text-white'
                  }`}
                >
                  {mood.label}
                </h3>
                <p className="text-[11px] text-cinema-400 line-clamp-1 leading-snug">
                  {mood.tagline.split('&')[0]}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Optional Refinements Drawer Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-5 rounded-2xl bg-cinema-900/70 border border-cinema-800/80 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-cinema/15 text-amber-cinema flex items-center justify-center">
            <Sparkles size={16} />
          </div>
          <div>
            <p className="text-xs font-medium text-cinema-200">
              Selected Mood:{' '}
              <span className="text-amber-cinema font-semibold">
                {MOODS.find((m) => m.id === selectedMood)?.label}
              </span>
            </p>
            <p className="text-[11px] text-cinema-400">
              {MOODS.find((m) => m.id === selectedMood)?.description}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowPreferences(!showPreferences)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
            showPreferences
              ? 'bg-amber-cinema/20 border-amber-cinema/40 text-amber-cinema'
              : 'bg-cinema-850 border-cinema-750 text-cinema-300 hover:text-white'
          }`}
        >
          <SlidersHorizontal size={14} />
          <span>{showPreferences ? 'Hide Filters' : 'Fine-Tune (Time, Genre)'}</span>
        </button>
      </div>

      {/* Expandable Preferences Drawer */}
      {showPreferences && (
        <div className="mb-6 p-5 rounded-2xl bg-cinema-850 border border-cinema-700/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in text-xs">
          {/* Runtime */}
          <div>
            <label className="block font-medium text-cinema-300 mb-1.5">Runtime</label>
            <select
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value as any)}
              className="w-full py-2 px-3 rounded-xl bg-cinema-900 border border-cinema-700 text-cinema-100 focus:outline-none focus:border-amber-cinema"
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
            <label className="block font-medium text-cinema-300 mb-1.5">Genre</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-cinema-900 border border-cinema-700 text-cinema-100 focus:outline-none focus:border-amber-cinema"
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
            <label className="block font-medium text-cinema-300 mb-1.5">Film Vibe</label>
            <select
              value={taste}
              onChange={(e) => setTaste(e.target.value as any)}
              className="w-full py-2 px-3 rounded-xl bg-cinema-900 border border-cinema-700 text-cinema-100 focus:outline-none focus:border-amber-cinema"
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
            <label className="block font-medium text-cinema-300 mb-1.5">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-cinema-900 border border-cinema-700 text-cinema-100 focus:outline-none focus:border-amber-cinema"
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
          {/* Primary CTA: Find My Movie */}
          <button
            onClick={handleFindMovie}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-amber-cinema hover:bg-amber-hover text-cinema-950 font-semibold text-sm transition-all duration-200 shadow-glow-amber flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Find My Movie</span>
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>

          {/* Secondary CTA: Watch Together */}
          <button
            onClick={handleWatchTogether}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-cinema-850 hover:bg-cinema-800 text-cinema-100 border border-cinema-700/80 font-medium text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Users size={18} className="text-amber-cinema" />
            <span>Watch Together with Friends</span>
          </button>
        </div>
      )}
    </div>
  );
};
