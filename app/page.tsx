import Image from 'next/image';
import Link from 'next/link';
import AppScreenPreview from '@/components/home/AppScreenPreview';
import CategoryRail from '@/components/home/CategoryRail';
import HomeMerchandising from '@/components/home/HomeMerchandising';
import Newsletter from '@/components/home/Newsletter';

import { departments, departmentSlug } from '@/lib/data/departments';

export default function Home(){return <div className="ek-home">
  <section className="ek-hero" aria-labelledby="hero-title">
    <div className="ek-hero-copy">
      <span className="ek-kicker">The marketplace edit</span>
      <h1 id="hero-title">Find your<br/><em>everyday icons.</em></h1>
      <p>Discover fashion, tech and home essentials from independent stores across Nigeria.</p>
      <Link className="ek-action" href="/categories/shop">Shop the marketplace</Link>
    </div>
    <div className="ek-hero-media">
      <Image src="/images/collections/lagos.webp" alt="A woman in a patterned terracotta jacket wearing ivory headphones and carrying a woven bag" fill priority sizes="(max-width:767px) 100vw, (max-width:1360px) 82vw, 1063px"/>
    </div>
  </section>
  <CategoryRail>
      {departments.map(name => {
        const slug = departmentSlug(name);
        return (
          <Link className="ek-category" key={slug} href={`/categories/${slug}`}>
            <div className="ek-category-image"><Image src={`/images/departments/${slug}.webp`} alt="" fill sizes="(max-width:767px) 25vw, 14vw"/></div>
            {name}
          </Link>
        );
      })}
  </CategoryRail>
  <HomeMerchandising>
  <section className="ek-promo" aria-label="Explore collections">
    {[
      {slug: 'electronics', label: 'Electronics', title: 'Sound in focus', image: 'audio'},
      {slug: 'fashion', label: 'Fashion', title: 'The finishing touch', image: 'style'},
    ].map(({slug, label, title, image}) => (
      <Link key={slug} href={`/categories/${slug}`}>
        <div className="ek-collection-copy"><span>{label}</span><h2>{title}</h2><strong>Shop {label.toLowerCase()}</strong></div>
        <div className="ek-collection-photo"><Image src={`/images/collections/${image}.webp`} alt="" fill sizes="(max-width:767px) 48vw, 25vw"/></div>
      </Link>
    ))}
  </section>
  </HomeMerchandising>
  <section className="ek-pocket" aria-labelledby="app-title">
    <div className="ek-pocket-copy"><span className="ek-kicker">The EkivaMart app</span>
      <h2 id="app-title">Shop<br/>EkivaMart<br/>on mobile.</h2>
      <p>Shop fashion, electronics and home essentials from independent stores. Save your favourites and track orders in the app.</p>
      <span className="ek-availability">Coming soon · iOS and Android</span>
    </div>
    <AppScreenPreview />
  </section>
  <Newsletter />
</div>}
