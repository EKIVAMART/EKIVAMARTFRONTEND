import React from 'react';
import FadeInSection from '@/components/FadeInSection';

export default function Divider() {
  return (
    <FadeInSection type="fade" delay={0.1}>
      <div className="flex items-center gap-3 my-14 sm:my-16">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#bfd4bc] to-transparent" />
        <div className="w-1.5 h-1.5 rounded-full bg-[#1c711c]" />
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#bfd4bc] to-transparent" />
      </div>
    </FadeInSection>
  );
}