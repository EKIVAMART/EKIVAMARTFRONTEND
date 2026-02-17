import FormWrapper from './FormWrapper';
import { UploadBox } from './FormInputs';
import { FileText } from 'lucide-react';

interface Props {
  onNext: () => void;
  onPrev: () => void;
}

export default function Step4Documents({ onNext, onPrev }: Props) {
  return (
    <FormWrapper onNext={onNext} onPrev={onPrev}>
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-[#00A8B5] rounded-lg text-white">
          <FileText size={20} />
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-800">Required Documents</h3>
          <p className="text-xs text-gray-400">Upload your organization's legal documents</p>
        </div>
      </div>

      <div className="space-y-8">
        <UploadBox label="Certificate of Incorporation" />
        <UploadBox label="Business License" />
        <UploadBox label="Director's ID" />
      </div>
    </FormWrapper>
  );
}