import Slider from '../components/Slider';
import ProductsSection from '../components/ProductsSection';
import SpecialCategories from '../components/SpecialCategories';
import FeaturedProducts from '../components/FeaturedProducts';
import Features from '../components/Features';
import HeroSubscribe from '@/components/HeroSubscribe';
import FeaturedCategories from '@/components/FeaturedCategories';

export default function Home() {
  return (
    <main className="w-full flex flex-col mb-16 lg:mb-24">
      {/* Slider + Categories sit flush together */}
      <Slider />
      <FeaturedCategories />

      {/* Remaining sections with normal spacing */}
      <div className="flex flex-col gap-12 md:gap-16 lg:gap-20 mt-12 md:mt-16 lg:mt-20">
        <ProductsSection />
        <SpecialCategories />
        <FeaturedProducts />
        <HeroSubscribe />
        <Features />
      </div>
    </main>
  );
}
