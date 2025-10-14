import { useState } from "react";
import { FileUpload } from "@/components/music/FileUpload";
import { MusicPlayer } from "@/components/music/MusicPlayer";
import { TrackList } from "@/components/music/TrackList";
import { Playlists } from "@/components/music/Playlists";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music, Heart, ListMusic } from "lucide-react";
import { Track, Playlist } from "@/types/music";
import { useMusicStorage } from "@/hooks/useMusicStorage";

const Index = () => {
  const { tracks, setTracks, deleteTrack, playlists, setPlaylists, likedTracks, toggleLike } = useMusicStorage();
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState<Track[]>([]);

  const handleFilesSelected = (newTracks: Track[]) => {
    setTracks([...tracks, ...newTracks]);
  };

  const handlePlayTrack = (track: Track, playlist?: Track[]) => {
    setCurrentTrack(track);
    if (playlist) {
      setCurrentPlaylist(playlist);
    } else {
      setCurrentPlaylist(tracks);
    }
  };

  const handleCreatePlaylist = (playlist: Playlist) => {
    setPlaylists([...playlists, playlist]);
  };

  const handleDeleteTrack = (track: Track) => {
    deleteTrack(track);
    // If currently playing track was deleted, stop playback
    if (currentTrack?.id === track.id) {
      setCurrentTrack(null);
    }
  };

  const handleDeletePlaylist = (playlistId: string) => {
    setPlaylists(playlists.filter(p => p.id !== playlistId));
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center gap-3">
          <Music className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">LocalMusic</h1>
        </div>
      </header>

      <main className="flex-1 overflow-auto pb-32">
        <div className="container mx-auto p-6">
          <FileUpload onFilesSelected={handleFilesSelected} />
          
          <Tabs defaultValue="all" className="mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                All Tracks
              </TabsTrigger>
              <TabsTrigger value="liked" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Liked
              </TabsTrigger>
              <TabsTrigger value="playlists" className="flex items-center gap-2">
                <ListMusic className="h-4 w-4" />
                Playlists
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <TrackList 
                tracks={tracks} 
                onPlayTrack={handlePlayTrack}
                onToggleLike={toggleLike}
                onDeleteTrack={handleDeleteTrack}
                likedTrackIds={likedTracks.map(t => t.id)}
              />
            </TabsContent>

            <TabsContent value="liked" className="mt-6">
              <TrackList 
                tracks={likedTracks} 
                onPlayTrack={handlePlayTrack}
                onToggleLike={toggleLike}
                onDeleteTrack={handleDeleteTrack}
                likedTrackIds={likedTracks.map(t => t.id)}
              />
            </TabsContent>

            <TabsContent value="playlists" className="mt-6">
              <Playlists 
                tracks={tracks}
                playlists={playlists}
                onCreatePlaylist={handleCreatePlaylist}
                onDeletePlaylist={handleDeletePlaylist}
                onPlayTrack={handlePlayTrack}
                onToggleLike={toggleLike}
                likedTrackIds={likedTracks.map(t => t.id)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {currentTrack && (
        <MusicPlayer 
          track={currentTrack} 
          playlist={currentPlaylist}
          onTrackChange={setCurrentTrack}
          onToggleLike={toggleLike}
          isLiked={likedTracks.some(t => t.id === currentTrack.id)}
        />
      )}
    </div>
  );
};

export default Index;
