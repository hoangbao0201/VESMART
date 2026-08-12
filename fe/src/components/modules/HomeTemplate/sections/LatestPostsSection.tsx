import type { PostListItem } from "@/types/post";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import BlogCard from "@/components/ui/BlogCard";
import EmptyState from "@/components/ui/EmptyState";

type LatestPostsSectionProps = {
  posts: PostListItem[];
};

const LatestPostsSection = ({ posts }: LatestPostsSectionProps) => {
  return (
    <section className="py-12 sm:py-16" aria-labelledby="latest-posts-heading">
      <Container>
        <SectionHeading
          id="latest-posts-heading"
          title="Bài viết mới"
          description="Review, hướng dẫn và tin tức robot hút bụi từ biên tập VESMART."
          href="/blog"
          linkLabel="Tất cả bài viết"
        />
        {posts.length === 0 ? (
          <EmptyState
            title="Chưa có bài viết"
            description="Dữ liệu sẽ hiển thị khi API bài viết sẵn sàng."
          />
        ) : (
          <ul className="vesmart-fade-in grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {posts.map((post) => (
              <li key={post.id}>
                <BlogCard post={post} />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
};

export default LatestPostsSection;
