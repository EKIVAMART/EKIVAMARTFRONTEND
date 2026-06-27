import { useState, useRef } from 'react';
import FormWrapper from './FormWrapper';
import {
  Info,
  Layers,
  ShoppingBag,
  Zap,
  Briefcase,
  Footprints,
  Apple,
  Sparkles,
  Heart,
  Gem,
  Home,
  ChevronLeft,
  ChevronRight,
  Gamepad2
} from 'lucide-react';

export default function Step1Category({ onNext }: { onNext: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const categories = [
    { id: 'fashion', name: 'Fashion', icon: <ShoppingBag className="w-8 h-8"/> },
    { id: 'electronics', name: 'Electronics', icon: <Zap className="w-8 h-8"/> },
    { id: 'bags', name: 'Bags', icon: <Briefcase className="w-8 h-8"/> },
    { id: 'footwear', name: 'Footwear', icon: <Footprints className="w-8 h-8"/> },
    { id: 'groceries', name: 'Groceries', icon: <Apple className="w-8 h-8"/> },
    { id: 'beauty', name: 'Beauty', icon: <Sparkles className="w-8 h-8"/> },
    { id: 'wellness', name: 'Wellness', icon: <Heart className="w-8 h-8"/> },
    { id: 'jewellery', name: 'Jewellery', icon: <Gem className="w-8 h-8"/> },
    { id: 'home', name: 'Home Decor', icon: <Home className="w-8 h-8"/> },
    { id: 'toys', name: 'Toys & Games', icon: <Gamepad2 className="w-8 h-8"/> },
  ];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 240;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <FormWrapper onNext={onNext}>
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-gradient-to-r from-[#9d4ae3] to-[#8236be] rounded-lg text-white"><Layers size={20}/></div>
        <div>
          <h3 className="font-bold text-lg text-gray-800">Select Your Category</h3>
          <p className="text-xs text-gray-400">Choose the type of organization you represent</p>
        </div>
      </div>

      <div className="relative group mb-8">
        {/* Navigation Buttons */}
        <button 
          onClick={() => scroll('left')}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-lg border border-gray-100 text-[#9d4ae3] hover:scale-110 transition-transform hidden group-hover:flex"
        >
          <ChevronLeft size={20} />
        </button>
        
        <button 
          onClick={() => scroll('right')}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-lg border border-gray-100 text-[#9d4ae3] hover:scale-110 transition-transform hidden group-hover:flex"
        >
          <ChevronRight size={20} />
        </button>

        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory py-4 px-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((cat) => (
            <button 
              key={cat.id} 
              onClick={() => setSelected(cat.id)}
              className={`flex flex-col items-center justify-center p-6 border rounded-2xl transition-all min-w-[140px] snap-start group ${
                selected === cat.id 
                  ? 'border-[#9d4ae3] bg-[#f3ecfc] text-[#9d4ae3] shadow-md -translate-y-1' 
                  : 'hover:border-[#9d4ae3] hover:bg-[#f3ecfc] text-gray-500 hover:text-[#9d4ae3]'
              }`}
            >
              <div className="mb-3 transition-transform group-hover:scale-110">{cat.icon}</div>
              <span className={`text-[10px] font-bold text-center leading-tight ${selected === cat.id ? 'text-[#9d4ae3]' : 'text-gray-700'}`}>
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#f3ecfc] p-4 rounded-xl flex gap-3 items-center">
        <Info size={18} className="text-[#9d4ae3] shrink-0" />
        <p className="text-xs text-black font-medium">
          Select the category that best describes your organization. This will determine your access level and features.
        </p>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </FormWrapper>
  );
}