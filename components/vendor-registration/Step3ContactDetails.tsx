import FormWrapper from './FormWrapper';
import { InputGroup } from './FormInputs';
import { UserCircle2 } from '@/components/ui/platform-icons';

interface Props {
  onNext: () => void;
  onPrev: () => void;
}

export default function Step3ContactDetails({ onNext, onPrev }: Props) {
  return (
    <FormWrapper onNext={onNext} onPrev={onPrev}>
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-gradient-to-r from-[#228b22] to-[#1c711c] rounded-lg text-white">
          <UserCircle2 size={20} />
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-800">Contact Information</h3>
          <p className="text-xs text-gray-400">Provide contact details for your organization</p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputGroup label="Contact Person First Name" required placeholder="Enter first name" />
          <InputGroup label="Contact Person Last Name" required placeholder="Enter last name" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputGroup label="Contact Person Email" required type="email" placeholder="email@example.com" />
          <InputGroup label="Contact Person Phone" required placeholder="+234..." />
        </div>

        <hr className="my-2 border-gray-100" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputGroup label="Director's Name" required placeholder="Enter director's full name" />
          <InputGroup label="Director's Email" required type="email" placeholder="director@example.com" />
        </div>
      </div>
    </FormWrapper>
  );
}