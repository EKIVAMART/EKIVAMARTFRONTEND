import DirectoryHero from '@/components/home/DirectoryHero';
import MarketplaceDirectory from '@/components/home/MarketplaceDirectory';

export const metadata = { title: 'Featured stores | EkivaMart' };
export default function StoresPage() {
  return <main className="ek-home ek-directory ek-stores-page"><DirectoryHero title="Featured stores" introduction="Discover independent sellers and browse a selection from each storefront." variant="stores"/>
    <MarketplaceDirectory /></main>;
}
