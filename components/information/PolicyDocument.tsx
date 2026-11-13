import Link from 'next/link';
import PolicyContents from './PolicyContents';
import type { ReactNode } from 'react';
import styles from './information.module.css';

export type PolicySection = {
  id: string;
  number: string;
  title: string;
  content: ReactNode;
};

export default function PolicyDocument({
  title,
  date,
  introduction,
  sections,
  children,
}: {
  title: string;
  date?: string;
  introduction?: ReactNode;
  sections?: PolicySection[];
  children?: ReactNode;
}) {
  return (
    <main className={`ek-home ${styles.page}`}>
      <header className={styles.heading}>
        <span>EkivaMart policies</span>
        <h1>{title}</h1>
        {date && <p>{date}</p>}
      </header>
      {introduction && (
        <div className={styles.introduction}>{introduction}</div>
      )}
      {sections && <PolicyContents sections={sections.map(({ id, number, title }) => ({ id, number, title }))} />}
      <div className={styles.prose}>
        {sections
          ? sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className={styles.section}
              >
                <h2>
                  <span>{section.number}.</span> {section.title}
                </h2>
                {section.content}
              </section>
            ))
          : children}
      </div>
      <footer className={styles.footer}>
        <p>
          Questions about this policy?{' '}
          <Link href="/contact-us">Contact us</Link>.
        </p>
        <nav aria-label="Related policies">
          <Link href="/terms-and-conditions">Terms and conditions</Link>
          <Link href="/privacy-policy">Privacy policy</Link>
          <Link href="/acceptable-use-policy">Acceptable use</Link>
          <Link href="/return-policy">Returns and refunds</Link>
        </nav>
      </footer>
    </main>
  );
}
