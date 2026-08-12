import Image from "next/image";
import { Star } from "lucide-react";
import Container from "@/components/ui/Container";
import { SITE_CONFIG } from "@/configs/site.config";

const DEVICES = [
  {
    title: "Robot hút bụi",
    image: "/static/images/banners/banner-12.png",
  },
  {
    title: "Máy lau nhà cầm tay",
    image: "/static/images/banners/banner-11.png",
  },
  {
    title: "Máy hút bụi cầm tay",
    image: "/static/images/banners/banner-13.png",
  },
  {
    title: "Máy lọc không khí",
    image: "/static/images/banners/banner-14.png",
  },
] as const;

const RepairServicesSection = () => {
  return (
    <section className="bg-card py-10 sm:py-14" aria-labelledby="repair-devices-heading">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="repair-devices-heading"
            className="text-lg font-semibold uppercase tracking-wide text-destructive sm:text-2xl"
          >
            {SITE_CONFIG.name} có thể sửa chữa
          </h2>
          <p className="mt-2 text-base font-medium text-foreground sm:text-xl">
            những thiết bị nào?
          </p>
        </div>

        <ul className="vesmart-fade-in mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {DEVICES.map((item) => (
            <li
              key={item.title}
              className="overflow-hidden rounded-[12px] border border-border bg-secondary/50"
            >
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={item.image}
                  alt={`${item.title} - dịch vụ ${SITE_CONFIG.name}`}
                  fill
                  className="object-cover p-3"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <h3 className="px-2 py-3 text-center text-sm font-semibold leading-snug text-foreground sm:text-base">
                {item.title}
              </h3>
            </li>
          ))}
        </ul>

        <div className="mt-8 rounded-[12px] bg-hero-from px-5 py-8 text-center text-hero-foreground sm:px-8 sm:py-10">
          <h3 className="text-xl font-semibold uppercase tracking-wide sm:text-2xl">
            Dịch vụ cao cấp
          </h3>
          <div className="mt-3 flex items-center justify-center gap-1" aria-label="5 sao">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className="size-5 fill-amber-300 text-amber-300"
                aria-hidden
              />
            ))}
          </div>
          <p className="mx-auto mt-4 max-w-3xl text-sm font-semibold uppercase leading-relaxed sm:text-lg">
            <span className="text-primary block">{SITE_CONFIG.name}</span>
            <span>chuyên sửa chữa các thiết bị SMART HOME giá trị cao - phục vụ quý khách yêu cầu sự hoàn mỹ trong sửa chữa.</span>
          </p>
        </div>
      </Container>
    </section>
  );
};

export default RepairServicesSection;
