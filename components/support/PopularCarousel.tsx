'use client';

import Link from 'next/link';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  User,
  Store,
  Package,
  CreditCard,
  RotateCw,
  Truck,
  HelpCircle,
  UserCog,
  Search,
  ShieldCheck,
  Smartphone,
  LayoutDashboard,
  Scale,
} from 'lucide-react';
import { popularArticles } from '../../app/support/data/supportData';
import FadeInSection from '../FadeInSection';

/* ─── TYPES ─── */
interface PopularArticle {
  title: string;
  topicSlug: string;
  slug: string;
}

/* ─── HELPERS ─── */
const getArticleIcon = (topicSlug: string): React.ReactNode => {
  const icons: Record<string, React.ReactNode> = {
    'account-creation-verification': <User size={15} />,
    'buyer-account-management': <UserCog size={15} />,
    'becoming-a-vendor': <Store size={15} />,
    'browsing-purchasing': <Search size={15} />,
    'orders-tracking': <Package size={15} />,
    'payments-refunds-withdrawals': <CreditCard size={15} />,
    'delivery-shipping': <Truck size={15} />,
    'returns-refunds-disputes': <RotateCw size={15} />,
    'security-fraud-privacy': <ShieldCheck size={15} />,
    'app-technical-issues': <Smartphone size={15} />,
    'vendor-tools-dashboard': <LayoutDashboard size={15} />,
    'policies-legal': <Scale size={15} />,
  };
  return icons[topicSlug] ?? <HelpCircle size={15} />;
};

/* ─── CAROUSEL ─── */
/**
 * Blur-slide transition: exiting slide blurs + slides out, entering slide
 * blurs in from the opposite side. No DOM scroll ever fired.
 */
export default function PopularCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [animState, setAnimState] = useState<'idle' | 'exit' | 'enter'>('idle');
  const [direction, setDirection] = useState<1 | -1>(1); // 1 = forward, -1 = back
  const [displayed, setDisplayed] = useState(0);
  const pendingRef = useRef<number>(0);
  const total = (popularArticles as PopularArticle[]).length;

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const goTo = useCallback(
    (next: number) => {
      const normalised = ((next % total) + total) % total;
      if (normalised === displayed || animState !== 'idle') return;
      const dir = normalised > displayed || (displayed === total - 1 && normalised === 0) ? 1 : -1;
      pendingRef.current = normalised;
      setDirection(dir);
      setCurrent(normalised);
      setAnimState('exit');
    },
    [displayed, total, animState],
  );

  /* Step machine: exit → swap → enter → idle */
  useEffect(() => {
    if (animState === 'exit') {
      const t = setTimeout(() => {
        setDisplayed(pendingRef.current);
        setAnimState('enter');
      }, 220); // half of total blur duration
      return () => clearTimeout(t);
    }
    if (animState === 'enter') {
      const t = setTimeout(() => setAnimState('idle'), 260);
      return () => clearTimeout(t);
    }
  }, [animState]);

  /* Auto-advance */
  useEffect(() => {
    if (paused || animState !== 'idle') return;
    const t = setInterval(() => goTo(displayed + 1), 4800);
    return () => clearInterval(t);
  }, [paused, displayed, animState, goTo]);

  /* Inline style per animation state */
  const slideStyle = (): React.CSSProperties => {
    const xOut = `${direction * 18}px`;
    const xIn = `${-direction * 18}px`;
    if (animState === 'exit')
      return { opacity: 0, filter: 'blur(2px)', transform: `translateX(${xOut})`, transition: 'opacity 220ms ease, filter 220ms ease, transform 220ms ease' };
    if (animState === 'enter')
      return { opacity: 0, filter: 'blur(1px)', transform: `translateX(${xIn})`, transition: 'none' };
    // idle — snap to visible
    return { opacity: 1, filter: 'blur(0px)', transform: 'translateX(0)', transition: 'opacity 260ms ease, filter 260ms ease, transform 260ms ease' };
  };

  const item = (popularArticles as PopularArticle[])[displayed];

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && current < total - 1) {
      goTo(current + 1);
    }
    if (isRightSwipe && current > 0) {
      goTo(current - 1);
    }
  };

  return (
    <FadeInSection type="fadeUp" delay={0.35}>
      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEndHandler}
      >
        {/* Left arrow — hidden at first slide */}
        {current > 0 && (
          <button
            onClick={() => goTo(current - 1)}
            aria-label="Previous article"
            className="absolute -left-5 top-1/2 -translate-y-1/2 z-20 hidden md:flex w-11 h-11 items-center justify-center rounded-full bg-white border border-[#e8b8e4] hover:border-[#981d87] shadow-sm transition-colors"
          >
            <ChevronLeft size={20} className="text-[#981d87]" />
          </button>
        )}

        {/* Single-card viewport */}
        <div className="overflow-hidden rounded-3xl">
          <div style={slideStyle()}>
            <Link
              href={`/support/topics/${item.topicSlug}/${item.slug}`}
              className="group flex flex-col relative overflow-hidden bg-white border border-[#e8b8e4] hover:border-[#c740b0] rounded-3xl p-8 md:p-10 transition-colors duration-300 hover:shadow-xl min-h-[180px]"
            >
              {/* Hover bloom */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-[#fdf3fc]/70 to-transparent" />

              {/* Icon */}
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#981d87] to-[#c740b0] flex items-center justify-center text-white shadow-md mb-6">
                {getArticleIcon(item.topicSlug)}
              </div>

              <p className="text-xl md:text-2xl font-semibold text-gray-900 group-hover:text-[#981d87] transition-colors leading-snug max-w-2xl">
                {item.title}
              </p>

              <div className="mt-auto pt-8 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Clock size={13} />
                  Updated April 06, 2026
                </div>
                <div className="inline-flex items-center gap-2 text-[#c740b0] text-sm font-semibold group-hover:gap-3 transition-all">
                  Read article <ArrowRight size={15} />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Right arrow — hidden at last slide */}
        {current < total - 1 && (
          <button
            onClick={() => goTo(current + 1)}
            aria-label="Next article"
            className="absolute -right-5 top-1/2 -translate-y-1/2 z-20 hidden md:flex w-11 h-11 items-center justify-center rounded-full bg-white border border-[#e8b8e4] hover:border-[#981d87] shadow-sm transition-colors"
          >
            <ChevronRight size={20} className="text-[#981d87]" />
          </button>
        )}

        {/* Pill dots */}
        <div className="flex justify-center gap-2 mt-6">
          {(popularArticles as PopularArticle[]).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to article ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-6 h-2.5 bg-[#981d87]'
                  : 'w-2.5 h-2.5 bg-[#e8b8e4] hover:bg-[#c740b0]/50'
              }`}
            />
          ))}
        </div>
      </div>
    </FadeInSection>
  );
};