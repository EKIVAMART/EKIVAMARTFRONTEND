'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
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
];

export default function SpecialCategories() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft <
          container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(handleScroll, 100);
    }
  };

  return (
    <section className="special-categories-section">
      <div className="special-categories-container">
        {/* Desktop View */}
        <div className="hidden md:grid grid-cols-4 gap-5">
          {specialCategories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="special-category-item group relative overflow-hidden rounded-xl"
            >
              <Image
                src={category.image}
                alt={category.alt}
                width={280}
                height={200}
                className="w-full h-48 object-cover transition-transform duration-300 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
            </Link>
          ))}
        </div>

        {/* Mobile View - Horizontal Scroll */}
        <div className="md:hidden relative">
          <div
            className="special-categories-scroll flex gap-4 overflow-x-auto scroll-smooth"
            ref={scrollContainerRef}
            onScroll={handleScroll}
          >
            {specialCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="special-category-item-mobile group relative shrink-0 overflow-hidden rounded-xl"
              >
                <Image
                  src={category.image}
                  alt={category.alt}
                  width={260}
                  height={180}
                  className="w-72 h-44 object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
              </Link>
            ))}
          </div>

          {/* Scroll Buttons */}
          <button
            className={`scroll-button-left ${canScrollLeft ? 'opacity-100' : 'opacity-30'}`}
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            ‹
          </button>
          <button
            className={`scroll-button-right ${canScrollRight ? 'opacity-100' : 'opacity-30'}`}
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            ›
          </button>
        </div>
      </div>

      <style jsx>{`
        .special-categories-section {
          width: 100%;
          background: #ffffff;
          padding: -10px 0;
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
            padding: 8px 0;
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
            padding: 6px 0;
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
