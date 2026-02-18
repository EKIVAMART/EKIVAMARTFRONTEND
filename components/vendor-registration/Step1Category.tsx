import FormWrapper from './FormWrapper';
import { Shield, Building2, Pill, FlaskConical, Users, Info, Layers } from 'lucide-react';

export default function Step1Category({ onNext }: { onNext: () => void }) {
  const categories = [
    { id: 'ins', name: 'Insurance', icon: <Shield className="w-8 h-8"/> },
    { id: 'hos', name: 'Hospital', icon: <Building2 className="w-8 h-8"/> },
    { id: 'pha', name: 'Pharmacy', icon: <Pill className="w-8 h-8"/> },
    { id: 'lab', name: 'Laboratory', icon: <FlaskConical className="w-8 h-8"/> },
    { id: 'org', name: 'Organization', icon: <Building2 className="w-8 h-8"/> },
  ];

  return (
    <FormWrapper onNext={onNext}>
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-[#00A8B5] rounded-lg text-white"><Layers size={20}/></div>
        <div>
          <h3 className="font-bold text-lg text-gray-800">Select Your Category</h3>
          <p className="text-xs text-gray-400">Choose the type of organization you represent</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {categories.map((cat) => (
          <button key={cat.id} className="flex flex-col items-center justify-center p-6 border rounded-2xl transition-all hover:border-[#00A8B5] hover:bg-[#F0F9FA] text-[#00A8B5] group">
            <div className="mb-3 transition-transform group-hover:scale-110">{cat.icon}</div>
            <span className="text-xs font-bold text-gray-700">{cat.name}</span>
          </button>
        ))}
      </div>

      <div className="bg-[#D1EDF0] p-4 rounded-xl flex gap-3 items-center">
        <Info size={18} className="text-[#00A8B5] shrink-0" />
        <p className="text-xs text-[#007D87] font-medium">
          Select the category that best describes your organization. This will determine your access level and features.
        </p>
      </div>
    </FormWrapper>
  );
}