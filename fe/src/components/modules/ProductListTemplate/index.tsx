import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ProductCard from "@/components/ui/ProductCard";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import SearchBar from "@/components/ui/SearchBar";
import JsonLd from "@/components/seo/JsonLd";
import { listBrands } from "@/lib/api/brands";
import { listCategories } from "@/lib/api/categories";
import { listProductsPage } from "@/lib/api/products";
import { breadcrumbJsonLd, itemListJsonLd, productPath } from "@/lib/seo";
import ProductFilters, { buildProductsHref } from "./components/ProductFilters";

export type ProductListFilters = {
  page?: number;
  q?: string;
  brand?: string;
  category?: string;
  sort?: string;
};

type ProductListTemplateProps = {
  filters: ProductListFilters;
};

const SORT_OPTIONS = [
  { value: "created_at:desc", label: "Mới nhất" },
  { value: "name:asc", label: "Tên A–Z" },
  { value: "name:desc", label: "Tên Z–A" },
] as const;

const ProductListTemplate = async ({ filters }: ProductListTemplateProps) => {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const sort = filters.sort ?? "created_at:desc";
  const limit = 12;

  const [brands, categories, catalog] = await Promise.all([
    listBrands(),
    listCategories(),
    listProductsPage({
      page,
      limit,
      search: filters.q,
      brandSlug: filters.brand,
      categorySlug: filters.category,
      sort,
    }),
  ]);

  const totalPages = Math.max(catalog.meta.totalPages, catalog.items.length > 0 ? 1 : 0);
  const listJson = itemListJsonLd(
    "Sản phẩm VESMART",
    catalog.items.slice(0, 24).map((item) => ({
      name: item.name,
      path: productPath(item.slug),
    })),
  );

  return (
    <Container className="py-8 sm:py-10">
      <JsonLd
        data={[
          listJson,
          breadcrumbJsonLd([
            { name: "Trang chủ", path: "/" },
            { name: "Sản phẩm", path: "/products" },
          ]),
        ]}
      />
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Sản phẩm" },
        ]}
      />

      <div className="mb-8 max-w-2xl space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Sản phẩm</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Duyệt robot hút bụi theo thương hiệu và danh mục. Giá hiển thị từ biến thể bán hàng.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <ProductFilters
          brands={brands}
          categories={categories}
          activeBrand={filters.brand}
          activeCategory={filters.category}
          search={filters.q}
          sort={sort}
        />

        <div className="min-w-0 space-y-6">
          <form
            action="/products"
            method="get"
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            {filters.brand ? <input type="hidden" name="brand" value={filters.brand} /> : null}
            {filters.category ? (
              <input type="hidden" name="category" value={filters.category} />
            ) : null}
            <SearchBar
              name="q"
              defaultValue={filters.q}
              placeholder="Tìm theo tên sản phẩm…"
              aria-label="Tìm sản phẩm"
              className="flex-1"
            />
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="shrink-0">Sắp xếp</span>
              <select
                name="sort"
                defaultValue={sort}
                className="h-11 rounded-[12px] border border-input bg-card px-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="h-11 rounded-[12px] bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors duration-150 hover:opacity-90"
            >
              Áp dụng
            </button>
          </form>

          {catalog.items.length === 0 ? (
            <EmptyState
              title="Không có sản phẩm"
              description="Thử đổi bộ lọc, hoặc đợi API catalog sẵn sàng."
            />
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {catalog.items.map((product) => (
                <li key={product.id}>
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
          )}

          <Pagination
            page={catalog.meta.page || page}
            totalPages={totalPages}
            buildHref={(nextPage) =>
              buildProductsHref({
                brand: filters.brand,
                category: filters.category,
                q: filters.q,
                sort,
                page: nextPage,
              })
            }
          />
        </div>
      </div>
    </Container>
  );
};

export default ProductListTemplate;
