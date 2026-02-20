import FormWrapper from './FormWrapper';
import { InputGroup } from './FormInputs';
import { FileCheck, Info, RotateCcw, Lock } from 'lucide-react';

interface Props {
  onPrev: () => void;
}

export default function Step5Declaration({ onPrev }: Props) {
  return (
    <FormWrapper onPrev={onPrev} isLastStep={true}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-[#981d87] rounded-lg text-white">
          <FileCheck size={20} />
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-800">Declaration & Signature</h3>
          <p className="text-xs text-gray-400">Review and sign the declaration</p>
        </div>
      </div>

      {/* Declaration Alert Box */}
      <div className="bg-[#D1EDF0] border border-[#B2E4E8] p-5 rounded-xl mb-8 flex gap-3">
        <Info size={20} className="text-[#981d87] shrink-0 mt-1" />
        <div>
          <h4 className="text-sm font-bold text-[#007D87] mb-1">Declaration of Accuracy</h4>
          <p className="text-[11px] text-[#007D87] leading-relaxed font-medium">
            The individual submitting this Service Request Form affirms that all information provided herein is true, accurate, and complete to the best of their knowledge. They understand that any false, misleading, or incomplete information may result in the delay, suspension, or termination of the onboarding process or service eligibility.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputGroup label="Your Name" required placeholder="Full Name" />
          <InputGroup label="Job Title" required placeholder="CEO, Manager, Director, etc." />
        </div>

        <InputGroup label="Date Signed" required type="date" />

        {/* Signature Area */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600">Digital Signature <span className="text-red-500">*</span></label>
          <div className="relative border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 h-44 flex items-center justify-center">
            {/* Cursive Placeholder Text */}
            <span className="text-4xl font-serif text-gray-300 select-none italic opacity-40">Your Signature</span>
            
            <button className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-100 text-red-500 text-[10px] font-bold rounded-lg hover:bg-red-50 transition">
              <RotateCcw size={12} /> Clear Signature
            </button>
          </div>
        </div>

        {/* Security Verification Box */}
        <div className="bg-[#F8F9FA] border border-gray-100 p-5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-500">Security Verification <span className="text-red-500">*</span></span>
                <div className="bg-white border border-gray-200 px-4 py-2 rounded-xl flex items-center gap-3">
                    <Lock size={14} className="text-gray-400" />
                    <span className="font-mono font-bold text-[#981d87]">3 + 2 = ?</span>
                </div>
            </div>
            <input 
              type="text" 
              placeholder="Your answer" 
              className="w-32 p-2.5 rounded-xl border bg-white outline-none focus:ring-2 ring-[#E0F2F3] text-center font-bold"
            />
        </div>
      </div>
    </FormWrapper>
  );
}