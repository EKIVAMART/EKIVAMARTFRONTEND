'use client';
import Image from 'next/image';
type Feature = {
  title: string;
  subtitle: string;
  icon: string;
};

const features: Feature[] = [
  {
    title: 'Best prices & offers',
    subtitle: 'Orders #30000 or more',
    icon: '/deal.svg',
  },
  {
    title: 'Free delivery',
    subtitle: 'Orders #30000 or more',
    icon: 'Easy.svg',
  },
  {
    title: 'Great daily deal',
    subtitle: 'Orders #30000 or more',
    icon: 'file.svg',
  },
  {
    title: 'Wide assortment',
    subtitle: 'Orders #30000 or more',
    icon: 'free.svg',
  },
  {
    title: 'Easy returns',
    subtitle: 'Orders #30000 or more',
    icon: 'globe.svg',
  },
];

export default function Features() {
  return (
    <section className="w-full bg-white py-8 md:py-6 lg:py-8">
      <div className="mx-auto grid w-[95%] grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 transition hover:shadow-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f5d2f0]">
              <Image
                src={feature.icon}
                alt={feature.title}
                width={24}
                height={24}
              />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-800">
                {feature.title}
              </h4>
              <p className="text-xs text-gray-500">{feature.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
