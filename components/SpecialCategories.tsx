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
    <section className="special-categories-section overflow-hidden">
      <div className="special-categories-container relative flex overflow-hidden py-4">
        
        <div className="flex animate-marquee hover:[animation-play-state:paused]">
          {/* First loop */}
          <div className="flex flex-nowrap gap-4 md:gap-5 px-2 md:px-2.5 min-w-max">
            {specialCategories.map((category, index) => (
              <Link
                key={`${category.slug}-${index}-1`}
                href={`/category/${category.slug}`}
                className="special-category-item group relative overflow-hidden rounded-xl w-60 md:w-72 shrink-0"
              >
                <Image
                  src={category.image}
                  alt={category.alt}
                  width={280}
                  height={200}
                  className="w-full h-40 md:h-48 object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
              </Link>
            ))}
          </div>

          {/* Second loop (duplicate for infinite scroll) */}
          <div className="flex flex-nowrap gap-4 md:gap-5 px-2 md:px-2.5 min-w-max" aria-hidden="true">
            {specialCategories.map((category, index) => (
              <Link
                key={`${category.slug}-${index}-2`}
                href={`/category/${category.slug}`}
                className="special-category-item group relative overflow-hidden rounded-xl w-60 md:w-72 shrink-0"
              >
                <Image
                  src={category.image}
                  alt={category.alt}
                  width={280}
                  height={200}
                  className="w-full h-40 md:h-48 object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
              </Link>
            ))}
          </div>
        </div>

      </div>

      <style jsx>{`
        .special-categories-section {
          width: 100%;
          background: #ffffff;
          padding: 0;
          margin: 0;
        }

        .special-categories-container {
          max-width: 1400px;
          margin: 0 auto;
          width: 95%;
          padding: 0;
        }

        .special-categories-scroll {
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }

        .special-categories-scroll::-webkit-scrollbar {
          display: none;
        }

        .special-category-item {
          display: block;
          cursor: pointer;
          transition: all 0.3s ease-out;
        }

        .special-category-item:hover {
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
        }

        .special-category-item-mobile {
          display: block;
          cursor: pointer;
          transition: all 0.3s ease-out;
        }

        .special-category-item-mobile:hover {
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
        }

        .scroll-button-left,
        .scroll-button-right {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          font-size: 28px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          z-index: 10;
        }

        .scroll-button-left:hover,
        .scroll-button-right:hover {
          background: rgba(0, 0, 0, 0.8);
          transform: translateY(-50%) scale(1.1);
        }

        .scroll-button-left {
          left: 10px;
        }

        .scroll-button-right {
          right: 10px;
        }

        @media (max-width: 768px) {
          .special-categories-section {
            padding-top: 0;
            padding-bottom: 32px;
            padding-left: 0;
            padding-right: 0;
          }

          .special-categories-container {
            width: 95%;
          }

          .scroll-button-left,
          .scroll-button-right {
            width: 36px;
            height: 36px;
            font-size: 24px;
          }
        }

        @media (max-width: 480px) {
          .special-categories-section {
            padding-top: 16px;
            padding-bottom: 24px;
            padding-left: 0;
            padding-right: 0;
          }

          .special-categories-container {
            width: 95%;
          }

          .scroll-button-left,
          .scroll-button-right {
            width: 32px;
            height: 32px;
            font-size: 20px;
          }
        }
      `}</style>
    </section>
  );
}
