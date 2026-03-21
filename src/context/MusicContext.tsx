import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { MusicState, MusicAction, Playlist, Song } from '../types/music.js';

const initialState: MusicState = {
  playlists: [],
  currentPlaylistId: null,
  player: {
    currentSongId: null,
    isPlaying: false,
    volume: 0.8,
    progress: 0,
  },
  isLoading: false,
  error: null,
};

function musicReducer(state: MusicState, action: MusicAction): MusicState {
  switch (action.type) {
    case 'SET_PLAYLISTS':
      return { ...state, playlists: action.payload, isLoading: false };

    case 'ADD_PLAYLIST': {
      const updatedPlaylists = [...state.playlists, action.payload];
      return { ...state, playlists: updatedPlaylists };
    }

    case 'UPDATE_PLAYLIST': {
      const updatedPlaylists = state.playlists.map((playlist) =>
        playlist.id === action.payload.id ? action.payload : playlist
      );
      return { ...state, playlists: updatedPlaylists };
    }

    case 'DELETE_PLAYLIST': {
      const updatedPlaylists = state.playlists.filter(
        (playlist) => playlist.id !== action.payload
      );
      return {
        ...state,
        playlists: updatedPlaylists,
        currentPlaylistId:
          state.currentPlaylistId === action.payload
            ? null
            : state.currentPlaylistId,
      };
    }

    case 'SET_CURRENT_PLAYLIST':
      return { ...state, currentPlaylistId: action.payload };

    case 'ADD_SONG': {
      const { playlistId, song } = action.payload;
      const updatedPlaylists = state.playlists.map((playlist) =>
        playlist.id === playlistId
          ? {
              ...playlist,
              songs: [...playlist.songs, song],
              updatedAt: new Date().toISOString(),
            }
          : playlist
      );
      return { ...state, playlists: updatedPlaylists };
    }

    case 'REMOVE_SONG': {
      const { playlistId, songId } = action.payload;
      const updatedPlaylists = state.playlists.map((playlist) =>
        playlist.id === playlistId
          ? {
              ...playlist,
              songs: playlist.songs.filter((s) => s.id !== songId),
              updatedAt: new Date().toISOString(),
            }
          : playlist
      );
      return { ...state, playlists: updatedPlaylists };
    }

    case 'PLAY_SONG':
      return {
        ...state,
        player: {
          ...state.player,
          currentSongId: action.payload,
          isPlaying: true,
          progress: 0,
        },
      };

    case 'PAUSE_SONG':
      return {
        ...state,
        player: {
          ...state.player,
          isPlaying: false,
        },
      };

    case 'RESUME_SONG':
      return {
        ...state,
        player: {
          ...state.player,
          isPlaying: true,
        },
      };

    case 'STOP_SONG':
      return {
        ...state,
        player: {
          ...state.player,
          currentSongId: null,
          isPlaying: false,
          progress: 0,
        },
      };

    case 'SET_VOLUME':
      return {
        ...state,
        player: {
          ...state.player,
          volume: action.payload,
        },
      };

    case 'SET_PROGRESS':
      return {
        ...state,
        player: {
          ...state.player,
          progress: action.payload,
        },
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    default:
      return state;
  }
}

interface MusicContextValue extends MusicState {
  // Playlist actions
  setPlaylists: (playlists: Playlist[]) => void;
  addPlaylist: (playlist: Playlist) => void;
  updatePlaylist: (playlist: Playlist) => void;
  deletePlaylist: (playlistId: string) => void;
  setCurrentPlaylist: (playlistId: string) => void;

  // Song actions
  addSong: (playlistId: string, song: Song) => void;
  removeSong: (playlistId: string, songId: string) => void;

  // Player actions
  playSong: (songId: string) => void;
  pauseSong: () => void;
  resumeSong: () => void;
  stopSong: () => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;

  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const MusicContext = createContext<MusicContextValue | null>(null);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(musicReducer, initialState);

  const setPlaylists = useCallback((playlists: Playlist[]) => {
    dispatch({ type: 'SET_PLAYLISTS', payload: playlists });
  }, []);

  const addPlaylist = useCallback((playlist: Playlist) => {
    dispatch({ type: 'ADD_PLAYLIST', payload: playlist });
  }, []);

  const updatePlaylist = useCallback((playlist: Playlist) => {
    dispatch({ type: 'UPDATE_PLAYLIST', payload: playlist });
  }, []);

  const deletePlaylist = useCallback((playlistId: string) => {
    dispatch({ type: 'DELETE_PLAYLIST', payload: playlistId });
  }, []);

  const setCurrentPlaylist = useCallback((playlistId: string) => {
    dispatch({ type: 'SET_CURRENT_PLAYLIST', payload: playlistId });
  }, []);

  const addSong = useCallback((playlistId: string, song: Song) => {
    dispatch({ type: 'ADD_SONG', payload: { playlistId, song } });
  }, []);

  const removeSong = useCallback((playlistId: string, songId: string) => {
    dispatch({ type: 'REMOVE_SONG', payload: { playlistId, songId } });
  }, []);

  const playSong = useCallback((songId: string) => {
    dispatch({ type: 'PLAY_SONG', payload: songId });
  }, []);

  const pauseSong = useCallback(() => {
    dispatch({ type: 'PAUSE_SONG' });
  }, []);

  const resumeSong = useCallback(() => {
    dispatch({ type: 'RESUME_SONG' });
  }, []);

  const stopSong = useCallback(() => {
    dispatch({ type: 'STOP_SONG' });
  }, []);

  const setVolume = useCallback((volume: number) => {
    dispatch({ type: 'SET_VOLUME', payload: volume });
  }, []);

  const setProgress = useCallback((progress: number) => {
    dispatch({ type: 'SET_PROGRESS', payload: progress });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const value: MusicContextValue = {
    ...state,
    setPlaylists,
    addPlaylist,
    updatePlaylist,
    deletePlaylist,
    setCurrentPlaylist,
    addSong,
    removeSong,
    playSong,
    pauseSong,
    resumeSong,
    stopSong,
    setVolume,
    setProgress,
    setLoading,
    setError,
  };

  return React.createElement(MusicContext.Provider, { value }, children);
}

export function useMusic(): MusicContextValue {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
}
