'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

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
  hideCursorOnComplete?: boolean;
}

const TypingText = ({
  text,
  texts,
  delay = 0,
  typingSpeed = 80,
  deleteSpeed = 50,
  delayBetween = 1800,
  className = "",
  colorClass = "text-[#228b22]",
  onCycleComplete,
  disableCursorOnMobile = true,
  keepCursorFlashing = false,
  hideCursorOnComplete = false,
}: TypingTextProps) => {
  const words = useMemo(() => texts || (text ? [text] : []), [texts, text]);
  const isCycling = words.length > 1;

  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  // Use ref to track cursor state without causing re-renders
  const cursorIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

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
        // When typing is complete and we're cycling, start deleting after delay
        setTimeout(() => {
          if (isMountedRef.current) {
            setIsDeleting(true);
          }
        }, delayBetween);
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

  // Typing/deleting animation
  useEffect(() => {
    if (!hasStarted) return;

    const timeout = setTimeout(() => {
      animate();
    }, isDeleting ? deleteSpeed : typingSpeed);

    return () => clearTimeout(timeout);
  }, [animate, isDeleting, typingSpeed, deleteSpeed, hasStarted]);

  // FIXED: Cursor Logic with cleanup
  useEffect(() => {
    isMountedRef.current = true;

    // Clear any existing interval
    if (cursorIntervalRef.current) {
      clearInterval(cursorIntervalRef.current);
      cursorIntervalRef.current = null;
    }

    const isComplete = displayedText.length === currentWord.length && !isDeleting;
    // Determine if cursor should flash
    const shouldFlash = keepCursorFlashing || isCycling || (isComplete && !hideCursorOnComplete);

    if (shouldFlash) {
      // Start with cursor visible
      setShowCursor(true);

      // Flash every 500ms
      cursorIntervalRef.current = setInterval(() => {
        if (isMountedRef.current) {
          setShowCursor(prev => !prev);
        }
      }, 500);
    } else {
      setShowCursor(false);
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (cursorIntervalRef.current) {
        clearInterval(cursorIntervalRef.current);
        cursorIntervalRef.current = null;
      }
    };
  }, [keepCursorFlashing, isCycling, displayedText.length, currentWord.length, isDeleting, displayedText, hideCursorOnComplete]);

  // Reset cursor when component unmounts
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (cursorIntervalRef.current) {
        clearInterval(cursorIntervalRef.current);
        cursorIntervalRef.current = null;
      }
    };
  }, []);

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