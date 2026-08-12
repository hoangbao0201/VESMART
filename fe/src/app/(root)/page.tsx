import type { Metadata } from "next";
import HomeTemplate from "@/components/modules/HomeTemplate";
import JsonLd from "@/components/seo/JsonLd";
import {
  localBusinessJsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: "VESMART - Sửa chữa robot hút bụi Đà Nẵng",
  },
  description:
    "Trung tâm sửa chữa robot hút bụi, máy hút bụi cầm tay, máy lọc không khí. Phụ kiện chính hãng, review và diễn đàn cộng đồng.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "VESMART - Sửa chữa robot hút bụi Đà Nẵng",
    description:
      "Sửa chữa robot hút bụi · Phụ kiện · Review · Forum tại Đà Nẵng.",
    type: "website",
    url: "/",
  },
};

const HomePage = () => {
  return (
    <>
      <JsonLd
        data={[organizationJsonLd(), localBusinessJsonLd(), websiteJsonLd()]}
      />
      <HomeTemplate />
    </>
  );
};

export default HomePage;
