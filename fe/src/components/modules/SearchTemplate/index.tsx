import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import SearchBar from "@/components/ui/SearchBar";
import ProductCard from "@/components/ui/ProductCard";
import BlogCard from "@/components/ui/BlogCard";
import ThreadRow from "@/components/ui/ThreadRow";
import EmptyState from "@/components/ui/EmptyState";
import SectionHeading from "@/components/ui/SectionHeading";
import { searchAll } from "@/lib/api/search";

type SearchTemplateProps = {
  query?: string;
};

const SearchTemplate = async ({ query }: SearchTemplateProps) => {
  const q = query?.trim() ?? "";
  const results = q ? await searchAll(q, 8) : { products: [], posts: [], threads: [] };
  const total =
    results.products.length + results.posts.length + results.threads.length;

  return (
    <Container className="py-8 sm:py-10">
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Tìm kiếm" },
        ]}
      />

      <div className="mb-8 max-w-2xl space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Tìm kiếm</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Tìm trong sản phẩm, bài viết và chủ đề diễn đàn.
          </p>
        </div>
        <form action="/search" method="get">
          <SearchBar
            name="q"
            defaultValue={q}
            placeholder="Nhập từ khóa…"
            aria-label="Từ khóa tìm kiếm"
          />
        </form>
      </div>

      {!q ? (
        <EmptyState
          title="Nhập từ khóa để tìm"
          description="Ví dụ: Dreame, lau nhà, pin…"
        />
      ) : total === 0 ? (
        <EmptyState
          title="Không có kết quả"
          description={`Không tìm thấy nội dung khớp với “${q}”.`}
        />
      ) : (
        <div className="space-y-12">
          <section className="space-y-4">
            <SectionHeading
              title="Sản phẩm"
              description={`${results.products.length} kết quả`}
              href={`/products?q=${encodeURIComponent(q)}`}
            />
            {results.products.length === 0 ? (
              <p className="text-sm text-muted-foreground">Không có sản phẩm khớp.</p>
            ) : (
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {results.products.map((product) => (
                  <li key={product.id}>
                    <ProductCard product={product} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-4">
            <SectionHeading
              title="Bài viết"
              description={`${results.posts.length} kết quả`}
              href="/blog"
              linkLabel="Xem bài viết"
            />
            {results.posts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Không có bài viết khớp.</p>
            ) : (
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.posts.map((post) => (
                  <li key={post.id}>
                    <BlogCard post={post} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-4">
            <SectionHeading
              title="Diễn đàn"
              description={`${results.threads.length} kết quả`}
              href="/forum"
              linkLabel="Xem diễn đàn"
            />
            {results.threads.length === 0 ? (
              <p className="text-sm text-muted-foreground">Không có chủ đề khớp.</p>
            ) : (
              <ul className="space-y-2">
                {results.threads.map((thread) => (
                  <li key={thread.id}>
                    <ThreadRow thread={thread} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </Container>
  );
};

export default SearchTemplate;
