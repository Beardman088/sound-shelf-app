import { Track } from "@/types/music";
import { Button } from "@/components/ui/button";
import { Play, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrackListProps {
  tracks: Track[];
  onPlayTrack: (track: Track) => void;
  onToggleLike: (track: Track) => void;
  likedTrackIds: string[];
}

export const TrackList = ({ tracks, onPlayTrack, onToggleLike, likedTrackIds }: TrackListProps) => {
  if (tracks.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">No tracks yet. Import some music to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tracks.map((track) => (
        <div
          key={track.id}
          className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
        >
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onPlayTrack(track)}
            className="shrink-0"
          >
            <Play className="h-4 w-4" />
          </Button>
          
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{track.name}</p>
            {track.artist && (
              <p className="truncate text-sm text-muted-foreground">{track.artist}</p>
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
        </div>
      ))}
    </div>
  );
};
