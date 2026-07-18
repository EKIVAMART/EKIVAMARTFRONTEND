'use client';

interface BottomNavMobileProps {
  onOpenCategories: () => void;
}

const tabs: { key: string; label: string; icon: string; badge?: number }[] = [
  { key: 'home', label: 'Home', icon: '⌂' },
  { key: 'categories', label: 'Categories', icon: '▤' },
  { key: 'orders', label: 'Orders', icon: '🛒', badge: 10 },
  { key: 'profile', label: 'Profile', icon: '◍' },
];

export default function BottomNavMobile({ onOpenCategories }: BottomNavMobileProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-neutral-100 bg-white py-2 md:hidden">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={tab.key === 'categories' ? onOpenCategories : undefined}
          className={`relative flex flex-col items-center gap-0.5 px-3 text-xs ${
            tab.key === 'categories' ? 'text-brand-600' : 'text-neutral-500'
          }`}
        >
          <span className="relative text-lg leading-none">
            {tab.icon}
            {tab.badge && (
              <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger-500 text-[10px] text-white">
                {tab.badge}
              </span>
            )}
          </span>
          <span className={tab.key === 'categories' ? 'font-semibold' : ''}>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
