import { PostData } from "@/lib/types";
import { Loader2, SendHorizonal } from "lucide-react";
import { useState } from "react";
import { useSubmitCommentMutation } from "./mutations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CommentInput({ post }: { post: PostData }) {
  const [comment, setComment] = useState("");

  const mutation = useSubmitCommentMutation(post.id);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!comment) return;

    mutation.mutate(
      {
        post,
        content: comment,
      },
      {
        onSuccess: () => setComment(""),
      }
    );
  }

  return (
    <form className="flex w-full items-center gap-2" onSubmit={onSubmit}>
      <Input
        placeholder="What do you think?"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        autoFocus
      />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        disabled={!comment.trim() || mutation.isPending}
      >
        {!mutation.isPending ? (
          <SendHorizonal />
        ) : (
          <Loader2 className="animate-spin" />
        )}
      </Button>
    </form>
  );
}
