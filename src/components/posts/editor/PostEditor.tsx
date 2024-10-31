"use client";

// ! More on TipTap: https://tiptap.dev/docs/editor/getting-started/install/react
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useSession } from "@/app/(main)/SessionProvider";
import UserAvatar from "@/components/UserAvatar";
import "./styles.css";
import { usePostSubmitMutation } from "./mutations";
import LoadingButton from "@/components/LoadingButton";
import useMediaUploads from "./useMediaUploads";
import AttachmentHandler from "./Attachments/Handler";
import AttachmentPreview from "./Attachments/Previews";
import { Loader2 } from "lucide-react";
import { useDropzone } from "@uploadthing/react";
import { cn } from "@/lib/utils";

// Read the docs from the link mentioned above to understand the code below...
export default function PostEditor() {
  // Component Utils ---> START
  const { user } = useSession();

  const editor = useEditor({
    // You can add as many extensions as you want here. Checkout the official docs for more info.
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      //   Needs some CSS to be able to display this as well. Checkout styles.css in this folder.
      Placeholder.configure({
        placeholder: "Tell the world your pissing experience...",
      }),
    ],
  });

  const content =
    editor?.getText({
      blockSeparator: "\n",
    }) || "";

  const createPostMutation = usePostSubmitMutation();

  const {
    startUpload,
    attachments,
    isUploading,
    uploadProgress,
    removeAttachment,
    reset: resetMediaUploads,
  } = useMediaUploads();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: startUpload,
  });

  /**
   * The omClick helps us to handle the click event on the Editor.
   * Ideally we don't want to trigger file upload when the user clicks
   * on the editor.
   */
  const { onClick, ...rootProps } = getRootProps();
  // Component Utils ---> END

  // Misc Helpers ---> START
  function onSubmit() {
    createPostMutation.mutate(
      {
        content,
        mediaIds: attachments
          .filter(Boolean)
          .map((attachment) => attachment.mediaId) as string[],
      },
      {
        /*
         * This is different from the `onSuccess` in the mutation hook. This is a callback
         * that is called after the mutation is successful. We would often need to do something
         * at the component level after the mutation is successful. This is where this callback
         * comes in. This is an extra callback react-query provides.
         */
        onSuccess: () => {
          // Clear the editor content after submitting the post
          editor?.commands.clearContent();

          // Clear the attachments state after submitting the post
          resetMediaUploads();
        },
      }
    );
  }

  /**
   * The following function allows user to copy some images and paste them directly
   * on the editor. This would be a cherry on top for the drag and drop feature.
   */
  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    const files = Array.from(event.clipboardData?.items || [])
      .slice(0, 5) // Since we only allow 5 attachments
      .filter((item) => item.kind === "file") // We only care about files
      .map((item) => item.getAsFile()) as File[];

    startUpload(files);
  }

  // Misc Helpers ---> END

  return (
    <div className="flex flex-col gap-5 rounded-xl bg-card p-5 shadow-sm">
      <div className="flex gap-5">
        <UserAvatar avatarUrl={user.avatarUrl} className="hidden sm:inline" />

        <div {...rootProps} className="w-full">
          <EditorContent
            editor={editor}
            /**
             * cn is also extremely helpful if you want to style a component based on some conditions.
             */
            className={cn(
              "w-full max-h-[20rem] overflow-y-auto bg-background rounded-2xl px-5 py-3",
              isDragActive && "outline-dashed text-primary"
            )}
            onPaste={handlePaste}
          />

          {/* No need to add any extra config, because the getInputProps() from uploadthing has it all to support drag and drop */}
          <input {...getInputProps()} />
        </div>
      </div>

      {/* Preview of Attachments --> START */}
      {!!attachments.length && (
        <AttachmentPreview
          attachments={attachments}
          removeAttachment={removeAttachment}
        />
      )}
      {/* Preview of Attachments --> END */}

      <div className="flex justify-end items-center gap-3">
        {isUploading && (
          <>
            <span className="text-sm">{uploadProgress ?? 0}%</span>
            <Loader2 className="size-5 animate-spin text-primary" />
          </>
        )}
        <AttachmentHandler
          onFilesSelected={startUpload}
          disabled={isUploading || attachments.length >= 5}
        />
        <LoadingButton
          loading={createPostMutation.isPending}
          onClick={onSubmit}
          disabled={!content || isUploading}
          className="min-w-20"
        >
          Piss around
        </LoadingButton>
      </div>
    </div>
  );
}
