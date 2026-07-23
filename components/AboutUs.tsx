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
    <div className="font-sans overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[60vh] flex flex-col items-center justify-center text-center px-4 pt-20">
        <motion.h1 
          className="text-5xl md:text-7xl font-extrabold text-[#9d4ae3] mb-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          Let's Do Business, the Easy Way.
        </motion.h1>
        <p className="text-gray-500 text-lg md:text-xl max-w-2xl leading-relaxed">
          Our mission is to <span className="font-bold text-gray-800">'make doing business easy'</span> and democratize business opportunities for all!
        </p>
        {/* City Skyline Silhouette */}
        <div className="absolute bottom-0 w-full opacity-60">
           <div className="relative w-full">
             {/* Invisible original image just to define the height/ratio exactly */}
             <Image src={indBanner} alt="Skyline Layout" className="w-full h-auto object-cover opacity-0 pointer-events-none" priority />
             {/* Custom colored mask */}
             <div 
               className="absolute inset-0 bg-gradient-to-r from-[#9d4ae3] to-[#8236be]"
               style={{
                 maskImage: `url(${indBanner.src})`,
                 WebkitMaskImage: `url(${indBanner.src})`,
                 maskSize: 'cover',
                 WebkitMaskSize: 'cover',
                 maskPosition: 'bottom',
                 WebkitMaskPosition: 'bottom',
                 maskRepeat: 'no-repeat',
                 WebkitMaskRepeat: 'no-repeat'
               }}
             />
           </div>
        </div>
      </section>

      {/* 2. WHO WE ARE */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeInUp}>
            <SectionHeading sub="WHO" title="WE ARE" />
              <p className="text-gray-600 leading-loose mb-6">
                Faflora is a modern multi-vendor marketplace connecting trusted businesses 
                with customers through a seamless online shopping experience. We empower 
                vendors of all sizes to showcase their products, grow their businesses, 
                and reach more customers across Nigeria and beyond.
              </p>

              <p className="text-gray-600 leading-loose mb-8">
                Our mission is to make buying and selling simple, secure, and accessible. 
                By combining innovative technology with a customer first approach, we help businesses thrive while providing shoppers 
                with quality products, competitive prices, and reliable service all in one place.
              </p>
            <TealButton text="Our Core Values" />
          </motion.div>

          {/* Stats Grid */}
          <motion.div className="space-y-12" {...fadeInUp}>
             <div className="flex items-center gap-8">
                <div className="text-right w-32">
                  <h3 className="text-4xl font-black text-[#9d4ae3]">100+</h3>
                  <p className="text-gray-500 font-bold">Industries</p>
                </div>
                <div className="flex-1 grid grid-cols-6 gap-2 border-l pl-8 opacity-80">
                   {[Building2, Briefcase, Factory, Landmark, Truck, Wrench, Stethoscope, Scissors, Plane, GraduationCap, HardHat, Store].map((Icon, i) => <div key={i} className="w-8 h-8 bg-gray-100 rounded-sm flex items-center justify-center"><Icon size={20} className="text-[#9d4ae3]" /></div>)}
                </div>
             </div>
             <div className="flex items-center gap-8">
                <div className="text-right w-32">
                  <h3 className="text-4xl font-black text-[#9d4ae3]">500+</h3>
                  <p className="text-gray-500 font-bold">Vendors</p>
                </div>
                <div className="flex-1 grid grid-cols-6 gap-2 border-l pl-8 opacity-80">
                   {[ShoppingBag, Shirt, Smartphone, Monitor, Car, BookOpen, Coffee, Utensils, Package, Gift, Camera, Headphones].map((Icon, i) => <div key={i} className="w-8 h-8 bg-gray-100 rounded-sm flex items-center justify-center"><Icon size={20} className="text-[#9d4ae3]" /></div>)}
                </div>
             </div>
             <div className="flex items-center gap-8">
                <div className="text-right w-32">
                  <h3 className="text-4xl font-black text-[#9d4ae3]">6+</h3>
                  <p className="text-gray-500 font-bold">Cities</p>
                </div>
                <div className="flex-1 border-l pl-8">
                   <MapPin className="text-[#9d4ae3] opacity-20" size={60} />
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* 3. WHAT WE DO */}
      <section className="py-24 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
          <motion.div className="relative" {...fadeInUp}>
             <div className="w-full aspect-square bg-[#303385] rounded-[40%_60%_70%_30%_/_40%_50%_60%_40%] overflow-hidden relative z-10">
                <Image src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80" alt="Handshake" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" loading="lazy" />
             </div>
             <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-600 rounded-full -z-0 opacity-80" />
             <div className="absolute bottom-10 right-10 w-20 h-20 bg-gray-300 rounded-full -z-0" />
          </motion.div>

          <motion.div {...fadeInUp}>
            <SectionHeading sub="WHAT" title="WE DO" />
            <p className="text-gray-600 leading-loose mb-6">
              With a focus on digital and financial inclusion, we empower businesses of all sizes by 
              providing seamless access to a vast digital marketplace.
            </p>
            <ul className="space-y-4 mb-8">
              {['Enhanced business visibility', 'Increased brand credibility', 'Efficient lead management'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-700 font-medium">
                  <div className="w-2 h-2 rounded-full bg-gray-800" /> {item}
                </li>
              ))}
            </ul>
            <TealButton text="Explore Paid Services" />
          </motion.div>
        </div>
      </section>

      

      {/* 5. LEADERSHIP TEAM */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-16 items-center">
          <motion.div className="grid grid-cols-3 gap-4 flex-1" {...fadeInUp}>
             {[...Array(9)].map((_, i) => (
               <div key={i} className={`relative aspect-square rounded-xl overflow-hidden ${['bg-green-100', 'bg-blue-100', 'bg-yellow-100', 'bg-red-100'][i % 4]}`}>
                  <Image src={`https://i.pravatar.cc/150?u=${i}`} alt="Leader" fill className="object-cover mix-blend-multiply" sizes="(max-width: 768px) 33vw, 150px" loading="lazy" />
               </div>
             ))}
          </motion.div>
          <motion.div className="flex-1" {...fadeInUp}>
            <SectionHeading sub="MEET OUR" title="LEADERSHIP TEAM" />
            <p className="text-gray-600 leading-loose mb-8">
              Our leadership team consists of seasoned executives with years of experience and expertise 
              in their respective fields, guiding us in creating value for all our stakeholders.
            </p>
            <TealButton text="Our Leadership at a Glance" />
          </motion.div>
        </div>
      </section>

      {/* 6. HISTORY SECTION */}
      {/* <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeInUp}>
            <SectionHeading sub="OUR" title="HISTORY" />
            <p className="text-gray-600 leading-loose mb-8">
              The story began in 1996, when Mr. Dinesh Agarwal embarked on a journey that started 
              with a simple idea of website development but with a big dream to 'make doing business easy' for all.
            </p>
            <TealButton text="Our Milestones" />
          </motion.div>
          <motion.div className="relative" {...fadeInUp}>
             <Image src="https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&q=80" alt="Old Office" width={800} height={600} className="w-full h-auto rounded-lg shadow-xl" sizes="(max-width: 768px) 100vw, 50vw" loading="lazy" />
             <div className="absolute -bottom-10 -right-5 w-64 bg-white p-4 shadow-2xl rounded-md border transform rotate-3">
                <p className="text-[10px] text-gray-400 font-bold mb-2">OPENING CEREMONY</p>
                <div className="w-full h-40 bg-orange-50 rounded" />
             </div>
          </motion.div>
        </div>
      </section> */}

      {/* 7. SOCIAL RESPONSIBILITY */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row-reverse gap-16 items-center">
          <motion.div className="flex-1" {...fadeInUp}>
            <span className="font-bold uppercase tracking-widest text-sm text-blue-300">OUR SOCIAL</span>
            <h2 className="text-4xl font-extrabold mt-2 mb-6">RESPONSIBILITY</h2>
            <p className="opacity-80 leading-loose mb-8">
              We're passionate about helping vendors grow and making online shopping effortless. Every order 
              placed on Faflora supports local businesses and brings communities closer through commerce.
            </p>
            <TealButton text="Our Social Impact" />
          </motion.div>
          <motion.div className="flex-1 relative h-[400px]" {...fadeInUp}>
             {/* Cluster of circles representing Image 7 */}
             <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-4 border-white overflow-hidden relative"><Image src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80" alt="Impact Image 1" fill className="object-cover" sizes="(max-width: 768px) 50vw, 30vw" loading="lazy" /></div>
             <div className="absolute top-20 right-0 w-56 h-56 rounded-full border-4 border-white overflow-hidden relative"><Image src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80" alt="Impact Image 2" fill className="object-cover" sizes="(max-width: 768px) 50vw, 30vw" loading="lazy" /></div>
             <div className="absolute bottom-0 left-20 w-40 h-40 rounded-full border-4 border-white overflow-hidden relative"><Image src="https://images.unsplash.com/photo-1524069290683-0457abfe42c3?auto=format&fit=crop&q=80" alt="Impact Image 3" fill className="object-cover" sizes="(max-width: 768px) 50vw, 30vw" loading="lazy" /></div>
          </motion.div>
        </div>
      </section>

      {/* 8. JOIN THE TEAM (Final Section Image 9) */}
      <section className="relative py-32 bg-gray-900 text-white overflow-hidden text-center">
        <div className="absolute inset-0 opacity-30 bg-gray-900 border-none">
          <Image src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80" alt="Hands" fill className="object-cover mix-blend-screen" sizes="100vw" loading="lazy" />
        </div>
        <motion.div className="relative z-10 max-w-2xl mx-auto px-6" {...fadeInUp}>
          <SectionHeading sub="JOIN THE" title="TEAM" />
          <p className="opacity-80 leading-loose mb-10 text-lg">At Faflora, we're on a mission to make online shopping easier, smarter,
             and more accessible. We're always looking for passionate individuals 
             who are eager to learn, innovate, and grow with us. If you're ready to make an 
             impact and be part of our success story, join the Faflora team. </p>
          <div className="flex justify-center">
            <TealButton text="View Open Roles" />
          </div>
        </motion.div>
      </section>

    </div>
  );
}