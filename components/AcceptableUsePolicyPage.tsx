import React from 'react';
import FadeInSection from '@/components/FadeInSection';
import TypingText from '@/components/TypingText';
import {
  CheckCircle2,
  XCircle,
  Store,
  ShieldAlert,
  ClipboardList,
  Star,
  AlertTriangle,
  Lock,
  UserCheck,
  Copyright,
  Gavel,
  Flag,
  RefreshCw,
  ArrowRight,
  Scale,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';

/* ─── TYPES ─── */
interface ClauseData {
  id: string;
  number: string;
  title: string;
  icon: LucideIcon;
  content: React.ReactNode;
}

/* ─── SHARED PRIMITIVES ─── */

const Pill = ({ text, tone = 'light' }: { text: string; tone?: 'light' | 'dark' }) =>
  tone === 'dark' ? (
    <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-[11px] font-semibold px-4 py-2 rounded-full backdrop-blur-sm">
      {text}
    </span>
  ) : (
    <span className="inline-flex items-center gap-2 bg-[#fdf3fc] border border-[#e8b8e4] text-[#8236be] text-[11px] font-semibold px-4 py-2 rounded-full">
      {text}
    </span>
  );

const Divider = () => (
  <div className="flex items-center gap-3 my-12">
    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#e8b8e4] to-transparent" />
    <div className="w-1.5 h-1.5 rounded-full bg-[#8236be]" />
    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#e8b8e4] to-transparent" />
  </div>
);

/** A bullet whose visual tells you whether the line is something you MAY do or MUST NOT do. */
const Rule = ({ text, tone }: { text: string; tone: 'allow' | 'deny' | 'note' }) => {
  const styles = {
    allow: { bg: 'bg-gradient-to-br from-[#9d4ae3] to-[#8236be]', ring: '' },
    deny: { bg: 'bg-[#fdeef0]', ring: 'ring-1 ring-[#f6c9cf]' },
    note: { bg: 'bg-[#f0c8ec]', ring: '' },
  }[tone];

  return (
    <li className="flex items-start gap-3 text-gray-600 text-[15px] md:text-[16px] leading-relaxed">
      <span className={`flex-shrink-0 mt-[3px] w-5 h-5 rounded-full flex items-center justify-center ${styles.bg} ${styles.ring}`}>
        {tone === 'deny' ? (
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1 1L7 7M7 1L1 7" stroke="#e5001e" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        ) : tone === 'allow' ? (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3.2 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-[#8236be]" />
        )}
      </span>
      <span>{text}</span>
    </li>
  );
};

const RuleList = ({ items, tone, columns = 1 }: { items: string[]; tone: 'allow' | 'deny' | 'note'; columns?: 1 | 2 }) => (
  <ul className={`mt-5 gap-x-8 gap-y-2.5 ${columns === 2 ? 'grid md:grid-cols-2' : 'space-y-2.5'}`}>
    {items.map((text) => (
      <Rule key={text} text={text} tone={tone} />
    ))}
  </ul>
);

const Lede = ({ children }: { children: React.ReactNode }) => (
  <p className="text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">{children}</p>
);

const ClauseAnchor = ({ id }: { id: string }) => (
  <span id={id} className="block -mt-28 pt-28 invisible absolute" aria-hidden="true" />
);

const ClauseNumber = ({ n }: { n: string }) => (
  <span
    className="select-none font-black text-[4rem] md:text-[4.5rem] leading-none text-[#f0c8ec] absolute -left-1 -top-6 pointer-events-none"
    style={{ fontFamily: "'Georgia', serif" }}
    aria-hidden="true"
  >
    {n.padStart(2, '0')}
  </span>
);

const ClauseHeading = ({
  number,
  title,
  icon: Icon,
  delay,
}: {
  number: string;
  title: string;
  icon: LucideIcon;
  delay: number;
}) => (
  <FadeInSection type="slideLeft" delay={delay}>
    <div className="relative pb-4 mb-8">
      <ClauseNumber n={number} />
      <div className="relative flex items-center gap-3 pt-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#9d4ae3] to-[#8236be] flex items-center justify-center text-white shadow-lg shadow-[#9d4ae330]">
          <Icon size={18} />
        </div>
        <div>
          <span className="block text-[10px] font-black uppercase tracking-[4px] text-[#8236be] mb-0.5">
            Clause {number.padStart(2, '0')}
          </span>
          <h2
            className="text-xl md:text-2xl lg:text-[25px] font-extrabold text-[#1a0018] leading-tight"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            {title}
          </h2>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-[#8236be]/40 via-[#e8b8e4]/60 to-transparent" />
    </div>
  </FadeInSection>
);

const TableOfContents = () => (
  <aside className="hidden xl:block sticky top-28 self-start w-60 flex-shrink-0">
    <div className="rounded-2xl border border-[#e8b8e4] bg-white/70 backdrop-blur-sm p-5 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-[3px] text-[#8236be] mb-4">Clauses</p>
      <nav>
        <ul className="space-y-1">
          {clauses.map((c) => (
            <li key={c.id}>
              <a
                href={`#${c.id}`}
                className="flex items-center gap-2.5 text-sm text-gray-500 hover:text-[#9d4ae3] transition-colors py-1 group"
              >
                <span className="text-[11px] font-bold text-[#8236be]/45 group-hover:text-[#8236be]/80 w-6 flex-shrink-0">
                  {c.number.padStart(2, '0')}
                </span>
                <span className="leading-tight">{c.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  </aside>
);

/* ─── CLAUSE DATA (content preserved exactly) ─── */
const clauses: ClauseData[] = [
  {
    id: 'acceptable-use',
    number: '1',
    title: 'Acceptable Use',
    icon: CheckCircle2,
    content: (
      <>
        <Lede>
          Faflora is designed to provide a safe, reliable, and convenient marketplace where vendors can sell products and customers can discover and purchase products and services.
        </Lede>
        <p className="mt-5 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          You may use Faflora only for lawful, legitimate, and authorized purposes. As a customer, vendor, or visitor, you agree to use Faflora in a manner that:
        </p>
        <RuleList
          tone="allow"
          items={[
            'Complies with all applicable laws and regulations.',
            'Respects the rights and privacy of other users.',
            'Does not interfere with the operation of the Faflora platform.',
            'Does not compromise the security or integrity of the marketplace.',
            'Does not involve fraud, deception, abuse, or misleading activity.',
            'Does not harm Faflora, its customers, vendors, delivery partners, employees, or other users.',
          ]}
        />
        <p className="mt-6 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          Vendors are responsible for ensuring that the products and services they list on Faflora are lawful, accurately described, properly priced, and permitted under Faflora&apos;s marketplace rules.
        </p>
      </>
    ),
  },
  {
    id: 'prohibited-activities',
    number: '2',
    title: 'Prohibited Activities',
    icon: XCircle,
    content: (
      <>
        <Lede>You must not use Faflora to:</Lede>
        <RuleList
          tone="deny"
          columns={2}
          items={[
            'Violate any applicable law, regulation, or legal requirement.',
            'Commit, facilitate, or promote fraud, theft, scams, or other unlawful activities.',
            'Gain unauthorized access to Faflora accounts, systems, databases, networks, or services.',
            "Attempt to bypass, disable, or interfere with Faflora's security features.",
            'Introduce viruses, malware, ransomware, spyware, malicious scripts, or other harmful software.',
            "Disrupt, damage, overload, or interfere with the operation of Faflora's website, applications, servers, or networks.",
            'Use bots, crawlers, scrapers, or automated systems to collect information from Faflora without prior authorization.',
            'Create fake or duplicate accounts for fraudulent or abusive purposes.',
            'Impersonate another person, customer, vendor, business, organization, or Faflora representative.',
            'Provide false, inaccurate, misleading, or fraudulent information.',
            'Manipulate product ratings, reviews, sales figures, search rankings, promotions, or other marketplace features.',
            "Use another person's account, payment information, or login credentials without authorization.",
            "Attempt to obtain, collect, or misuse another user's personal or confidential information.",
            'Send spam, phishing messages, malicious links, or unauthorized promotional communications.',
            'Harass, threaten, intimidate, abuse, or defame other users.',
            'Upload or distribute unlawful, fraudulent, hateful, threatening, or otherwise prohibited content.',
            "Circumvent Faflora's payment, transaction, commission, security, or marketplace systems.",
            'Attempt to avoid applicable Faflora fees or marketplace restrictions.',
            'Abuse promotions, discounts, vouchers, referral programs, refunds, returns, or other Faflora offers.',
            'Reverse engineer, decompile, disassemble, or attempt to discover the source code or underlying technology of Faflora, except where permitted by applicable law.',
            "Copy, reproduce, distribute, sell, modify, or commercially exploit Faflora's platform, content, branding, or technology without authorisation.",
            'Use Faflora in a manner that could reasonably damage the platform, its users, vendors, partners, or reputation.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'vendor-responsibilities',
    number: '3',
    title: 'Vendor Responsibilities',
    icon: Store,
    content: (
      <>
        <Lede>Vendors are responsible for the products and services they list and sell through Faflora. Vendors must:</Lede>
        <RuleList
          tone="allow"
          columns={2}
          items={[
            'Provide accurate business and account information.',
            'Provide truthful product descriptions, images, specifications, prices, and availability.',
            'Ensure that products and services listed on Faflora are lawful and permitted.',
            'Have the necessary rights, licenses, permits, and authorizations required to sell their products or services.',
            'Ensure that products are genuine and accurately represented.',
            'Fulfil customer orders in accordance with the information provided on the platform.',
            'Communicate honestly and professionally with customers.',
            'Avoid misleading, deceptive, or fraudulent product claims.',
            "Respect customer privacy and protect customer information.",
            'Comply with applicable consumer protection, product safety, taxation, advertising, intellectual property, and other applicable laws.',
            'Maintain appropriate transaction and business records where required by law.',
          ]}
        />
        <p className="mt-6 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          Faflora may request additional information or documentation from vendors where reasonably necessary to verify their identity, business, products, or compliance with applicable requirements.
        </p>
      </>
    ),
  },
  {
    id: 'prohibited-products',
    number: '4',
    title: 'Prohibited and Restricted Products',
    icon: ShieldAlert,
    content: (
      <>
        <Lede>Faflora is a marketplace for lawful products and services.</Lede>
        <p className="mt-3 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          Vendors must not list, advertise, promote, or sell products or services that are prohibited by applicable law or Faflora&apos;s marketplace rules. Prohibited or restricted products may include, but are not limited to:
        </p>
        <div className="mt-6 grid sm:grid-cols-2 gap-2.5">
          {[
            'Illegal drugs and controlled substances',
            'Stolen goods or property',
            'Counterfeit or fraudulent products',
            'Products that infringe intellectual property rights',
            'Unlawful weapons or restricted items',
            'Explosives and unlawful hazardous materials',
            'Fraudulent identification or government documents',
            'Products or services facilitating illegal activity',
            'Malicious software or tools that compromise systems',
            'Products violating product safety or consumer law',
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#fdf7f8] border border-[#f6c9cf]/80"
            >
              <XCircle size={14} className="text-[#e5001e] flex-shrink-0" />
              <span className="text-[14px] text-gray-600 leading-snug">{item}</span>
            </div>
          ))}
        </div>
        <p className="mt-6 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          Any product or service prohibited by applicable law, or that Faflora reasonably determines presents an unacceptable legal, safety, security, or operational risk, is not permitted. Faflora may introduce additional restrictions on specific products, categories, vendors, or services where necessary to comply with applicable laws, payment-provider requirements, marketplace standards, or security considerations.
        </p>
      </>
    ),
  },
  {
    id: 'product-listings',
    number: '5',
    title: 'Product Listings',
    icon: ClipboardList,
    content: (
      <>
        <Lede>Vendors are responsible for all information and content included in their product listings. Product listings must:</Lede>
        <RuleList
          tone="allow"
          items={[
            'Accurately represent the product or service being offered.',
            'Contain clear and relevant product information.',
            'Display accurate pricing and availability.',
            'Use genuine and appropriate product images.',
            'Not contain false, fraudulent, or misleading claims.',
            'Not use deceptive descriptions or images.',
            "Not unlawfully use another person's photographs, trademarks, logos, or intellectual property.",
            'Not contain malicious links, software, or code.',
            'Comply with applicable advertising and consumer protection requirements.',
          ]}
        />
        <p className="mt-6 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          Faflora reserves the right to review, remove, restrict, reject, or suspend listings that violate this Policy, applicable law, or our marketplace rules.
        </p>
      </>
    ),
  },
  {
    id: 'reviews-ratings',
    number: '6',
    title: 'Reviews and Ratings',
    icon: Star,
    content: (
      <>
        <Lede>Reviews and ratings should represent genuine experiences with products, vendors, or services available through Faflora. You must not:</Lede>
        <RuleList
          tone="deny"
          items={[
            'Submit fake reviews.',
            'Create multiple accounts to manipulate ratings.',
            'Submit reviews on behalf of another person without authorization.',
            'Threaten or pressure another user to provide a particular rating.',
            'Publish deliberately false or misleading information.',
            'Use reviews to promote unrelated products, services, or businesses.',
            "Manipulate ratings or reviews for the purpose of unfairly increasing or damaging a vendor's reputation.",
          ]}
        />
        <p className="mt-6 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          Faflora may remove reviews or ratings that violate this Policy or applicable rules.
        </p>
      </>
    ),
  },
  {
    id: 'fraud-manipulation',
    number: '7',
    title: 'Fraud and Marketplace Manipulation',
    icon: AlertTriangle,
    content: (
      <>
        <Lede>Faflora does not permit fraudulent or deceptive activities intended to manipulate the marketplace. Prohibited activities include:</Lede>
        <RuleList
          tone="deny"
          columns={2}
          items={[
            'Fake orders.',
            'Fake accounts.',
            'Artificial sales activity.',
            'Manipulated reviews or ratings.',
            'Payment fraud.',
            'Promotion or voucher abuse.',
            'Referral abuse.',
            'Chargeback abuse.',
            'Attempts to circumvent Faflora fees.',
            'Attempts to manipulate search results or product rankings.',
            'Misrepresentation of products or services.',
            'Other deceptive marketplace practices.',
          ]}
        />
        <p className="mt-6 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          Faflora may suspend accounts, cancel transactions, restrict marketplace features, or take other appropriate action where fraudulent or abusive activity is identified.
        </p>
      </>
    ),
  },
  {
    id: 'account-security',
    number: '8',
    title: 'Account Security',
    icon: Lock,
    content: (
      <>
        <Lede>
          If you create an account with Faflora, you are responsible for keeping your account information and login credentials secure. You agree to:
        </Lede>
        <RuleList
          tone="allow"
          items={[
            'Keep your password confidential.',
            'Take reasonable steps to protect your account.',
            'Avoid sharing your login credentials with unauthorized persons.',
            'Notify Faflora promptly if you suspect unauthorized access to your account.',
            'Keep your account information accurate and up to date.',
          ]}
        />
        <p className="mt-6 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          You must not use another person&apos;s account without their authorization.
        </p>
      </>
    ),
  },
  {
    id: 'personal-information',
    number: '9',
    title: 'Personal Information and Privacy',
    icon: UserCheck,
    content: (
      <>
        <Lede>Users must respect the personal information and privacy of other users.</Lede>
        <p className="mt-5 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          You must not collect, store, disclose, sell, misuse, or otherwise process another person&apos;s personal information obtained through Faflora except where you have a lawful basis and appropriate authorization.
        </p>
        <p className="mt-5 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          Vendors must use customer information only for legitimate purposes connected with fulfilling orders, providing customer support, and carrying out other authorized business activities. Vendors are responsible for complying with applicable data protection and privacy laws when handling customer information.
        </p>
      </>
    ),
  },
  {
    id: 'intellectual-property',
    number: '10',
    title: 'Intellectual Property',
    icon: Copyright,
    content: (
      <>
        <Lede>Faflora respects intellectual property rights and expects all users and vendors to do the same.</Lede>
        <p className="mt-5 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          You must not upload, publish, sell, distribute, reproduce, or otherwise use content that infringes another person&apos;s intellectual property rights.
        </p>
        <p className="mt-5 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          Faflora&apos;s name, logo, branding, website design, software, platform technology, content, and other proprietary materials remain the property of Faflora Ltd or its respective licensors unless otherwise stated. Nothing in this Policy grants you ownership of Faflora&apos;s intellectual property.
        </p>
      </>
    ),
  },
  {
    id: 'enforcement',
    number: '11',
    title: 'Enforcement',
    icon: Gavel,
    content: (
      <>
        <Lede>Faflora reserves the right to investigate suspected violations of this Policy. Where appropriate, Faflora may:</Lede>
        <RuleList
          tone="note"
          columns={2}
          items={[
            'Remove or restrict product listings.',
            'Suspend or terminate accounts.',
            'Restrict access to marketplace features.',
            'Cancel or restrict transactions.',
            'Restrict or suspend vendor privileges.',
            'Request additional information or documentation.',
            'Preserve relevant information for investigation.',
            'Take technical measures to protect the platform and its users.',
            'Cooperate with law enforcement or regulatory authorities where required or permitted by law.',
            'Take legal action where appropriate.',
          ]}
        />
        <p className="mt-6 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          Faflora may take these actions where reasonably necessary to protect the platform, customers, vendors, delivery partners, employees, business partners, or other users.
        </p>
      </>
    ),
  },
  {
    id: 'reporting',
    number: '12',
    title: 'Reporting a Violation',
    icon: Flag,
    content: (
      <>
        <Lede>
          If you believe that a user, vendor, product listing, transaction, review, or other activity on Faflora violates this Policy, you may report the issue using the contact details provided on the Faflora website.
        </Lede>
        <p className="mt-5 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          When submitting a report, please provide sufficient information to help us understand and investigate the issue. Where applicable, a report may include:
        </p>
        <RuleList
          tone="note"
          items={[
            'The relevant account or vendor.',
            'Product or listing information.',
            'Transaction information.',
            'A description of the suspected violation.',
            'Supporting evidence or documentation.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'policy-changes',
    number: '13',
    title: 'Policy Changes',
    icon: RefreshCw,
    content: (
      <div className="rounded-2xl border-2 border-[#8236be]/20 bg-gradient-to-br from-[#fdf3fc] to-white p-6 md:p-8">
        <p className="text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          Faflora may update this Acceptable Use Policy from time to time to reflect changes to our marketplace, services, technology, business operations, legal requirements, or marketplace rules.
        </p>
        <p className="mt-5 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          When we make changes, the updated Policy will be published on this page with a revised &ldquo;Last Updated&rdquo; date. Your continued use of Faflora after an updated Policy has been published constitutes acceptance of the revised Policy, to the extent permitted by applicable law.
        </p>
      </div>
    ),
  },
];

/* ─── MAIN COMPONENT ─── */
export default function AcceptableUsePolicy() {
  return (
    <div
      className="font-sans bg-white min-h-screen overflow-x-hidden"
      style={{ fontFamily: "'Palatino Linotype', 'Book Antiqua', 'Georgia', serif" }}
    >
      {/* ── HERO ── */}
      <section className="relative overflow-hidden min-h-[76vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e0020] via-[#4a0a4a] to-[#8236be]" />
        <div className="absolute -top-24 -right-16 w-[45vw] h-[45vw] max-w-2xl max-h-2xl rounded-full bg-[#9d4ae3] opacity-20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-15%] left-[-8%] w-[35vw] h-[35vw] max-w-xl max-h-xl rounded-full bg-[#3d0060] opacity-30 blur-[100px] pointer-events-none" />

        {/* Ledger-rule texture, echoing a printed statute page */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, white 0px, white 1px, transparent 1px, transparent 44px)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-20 w-full pt-28 pb-20">
          <div className="grid lg:grid-cols-[1fr_auto] gap-14 items-end">
            <div className="max-w-2xl">
              <FadeInSection type="fadeDown" delay={0.1}>
                <div className="inline-flex items-center gap-2 border border-white/20 text-white/70 text-[10px] font-black uppercase tracking-[4px] px-4 py-2 rounded-full mb-8 bg-white/5">
                  <Scale size={11} />
                  <span>Faflora Ltd · Legal</span>
                </div>
              </FadeInSection>

              <FadeInSection type="fadeUp" delay={0.22}>
                <h1
                  className="text-5xl md:text-6xl lg:text-[5.2rem] lg:-skew-x-6 -skew-x-4 font-black text-white leading-[0.95] tracking-tight"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  <TypingText text="Acceptable Use" delay={350} typingSpeed={55} colorClass="text-[#e8b8e4]" />
                  <br />
                  <span className="text-[#e8b8e4]">
                    <TypingText text="Policy" delay={1200} typingSpeed={55} colorClass="text-white" />
                  </span>
                </h1>
              </FadeInSection>

              <FadeInSection type="fadeUp" delay={0.55}>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <div className="h-px w-14 bg-gradient-to-r from-[#e8b8e4] to-transparent" />
                  <p className="text-white/55 text-sm font-medium">
                    Effective Date: <span className="text-white/85 font-semibold">&mdash;</span> <span className="text-[#e8b8e4]"> September 01, 2026</span>
                  </p>
                </div>
                <p className="mt-6 text-white/60 text-base md:text-lg max-w-xl leading-relaxed">
                  By accessing or using Faflora, you agree to comply with this Policy, our{' '}
                  <Link href="/terms-and-conditions" className="text-[#e8b8e4] font-semibold hover:underline">
                    Terms and Conditions
                  </Link>
                  , <Link href="/privacy-policy" className="text-[#e8b8e4] font-semibold hover:underline">Privacy Policy</Link>, and any other applicable rules published on our website.
                </p>
              </FadeInSection>
            </div>

            {/* Signature element — at-a-glance permitted / prohibited */}
            <FadeInSection type="zoom" delay={0.4}>
              <div className="w-full lg:w-[300px] rounded-2xl bg-white/[0.06] border border-white/15 backdrop-blur-md p-6">
                <p className="text-[10px] font-black uppercase tracking-[3px] text-white/45 mb-5">At a glance</p>
                <div className="space-y-3">
                  {[
                    { text: 'Genuine listings & honest dealing', ok: true },
                    { text: 'Fraud, scams & fake accounts', ok: false },
                    { text: 'Secure, respectful conduct', ok: true },
                    { text: 'Manipulated reviews or rankings', ok: false },
                  ].map((row) => (
                    <div key={row.text} className="flex items-center gap-3">
                      <span
                        className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                          row.ok ? 'bg-gradient-to-br from-[#9d4ae3] to-[#8236be]' : 'bg-white/10 ring-1 ring-white/20'
                        }`}
                      >
                        {row.ok ? (
                          <svg width="8" height="6" viewBox="0 0 9 7" fill="none">
                            <path d="M1 3.5L3.2 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                            <path d="M1 1L7 7M7 1L1 7" stroke="#ff9eb0" strokeWidth="1.4" strokeLinecap="round" />
                          </svg>
                        )}
                      </span>
                      <span className="text-white/70 text-[13px] leading-snug">{row.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none">
          <svg viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,32 C480,64 960,0 1440,32 L1440,64 L0,64 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Compliance ribbon */}
      <FadeInSection type="fade" delay={0.1}>
        <div className="border-y border-[#e8b8e4] bg-[#fdf3fc] py-4 px-6 md:px-12">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-3">
            <Pill text="Applies to every buyer, vendor & visitor" />
            <Pill text="Enforced marketplace-wide" />
            <Pill text="Zero tolerance for fraud" />
          </div>
        </div>
      </FadeInSection>

      {/* Opening statement */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-16 pb-4">
        <FadeInSection type="zoom" delay={0.15}>
          <div className="relative rounded-3xl overflow-hidden border border-[#e8b8e4] shadow-md bg-white">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#9d4ae3] via-[#8236be] to-[#9d4ae3]" />
            <div className="px-8 md:px-12 py-8 md:py-10 pl-12 md:pl-16 flex items-start gap-5">
              <div className="hidden sm:flex flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-[#9d4ae3] to-[#8236be] items-center justify-center text-white shadow-md">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[4px] text-[#8236be] mb-3">If you do not agree</p>
                <p className="text-gray-700 text-base md:text-[17px] lg:text-[17.5px] leading-relaxed">
                  If you do not agree with this Policy, please do not use the Faflora Services. This page sets out what &ldquo;acceptable use&rdquo; means on our marketplace — for customers, vendors, and visitors alike — and what happens when it&apos;s not followed.
                </p>
              </div>
            </div>
          </div>
        </FadeInSection>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16">
        <div className="flex items-start gap-16">
          <TableOfContents />

          <main className="flex-1 min-w-0">
            {clauses.map((clause, index) => (
              <React.Fragment key={clause.id}>
                <section className="relative">
                  <ClauseAnchor id={clause.id} />
                  <ClauseHeading
                    number={clause.number}
                    title={clause.title}
                    icon={clause.icon}
                    delay={0.1 + index * 0.03}
                  />
                  <FadeInSection type="fadeUp" delay={0.18}>
                    {clause.content}
                  </FadeInSection>
                </section>
                {index < clauses.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </main>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pb-24">
        <FadeInSection type="zoom" delay={0.1}>
          <div className="relative overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1e0020] via-[#4a0a4a] to-[#8236be]" />
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#9d4ae3] opacity-20 blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-[#3d0060] opacity-30 blur-[60px] pointer-events-none" />
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg, white 0px, white 1px, transparent 1px, transparent 44px)' }}
            />

            <div className="relative px-8 md:px-16 py-12 md:py-16 flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/70 text-[10px] font-black uppercase tracking-[4px] px-4 py-2 rounded-full mb-5">
                  <Scale size={11} /> Read together with
                </div>
                <h3
                  className="text-2xl md:text-4xl lg:text-[40px] font-black text-white leading-tight mb-4"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  One policy.<br />
                  <span className="text-[#e8b8e4]">Every user.</span>
                </h3>
                <p className="text-white/55 text-sm md:text-base lg:text-[17px] leading-relaxed max-w-md">
                  This Policy works alongside our Terms and Conditions and Privacy Policy. Continued use of Faflora after an update means you accept the current version.
                </p>
              </div>

              <div className="flex flex-col gap-3 flex-shrink-0 w-full md:w-auto">
                <Link
                  href="/terms-and-conditions"
                  className="inline-flex items-center justify-center gap-2 bg-white text-[#8236be] px-8 py-3.5 rounded-full font-extrabold text-sm shadow-lg hover:scale-105 active:scale-95 transition-transform"
                >
                  Read Terms of Service <ArrowRight size={16} />
                </Link>
                <Link
                  href="/privacy-policy"
                  className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white px-8 py-3.5 rounded-full font-extrabold text-sm hover:bg-white/10 transition-colors"
                >
                  Read Privacy Policy
                </Link>
                <p className="text-center text-[11px] text-white/40 mt-1">
                  By using Faflora, you accept this Acceptable Use Policy.
                </p>
              </div>
            </div>
          </div>
        </FadeInSection>
      </div>
    </div>
  );
}