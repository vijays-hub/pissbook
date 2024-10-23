"use client";

// ! More on TipTap: https://tiptap.dev/docs/editor/getting-started/install/react
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { createPost } from "./actions";
import { useSession } from "@/app/(main)/SessionProvider";
import UserAvatar from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import "./styles.css";

// Read the docs from the link mentioned above to understand the code below...
export default function PostEditor() {
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

  async function onSubmit() {
    // Call the server action to create a post
    await createPost({ content });

    // Clear the editor content after submitting the post
    editor?.commands.clearContent();
  }

  return (
    <div className="flex flex-col gap-5 rounded-xl bg-card p-5 shadow-sm">
      <div className="flex gap-5">
        <UserAvatar avatarUrl={user.avatarUrl} className="hidden sm:inline" />

        <EditorContent
          editor={editor}
          className="w-full min-h-[5rem] max-h-[20rem] overflow-y-auto bg-background rounded-2xl px-5 py-3"
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={onSubmit} disabled={!content} className="min-w-20">
          Post
        </Button>
      </div>
    </div>
  );
}
