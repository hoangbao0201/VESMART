import type { Metadata } from "next";
import SearchTemplate from "@/components/modules/SearchTemplate";

export const metadata: Metadata = {
  title: "Tìm kiếm",
  description: "Tìm sản phẩm, bài viết và chủ đề trên VESMART.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/search" },
};

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const { q } = await searchParams;
  return <SearchTemplate query={q} />;
};

export default SearchPage;
