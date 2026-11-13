import Link from 'next/link';
import { ArrowRight } from '@/components/ui/platform-icons';
import styles from '@/app/support/support.module.css';

export default function SupportContact() {
  return (
    <section className={styles.contact} aria-label="Contact support">
      <div>
        <h2>Still need help?</h2>
        <p>
          Tell us what happened. Include your order reference if you have one.
        </p>
      </div>
      <Link href="/contact-us">
        Contact us <ArrowRight size={17} aria-hidden="true" />
      </Link>
    </section>
  );
}
