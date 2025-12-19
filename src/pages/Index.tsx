import { useState } from "react";
import { FileUpload } from "@/components/music/FileUpload";
import { MusicPlayer } from "@/components/music/MusicPlayer";
import { TrackList } from "@/components/music/TrackList";
import { Playlists } from "@/components/music/Playlists";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music, Heart, ListMusic } from "lucide-react";
import { Track, Playlist } from "@/types/music";
import { useMusicStorage } from "@/hooks/useMusicStorage";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Index = () => {
  const { tracks, setTracks, saveTracksToDB, deleteTrack, playlists, setPlaylists, likedTracks, toggleLike } = useMusicStorage();
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState<Track[]>([]);
  const [pendingTracks, setPendingTracks] = useState<Track[]>([]);
  const [showStoreDialog, setShowStoreDialog] = useState(false);

  const handleFilesSelected = (newTracks: Track[]) => {
    setPendingTracks(newTracks);
    setShowStoreDialog(true);
  };

  const handleStoreChoice = async (persistent: boolean) => {
    if (persistent) {
      await saveTracksToDB(pendingTracks);
    } else {
      setTracks([...tracks, ...pendingTracks]);
    }
    setPendingTracks([]);
    setShowStoreDialog(false);
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
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <header className="sticky top-0 z-50 border-b-4 border-black bg-white px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="rounded-full border-2 border-black p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white md:p-2">
              <Music className="h-4 w-4 text-black md:h-6 md:w-6" />
            </div>
            <h1 className="text-xl font-black text-black tracking-tight uppercase md:text-3xl">SoundShelf</h1>
          </div>
          {tracks.length > 0 && (
            <FileUpload compact onFilesSelected={handleFilesSelected} />
          )}
        </div>
      </header>

      <main className={`flex-1 overflow-auto ${currentTrack ? "pb-72" : "pb-8"}`}>
        <div className="container mx-auto p-6">
          {tracks.length === 0 && (
            <FileUpload onFilesSelected={handleFilesSelected} />
          )}

          <Tabs defaultValue="all" className="mt-6">
            <div className="flex justify-center">
              <TabsList className="flex h-auto w-fit items-center gap-[6px] rounded-[16px] border-2 border-black bg-white p-[6px]">
                <TabsTrigger
                  value="all"
                  className="flex items-center gap-2 rounded-[12px] border-none bg-transparent px-[22px] py-[10px] text-sm font-medium text-[#555] shadow-none transition-all duration-200 data-[state=active]:bg-black data-[state=active]:font-semibold data-[state=active]:text-white data-[state=active]:shadow-none"
                >
                  <Music className="h-[14px] w-[14px]" />
                  All Tracks
                </TabsTrigger>
                <TabsTrigger
                  value="liked"
                  className="flex items-center gap-2 rounded-[12px] border-none bg-transparent px-[22px] py-[10px] text-sm font-medium text-[#555] shadow-none transition-all duration-200 data-[state=active]:bg-black data-[state=active]:font-semibold data-[state=active]:text-white data-[state=active]:shadow-none"
                >
                  <Heart className="h-[14px] w-[14px]" />
                  Liked
                </TabsTrigger>
                <TabsTrigger
                  value="playlists"
                  className="flex items-center gap-2 rounded-[12px] border-none bg-transparent px-[22px] py-[10px] text-sm font-medium text-[#555] shadow-none transition-all duration-200 data-[state=active]:bg-black data-[state=active]:font-semibold data-[state=active]:text-white data-[state=active]:shadow-none"
                >
                  <ListMusic className="h-[14px] w-[14px]" />
                  Playlists
                </TabsTrigger>
              </TabsList>
            </div>

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

      <AlertDialog open={showStoreDialog} onOpenChange={setShowStoreDialog}>
        <AlertDialogContent className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black uppercase tracking-tight">Store Music Permanently?</AlertDialogTitle>
            <AlertDialogDescription className="text-lg font-medium text-black/60">
              Do you want to save these tracks to the SoundShelf database? Persistent tracks will be available every time you return. Temporary tracks will be cleared when you close the browser.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-4">
            <AlertDialogCancel
              onClick={() => handleStoreChoice(false)}
              className="border-4 border-black font-black uppercase hover:bg-black hover:text-white transition-all"
            >
              Session Only
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleStoreChoice(true)}
              className="bg-black text-white border-4 border-black font-black uppercase hover:bg-white hover:text-black transition-all"
            >
              Save to Database
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
