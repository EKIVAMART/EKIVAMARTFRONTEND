import Image from 'next/image';
import Link from 'next/link';
import AdCarousel from '@/components/home/AdCarousel';
import CategoryScroller from '@/components/home/CategoryScroller';
import FlashSaleSection from '@/components/home/FlashSaleSection';
import ProductCarousel from '@/components/home/ProductCarousel';

// Each ad section cycles through 4 slides. Only two distinct banner assets
// were supplied (Ad_image.png, shop_sale_banner.png), so each carousel
// repeats them to fill out the 4-slide requirement.
const leftAdSlides = [
  { src: '/images/Ad_image.png', alt: 'Up to 50% off — stay connected' },
  { src: '/images/shop_sale_banner.png', alt: 'TV Tuesday — up to 25% off' },
  { src: '/images/Ad_image.png', alt: 'Up to 50% off — stay connected' },
  { src: '/images/shop_sale_banner.png', alt: 'TV Tuesday — up to 25% off' },
];

const rightAdSlides = [
  { src: '/images/shop_sale_banner.png', alt: 'TV Tuesday — up to 25% off' },
  { src: '/images/Ad_image.png', alt: 'Up to 50% off — stay connected' },
  { src: '/images/shop_sale_banner.png', alt: 'TV Tuesday — up to 25% off' },
  { src: '/images/Ad_image.png', alt: 'Up to 50% off — stay connected' },
];

const shopTheSaleBanners = Array.from({ length: 5 }).map((_, i) => ({
  src: '/images/shop_sale_banner.png',
  alt: 'TV Tuesday — up to 25% off',
  key: `shop-sale-${i}`,
}));

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50 pb-0">
      {/* Zone 1: Ads + Category Scroller */}
      <div className="bg-[#8236be] w-full">
        <section className="px-4 md:px-12 py-3 md:py-4">
          <div className="grid md:gap-3 gap-2 sm:grid-cols-2">
            <AdCarousel images={leftAdSlides} className="h-20 md:h-[144px]" />
            <AdCarousel images={rightAdSlides} className="h-20 md:h-[144px]" />
          </div>
        </section>
        <CategoryScroller />
      </div>

      {/* Flash Sale bridge split */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 bottom-1/2 bg-[#8236be]" />
        <div className="absolute inset-x-0 top-1/2 bottom-0 bg-[#f3ecfc]" />
        <div className="relative z-10 px-4 md:px-12 pt-4 pb-6">
          <FlashSaleSection />
        </div>
      </div>

      {/* Zone 2: Featured Products */}
      <div className="bg-[#f3ecfc] w-full pt-0 pb-6">
        <div className="px-4 md:px-12 w-full">
          <div className="bg-brand-600 overflow-hidden shadow-lg">
            <ProductCarousel
              title="Featured Products"
              viewAllHref="/categories/shop"
              titleColor="text-neutral-50"
              viewAllVariant="featured"
              icon={<Image key="featured-icon" src="/icons/tag.png" alt="" width={20} height={20} aria-hidden />}
            />
          </div>
        </div>
      </div>

      {/* Fashion bridge split */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 bottom-1/2 bg-[#f3ecfc]" />
        <div className="absolute inset-x-0 top-1/2 bottom-0 bg-[#8236be]" />
        <div className="relative z-10 px-4 md:px-12 py-6">
          <div className="bg-brand-50 border border-brand-100 overflow-hidden shadow-sm">
            <ProductCarousel
              title="Fashion"
              viewAllHref="/categories/fashion"
              titleColor="text-neutral-800"
            />
          </div>
        </div>
      </div>

      {/* Zone 3: Footwear, Bags, Jewellery & Mobile Accessories */}
      <div className="bg-[#8236be] w-full pt-0 pb-6">
        <div className="px-4 md:px-12 mb-6 w-full">
          <div className="bg-brand-50 border border-brand-100 overflow-hidden shadow-sm">
            <ProductCarousel
              title="Foot wear"
              viewAllHref="/categories/footwear"
              titleColor="text-neutral-800"
            />
          </div>
        </div>

        <div className="px-4 md:px-12 mb-6 w-full">
          <div className="bg-brand-50 border border-brand-100 overflow-hidden shadow-sm">
            <ProductCarousel
              title="Bags & Luggages"
              viewAllHref="/categories/bags--luggage"
              titleColor="text-neutral-800"
            />
          </div>
        </div>

        <div className="px-4 md:px-12 mb-6 w-full">
          <div className="bg-brand-50 border border-brand-100 overflow-hidden shadow-sm">
            <ProductCarousel
              title="Jewellery & Fashion Accessories"
              viewAllHref="/categories/jewelry--fashion-accessories"
              titleColor="text-neutral-800"
            />
          </div>
        </div>

        <div className="px-4 md:px-12 mb-0 w-full">
          <div className="bg-brand-50 border border-brand-100 overflow-hidden shadow-sm">
            <ProductCarousel
              title="Mobile Phones & Accessories"
              viewAllHref="/categories/mobile-phones--accessories"
              titleColor="text-neutral-800"
            />
          </div>
        </div>
      </div>

      {/* Zone 4: Marquee & Footer */}
      <div className="bg-neutral-50 w-full pt-10 pb-0 relative z-10">
        {/* Shop the sale marquee */}
        <section className="w-full overflow-hidden pb-10">
          {/* Section Header */}
          <div className="px-4 md:px-12 mb-6">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-800">Shop the sale</h2>
            <p className="mt-1 text-sm md:text-lg text-neutral-700">Trending deals across categories</p>
          </div>

          {/* Marquee */}
          <div className="relative flex overflow-hidden py-4">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-neutral-50 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-neutral-50 to-transparent z-10 pointer-events-none" />

            <div className="flex animate-marquee hover:[animation-play-state:paused]">
              {/* First loop */}
              <div className="flex flex-nowrap gap-4 md:gap-5 px-4 md:px-6 min-w-max">
                {shopTheSaleBanners.map((banner, index) => (
                  <Link
                    key={`${banner.key}-${index}-1`}
                    href="/categories/shop"
                    className="group relative overflow-hidden rounded-2xl w-56 sm:w-64 md:w-72 shrink-0 shadow-md hover:shadow-xl transition-shadow duration-300 bg-neutral-50"
                  >
                    <Image
                      src={banner.src}
                      alt={banner.alt}
                      width={288}
                      height={200}
                      className="w-full h-28 md:h-48 object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <span className="text-white text-sm font-semibold">{banner.alt}</span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Second loop */}
              <div className="flex flex-nowrap gap-4 md:gap-5 px-4 md:px-6 min-w-max" aria-hidden="true">
                {shopTheSaleBanners.map((banner, index) => (
                  <Link
                    key={`${banner.key}-${index}-2`}
                    href="/categories/shop"
                    className="group relative overflow-hidden rounded-2xl w-56 sm:w-64 md:w-72 shrink-0 shadow-md hover:shadow-xl transition-shadow duration-300 bg-neutral-50"
                  >
                    <Image
                      src={banner.src}
                      alt={banner.alt}
                      width={288}
                      height={200}
                      className="w-full h-28 md:h-48 object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <span className="text-white text-sm font-semibold">{banner.alt}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
  
      </div>
    </main>
  );
}
