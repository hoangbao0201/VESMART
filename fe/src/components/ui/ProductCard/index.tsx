import Image from "next/image";
import Link from "next/link";
import type { ProductListItem } from "@/types/product";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

type ProductCardProps = {
  product: ProductListItem;
  className?: string;
};

const ProductCard = ({ product, className }: ProductCardProps) => {
  const salePrice = formatPrice(product.salePriceFrom);
  const price = formatPrice(product.priceFrom);
  const displayPrice = salePrice ?? price;

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        "group translate-y-0 hover:translate-y-[-2px] flex h-full flex-col overflow-hidden border border-border bg-card shadow-sm transition duration-150 hover:border-primary/40 hover:shadow-md",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-secondary">
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Chưa có ảnh
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.brand ? (
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {product.brand.name}
          </p>
        ) : null}
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-card-foreground sm:text-base">
          {product.name}
        </h3>
        {product.shortDescription ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {product.shortDescription}
          </p>
        ) : null}
        <div className="mt-auto pt-2">
          {displayPrice ? (
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-base font-semibold text-foreground">{displayPrice}</span>
              {salePrice && price ? (
                <span className="text-sm text-muted-foreground line-through">{price}</span>
              ) : null}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Liên hệ</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
