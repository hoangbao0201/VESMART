import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";
import { listMediaCategoryTree, listMediaImagesPage } from "@/lib/api/media";
import ImagesGallery from "./ImagesGallery";

type ImagesGalleryTemplateProps = {
  page?: number;
  categoryId?: number;
};

const ImagesGalleryTemplate = async ({
  page = 1,
  categoryId,
}: ImagesGalleryTemplateProps) => {
  const safePage = page > 0 ? page : 1;
  const [catalog, categories] = await Promise.all([
    listMediaImagesPage({
      page: safePage,
      limit: 48,
      categoryId,
    }),
    listMediaCategoryTree(),
  ]);

  return (
    <Container className="py-8 sm:py-10">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Trang chủ", path: "/" },
          { name: "Kho ảnh", path: "/images" },
        ])}
      />
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Kho ảnh" },
        ]}
      />

      <div className="mb-8 max-w-2xl space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Kho ảnh</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Thư viện ảnh sản phẩm và bài viết VESMART - nhấn vào ảnh để xem lớn hơn.
        </p>
      </div>

      <ImagesGallery
        images={catalog.items}
        meta={catalog.meta}
        categories={categories}
        activeCategoryId={categoryId}
        page={safePage}
      />
    </Container>
  );
};

export default ImagesGalleryTemplate;
