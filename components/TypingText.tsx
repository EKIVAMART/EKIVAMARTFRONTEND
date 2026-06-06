'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

interface TypingTextProps {
  text?: string;
  texts?: string[];
  delay?: number;
  typingSpeed?: number;
  deleteSpeed?: number;
  delayBetween?: number;
  className?: string;
  colorClass?: string;
  onCycleComplete?: () => void;
  disableCursorOnMobile?: boolean;
  keepCursorFlashing?: boolean;
}

const TypingText = ({
  text,
  texts,
  delay = 0,
  typingSpeed = 80,
  deleteSpeed = 50,
  delayBetween = 1800,
  className = "",
  colorClass = "text-[#c800ff]",
  onCycleComplete,
  disableCursorOnMobile = true,
  keepCursorFlashing = false,
}: TypingTextProps) => {
  const words = useMemo(() => texts || (text ? [text] : []), [texts, text]);
  const isCycling = words.length > 1;

  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  const currentWord = words[currentIndex] || '';

  // Start typing after delay
  useEffect(() => {
    const startTimer = setTimeout(() => {
      setHasStarted(true);
    }, delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  const animate = useCallback(() => {
    if (!hasStarted || !currentWord) return;

    if (!isDeleting) {
      // Typing
      if (displayedText.length < currentWord.length) {
        setDisplayedText(currentWord.substring(0, displayedText.length + 1));
      } else if (isCycling) {
        setTimeout(() => setIsDeleting(true), delayBetween);
      }
    } else {
      // Deleting
      if (displayedText.length > 0) {
        setDisplayedText(displayedText.substring(0, displayedText.length - 1));
      } else {
        const nextIndex = (currentIndex + 1) % words.length;
        setCurrentIndex(nextIndex);
        setIsDeleting(false);

        // Check if we've completed a full cycle (returned to first word)
        if (onCycleComplete && nextIndex === 0) {
          onCycleComplete();
        }
      }
    }
  }, [displayedText, currentWord, isDeleting, currentIndex, words, isCycling, delayBetween, onCycleComplete, hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    
    const timeout = setTimeout(() => {
      animate();
    }, isDeleting ? deleteSpeed : typingSpeed);

    return () => clearTimeout(timeout);
  }, [animate, isDeleting, typingSpeed, deleteSpeed, hasStarted]);

  // Cursor Logic
  useEffect(() => {
    if (keepCursorFlashing || isCycling) {
      const interval = setInterval(() => {
        setShowCursor(prev => !prev);
      }, 500);
      return () => clearInterval(interval);
    } else {
      if (displayedText.length === currentWord.length && !isDeleting) {
        setShowCursor(false);
      } else {
        setShowCursor(true);
      }
    }
  }, [keepCursorFlashing, isCycling, displayedText.length, currentWord.length, isDeleting]);

  return (
    <span className={`inline ${className} ${colorClass}`}>
      {displayedText}
      {showCursor && (
        <span className={`${disableCursorOnMobile ? 'hidden md:inline' : ''} opacity-100`}>|</span>
      )}
    </span>
  );
};

export default TypingText;