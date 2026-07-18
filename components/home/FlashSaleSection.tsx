'use client';

import Image from 'next/image';
import { useCountdown } from '@/lib/hooks/useCountdown';
import { flashSaleProducts } from '@/lib/data/products';

function TimeBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center rounded-md bg-white/15 px-2 py-1 text-white">
      <span className="text-sm font-bold leading-none">{value}</span>
      <span className="text-[9px] uppercase tracking-wide text-white/80">{label}</span>
    </div>
  );
}

/** Octagonal star-burst badge (reused from ProductCard) */
function StarBurstBadge({ percent }: { percent: number }) {
  return (
    <span
      className="absolute left-1 top-1 flex h-8 w-8 items-center justify-center text-[8px] font-bold text-white"
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

export default function FlashSaleSection() {
  const { days, hours, minutes, seconds } = useCountdown();

  return (
    <div className="mx-4 my-6 overflow-hidden rounded-2xl border border-neutral-100 md:mx-6">
      {/* Heading row — red background only */}
      <div className="flex items-center justify-between bg-danger-600 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2 text-white">
          <span aria-hidden>⚡</span>
          <h2 className="text-base font-semibold sm:text-lg">Flash Sales</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <span className="text-xs text-white/80">Time Left:</span>
            <div className="flex gap-1.5">
              <TimeBox label="Day" value={days} />
              <TimeBox label="Hour" value={hours} />
              <TimeBox label="Min" value={minutes} />
              <TimeBox label="Sec" value={seconds} />
            </div>
          </div>
          <a href="#" className="text-sm font-medium text-white">
            View all &rsaquo;
          </a>
        </div>
      </div>

      {/* Products area — white background */}
      <div className="bg-white px-4 pb-4 pt-3 md:px-6">
        {/* Desktop: horizontal scroll with leading banners */}
        <div className="relative hidden md:block">
          <div className="flex gap-3 overflow-x-auto scroll-smooth scrollbar-hide">
            {/* Leading banner slides */}
            <div className="relative h-56 w-44 shrink-0 overflow-hidden rounded-xl sm:w-52">
              <Image
                src="/images/flash_sale_banner_2.png"
                alt="Step with confidence"
                fill
                sizes="208px"
                className="object-cover"
              />
            </div>
            <div className="relative h-56 w-44 shrink-0 overflow-hidden rounded-xl sm:w-52">
              <Image
                src="/images/flash_sale_banner_1.png"
                alt="Step with confidence"
                fill
                sizes="208px"
                className="object-cover"
              />
            </div>

            {/* Flash sale product cards */}
            {flashSaleProducts.map((product) => (
              <div
                key={product.id}
                className="flex w-44 shrink-0 flex-col rounded-xl border border-neutral-100 bg-white p-2.5 sm:w-52"
              >
                <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-neutral-100">
                  <Image src={product.image} alt={product.name} fill sizes="208px" className="object-cover" />
                  {product.discountPercent && <StarBurstBadge percent={product.discountPercent} />}
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
                  <span className="text-sm font-semibold text-neutral-900">
                    ₦{product.price.toLocaleString('en-NG')}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-[11px] text-neutral-400 line-through">
                      ₦{product.compareAtPrice.toLocaleString('en-NG')}
                    </span>
                  )}
                </div>
                <div className="mb-1 flex items-center gap-1 text-[11px] text-accent-amber">
                  <span>★ {product.rating}</span>
                  <span className="text-neutral-400">({product.reviewCount})</span>
                </div>
                <button
                  type="button"
                  className="mt-auto w-full rounded-lg gradient-brand py-1.5 text-xs font-semibold text-white"
                >
                  Add to cart
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: 2-column grid — all 10 products, no scroll */}
        <div className="grid grid-cols-2 gap-3 md:hidden">
          {flashSaleProducts.map((product) => (
            <div
              key={product.id}
              className="flex flex-col rounded-xl border border-neutral-100 bg-white p-2"
            >
              <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-neutral-100">
                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                {product.discountPercent && (
                  <span
                    className="absolute left-1 top-1 flex h-8 w-8 items-center justify-center text-[8px] font-bold text-white"
                    style={{
                      background: '#e5001e',
                      clipPath:
                        'polygon(50% 0%, 65% 15%, 85% 10%, 88% 30%, 100% 45%, 85% 58%, 88% 78%, 68% 80%, 55% 95%, 38% 85%, 18% 92%, 15% 72%, 0% 58%, 12% 42%, 8% 22%, 28% 18%)',
                    }}
                  >
                    -{product.discountPercent}%
                  </span>
                )}
                <button
                  type="button"
                  aria-label="Add to wishlist"
                  className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow"
                >
                  <img src="/icons/Favorite_Icon.png" alt="" width={12} height={12} aria-hidden />
                </button>
              </div>
              <p className="mb-1 line-clamp-2 text-[11px] leading-tight text-neutral-800">{product.name}</p>
              <div className="mb-0.5 flex flex-wrap items-baseline gap-1">
                <span className="text-xs font-semibold text-neutral-900">
                  ₦{product.price.toLocaleString('en-NG')}
                </span>
                {product.compareAtPrice && (
                  <span className="text-[10px] text-neutral-400 line-through">
                    ₦{product.compareAtPrice.toLocaleString('en-NG')}
                  </span>
                )}
              </div>
              <div className="mb-1 flex items-center gap-0.5 text-[10px] text-accent-amber">
                <span>★ {product.rating}</span>
                <span className="ml-0.5 text-neutral-400">({product.reviewCount})</span>
              </div>
              <button
                type="button"
                className="mt-auto w-full rounded-lg gradient-brand py-1.5 text-[11px] font-semibold text-white"
              >
                Add to cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
