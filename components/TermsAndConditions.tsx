'use client';

import styles from '@/components/information/information.module.css';
import PolicyDocument from '@/components/information/PolicyDocument';
import {
  BarChart2,
  CreditCard,
  Lock,
  RefreshCcw,
  Scale,
  Shield,
  Store,
  Users,
} from '@/components/ui/platform-icons';
import React from 'react';

const SectionTitle = ({
  subtitle,
  title,
}: {
  subtitle: string;
  title: string;
  icon: React.ReactNode;
}) => (
  <h2>
    <span>{subtitle}.</span> {title}
  </h2>
);

const BulletItem = ({ text }: { text: string }) => (
  <div className="flex items-start gap-3">
    <div className="flex-shrink-0 mt-[7px] w-5 h-5 rounded-full flex items-center justify-center">
      <div className="w-1 h-1 rounded-full bg-[#657065]" />
    </div>
    <span className="text-gray-600 text-sm md:text-base leading-relaxed">
      {text}
    </span>
  </div>
);

const InfoCard = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="mt-8 p-6 rounded-lg border border-[#e2e7e1]">
    <p className="font-bold text-[#228b22] mb-4 flex items-center gap-2">
      <span className="w-5 h-5 rounded-full text-[#22643e] flex items-center justify-center text-[10px]">
        !
      </span>
      {label}
    </p>
    {children}
  </div>
);

const SectionWrapper = ({
  children,
}: {
  children: React.ReactNode;
  delay: number;
}) => <section className={styles.section}>{children}</section>;

export default function TermsAndConditions() {
  return (
    <PolicyDocument title="Terms and conditions">
      <SectionWrapper delay={0.3}>
        <SectionTitle
          subtitle="1"
          title="Payments"
          icon={<CreditCard size={20} />}
        />
        <p className="text-gray-600">
          EkivaMart integrates robust, secure payment gateways tailored for the
          Nigerian market, supporting popular methods like bank transfers,
          cards, mobile money, USSD, and flexible partial payment plans.
          Customers can split payments over time, making premium or bulk
          purchases accessible without waiting for payday.
        </p>
        <div className="mt-6 grid gap-3">
          <BulletItem text="Funds are held securely in escrow until delivery confirmation, protecting both buyers and vendors." />
          <BulletItem text="Vendors receive reliable, scheduled payouts (minus transparent platform fees) directly to their verified bank accounts — often within days of successful order completion." />
          <BulletItem text="Escrow auto-releases after a set period if no dispute is raised, ensuring cash flow is never unnecessarily delayed." />
          <BulletItem text="This system reduces payment risks, minimizes fraud exposure, and ensures steady cash flow for your business operations." />
        </div>
      </SectionWrapper>

      <SectionWrapper delay={0.35}>
        <SectionTitle
          subtitle="2"
          title="Vendor Data"
          icon={<BarChart2 size={20} />}
        />
        <p className="text-gray-600">
          We provide a centralized dashboard where you manage everything:
          product uploads, high-resolution images, detailed descriptions,
          pricing, variations (sizes, colors, etc.), inventory tracking, and
          sales analytics.
        </p>
        <div className="mt-6 grid gap-3">
          <BulletItem text="Track performance metrics like views, add-to-carts, orders, revenue trends, top-performing items, and customer feedback." />
          <BulletItem text="Use insights to optimize listings, adjust pricing strategically, run promotions, and identify growth opportunities." />
          <BulletItem text="No more scattered spreadsheets — EkivaMart keeps your vendor data organized, secure, and actionable, helping you make data-driven decisions to boost profitability." />
        </div>
      </SectionWrapper>

      <SectionWrapper delay={0.4}>
        <SectionTitle
          subtitle="3"
          title="Customer Data"
          icon={<Users size={20} />}
        />
        <p className="text-gray-600">
          EkivaMart securely collects and manages buyer information needed for
          smooth transactions: shipping addresses, order history, preferences,
          and contact details.
        </p>
        <div className="mt-6 grid gap-3">
          <BulletItem text="Powers personalized recommendations, targeted promotions, abandoned cart reminders, and loyalty rewards." />
          <BulletItem text="Vendors receive aggregated insights (without revealing personal identities) to understand audience behavior — e.g., popular categories in specific regions — so you can stock what Nigerians want most." />
          <BulletItem text="All data handling prioritizes privacy and compliance, fostering long-term customer trust and repeat business." />
        </div>
      </SectionWrapper>

      <SectionWrapper delay={0.45}>
        <SectionTitle
          subtitle="4"
          title="Payment Liability"
          icon={<Shield size={20} />}
        />
        <p className="text-gray-600">
          One of the biggest advantages of joining EkivaMart is reduced
          financial risk for vendors. We manage the entire payment ecosystem,
          including fraud detection, chargeback handling, and dispute
          resolution.
        </p>
        <div className="mt-6 grid gap-3">
          <BulletItem text="When a customer pays, funds enter escrow — released to you only after order fulfillment and buyer confirmation (or auto-release after a set period if no issues arise)." />
          <BulletItem text="Protects you from non-payment scams or unauthorized transactions." />
          <BulletItem text="In cases of valid disputes (e.g., item not received), EkivaMart facilitates fair resolution, often covering platform-side liabilities." />
          <BulletItem text="Vendors aren't directly exposed to raw card details or immediate refund demands — we handle processing refunds from escrow where appropriate." />
          <BulletItem text="Competitive, transparent commission rates with scheduled payouts. This structure builds confidence especially for new or small-scale sellers entering ecommerce." />
        </div>
      </SectionWrapper>

      <SectionWrapper delay={0.5}>
        <SectionTitle
          subtitle="5"
          title="Vendor Responsibility"
          icon={<Store size={20} />}
        />
        <p className="text-gray-600">
          Success on EkivaMart thrives on mutual accountability. As a vendor,
          you commit to:
        </p>
        <div className="mt-6 grid gap-3">
          <BulletItem text="Uploading accurate, honest product listings with clear photos, specifications, pricing, and stock levels to prevent overselling or cancellations." />
          <BulletItem text="Ensuring all items are genuine, high-quality, and meet Nigerian consumer standards — no counterfeits or misleading claims." />
          <BulletItem text="Fulfilling orders promptly: pack securely, ship within agreed timelines (often 1–3 business days), and provide tracking via our partnered logistics for fast delivery to all states." />
          <BulletItem text="Communicating professionally with customers through our messaging system for queries, updates, or issues." />
          <BulletItem text="Complying with platform guidelines, Nigerian laws (including consumer protection and e-commerce regulations), and honoring your listed policies on warranties, returns, or exchanges." />
          <BulletItem text="Maintaining positive ratings — high-performing vendors get boosted visibility, priority support, and promotional features. Breaches (e.g., repeated late shipments) may lead to warnings, suspensions, or account review, but we offer guidance to help you improve. Ultimately, your responsibility drives your reputation and success on the platform." />
        </div>
      </SectionWrapper>

      <SectionWrapper delay={0.55}>
        <SectionTitle
          subtitle="6"
          title="Refund Policy"
          icon={<RefreshCcw size={20} />}
        />
        <p className="text-gray-600">
          Customer satisfaction is paramount at EkivaMart, and our refund policy
          balances fairness for buyers with protection for honest vendors.
        </p>
        <div className="mt-6 grid gap-3">
          <BulletItem text="Customers may initiate returns/refunds for defective, damaged, incorrect, or non-delivered items — typically within 7–14 days of receipt (exact window displayed per order; always check current faflora.com policy)." />
          <BulletItem text="For vendor errors (wrong item, poor quality), you may cover return shipping, and approved refunds deduct from your escrow or future payouts." />
          <BulletItem text="Valid refunds process back to the original payment method, often within 5–10 business days." />
          <BulletItem text="Change-of-mind returns depend on your individual store policy — some vendors offer them for a competitive edge." />
          <BulletItem text="EkivaMart mediates fairly, reviewing evidence like photos or tracking data. Vendors with low dispute rates enjoy better platform perks." />
        </div>
        <InfoCard label="Non-refundable items (must be clearly marked in listings):">
          <div className="grid gap-2">
            {[
              'Personalized or custom-made products',
              'Hygiene, beauty, and personal care items',
              'Perishable goods',
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-sm text-gray-600"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#1c711c] flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </InfoCard>
      </SectionWrapper>

      <SectionWrapper delay={0.6}>
        <SectionTitle
          subtitle="7"
          title="Data Usage & Privacy"
          icon={<Lock size={20} />}
        />
        <p className="text-gray-600">
          Data is handled responsibly to enhance the entire ecosystem while
          protecting privacy at every layer.
        </p>
        <div className="mt-6 grid gap-3">
          <BulletItem text="We collect vendor data (business profile, sales stats, listings) to deliver tools like performance dashboards, search optimization, recommendation algorithms, and marketing insights — helping you grow visibility and sales." />
          <BulletItem text="Customer data (orders, browsing patterns, aggregate demographics) enables personalized shopping, targeted ads, delivery coordination, and platform improvements." />
          <BulletItem text="All personal information is encrypted, never sold to third parties, and used strictly for legitimate purposes." />
          <BulletItem text="We comply fully with Nigeria's Data Protection Regulation (NDPR) and international best practices, conducting regular audits." />
          <BulletItem text="Vendors can access their own data reports, but sensitive customer details are safeguarded at all times. This responsible approach builds trust — buyers shop confidently, vendors benefit from better tools, and the entire EkivaMart community grows sustainably." />
        </div>
      </SectionWrapper>

      <SectionWrapper delay={0.65}>
        <SectionTitle
          subtitle="8"
          title="Governing Law"
          icon={<Scale size={20} />}
        />
        <p className="text-gray-600 leading-relaxed">
          These Terms are governed by the laws of the Federal Republic of
          Nigeria. Any disputes arising from or in connection with these Terms
          shall be resolved by the competent courts of Nigeria.
        </p>
      </SectionWrapper>
    </PolicyDocument>
  );
}
