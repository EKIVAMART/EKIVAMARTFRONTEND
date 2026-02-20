import FormWrapper from './FormWrapper';
import {Info, Layers, Handbag, Zap, BriefcaseBusiness, Footprints, Apple } from 'lucide-react';

export default function Step1Category({ onNext }: { onNext: () => void }) {
  const categories = [
    { id: 'ins', name: 'Fashion', icon: <Handbag className="w-8 h-8"/> },
    { id: 'hos', name: 'Electronics', icon: <Zap className="w-8 h-8"/> },
    { id: 'pha', name: 'Bags', icon: <BriefcaseBusiness className="w-8 h-8"/> },
    { id: 'lab', name: 'Footwear', icon: <Footprints className="w-8 h-8"/> },
    { id: 'org', name: 'Groceries', icon: <Apple className="w-8 h-8"/> },
  ];

  return (
    <FormWrapper onNext={onNext}>
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-green-600 rounded-lg text-white"><Layers size={20}/></div>
        <div>
          <h3 className="font-bold text-lg text-gray-800">Select Your Category</h3>
          <p className="text-xs text-gray-400">Choose the type of organization you represent</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {categories.map((cat) => (
          <button key={cat.id} className="flex flex-col items-center justify-center p-6 border rounded-2xl transition-all hover:border-green-600 hover:bg-green-50 text-green-600 group">
            <div className="mb-3 transition-transform group-hover:scale-110">{cat.icon}</div>
            <span className="text-xs font-bold text-gray-700">{cat.name}</span>
          </button>
        ))}
      </div>

      <div className="bg-[#D1EDF0] p-4 rounded-xl flex gap-3 items-center">
        <Info size={18} className="text-green-600 shrink-0" />
        <p className="text-xs text-[#007D87] font-medium">
          Select the category that best describes your organization. This will determine your access level and features.
        </p>
      </div>
    </FormWrapper>
  );
}