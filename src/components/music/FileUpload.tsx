import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { Track } from "@/types/music";
import { toast } from "sonner";

interface FileUploadProps {
  onFilesSelected: (tracks: Track[]) => void;
  compact?: boolean;
}

export const FileUpload = ({ onFilesSelected, compact }: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    const audioFiles = Array.from(files).filter(file => {
      const isAudio = file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|ogg|m4a)$|i/);
      const isUnderLimit = file.size <= MAX_FILE_SIZE;

      if (!isAudio) toast.error(`"${file.name}" is not a valid audio file`);
      if (!isUnderLimit) toast.error(`"${file.name}" exceeds 50MB limit`);

      return isAudio && isUnderLimit;
    });

    if (audioFiles.length === 0) {
      return;
    }

    const tracks: Track[] = await Promise.all(
      audioFiles.map(async (file) => {
        const url = URL.createObjectURL(file);

        // Extract duration
        const duration: number = await new Promise((resolve) => {
          const audio = new Audio();
          audio.src = url;
          audio.onloadedmetadata = () => resolve(audio.duration);
          audio.onerror = () => resolve(0);
        });

        const nameParts = file.name.replace(/\.[^/.]+$/, "").split(' - ');
        const artist = nameParts.length > 1 ? nameParts[0] : undefined;
        const name = nameParts.length > 1 ? nameParts.slice(1).join(' - ') : nameParts[0];

        return {
          id: `${file.name}-${file.lastModified}-${Math.random()}`,
          name,
          artist,
          url,
          file,
          duration,
        };
      })
    );

    onFilesSelected(tracks);
    toast.success(`${tracks.length} track${tracks.length > 1 ? 's' : ''} added`);
  };

  if (compact) {
    return (
      <>
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-black bg-white text-black hover:bg-black hover:text-white transition-all rounded-lg font-bold uppercase text-sm px-4 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Import
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </>
    );
  }

  return (
    <div className="group relative rounded-xl border-4 border-black bg-white p-6 md:p-16 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
      <div className="mb-4 md:mb-6 flex justify-center">
        <div className="rounded-full border-4 border-black bg-white p-4 md:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform group-hover:scale-110 group-hover:rotate-12">
          <Upload className="h-8 w-8 md:h-10 md:w-10 text-black stroke-[3]" />
        </div>
      </div>
      <h3 className="mt-2 md:mt-4 text-2xl md:text-4xl font-black uppercase tracking-tighter">Import Music</h3>
      <p className="mt-2 md:mt-4 text-base md:text-lg font-medium text-black/60 max-w-md mx-auto leading-relaxed">
        Drop your favorite local tracks here to start building your personal sound shelf.
      </p>
      <Button onClick={() => fileInputRef.current?.click()} className="mt-6 md:mt-8 border-4 border-black bg-black text-white text-base md:text-lg px-6 py-4 md:px-8 md:py-6 shadow-[6px_6px_0px_0px_rgba(150,150,150,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all rounded-xl font-black uppercase tracking-wider">
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
