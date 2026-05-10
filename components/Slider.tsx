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
    <div className="w-full">
      <div
        className={`relative overflow-hidden rounded-lg bg-gray-100 ${styles.noSelect}`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        aria-roledescription="carousel"
      >
        {/* SLIDES CONTAINER */}
        <div
          className="flex h-64 md:h-97 transition-transform duration-700 ease-in-out"
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

        {/* Bottom gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

        {/* LEFT ARROW */}
        {len > 1 && (
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2.5 sm:p-3.5 rounded-full text-white border border-white/30 transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
          >
            <FiChevronLeft size={20} strokeWidth={2.5} />
          </button>
        )}

        {/* RIGHT ARROW */}
        {len > 1 && (
          <button
            onClick={next}
            aria-label="Next slide"
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2.5 sm:p-3.5 rounded-full text-white border border-white/30 transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
          >
            <FiChevronRight size={20} strokeWidth={2.5} />
          </button>
        )}

        {/* DOTS — pill style */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 items-center">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === index
                  ? 'w-7 h-2.5 bg-white shadow-md'
                  : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>

        {/* Slide counter */}
        <div className="absolute top-4 right-4 sm:right-6 bg-black/30 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20">
          {index + 1} / {len}
        </div>
      </div>
    </div>
  );
}

