'use client';

import Image from 'next/image';
import { assets } from '@/assets/assets';
import Link from 'next/link';

type SpecialCategory = {
  image: typeof assets.home_1;
  slug: string;
  alt: string;
};

const specialCategories: SpecialCategory[] = [
  { image: assets.home_1, slug: 'groceries', alt: 'Grocery Sale' },
  { image: assets.home_2, slug: 'fashion', alt: 'Fashion Sale' },
  { image: assets.home_3, slug: 'beauty', alt: 'Dresses Sale' },
  { image: assets.home_4, slug: 'jewellery', alt: 'Black Friday Sale' },
  { image: assets.ctp_1, slug: 'electronics', alt: 'Tech Deals' },
  { image: assets.ctp_2, slug: 'footwear', alt: 'Shoe Sale' },
  { image: assets.pop_pord_img, slug: 'bags', alt: 'Designer Bags' },
  { image: assets.home_1, slug: 'wellness', alt: 'Health & Wellness' },
];

export default function SpecialCategories() {
  return (
    <section className="w-full overflow-hidden">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="h-px w-6 bg-gradient-to-r from-[#9d4ae3] to-transparent rounded-full" />
          <span className="text-[10px] font-black uppercase tracking-[3.5px] text-[#9d4ae3]/80">Deals</span>
          <span className="h-px w-6 bg-gradient-to-l from-[#9d4ae3] to-transparent rounded-full" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">Shop the Sale</h2>
        <p className="mt-1 text-sm text-gray-500">Trending deals across top categories</p>
      </div>

      {/* Marquee */}
      <div className="relative flex overflow-hidden py-4">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee hover:[animation-play-state:paused]">
          {/* First loop */}
          <div className="flex flex-nowrap gap-4 md:gap-5 px-4 md:px-6 min-w-max">
            {specialCategories.map((category, index) => (
              <Link
                key={`${category.slug}-${index}-1`}
                href={`/categories/${category.slug}`}
                className="group relative overflow-hidden rounded-2xl w-56 sm:w-64 md:w-72 shrink-0 shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <Image
                  src={category.image}
                  alt={category.alt}
                  width={288}
                  height={200}
                  className="w-full h-40 md:h-48 object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <span className="text-white text-sm font-semibold">{category.alt}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Second loop (duplicate for infinite scroll) */}
          <div className="flex flex-nowrap gap-4 md:gap-5 px-4 md:px-6 min-w-max" aria-hidden="true">
            {specialCategories.map((category, index) => (
              <Link
                key={`${category.slug}-${index}-2`}
                href={`/categories/${category.slug}`}
                className="group relative overflow-hidden rounded-2xl w-56 sm:w-64 md:w-72 shrink-0 shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <Image
                  src={category.image}
                  alt={category.alt}
                  width={288}
                  height={200}
                  className="w-full h-40 md:h-48 object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <span className="text-white text-sm font-semibold">{category.alt}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
