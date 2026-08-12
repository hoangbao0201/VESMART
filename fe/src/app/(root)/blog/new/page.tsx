import type { Metadata } from "next";
import PostEditorTemplate from "@/components/modules/PostEditorTemplate";

export const metadata: Metadata = {
  title: "Viết bài mới",
  robots: { index: false, follow: false },
};

const BlogNewPage = () => {
  return <PostEditorTemplate mode="create" />;
};

export default BlogNewPage;
