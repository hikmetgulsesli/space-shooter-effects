import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { SongItem } from '../SongItem.js';
import type { Song } from '../../../types/music.js';

describe('SongItem', () => {
  const mockSong: Song = {
    id: 'song-1',
    title: 'Test Song',
    artist: 'Test Artist',
    duration: 185,
    coverUrl: 'https://example.com/cover.jpg',
  };

  const mockSongNoCover: Song = {
    id: 'song-2',
    title: 'No Cover Song',
    artist: 'Unknown Artist',
    duration: 245,
  };

  it('renders song information correctly', () => {
    render(
      <SongItem
        song={mockSong}
        isPlaying={false}
        onClick={vi.fn()}
      />
    );

    expect(screen.getByText('Test Song')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
    expect(screen.getByText('3:05')).toBeInTheDocument();
  });

  it('displays cover image when coverUrl is provided', () => {
    render(
      <SongItem
        song={mockSong}
        isPlaying={false}
        onClick={vi.fn()}
      />
    );

    const img = screen.getByAltText('Test Song cover');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/cover.jpg');
  });

  it('displays gradient placeholder when no coverUrl', () => {
    render(
      <SongItem
        song={mockSongNoCover}
        isPlaying={false}
        onClick={vi.fn()}
      />
    );

    // Should not have an img element
    expect(screen.queryByAltText('No Cover Song cover')).not.toBeInTheDocument();
    
    // Should have the gradient placeholder (div with bg-gradient class)
    const songItem = screen.getByTestId('song-item');
    expect(songItem).toBeInTheDocument();
  });

  it('shows playing indicator when isPlaying is true', () => {
    render(
      <SongItem
        song={mockSong}
        isPlaying={true}
        onClick={vi.fn()}
      />
    );

    const songItem = screen.getByTestId('song-item');
    expect(songItem).toHaveAttribute('data-playing', 'true');
    
    // Check for primary glow styling
    expect(songItem.className).toContain('shadow-');
    expect(songItem.className).toContain('border-indigo-500');
  });

  it('does not show playing indicator when isPlaying is false', () => {
    render(
      <SongItem
        song={mockSong}
        isPlaying={false}
        onClick={vi.fn()}
      />
    );

    const songItem = screen.getByTestId('song-item');
    expect(songItem).toHaveAttribute('data-playing', 'false');
    expect(songItem.className).toContain('border-transparent');
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(
      <SongItem
        song={mockSong}
        isPlaying={false}
        onClick={handleClick}
      />
    );

    const songItem = screen.getByTestId('song-item');
    fireEvent.click(songItem);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('formats duration as MM:SS correctly', () => {
    const shortSong: Song = { ...mockSong, duration: 65 };
    render(
      <SongItem
        song={shortSong}
        isPlaying={false}
        onClick={vi.fn()}
      />
    );

    expect(screen.getByText('1:05')).toBeInTheDocument();
  });

  it('formats duration correctly for songs over an hour', () => {
    const longSong: Song = { ...mockSong, duration: 3661 };
    render(
      <SongItem
        song={longSong}
        isPlaying={false}
        onClick={vi.fn()}
      />
    );

    // Should show 61:01 (minutes:seconds)
    expect(screen.getByText('61:01')).toBeInTheDocument();
  });

  it('has correct data attributes', () => {
    render(
      <SongItem
        song={mockSong}
        isPlaying={false}
        onClick={vi.fn()}
      />
    );

    const songItem = screen.getByTestId('song-item');
    expect(songItem).toHaveAttribute('data-song-id', 'song-1');
  });

  it('applies neon glow hover effect', () => {
    render(
      <SongItem
        song={mockSong}
        isPlaying={false}
        onClick={vi.fn()}
      />
    );

    const songItem = screen.getByTestId('song-item');
    expect(songItem.className).toContain('hover:shadow-');
    expect(songItem.className).toContain('group');
  });

  it('displays song title with correct styling when playing', () => {
    render(
      <SongItem
        song={mockSong}
        isPlaying={true}
        onClick={vi.fn()}
      />
    );

    const title = screen.getByText('Test Song');
    expect(title.className).toContain('text-indigo-300');
  });

  it('displays song title with correct styling when not playing', () => {
    render(
      <SongItem
        song={mockSong}
        isPlaying={false}
        onClick={vi.fn()}
      />
    );

    const title = screen.getByText('Test Song');
    expect(title.className).toContain('text-white');
  });
});
