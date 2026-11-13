import { Check as PlatformCheck, X as PlatformX } from '@/components/ui/platform-icons';
import PolicyDocument from '@/components/information/PolicyDocument';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Copyright,
  Flag,
  Gavel,
  Lock,
  RefreshCw,
  ShieldAlert,
  Star,
  Store,
  UserCheck,
  XCircle,
  type LucideIcon,
} from '@/components/ui/platform-icons';
import React from 'react';

/* ─── TYPES ─── */
interface ClauseData {
  id: string;
  number: string;
  title: string;
  icon: LucideIcon;
  content: React.ReactNode;
}

/** A bullet whose visual tells you whether the line is something you MAY do or MUST NOT do. */
const Rule = ({
  text,
  tone,
}: {
  text: string;
  tone: 'allow' | 'deny' | 'note';
}) => {
  const styles = {
    allow: { bg: 'text-[#22643e]', ring: '' },
    deny: { bg: 'text-red-700', ring: '' },
    note: { bg: 'text-[#657065]', ring: '' },
  }[tone];

  return (
    <li className="flex items-start gap-3 text-gray-600 text-[15px] md:text-[16px] leading-relaxed">
      <span
        className={`flex-shrink-0 mt-[3px] w-5 h-5 rounded-full flex items-center justify-center ${styles.bg} ${styles.ring}`}
      >
        {tone === 'deny' ? (
          <PlatformX size={8} color="#e5001e" aria-hidden="true" />
        ) : tone === 'allow' ? (
          <PlatformCheck size={9} aria-hidden="true" />
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-[#1c711c]" />
        )}
      </span>
      <span>{text}</span>
    </li>
  );
};

const RuleList = ({
  items,
  tone,
  columns = 1,
}: {
  items: string[];
  tone: 'allow' | 'deny' | 'note';
  columns?: 1 | 2;
}) => (
  <ul
    className={`mt-5 gap-x-8 gap-y-2.5 ${columns === 2 ? 'grid md:grid-cols-2' : 'space-y-2.5'}`}
  >
    {items.map((text) => (
      <Rule key={text} text={text} tone={tone} />
    ))}
  </ul>
);

const Lede = ({ children }: { children: React.ReactNode }) => (
  <p className="text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
    {children}
  </p>
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
          EkivaMart is designed to provide a safe, reliable, and convenient
          marketplace where vendors can sell products and customers can discover
          and purchase products and services.
        </Lede>
        <p className="mt-5 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          You may use EkivaMart only for lawful, legitimate, and authorized
          purposes. As a customer, vendor, or visitor, you agree to use
          EkivaMart in a manner that:
        </p>
        <RuleList
          tone="allow"
          items={[
            'Complies with all applicable laws and regulations.',
            'Respects the rights and privacy of other users.',
            'Does not interfere with the operation of the EkivaMart platform.',
            'Does not compromise the security or integrity of the marketplace.',
            'Does not involve fraud, deception, abuse, or misleading activity.',
            'Does not harm EkivaMart, its customers, vendors, delivery partners, employees, or other users.',
          ]}
        />
        <p className="mt-6 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          Vendors are responsible for ensuring that the products and services
          they list on EkivaMart are lawful, accurately described, properly
          priced, and permitted under EkivaMart&apos;s marketplace rules.
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
        <Lede>You must not use EkivaMart to:</Lede>
        <RuleList
          tone="deny"
          columns={2}
          items={[
            'Violate any applicable law, regulation, or legal requirement.',
            'Commit, facilitate, or promote fraud, theft, scams, or other unlawful activities.',
            'Gain unauthorized access to EkivaMart accounts, systems, databases, networks, or services.',
            "Attempt to bypass, disable, or interfere with EkivaMart's security features.",
            'Introduce viruses, malware, ransomware, spyware, malicious scripts, or other harmful software.',
            "Disrupt, damage, overload, or interfere with the operation of EkivaMart's website, applications, servers, or networks.",
            'Use bots, crawlers, scrapers, or automated systems to collect information from EkivaMart without prior authorization.',
            'Create fake or duplicate accounts for fraudulent or abusive purposes.',
            'Impersonate another person, customer, vendor, business, organization, or EkivaMart representative.',
            'Provide false, inaccurate, misleading, or fraudulent information.',
            'Manipulate product ratings, reviews, sales figures, search rankings, promotions, or other marketplace features.',
            "Use another person's account, payment information, or login credentials without authorization.",
            "Attempt to obtain, collect, or misuse another user's personal or confidential information.",
            'Send spam, phishing messages, malicious links, or unauthorized promotional communications.',
            'Harass, threaten, intimidate, abuse, or defame other users.',
            'Upload or distribute unlawful, fraudulent, hateful, threatening, or otherwise prohibited content.',
            "Circumvent EkivaMart's payment, transaction, commission, security, or marketplace systems.",
            'Attempt to avoid applicable EkivaMart fees or marketplace restrictions.',
            'Abuse promotions, discounts, vouchers, referral programs, refunds, returns, or other EkivaMart offers.',
            'Reverse engineer, decompile, disassemble, or attempt to discover the source code or underlying technology of EkivaMart, except where permitted by applicable law.',
            "Copy, reproduce, distribute, sell, modify, or commercially exploit EkivaMart's platform, content, branding, or technology without authorisation.",
            'Use EkivaMart in a manner that could reasonably damage the platform, its users, vendors, partners, or reputation.',
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
        <Lede>
          Vendors are responsible for the products and services they list and
          sell through EkivaMart. Vendors must:
        </Lede>
        <RuleList
          tone="allow"
          columns={2}
          items={[
            'Provide accurate business and account information.',
            'Provide truthful product descriptions, images, specifications, prices, and availability.',
            'Ensure that products and services listed on EkivaMart are lawful and permitted.',
            'Have the necessary rights, licenses, permits, and authorizations required to sell their products or services.',
            'Ensure that products are genuine and accurately represented.',
            'Fulfil customer orders in accordance with the information provided on the platform.',
            'Communicate honestly and professionally with customers.',
            'Avoid misleading, deceptive, or fraudulent product claims.',
            'Respect customer privacy and protect customer information.',
            'Comply with applicable consumer protection, product safety, taxation, advertising, intellectual property, and other applicable laws.',
            'Maintain appropriate transaction and business records where required by law.',
          ]}
        />
        <p className="mt-6 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          EkivaMart may request additional information or documentation from
          vendors where reasonably necessary to verify their identity, business,
          products, or compliance with applicable requirements.
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
        <Lede>
          EkivaMart is a marketplace for lawful products and services.
        </Lede>
        <p className="mt-3 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          Vendors must not list, advertise, promote, or sell products or
          services that are prohibited by applicable law or EkivaMart&apos;s
          marketplace rules. Prohibited or restricted products may include, but
          are not limited to:
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
              <span className="text-[14px] text-gray-600 leading-snug">
                {item}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-6 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          Any product or service prohibited by applicable law, or that EkivaMart
          reasonably determines presents an unacceptable legal, safety,
          security, or operational risk, is not permitted. EkivaMart may
          introduce additional restrictions on specific products, categories,
          vendors, or services where necessary to comply with applicable laws,
          payment-provider requirements, marketplace standards, or security
          considerations.
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
        <Lede>
          Vendors are responsible for all information and content included in
          their product listings. Product listings must:
        </Lede>
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
          EkivaMart reserves the right to review, remove, restrict, reject, or
          suspend listings that violate this Policy, applicable law, or our
          marketplace rules.
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
        <Lede>
          Reviews and ratings should represent genuine experiences with
          products, vendors, or services available through EkivaMart. You must
          not:
        </Lede>
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
          EkivaMart may remove reviews or ratings that violate this Policy or
          applicable rules.
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
        <Lede>
          EkivaMart does not permit fraudulent or deceptive activities intended
          to manipulate the marketplace. Prohibited activities include:
        </Lede>
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
            'Attempts to circumvent EkivaMart fees.',
            'Attempts to manipulate search results or product rankings.',
            'Misrepresentation of products or services.',
            'Other deceptive marketplace practices.',
          ]}
        />
        <p className="mt-6 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          EkivaMart may suspend accounts, cancel transactions, restrict
          marketplace features, or take other appropriate action where
          fraudulent or abusive activity is identified.
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
          If you create an account with EkivaMart, you are responsible for
          keeping your account information and login credentials secure. You
          agree to:
        </Lede>
        <RuleList
          tone="allow"
          items={[
            'Keep your password confidential.',
            'Take reasonable steps to protect your account.',
            'Avoid sharing your login credentials with unauthorized persons.',
            'Notify EkivaMart promptly if you suspect unauthorized access to your account.',
            'Keep your account information accurate and up to date.',
          ]}
        />
        <p className="mt-6 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          You must not use another person&apos;s account without their
          authorization.
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
        <Lede>
          Users must respect the personal information and privacy of other
          users.
        </Lede>
        <p className="mt-5 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          You must not collect, store, disclose, sell, misuse, or otherwise
          process another person&apos;s personal information obtained through
          EkivaMart except where you have a lawful basis and appropriate
          authorization.
        </p>
        <p className="mt-5 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          Vendors must use customer information only for legitimate purposes
          connected with fulfilling orders, providing customer support, and
          carrying out other authorized business activities. Vendors are
          responsible for complying with applicable data protection and privacy
          laws when handling customer information.
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
        <Lede>
          EkivaMart respects intellectual property rights and expects all users
          and vendors to do the same.
        </Lede>
        <p className="mt-5 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          You must not upload, publish, sell, distribute, reproduce, or
          otherwise use content that infringes another person&apos;s
          intellectual property rights.
        </p>
        <p className="mt-5 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          EkivaMart&apos;s name, logo, branding, website design, software,
          platform technology, content, and other proprietary materials remain
          the property of EkivaMart Ltd or its respective licensors unless
          otherwise stated. Nothing in this Policy grants you ownership of
          EkivaMart&apos;s intellectual property.
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
        <Lede>
          EkivaMart reserves the right to investigate suspected violations of
          this Policy. Where appropriate, EkivaMart may:
        </Lede>
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
          EkivaMart may take these actions where reasonably necessary to protect
          the platform, customers, vendors, delivery partners, employees,
          business partners, or other users.
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
          If you believe that a user, vendor, product listing, transaction,
          review, or other activity on EkivaMart violates this Policy, you may
          report the issue using the contact details provided on the EkivaMart
          website.
        </Lede>
        <p className="mt-5 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          When submitting a report, please provide sufficient information to
          help us understand and investigate the issue. Where applicable, a
          report may include:
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
      <div className="rounded-lg border-2 border-[#1c711c]/20 to-white p-6 md:p-8">
        <p className="text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          EkivaMart may update this Acceptable Use Policy from time to time to
          reflect changes to our marketplace, services, technology, business
          operations, legal requirements, or marketplace rules.
        </p>
        <p className="mt-5 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          When we make changes, the updated Policy will be published on this
          page with a revised &ldquo;Last Updated&rdquo; date. Your continued
          use of EkivaMart after an updated Policy has been published
          constitutes acceptance of the revised Policy, to the extent permitted
          by applicable law.
        </p>
      </div>
    ),
  },
];

/* ─── MAIN COMPONENT ─── */
export default function AcceptableUsePolicyPage() {
  return (
    <PolicyDocument
      title="Acceptable use policy"
      date="Effective date: September 01, 2026"
      introduction={
        <>
          <p>
            If you do not agree with this Policy, please do not use the
            EkivaMart Services. This page sets out what &ldquo;acceptable
            use&rdquo; means on our marketplace — for customers, vendors, and
            visitors alike — and what happens when it&apos;s not followed.
          </p>
          <p>
            This Policy works alongside our Terms and Conditions and Privacy
            Policy. Continued use of EkivaMart after an update means you accept
            the current version.
          </p>
        </>
      }
      sections={clauses}
    />
  );
}
