import { useState, useEffect } from "react";
import { Track, Playlist } from "@/types/music";

const STORAGE_KEYS = {
  TRACKS: 'localmusic_tracks',
  PLAYLISTS: 'localmusic_playlists',
  LIKED: 'localmusic_liked',
};

export const useMusicStorage = () => {
  const [tracks, setTracksState] = useState<Track[]>([]);
  const [playlists, setPlaylistsState] = useState<Playlist[]>([]);
  const [likedTrackIds, setLikedTrackIds] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedPlaylists = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
    const savedLiked = localStorage.getItem(STORAGE_KEYS.LIKED);
    
    if (savedPlaylists) {
      setPlaylistsState(JSON.parse(savedPlaylists));
    }
    if (savedLiked) {
      setLikedTrackIds(JSON.parse(savedLiked));
    }
  }, []);

  const setTracks = (newTracks: Track[]) => {
    setTracksState(newTracks);
  };

  const deleteTrack = (track: Track) => {
    // Remove from tracks
    const newTracks = tracks.filter(t => t.id !== track.id);
    setTracksState(newTracks);
    
    // Remove from liked
    if (likedTrackIds.includes(track.id)) {
      const newLikedIds = likedTrackIds.filter(id => id !== track.id);
      setLikedTrackIds(newLikedIds);
      localStorage.setItem(STORAGE_KEYS.LIKED, JSON.stringify(newLikedIds));
    }
    
    // Remove from playlists
    const updatedPlaylists = playlists.map(playlist => ({
      ...playlist,
      trackIds: playlist.trackIds.filter(id => id !== track.id)
    }));
    setPlaylistsState(updatedPlaylists);
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(updatedPlaylists));
    
    // Clean up object URL to prevent memory leaks
    URL.revokeObjectURL(track.url);
  };

  const setPlaylists = (newPlaylists: Playlist[]) => {
    setPlaylistsState(newPlaylists);
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(newPlaylists));
  };

  const toggleLike = (track: Track) => {
    const newLikedIds = likedTrackIds.includes(track.id)
      ? likedTrackIds.filter(id => id !== track.id)
      : [...likedTrackIds, track.id];
    
    setLikedTrackIds(newLikedIds);
    localStorage.setItem(STORAGE_KEYS.LIKED, JSON.stringify(newLikedIds));
  };

  const likedTracks = tracks.filter(track => likedTrackIds.includes(track.id));

  return {
    tracks,
    setTracks,
    deleteTrack,
    playlists,
    setPlaylists,
    likedTracks,
    toggleLike,
  };
};
