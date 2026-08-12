import Link from "next/link";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import EmptyState from "@/components/ui/EmptyState";
import FavoriteButton from "@/components/ui/FavoriteButton";
import DeferredCommentsSection from "@/components/ui/CommentsSection/DeferredCommentsSection";
import MarkdownContent from "@/components/ui/MarkdownContent";
import JsonLd from "@/components/seo/JsonLd";
import { getProductBySlug } from "@/lib/api/products";
import { breadcrumbJsonLd, productPath } from "@/lib/seo";
import { productJsonLd } from "@/lib/seo/product-jsonld";
import ProductGallery from "./components/ProductGallery";
import VariantPurchaseCard from "./components/VariantPurchaseCard";

type ProductDetailTemplateProps = {
  slug: string;
};

const ProductDetailTemplate = async ({ slug }: ProductDetailTemplateProps) => {
  const product = await getProductBySlug(slug);

  if (!product) {
    return (
      <Container className="py-8 sm:py-10">
        <EmptyState
          title="Không tìm thấy sản phẩm"
          description="Sản phẩm có thể chưa được publish hoặc API chưa sẵn sàng."
        />
        <p className="mt-4 text-center text-sm">
          <Link href="/products" className="font-medium text-primary hover:underline">
            Về danh sách sản phẩm
          </Link>
        </p>
      </Container>
    );
  }

  const attributes = product.attributes ?? [];
  const tags = product.tags ?? [];
  const crumbItems = [
    { name: "Trang chủ", path: "/" },
    { name: "Sản phẩm", path: "/products" },
    ...(product.brand
      ? [{ name: product.brand.name, path: `/products?brand=${product.brand.slug}` }]
      : []),
    { name: product.name, path: productPath(product.slug) },
  ];

  return (
    <Container className="py-6 sm:py-8">
      <JsonLd data={[productJsonLd(product), breadcrumbJsonLd(crumbItems)]} />
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Sản phẩm", href: "/products" },
          ...(product.brand
            ? [{ label: product.brand.name, href: `/products?brand=${product.brand.slug}` }]
            : []),
          { label: product.name },
        ]}
      />

      <section className="mt-4 rounded-[12px] border border-border bg-card p-4 sm:p-6 lg:flex lg:gap-6">
        <div className="relative w-full shrink-0 lg:w-5/12 xl:w-4/12">
          <ProductGallery
            name={product.name}
            thumbnail={product.thumbnail}
            images={product.images ?? []}
          />
        </div>

        <div className="mt-6 min-w-0 flex-1 space-y-4 lg:mt-0">
          <div className="space-y-2">
            {product.brand ? (
              <Link
                href={`/products?brand=${product.brand.slug}`}
                className="text-xs font-medium uppercase tracking-wide text-primary hover:underline"
              >
                {product.brand.name}
              </Link>
            ) : null}
            <div className="flex items-start gap-3">
              <h1 className="min-w-0 flex-1 text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
                {product.name}
              </h1>
            </div>
            {product.category ? (
              <p className="text-sm text-muted-foreground">
                Danh mục:{" "}
                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="font-medium text-foreground hover:text-primary"
                >
                  {product.category.name}
                </Link>
              </p>
            ) : null}
          </div>

          <VariantPurchaseCard
            productId={product.id}
            productSlug={product.slug}
            productName={product.name}
            thumbnail={product.thumbnail}
            variants={product.variants ?? []}
          />

          <FavoriteButton
            targetType="PRODUCT"
            targetId={product.id}
            iconOnly
            className="shrink-0"
          />
        </div>
      </section>

      {product.description ? (
        <section className="mt-10 space-y-3 rounded-[12px] border border-border bg-card p-4 sm:p-6">
          <h2 className="text-lg font-semibold">Mô tả sản phẩm</h2>
          <MarkdownContent content={product.description} mode="lite" showToc={false} />
        </section>
      ) : null}

      {attributes.length > 0 ? (
        <section className="mt-10 space-y-3">
          <h2 className="text-lg font-semibold">Thông số</h2>
          <dl className="overflow-hidden rounded-[12px] border border-border">
            {attributes.map((item, index) => (
              <div
                key={item.id}
                className={`grid grid-cols-1 gap-1 px-4 py-3 text-sm sm:grid-cols-[220px_1fr] ${index % 2 === 0 ? "bg-card" : "bg-secondary/40"
                  }`}
              >
                <dt className="font-medium text-muted-foreground">
                  {item.attribute?.name ?? "Thuộc tính"}
                </dt>
                <dd className="text-foreground">{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {tags.length > 0 ? (
        <section className="mt-8 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-[12px] border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
            >
              {tag.name}
            </span>
          ))}
        </section>
      ) : null}

      <div className="mt-12 border-t border-border pt-8">
        <DeferredCommentsSection targetType="PRODUCT" targetId={product.id} />
      </div>
    </Container>
  );
};

export default ProductDetailTemplate;
