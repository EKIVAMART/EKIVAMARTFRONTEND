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
import HelpSection from './HelpSection';
import VisionMission from './VisionMission';

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
        <VisionMission />
        <CoreValues />
        <StoreStats />
        <MeetTheTeam />
        <HelpSection />
    </div>
  );
}