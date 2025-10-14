import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { Track } from "@/types/music";
import { toast } from "sonner";

interface FileUploadProps {
  onFilesSelected: (tracks: Track[]) => void;
}

export const FileUpload = ({ onFilesSelected }: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const audioFiles = Array.from(files).filter(file => 
      file.type.startsWith('audio/')
    );

    if (audioFiles.length === 0) {
      toast.error("No audio files found");
      return;
    }

    const tracks: Track[] = await Promise.all(
      audioFiles.map(async (file) => {
        const url = URL.createObjectURL(file);
        
        // Extract basic metadata from filename
        const nameParts = file.name.replace(/\.[^/.]+$/, "").split(' - ');
        const artist = nameParts.length > 1 ? nameParts[0] : undefined;
        const name = nameParts.length > 1 ? nameParts.slice(1).join(' - ') : nameParts[0];

        return {
          id: `${file.name}-${file.lastModified}`,
          name,
          artist,
          url,
          file,
        };
      })
    );

    onFilesSelected(tracks);
    toast.success(`${tracks.length} track${tracks.length > 1 ? 's' : ''} added`);
  };

  return (
    <div className="rounded-lg border-2 border-dashed border-border bg-card p-8 text-center">
      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">Import Your Music</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Select audio files from your device to start playing
      </p>
      <Button onClick={() => fileInputRef.current?.click()} className="mt-4">
        Select Audio Files
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
