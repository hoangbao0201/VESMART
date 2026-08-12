"use client";

import MarkdownEditor from "@/components/ui/MarkdownEditor";
import { cardClass, labelClass } from "./fieldStyles";

type DescriptionCardProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

const DescriptionCard = ({ value, onChange, disabled }: DescriptionCardProps) => {
  return (
    <section className={`${cardClass} space-y-3`}>
      <div>
        <h2 className="text-sm font-semibold">Mô tả chi tiết</h2>
        <p className={`mt-1 text-xs text-muted-foreground ${labelClass}`}>Markdown</p>
      </div>
      <div className={disabled ? "pointer-events-none opacity-60" : undefined}>
        <MarkdownEditor value={value} onChange={onChange} height={360} />
      </div>
    </section>
  );
};

export default DescriptionCard;
