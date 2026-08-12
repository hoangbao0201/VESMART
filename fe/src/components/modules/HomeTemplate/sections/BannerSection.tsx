import Image from "next/image";
import { SITE_CONFIG } from "@/configs/site.config";
import Container from "@/components/ui/Container";
import { cn } from "@/lib/utils/cn";

type BannerCardProps = {
  imageUrls: string[];
  imageAlt: string;
  title: string;
  description: string;
  className?: string;
  priorityFirstImage?: boolean;
};

const BannerCard = ({
  imageUrls,
  imageAlt,
  title,
  description,
  className,
  priorityFirstImage = false,
}: BannerCardProps) => {
  return (
    <article
      className={cn(
        "py-4 relative overflow-hidden rounded-[12px] border border-border bg-card shadow-sm",
        className,
      )}
    >
      <div className="relative px-3 transition-all duration-200 h-[300px]">
        <div className="flex items-center justify-center gap-3">
          {imageUrls.map((imgUrl, index) => (
            <div
              key={imgUrl}
              className={cn(
                "relative flex-1",
                index % 2 === 0 && imageUrls.length > 1 && "mb-4",
                index % 2 === 1 && imageUrls.length > 1 && "mt-4",
                index >= 1 && "hidden lg:block",
              )}
            >
              <Image
                src={imgUrl}
                alt={`${imageAlt} - ảnh ${index + 1}`}
                width={1000}
                height={1000}
                priority={priorityFirstImage && index === 0}
                className="w-full rounded-[10px] object-cover shadow-md h-[240px] md:h-[280px]"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="relative bg-card px-4 pt-5">
        <h2 className="mb-2 line-clamp-2 text-xl font-semibold tracking-tight">{title}</h2>
        <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
        <a
          href={SITE_CONFIG.zalo}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center rounded-[12px] bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity duration-200"
        >
          Liên hệ qua Zalo
        </a>
      </div>
    </article>
  );
};

const BannerSection = () => {
  return (
    <section className="pt-4 sm:pt-6" aria-label="Giới thiệu dịch vụ">
      <Container>
        <div className="flex flex-col items-stretch justify-center gap-3 md:flex-row">
          <BannerCard
            imageUrls={["/static/images/banners/banner-1.jpg"]}
            title="Làm việc chuyên nghiệp"
            imageAlt="Robot hút bụi và dịch vụ sửa chữa VESMART"
            className="w-full lg:w-1/3"
            description="Chuyên sửa chữa robot hút bụi, máy hút bụi cầm tay, máy lọc không khí và thiết bị smart home. Kỹ thuật viên giàu kinh nghiệm, giá hợp lý."
            priorityFirstImage
          />
          <BannerCard 
            imageUrls={[
              "/static/images/banners/banner-7.jpg",
              "/static/images/banners/banner-2.jpg",
              "/static/images/banners/banner-8.jpg",
              "/static/images/banners/banner-9.jpg",
            ]}
            imageAlt="Dịch vụ sửa chữa robot hút bụi tại VESMART"
            title="Sửa chữa nhanh chóng"
            className="hidden w-full md:block lg:w-2/3"
            description="Sửa trong 24–48h, bảo hành dài hạn, tư vấn miễn phí - không thu phí nếu không sửa được. Liên hệ ngay để được hỗ trợ."
          />
        </div>
      </Container>
    </section>
  );
};

export default BannerSection;
