import Image from 'next/image';
import type { Product } from '@/lib/data/products';

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString('en-NG')}`;
}

/** Octagonal / star-burst badge for discount percentage */
function StarBurstBadge({ percent }: { percent: number }) {
  return (
    <span
      className="absolute left-1.5 top-1.5 flex h-9 w-9 items-center justify-center text-[9px] font-bold text-white"
      style={{
        background: '#e5001e',
        clipPath:
          'polygon(50% 0%, 65% 15%, 85% 10%, 88% 30%, 100% 45%, 85% 58%, 88% 78%, 68% 80%, 55% 95%, 38% 85%, 18% 92%, 15% 72%, 0% 58%, 12% 42%, 8% 22%, 28% 18%)',
      }}
      aria-label={`${percent}% off`}
    >
      -{percent}%
    </span>
  );
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="flex w-44 shrink-0 flex-col rounded-xl border border-neutral-100 bg-white p-2.5 sm:w-52">
      <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-neutral-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="208px"
          className="object-cover"
        />

        {/* Octagonal star-burst discount badge — top-left */}
        {product.discountPercent && (
          <StarBurstBadge percent={product.discountPercent} />
        )}

        {/* Heart/wishlist — bottom-right of image */}
        <button
          type="button"
          aria-label="Add to wishlist"
          className="absolute bottom-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow"
        >
          <Image src="/icons/Favorite_Icon.png" alt="" width={14} height={14} aria-hidden />
        </button>
      </div>

      <p className="mb-1 line-clamp-2 text-xs text-neutral-800">{product.name}</p>

      <div className="mb-1 flex items-baseline gap-1.5">
        <span className="text-sm font-semibold text-neutral-900">{formatNaira(product.price)}</span>
        {product.compareAtPrice && (
          <span className="text-[11px] text-neutral-400 line-through">
            {formatNaira(product.compareAtPrice)}
          </span>
        )}
      </div>

      <div className="mb-1 flex items-center gap-1 text-[11px] text-accent-amber">
        <span>★ {product.rating}</span>
        <span className="text-neutral-400">({product.reviewCount})</span>
      </div>

      <div className="mb-2 text-[11px] text-neutral-500">
        📍 {product.location} · {product.vendor}
      </div>

      <button
        type="button"
        className="mt-auto w-full rounded-lg gradient-brand py-1.5 text-xs font-semibold text-white"
      >
        Add to cart
      </button>
    </div>
  );
}
