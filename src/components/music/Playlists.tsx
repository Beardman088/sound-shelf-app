import { useState } from "react";
import { Track, Playlist } from "@/types/music";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Music } from "lucide-react";
import { TrackList } from "./TrackList";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";

interface PlaylistsProps {
  tracks: Track[];
  playlists: Playlist[];
  onCreatePlaylist: (playlist: Playlist) => void;
  onDeletePlaylist: (playlistId: string) => void;
  onPlayTrack: (track: Track, playlist: Track[]) => void;
  onToggleLike: (track: Track) => void;
  likedTrackIds: string[];
}

export const Playlists = ({
  tracks,
  playlists,
  onCreatePlaylist,
  onDeletePlaylist,
  onPlayTrack,
  onToggleLike,
  likedTrackIds,
}: PlaylistsProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);
  const [openPlaylistId, setOpenPlaylistId] = useState<string | null>(null);

  const handleCreatePlaylist = () => {
    if (!playlistName.trim()) {
      toast.error("Please enter a playlist name");
      return;
    }
    if (selectedTrackIds.length === 0) {
      toast.error("Please select at least one track");
      return;
    }

    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name: playlistName,
      trackIds: selectedTrackIds,
      createdAt: Date.now(),
    };

    onCreatePlaylist(newPlaylist);
    toast.success(`Playlist "${playlistName}" created`);
    setPlaylistName("");
    setSelectedTrackIds([]);
    setIsDialogOpen(false);
  };

  const toggleTrackSelection = (trackId: string) => {
    setSelectedTrackIds(prev =>
      prev.includes(trackId)
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  const getPlaylistTracks = (playlist: Playlist) => {
    return tracks.filter(track => playlist.trackIds.includes(track.id));
  };

  return (
    <div className="space-y-4">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Create New Playlist
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Playlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Playlist name"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
            />
            <div className="space-y-2">
              <p className="text-sm font-medium">Select tracks:</p>
              {tracks.map((track) => (
                <div key={track.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={track.id}
                    checked={selectedTrackIds.includes(track.id)}
                    onCheckedChange={() => toggleTrackSelection(track.id)}
                  />
                  <label htmlFor={track.id} className="flex-1 cursor-pointer text-sm">
                    {track.name}
                    {track.artist && <span className="text-muted-foreground"> - {track.artist}</span>}
                  </label>
                </div>
              ))}
            </div>
            <Button onClick={handleCreatePlaylist} className="w-full">
              Create Playlist
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {playlists.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-muted-foreground">No playlists yet. Create your first playlist!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {playlists.map((playlist) => {
            const playlistTracks = getPlaylistTracks(playlist);
            return (
              <Collapsible
                key={playlist.id}
                open={openPlaylistId === playlist.id}
                onOpenChange={(open) => setOpenPlaylistId(open ? playlist.id : null)}
              >
                <div className="rounded-lg border bg-card">
                  <div className="flex items-center justify-between p-4">
                    <CollapsibleTrigger className="flex flex-1 items-center gap-3 text-left">
                      <Music className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold">{playlist.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {playlistTracks.length} track{playlistTracks.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </CollapsibleTrigger>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        onDeletePlaylist(playlist.id);
                        toast.success("Playlist deleted");
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CollapsibleContent>
                    <div className="border-t p-4">
                      <TrackList
                        tracks={playlistTracks}
                        onPlayTrack={(track) => onPlayTrack(track, playlistTracks)}
                        onToggleLike={onToggleLike}
                        likedTrackIds={likedTrackIds}
                      />
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>
      )}
    </div>
  );
};
