import { listFeaturedProducts, listProducts } from "@/lib/api/products";
import { listLatestPosts } from "@/lib/api/posts";
import { listHotThreads } from "@/lib/api/forums";
import { SITE_CONFIG } from "@/configs/site.config";
import TrustTickerSection from "./sections/TrustTickerSection";
import BannerSection from "./sections/BannerSection";
import BrandMarqueeSection from "./sections/BrandMarqueeSection";
import RepairServicesSection from "./sections/RepairServicesSection";
import FeaturedProductsSection from "./sections/FeaturedProductsSection";
import LatestPostsSection from "./sections/LatestPostsSection";
import HotThreadsSection from "./sections/HotThreadsSection";
import MapSection from "./sections/MapSection";

const HomeTemplate = async () => {
  const [products, posts, threads] = await Promise.all([
    listProducts({ limit: 8 }),
    listLatestPosts(4),
    listHotThreads(8),
  ]);

  return (
    <>
      <h1 className="sr-only">
        {SITE_CONFIG.name} - {SITE_CONFIG.description}. Sửa chữa robot hút bụi, máy
        lọc không khí và thiết bị smart home tại Đà Nẵng.
      </h1>
      <TrustTickerSection />
      <BannerSection />
      <BrandMarqueeSection />
      <RepairServicesSection />
      <FeaturedProductsSection products={products} />
      <LatestPostsSection posts={posts} />
      <HotThreadsSection threads={threads} />
      <MapSection />
    </>
  );
};

export default HomeTemplate;
