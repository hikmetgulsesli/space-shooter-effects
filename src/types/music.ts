/**
 * Music domain types for US-007: SongList and SongItem components
 */

/**
 * Song entity representing a track in a playlist
 */
export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number; // in seconds
  coverUrl?: string;
}

/**
 * Playlist entity containing a collection of songs
 */
export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Player state for the music player
 */
export interface PlayerState {
  currentSongId: string | null;
  isPlaying: boolean;
  volume: number;
  progress: number; // in seconds
}

/**
 * Music state for React Context/Store
 */
export interface MusicState {
  playlists: Playlist[];
  currentPlaylistId: string | null;
  player: PlayerState;
  isLoading: boolean;
  error: string | null;
}

/**
 * Actions available for music state management
 */
export type MusicAction =
  | { type: 'SET_PLAYLISTS'; payload: Playlist[] }
  | { type: 'ADD_PLAYLIST'; payload: Playlist }
  | { type: 'UPDATE_PLAYLIST'; payload: Playlist }
  | { type: 'DELETE_PLAYLIST'; payload: string }
  | { type: 'SET_CURRENT_PLAYLIST'; payload: string }
  | { type: 'ADD_SONG'; payload: { playlistId: string; song: Song } }
  | { type: 'REMOVE_SONG'; payload: { playlistId: string; songId: string } }
  | { type: 'PLAY_SONG'; payload: string }
  | { type: 'PAUSE_SONG' }
  | { type: 'RESUME_SONG' }
  | { type: 'STOP_SONG' }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'SET_PROGRESS'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

/**
 * Props for SongItem component
 */
export interface SongItemProps {
  song: Song;
  isPlaying: boolean;
  onClick: () => void;
}

/**
 * Props for SongList component
 */
export interface SongListProps {
  songs: Song[];
  currentSongId: string | null;
  isPlaying: boolean;
  onSongClick: (songId: string) => void;
  onAddSongs?: () => void;
  emptyStateText?: string;
  addButtonText?: string;
}
