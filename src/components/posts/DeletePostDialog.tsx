import { PostData } from "@/lib/types";
import { usePostDeleteMutation } from "./mutations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import LoadingButton from "../LoadingButton";
import { Button } from "../ui/button";

interface DeletePostDialogConfig {
  post: PostData;
  open: boolean;
  onClose: () => void;
}

export default function DeletePostDialog({
  post,
  open,
  onClose,
}: DeletePostDialogConfig) {
  const mutation = usePostDeleteMutation();

  const handleOpenChange = (open: boolean) => {
    if (!open || !mutation.isPending) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Post?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this pissing experience?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant={"outline"}
            disabled={mutation.isPending}
            onClick={onClose}
          >
            Cancel
          </Button>
          <LoadingButton
            loading={mutation.isPending}
            variant={"destructive"}
            onClick={() =>
              mutation.mutate(post.id, {
                onSuccess: () => {
                  onClose();
                },
              })
            }
          >
            Delete
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
