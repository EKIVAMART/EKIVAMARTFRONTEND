import React from 'react';
import { ChevronLeft, ChevronRight, Check } from '@/components/ui/platform-icons';

interface Props {
  children: React.ReactNode;
  onNext?: () => void;
  onPrev?: () => void;
  isLastStep?: boolean;
}

export default function FormWrapper({
  children,
  onNext,
  onPrev,
  isLastStep,
}: Props) {
  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
      {/* Blue Header */}
      <div className="bg-linear-to-r from-[#228b22] to-[#1c711c] p-8 text-center text-white">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          Vendor Registration
        </h2>
        <p className="text-sm opacity-90 font-medium">
          EkivaMart a muilti-vendor marketplace platform that connects local
          vendors with customers, providing a seamless online shopping
          experience. Join us to expand your reach and grow your business!
        </p>
      </div>

      <div className="p-7 md:p-10">
        {children}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-12 pt-7 border-t">
          {onPrev ? (
            <button
              onClick={onPrev}
              className="flex items-center gap-2 px-6 py-2.5 border-2 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition"
            >
              <ChevronLeft size={18} /> Previous
            </button>
          ) : (
            <div />
          )}

          {onNext || isLastStep ? (
            <button
              onClick={onNext}
              className={`flex items-center gap-3 px-8 py-2.5 text-white rounded-xl font-bold transition ${isLastStep ? 'bg-linear-to-r from-[#228b22] to-[#1c711c] hover:from-[#1c711c] hover:to-[#185b1a]' : 'bg-linear-to-r from-[#228b22] to-[#1c711c] hover:from-[#1c711c] hover:to-[#185b1a]'}`}
            >
              {isLastStep ? 'Submit Application' : 'Next'}
              {isLastStep ? <Check size={18} /> : <ChevronRight size={18} />}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
