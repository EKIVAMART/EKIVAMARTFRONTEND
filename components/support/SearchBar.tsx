'use client';

import Link from 'next/link';
import { Search, ArrowRight, X } from '@/components/ui/platform-icons';
import { useEffect, useRef, useState } from 'react';
import { fafloraSupportData } from '@/app/support/data/supportData';
import styles from '@/app/support/support.module.css';

const articles = fafloraSupportData.flatMap((topic) =>
  topic.articles.map((article) => ({
    title: article.title.replace(/Faflora/g, 'EkivaMart'),
    href: `/support/topics/${topic.slug}/${article.slug}`,
  }))
);

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const term = query.trim().toLowerCase();
  const matches = term
    ? articles.filter((article) => article.title.toLowerCase().includes(term))
    : [];
  const visible = open && term.length > 0;

  useEffect(() => {
    function close(event: PointerEvent) {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  return (
    <div
      ref={wrapper}
      className={styles.search}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          input.current?.focus();
          setOpen(false);
        }
      }}
    >
      <div className={styles.searchField}>
        <Search size={19} aria-hidden="true" />
        <input
          ref={input}
          type="search"
          aria-label="Search support articles"
          aria-controls={visible ? 'support-results' : undefined}
          placeholder="Search help articles"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown' || event.key === 'Enter') {
              const first =
                wrapper.current?.querySelector<HTMLAnchorElement>(
                  '#support-results a'
                );
              if (first) {
                event.preventDefault();
                first.focus();
              }
            }
          }}
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery('');
              input.current?.focus();
            }}
          >
            <X size={17} />
          </button>
        )}
      </div>
      {visible && (
        <div id="support-results" className={styles.results}>
          {matches.length ? (
            <>
              <span className="sr-only" role="status">
                {matches.length} matching articles. Showing up to five.
              </span>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {matches.slice(0, 5).map((article) => (
                  <li key={article.href}>
                    <Link href={article.href} onClick={() => setOpen(false)}>
                      {article.title}
                      <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className={styles.noResults}>
              <p role="status">No matching articles. Try another word.</p>
              <Link href="/contact-us">
                Contact support <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
