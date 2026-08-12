"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import { addReaction, removeReaction } from "@/lib/api/reactions";
import type { ReactionTargetType, ReactionType } from "@/types/reaction";
import { cn } from "@/lib/utils/cn";

const REACTIONS: { type: ReactionType; label: string }[] = [
  { type: "LIKE", label: "Thích" },
  { type: "LOVE", label: "Yêu" },
  { type: "HAHA", label: "Haha" },
];

type ReactionsBarProps = {
  targetType: ReactionTargetType;
  targetId: string | number;
  className?: string;
  variant?: "default" | "compact";
};

/** Reaction shell - toggles via API when authenticated. */
const ReactionsBar = ({
  targetType,
  targetId,
  className,
  variant = "default",
}: ReactionsBarProps) => {
  const { isAuthenticated, loading } = useAuth();
  const { openAuth } = useAuthModal();
  const [active, setActive] = useState<ReactionType | null>(null);
  const [pending, setPending] = useState(false);

  if (!loading && !isAuthenticated) {
    if (variant === "compact") {
      return (
        <div className={cn("text-xs text-muted-foreground", className)}>
          <button
            type="button"
            className="font-medium text-[#1565c0] hover:underline dark:text-[#64b5f6]"
            onClick={() => openAuth("login")}
          >
            Đăng nhập
          </button>{" "}
          để thích bài viết
        </div>
      );
    }
    return (
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        <span className="text-xs text-muted-foreground">Phản ứng:</span>
        <button
          type="button"
          className="text-xs font-medium text-primary hover:underline"
          onClick={() => openAuth("login")}
        >
          Đăng nhập để bày tỏ cảm xúc
        </button>
      </div>
    );
  }

  const onReact = async (type: ReactionType) => {
    if (pending) return;
    setPending(true);
    const prev = active;
    try {
      if (prev === type) {
        setActive(null);
        await removeReaction({ targetType, targetId, reactionType: type });
      } else {
        setActive(type);
        if (prev) {
          await removeReaction({ targetType, targetId, reactionType: prev }).catch(() => undefined);
        }
        await addReaction({ targetType, targetId, reactionType: type });
      }
    } catch {
      setActive(prev);
    } finally {
      setPending(false);
    }
  };

  if (variant === "compact") {
    return (
      <div
        className={cn("flex flex-wrap items-center gap-3", className)}
        role="group"
        aria-label="Phản ứng"
      >
        {REACTIONS.map((item) => (
          <button
            key={item.type}
            type="button"
            disabled={pending || loading}
            aria-pressed={active === item.type}
            className={cn(
              "text-xs font-medium transition-colors disabled:opacity-50",
              active === item.type
                ? "text-primary"
                : "text-[#1565c0] hover:underline dark:text-[#64b5f6]",
            )}
            onClick={() => void onReact(item.type)}
          >
            {item.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)} role="group" aria-label="Phản ứng">
      {REACTIONS.map((item) => (
        <Button
          key={item.type}
          type="button"
          size="sm"
          variant={active === item.type ? "primary" : "outline"}
          disabled={pending || loading}
          aria-pressed={active === item.type}
          onClick={() => void onReact(item.type)}
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
};

export default ReactionsBar;
