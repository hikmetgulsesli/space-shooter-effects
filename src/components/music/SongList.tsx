import React from 'react';
import type { Song, SongListProps } from '../../types/music.js';
import { SongItem } from './SongItem.js';

/**
 * Default empty state texts in Turkish
 */
const DEFAULT_EMPTY_TEXT = 'Bu playlistte şarkı yok';
const DEFAULT_ADD_BUTTON_TEXT = 'Playliste şarkı ekle';

/**
 * SongList - Component for displaying a list of songs
 * 
 * Features:
 * - Renders a scrollable list of SongItem components
 * - Shows empty state when no songs
 * - Handles song click events
 * - Highlights currently playing song
 */
export function SongList({
  songs,
  currentSongId,
  isPlaying,
  onSongClick,
  onAddSongs,
  emptyStateText = DEFAULT_EMPTY_TEXT,
  addButtonText = DEFAULT_ADD_BUTTON_TEXT,
}: SongListProps): React.ReactElement {
  const isEmpty = songs.length === 0;

  if (isEmpty) {
    return (
      <div 
        data-testid="song-list-empty"
        className="flex flex-col items-center justify-center py-12 px-4 text-center"
      >
        <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center">
          <svg 
            className="w-8 h-8 text-indigo-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" 
            />
          </svg>
        </div>
        <p className="text-gray-400 text-lg mb-2">{emptyStateText}</p>
        {onAddSongs && (
          <button
            onClick={onAddSongs}
            className="
              px-4 py-2 rounded-lg
              bg-indigo-600 hover:bg-indigo-500
              text-white text-sm font-medium
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900
            "
          >
            {addButtonText}
          </button>
        )}
      </div>
    );
  }

  return (
    <div 
      data-testid="song-list"
      className="flex flex-col gap-1"
    >
      {songs.map((song: Song) => (
        <SongItem
          key={song.id}
          song={song}
          isPlaying={isPlaying && currentSongId === song.id}
          onClick={() => onSongClick(song.id)}
        />
      ))}
    </div>
  );
}
