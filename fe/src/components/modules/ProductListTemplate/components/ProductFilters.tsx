import Link from "next/link";
import type { BrandListItem } from "@/lib/api/brands";
import type { CategoryListItem } from "@/lib/api/categories";
import { cn } from "@/lib/utils/cn";

type ProductFiltersProps = {
  brands: BrandListItem[];
  categories: CategoryListItem[];
  activeBrand?: string;
  activeCategory?: string;
  search?: string;
  sort: string;
};

function buildProductsHref(params: {
  brand?: string;
  category?: string;
  q?: string;
  sort?: string;
  page?: number;
}) {
  const query = new URLSearchParams();
  if (params.brand) query.set("brand", params.brand);
  if (params.category) query.set("category", params.category);
  if (params.q) query.set("q", params.q);
  if (params.sort && params.sort !== "created_at:desc") query.set("sort", params.sort);
  if (params.page && params.page > 1) query.set("page", String(params.page));
  const qs = query.toString();
  return qs ? `/products?${qs}` : "/products";
}

const FilterLink = ({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) => (
  <Link
    href={href}
    className={cn(
      "block rounded-[12px] px-3 py-2 text-sm transition-colors duration-150",
      active
        ? "bg-secondary font-semibold text-foreground"
        : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
    )}
  >
    {children}
  </Link>
);

const ProductFilters = ({
  brands,
  categories,
  activeBrand,
  activeCategory,
  search,
  sort,
}: ProductFiltersProps) => {
  return (
    <aside className="space-y-8" aria-label="Bộ lọc sản phẩm">
      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Thương hiệu</h2>
        <ul className="space-y-1">
          <li>
            <FilterLink
              href={buildProductsHref({
                category: activeCategory,
                q: search,
                sort,
              })}
              active={!activeBrand}
            >
              Tất cả
            </FilterLink>
          </li>
          {brands.map((brand) => (
            <li key={brand.id}>
              <FilterLink
                href={buildProductsHref({
                  brand: brand.slug,
                  category: activeCategory,
                  q: search,
                  sort,
                })}
                active={activeBrand === brand.slug}
              >
                {brand.name}
              </FilterLink>
            </li>
          ))}
        </ul>
        {brands.length === 0 ? (
          <p className="px-3 text-xs text-muted-foreground">Chưa có thương hiệu từ API.</p>
        ) : null}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Danh mục</h2>
        <ul className="space-y-1">
          <li>
            <FilterLink
              href={buildProductsHref({
                brand: activeBrand,
                q: search,
                sort,
              })}
              active={!activeCategory}
            >
              Tất cả
            </FilterLink>
          </li>
          {categories.map((category) => (
            <li key={category.id}>
              <FilterLink
                href={buildProductsHref({
                  brand: activeBrand,
                  category: category.slug,
                  q: search,
                  sort,
                })}
                active={activeCategory === category.slug}
              >
                {category.name}
              </FilterLink>
            </li>
          ))}
        </ul>
        {categories.length === 0 ? (
          <p className="px-3 text-xs text-muted-foreground">Chưa có danh mục từ API.</p>
        ) : null}
      </section>
    </aside>
  );
};

export { buildProductsHref };
export default ProductFilters;
