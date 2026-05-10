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
    <section className="w-full px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-br from-[#fdf4ff] via-[#f5eeff] to-[#fdf4ff] px-6 sm:px-8 lg:px-10 py-10 border border-[#e8d5f5] shadow-sm relative overflow-hidden">

          {/* Subtle background glow */}
          <div className="absolute top-[-50%] right-[10%] w-[40vw] h-[40vw] max-w-[300px] max-h-[300px] rounded-full bg-[#c800ff] opacity-[0.06] blur-[80px] pointer-events-none" />

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-6 bg-gradient-to-r from-[#c800ff] to-transparent rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[3.5px] text-[#c800ff]/80">Why Faflora</span>
            <span className="h-px w-6 bg-gradient-to-l from-[#c800ff] to-transparent rounded-full" />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-2xl bg-white/70 p-4 border border-[#e8d5f5] transition-all duration-200 hover:shadow-md hover:border-[#c800ff]/30 hover:-translate-y-0.5 group cursor-default"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#fcedf9] to-[#f0d0f5] group-hover:from-[#f0c8fa] group-hover:to-[#e0b0f0] transition-colors duration-200">
                  <Image
                    src={feature.icon}
                    alt={feature.title}
                    width={22}
                    height={22}
                  />
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-800 group-hover:text-[#c800ff] transition-colors duration-200">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-gray-500">{feature.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
