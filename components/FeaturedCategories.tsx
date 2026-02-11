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
  { name: 'Jewellery', icon: jewellery, bg: 'bg-green-50', slug: 'jewellery' },
];

const FeaturedCategories = () => {
  return (
    <section className="w-[95%] mx-auto py-8 md:py-6 lg:py-8">
      <h2 className="text-lg font-semibold mb-6 text-black">
        Featured Categories
      </h2>

      <div className="flex flex-wrap gap-6 justify-between">
        {categories.map((category) => (
          <Link
            key={category.name}
            href={`/category/${category.slug}`}
            className="group flex flex-col items-center text-center cursor-pointer transition-transform duration-300 hover:-translate-y-2"
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
    </section>
  );
};

export default FeaturedCategories;
