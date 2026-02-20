'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface StepperProps {
  currentStep: number;
}

const steps = [
  { id: 1, label: 'Category' },
  { id: 2, label: 'Company Info' },
  { id: 3, label: 'Contact Details' },
  { id: 4, label: 'Documents' },
  { id: 5, label: 'Declaration' },
];

export default function Stepper({ currentStep }: StepperProps) {
  return (
    <div className="w-full py-8 bg-white rounded-2xl shadow-sm border border-gray-100 mb-8 overflow-x-auto no-scrollbar">
      <div className="flex items-center justify-center min-w-[600px] md:min-w-full px-8">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          
          return (
            <React.Fragment key={step.id}>
              {/* Step Circle & Label */}
              <div className="flex flex-col items-center relative group">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10
                    ${isCompleted ? 'bg-green-600 border-green-600 text-white' : ''}
                    ${isActive ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-100' : ''}
                    ${!isCompleted && !isActive ? 'bg-white border-gray-200 text-gray-400' : ''}
                  `}
                >
                  {isCompleted ? (
                    <Check size={20} strokeWidth={3} />
                  ) : (
                    <span className="text-sm font-bold">{step.id}</span>
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={`
                    absolute -bottom-7 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors duration-300
                    ${isActive || isCompleted ? 'text-green-600' : 'text-gray-400'}
                  `}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 px-2 mb-0">
                  <div className="h-[2px] w-full bg-gray-100 relative">
                    <div
                      className={`
                        absolute top-0 left-0 h-full bg-green-600 transition-all duration-500 ease-in-out
                        ${isCompleted ? 'w-full' : 'w-0'}
                      `}
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}