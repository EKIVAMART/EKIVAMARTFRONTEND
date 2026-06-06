'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, Search, ChevronDown, ShoppingBag, CreditCard,
  Truck, Store, ArrowRight, ShieldCheck, MessageSquare,
  Sparkles, RefreshCcw, Globe, UserCheck
} from 'lucide-react';
import FadeInSection from '@/components/FadeInSection';
import TypingText from '@/components/TypingText';

interface FAQItem {
  q: string;
  a: string;
}

interface FAQCategory {
  id: string;
  name: string;
  icon: any;
  faqs: FAQItem[];
}

const faqCategories: FAQCategory[] = [
  {
    id: 'orders',
    name: 'Orders & Shopping',
    icon: ShoppingBag,
    faqs: [
      {
        q: 'How do I track my order status?',
        a: 'Once your order is shipped, you will receive a tracking link via email or SMS. You can also view live order progress under "My Orders" in your dashboard profile page. If your order status says "PENDING", it means the vendor is currently preparing your items.'
      },
      {
        q: 'Can I cancel my order after it has been placed?',
        a: 'Orders can be cancelled within 1 hour of placement, provided the vendor has not initiated packaging or delivery. Go to your Orders history page, select the active order, and click "Cancel Order". Refunds for cancelled orders are processed automatically.'
      },
      {
        q: 'What should I do if my item arrives damaged?',
        a: 'Please inspect your items immediately upon delivery. If any product is damaged or does not match your order details, report it within 24 hours via our Support Center or contact our customer support team directly at faflora@outlook.com with photos of the package.'
      }
    ]
  },
  {
    id: 'payments',
    name: 'Payments & Refunds',
    icon: CreditCard,
    faqs: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept secure payments via major Debit/Credit Cards (Mastercard, Visa, Verve), Direct Bank Transfers, and integrated payment gateways (Paystack/Flutterwave). Cash on delivery is available for select Lagos and Asaba shipping zones.'
      },
      {
        q: 'How long do refund processes take?',
        a: 'Approved refunds are credited back to your original payment method. Card refunds typically take 3 to 7 business days to reflect in your bank account, depending on your financial institution.'
      },
      {
        q: 'Are my payment details secure?',
        a: 'Yes, security is our top priority. We do not store your credit card information on our servers. All transactions are encrypted using Industry Standard SSL/TLS protocols and processed securely through PCI-DSS compliant payment gateways.'
      }
    ]
  },
  {
    id: 'delivery',
    name: 'Delivery & Shipping',
    icon: Truck,
    faqs: [
      {
        q: 'What are your delivery options and timelines?',
        a: 'We offer Standard Shipping (2–4 business days) and Express Delivery (next-day or same-day depending on your location and vendor proximity). Shipping costs are calculated dynamically at checkout based on your delivery address and item weight.'
      },
      {
        q: 'Do you offer international shipping?',
        a: 'Currently, we only deliver within Nigeria (with major hubs in Lagos, Asaba, Abuja, and Port Harcourt). We plan to support international delivery to neighboring West African countries soon.'
      },
      {
        q: 'Can I modify my delivery address after placing an order?',
        a: 'Address changes are only possible if your order is still in the "PENDING" state. Please contact customer support immediately with your order ID and the new address to update it before dispatch.'
      }
    ]
  },
  {
    id: 'vendors',
    name: 'Vendors & Partners',
    icon: Store,
    faqs: [
      {
        q: 'How do I register as a vendor on Faflora?',
        a: 'To start selling, click "Sell on Faflora" or visit the "/vendor-registration" page. Fill out your brand name, store details, and payout bank information. Our vendor success team will review your application and approve your store within 48 hours.'
      },
      {
        q: 'What are the fees for selling on Faflora?',
        a: 'Registration is completely free! We only charge a small performance commission fee (ranging between 3% and 5% depending on your product category) on successful transactions. There are no hidden monthly subscription costs.'
      },
      {
        q: 'How do vendors receive payouts?',
        a: 'Payouts are processed automatically every Friday for all orders completed and delivered during the week. Earnings are sent directly to the bank account listed in your Vendor Dashboard settings.'
      }
    ]
  }
];

/* ─── Feature card data ─── */
const featureCards = [
  {
    icon: ShieldCheck,
    title: 'Secure Platform',
    desc: 'Transactions are fully encrypted. Your payments are processed using PCI-DSS compliance standards.',
    accentFrom: '#c800ff',
    accentTo: '#912cad',
  },
  {
    icon: RefreshCcw,
    title: 'E-Commerce Protections',
    desc: 'Refunds are automatically issued for cancelled orders under our secure buyer-protection terms.',
    accentFrom: '#912cad',
    accentTo: '#6b0f6b',
  },
  {
    icon: Globe,
    title: '24/7 Knowledge Base',
    desc: 'Browse topics online anywhere, anytime, to find detailed self-help instructions and guides.',
    accentFrom: '#c740b0',
    accentTo: '#c800ff',
  },
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('orders');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase();
    const matches: { q: string; a: string; category: string }[] = [];
    faqCategories.forEach((cat) => {
      cat.faqs.forEach((faq) => {
        if (faq.q.toLowerCase().includes(query) || faq.a.toLowerCase().includes(query)) {
          matches.push({ ...faq, category: cat.name });
        }
      });
    });
    return matches;
  }, [searchQuery]);

  const activeCategory = faqCategories.find((c) => c.id === activeTab);

  return (
    <div
      className="font-sans bg-[#fdf8ff] min-h-screen overflow-x-hidden"
      style={{ fontFamily: "'Palatino Linotype', 'Book Antiqua', 'Georgia', serif" }}
    >
      {/* ══ HERO SECTION ══ */}
      <section className="relative overflow-hidden border-b border-[#e8b8e4]/40" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fdf4ff 40%, #f9eaff 70%, #f2d8ff 100%)' }}>

        {/* ── Layered geometric SVG – top right ── */}
        <div
          className="absolute top-0 right-0 w-[620px] h-[620px] pointer-events-none select-none"
          aria-hidden="true"
        >
          <svg viewBox="0 0 620 620" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Large soft backdrop polygon */}
            <path d="M540,40 L680,220 L540,400 L340,400 L200,220 L340,40 Z" fill="#f9eaff" opacity="0.55" />

            {/* Diagonal mesh lines */}
            <path d="M0 80 L620 280 M0 200 L620 400 M0 320 L620 520" stroke="#e8b8e4" strokeWidth="0.6" opacity="0.5" />
            <path d="M80 0 L260 620 M200 0 L380 620 M320 0 L500 620" stroke="#dda8d8" strokeWidth="0.6" opacity="0.4" />

            {/* Concentric rings – focal burst */}
            <circle cx="480" cy="180" r="240" stroke="url(#heroRing1)" strokeWidth="1.2" />
            <circle cx="480" cy="180" r="190" stroke="#e8b8e4" strokeWidth="0.8" />
            <circle cx="480" cy="180" r="140" stroke="#f0c8ec" strokeWidth="0.6" />
            <circle cx="480" cy="180" r="90" stroke="#e4a8e0" strokeWidth="0.5" />
            <circle cx="480" cy="180" r="44" stroke="#c800ff" strokeWidth="0.5" opacity="0.3" />

            {/* Focal dot */}
            <circle cx="480" cy="180" r="6" fill="#c800ff" opacity="0.7" />
            <circle cx="480" cy="180" r="12" fill="#c800ff" opacity="0.12" />

            {/* Crosshair fine lines */}
            <line x1="430" y1="180" x2="530" y2="180" stroke="#c800ff" strokeWidth="0.9" opacity="0.25" />
            <line x1="480" y1="130" x2="480" y2="230" stroke="#c800ff" strokeWidth="0.9" opacity="0.25" />

            {/* Floating accent circles */}
            <circle cx="310" cy="370" r="9" fill="#fdf3fc" />
            <circle cx="310" cy="370" r="18" stroke="#c740b0" strokeWidth="1" opacity="0.4" />
            <circle cx="180" cy="120" r="5" fill="#c800ff" opacity="0.3" />
            <circle cx="560" cy="420" r="7" fill="#912cad" opacity="0.2" />

            {/* Small decorative diamond */}
            <rect x="200" y="300" width="20" height="20" rx="3" stroke="#c800ff" strokeWidth="0.8" opacity="0.3" transform="rotate(45 210 310)" />

            {/* Gradient defs */}
            <defs>
              <linearGradient id="heroRing1" x1="240" y1="0" x2="720" y2="360">
                <stop offset="0%" stopColor="#c800ff" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#912cad" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* ── Bottom-left accent ── */}
        <div
          className="absolute bottom-0 left-0 w-[320px] h-[320px] pointer-events-none select-none overflow-hidden"
          aria-hidden="true"
        >
          <svg viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <circle cx="20" cy="300" r="210" stroke="#e8b8e4" strokeWidth="0.8" />
            <circle cx="20" cy="300" r="260" stroke="#f0c8ec" strokeWidth="0.5" />
            <rect x="130" y="120" width="40" height="40" rx="6" stroke="#e0a0d8" strokeWidth="1" transform="rotate(45 150 140)" />
            <line x1="0" y1="140" x2="180" y2="320" stroke="#e0a0d8" strokeWidth="0.5" />
          </svg>
        </div>

        {/* ── Radial glow orbs ── */}
        <div className="absolute top-[-80px] right-[-80px] w-[420px] h-[420px] rounded-full bg-[#c800ff]/8 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] w-[300px] h-[300px] rounded-full bg-[#912cad]/6 blur-[80px] pointer-events-none" />

        {/* ── Fine dot matrix ── */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #912cad 1.2px, transparent 1.2px)',
            backgroundSize: '22px 22px',
          }}
        />

        {/* ── Hero Content ── */}
        <div className="relative max-w-5xl mx-auto px-6 md:px-12 pt-24 pb-32">
          <div className="max-w-2xl">

            {/* Badge */}
            <FadeInSection type="fadeDown" delay={0.1}>
              <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-[#e0a8da] text-[#b000e0] text-[10px] font-black uppercase tracking-[4px] px-5 py-2.5 rounded-full mb-8 shadow-sm">
                <HelpCircle size={11} />
                Faflora · Knowledge Hub
              </div>
            </FadeInSection>

            {/* Gradient title */}
            <FadeInSection type="fadeUp" delay={0.2}>
              <h1
                className="text-5xl md:text-6xl lg:text-[5.5rem] font-black leading-[0.95] tracking-tight"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                {/* Line 1 */}
                <span
                  className="block"
                  style={{
                    background: 'linear-gradient(100deg, #7b00c0 0%, #c800ff 45%, #ff40d0 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  <TypingText text="Frequently" delay={350} typingSpeed={60} colorClass="" />
                </span>
                {/* Line 2 */}
                <span
                  className="block"
                  style={{
                    background: 'linear-gradient(100deg, #c800ff 0%, #912cad 50%, #6b0f6b 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  <TypingText text="Asked" delay={950} typingSpeed={60} colorClass="" />
                </span>
                {/* Line 3 */}
                <span
                  className="block"
                  style={{
                    background: 'linear-gradient(100deg, #912cad 0%, #c800ff 60%, #ff69e0 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  <TypingText text="Questions" delay={1350} typingSpeed={60} colorClass="" />
                </span>
              </h1>
            </FadeInSection>

            {/* Divider rule */}
            <FadeInSection type="fadeUp" delay={0.4}>
              <div className="mt-7 flex items-center gap-3">
                <div className="h-[3px] w-16 rounded-full" style={{ background: 'linear-gradient(90deg, #c800ff, #912cad)' }} />
                <div className="h-[3px] w-8 rounded-full bg-[#e8b8e4]" />
                <div className="h-[3px] w-4 rounded-full bg-[#f0c8ec]" />
              </div>
              <p className="mt-5 text-gray-500 text-base md:text-lg max-w-xl leading-relaxed">
                Have questions? We have answers. Find quick solutions to ordering, payments, vendor registration, and delivery services.
              </p>
            </FadeInSection>

            {/* Search */}
            <FadeInSection type="fadeUp" delay={0.5}>
              <div className="mt-9 relative max-w-md group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#c800ff] transition-colors">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Search questions or keywords..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setExpandedIndex(null);
                  }}
                  className="w-full pl-12 pr-6 py-4 rounded-2xl border border-[#e0a8da] bg-white/80 backdrop-blur-sm text-slate-800 placeholder-gray-400 shadow-sm focus:shadow-md focus:border-[#c800ff] focus:ring-4 focus:ring-purple-100 outline-none transition-all font-medium text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 inset-y-0 my-auto text-xs font-bold text-gray-400 hover:text-slate-600 transition"
                  >
                    Clear
                  </button>
                )}
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ══ CONTENT BODY ══ */}
      <div className="max-w-5xl mx-auto px-6 md:px-12 pb-24 -mt-10 relative z-10">

        {/* SEARCH RESULTS MODE */}
        {filteredResults !== null ? (
          <FadeInSection type="fadeUp" delay={0.1}>
            <div className="bg-white rounded-3xl p-8 border border-[#e8b8e4] shadow-xl">
              <h3 className="text-xl font-extrabold text-[#1a0018] mb-6 flex items-center gap-2">
                <Sparkles size={18} className="text-[#c800ff]" />
                Search Results ({filteredResults.length})
              </h3>

              {filteredResults.length > 0 ? (
                <div className="space-y-4">
                  {filteredResults.map((faq, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-[#fdf8ff] border border-[#f0c8ec]/60 transition hover:border-[#c800ff] hover:bg-white"
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#c740b0] bg-purple-50 px-2.5 py-1 rounded-full mb-2 inline-block">
                        {faq.category}
                      </span>
                      <h4 className="text-base font-extrabold text-[#1a0018]">{faq.q}</h4>
                      <p className="mt-2 text-sm text-gray-600 leading-relaxed font-medium">{faq.a}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400 font-medium">
                  <p className="text-lg font-bold mb-2 text-slate-700">No matches found</p>
                  <p className="text-sm">Try typing different keywords, e.g. &quot;refund&quot;, &quot;vendor&quot;, &quot;cancel&quot;.</p>
                </div>
              )}
            </div>
          </FadeInSection>
        ) : (
          /* STANDARD MODE: TABS + ACCORDION */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Category Sidebar */}
            <div className="lg:col-span-4 space-y-3">
              <span className="block text-[10px] font-black uppercase tracking-[3px] text-[#c740b0] mb-4 pl-1">
                FAQ Categories
              </span>
              <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 scrollbar-none">
                {faqCategories.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeTab === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveTab(cat.id);
                        setExpandedIndex(null);
                      }}
                      className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-left font-bold text-sm transition-all whitespace-nowrap lg:whitespace-normal w-fit lg:w-full border ${
                        isActive
                          ? 'text-white border-transparent shadow-lg shadow-purple-500/20 scale-[1.02]'
                          : 'bg-white border-gray-100 text-slate-700 hover:bg-[#fcedf9]/25 hover:border-[#fcedf9]'
                      }`}
                      style={
                        isActive
                          ? { background: 'linear-gradient(135deg, #c800ff 0%, #912cad 100%)' }
                          : {}
                      }
                    >
                      <Icon size={16} className={isActive ? 'text-white' : 'text-[#c800ff]'} />
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accordion Questions */}
            <div className="lg:col-span-8">
              <FadeInSection type="fadeUp" delay={0.15}>
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e8b8e4] shadow-xl">
                  {activeCategory && (
                    <>
                      {/* Section header */}
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #c800ff 0%, #912cad 100%)' }}
                        >
                          <activeCategory.icon size={15} />
                        </div>
                        <h2 className="text-xl font-extrabold text-[#1a0018]">{activeCategory.name} FAQs</h2>
                      </div>

                      <div className="space-y-3">
                        {activeCategory.faqs.map((faq, index) => {
                          const isExpanded = expandedIndex === index;
                          return (
                            <div
                              key={index}
                              className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                                isExpanded
                                  ? 'border-[#c800ff] shadow-md shadow-purple-100'
                                  : 'border-gray-100 bg-white hover:border-purple-200 hover:shadow-sm'
                              }`}
                              style={
                                isExpanded
                                  ? { background: 'linear-gradient(145deg, #fdf3fc 0%, #ffffff 100%)' }
                                  : {}
                              }
                            >
                              <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full flex items-center justify-between text-left px-5 py-4 focus:outline-none group"
                              >
                                {/* ── Active question text turns purple ── */}
                                <span
                                  className={`font-extrabold text-sm md:text-base pr-4 transition-colors duration-200 ${
                                    isExpanded ? 'text-[#c800ff]' : 'text-[#1a0018] group-hover:text-[#912cad]'
                                  }`}
                                >
                                  {faq.q}
                                </span>
                                <motion.span
                                  animate={{ rotate: isExpanded ? 180 : 0 }}
                                  transition={{ duration: 0.22 }}
                                  className={`shrink-0 transition-colors ${isExpanded ? 'text-[#c800ff]' : 'text-gray-400'}`}
                                >
                                  <ChevronDown size={18} />
                                </motion.span>
                              </button>

                              <AnimatePresence initial={false}>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                  >
                                    <div className="px-5 pb-5 pt-1 text-sm text-gray-600 leading-relaxed font-medium border-t border-purple-50">
                                      {faq.a}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </FadeInSection>
            </div>
          </div>
        )}

        {/* ══ FEATURE CARDS (equal height via flex + stretch) ══ */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {featureCards.map((feat, idx) => (
            <FadeInSection key={idx} type="fadeUp" delay={0.1 + idx * 0.1}>
              {/* h-full ensures the inner card fills the grid row height */}
              <div className="h-full bg-white rounded-3xl p-7 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group flex flex-col">
                {/* Gradient orb accent */}
                <div
                  className="absolute top-0 right-0 w-28 h-28 rounded-full translate-x-10 -translate-y-10 group-hover:scale-125 transition-transform duration-500 opacity-10"
                  style={{ background: `radial-gradient(circle, ${feat.accentFrom}, ${feat.accentTo})` }}
                />
                {/* Top border accent line */}
                <div
                  className="absolute top-0 left-0 right-0 h-[3px] rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, ${feat.accentFrom}, ${feat.accentTo})` }}
                />
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-5 flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${feat.accentFrom}, ${feat.accentTo})` }}
                >
                  <feat.icon size={20} />
                </div>
                {/* Text */}
                <h4 className="text-base font-extrabold text-[#1a0018] mb-2">{feat.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed font-medium flex-1">{feat.desc}</p>
              </div>
            </FadeInSection>
          ))}
        </div>

        {/* ══ CONTACT BANNER ══ */}
        <div className="mt-20">
          <FadeInSection type="zoom" delay={0.15}>
            <div className="relative overflow-hidden rounded-3xl border border-[#e8b8e4]">
              {/* Deep gradient background */}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #2d0029 0%, #6b0f6b 45%, #c800ff 100%)' }} />
              {/* Glow orbs */}
              <div className="absolute -top-20 -right-14 w-72 h-72 rounded-full bg-[#c740b0] opacity-20 blur-[80px] pointer-events-none" />
              <div className="absolute -bottom-14 -left-14 w-56 h-56 rounded-full bg-[#ff69e0] opacity-12 blur-[60px] pointer-events-none" />
              {/* Subtle ruled lines */}
              <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{ backgroundImage: 'repeating-linear-gradient(135deg, white 0px, white 1px, transparent 1px, transparent 32px)' }}
              />
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 px-8 md:px-12 py-10">
                <div className="flex items-center gap-5">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-white">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <span className="block text-[9px] font-black uppercase tracking-[3px] text-[#f0c8ec]">
                      Still have questions?
                    </span>
                    <h4 className="text-white font-extrabold text-lg md:text-xl mt-0.5">
                      Get in touch with customer care
                    </h4>
                    <p className="text-white/60 text-xs mt-0.5 max-w-sm">
                      Our experts will respond within 24 hours to help you solve your store or order issue.
                    </p>
                  </div>
                </div>
                <Link
                  href="/contact-us"
                  className="inline-flex items-center gap-2 bg-white text-[#981d87] font-black text-xs px-6 py-3.5 rounded-full hover:bg-[#fdf3fc] hover:scale-105 active:scale-95 transition-all shadow-md whitespace-nowrap"
                >
                  Contact Support <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </FadeInSection>
        </div>
      </div>
    </div>
  );
}
