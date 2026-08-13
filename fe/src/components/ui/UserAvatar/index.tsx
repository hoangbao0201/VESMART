import Image from "next/image";
import { cn } from "@/lib/utils/cn";

type UserAvatarProps = {
  username: string;
  avatar?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Stable key for background color (e.g. username) so each person looks distinct. */
  colorKey?: string;
};

const sizeMap = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-16 text-lg",
} as const;

const AVATAR_PALETTE = [
  "#e17076",
  "#7bc862",
  "#e5b567",
  "#65aadd",
  "#a695e7",
  "#ee7aae",
  "#6ec9cb",
  "#faa774",
] as const;

function colorFromKey(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

const UserAvatar = ({
  username,
  avatar,
  size = "sm",
  className,
  colorKey,
}: UserAvatarProps) => {
  const label = username.trim() || "?";
  const initial = initialsFromName(label);
  const bg = colorFromKey(colorKey?.trim() || label);

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-white",
        sizeMap[size],
        className,
      )}
      style={avatar ? undefined : { backgroundColor: bg }}
      aria-hidden={!avatar}
    >
      {avatar ? (
        <Image src={avatar} alt="" fill className="object-cover" sizes="40px" />
      ) : (
        <span aria-hidden>{initial}</span>
      )}
      <span className="sr-only">{label}</span>
    </span>
  );
};

export default UserAvatar;
