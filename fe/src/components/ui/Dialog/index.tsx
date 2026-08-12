"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  className,
  children,
  title,
}: {
  className?: string;
  children: ReactNode;
  title?: string;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in" />
      <DialogPrimitive.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-[min(560px,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[12px] border border-border bg-card p-5 shadow-sm outline-none",
          className,
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          {title ? (
            <DialogPrimitive.Title className="text-base font-semibold">{title}</DialogPrimitive.Title>
          ) : (
            <span />
          )}
          <DialogPrimitive.Close
            className="rounded-[12px] p-1 text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-foreground"
            aria-label="Đóng"
          >
            <X className="size-4" />
          </DialogPrimitive.Close>
        </div>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
