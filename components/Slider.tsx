"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./Slider.module.css";

type SliderProps = {
  images?: string[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
};

const defaultImages = [
  "/slideBanner1.jpg",
  "/slideBanner2.jpg",
];

export default function Slider({
  images = defaultImages,
  autoPlay = true,
  autoPlayInterval = 4000,
}: SliderProps) {
  const isSingle = images.length === 1;
  const [index, setIndex] = useState(0);
  const len = images.length;
  const timerRef = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (!autoPlay) return;
    timerRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % len);
    }, autoPlayInterval);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [autoPlay, autoPlayInterval, len]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const prev = () => setIndex((i) => (i - 1 + len) % len);
  const next = () => setIndex((i) => (i + 1) % len);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function onTouchEnd(e: React.TouchEvent) {
    const start = touchStartX.current;
    if (start == null) return;
    const end = e.changedTouches[0].clientX;
    const diff = start - end;
    if (Math.abs(diff) > 40) {
      diff > 0 ? next() : prev();
    }
    touchStartX.current = null;
  }

  return (
    <div className={isSingle ? "w-full mx-auto" : " mx-auto"}>
      <div
        className={`relative overflow-hidden rounded-lg bg-gray-100 ${styles.noSelect}`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        aria-roledescription="carousel"
      >
        <div className={isSingle ? "flex h-screen" : "flex h-64 md:h-96"}>
          {images.map((src, i) => (
            <div
              key={i}
              className={`${styles.slide} flex-shrink-0 w-full h-full relative`}
              style={{ transform: `translateX(${(i - index) * 100}%)` }}
            >
              <img
                src={src}
                alt={`Slide ${i + 1}`}
                className="w-full h-full object-cover"
                draggable={false}
              />

              <div className="absolute bottom-4 left-4 text-white drop-shadow-lg">
                <h3 className="text-lg font-semibold">
                  Slide {i + 1}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Controls (hidden for single image) */}
        {len > 1 && (
          <>
            <button
              aria-label="Previous slide"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white p-2 rounded-full shadow-md"
            >
              ‹
            </button>

            <button
              aria-label="Next slide"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white p-2 rounded-full shadow-md"
            >
              ›
            </button>

            {/* Dots */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-4 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`w-3 h-3 rounded-full ${
                    i === index ? "bg-white" : "bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
