'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { categories } from '@/lib/data/categories';

export default function CategoryScroller() {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollRight() {
    scrollRef.current?.scrollBy({ left: 320, behavior: 'smooth' });
  }

  return (
    /* Desktop-only: mobile version is inside MobileHeader */
    <div className="gradient-brand relative hidden items-stretch gap-4 px-6 py-5 md:flex">
      <div
        ref={scrollRef}
        className="grid flex-1 grid-flow-col grid-rows-2 gap-x-8 gap-y-5 overflow-x-auto scrollbar-hide"
      >
        {categories.map((category) => (
          <a
            key={category.slug}
            href="#"
            className="flex w-20 shrink-0 flex-col items-center gap-2 text-center"
          >
            {/* Rounded-triangular clip path — 7-point shape like the reference image */}
            <span
              className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden bg-white/25"
              style={{
                clipPath:
                  'polygon(50% 0%, 93% 20%, 100% 65%, 75% 100%, 25% 100%, 0% 65%, 7% 20%)',
              }}
            >
              <Image
                src="/images/product_cover_image.png"
                alt=""
                fill
                sizes="64px"
                className="object-cover"
                aria-hidden
              />
            </span>
            <span className="text-xs font-medium leading-tight text-white">{category.name}</span>
          </a>
        ))}
      </div>

      <button
        type="button"
        onClick={scrollRight}
        className="flex shrink-0 flex-col items-center justify-center gap-1 rounded-xl bg-white/15 px-3 text-xs font-medium text-white"
      >
        <span>
          Scroll
          <br />
          right
        </span>
        <span aria-hidden>&#8250;</span>
      </button>
    </div>
  );
}
