import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from '@/components/ui/platform-icons';
import { fafloraSupportData } from '../../data/supportData';
import SupportIdentity from '@/components/support/SupportIdentity';
import SupportContact from '@/components/support/SupportContact';
import styles from '../../support.module.css';

export default async function TopicPage({
  params,
}: {
  params: Promise<{ topicSlug: string }>;
}) {
  const { topicSlug } = await params;
  const topic = fafloraSupportData.find((item) => item.slug === topicSlug);
  if (!topic) notFound();
  return (
    <main className={`ek-home ${styles.page}`}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/support">Help centre</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{topic.title}</span>
      </nav>
      <header className={styles.heading}>
        <SupportIdentity />
        <h1>{topic.title}</h1>
        <p>{topic.description.replace(/Faflora/g, 'EkivaMart')}</p>
      </header>
      <ul className={styles.links} aria-label={`${topic.title} articles`}>
        {topic.articles.map((article) => (
          <li key={article.id}>
            <Link href={`/support/topics/${topic.slug}/${article.slug}`}>
              <span>{article.title.replace(/Faflora/g, 'EkivaMart')}</span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
      <SupportContact />
    </main>
  );
}
