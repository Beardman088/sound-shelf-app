import { Track } from "@/types/music";
import { Button } from "@/components/ui/button";
import { Play, Heart, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrackListProps {
  tracks: Track[];
  onPlayTrack: (track: Track) => void;
  onToggleLike: (track: Track) => void;
  onDeleteTrack?: (track: Track) => void;
  likedTrackIds: string[];
}

export const TrackList = ({ tracks, onPlayTrack, onToggleLike, onDeleteTrack, likedTrackIds }: TrackListProps) => {
  if (tracks.length === 0) {
    return (
      <div className="rounded-xl border-4 border-dashed border-black p-16 text-center bg-white/50">
        <p className="text-xl font-bold text-black/40 uppercase tracking-widest">No tracks yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tracks.map((track) => (
        <div
          key={track.id}
          className="group flex items-center gap-6 rounded-xl border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white"
        >
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onPlayTrack(track)}
            className="shrink-0 h-10 w-10 rounded-full border-2 border-black bg-white text-black group-hover:bg-white group-hover:text-black transition-transform hover:scale-110"
          >
            <Play className="h-4 w-4 fill-current ml-0.5" />
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
              onClick={() => onDeleteTrack(track)}
              className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 group-hover:text-white/80 group-hover:hover:text-red-400"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};
