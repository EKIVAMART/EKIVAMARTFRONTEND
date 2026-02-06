'use client';

import Image from 'next/image';
import { assets } from '@/assets/assets';

export default function CategoryPromoBanner() {
  return (
    <div className="w-[70%] flex flex-col gap-4">
      {/* First Promo Image */}
      <div className="relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 group cursor-pointer w-full h-56 sm:h-64">
        <Image
          src={assets.ctp_1}
          alt="Sale Up To 50% Off"
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
      </div>

      {/* Second Promo Image */}
      <div className="relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 group cursor-pointer w-full h-56 sm:h-64">
        <Image
          src={assets.ctp_2}
          alt="Super Grocery Sale"
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
      </div>
    </div>
  );
}
