import type { ProductListItem } from "@/types/product";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import ProductCard from "@/components/ui/ProductCard";
import EmptyState from "@/components/ui/EmptyState";

type FeaturedProductsSectionProps = {
  products: ProductListItem[];
};

const FeaturedProductsSection = ({ products }: FeaturedProductsSectionProps) => {
  return (
    <section className="py-12 sm:py-16" aria-labelledby="featured-products-heading">
      <Container>
        <SectionHeading
          id="featured-products-heading"
          title="Sản phẩm nổi bật"
          description="Những mẫu robot được cộng đồng quan tâm - giá theo biến thể thực tế."
          href="/products"
          linkLabel="Tất cả sản phẩm"
        />
        {products.length === 0 ? (
          <EmptyState
            title="Chưa có sản phẩm nổi bật"
            description="Dữ liệu sẽ hiển thị khi API catalog sẵn sàng."
          />
        ) : (
          <ul className="vesmart-fade-in grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
};

export default FeaturedProductsSection;
