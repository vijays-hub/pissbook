import { cn } from "@/lib/utils";
import { Attachment } from "../useMediaUploads";
import Image from "next/image";
import { ImageIcon, X } from "lucide-react";

interface AttachmentPreviewConfig {
  attachments: Attachment[];
  removeAttachment: (fileName: string) => void;
}

function AttachmentPreview({
  attachments,
  removeAttachment,
}: AttachmentPreviewConfig) {
  return (
    <div className={cn("", attachments.length > 1 && "sm:grid sm:grid-cols-2")}>
      {attachments.map((attachment) => (
        <Preview
          key={attachment.file.name}
          attachment={attachment}
          onRemove={() => removeAttachment(attachment.file.name)}
        />
      ))}
    </div>
  );
}

interface PreviewConfig {
  attachment: Attachment;
  onRemove: () => void;
}

function Preview({
  attachment: { file, isUploading },
  onRemove,
}: PreviewConfig) {
  const previewURL = URL.createObjectURL(file);

  return (
    <div
      className={cn("relative mx-auto size-fit", isUploading && "opacity-50")}
    >
      {file.type.startsWith("image/") ? (
        <Image
          src={previewURL}
          alt="Attachment Preview"
          width={500}
          height={500}
          className="size-fit max-h-[30rem] rounded-2xl"
        />
      ) : (
        <video controls className="size-fit max-h-[30rem] rounded-2xl">
          <source src={previewURL} type={file.type} />
        </video>
      )}

      {!isUploading && (
        <button
          className="absolute top-3 right-3 rounded-full bg-foreground p-1.5 text-background transition-colors hover:bg-foreground/60"
          onClick={onRemove}
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
}

export default AttachmentPreview;
