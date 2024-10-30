import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";
import { useRef } from "react";

interface AttachmentHandlerConfig {
  onFilesSelected: (files: Array<File>) => void;
  disabled: boolean;
}

function AttachmentHandler({
  onFilesSelected,
  disabled,
}: AttachmentHandlerConfig) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button
        variant={"ghost"}
        size={"icon"} // because we are using only an icon here
        className="hover:text-primary text-primary"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
      >
        <ImageIcon size={20} />
      </Button>

      <input
        type="file"
        ref={fileInputRef}
        // sr-only -> screen reader only
        className="hidden sr-only"
        multiple
        accept="image/* video/*"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) {
            onFilesSelected(files);
            e.target.value = ""; // Reset the input value to allow selecting the same file again
          }
        }}
      />
    </>
  );
}

export default AttachmentHandler;
