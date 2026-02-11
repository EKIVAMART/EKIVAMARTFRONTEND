import Slider from '../components/Slider';
import ProductsSection from '../components/ProductsSection';
import SpecialCategories from '../components/SpecialCategories';
import FeaturedProducts from '../components/FeaturedProducts';
import Features from '../components/Features';
import HeroSubscribe from '@/components/HeroSubscribe';
import FeaturedCategories from '@/components/FeaturedCategories';

export default function Home() {
  return (
    <main className="w-full">
      <Slider />
      <FeaturedCategories />
      <ProductsSection />
      <SpecialCategories />
      <FeaturedProducts />
      <HeroSubscribe />
      <Features />
    </main>
  );
}
