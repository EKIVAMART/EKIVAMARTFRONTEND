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
  { name: 'Fashion', icon: fashion, bg: 'bg-white', slug: 'fashion' },
  {
    name: 'Electronics',
    icon: electronics,
    bg: 'bg-orange-50',
    slug: 'electronics',
  },
  { name: 'Bags', icon: bags, bg: 'bg-pink-50', slug: 'bags' },
  { name: 'Footwear', icon: footwear, bg: 'bg-blue-50', slug: 'footwear' },
  { name: 'Groceries', icon: groceries, bg: 'bg-purple-50', slug: 'groceries' },
  { name: 'Beauty', icon: beauty, bg: 'bg-teal-50', slug: 'beauty' },
  { name: 'Wellness', icon: wellness, bg: 'bg-violet-50', slug: 'wellness' },
  { name: 'Jewellery', icon: jewellery, bg: 'bg-[#fcedf9]', slug: 'jewellery' },
  // Additional categories
  { name: 'Sports', icon: footwear, bg: 'bg-green-50', slug: 'sports' },
  { name: 'Home', icon: electronics, bg: 'bg-yellow-50', slug: 'home' },
  { name: 'Toys', icon: bags, bg: 'bg-red-50', slug: 'toys' },
  { name: 'Health', icon: wellness, bg: 'bg-cyan-50', slug: 'health' },
  { name: 'Gifts', icon: fashion, bg: 'bg-indigo-50', slug: 'gifts' },
  { name: 'Pets', icon: groceries, bg: 'bg-rose-50', slug: 'pets' },
];

const FeaturedCategories = () => {
  return (
    <section className="mx-auto py-8 md:py-6 lg:py-8 overflow-hidden">
      <h2 className="text-lg font-semibold mb-6 text-black w-[95%] mx-auto">
        Featured Categories
      </h2>

      <div className="relative flex overflow-hidden pt-4 pb-4">
        <div className="flex animate-marquee hover:[animation-play-state:paused]">
          {/* First loop */}
          <div className="flex flex-nowrap gap-8 sm:gap-14 px-4 sm:px-7 min-w-max">
            {categories.map((category, index) => (
              <Link
                key={`${category.name}-${index}`}
                href={`/category/${category.slug}`}
                className="group flex-shrink-0 flex flex-col items-center text-center cursor-pointer transition-transform duration-300 hover:-translate-y-2"
              >
            <div
              className={`
                w-20 h-20 rounded-full flex items-center justify-center 
                ${category.bg}
                transition-all duration-300 ease-out
                group-hover:scale-110
                group-hover:shadow-lg
                group-hover:ring-4
                group-hover:ring-black/10
              `}
            >
              <Image
                src={category.icon}
                alt={category.name}
                width={60}
                height={50}
                className="transition-transform duration-300 group-hover:scale-110"
              />
            </div>

            <p
              className="
                mt-3 text-sm font-semibold text-black
                transition-colors duration-300
                group-hover:text-gray-900
              "
            >
              {category.name}
            </p>
          </Link>
        ))}
          </div>

          {/* Second loop (duplicate for infinite scroll) */}
          <div className="flex flex-nowrap gap-8 sm:gap-14 px-4 sm:px-7 min-w-max" aria-hidden="true">
            {categories.map((category, index) => (
              <Link
                key={`second-${category.name}-${index}`}
                href={`/category/${category.slug}`}
                className="group flex-shrink-0 flex flex-col items-center text-center cursor-pointer transition-transform duration-300 hover:-translate-y-2"
              >
            <div
              className={`
                w-20 h-20 rounded-full flex items-center justify-center 
                ${category.bg}
                transition-all duration-300 ease-out
                group-hover:scale-110
                group-hover:shadow-lg
                group-hover:ring-4
                group-hover:ring-black/10
              `}
            >
              <Image
                src={category.icon}
                alt={category.name}
                width={60}
                height={50}
                className="transition-transform duration-300 group-hover:scale-110"
              />
            </div>

            <p
              className="
                mt-3 text-sm font-semibold text-black
                transition-colors duration-300
                group-hover:text-gray-900
              "
            >
              {category.name}
            </p>
          </Link>
        ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
