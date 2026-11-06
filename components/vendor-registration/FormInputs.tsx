import { HelpCircle, Upload } from 'lucide-react';

type InputGroupProps = {
  label: string;
  required?: boolean;
  isTextArea?: boolean;
  isSelect?: boolean;
  type?: string;
  placeholder?: string;
};

export const InputGroup = ({
  label,
  required,
  isTextArea,
  isSelect,
  type = 'text',
  placeholder,
}: InputGroupProps) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
      {label} {required && <span className="text-red-500">*</span>}
      <HelpCircle size={14} className="text-[#228b22] cursor-help" />
    </label>
    {isTextArea ? (
      <textarea className="w-full p-3 rounded-xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none transition h-24 text-sm" />
    ) : isSelect ? (
      <select className="w-full p-3 rounded-xl border bg-[#F0F7F8] outline-none text-sm appearance-none">
        <option>Nigeria</option>
      </select>
    ) : (
      <input
        type={type}
        placeholder={placeholder}
        className="w-full p-3 rounded-xl border bg-[#F0F7F8] focus:bg-white focus:ring-2 ring-[#E0F2F3] outline-none transition text-sm"
      />
    )}
  </div>
);

export const UploadBox = ({ label }: { label: string }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
      {label} <span className="text-red-500">*</span>{' '}
      <HelpCircle size={14} className="text-[#228b22]" />
    </label>
    <div className="border-2 border-dashed border-[#eff4e9] rounded-2xl p-8 bg-[#F8FDFF] flex flex-col items-center justify-center cursor-pointer hover:bg-[#F0F9FA] transition">
      <div className="bg-linear-to-r from-[#228b22] to-[#1c711c] text-white p-3 rounded-xl mb-3 shadow-md">
        <Upload size={24} />
      </div>
      <p className="text-sm font-bold text-gray-700">
        Click to upload or drag and drop
      </p>
      <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">
        PDF, JPG, PNG (Max 2MB)
      </p>
    </div>
  </div>
);
