"use client";

import Image from "next/image";
import { Mail } from "lucide-react";
import newsletterImg from "@/public/newsletter.png";

export default function HeroSubscribe() {
  return (
    <section className="w-full py-12">
      <div className="mx-auto flex w-[95%] flex-col items-center justify-between gap-10 rounded-3xl bg-[#E9FFF3] px-6 py-14 md:flex-row md:px-14">
        
        {/* LEFT CONTENT */}
        <div className="max-w-xl">
          <h1 className="mb-4 text-3xl font-bold leading-snug text-[#3A3A3A] md:text-4xl">
            Stay home & get your daily <br />
            needs from our shop
          </h1>

          <p className="mb-8 text-base text-gray-500">
            Start Your Daily Shopping with Nest Mart
          </p>

          {/* SUBSCRIBE INPUT */}
          <div className="flex max-w-md items-center overflow-hidden rounded-full bg-white shadow-sm">
            
            {/* Mail Icon */}
            <div className="flex items-center px-4 text-gray-400">
              <Mail size={18} />
            </div>

            {/* Input */}
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-2 py-3 text-sm text-gray-600 outline-none"
            />

            {/* Button */}
            <button className="rounded-full bg-green-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-green-700">
              Subscribe
            </button>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="relative w-full max-w-md">
          <Image
            src={newsletterImg}
            alt="Subscribe illustration"
            width={450}
            height={350}
            className="w-full object-contain"
            priority
          />
        </div>
      </div>
    </section>
  );
}
