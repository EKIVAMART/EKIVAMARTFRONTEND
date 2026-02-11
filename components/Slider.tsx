/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useEffect, useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import styles from './Slider.module.css';

type SliderProps = {
  images?: string[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
};

const defaultImages = ['/slideBanner1.jpg', '/slideBanner2.jpg'];

export default function Slider({
  images = defaultImages,
  autoPlay = true,
  autoPlayInterval = 4000,
}: SliderProps) {
  const [index, setIndex] = useState(0);
  const len = images.length;
  const timerRef = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  /* ---------- AUTOPLAY ---------- */
  useEffect(() => {
    if (!autoPlay || len <= 1) return;

    timerRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % len);
    }, autoPlayInterval);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [autoPlay, autoPlayInterval, len]);

  const prev = () => setIndex((i) => (i - 1 + len) % len);
  const next = () => setIndex((i) => (i + 1) % len);

  function onTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    if (e.touches && e.touches.length > 0) {
      touchStartX.current = e.touches[0].clientX;
    }
  }

  function onTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) return;
    if (!e.changedTouches || e.changedTouches.length === 0) {
      touchStartX.current = null;
      return;
    }

    const endX = e.changedTouches[0]?.clientX;
    if (typeof endX !== 'number') {
      touchStartX.current = null;
      return;
    }

    const diff = touchStartX.current - endX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) next();
      else prev();
    }

    touchStartX.current = null;
  }

  return (
    <div className="w-[95%] mx-auto pb-8 md:pb-6 lg:pb-8">
      <div
        className={`relative overflow-hidden rounded-lg bg-gray-100 ${styles.noSelect}`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        aria-roledescription="carousel"
      >
        {/* SLIDES CONTAINER */}
        <div
          className="flex h-64 md:h-96 transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {images.map((src, i) => (
            <div key={i} className="w-full shrink-0 h-full relative">
              <img
                src={src}
                alt={`Slide ${i + 1}`}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* LEFT ARROW */}
        {len > 1 && (
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-3 rounded-full text-white"
          >
            <FiChevronLeft size={24} />
          </button>
        )}

        {/* RIGHT ARROW */}
        {len > 1 && (
          <button
            onClick={next}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-3 rounded-full text-white"
          >
            <FiChevronRight size={24} />
          </button>
        )}

        {/* DOTS */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-3 h-3 rounded-full ${
                i === index ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
