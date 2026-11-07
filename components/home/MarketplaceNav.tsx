import Link from 'next/link';
import { Store, Tag } from 'lucide-react';
import ExploreMenu from './ExploreMenu';

export default function MarketplaceNav() {
  return (
    <nav className="ek-market-nav" aria-label="Marketplace shortcuts">
      <Link className="ek-market-nav-item ek-market-nav-offers" href="/#special-offers">
        <Tag className="ek-offers-tag" size={16} aria-hidden="true" />
        <span>Offers</span>
      </Link>
      <ExploreMenu />
      <Link className="ek-market-nav-item ek-market-nav-sell" href="/become-a-vendor">
        <Store size={16} aria-hidden="true" />
        <span>Sell<span className="ek-market-nav-wide"> on EkivaMart</span></span>
      </Link>
    </nav>
  );
}
