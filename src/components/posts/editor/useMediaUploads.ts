/**
 * Custom hook for handling the media uploads against a post. This hook is used in the
 * PostEditor component to upload the media files (images, videos, etc.) to the server.
 *
 * Has all the necessary functions to upload the media files, remove the uploaded files,
 * and reset the state once the upload is complete.
 */

import { toast } from "@/hooks/use-toast";
import { useUploadThing } from "@/lib/uploadthing";
import { useState } from "react";

export interface Attachment {
  file: File;
  mediaId?: string; // Since we get the mediaId only after the upload is complete!
  isUploading: boolean;
}

export default function useMediaUploads() {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>();

  const { startUpload, isUploading } = useUploadThing(
    "postAttachmentUploader",
    {
      // Overriding the uploadthing function
      onBeforeUploadBegin: (files) => {
        /**
         * Triggered before the upload begins. This is a good place to prepare the state.
         *
         * We need to:
         * 1. Rename the files
         *      Why?
         *      Once the upload is done and we get the mediaId, it would be easier to identify
         *      the corresponding attachment again, because the file doesn't have a uniqueId now.
         *      So, we can create a unique name instead to recognize the corresponding attachment.
         * 2. Set them to attachments state
         */

        const renamedFiles = files.map((file) => {
          const extension = file.name.split(".").pop();
          return new File(
            [file],
            `attachment_${crypto.randomUUID()}.${extension}`,
            {
              type: file.type,
            }
          );
        });

        setAttachments((prevAttachments) => [
          ...prevAttachments,
          ...renamedFiles.map((file) => ({
            file,
            isUploading: true,
          })),
        ]);

        return renamedFiles;
      },
      onUploadProgress: setUploadProgress,
      onClientUploadComplete: (response) => {
        /**
         * Hover over the response to check the structure of the response. This would be whatever
         * we have setup in the uploadthing file router.
         *
         * Now that the upload is complete, we need to update the attachments state with the
         * mediaId for the corresponding attachment. This is where the renamed file name comes in
         * handy. We already have this in the attachments state. So we just need to filter it out
         * against the response.
         */
        setAttachments((prevAttachments) => {
          return prevAttachments.map((attachment) => {
            const uploadedFile = response.find(
              (file) => file.name === attachment.file.name
            );

            if (!uploadedFile) return attachment;

            return {
              ...attachment,
              mediaId: uploadedFile.serverData.mediaId,
              isUploading: false,
            };
          });
        });
      },
      onUploadError: (error) => {
        /**
         * When an upload fails, we would need to remove the corresponding attachment from the
         * attachments state. This is because the upload has failed and we don't have the mediaId
         * for this attachment. So, we can't use it in the post.
         *
         * But how do we know which attachment has failed? This is where the isUploading flag comes
         * in handy. We can filter out the attachments that are still uploading and remove them, because
         * the ones that are not uploading are already uploaded successfully.
         */
        setAttachments((prevAttachments) =>
          prevAttachments.filter((attachment) => attachment.isUploading)
        );

        toast({
          variant: "destructive",
          description: error.message,
        });
      },
    }
  );

  /**
   * The upload progress might misbehave if we allow multiple uploads at the same time. So, we
   * need to make sure that we are allowing only one upload at a time. This means that if there
   * are 3 files to upload against a post, we wait until all the 3 files are uploaded, before we
   * allow the user to upload more files. The following function takes care of this.
   *
   * Along with this, we also need to make sure that the user is not trying to upload more than
   * 5 attachments at a time. This is because we have a limit of 5 attachments per post. If you
   * need to change this in the future, make sure you update the backend (file router) as well.
   */
  function handleStartUpload(files: Array<File>) {
    if (isUploading) {
      toast({
        variant: "destructive",
        description: "Please wait until the current upload is complete",
      });
      return;
    }

    if (attachments.length + files.length > 5) {
      toast({
        variant: "destructive",
        description: "You can only upload 5 attachments at a time",
      });
      return;
    }

    startUpload(files);
  }

  /**
   * We would also need the ability to remove an attachment from the attachments state. This is
   * because the user might want to remove an attachment that they have uploaded by mistake.
   */
  function removeAttachment(fileName: string) {
    setAttachments((prevAttachments) =>
      prevAttachments.filter((attachment) => attachment.file.name !== fileName)
    );
  }

  /**
   * Once the upload is complete, we need to reset the attachments state. This is because we
   * don't want to show the uploaded attachments in the editor anymore.
   */
  function reset() {
    setAttachments([]);
    setUploadProgress(undefined);
  }

  return {
    startUpload: handleStartUpload,
    attachments,
    isUploading,
    uploadProgress,
    removeAttachment,
    reset,
  };
}
