import type { Metadata } from "next";
import ForumHomeTemplate from "@/components/modules/ForumHomeTemplate";

export const metadata: Metadata = {
  title: "Diễn đàn",
  description:
    "Diễn đàn cộng đồng robot hút bụi - hỏi đáp, kinh nghiệm theo thương hiệu.",
  alternates: { canonical: "/forum" },
  openGraph: {
    title: "Diễn đàn · VESMART",
    description: "Thảo luận cộng đồng robot hút bụi.",
    url: "/forum",
  },
};

const ForumPage = () => {
  return <ForumHomeTemplate />;
};

export default ForumPage;
