import type { LucideIcon } from 'lucide-react';
import {
  ShoppingBag,
  Smartphone,
  Backpack,
  Footprints,
  Sparkles,
  Heart,
  Gem,
  Tv,
  Camera,
  Gamepad,
  Music,
  Headphones,
  Blend,
  CookingPot,
  Lamp,
  Sofa,
  ShoppingBasket,
  Scissors,
  Bath,
  HeartPulse,
  Dumbbell,
  Puzzle,
  Baby,
  PawPrint,
  Car,
  Book,
  Wrench,
  Leaf,
  Briefcase,
  Bolt,
  Package,
  Store,
  GlassWater,
  Monitor,
} from '@/components/ui/platform-icons';

const categoryIconMap: Partial<Record<string, LucideIcon>> = {
  'fashion': ShoppingBag,
  'footwear': Footprints,
  'bags & luggage': Backpack,
  'bags': Backpack,
  'jewelry & fashion accessories': Gem,
  'jewelry': Gem,
  'jewellery': Gem,
  'mobile phones & accessories': Smartphone,
  'computers & accessories': Monitor,
  'electronics': Tv,
  'photography & video': Camera,
  'gaming': Gamepad,
  'musical instruments': Music,
  'audio equipment': Headphones,
  'home appliances': Blend,
  'home & kitchen': CookingPot,
  'home decor': Lamp,
  'furniture': Sofa,
  'groceries & food': ShoppingBasket,
  'groceries': ShoppingBasket,
  'local market': Store,
  'drinks': GlassWater,
  'beauty & cosmetics': Sparkles,
  'beauty': Sparkles,
  'hair care & extensions': Scissors,
  'personal care': Bath,
  'health & wellness': HeartPulse,
  'wellness': Heart,
  'sports & fitness': Dumbbell,
  'sports': Dumbbell,
  'toys & games': Puzzle,
  'toys': Puzzle,
  'baby products': Baby,
  'pet supplies': PawPrint,
  'automotive': Car,
  'books & stationery': Book,
  'tools & home improvement': Wrench,
  'garden & outdoor': Leaf,
  'office & school supplies': Briefcase,
  'solar & electrical': Bolt,
};

export default function CategoryIcon({
  name,
  size,
  strokeWidth,
  className,
}: {
  name: string;
  size: number;
  strokeWidth?: number;
  className?: string;
}) {
  const normalizedName = name.trim().toLowerCase();
  const Icon = Object.hasOwn(categoryIconMap, normalizedName)
    ? categoryIconMap[normalizedName] ?? Package
    : Package;
  return <Icon size={size} strokeWidth={strokeWidth} className={className} aria-hidden="true" />;
}
