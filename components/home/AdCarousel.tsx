'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface AdCarouselProps {
  images: { src: string; alt: string }[];
  intervalMs?: number;
  className?: string;
}

/** Sliding carousel of banner images — auto-advances, one image visible at a
 * time, with dot indicators. Used for both ad sections (each cycles through
 * 4 slides). */
export default function AdCarousel({ images, intervalMs = 4000, className = '' }: AdCarouselProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [images.length, intervalMs]);

  return (
    <div className={`relative overflow-hidden rounded-lg md:rounded-xl ${className}`}>
      <div
        className="flex h-full transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((image, i) => (
          <div key={`${image.src}-${i}`} className="relative h-full w-full shrink-0">
            <Image src={image.src} alt={image.alt} fill sizes="50vw" className="object-cover" />
          </div>
        ))}
      </div>

      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-white/75 px-2.5 py-1.5 backdrop-blur-sm">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? 'w-4 bg-brand-primary' : 'w-1.5 bg-brand-primary/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}