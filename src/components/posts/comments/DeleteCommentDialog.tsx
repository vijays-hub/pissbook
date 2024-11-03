import { CommentData } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteCommentMutation } from "./mutations";
import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";

interface DeleteCommentDialogConfig {
  comment: CommentData;
  open: boolean;
  onClose: () => void;
}

export default function DeleteCommentDialog({
  comment,
  open,
  onClose,
}: DeleteCommentDialogConfig) {
  const mutation = useDeleteCommentMutation();

  function handleOpenChange(open: boolean) {
    if (!open || !mutation.isPending) {
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete opinion?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this opinion? This might have been
            your best work yet.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Let it be
          </Button>
          <LoadingButton
            variant="destructive"
            onClick={() => mutation.mutate(comment.id, { onSuccess: onClose })}
            loading={mutation.isPending}
          >
            Yeah!
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
