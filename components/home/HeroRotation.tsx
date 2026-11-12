'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Image, { getImageProps } from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';

const banners = [
  {
    image: 'fresh-food',
    background: '#63ad35',
    category: 'groceries-food',
    label: 'Fresh food — 10% off',
  },
  {
    image: 'electronics',
    background: '#60ae32',
    category: 'electronics',
    label: 'Electronics — up to 40% off',
  },
  {
    image: 'watches',
    background: '#48291e',
    category: 'jewelry-fashion-accessories',
    label: 'Luxury wristwatches — 10% off',
  },
  {
    image: 'ladies-footwear',
    background: '#301021',
    category: 'footwear',
    label: 'Ladies footwear — 10% off',
  },
  {
    image: 'footwear',
    background: '#df2336',
    category: 'footwear',
    label: 'Shop footwear — 10% off',
  },
  {
    image: 'fashion',
    background: '#103b64',
    category: 'fashion',
    label: 'Unique wears — 10% off',
  },
  {
    image: 'groceries',
    background: '#191719',
    category: 'groceries-food',
    label: 'Groceries — 10% off',
  },
];

export default function HeroRotation({ children }: { children: ReactNode }) {
  const [index, setIndex] = useState(0);
  const [interacting, setInteracting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const count = banners.length + 1;
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (interacting || reducedMotion) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex((current) => (current + 1) % count);
    }, 2000);
    return () => window.clearInterval(timer);
  }, [interacting, reducedMotion, count]);
  useEffect(() => {
    // Warm only the next slide, using the same responsive optimized URL as Image.
    const nextIndex = (index + 1) % count;
    if (nextIndex === 0) return;
    const { props } = getImageProps({
      src: `/images/banners/${banners[nextIndex - 1].image}-wide.png`,
      alt: '',
      fill: true,
      sizes: '(max-width:767px) 100vw, (max-width:1360px) 95vw, 1296px',
    });
    const next = new window.Image();
    next.sizes = props.sizes ?? '';
    next.srcset = props.srcSet ?? '';
    next.src = props.src;
  }, [index, count]);
  const banner = banners[index - 1];
  return (
    <section
      className="ek-hero-rotation"
      aria-label="Marketplace highlights"
      aria-roledescription="carousel"
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setInteracting(false);
      }}
    >
      <div
        className="ek-hero-frame"
        aria-roledescription="slide"
        aria-label={`${index + 1} of ${count}`}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={index}
            className="ek-hero-slide-panel"
            initial={{ x: reducedMotion ? 0 : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: reducedMotion ? 0 : '-100%' }}
            transition={{
              duration: reducedMotion ? 0 : 0.65,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {index === 0 ? (
              children
            ) : (
              <Link
                className="ek-banner-slide"
                style={{ backgroundColor: banner.background }}
                href={`/categories/${banner.category}`}
              >
                <Image
                  src={`/images/banners/${banner.image}-wide.png`}
                  alt={banner.label + ' — Shop now'}
                  loading="eager"
                  fill
                  sizes="(max-width:767px) 100vw, (max-width:1360px) 95vw, 1296px"
                />
              </Link>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="ek-hero-controls">
        <div className="ek-hero-dots">
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show banner ${i + 1}: ${i === 0 ? 'Everyday icons' : banners[i - 1].label}`}
              aria-pressed={index === i}
              onClick={() => setIndex(i)}
            >
              <span />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
