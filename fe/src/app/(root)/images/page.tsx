import type { Metadata } from "next";
import ImagesGalleryTemplate from "@/components/modules/ImagesGalleryTemplate";

type ImagesPageProps = {
  searchParams: Promise<{
    page?: string;
    category?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Kho ảnh",
  description: "Thư viện ảnh sản phẩm và bài viết robot hút bụi VESMART.",
  alternates: { canonical: "/images" },
};

const ImagesPage = async ({ searchParams }: ImagesPageProps) => {
  const params = await searchParams;
  const pageRaw = params.page ? Number.parseInt(params.page, 10) : 1;
  const categoryRaw = params.category
    ? Number.parseInt(params.category, 10)
    : undefined;

  return (
    <ImagesGalleryTemplate
      page={Number.isFinite(pageRaw) ? pageRaw : 1}
      categoryId={
        categoryRaw != null && Number.isFinite(categoryRaw)
          ? categoryRaw
          : undefined
      }
    />
  );
};

export default ImagesPage;
