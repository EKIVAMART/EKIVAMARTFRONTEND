import Image from 'next/image';
import Link from 'next/link';

interface DirectoryHeroProps {
  title: string;
  introduction: string;
  variant: 'stores' | 'guide';
}

export default function DirectoryHero({ title, introduction, variant }: DirectoryHeroProps) {
  const image = variant === 'stores'
    ? '/images/collections/featured-stores-teal.png'
    : '/images/collections/ekivamart-shopping-guide.png';

  return <header className={`ek-guide-hero ek-${variant}-banner`}>
    <h1 className="sr-only">{title}</h1>
    <p className="sr-only">{introduction}</p>
    <Image className="ek-guide-hero-desktop" src={image} alt="" width={2172} height={724} priority sizes="(max-width: 1104px) calc(100vw - 64px), 1040px" />
    <div className="ek-guide-hero-mobile">
      <div><Link href="/">Marketplace</Link><h2 aria-hidden="true">{title}</h2><p aria-hidden="true">{introduction}</p></div>
      <figure aria-hidden="true" />
    </div>
  </header>;
}
