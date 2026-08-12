"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import { addFavorite, removeFavorite } from "@/lib/api/favorites";
import type { FavoriteTargetType } from "@/types/favorite";
import { cn } from "@/lib/utils/cn";
import { ApiClientError } from "@/lib/api/client";

type FavoriteButtonProps = {
  targetType: FavoriteTargetType;
  targetId: string | number;
  className?: string;
  /** Icon-only control (e.g. product title row). */
  iconOnly?: boolean;
};

/** Shell + optimistic toggle - requires auth; graceful when API is unavailable. */
const FavoriteButton = ({
  targetType,
  targetId,
  className,
  iconOnly = false,
}: FavoriteButtonProps) => {
  const { isAuthenticated, loading } = useAuth();
  const { openAuth } = useAuthModal();
  const [active, setActive] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!loading && !isAuthenticated) {
    return (
      <Button
        type="button"
        variant="outline"
        size={iconOnly ? "icon" : "sm"}
        className={className}
        aria-label="Yêu thích"
        onClick={() => openAuth("login")}
      >
        <Heart className="size-4" aria-hidden />
        {iconOnly ? null : "Yêu thích"}
      </Button>
    );
  }

  const onToggle = async () => {
    if (pending) return;
    setPending(true);
    setMessage(null);
    const next = !active;
    setActive(next);
    try {
      if (next) {
        await addFavorite({ targetType, targetId });
      } else {
        await removeFavorite({ targetType, targetId });
      }
    } catch (error) {
      setActive(!next);
      const msg =
        error instanceof ApiClientError
          ? error.message
          : "Không thể cập nhật yêu thích. Thử lại sau.";
      setMessage(msg);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={cn("inline-flex flex-col items-start gap-1", className)}>
      <Button
        type="button"
        variant={active ? "primary" : "outline"}
        size={iconOnly ? "icon" : "sm"}
        disabled={pending || loading}
        onClick={() => void onToggle()}
        aria-pressed={active}
        aria-label={active ? "Đã lưu yêu thích" : "Yêu thích"}
      >
        <Heart className={cn("size-4", active && "fill-current")} aria-hidden />
        {iconOnly ? null : active ? "Đã lưu" : "Yêu thích"}
      </Button>
      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
    </div>
  );
};

export default FavoriteButton;
