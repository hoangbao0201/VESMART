"use client";

import dynamic from "next/dynamic";
import type { TargetType } from "@/types/comment";

const CommentsSection = dynamic(() => import("./index"), {
  ssr: false,
  loading: () => (
    <div className="rounded-[12px] border border-border bg-secondary/40 px-4 py-8 text-sm text-muted-foreground">
      Đang tải bình luận…
    </div>
  ),
});

type DeferredCommentsSectionProps = {
  targetType: Extract<TargetType, "PRODUCT" | "POST">;
  targetId: string | number;
};

const DeferredCommentsSection = (props: DeferredCommentsSectionProps) => {
  return <CommentsSection {...props} />;
};

export default DeferredCommentsSection;
