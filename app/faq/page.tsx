'use client';

import { useState } from 'react';
import { Search, X } from '@/components/ui/platform-icons';
import SupportIdentity from '@/components/support/SupportIdentity';
import SupportContact from '@/components/support/SupportContact';
import styles from '../support/support.module.css';

const faqCategories = [
  {
    id: 'orders',
    name: 'Orders & Shopping',
    faqs: [
      {
        q: 'How do I track my order status?',
        a: 'Open your order history and select an order to see its current status. If you need help, contact support with the order reference.',
      },
      {
        q: 'Can I cancel my order after it has been placed?',
        a: 'Open the order details to see the actions available for that order. If cancellation is unavailable, contact support. Cancelling a paid order and receiving a refund are separate steps.',
      },
      {
        q: 'What should I do if my item arrives damaged?',
        a: 'Keep photos of the item and packaging, check the returns policy, and contact support with your order reference.',
      },
    ],
  },
  {
    id: 'payments',
    name: 'Payments & Refunds',
    faqs: [
      {
        q: 'What payment methods do you accept?',
        a: 'Checkout shows the payment methods available for your order. Follow the payment provider’s instructions and return to your order to check the result.',
      },
      {
        q: 'How do I check a refund?',
        a: 'Open the order details to check your request. Contact support with the order reference if you need an update on an approved refund.',
      },
      {
        q: 'Where do I enter payment details?',
        a: 'Complete payment through the checkout payment provider. Do not send card details, passwords or verification codes in a support message.',
      },
    ],
  },
  {
    id: 'delivery',
    name: 'Delivery & Shipping',
    faqs: [
      {
        q: 'How do I check delivery fees?',
        a: 'Enter your delivery address at checkout to see the available delivery options and fees before paying.',
      },
      {
        q: 'Where can I have an order delivered?',
        a: 'Use your delivery address at checkout to check availability for the products in your cart.',
      },
      {
        q: 'Can I change my delivery address after placing an order?',
        a: 'Contact support with your order reference and the address change you need. Availability depends on the order’s current status.',
      },
    ],
  },
  {
    id: 'vendors',
    name: 'Vendors & Partners',
    faqs: [
      {
        q: 'How do I register as a vendor on EkivaMart?',
        a: 'Open Sell with us to review the requirements and start your application. Add your business, store and payout details, then submit the application for review.',
      },
      {
        q: 'Where can I check selling fees?',
        a: 'Review the seller terms and the charges shown in your dashboard. Contact support if you need clarification before listing your products.',
      },
      {
        q: 'How do vendors check their earnings?',
        a: 'Open Earnings in the vendor dashboard to review balances and withdrawal information. Keep your payout account details up to date.',
      },
    ],
  },
];

export default function FAQPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const term = query.trim().toLowerCase();
  const items = faqCategories
    .filter((item) => category === 'all' || item.id === category)
    .flatMap((item) => item.faqs)
    .filter(
      (item) => !term || `${item.q} ${item.a}`.toLowerCase().includes(term)
    );
  return (
    <main className={`ek-home ${styles.page}`}>
      <header className={styles.heading}>
        <SupportIdentity />
        <h1>Frequently asked questions</h1>
        <p>Quick answers about orders, payments, delivery and selling.</p>
        <div className={styles.search}>
          <div className={styles.searchField}>
            <Search size={19} aria-hidden="true" />
            <input
              type="search"
              aria-label="Search questions"
              placeholder="Search questions"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery('')}
              >
                <X size={17} />
              </button>
            )}
          </div>
        </div>
      </header>
      <div
        className={styles.filters}
        role="group"
        aria-label="Filter questions by topic"
      >
        {[{ id: 'all', name: 'All topics' }, ...faqCategories].map((item) => (
          <button
            type="button"
            key={item.id}
            aria-pressed={category === item.id}
            onClick={() => setCategory(item.id)}
          >
            {item.name}
          </button>
        ))}
      </div>
      <p className={styles.count} role="status">
        {items.length
          ? `${items.length} questions`
          : 'No matching questions. Try another word or topic.'}
      </p>
      <div className={styles.questions}>
        {items.map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
      <SupportContact />
    </main>
  );
}
