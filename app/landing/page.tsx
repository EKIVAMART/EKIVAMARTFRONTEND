import Image from 'next/image';
import Navbar from '@/components/home/Navbar';
import AdCarousel from '@/components/home/AdCarousel';
import CategoryScroller from '@/components/home/CategoryScroller';
import FlashSaleSection from '@/components/home/FlashSaleSection';
import ProductCarousel from '@/components/home/ProductCarousel';
import Footer from '@/components/home/Footer';
import {
  featuredProducts,
  fashionProducts,
  footwearProducts,
  bagsProducts,
  jewelleryProducts,
  mobileAccessoriesProducts,
} from '@/lib/data/products';

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
    <main className="min-h-screen bg-neutral-50 pb-16 md:pb-0">
      <Navbar />

      {/* Hero: two ad carousels side by side — white/neutral-50 bg */}
      <section className="grid md:gap-3 gap-2 bg-white px-4 md:px-12 py-3 md:py-4 sm:grid-cols-2 md:px-6">
        <AdCarousel images={leftAdSlides} className="h-20 md:h-36" />
        <AdCarousel images={rightAdSlides} className="h-20 md:h-36 " />
      </section>

      {/* Desktop category scroller — brand purple bg (handled inside component) */}
      <CategoryScroller />

      {/* Flash Sales — rounded card, red only on heading */}
      <FlashSaleSection />

      {/* Featured Products — white bg */}
      <section className="bg-white">
        <ProductCarousel
          title="Featured Products"
          products={featuredProducts}
          icon={<Image src="/icons/solar_star-fall-bold-duotone.png" alt="" width={20} height={20} aria-hidden />}
        />
      </section>

      {/* Fashion — light gray bg */}
      <section className="bg-neutral-50">
        <ProductCarousel
          title="Fashion"
          products={fashionProducts}
          icon={<Image src="/icons/ph_shopping-bag-duotone.png" alt="" width={20} height={20} aria-hidden />}
        />
      </section>

      {/* Foot wear — white bg */}
      <section className="bg-white">
        <ProductCarousel
          title="Foot wear"
          products={footwearProducts}
          icon={<Image src="/icons/ph_shopping-bag-duotone.png" alt="" width={20} height={20} aria-hidden />}
        />
      </section>

      {/* Bags & Luggages — light gray bg */}
      <section className="bg-neutral-50">
        <ProductCarousel
          title="Bags & Luggages"
          products={bagsProducts}
          icon={<Image src="/icons/ph_shopping-bag-duotone.png" alt="" width={20} height={20} aria-hidden />}
        />
      </section>

      {/* Jewellery — white bg */}
      <section className="bg-white">
        <ProductCarousel
          title="Jewellery & Fashion Accessories"
          products={jewelleryProducts}
          icon={<Image src="/icons/ph_shopping-bag-duotone.png" alt="" width={20} height={20} aria-hidden />}
        />
      </section>

      {/* Mobile Phones — light gray bg */}
      <section className="bg-neutral-50">
        <ProductCarousel
          title="Mobile Phones & Accessories"
          products={mobileAccessoriesProducts}
          icon={<Image src="/icons/ph_shopping-bag-duotone.png" alt="" width={20} height={20} aria-hidden />}
        />
      </section>

      {/* Shop the sale — white bg strip of 5 trending deal banners */}
      <section className="bg-white px-4 py-6 md:px-6">
        <h2 className="mb-1 text-base font-semibold text-neutral-900 sm:text-lg">Shop the sale</h2>
        <p className="mb-3 text-sm text-neutral-500">Trending deals across categories</p>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {shopTheSaleBanners.map((banner) => (
            <div key={banner.key} className="relative h-24 w-40 shrink-0 overflow-hidden rounded-xl">
              <Image src={banner.src} alt={banner.alt} fill sizes="160px" className="object-cover" />
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
