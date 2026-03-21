import React from 'react';
import type { Song } from '../../types/music.js';

export interface SongItemProps {
  song: Song;
  isPlaying: boolean;
  onClick: () => void;
}

/**
 * Formats duration in seconds to MM:SS format
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * SongItem - Individual song row component
 * 
 * Displays song info with cover art, title, artist, and duration.
 * Shows neon glow on hover and primary glow when currently playing.
 */
export function SongItem({ song, isPlaying, onClick }: SongItemProps): React.ReactElement {
  const hasCover = Boolean(song.coverUrl);

  return (
    <div
      data-testid="song-item"
      data-song-id={song.id}
      data-playing={isPlaying}
      onClick={onClick}
      className={`
        group flex items-center gap-3 p-3 rounded-lg cursor-pointer
        transition-all duration-200 ease-in-out
        hover:shadow-[0_0_15px_rgba(99,102,241,0.4)]
        ${isPlaying 
          ? 'border border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.6)] bg-indigo-950/30' 
          : 'border border-transparent hover:border-indigo-500/30 hover:bg-white/5'
        }
      `}
    >
      {/* Cover Image / Placeholder */}
      <div className="relative w-12 h-12 flex-shrink-0 rounded-md overflow-hidden">
        {hasCover ? (
          <img
            src={song.coverUrl}
            alt={`${song.title} cover`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
            aria-hidden="true"
          />
        )}
        
        {/* Playing Indicator Overlay */}
        {isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="flex gap-0.5 items-end h-4">
              <div className="w-1 bg-indigo-400 animate-pulse" style={{ height: '60%', animationDelay: '0ms' }} />
              <div className="w-1 bg-indigo-400 animate-pulse" style={{ height: '100%', animationDelay: '150ms' }} />
              <div className="w-1 bg-indigo-400 animate-pulse" style={{ height: '70%', animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Song Info */}
      <div className="flex-1 min-w-0">
        <div 
          className={`font-medium truncate ${isPlaying ? 'text-indigo-300' : 'text-white'}`}
        >
          {song.title}
        </div>
        <div className="text-sm text-gray-400 truncate">
          {song.artist}
        </div>
      </div>

      {/* Duration */}
      <div className={`text-sm font-mono ${isPlaying ? 'text-indigo-300' : 'text-gray-500'}`}>
        {formatDuration(song.duration)}
      </div>
    </div>
  );
}
