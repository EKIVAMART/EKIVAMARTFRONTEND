'use client';

import { useEffect, useState } from 'react';

export interface CountdownParts {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

function pad(value: number) {
  return value.toString().padStart(2, '0');
}

/**
 * Dummy countdown — starts from a fixed duration (not a real deadline) since
 * the flash sale end time is placeholder data for now.
 */
export function useCountdown(initialSeconds = 10 * 24 * 60 * 60 + 1 * 60 * 60 + 21 * 60 + 37) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 0 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const days = Math.floor(secondsLeft / (24 * 60 * 60));
  const hours = Math.floor((secondsLeft % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((secondsLeft % (60 * 60)) / 60);
  const seconds = Math.floor(secondsLeft % 60);

  const parts: CountdownParts = {
    days: pad(days),
    hours: pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds),
  };

  return parts;
}
