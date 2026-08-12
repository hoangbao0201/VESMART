import type { Metadata } from "next";
import AccountFavoritesTemplate from "@/components/modules/AccountFavoritesTemplate";

export const metadata: Metadata = {
  title: "Yêu thích",
  robots: { index: false, follow: false },
};

const FavoritesPage = () => {
  return <AccountFavoritesTemplate />;
};

export default FavoritesPage;
