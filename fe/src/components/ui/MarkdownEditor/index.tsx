"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { mdParser } from "@/lib/markdown";
import { cn } from "@/lib/utils/cn";
import "react-markdown-editor-lite/lib/index.css";
import "@/components/ui/MarkdownContent/markdown-content.css";
import "./markdown-editor.css";

const MdEditor = dynamic(() => import("react-markdown-editor-lite"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] items-center justify-center rounded-[12px] border border-border bg-card text-sm text-muted-foreground">
      Đang tải trình soạn thảo…
    </div>
  ),
});

const EDITOR_PLUGINS = [
  "header",
  "font-bold",
  "font-italic",
  "font-strikethrough",
  "list-unordered",
  "list-ordered",
  "block-quote",
  "block-wrap",
  "block-code-inline",
  "block-code-block",
  "table",
  "image",
  "link",
  "clear",
  "logger",
  "mode-toggle",
  "full-screen",
  "tab-insert",
] as const;

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  height?: number | string;
  id?: string;
};

const MarkdownEditor = ({
  value,
  onChange,
  placeholder = "Viết nội dung bằng Markdown…\n\n## Tiêu đề phụ\n\nĐoạn văn, **in đậm**, *nghiêng*, danh sách, bảng, ảnh…",
  className,
  height = 480,
  id,
}: MarkdownEditorProps) => {
  const style = useMemo(
    () => ({ height: typeof height === "number" ? `${height}px` : height }),
    [height],
  );

  return (
    <div className={cn("vesmart-md-editor", className)} id={id}>
      <MdEditor
        value={value}
        style={style}
        plugins={[...EDITOR_PLUGINS]}
        placeholder={placeholder}
        view={{ menu: true, md: true, html: true }}
        canView={{
          menu: true,
          md: true,
          html: true,
          fullScreen: true,
          hideMenu: false,
          both: true,
        }}
        renderHTML={(text) => mdParser.render(text)}
        onChange={({ text }) => onChange(text)}
        htmlClass="vesmart-md-content"
        markdownClass="vesmart-md-source"
      />
    </div>
  );
};

export default MarkdownEditor;
