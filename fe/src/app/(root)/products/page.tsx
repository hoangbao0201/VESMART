import type { Metadata } from "next";
import ProductListTemplate from "@/components/modules/ProductListTemplate";

type ProductsPageProps = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    brand?: string;
    category?: string;
    sort?: string;
  }>;
};

export async function generateMetadata({
  searchParams,
}: ProductsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const page = params.page ? Number.parseInt(params.page, 10) : 1;
  const pageNum = Number.isFinite(page) ? page : 1;
  const noindex = pageNum > 1 || Boolean(params.q?.trim());

  return {
    title: "Sản phẩm",
    description:
      "Danh sách robot hút bụi, phụ kiện chính hãng theo thương hiệu và danh mục tại VESMART.",
    alternates: { canonical: "/products" },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: "Sản phẩm · VESMART",
      description: "Catalog robot hút bụi và phụ kiện chính hãng.",
      url: "/products",
    },
  };
}

const ProductsPage = async ({ searchParams }: ProductsPageProps) => {
  const params = await searchParams;
  const page = params.page ? Number.parseInt(params.page, 10) : 1;

  return (
    <ProductListTemplate
      filters={{
        page: Number.isFinite(page) ? page : 1,
        q: params.q,
        brand: params.brand,
        category: params.category,
        sort: params.sort,
      }}
    />
  );
};

export default ProductsPage;
