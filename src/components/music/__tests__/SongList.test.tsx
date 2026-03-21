import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { SongList } from '../SongList.js';
import type { Song } from '../../../types/music.js';

describe('SongList', () => {
  const mockSongs: Song[] = [
    {
      id: 'song-1',
      title: 'First Song',
      artist: 'Artist One',
      duration: 180,
      coverUrl: 'https://example.com/cover1.jpg',
    },
    {
      id: 'song-2',
      title: 'Second Song',
      artist: 'Artist Two',
      duration: 240,
    },
    {
      id: 'song-3',
      title: 'Third Song',
      artist: 'Artist Three',
      duration: 195,
      coverUrl: 'https://example.com/cover3.jpg',
    },
  ];

  it('renders all songs in the list', () => {
    render(
      <SongList
        songs={mockSongs}
        currentSongId={null}
        isPlaying={false}
        onSongClick={vi.fn()}
      />
    );

    expect(screen.getByTestId('song-list')).toBeInTheDocument();
    expect(screen.getByText('First Song')).toBeInTheDocument();
    expect(screen.getByText('Second Song')).toBeInTheDocument();
    expect(screen.getByText('Third Song')).toBeInTheDocument();
  });

  it('renders empty state when songs array is empty', () => {
    render(
      <SongList
        songs={[]}
        currentSongId={null}
        isPlaying={false}
        onSongClick={vi.fn()}
      />
    );

    expect(screen.getByTestId('song-list-empty')).toBeInTheDocument();
    expect(screen.getByText('Bu playlistte şarkı yok')).toBeInTheDocument();
  });

  it('renders custom empty state text when provided', () => {
    render(
      <SongList
        songs={[]}
        currentSongId={null}
        isPlaying={false}
        onSongClick={vi.fn()}
        emptyStateText="No tracks available"
      />
    );

    expect(screen.getByText('No tracks available')).toBeInTheDocument();
  });

  it('shows add songs button when onAddSongs is provided and list is empty', () => {
    const handleAddSongs = vi.fn();
    render(
      <SongList
        songs={[]}
        currentSongId={null}
        isPlaying={false}
        onSongClick={vi.fn()}
        onAddSongs={handleAddSongs}
      />
    );

    expect(screen.getByText('Playliste şarkı ekle')).toBeInTheDocument();
  });

  it('calls onAddSongs when add button is clicked', () => {
    const handleAddSongs = vi.fn();
    render(
      <SongList
        songs={[]}
        currentSongId={null}
        isPlaying={false}
        onSongClick={vi.fn()}
        onAddSongs={handleAddSongs}
      />
    );

    const addButton = screen.getByText('Playliste şarkı ekle');
    fireEvent.click(addButton);

    expect(handleAddSongs).toHaveBeenCalledTimes(1);
  });

  it('does not show add button when onAddSongs is not provided', () => {
    render(
      <SongList
        songs={[]}
        currentSongId={null}
        isPlaying={false}
        onSongClick={vi.fn()}
      />
    );

    expect(screen.queryByText('Playliste şarkı ekle')).not.toBeInTheDocument();
  });

  it('calls onSongClick with correct song id when song is clicked', () => {
    const handleSongClick = vi.fn();
    render(
      <SongList
        songs={mockSongs}
        currentSongId={null}
        isPlaying={false}
        onSongClick={handleSongClick}
      />
    );

    const firstSong = screen.getByText('First Song').closest('[data-testid="song-item"]');
    fireEvent.click(firstSong!);

    expect(handleSongClick).toHaveBeenCalledWith('song-1');
  });

  it('marks currently playing song as playing', () => {
    render(
      <SongList
        songs={mockSongs}
        currentSongId="song-2"
        isPlaying={true}
        onSongClick={vi.fn()}
      />
    );

    const playingSong = screen.getByText('Second Song').closest('[data-testid="song-item"]');
    expect(playingSong).toHaveAttribute('data-playing', 'true');
  });

  it('does not mark non-current songs as playing', () => {
    render(
      <SongList
        songs={mockSongs}
        currentSongId="song-2"
        isPlaying={true}
        onSongClick={vi.fn()}
      />
    );

    const firstSong = screen.getByText('First Song').closest('[data-testid="song-item"]');
    expect(firstSong).toHaveAttribute('data-playing', 'false');

    const thirdSong = screen.getByText('Third Song').closest('[data-testid="song-item"]');
    expect(thirdSong).toHaveAttribute('data-playing', 'false');
  });

  it('does not mark current song as playing when isPlaying is false', () => {
    render(
      <SongList
        songs={mockSongs}
        currentSongId="song-2"
        isPlaying={false}
        onSongClick={vi.fn()}
      />
    );

    const currentSong = screen.getByText('Second Song').closest('[data-testid="song-item"]');
    expect(currentSong).toHaveAttribute('data-playing', 'false');
  });

  it('renders correct number of SongItem components', () => {
    render(
      <SongList
        songs={mockSongs}
        currentSongId={null}
        isPlaying={false}
        onSongClick={vi.fn()}
      />
    );

    const songItems = screen.getAllByTestId('song-item');
    expect(songItems).toHaveLength(3);
  });

  it('renders custom add button text when provided', () => {
    render(
      <SongList
        songs={[]}
        currentSongId={null}
        isPlaying={false}
        onSongClick={vi.fn()}
        onAddSongs={vi.fn()}
        addButtonText="Add Tracks"
      />
    );

    expect(screen.getByText('Add Tracks')).toBeInTheDocument();
  });

  it('handles single song in list', () => {
    const singleSong: Song[] = [mockSongs[0]];
    render(
      <SongList
        songs={singleSong}
        currentSongId={null}
        isPlaying={false}
        onSongClick={vi.fn()}
      />
    );

    expect(screen.getByText('First Song')).toBeInTheDocument();
    expect(screen.queryByText('Second Song')).not.toBeInTheDocument();
  });

  it('maintains song order as provided in array', () => {
    render(
      <SongList
        songs={mockSongs}
        currentSongId={null}
        isPlaying={false}
        onSongClick={vi.fn()}
      />
    );

    const songItems = screen.getAllByTestId('song-item');
    expect(songItems[0]).toHaveAttribute('data-song-id', 'song-1');
    expect(songItems[1]).toHaveAttribute('data-song-id', 'song-2');
    expect(songItems[2]).toHaveAttribute('data-song-id', 'song-3');
  });
});
