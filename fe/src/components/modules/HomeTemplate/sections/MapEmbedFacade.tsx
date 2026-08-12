"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

type MapEmbedFacadeProps = {
  embedUrl: string;
  mapsLink: string;
  title: string;
  address: string;
};

/** Defer Google Maps iframe until in-view or user click - cuts mobile TBT. */
const MapEmbedFacade = ({
  embedUrl,
  mapsLink,
  title,
  address,
}: MapEmbedFacadeProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (active) return;
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setActive(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px", threshold: 0.01 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [active]);

  return (
    <div
      ref={rootRef}
      className="overflow-hidden rounded-[12px] border border-border bg-card shadow-sm"
    >
      {active ? (
        <iframe
          src={embedUrl}
          width="100%"
          height="450"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={title}
          className="block min-h-[320px] w-full border-0 sm:min-h-[450px]"
        />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          className="flex min-h-[320px] w-full flex-col items-center justify-center gap-3 bg-secondary/60 px-4 py-10 text-center transition-colors hover:bg-secondary sm:min-h-[450px]"
          aria-label="Tải bản đồ Google Maps"
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MapPin className="size-6" aria-hidden />
          </span>
          <span className="text-sm font-semibold text-foreground">Xem bản đồ</span>
          <span className="max-w-md text-xs text-muted-foreground">{address}</span>
          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-primary underline-offset-2 hover:underline"
            onClick={(event) => event.stopPropagation()}
          >
            Mở trong Google Maps
          </a>
        </button>
      )}
    </div>
  );
};

export default MapEmbedFacade;
