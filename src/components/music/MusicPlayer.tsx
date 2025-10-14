import { useEffect, useRef, useState } from "react";
import { Track, RepeatMode } from "@/types/music";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Heart, Repeat, Repeat1, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MusicPlayerProps {
  track: Track;
  playlist: Track[];
  onTrackChange: (track: Track) => void;
  onToggleLike: (track: Track) => void;
  isLiked: boolean;
}

export const MusicPlayer = ({ track, playlist, onTrackChange, onToggleLike, isLiked }: MusicPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [shuffleMode, setShuffleMode] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = track.url;
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [track]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleEnded = () => {
    if (repeatMode === 'one') {
      audioRef.current?.play();
    } else {
      handleNext();
    }
  };

  const handleNext = () => {
    const currentIndex = playlist.findIndex(t => t.id === track.id);
    let nextIndex: number;

    if (shuffleMode) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= playlist.length) {
        nextIndex = repeatMode === 'all' ? 0 : currentIndex;
      }
    }

    if (nextIndex !== currentIndex) {
      onTrackChange(playlist[nextIndex]);
    }
  };

  const handlePrevious = () => {
    if (currentTime > 3) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    } else {
      const currentIndex = playlist.findIndex(t => t.id === track.id);
      const prevIndex = currentIndex - 1;
      if (prevIndex >= 0) {
        onTrackChange(playlist[prevIndex]);
      }
    }
  };

  const cycleRepeatMode = () => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    setRepeatMode(modes[(currentIndex + 1) % modes.length]);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-card p-4">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <div className="container mx-auto">
        <div className="mb-2 flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{track.name}</p>
            {track.artist && (
              <p className="truncate text-sm text-muted-foreground">{track.artist}</p>
            )}
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onToggleLike(track)}
          >
            <Heart
              className={cn("h-5 w-5", isLiked && "fill-red-500 text-red-500")}
            />
          </Button>
        </div>

        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{formatTime(currentTime)}</span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground">{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShuffleMode(!shuffleMode)}
            className={cn(shuffleMode && "text-primary")}
          >
            <Shuffle className="h-4 w-4" />
          </Button>

          <Button size="icon" variant="ghost" onClick={handlePrevious}>
            <SkipBack className="h-5 w-5" />
          </Button>

          <Button size="icon" onClick={togglePlayPause}>
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>

          <Button size="icon" variant="ghost" onClick={handleNext}>
            <SkipForward className="h-5 w-5" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={cycleRepeatMode}
            className={cn(repeatMode !== 'off' && "text-primary")}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="h-4 w-4" />
            ) : (
              <Repeat className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
