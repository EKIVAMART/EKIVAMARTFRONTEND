'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Users, Box, MapPin, CheckCircle2,
  Building2, Briefcase, Factory, Landmark, Truck, Wrench,
  Stethoscope, Scissors, Plane, GraduationCap, HardHat, Store,
  ShoppingBag, Shirt, Smartphone, Monitor, Car, BookOpen,
  Coffee, Utensils, Package, Gift, Camera, Headphones
} from 'lucide-react';
import aptImg from '../assets/imgapt.jpg';
import CoreValues from './CoreValues';
import StoreStats from './StoreStats';
import MeetTheTeam from './MeetTheTeam';

// --- Shared Components ---
const TealButton = ({ text }: { text: string }) => (
  <button className="flex items-center gap-2 bg-gradient-to-r from-[#9d4ae3] to-[#8236be] text-white px-6 py-3 rounded-md font-bold hover:bg-[#366d64] transition-all group">
    {text} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
  </button>
);

const SectionHeading = ({ sub, title }: { sub: string; title: string }) => (
  <div className="mb-6">
    <span className="text-[#9d4ae3] font-bold uppercase tracking-widest text-sm">{sub}</span>
    <h2 className="text-4xl font-extrabold text-[#9d4ae3] mt-2">{title}</h2>
  </div>
);

export default function AboutUs() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
     <div >
       <div className="relative w-full h-[70svh] min-h-[420px] md:h-[85svh] lg:h-screen overflow-hidden ">
      <Image
        src={aptImg}
        alt="About Us Image"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center z-0"
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-t md:bg-gradient-to-r from-[#9d4ae3]/80 via-[#8236be]/50 to-transparent" />
      <div className="absolute inset-0 z-20 flex flex-col items-left justify-center text-left p-4  ml-10">
        <h1 className="text-5xl md:text-5xl font-bold text-white mb-4 text-yellow-400">The Easy Way to Do Business.</h1>
        <p className="text-lg text-white max-w-2xl">
           Everything you need to sell online in one place  build your store, manage orders, and reach buyers across Nigeria and beyond.
        </p>
      </div>
    </div>

      <section className="flex min-h-[240px] items-center bg-[#9D4AE3] px-6 py-10 text-white md:min-h-[280px] md:px-12 lg:min-h-[300px] lg:px-16">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-7 md:grid-cols-2 md:gap-16 lg:gap-24">
        {/* Vision */}
        <div>
          <p className="text-2xl leading-tight tracking-tight md:text-3xl lg:text-[32px]">
            <span className="font-bold">Our Vision</span>{" "}
            <span className="font-normal">
              is to be the engine of commerce and trade in Africa.
            </span>
          </p>
        </div>

        {/* Mission */}
        <div>
          <p className="text-base leading-snug md:text-lg">
            <span className="font-bold">Our Mission</span>{" "}
            <span className="font-normal">
              is to create a trusted and vibrant retail ecosystem that
              facilitates trade across Africa - connecting millions of
              buyers and sellers while empowering everyone to grow, thrive,
              and succeed.
            </span>
          </p>

          <p className="mt-5 text-base leading-snug md:text-lg">
            To achieve this, we are committed to enabling buyers, sellers,
            and businesses to access best priced products, transact from
            anywhere, and grow their business with ease.
          </p>
        </div>
      </div>
    </section>
    <CoreValues />
    <StoreStats />
    <MeetTheTeam />
    </div>
  );
}