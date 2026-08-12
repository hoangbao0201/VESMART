import { ArrowRight } from "lucide-react";
import Container from "@/components/ui/Container";
import { SITE_CONFIG } from "@/configs/site.config";
import MapEmbedFacade from "./MapEmbedFacade";

const MapSection = () => {
  return (
    <section className="py-12 sm:py-16" aria-labelledby="map-heading">
      <Container>
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-2">
            <h2 id="map-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
              Bản đồ
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">{SITE_CONFIG.address}</p>
          </div>
          <a
            href={SITE_CONFIG.mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:opacity-80"
          >
            Mở Google Map
            <ArrowRight className="size-4" aria-hidden />
          </a>
        </div>
        <MapEmbedFacade
          embedUrl={SITE_CONFIG.mapsEmbed}
          mapsLink={SITE_CONFIG.mapsLink}
          title={`Vị trí ${SITE_CONFIG.name} trên Google Map`}
          address={SITE_CONFIG.address}
        />
      </Container>
    </section>
  );
};

export default MapSection;
