"use client";

import { Button } from "@/components/ui/Button";

type StickyActionBarProps = {
  isSubmitting: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
  onDiscard: () => void;
};

const StickyActionBar = ({
  isSubmitting,
  onSaveDraft,
  onPublish,
  onDiscard,
}: StickyActionBarProps) => {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t border-border bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/80 sm:static sm:mx-0 sm:mt-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" disabled={isSubmitting} onClick={onDiscard}>
          Hủy
        </Button>
        <Button type="button" variant="secondary" disabled={isSubmitting} onClick={onSaveDraft}>
          {isSubmitting ? "Đang lưu…" : "Lưu nháp"}
        </Button>
        <Button type="button" disabled={isSubmitting} onClick={onPublish}>
          {isSubmitting ? "Đang lưu…" : "Xuất bản"}
        </Button>
      </div>
    </div>
  );
};

export default StickyActionBar;
