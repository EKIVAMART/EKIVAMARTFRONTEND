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

const CategoriesGrid = () => {
  return (
    <div className="flex flex-col w-[70%]">
      <h3 className="font-semibold text-gray-700 text-[15px] px-1.5 mb-3">
        Categories
      </h3>
      <div className="grid grid-cols-1 gap-1.5 overflow-y-auto max-h-72 pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-50">
        {categories.map((category) => {
          return (
            <Link
              key={category.name}
              href={`/category/${category.slug}`}
              className="flex items-center gap-1.5 p-1.5 rounded-sm transition-all duration-300 bg-white border border-gray-100 text-gray-800 hover:border-emerald-200 hover:shadow-xs"
            >
              <div
                className={`
                w-8 h-8 rounded-sm flex items-center justify-center shrink-0
                ${category.bg}
                transition-all duration-300
              `}
              >
                <Image
                  src={category.icon}
                  alt={category.name}
                  width={20}
                  height={20}
                  className="transition-transform duration-300"
                />
              </div>

              <p className="text-[11px] font-semibold text-gray-800">
                {category.name}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CategoriesGrid;
