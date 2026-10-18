-- =====================================================================
-- Cinemood & Social Watch Platform - Supabase PostgreSQL Schema
-- Migration: 20261018000000_init_cinema_schema.sql
-- =====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (extends auth.users with public display profile)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  preferred_moods TEXT[] DEFAULT '{}',
  preferred_genres TEXT[] DEFAULT '{}',
  preferred_streaming_services TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Watchlists Table
CREATE TABLE IF NOT EXISTS public.watchlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  movie_id TEXT NOT NULL,
  movie_title TEXT NOT NULL,
  poster_path TEXT,
  backdrop_path TEXT,
  release_year TEXT,
  genre_names TEXT[] DEFAULT '{}',
  vote_average NUMERIC(3, 1),
  mood_tags TEXT[] DEFAULT '{}',
  watched BOOLEAN DEFAULT FALSE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);

-- 3. Watch Rooms Table (Rave-style social rooms)
CREATE TABLE IF NOT EXISTS public.watch_rooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_code VARCHAR(16) UNIQUE NOT NULL, -- e.g. "MOON-582", "NOVA-482"
  title TEXT NOT NULL,
  host_id TEXT NOT NULL, -- UUID or guest session identifier
  host_nickname TEXT NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  max_participants INT DEFAULT 50,
  
  -- Shared Media
  media_type TEXT DEFAULT 'youtube', -- 'youtube', 'mp4', 'trailer', 'external'
  media_id TEXT NOT NULL,           -- YouTube video ID or video stream URL
  media_title TEXT NOT NULL,
  media_poster TEXT,
  media_backdrop TEXT,
  media_duration NUMERIC(10, 2) DEFAULT 0,
  
  -- Playback State
  playback_status TEXT DEFAULT 'paused' CHECK (playback_status IN ('playing', 'paused', 'buffering', 'ended')),
  playback_position NUMERIC(10, 3) DEFAULT 0.0,
  playback_updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  is_active BOOLEAN DEFAULT TRUE
);

-- 4. Room Participants Table (presence & membership)
CREATE TABLE IF NOT EXISTS public.room_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_code VARCHAR(16) REFERENCES public.watch_rooms(room_code) ON DELETE CASCADE NOT NULL,
  user_id TEXT NOT NULL, -- Supabase auth id or persistent guest client token
  nickname TEXT NOT NULL,
  avatar_url TEXT,
  is_host BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_code, user_id)
);

-- 5. Room Messages Table (group chat & reactions)
CREATE TABLE IF NOT EXISTS public.room_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_code VARCHAR(16) REFERENCES public.watch_rooms(room_code) ON DELETE CASCADE NOT NULL,
  user_id TEXT NOT NULL,
  nickname TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'reaction', 'system', 'quick_message')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Indices for fast lookups
CREATE INDEX IF NOT EXISTS idx_watch_rooms_code ON public.watch_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_room_participants_code ON public.room_participants(room_code);
CREATE INDEX IF NOT EXISTS idx_room_messages_code ON public.room_messages(room_code, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_watchlists_user ON public.watchlists(user_id);

-- 7. Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_messages ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can read profiles, only owner can update
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Watchlists: Only owner can access their watchlist
CREATE POLICY "Users can view own watchlist" 
  ON public.watchlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert into own watchlist" 
  ON public.watchlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own watchlist" 
  ON public.watchlists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete from own watchlist" 
  ON public.watchlists FOR DELETE USING (auth.uid() = user_id);

-- Watch Rooms: Anyone can view active rooms by room_code; anyone can insert
CREATE POLICY "Active rooms are viewable" 
  ON public.watch_rooms FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can create a room" 
  ON public.watch_rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Host can update room" 
  ON public.watch_rooms FOR UPDATE USING (true); -- Authorization verified at API/Host token layer

-- Room Participants: Active members can view participants
CREATE POLICY "View participants in room" 
  ON public.room_participants FOR SELECT USING (true);
CREATE POLICY "Join room participant" 
  ON public.room_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Update participant presence" 
  ON public.room_participants FOR UPDATE USING (true);
CREATE POLICY "Leave room participant" 
  ON public.room_participants FOR DELETE USING (true);

-- Room Messages: Participants can view and post messages
CREATE POLICY "View room messages" 
  ON public.room_messages FOR SELECT USING (true);
CREATE POLICY "Post room messages" 
  ON public.room_messages FOR INSERT WITH CHECK (true);

-- 8. Realtime Enablement (Replication)
ALTER PUBLICATION supabase_realtime ADD TABLE public.watch_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_messages;
