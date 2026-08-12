import type { Metadata } from "next";
import ProductDetailTemplate from "@/components/modules/ProductDetailTemplate";
import { getProductBySlug } from "@/lib/api/products";
import { productPath, toPlainText } from "@/lib/seo";

type ProductsDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductsDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Không tìm thấy sản phẩm",
      robots: { index: false, follow: false },
    };
  }

  const title = product.seoTitle?.trim() || product.name;
  const description =
    product.seoDescription?.trim() ||
    toPlainText(product.shortDescription || product.description, 160) ||
    `${product.name} chính hãng tại VESMART.`;

  const images = product.thumbnail
    ? [{ url: product.thumbnail, alt: product.name }]
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      // Next Metadata has no og:product; website + product image is the supported pattern.
      type: "website",
      url: productPath(product.slug),
      images: images ?? [{ url: "/logo.png", alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.thumbnail ? [product.thumbnail] : undefined,
    },
    alternates: {
      canonical: productPath(product.slug),
    },
  };
}

const ProductDetailPage = async ({ params }: ProductsDetailPageProps) => {
  const { slug } = await params;
  return <ProductDetailTemplate slug={slug} />;
};

export default ProductDetailPage;
