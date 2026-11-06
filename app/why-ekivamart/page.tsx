import DirectoryHero from '@/components/home/DirectoryHero';
import Link from 'next/link';
import { ArrowRight, Compass, Headphones, PackageCheck, SearchCheck, ShieldCheck, ShoppingCart, Store } from 'lucide-react';

export const metadata = {
  title: 'Why shop with EkivaMart? | EkivaMart',
  description: 'A practical guide to discovering stores, choosing products, checking out, and getting help with an order on EkivaMart.',
};

const steps = [
  {
    Icon: Compass,
    title: 'Find a store or something you love',
    text: 'Explore featured stores, browse product categories, and save items to your wishlist while you decide.',
    href: '/stores',
    link: 'Explore stores',
  },
  {
    Icon: SearchCheck,
    title: 'Check the details',
    text: 'Product pages bring together descriptions, seller information, customer reviews, and available return details so you can make an informed choice.',
    href: '/categories/shop',
    link: 'Browse products',
  },
  {
    Icon: ShoppingCart,
    title: 'Review and place your order',
    text: 'Your cart and checkout show the items you selected and the order total. Review the delivery charge and payment details before you confirm.',
    href: '/cart',
    link: 'View your cart',
  },
];

const afterOrder = [
  {
    Icon: PackageCheck,
    title: 'Keep up with your order',
    text: 'Open your orders to see the latest status and the details of each purchase.',
    href: '/orders',
    link: 'View orders',
  },
  {
    Icon: Headphones,
    title: 'Ask for help when you need it',
    text: 'The support centre has help for payment, delivery, returns, and other order questions.',
    href: '/support',
    link: 'Visit support',
  },
  {
    Icon: ShieldCheck,
    title: 'Know your return options',
    text: 'Read the return policy before buying. If there is a problem with an order, you can find the available actions on its order page.',
    href: '/return-policy',
    link: 'Read the return policy',
  },
];

export default function WhyPage() {
  return (
    <main className="ek-home ek-directory ek-guide-page">
      <DirectoryHero
        title="Why shop with EkivaMart?"
        introduction="A shopper’s guide to choosing a store, checking out and getting help with an order."
        variant="guide"
      />

      <div className="ek-guide-content">
        <section className="ek-guide-intro" aria-labelledby="guide-intro-title">
          <div>
            <span className="ek-guide-eyebrow">Shopping on EkivaMart</span>
            <h2 id="guide-intro-title">A marketplace with room to explore</h2>
          </div>
          <p>EkivaMart brings products from independent sellers into one place. Browse storefronts, compare the details that matter to you, and check your order before you pay. Your account keeps your purchases close at hand afterward.</p>
        </section>

        <section className="ek-guide-section" aria-labelledby="guide-steps-title">
          <div className="ek-guide-section-heading">
            <div>
              <span className="ek-guide-eyebrow">From discovery to checkout</span>
              <h2 id="guide-steps-title">How shopping works</h2>
            </div>
            <p>Take your time at each step. The product and checkout pages give you the information you need to decide.</p>
          </div>
          <div className="ek-guide-steps">
            {steps.map(({ Icon, title, text, href, link }) => (
              <article key={title}>
                <span className="ek-guide-step-icon"><Icon size={28} strokeWidth={1.7} aria-hidden="true" /></span>
                <h3>{title}</h3>
                <p>{text}</p>
                <Link href={href}>{link}<ArrowRight size={16} aria-hidden="true" /></Link>
              </article>
            ))}
          </div>
        </section>

        <section className="ek-guide-spotlight" aria-labelledby="guide-store-title">
          <div className="ek-guide-spotlight-icon"><Store size={34} strokeWidth={1.6} aria-hidden="true" /></div>
          <div>
            <span className="ek-guide-eyebrow">Meet the sellers</span>
            <h2 id="guide-store-title">Find more than a product</h2>
            <p>Featured stores give you another way to discover what sellers offer. When a product catches your eye, read its description and reviews to see whether it fits what you are looking for.</p>
          </div>
          <Link href="/stores">Browse featured stores<ArrowRight size={16} aria-hidden="true" /></Link>
        </section>

        <section className="ek-guide-section" aria-labelledby="guide-after-title">
          <div className="ek-guide-section-heading">
            <div>
              <span className="ek-guide-eyebrow">After checkout</span>
              <h2 id="guide-after-title">Your order, from purchase onward</h2>
            </div>
            <p>Keep track of what you bought and find the right place to go if you have a question.</p>
          </div>
          <div className="ek-guide-after-grid">
            {afterOrder.map(({ Icon, title, text, href, link }) => (
              <article key={title}>
                <Icon size={25} strokeWidth={1.7} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
                <Link href={href}>{link}<ArrowRight size={16} aria-hidden="true" /></Link>
              </article>
            ))}
          </div>
        </section>

        <section className="ek-guide-cta" aria-labelledby="guide-cta-title">
          <div>
            <span className="ek-guide-eyebrow">Ready to browse?</span>
            <h2 id="guide-cta-title">See what is in the marketplace</h2>
            <p>Start with a category or discover a store that feels like your kind of place.</p>
          </div>
          <div className="ek-guide-cta-links">
            <Link href="/categories/shop">Shop products<ArrowRight size={16} aria-hidden="true" /></Link>
            <Link href="/stores">Explore stores</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
