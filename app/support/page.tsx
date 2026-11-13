import Link from 'next/link';
import { ArrowRight } from '@/components/ui/platform-icons';
import { fafloraSupportData, popularArticles } from './data/supportData';
import SearchBar from '@/components/support/SearchBar';
import SupportIdentity from '@/components/support/SupportIdentity';
import SupportContact from '@/components/support/SupportContact';
import styles from './support.module.css';

export const metadata = {
  title: 'Help centre | EkivaMart',
  description:
    'Help with your account, orders, delivery and selling on EkivaMart.',
};

export default function SupportHome() {
  return (
    <main className={`ek-home ${styles.page}`}>
      <header className={styles.heading}>
        <SupportIdentity />
        <h1>How can we help?</h1>
        <p>Find answers about your account, orders, delivery and selling.</p>
        <SearchBar />
      </header>
      <section className={styles.section} aria-labelledby="support-topics">
        <h2 id="support-topics">Browse by topic</h2>
        <div className={styles.topics}>
          {fafloraSupportData.map((topic) => (
            <Link
              href={`/support/topics/${topic.slug}`}
              key={topic.id}
              className={styles.topic}
            >
              <h3>{topic.title}</h3>
              <p>{topic.description.replace(/Faflora/g, 'EkivaMart')}</p>
              <span>
                {topic.articles.length} articles{' '}
                <ArrowRight size={17} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className={styles.section} aria-labelledby="support-common">
        <h2 id="support-common">Common questions</h2>
        <ul className={styles.links}>
          {popularArticles.slice(0, 5).map((article) => (
            <li key={`${article.topicSlug}/${article.slug}`}>
              <Link
                href={`/support/topics/${article.topicSlug}/${article.slug}`}
              >
                {article.title.replace(/Faflora/g, 'EkivaMart')}
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <SupportContact />
    </main>
  );
}
