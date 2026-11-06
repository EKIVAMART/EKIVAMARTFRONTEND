import Link from 'next/link';

import ExploreMenu from './ExploreMenu';

export default function TopBar() {
  return <div className="ek-announcement"><div>
    <Link href="/#special-offers">Shop marketplace offers</Link>
    <div className="ek-top-links"><ExploreMenu/><Link href="/become-a-vendor">Sell on EkivaMart</Link></div>
  </div></div>;
}
