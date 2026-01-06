import Slider from "../components/Slider";
import ProductsSection from "../components/ProductsSection";
import Features from "../components/Features";
import HeroSubscribe from "@/components/HeroSubscribe";

export default function Home() {
  return (
    <main className="py-8 px-4">
      <Slider />
      <ProductsSection />
      <HeroSubscribe />
      <Features />
    </main>
  );
 
}