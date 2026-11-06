import FormWrapper from './FormWrapper';
import { InputGroup } from './FormInputs';
import { Building2 } from 'lucide-react';

interface Props {
  onNext: () => void;
  onPrev: () => void;
}

export default function Step2CompanyInfo({ onNext, onPrev }: Props) {
  return (
    <FormWrapper onNext={onNext} onPrev={onPrev}>
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-gradient-to-r from-[#228b22] to-[#1c711c] rounded-lg text-white">
          <Building2 size={20} />
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-800">Company Information</h3>
          <p className="text-xs text-gray-400">Tell us about your organization</p>
        </div>
      </div>

      <div className="space-y-5">
        <InputGroup label="Organization Name" required placeholder="Enter organization name" />
        <InputGroup label="Organization Address" required isTextArea placeholder="Enter full address" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputGroup label="City" required placeholder="e.g. Asaba" />
          <InputGroup label="Country" required isSelect />
        </div>

        <InputGroup label="Tax Identification Number (TIN)" required placeholder="Enter TIN" />
      </div>
    </FormWrapper>
  );
}