'use client';

import { useState, useEffect } from 'react';

interface TypingTextProps {
  text: string;
  delay?: number;
  typingSpeed?: number;
  className?: string;
  colorClass?: string;
  disableCursorOnMobile?: boolean;
}

const TypingText = ({
  text,
  delay = 0,
  typingSpeed = 80,
  className = "",
  colorClass = "text-[#c800ff]",
  disableCursorOnMobile = true,
}: TypingTextProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.substring(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(interval);
          setShowCursor(false);
        }
      }, typingSpeed);
      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [text, delay, typingSpeed]);

  useEffect(() => {
    if (!showCursor) return;
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, [showCursor]);

  return (
    <span className={`inline ${className}`}>
      {displayedText}
      {showCursor && (
        <span className={`${colorClass} ${disableCursorOnMobile ? 'hidden md:inline' : ''}`}>|</span>
      )}
    </span>
  );
};

export default TypingText;