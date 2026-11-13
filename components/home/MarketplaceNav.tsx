import Link from 'next/link';
import { Store } from '@/components/ui/platform-icons';
import ExploreMenu from './ExploreMenu';

export default function MarketplaceNav() {
  return (
    <nav className="ek-market-nav" aria-label="Marketplace shortcuts">
      <Link className="ek-market-nav-item ek-market-nav-offers" href="/#special-offers">
        <span className="sr-only">Offers</span>
      </Link>
      <ExploreMenu />
      <Link className="ek-market-nav-item ek-market-nav-sell" href="/become-a-vendor">
        <Store size={16} aria-hidden="true" />
        <span>Sell<span className="ek-market-nav-wide"> on EkivaMart</span></span>
      </Link>
    </nav>
  );
}
