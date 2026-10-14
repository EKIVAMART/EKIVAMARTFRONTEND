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
import indBanner from '../assets/industries-banner.webp';

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
      <div className=" relative h-screen overflow-hidden w-full">
          <Image 
             src=""
            />
      </div>
  );
}