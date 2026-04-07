'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ArrowRight,
  User,
  Store,
  Package,
  CreditCard,
  RotateCw,
  Truck,
  HelpCircle,
  X,
  BookOpen,
} from 'lucide-react';
import React, { useState, useRef, useEffect, } from 'react';
import { popularArticles } from '../../app/support/data/supportData';

/* ─── TYPES ─── */
interface PopularArticle {
  title: string;
  topicSlug: string;
  slug: string;
}

/* ─── HELPERS ─── */
const getArticleIcon = (topicSlug: string): React.ReactNode => {
  const icons: Record<string, React.ReactNode> = {
    'account-creation-verification': <User size={15} />,
    'becoming-a-vendor': <Store size={15} />,
    'orders-tracking': <Package size={15} />,
    'payments-refunds-withdrawals': <CreditCard size={15} />,
    'returns-refunds-disputes': <RotateCw size={15} />,
    'delivery-shipping': <Truck size={15} />,
  };
  return icons[topicSlug] ?? <HelpCircle size={15} />;
};

/* ─── SEARCH BAR WITH DROPDOWN ─── */
/**
 * - Left search icon (decorative)
 * - Live dropdown of up to 5 matching article rows
 * - No-match state with redirect link to /contact-us
 * - Right "Search" button
 * - Closes on outside click or Escape
 */
export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const articles = popularArticles as PopularArticle[];

  const results = query.trim()
    ? articles
        .filter((a) => a.title.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5)
    : [];

  const hasQuery = query.trim().length > 0;
  const noMatch = hasQuery && results.length === 0;
  const showDropdown = focused && hasQuery;

  /* Close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = () => {
    if (noMatch) router.push('/contact-us');
    /* else navigate to a search results page if desired */
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') setFocused(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl">
      {/* Input row */}
      <div
        className={`flex items-center bg-white rounded-2xl shadow-[0_8px_40px_rgba(152,29,135,0.12)] border transition-all duration-300 overflow-hidden ${
          focused
            ? 'border-[#981d87] shadow-[0_8px_40px_rgba(152,29,135,0.22)]'
            : 'border-[#e8b8e4]'
        }`}
      >
        {/* Search icon */}
        <div className="flex-shrink-0 md:pl-5 md:pr-3 pl-2 pr-1 text-[#c740b0]">
          <Search size={20} />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search articles… e.g. track order, refund, vendor"
          className="flex-1 py-4 px-2 text-[15px] text-[#1a0018] placeholder:text-gray-400 bg-transparent focus:outline-none"
          style={{ fontFamily: "'Palatino Linotype', Georgia, serif" }}
          aria-label="Search support articles"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
        />

        {/* Clear */}
        {hasQuery && (
          <button
            onClick={() => { setQuery(''); setFocused(true); }}
            className="flex-shrink-0 px-3 text-gray-400 hover:text-[#981d87] transition-colors"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}

        {/* Search button 
        <button
          onClick={handleSearch}
          className="flex-shrink-0 m-2 px-4 md:px-6 py-3 bg-gradient-to-r from-[#981d87] to-[#c740b0] text-white text-sm font-extrabold rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-md whitespace-nowrap"
        >
          <span className="hidden sm:inline">Search</span>
          <span className="sm:hidden">
            <Search size={16} />
          </span>
        </button>*/}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 bg-white border border-[#e8b8e4] rounded-2xl shadow-[0_16px_48px_rgba(152,29,135,0.16)] overflow-hidden">
          {noMatch ? (
            <div className="px-6 py-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#fdf3fc] border border-[#e8b8e4] flex items-center justify-center mx-auto mb-4">
                <Search size={20} className="text-[#c740b0]" />
              </div>
              <p className="text-sm font-bold text-[#1a0018] mb-1">
                No articles found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                We couldn&rsquo;t find a match. Our support team can help you directly.
              </p>
              <Link
                href="/contact-us"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#981d87] to-[#c740b0] text-white text-xs font-extrabold px-5 py-2.5 rounded-full hover:opacity-90 transition"
              >
                Contact Support <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <ul role="listbox">
              {results.map((item, i) => (
                <li key={i} role="option">
                  <Link
                    href={`/support/topics/${item.topicSlug}/${item.slug}`}
                    onClick={() => setFocused(false)}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-[#fdf3fc] transition-colors border-b border-[#f5e8f5] last:border-b-0 group"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-[#981d87] to-[#c740b0] flex items-center justify-center text-white shadow-sm">
                      {getArticleIcon(item.topicSlug)}
                    </div>
                    <p className="flex-1 text-sm text-gray-700 group-hover:text-[#981d87] transition-colors leading-snug">
                      {item.title}
                    </p>
                    <ArrowRight
                      size={14}
                      className="flex-shrink-0 text-[#c740b0] opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </Link>
                </li>
              ))}
              {/* Footer hint */}
              <li className="px-5 py-3 bg-[#fdf8ff] border-t border-[#f0e0ef]">
                <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                  <BookOpen size={11} />
                  Showing {results.length} of 100+ articles · Click to Open
                  {/*Showing {results.length} of {articles.length} articles · Press Enter or click Search*/}
                </p>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
};