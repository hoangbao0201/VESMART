import Image from "next/image";
import { cn } from "@/lib/utils/cn";

type UserAvatarProps = {
  username: string;
  avatar?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-16 text-lg",
} as const;

const UserAvatar = ({ username, avatar, size = "sm", className }: UserAvatarProps) => {
  const initial = username.trim().charAt(0).toUpperCase() || "?";

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary font-semibold text-secondary-foreground",
        sizeMap[size],
        className,
      )}
      aria-hidden={!avatar}
    >
      {avatar ? (
        <Image src={avatar} alt="" fill className="object-cover" sizes="40px" />
      ) : (
        <span aria-hidden>{initial}</span>
      )}
      <span className="sr-only">{username}</span>
    </span>
  );
};

export default UserAvatar;
