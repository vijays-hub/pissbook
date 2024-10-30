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
  // Misc Helpers ---> END

  return (
    <div className="flex flex-col gap-5 rounded-xl bg-card p-5 shadow-sm">
      <div className="flex gap-5">
        <UserAvatar avatarUrl={user.avatarUrl} className="hidden sm:inline" />

        <EditorContent
          editor={editor}
          className="w-full max-h-[20rem] overflow-y-auto bg-background rounded-2xl px-5 py-3"
        />
      </div>

      {/* Preview of Attachments --> START */}
      {!!attachments.length && (
        <AttachmentPreview
          attachments={attachments}
          removeAttachment={removeAttachment}
        />
      )}
      {/* Preview of Attachments --> END */}

      <div className="flex justify-end">
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
