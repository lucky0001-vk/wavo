'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Movie } from '@/types';
import { useAuth } from './auth-context';
import { getSupabaseClient } from './supabase';

export interface WatchlistItem {
  movie: Movie;
  watched: boolean;
  addedAt: number;
}

interface WatchlistContextType {
  watchlist: WatchlistItem[];
  addToWatchlist: (movie: Movie) => void;
  removeFromWatchlist: (movieId: string) => void;
  toggleWatched: (movieId: string) => void;
  isInWatchlist: (movieId: string) => boolean;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

const LOCAL_STORAGE_WATCHLIST_KEY = 'cinemood_user_watchlist';

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const { user, isConfigured } = useAuth();

  // Load initial watchlist
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(LOCAL_STORAGE_WATCHLIST_KEY);
        if (stored) {
          setWatchlist(JSON.parse(stored));
        }
      }
    } catch (err) {
      console.warn('Watchlist restoration error:', err);
    }
  }, []);

  // Sync to localStorage
  const saveItems = (items: WatchlistItem[]) => {
    setWatchlist(items);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_WATCHLIST_KEY, JSON.stringify(items));
      } catch (err) {
        console.error('Watchlist save error:', err);
      }
    }
  };

  const addToWatchlist = async (movie: Movie) => {
    if (watchlist.some((item) => item.movie.id === movie.id)) return;

    const newItem: WatchlistItem = {
      movie,
      watched: false,
      addedAt: Date.now(),
    };

    const nextList = [newItem, ...watchlist];
    saveItems(nextList);

    // Sync to Supabase if authenticated
    if (user && !user.isGuest && isConfigured) {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('watchlists').insert([
            {
              user_id: user.id,
              movie_id: movie.id,
              movie_title: movie.title,
              poster_path: movie.posterPath,
              backdrop_path: movie.backdropPath,
              release_year: movie.releaseYear,
              genre_names: movie.genres,
              vote_average: movie.rating,
              mood_tags: movie.matchedMoods || [],
              watched: false,
            },
          ]);
        } catch (e) {
          console.warn('Supabase watchlist sync:', e);
        }
      }
    }
  };

  const removeFromWatchlist = async (movieId: string) => {
    const nextList = watchlist.filter((item) => item.movie.id !== movieId);
    saveItems(nextList);

    if (user && !user.isGuest && isConfigured) {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('watchlists').delete().eq('user_id', user.id).eq('movie_id', movieId);
        } catch (e) {
          console.warn('Supabase watchlist remove sync:', e);
        }
      }
    }
  };

  const toggleWatched = async (movieId: string) => {
    const nextList = watchlist.map((item) => {
      if (item.movie.id === movieId) {
        return { ...item, watched: !item.watched };
      }
      return item;
    });
    saveItems(nextList);

    const updatedItem = nextList.find((i) => i.movie.id === movieId);
    if (updatedItem && user && !user.isGuest && isConfigured) {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase
            .from('watchlists')
            .update({ watched: updatedItem.watched })
            .eq('user_id', user.id)
            .eq('movie_id', movieId);
        } catch (e) {
          console.warn('Supabase watchlist toggle sync:', e);
        }
      }
    }
  };

  const isInWatchlist = (movieId: string) => {
    return watchlist.some((item) => item.movie.id === movieId);
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        toggleWatched,
        isInWatchlist,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};
