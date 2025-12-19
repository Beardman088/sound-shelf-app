import { useState } from "react";
import { Track } from "@/types/music";
import { Button } from "@/components/ui/button";
import { Play, Heart, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
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

interface TrackListProps {
  tracks: Track[];
  onPlayTrack: (track: Track) => void;
  onToggleLike: (track: Track) => void;
  onDeleteTrack?: (track: Track) => void;
  likedTrackIds: string[];
}

export const TrackList = ({ tracks, onPlayTrack, onToggleLike, onDeleteTrack, likedTrackIds }: TrackListProps) => {
  const [trackToDelete, setTrackToDelete] = useState<Track | null>(null);

  const handleConfirmDelete = () => {
    if (trackToDelete && onDeleteTrack) {
      onDeleteTrack(trackToDelete);
      setTrackToDelete(null);
    }
  };

  if (tracks.length === 0) {
    return (
      <div className="rounded-xl border-4 border-dashed border-black p-16 text-center bg-white/50">
        <p className="text-xl font-bold text-black/40 uppercase tracking-widest">No tracks yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {tracks.map((track) => (
          <div
            key={track.id}
            className="group flex items-center gap-3 md:gap-6 rounded-xl border-2 border-black bg-white p-3 md:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white"
          >
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onPlayTrack(track)}
              className="shrink-0 h-8 w-8 md:h-10 md:w-10 rounded-full border-2 border-black bg-white text-black group-hover:bg-white group-hover:text-black transition-transform hover:scale-110"
            >
              <Play className="h-3 w-3 md:h-4 md:w-4 fill-current ml-0.5" />
            </Button>

            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-bold group-hover:text-white">{track.name}</p>
              {track.artist && (
                <p className="truncate text-sm font-medium text-black/60 group-hover:text-white/80">{track.artist}</p>
              )}
            </div>

            <Button
              size="icon"
              variant="ghost"
              onClick={() => onToggleLike(track)}
              className="shrink-0"
            >
              <Heart
                className={cn(
                  "h-4 w-4",
                  likedTrackIds.includes(track.id) && "fill-red-500 text-red-500"
                )}
              />
            </Button>

            {onDeleteTrack && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setTrackToDelete(track)}
                className="shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:text-red-500 group-hover:text-white/80 group-hover:hover:text-red-400"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <AlertDialog open={!!trackToDelete} onOpenChange={(open) => !open && setTrackToDelete(null)}>
        <AlertDialogContent className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black uppercase tracking-tight">Delete Track?</AlertDialogTitle>
            <AlertDialogDescription className="text-lg font-medium text-black/60">
              Are you sure you want to delete "{trackToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-4">
            <AlertDialogCancel
              className="border-4 border-black font-black uppercase hover:bg-black hover:text-white transition-all"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 text-white border-4 border-black font-black uppercase hover:bg-red-600 transition-all"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
