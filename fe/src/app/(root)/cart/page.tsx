import type { Metadata } from "next";
import CartTemplate from "@/components/modules/CartTemplate";

export const metadata: Metadata = {
  title: "Giỏ hàng",
  description: "Giỏ hàng mua sắm tại VESMART.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/cart" },
};

const CartPage = () => {
  return <CartTemplate />;
};

export default CartPage;
