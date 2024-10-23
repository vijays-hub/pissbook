import Image from "next/image";
import avatarPlaceholder from "@/assets/avatar-placeholder.png";
import { cn } from "@/lib/utils";

interface UserAvatarConfig {
  className?: string;
  size?: number;
  avatarUrl: string | null | undefined;
}

export default function UserAvatar({
  className,
  size = 48,
  avatarUrl,
}: UserAvatarConfig) {
  return (
    <Image
      src={avatarUrl || avatarPlaceholder}
      alt="User Avatar"
      width={size}
      height={size}
      /**
       *
       * ! HOVER ON EACH CLASSNAMES TO SEE THE ACTUAL CSS
       * Here, aspect-square means that the width and height of the image will be the same.
       * ie., aspect-ratio: 1 / 1;
       * more on aspect ratio:
       * 1. https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio
       * 2. https://tailwindcss.com/docs/aspect-ratio#browser-support
       *
       * flex-none to prevent a flex item from growing or shrinking.
       *
       * h-fit -> height: fit-content;
       */
      className={cn(
        "aspect-square h-fit flex-none rounded-full bg-secondary object-cover",
        className
      )}
    />
  );
}
