import { Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type SearchBarProps = {
  name?: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
};

/** Server-friendly search input for GET forms. */
const SearchBar = ({
  name = "q",
  defaultValue,
  placeholder = "Tìm kiếm…",
  className,
  "aria-label": ariaLabel = "Tìm kiếm",
}: SearchBarProps) => {
  return (
    <label className={cn("relative block w-full", className)}>
      <span className="sr-only">{ariaLabel}</span>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <input
        type="search"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-11 w-full rounded-[12px] border border-input bg-card pr-3 pl-10 text-sm text-foreground transition-colors duration-150 placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      />
    </label>
  );
};

export default SearchBar;
