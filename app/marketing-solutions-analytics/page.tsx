import Link from 'next/link';
import { ArrowRight, BarChart3, Package, Store, Tag } from '@/components/ui/platform-icons';
import styles from '@/components/information/information.module.css';

export const metadata = {
  title: 'Marketing & store insights | EkivaMart',
  description:
    'Manage your listings, product discounts and store performance on EkivaMart.',
};

const tools = [
  {
    icon: Store,
    title: 'Your storefront',
    text: 'Give shoppers a clear introduction to your business. Keep your store details current and share your storefront link.',
  },
  {
    icon: Package,
    title: 'Product listings',
    text: 'Use clear photos, useful descriptions and current stock levels so shoppers know what they are buying.',
  },
  {
    icon: Tag,
    title: 'Product discounts',
    text: 'Set an original price and discount in the product editor. Publish the product so shoppers can find it on the marketplace.',
  },
  {
    icon: BarChart3,
    title: 'Store performance',
    text: 'Use your vendor dashboard to review orders and earnings. Check which products are selling before changing your stock or prices.',
  },
];

export default function MarketingSolutionsAnalyticsPage() {
  return (
    <main className={`ek-home ${styles.page}`}>
      <header className={styles.heading}>
        <span>For sellers</span>
        <h1>Marketing & store insights</h1>
        <p>
          Keep your listings useful, manage your prices and follow your store’s
          performance.
        </p>
      </header>
      <div className={styles.cards}>
        {tools.map(({ icon: Icon, title, text }) => (
          <article key={title}>
            <Icon size={26} strokeWidth={1.6} aria-hidden="true" />
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <div className={styles.actions}>
        <Link href="/vendor/dashboard">
          Open vendor dashboard <ArrowRight size={16} aria-hidden="true" />
        </Link>
        <Link href="/become-a-vendor">
          Sell with us <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
      <footer className={styles.footer}>
        <p>
          For help with a promotion or your store,{' '}
          <Link href="/contact-us">contact our team</Link>.
        </p>
      </footer>
    </main>
  );
}
