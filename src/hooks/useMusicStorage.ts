import { useState, useEffect, useRef } from "react";
import { Track, Playlist } from "@/types/music";
import { getTrackContent, saveTrackContent, deleteTrackContent } from "@/lib/db";
import { toast } from "sonner";

const STORAGE_KEYS = {
  TRACKS_METADATA: 'soundshelf_tracks_metadata',
  PLAYLISTS: 'soundshelf_playlists',
  LIKED: 'soundshelf_liked',
  USER_ID: 'soundshelf_user_id',
  PENDING_SYNC: 'soundshelf_pending_sync', // Tracks waiting to sync to database
};

// Use proxy in development, or explicit URL in production
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'http://localhost:3001');

// Get or create a userId
const getUserId = (): string => {
  let userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
  if (!userId) {
    userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
  }
  return userId;
};

export const useMusicStorage = () => {
  const [tracks, setTracksState] = useState<Track[]>([]);
  const [playlists, setPlaylistsState] = useState<Playlist[]>([]);
  const [likedTrackIds, setLikedTrackIds] = useState<string[]>([]);
  const tracksRef = useRef<Track[]>([]);

  // Keep ref in sync for cleanup access
  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  // Load from persistent storage on mount
  useEffect(() => {
    const loadData = async () => {
      // 1. Load Liked and Playlists
      const savedPlaylists = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
      const savedLiked = localStorage.getItem(STORAGE_KEYS.LIKED);
      
      if (savedPlaylists) setPlaylistsState(JSON.parse(savedPlaylists));
      if (savedLiked) setLikedTrackIds(JSON.parse(savedLiked));
      
      // 2. Load Persistent Tracks Metadata and Blobs
      const savedMetadata = localStorage.getItem(STORAGE_KEYS.TRACKS_METADATA);
      if (savedMetadata) {
        const metadata: any[] = JSON.parse(savedMetadata);
        const loadedTracks: Track[] = await Promise.all(
          metadata.map(async (m) => {
            const file = await getTrackContent(m.id);
            const url = file ? URL.createObjectURL(file) : '';
            return { ...m, file, url };
          })
        );
        // Filter out tracks that failed to load their file content
        setTracksState(loadedTracks.filter(t => t.url));
      }
    };
    
    loadData();

    // 3. Cleanup: Automatically revoke blob URLs on tab close
    const handleBeforeUnload = () => {
      tracksRef.current.forEach(track => {
        if (track.url.startsWith('blob:')) {
          URL.revokeObjectURL(track.url);
        }
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const setTracks = (newTracks: Track[]) => {
    setTracksState(newTracks);
  };

  /**
   * Save tracks to database (stores locally, ready to sync to Prisma when server is available)
   */
  const saveTracksToDB = async (tracksToSave: Track[]) => {
    const newlySaved: Track[] = [];
    const userId = getUserId();

    for (const track of tracksToSave) {
      try {
        if (!track.file) continue;

        // 1. Save file to IndexedDB for local storage
        await saveTrackContent(track.id, track.file);

        // 2. Prepare metadata for database (stored in localStorage with a flag)
        const audioMetadata = {
          id: track.id,
          name: track.name,
          artist: track.artist || null,
          album: track.album || null,
          duration: track.duration ? Math.round(track.duration) : null,
          filePath: track.file.name,
          fileSize: track.file.size,
          mimeType: track.file.type,
          userId: userId,
          url: track.url, // Keep blob URL for now
          synced: false, // Flag to indicate if synced to database
          createdAt: new Date().toISOString(),
        };

        // 3. Store in localStorage with a special key for pending database sync
        const pendingSync = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_SYNC) || '[]');
        pendingSync.push(audioMetadata);
        localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(pendingSync));

        // 4. Keep the track as is (it already has a blob URL)
        newlySaved.push(track);
        toast.success(`Saved "${track.name}" locally. Will sync to database when server is available.`);

      } catch (error: any) {
        console.error('Error saving track:', error);
        toast.error(`Failed to save "${track.name}": ${error.message}`);
      }
    }
    
    if (newlySaved.length > 0) {
      setTracksState(currentTracks => {
        const updatedTracks = [...currentTracks, ...newlySaved];
        
        // Save metadata to localStorage
        const metadata = updatedTracks.map(({ id, name, artist, album, duration }) => ({
          id, name, artist, album, duration
        }));
        localStorage.setItem(STORAGE_KEYS.TRACKS_METADATA, JSON.stringify(metadata));
        
        return updatedTracks;
      });
    }

    // 5. Try to sync to database if server is available (non-blocking)
    syncToDatabase().catch(err => {
      console.log('Database sync not available:', err.message);
    });
  };

  /**
   * Sync pending tracks to database (called automatically or manually)
   */
  const syncToDatabase = async () => {
    const pendingSync = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_SYNC) || '[]');
    if (pendingSync.length === 0) return;

    const synced: string[] = [];
    const failed: any[] = [];

    for (const metadata of pendingSync) {
      if (metadata.synced) continue; // Already synced

      try {
        // Get the file from IndexedDB
        const file = await getTrackContent(metadata.id);
        if (!file) {
          console.warn(`File not found for ${metadata.id}, skipping sync`);
          continue;
        }

        // Upload to server
        const formData = new FormData();
        formData.append('file', file);
        formData.append('id', metadata.id);
        formData.append('name', metadata.name);
        formData.append('artist', metadata.artist || '');
        formData.append('album', metadata.album || '');
        formData.append('duration', metadata.duration?.toString() || '0');
        formData.append('userId', metadata.userId);

        const apiUrl = `${API_BASE_URL}/api/audio`;
        const response = await fetch(apiUrl, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const savedAudio = await response.json();
          metadata.synced = true;
          metadata.dbId = savedAudio.id;
          metadata.dbUrl = savedAudio.url;
          synced.push(metadata.id);
        } else {
          failed.push(metadata);
        }
      } catch (error: any) {
        console.error(`Failed to sync ${metadata.id}:`, error);
        failed.push(metadata);
      }
    }

    // Update localStorage with sync status
    const remaining = [...failed, ...pendingSync.filter((m: any) => !synced.includes(m.id) && !m.synced)];
    localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(remaining));

    if (synced.length > 0) {
      console.log(`Successfully synced ${synced.length} track(s) to database`);
      toast.success(`Synced ${synced.length} track(s) to database`);
    }
  };

  const deleteTrack = async (track: Track) => {
    // 1. Remove from state
    setTracksState(currentTracks => {
      const newTracks = currentTracks.filter(t => t.id !== track.id);
      
      // 2. Update Metadata
      const metadata = newTracks.map(({ id, name, artist, album, duration }) => ({
        id, name, artist, album, duration
      }));
      localStorage.setItem(STORAGE_KEYS.TRACKS_METADATA, JSON.stringify(metadata));
      
      return newTracks;
    });

    // 3. Remove from IndexedDB
    await deleteTrackContent(track.id);
    
    // 4. Remove from liked
    if (likedTrackIds.includes(track.id)) {
      const newLikedIds = likedTrackIds.filter(id => id !== track.id);
      setLikedTrackIds(newLikedIds);
      localStorage.setItem(STORAGE_KEYS.LIKED, JSON.stringify(newLikedIds));
    }
    
    // 5. Remove from playlists
    const updatedPlaylists = playlists.map(playlist => ({
      ...playlist,
      trackIds: playlist.trackIds.filter(id => id !== track.id)
    }));
    setPlaylistsState(updatedPlaylists);
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(updatedPlaylists));
    
    // 6. Cleanup blob URL
    if (track.url.startsWith('blob:')) {
      URL.revokeObjectURL(track.url);
    }
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
    saveTracksToDB,
    deleteTrack,
    playlists,
    setPlaylists,
    likedTracks,
    toggleLike,
    syncToDatabase, // Expose sync function for manual sync
  };
};
