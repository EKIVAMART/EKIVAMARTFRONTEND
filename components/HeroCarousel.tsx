'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles, Shield, ChevronRight as ArrowRight } from 'lucide-react';
import TypingText from '@/components/TypingText';
import FadeInSection from '@/components/FadeInSection';
import BuyerHero from '@/assets/Buyer-hero.png';
import VendorHero from '@/assets/Vendor-hero.png';
import { SignupModal } from '@/components/auth/SignupModal';

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  
  const slideChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const slides = [
    {
      image: BuyerHero.src,
      subtitle: "Discover Authentic Nigerian Treasures",
      mainTextPrefix: "Discover more.",
      mainTextBefore: "Shop",
      changingWords: ["smarter", "faster", "easier"],
      ctaText: "Find unique fashion, crafts, beauty & more from trusted local sellers across Nigeria",
      primaryButton: { text: "Register Now — Start Shopping", action: "signup", link: "" },
      secondaryButton: { text: "Learn More", link: "/support/topics/browsing-purchasing" }
    },
    {
      image: VendorHero.src,
      subtitle: "Grow Your Business Nationally",
      mainTextPrefix: "Reach millions.",
      mainTextBefore: "Sell",
      changingWords: ["effortlessly", "profitably", "confidently"],
      ctaText: "Centralized payments, powerful tools, and reach millions of buyers",
      primaryButton: { text: "Become a Vendor — Start Selling", action: "link", link: "/vendor-registration" },
      secondaryButton: { text: "Learn More", link: "/support/topics/becoming-a-vendor" }
    }
  ];

  const current = slides[currentSlide];
  const totalSlides = slides.length;

  const getTotalSlideDuration = () => {
    const words = current.changingWords;
    let totalTypingTime = 0;
    words.forEach((word, index) => {
      totalTypingTime += word.length * 105;
      if (index < words.length - 1) {
        totalTypingTime += 2000;
      }
      totalTypingTime += 65 * word.length;
    });
    return (totalTypingTime + 2000) / 1000;
  };

  const goToNextSlide = useCallback(() => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setIsTypingComplete(false);
    setProgressKey(prev => prev + 1);
    
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
      setIsTransitioning(false);
    }, 100);
  }, [totalSlides, isTransitioning]);

  const goToPrevSlide = useCallback(() => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setIsTypingComplete(false);
    setProgressKey(prev => prev + 1);
    
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
      setIsTransitioning(false);
    }, 100);
  }, [totalSlides, isTransitioning]);

  useEffect(() => {
    setProgressKey(prev => prev + 1);
  }, [currentSlide]);

  useEffect(() => {
    if (isTypingComplete && isAutoPlaying && !isTransitioning) {
      if (slideChangeTimeoutRef.current) {
        clearTimeout(slideChangeTimeoutRef.current);
      }
      slideChangeTimeoutRef.current = setTimeout(() => {
        goToNextSlide();
      }, 2000);
    }
    
    return () => {
      if (slideChangeTimeoutRef.current) {
        clearTimeout(slideChangeTimeoutRef.current);
      }
    };
  }, [isTypingComplete, isAutoPlaying, goToNextSlide, isTransitioning]);

  const handleManualNavigation = (callback: () => void) => {
    if (slideChangeTimeoutRef.current) {
      clearTimeout(slideChangeTimeoutRef.current);
    }
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
    }
    
    setProgressKey(prev => prev + 1);
    callback();
    
    autoPlayTimeoutRef.current = setTimeout(() => {
      setIsAutoPlaying(true);
    }, 10000);
  };

  const handlePrimaryClick = () => {
    if (currentSlide === 0) {
      setIsSignupModalOpen(true);
    } else {
      window.location.href = "/vendor-registration";
    }
  };

  const fadeVariants = {
    enter: { opacity: 0, scale: 0.98 },
    center: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.02 },
  };

  const fadeFromBottom = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <>
      <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center overflow-hidden bg-black">
        
        {/* Background Images */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            variants={fadeVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${current.image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/65 to-black/40" />
          </motion.div>
        </AnimatePresence>

        {/* Left Navigation Button */}
        <button
          onClick={() => handleManualNavigation(goToPrevSlide)}
          className="absolute left-4 md:left-8 z-20 group cursor-pointer"
          aria-label="Previous slide"
        >
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-110">
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white/80 group-hover:text-white transition-colors" />
          </div>
        </button>

        {/* Right Navigation Button */}
        <button
          onClick={() => handleManualNavigation(goToNextSlide)}
          className="absolute right-4 md:right-8 z-20 group cursor-pointer"
          aria-label="Next slide"
        >
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-110">
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white/80 group-hover:text-white transition-colors" />
          </div>
        </button>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 w-full pt-20 pb-12">
          <div className="max-w-xl lg:max-w-2xl">
            
            {/* Badge - Fade from Top */}
            <FadeInSection 
              key={`badge-${currentSlide}`}
              type="fadeDown" 
              delay={0.15} 
              duration={0.7}
              resetKey={currentSlide}
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium px-5 py-2 rounded-full mb-6">
                <Sparkles size={14} className="text-[#c800ff]" />
                <span>Faflora — Nigeria's Premier Marketplace</span>
                <Shield size={12} className="text-[#c800ff]" />
              </div>
            </FadeInSection>

            {/* Subtitle - Fade from Top */}
            <FadeInSection 
              key={`subtitle-${currentSlide}`}
              type="fadeDown" 
              delay={0.35} 
              duration={0.7}
              resetKey={currentSlide}
            >
              <p className="text-[#c800ff] font-bold uppercase tracking-[4px] text-sm mb-4">
                {current.subtitle}
              </p>
            </FadeInSection>

            {/* Main Text Prefix - Fade from Top */}
            <FadeInSection 
              key={`prefix-${currentSlide}`}
              type="fadeDown" 
              delay={0.55} 
              duration={0.7}
              resetKey={currentSlide}
              className="mb-4"
            >
              <div className="text-white/90 text-4xl md:text-5xl lg:text-[4rem] font-black leading-[1.1]">
                {current.mainTextPrefix}
              </div>
            </FadeInSection>

            {/* Main Text + Changing Words - Slide from Right */}
            <FadeInSection 
              key={`maintext-${currentSlide}`}
              type="slideRight" 
              delay={0.8} 
              duration={0.8}
              resetKey={currentSlide}
              className="mb-8"
            >
              <h1 className="text-white text-[2.765rem] md:text-6xl lg:text-[5rem] font-black leading-[1.1] tracking-tighter">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="pb-1">{current.mainTextBefore}</span>
                  <TypingText 
                    texts={current.changingWords}
                    typingSpeed={105}
                    deleteSpeed={65}
                    delayBetween={2000}
                    className="font-black pb-1 pr-2 md:pb-2 md:pr-2"
                    colorClass="bg-gradient-to-r from-[#f0a8ff] to-[#c800ff] via-[#d946ef] bg-clip-text text-transparent"
                    keepCursorFlashing={true}
                    onCycleComplete={() => {
                      if (!isTypingComplete) {
                        setIsTypingComplete(true);
                      }
                    }}
                  />
                </div>
              </h1>
            </FadeInSection>

            {/* CTA Text - Fade from Bottom */}
            <FadeInSection 
              key={`cta-${currentSlide}`}
              type="fadeUp" 
              delay={1.1} 
              duration={0.7}
              resetKey={currentSlide}
            >
              <p className="text-white/80 text-lg md:text-xl lg:text-2xl leading-relaxed max-w-lg">
                {current.ctaText}
              </p>
            </FadeInSection>

            {/* Buttons + Trust Indicators Group - Same animation timing */}
            <div className="mt-8">
              {/* Buttons - Fade from Bottom */}
              <FadeInSection 
                key={`buttons-${currentSlide}`}
                type="fadeUp" 
                delay={1.35} 
                duration={0.7}
                resetKey={currentSlide}
                className="flex flex-col sm:flex-row gap-4"
              >
                {currentSlide === 0 ? (
                  <button
                    onClick={handlePrimaryClick}
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#c800ff] to-[#c740b0] hover:from-[#c740b0] hover:to-[#c800ff] text-white px-6 py-3 md:px-8 md:py-3.5 rounded-full font-bold text-sm md:text-base transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-[#c800ff]/25 group cursor-pointer"
                  >
                    {current.primaryButton.text}
                    <ArrowRight className="w-4 h-4 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <Link
                    href={current.primaryButton.link}
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#c800ff] to-[#c740b0] hover:from-[#c740b0] hover:to-[#c800ff] text-white px-6 py-3 md:px-8 md:py-3.5 rounded-full font-bold text-sm md:text-base transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-[#c800ff]/25 group"
                  >
                    {current.primaryButton.text}
                    <ArrowRight className="w-4 h-4 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}

                <Link
                  href={current.secondaryButton.link}
                  className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20 text-white px-6 py-3 md:px-8 md:py-3.5 rounded-full font-semibold text-sm md:text-base transition-all duration-300 hover:scale-105"
                >
                  {current.secondaryButton.text}
                </Link>
              </FadeInSection>

              {/* Trust Indicators  */}
              <motion.div
                key={`trust-${currentSlide}`}
                variants={fadeFromBottom}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.7, delay: 1.35 }}
                className="mt-6 mb-4 flex flex-wrap gap-4"
              >
                {[
                  { text: "NDPR Compliant", icon: Shield },
                  { text: "Secure Escrow", icon: Shield },
                  { text: "24/7 Support", icon: Sparkles },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <item.icon size={12} className="text-[#ff69e0]" />
                    <span className="text-white/50 text-[10px] md:text-xs font-medium tracking-wide">
                      {item.text}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Slide Indicators with Animated Progress Bar */}
        <div className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (slideChangeTimeoutRef.current) {
                  clearTimeout(slideChangeTimeoutRef.current);
                }
                if (autoPlayTimeoutRef.current) {
                  clearTimeout(autoPlayTimeoutRef.current);
                }
                setCurrentSlide(idx);
                setIsTypingComplete(false);
                setProgressKey(prev => prev + 1);
                autoPlayTimeoutRef.current = setTimeout(() => {
                  setIsAutoPlaying(true);
                }, 10000);
              }}
              className="group cursor-pointer relative"
              aria-label={`Go to slide ${idx + 1}`}
            >
              <div
                className={`w-10 md:w-16 h-1 rounded-full transition-all duration-300 ${
                  currentSlide === idx 
                    ? 'bg-white/20' 
                    : 'bg-white/30 group-hover:bg-white/50'
                }`}
              />
              
              {currentSlide === idx && (
                <motion.div
                  key={`progress-${progressKey}-${idx}`}
                  className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-[#c800ff] via-[#d946ef] to-[#ff69e0]"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ 
                    duration: getTotalSlideDuration(), 
                    ease: "linear"
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </section>

      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onSwitchToLogin={() => {
          setIsSignupModalOpen(false);
        }}
      />
    </>
  );
};

export default HeroCarousel;