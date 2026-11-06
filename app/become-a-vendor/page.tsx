import Link from 'next/link';
import { ArrowRight, ClipboardList, Package, Store, Truck } from 'lucide-react';

export const metadata = {
  title: 'Sell on EkivaMart | EkivaMart',
  description: 'Learn how to apply, set up a storefront, and start listing products on EkivaMart.',
};

const applicationSteps = [
  {
    title: 'Tell us about your store',
    text: 'Choose a store name and the categories you plan to sell in. Add your contact and business details as you work through the application.',
  },
  {
    title: 'Complete your verification details',
    text: 'Provide the documents requested for your seller type and add a bank account for payouts. You can save your progress and return to your draft.',
  },
  {
    title: 'Submit for review',
    text: 'Check the information you entered, then submit your application. You can follow its status and respond if more information is needed.',
  },
  {
    title: 'Set up your storefront',
    text: 'Once approved, add your store details and create product listings with descriptions, images, prices, and stock quantities.',
  },
];

const storeTools = [
  {
    Icon: Store,
    title: 'Your own storefront',
    text: 'Give shoppers a place to learn about your store and browse its products together.',
  },
  {
    Icon: Package,
    title: 'Product listings',
    text: 'Add products, organise them into categories, and keep prices and stock up to date.',
  },
  {
    Icon: Truck,
    title: 'Delivery and returns',
    text: 'Set out your shipping and return information so shoppers know what to expect.',
  },
];

export default function BecomeAVendorPage() {
  return <main className="ek-home ek-seller-page">
    <header className="ek-seller-banner">
      <div className="ek-seller-banner-copy">
        <span>Sell on EkivaMart</span>
        <h1>Open your storefront.</h1>
        <p>Bring your products to shoppers across Nigeria. Talk to our vendor team about setting up your store and listing your first collection.</p>
        <div className="ek-seller-banner-actions">
          <Link href="/contact-us">Contact the vendor team</Link>
          <a href="#how-it-works">How it works</a>
        </div>
      </div>
      <div className="ek-seller-banner-art" role="img" aria-label="Illustration of an EkivaMart storefront with packages ready to ship" />
    </header>

    <div className="ek-seller-content">
      <section className="ek-seller-overview" aria-labelledby="seller-overview-title">
        <div>
          <span className="ek-guide-eyebrow">A store of your own</span>
          <h2 id="seller-overview-title">Start with a clear path to selling</h2>
        </div>
        <p>EkivaMart gives independent sellers a storefront alongside the marketplace. The application walks you through the details needed to set up your store. After approval, you can publish products and manage the information shoppers see.</p>
      </section>

      <section id="how-it-works" className="ek-seller-section" aria-labelledby="seller-steps-title">
        <div className="ek-seller-section-heading">
          <span className="ek-guide-eyebrow">Getting started</span>
          <h2 id="seller-steps-title">From application to first listing</h2>
          <p>Work through the application at your pace, then prepare your storefront for shoppers.</p>
        </div>
        <ol className="ek-seller-process">
          {applicationSteps.map(({ title, text }, index) => <li key={title}>
            <span className="ek-seller-process-index">0{index + 1}</span>
            <div><h3>{title}</h3><p>{text}</p></div>
          </li>)}
        </ol>
        <Link className="ek-seller-inline-link" href="/vendor/apply">Start an application<ArrowRight size={16} aria-hidden="true" /></Link>
      </section>

      <section className="ek-seller-prep" aria-labelledby="seller-prep-title">
        <div>
          <ClipboardList size={30} strokeWidth={1.6} aria-hidden="true" />
          <span className="ek-guide-eyebrow">Before you begin</span>
          <h2 id="seller-prep-title">Have these details ready</h2>
          <p>The application asks for different information depending on your seller type. Having the basics close by makes it easier to complete.</p>
        </div>
        <ul>
          <li>Store name, contact details, and selling categories</li>
          <li>Personal and business information relevant to your seller type</li>
          <li>Identification or business documents requested during verification</li>
          <li>Bank account details for payouts</li>
        </ul>
      </section>

      <section className="ek-seller-section" aria-labelledby="seller-tools-title">
        <div className="ek-seller-section-heading">
          <span className="ek-guide-eyebrow">After approval</span>
          <h2 id="seller-tools-title">Build a store shoppers can understand</h2>
          <p>Clear product and store information helps customers decide what to buy and what to expect after checkout.</p>
        </div>
        <div className="ek-seller-tools">
          {storeTools.map(({ Icon, title, text }) => <article key={title}>
            <Icon size={27} strokeWidth={1.6} aria-hidden="true" />
            <h3>{title}</h3>
            <p>{text}</p>
          </article>)}
        </div>
      </section>

      <section className="ek-seller-faq" aria-labelledby="seller-faq-title">
        <div>
          <span className="ek-guide-eyebrow">Good to know</span>
          <h2 id="seller-faq-title">Questions before you apply?</h2>
        </div>
        <div>
          <details><summary>Can I finish the application later?</summary><p>Yes. Your application can be saved as a draft while you gather the remaining details.</p></details>
          <details><summary>How will I know what happens after submission?</summary><p>You can check your <Link href="/vendor/application/status">application status</Link> and return to the application if more information is requested.</p></details>
          <details><summary>When can I add products?</summary><p>You can start building your storefront and listings after your seller application is approved.</p></details>
        </div>
      </section>

      <section className="ek-seller-final" aria-labelledby="seller-final-title">
        <div>
          <span className="ek-guide-eyebrow">Ready to begin?</span>
          <h2 id="seller-final-title">Take the first step toward your storefront</h2>
          <p>Start an application when you are ready, or contact the vendor team if you have a question first.</p>
        </div>
        <div>
          <Link href="/vendor/apply">Start an application<ArrowRight size={16} aria-hidden="true" /></Link>
          <Link href="/contact-us">Contact the vendor team</Link>
        </div>
      </section>
    </div>
  </main>;
}
