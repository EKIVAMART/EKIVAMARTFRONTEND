import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { ekivaMartSupportData } from '../../../data/supportData';
import SupportContact from '@/components/support/SupportContact';
import styles from '../../../support.module.css';

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ topicSlug: string; articleSlug: string }>;
}) {
  const { topicSlug, articleSlug } = await params;
  const topic = ekivaMartSupportData.find((item) => item.slug === topicSlug);
  const article = topic?.articles.find((item) => item.slug === articleSlug);
  if (topic && !article && articleSlug.includes('faflora')) {
    const updatedSlug = articleSlug.replaceAll('faflora', 'ekivamart');
    if (topic.articles.some((item) => item.slug === updatedSlug)) {
      permanentRedirect(`/support/topics/${topic.slug}/${updatedSlug}`);
    }
  }
  if (!topic || !article) notFound();
  const index = topic.articles.indexOf(article);
  const previous = topic.articles[index - 1];
  const next = topic.articles[index + 1];
  const content = article.content
    .replace(/^# .*(?:\r?\n|$)/, '');
  return (
    <main className={`ek-home ${styles.page}`}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/support">Help centre</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/support/topics/${topic.slug}`}>{topic.title}</Link>
      </nav>
      <header className={styles.heading}>
        <h1>{article.title}</h1>
        <p>Updated {article.lastUpdated}</p>
      </header>
      <div className={styles.articleLayout}>
        <div>
          <article className={styles.article}>
            <ReactMarkdown>{content}</ReactMarkdown>
          </article>
          <nav className={styles.paging} aria-label="More articles">
            {previous && (
              <Link href={`/support/topics/${topic.slug}/${previous.slug}`}>
                <small>Previous article</small>
                {previous.title}
              </Link>
            )}
            {next && (
              <Link href={`/support/topics/${topic.slug}/${next.slug}`}>
                <small>Next article</small>
                {next.title}
              </Link>
            )}
          </nav>
        </div>
        <aside className={styles.related} aria-label="In this topic">
          <h2>In this topic</h2>
          {topic.articles.map((item) => (
            <Link
              key={item.id}
              href={`/support/topics/${topic.slug}/${item.slug}`}
              aria-current={item.slug === articleSlug ? 'page' : undefined}
            >
              {item.title}
            </Link>
          ))}
        </aside>
      </div>
      <SupportContact />
    </main>
  );
}
