import Image, { type StaticImageData } from "next/image";
import fashion from "../assets/fashion.png";
import electronics from "../assets/Electronics.png";
import bags from "../assets/beg.png";
import footwear from "../assets/footwear.png";
import groceries from "../assets/Groceries.png";
import beauty from "../assets/Beauty.png";
import wellness from "../assets/wellness.png";
import jewellery from "../assets/jewellery.png";

type Category = {
  name: string;
  icon: StaticImageData;
  bg: string;
};

const categories: Category[] = [
  { name: "Fashion", icon: fashion, bg: "bg-white" },
  { name: "Electronics", icon: electronics, bg: "bg-orange-50" },
  { name: "Bags", icon: bags, bg: "bg-pink-50" },
  { name: "Footwear", icon: footwear, bg: "bg-blue-50" },
  { name: "Groceries", icon: groceries, bg: "bg-purple-50" },
  { name: "Beauty", icon: beauty, bg: "bg-teal-50" },
  { name: "Wellness", icon: wellness, bg: "bg-violet-50" },
  { name: "Jewellery", icon: jewellery, bg: "bg-green-50" },
];

const FeaturedCategories = () => {
  return (
    <section className="w-[95%] mx-auto py-8">
  <h2 className="text-lg font-semibold mb-6 text-black">Featured Categories</h2>

  <div className="flex flex-wrap gap-6 justify-between">
    {categories.map((category) => (
      <div
        key={category.name}
        className="flex flex-col items-center text-center cursor-pointer"
      >
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center ${category.bg}`}
        >
          <Image
            src={category.icon}
            alt={category.name}
            width={60}
            height={50}
          />
        </div>

        <p className="mt-3 text-sm font-medium text-black">
          {category.name}
        </p>
      </div>
    ))}
  </div>
</section>

  );
};

export default FeaturedCategories;
