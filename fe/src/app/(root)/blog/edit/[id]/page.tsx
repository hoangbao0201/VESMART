import type { Metadata } from "next";
import PostEditorTemplate from "@/components/modules/PostEditorTemplate";

export const metadata: Metadata = {
  title: "Chỉnh sửa bài viết",
  robots: { index: false, follow: false },
};

type BlogEditPageProps = {
  params: Promise<{ id: string }>;
};

const BlogEditPage = async ({ params }: BlogEditPageProps) => {
  const { id } = await params;
  return <PostEditorTemplate mode="edit" postId={id} />;
};

export default BlogEditPage;
