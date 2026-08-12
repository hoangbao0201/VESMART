import type { PostListItem } from "@/types/post";
import BlogCard from "@/components/ui/BlogCard";
import SectionHeading from "@/components/ui/SectionHeading";

type RelatedPostsSectionProps = {
  posts: PostListItem[];
  categorySlug?: string | null;
};

const RelatedPostsSection = ({ posts, categorySlug }: RelatedPostsSectionProps) => {
  if (posts.length === 0) return null;

  return (
    <section
      className="mt-10 border-t border-border/80 pt-10 sm:mt-12 sm:pt-12"
      aria-labelledby="related-posts-heading"
    >
      <SectionHeading
        id="related-posts-heading"
        title="Bài viết liên quan"
        description="Tiếp tục đọc các bài cùng chủ đề trên VESMART."
        href={categorySlug ? `/blog?category=${categorySlug}` : "/blog"}
        linkLabel={categorySlug ? "Cùng danh mục" : "Tất cả bài viết"}
      />
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {posts.map((post) => (
          <li key={post.id}>
            <BlogCard post={post} />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default RelatedPostsSection;
