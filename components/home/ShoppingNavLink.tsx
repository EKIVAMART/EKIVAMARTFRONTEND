import { Heart, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

type ShoppingNavLinkProps = {
  href: '/wishlist' | '/cart';
  active: boolean;
  count: number;
};

export default function ShoppingNavLink({ href, active, count }: ShoppingNavLinkProps) {
  const Icon = href === '/wishlist' ? Heart : ShoppingCart;
  const label = href === '/wishlist' ? 'Wishlist' : 'Cart';

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      aria-label={count > 0 ? `${label}, ${count} ${count === 1 ? 'item' : 'items'}` : label}
      className={`relative inline-flex h-9 w-8 shrink-0 items-center justify-center rounded-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 lg:w-10 ${active ? 'text-brand-600' : 'text-stone-700 hover:text-brand-600'}`}
    >
      <Icon aria-hidden="true" strokeWidth={1.75} className="h-[22px] w-[22px] lg:h-6 lg:w-6" />
      {count > 0 && (
        <span aria-hidden="true" className="absolute -right-1 -top-1 min-w-4 rounded-full bg-brand-600 px-1 text-center text-[10px] font-semibold leading-4 tabular-nums text-white ring-2 ring-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
