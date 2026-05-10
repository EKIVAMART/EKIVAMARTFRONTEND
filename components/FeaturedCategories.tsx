import Link from 'next/link';
import Image, { type StaticImageData } from 'next/image';
import fashion from '../assets/fashion.png';
import electronics from '../assets/Electronics.png';
import bags from '../assets/beg.png';
import footwear from '../assets/footwear.png';
import groceries from '../assets/Groceries.png';
import beauty from '../assets/Beauty.png';
import wellness from '../assets/wellness.png';
import jewellery from '../assets/jewellery.png';

type Category = {
  name: string;
  icon: StaticImageData;
  bg: string;
  slug: string;
};

const categories: Category[] = [
  { name: 'Fashion', icon: fashion, bg: 'bg-fuchsia-50', slug: 'fashion' },
  { name: 'Electronics', icon: electronics, bg: 'bg-orange-50', slug: 'electronics' },
  { name: 'Bags', icon: bags, bg: 'bg-pink-50', slug: 'bags' },
  { name: 'Footwear', icon: footwear, bg: 'bg-blue-50', slug: 'footwear' },
  { name: 'Groceries', icon: groceries, bg: 'bg-purple-50', slug: 'groceries' },
  { name: 'Beauty', icon: beauty, bg: 'bg-teal-50', slug: 'beauty' },
  { name: 'Wellness', icon: wellness, bg: 'bg-violet-50', slug: 'wellness' },
  { name: 'Jewellery', icon: jewellery, bg: 'bg-[#fcedf9]', slug: 'jewellery' },
  { name: 'Sports', icon: footwear, bg: 'bg-green-50', slug: 'sports' },
  { name: 'Home', icon: electronics, bg: 'bg-yellow-50', slug: 'home' },
  { name: 'Toys', icon: bags, bg: 'bg-red-50', slug: 'toys' },
  { name: 'Health', icon: wellness, bg: 'bg-cyan-50', slug: 'health' },
  { name: 'Gifts', icon: fashion, bg: 'bg-indigo-50', slug: 'gifts' },
  { name: 'Pets', icon: groceries, bg: 'bg-rose-50', slug: 'pets' },
];

const CategoryCard = ({ category }: { category: Category }) => (
  <Link
    href={`/category/${category.slug}`}
    className="group flex-shrink-0 flex flex-col items-center text-center cursor-pointer"
  >
    <div
      className={`
        w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-full flex items-center justify-center
        ${category.bg}
        transition-all duration-300 ease-out
        group-hover:scale-110
        group-hover:shadow-xl
        group-hover:ring-4
        group-hover:ring-[#c800ff]/25
      `}
    >
      <Image
        src={category.icon}
        alt={category.name}
        width={48}
        height={42}
        className="transition-transform duration-300 group-hover:scale-110 object-contain"
      />
    </div>
    <p className="mt-3 text-xs sm:text-sm font-semibold text-gray-700 group-hover:text-[#c800ff] transition-colors duration-300 whitespace-nowrap">
      {category.name}
    </p>
  </Link>
);

const FeaturedCategories = () => {
  return (
    <section className="overflow-hidden w-full bg-gradient-to-r from-[#fdf4ff] via-[#f5eeff] to-[#fdf4ff] py-8 border-y border-[#e8d5f5]">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="h-px w-8 bg-gradient-to-r from-[#c800ff] to-transparent rounded-full" />
          <span className="text-[10px] font-black uppercase tracking-[3.5px] text-[#c800ff]/80">Browse</span>
          <span className="h-px w-8 bg-gradient-to-l from-[#c800ff] to-transparent rounded-full" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
          Featured Categories
        </h2>
        <p className="mt-1 text-sm text-gray-500">Browse our wide range of product categories</p>
      </div>

      {/* Marquee */}
      <div className="relative flex overflow-hidden py-3">
        {/* Fade edges — match section bg */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-[#fdf4ff] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-[#f5f0ff] to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee hover:[animation-play-state:paused]">
          {/* First loop */}
          <div className="flex flex-nowrap gap-8 sm:gap-12 px-4 sm:px-8 min-w-max">
            {categories.map((category, index) => (
              <CategoryCard key={`a-${category.name}-${index}`} category={category} />
            ))}
          </div>
          {/* Second loop for seamless infinite scroll */}
          <div className="flex flex-nowrap gap-8 sm:gap-12 px-4 sm:px-8 min-w-max" aria-hidden="true">
            {categories.map((category, index) => (
              <CategoryCard key={`b-${category.name}-${index}`} category={category} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
