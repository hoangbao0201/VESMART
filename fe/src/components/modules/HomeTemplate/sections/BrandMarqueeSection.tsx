import Image from "next/image";

const BRANDS = [
  { name: "Ecovacs", logo: "/static/images/slide-brand/logo-ecovacs.png" },
  { name: "Roborock", logo: "/static/images/slide-brand/logo-roborock.png" },
  { name: "Xiaomi", logo: "/static/images/slide-brand/logo-xiaomi.png" },
  { name: "Dreame", logo: "/static/images/slide-brand/logo-dreame.png" },
  { name: "iRobot", logo: "/static/images/slide-brand/logo-irobot.png" },
  { name: "Dyson", logo: "/static/images/slide-brand/logo-dyson.png" },
] as const;

type BrandMarqueeSectionProps = {
  size?: "small" | "medium" | "large";
};

const BrandMarqueeSection = ({ size = "medium" }: BrandMarqueeSectionProps) => {
  const duplicated = [...BRANDS, ...BRANDS];
  const heightClass =
    size === "small" ? "h-8" : size === "large" ? "h-14" : "h-10";

  return (
    <section className="mt-4 overflow-hidden border-y border-border bg-card" aria-label="Thương hiệu hỗ trợ">
      <div className="animate-scroll py-4">
        {duplicated.map((brand, index) => (
          <div
            key={`${brand.name}-${index}`}
            className="flex shrink-0 items-center justify-center px-6"
          >
            <Image
              src={brand.logo}
              alt={brand.name}
              width={200}
              height={80}
              sizes="120px"
              className={`w-auto object-contain ${heightClass}`}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default BrandMarqueeSection;
