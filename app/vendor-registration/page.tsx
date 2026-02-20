'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Stepper from '@/components/vendor-registration/Stepper';
import Step1Category from '@/components/vendor-registration/Step1Category';
import Step2CompanyInfo from '@/components/vendor-registration/Step2CompanyInfo';
import Step3ContactDetails from '@/components/vendor-registration/Step3ContactDetails';
import Step4Documents from '@/components/vendor-registration/Step4Documents';
import Step5Declaration from '@/components/vendor-registration/Step5Declaration';

export default function VendorRegistrationPage() {
  const [step, setStep] = useState(1);

  const nextStep = () => setStep((s) => Math.min(s + 1, 5));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const renderStep = () => {
    switch (step) {
      case 1: return <Step1Category onNext={nextStep} />;
      case 2: return <Step2CompanyInfo onNext={nextStep} onPrev={prevStep} />;
      case 3: return <Step3ContactDetails onNext={nextStep} onPrev={prevStep} />;
      case 4: return <Step4Documents onNext={nextStep} onPrev={prevStep} />;
      case 5: return <Step5Declaration onPrev={prevStep} />;
      default: return <Step1Category onNext={nextStep} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 font-sans pt-20">
      {/* Brand Logo */}
      {/* <div className="flex justify-center py-8">
        <div className="text-center">
          <div className="text-green-600 flex justify-center mb-1">
             <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z"/></svg>
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-green-600">Faflories</h1>
        </div>
      </div> */}

      <div className="max-w-4xl mx-auto px-4">
        <Stepper currentStep={step} />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}