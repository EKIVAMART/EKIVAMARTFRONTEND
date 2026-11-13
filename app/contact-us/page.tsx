import Link from 'next/link';
import { ArrowRight, LifeBuoy, MessageCircle, Phone } from '@/components/ui/platform-icons';
import ContactSection from '@/components/contact/ContactSection';
import styles from './contact.module.css';

export const metadata = {
  title: 'Contact us | EkivaMart',
  description: 'Get help with an order, your account, or selling on EkivaMart.',
};

export default function ContactUs() {
  return (
    <div className={`ek-home ${styles.page}`}>
      <header className={styles.heading}>
        <span className="ek-guide-eyebrow">EkivaMart support</span>
        <h1>Contact us</h1>
        <p>Questions about an order, your account, or selling? We’re here to help.</p>
      </header>

      <div className={styles.layout}>
        <section aria-labelledby="contact-form-title" className={styles.formSection}>
          <h2 id="contact-form-title">Send a message</h2>
          <p className={styles.intro}>Tell us what you need help with. All fields are required.</p>
          <ContactSection />
        </section>

        <aside aria-label="Other ways to get help" className={styles.sidebar}>
          <h2>Get in touch</h2>
          <a className={styles.channel} href="https://wa.me/2349069910407" target="_blank" rel="noopener noreferrer">
            <MessageCircle size={23} strokeWidth={1.6} aria-hidden="true" />
            <span><strong>WhatsApp</strong><span>+234 906 991 0407</span></span>
            <ArrowRight size={16} aria-hidden="true" />
          </a>
          <a className={styles.channel} href="tel:+2349069910407">
            <Phone size={23} strokeWidth={1.6} aria-hidden="true" />
            <span><strong>Call us</strong><span>+234 906 991 0407</span></span>
            <ArrowRight size={16} aria-hidden="true" />
          </a>
          <Link className={styles.channel} href="/support">
            <LifeBuoy size={23} strokeWidth={1.6} aria-hidden="true" />
            <span><strong>Help centre</strong><span>Find answers and guides</span></span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <div className={styles.sellerNote}>
            <h3>Looking to sell?</h3>
            <p>See what you need to open your storefront.</p>
            <Link href="/become-a-vendor">Sell with us <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
        </aside>
      </div>

      <section className={styles.faq} aria-labelledby="contact-questions-title">
        <div><span className="ek-guide-eyebrow">Before you message</span><h2 id="contact-questions-title">A little help to get started</h2></div>
        <div>
          <details><summary>Where can I check my order?</summary><p>Open your <Link href="/orders">order history</Link> to check its status. If you still need help, include the order reference in your message.</p></details>
          <details><summary>What should I include in my message?</summary><p>Describe what happened and include any relevant order reference or product link. You can share screenshots through WhatsApp.</p></details>
          <details><summary>How do I ask about a return?</summary><p>Check our <Link href="/return-policy">returns and refunds policy</Link>, then contact us with your order reference and the item you need help with.</p></details>
        </div>
      </section>
    </div>
  );
}
