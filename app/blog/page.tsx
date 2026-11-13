'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, ChevronLeft, ChevronRight, Search, X } from '@/components/ui/platform-icons';
import { blogApi, decodeHtmlEntities, PublicBlogPostSummary } from '@/lib/api-blog';
import styles from './blog.module.css';

const PAGE_SIZE = 16;

function ArticleCard({ post, index }: { post: PublicBlogPostSummary; index: number }) {
  const [imageFailed, setImageFailed] = useState(false);
  const title = decodeHtmlEntities(post.title);
  const author = decodeHtmlEntities(post.author?.name) || 'EkivaMart team';
  const initials = author.split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase();
  const date = post.publishedAt ? new Date(post.publishedAt) : null;
  const validDate = date && !Number.isNaN(date.getTime());

  return (
    <article className={styles.card}>
      <Link href={`/blog/${encodeURIComponent(post.slug)}`} className={styles.cardLink} aria-label={`Read ${title}`}>
        <div className={styles.cover}>
          {post.featuredImage?.url && !imageFailed ? (
            <img src={post.featuredImage.url} alt="" width={640} height={360} loading={index < 4 ? 'eager' : 'lazy'} decoding="async" onError={() => setImageFailed(true)} />
          ) : (
            <div className={styles.coverFallback}>
              <img src="/brand/ekivamart-logo.svg" alt="" width={125} height={71} />
            </div>
          )}
        </div>
        <div className={styles.cardBody}>
          <span className={styles.readTime}>{Math.max(1, post.readingTime || 1)} min read</span>
          <h2>{title}</h2>
          {post.excerpt && <p className={styles.excerpt}>{decodeHtmlEntities(post.excerpt)}</p>}
          <div className={styles.cardFooter}>
            <span className={styles.avatar} aria-hidden="true">{initials}</span>
            <div className={styles.byline}>
              <span title={author}>{author}</span>
              {validDate && <time dateTime={post.publishedAt!}>{date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</time>}
            </div>
            <span className={styles.readLink} aria-hidden="true">Read <ArrowRight size={15} /></span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default function BlogPage() {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState({ search: '', page: 1 });
  const [posts, setPosts] = useState<PublicBlogPostSummary[]>([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const nextSearch = search.trim();
      setQuery(current => current.search === nextSearch ? current : { search: nextSearch, page: 1 });
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    blogApi.getPublicPosts({ page: query.page, limit: PAGE_SIZE, search: query.search })
      .then(response => {
        if (!Array.isArray(response.posts)) throw new Error('Invalid article response');
        if (!active) return;
        const pages = Math.max(1, Number(response.pagination?.totalPages ?? response.pagination?.pages) || 1);
        if (query.page > pages) {
          setQuery(current => ({ ...current, page: pages }));
          return;
        }
        setPosts(response.posts);
        setPagination({ total: Number(response.pagination?.total ?? response.posts.length), pages });
      })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [query, retry]);

  const pageNumbers = Array.from(new Set([
    1,
    ...Array.from({ length: 3 }, (_, index) => Math.max(1, Math.min(query.page - 1, pagination.pages - 2)) + index),
    pagination.pages,
  ])).filter(page => page >= 1 && page <= pagination.pages).sort((a, b) => a - b);

  function changePage(page: number) {
    setQuery(current => ({ ...current, page }));
    document.getElementById('blog-title')?.focus({ preventScroll: true });
    document.getElementById('blog-title')?.scrollIntoView({ block: 'start' });
  }

  function clearSearch() {
    setSearch('');
    setQuery({ search: '', page: 1 });
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.heading}>
          <div>
            <h1 id="blog-title" tabIndex={-1}>The EkivaMart Blog</h1>
            <p>Stories, shopping tips, and ideas for everyday life.</p>
          </div>
          <form className={styles.search} role="search" aria-label="Search blog articles" onSubmit={event => {
            event.preventDefault();
            setQuery({ search: search.trim(), page: 1 });
          }}>
            <label htmlFor="blog-search" className="sr-only">Search articles</label>
            <input id="blog-search" type="search" placeholder="Search articles" value={search} onChange={event => setSearch(event.target.value)} />
            {search && <button type="button" className={styles.clearSearch} aria-label="Clear article search" onClick={clearSearch}><X size={17} /></button>}
            <button type="submit" className={styles.searchButton} aria-label="Search articles"><Search size={20} /></button>
          </form>
        </div>

        <section aria-label="Blog articles" aria-busy={loading}>
          <p className="sr-only" role="status">{loading ? 'Loading articles' : error ? 'Articles could not be loaded' : `${pagination.total} ${pagination.total === 1 ? 'article' : 'articles'} found${query.search ? ` for ${query.search}` : ''}`}</p>
          {loading ? (
            <div className={styles.grid} aria-hidden="true">
              {Array.from({ length: 8 }, (_, index) => <div key={index} className={styles.skeleton}><div /><span /><span /><span /></div>)}
            </div>
          ) : error ? (
            <div className={styles.empty} role="alert">
              <BookOpen size={30} aria-hidden="true" />
              <h2>We couldn’t load the articles</h2>
              <p>Please try again in a moment.</p>
              <button type="button" onClick={() => setRetry(value => value + 1)}>Try again <ArrowRight size={16} /></button>
            </div>
          ) : posts.length === 0 ? (
            <div className={styles.empty}>
              <BookOpen size={30} aria-hidden="true" />
              <h2>{query.search ? 'No matching articles' : 'Our next story is on its way'}</h2>
              <p>{query.search ? `We couldn’t find any articles for “${query.search}”. Try a different search.` : 'Check back soon for shopping tips, stories, and updates from EkivaMart.'}</p>
              {query.search && <button type="button" onClick={clearSearch}>View all articles <ArrowRight size={16} /></button>}
            </div>
          ) : (
            <>
              <div className={styles.grid}>{posts.map((post, index) => <ArticleCard key={`${post.id}-${post.featuredImage?.url || ''}`} post={post} index={index} />)}</div>
              <div className={styles.pagination}>
                <p>Page {query.page} of {pagination.pages}<span aria-hidden="true"> · </span>{pagination.total} {pagination.total === 1 ? 'article' : 'articles'}</p>
                {pagination.pages > 1 && (
                  <nav aria-label="Blog pagination">
                    <button type="button" aria-label="Previous page" disabled={query.page === 1} onClick={() => changePage(query.page - 1)}><ChevronLeft size={16} /><span className={styles.pageDirection}>Previous</span></button>
                    {pageNumbers.map((page, index) => <span key={page} className={styles.pageNumber}>
                      {index > 0 && page - pageNumbers[index - 1] > 1 && <span className={styles.ellipsis} aria-hidden="true">…</span>}
                      <button type="button" aria-label={`Page ${page}`} aria-current={query.page === page ? 'page' : undefined} onClick={() => changePage(page)}>{page}</button>
                    </span>)}
                    <button type="button" aria-label="Next page" disabled={query.page === pagination.pages} onClick={() => changePage(query.page + 1)}><span className={styles.pageDirection}>Next</span><ChevronRight size={16} /></button>
                  </nav>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
