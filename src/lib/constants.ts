import { Mood } from '@/types';

export const MOODS: Mood[] = [
  {
    id: 'happy',
    label: 'Happy',
    tagline: 'Feel-good, uplifting & joyful',
    description: 'Bright spirits, delightful laughter, and stories that leave you smiling.',
    emoji: '✨',
    iconName: 'Sparkles',
    accentColor: '#F59E0B',
    ambientGlow: 'rgba(245, 158, 11, 0.25)',
    genres: ['Comedy', 'Animation', 'Family', 'Music']
  },
  {
    id: 'sad',
    label: 'Sad',
    tagline: 'Emotional, comforting & cathartic',
    description: 'Poignant cinema that gives you permission to feel deeply and release tears.',
    emoji: '🌧️',
    iconName: 'CloudRain',
    accentColor: '#60A5FA',
    ambientGlow: 'rgba(96, 165, 250, 0.25)',
    genres: ['Drama', 'Romance']
  },
  {
    id: 'stressed',
    label: 'Stressed',
    tagline: 'Calming, relaxing & gentle',
    description: 'Low-stakes, visually soothing films that wash away the chaos of the day.',
    emoji: '🍃',
    iconName: 'Wind',
    accentColor: '#34D399',
    ambientGlow: 'rgba(52, 211, 153, 0.25)',
    genres: ['Animation', 'Comedy', 'Documentary', 'Fantasy']
  },
  {
    id: 'romantic',
    label: 'Romantic',
    tagline: 'Love stories & tender connections',
    description: 'Passionate encounters, witty banter, and stories of shared heartbeats.',
    emoji: '💫',
    iconName: 'Heart',
    accentColor: '#F43F5E',
    ambientGlow: 'rgba(244, 63, 94, 0.25)',
    genres: ['Romance', 'Drama', 'Comedy']
  },
  {
    id: 'lonely',
    label: 'Lonely',
    tagline: 'Warm, comforting & connection-driven',
    description: 'Films that remind you of humanity, kindness, and that you are never truly alone.',
    emoji: '☕',
    iconName: 'Coffee',
    accentColor: '#D6A85F',
    ambientGlow: 'rgba(214, 168, 95, 0.25)',
    genres: ['Drama', 'Comedy', 'Adventure']
  },
  {
    id: 'adventurous',
    label: 'Adventurous',
    tagline: 'Exciting journeys & bold exploration',
    description: 'Epic quests, uncharted worlds, and adrenaline-pumping expeditions.',
    emoji: '🧭',
    iconName: 'Compass',
    accentColor: '#10B981',
    ambientGlow: 'rgba(16, 185, 129, 0.25)',
    genres: ['Adventure', 'Action', 'Sci-Fi', 'Fantasy']
  },
  {
    id: 'curious',
    label: 'Curious',
    tagline: 'Mysteries, thrillers & mind-benders',
    description: 'Puzzles that challenge your perceptions with twists you will never see coming.',
    emoji: '🔍',
    iconName: 'Search',
    accentColor: '#818CF8',
    ambientGlow: 'rgba(129, 140, 248, 0.25)',
    genres: ['Mystery', 'Thriller', 'Sci-Fi', 'Crime']
  },
  {
    id: 'nostalgic',
    label: 'Nostalgic',
    tagline: 'Classics & timeless favorites',
    description: 'Warm golden memories, retro vibes, and the cinematic treasures of yesterday.',
    emoji: '📼',
    iconName: 'Film',
    accentColor: '#FB923C',
    ambientGlow: 'rgba(251, 146, 60, 0.25)',
    genres: ['Drama', 'Adventure', 'Family', 'Music']
  },
  {
    id: 'scared',
    label: 'Scared',
    tagline: 'Horror, dread & pulse-pounding suspense',
    description: 'Chills down your spine, dark corners, and high-tension psychological thrills.',
    emoji: '🕯️',
    iconName: 'Flame',
    accentColor: '#EF4444',
    ambientGlow: 'rgba(239, 68, 68, 0.25)',
    genres: ['Horror', 'Thriller', 'Mystery']
  },
  {
    id: 'inspired',
    label: 'Inspired',
    tagline: 'Motivating & thought-provoking',
    description: 'True triumphs of the human spirit, daring dreamers, and philosophical brilliance.',
    emoji: '🌟',
    iconName: 'Sun',
    accentColor: '#FBBF24',
    ambientGlow: 'rgba(251, 191, 36, 0.25)',
    genres: ['Biography', 'Drama', 'History', 'Documentary']
  },
  {
    id: 'bored',
    label: 'Bored',
    tagline: 'Entertaining, fast-paced & gripping',
    description: 'Instant hooks, relentless pacing, and zero filler to immediately snap you into excitement.',
    emoji: '⚡',
    iconName: 'Zap',
    accentColor: '#A855F7',
    ambientGlow: 'rgba(168, 85, 247, 0.25)',
    genres: ['Action', 'Thriller', 'Comedy', 'Crime']
  },
  {
    id: 'surprise',
    label: 'Surprise Me',
    tagline: 'Unexpected discoveries & hidden gems',
    description: 'Let serendipity decide. Cinematic brilliance from corners you never anticipated.',
    emoji: '🎲',
    iconName: 'Shuffle',
    accentColor: '#EC4899',
    ambientGlow: 'rgba(236, 72, 153, 0.25)',
    genres: ['Drama', 'Sci-Fi', 'Comedy', 'Mystery', 'Animation']
  }
];

export const GENRE_OPTIONS = [
  'Any',
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Thriller'
];

export const TIME_OPTIONS = [
  { id: 'any', label: 'Any runtime' },
  { id: 'under_90', label: 'Under 90 min (Brisk)' },
  { id: '90_120', label: '90 - 120 min (Standard)' },
  { id: 'over_120', label: '2+ hours (Epic)' }
];

export const TASTE_OPTIONS = [
  { id: 'any', label: 'All movies' },
  { id: 'popular', label: 'Popular & Acclaimed' },
  { id: 'underrated', label: 'Underrated Gems' },
  { id: 'hidden_gem', label: 'Indie & Hidden' }
];

export const QUICK_MESSAGES = [
  "Let's start! 🍿",
  "Pause a second ⏸️",
  "This is amazing! 🔥",
  "Wait, what just happened? 😱",
  "Back in 2 mins!",
  "Best scene so far! ❤️",
  "Pass the popcorn! 🍿"
];

export const QUICK_EMOJIS = ['🔥', '❤️', '😂', '🍿', '😱', '👏', '✨', '🤯'];
