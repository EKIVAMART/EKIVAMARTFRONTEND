import React from 'react';
import FadeInSection from '@/components/FadeInSection';
import TypingText from '@/components/TypingText';
import {
  RotateCcw,
  Ban,
  ClipboardCheck,
  ListChecks,
  Truck,
  Store,
  Search,
  Wallet,
  Repeat,
  PackageX,
  ShieldAlert,
  RefreshCw,
  Mail,
  ArrowRight,
  Tag,
  type LucideIcon,
} from 'lucide-react';

/* ─── TYPES ─── */
interface ClauseData {
  id: string;
  number: string;
  title: string;
  icon: LucideIcon;
  content: React.ReactNode;
}

/* ─── SHARED PRIMITIVES ─── */

const Pill = ({ text }: { text: string }) => (
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

const Lede = ({ children }: { children: React.ReactNode }) => (
  <p className="text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">{children}</p>
);

const Prose = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-5 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">{children}</p>
);

const NoteBox = ({ children }: { children: React.ReactNode }) => (
  <div className="relative mt-6 pl-5 border-l-4 border-[#8236be] bg-gradient-to-r from-[#fdf3fc] to-transparent py-4 pr-4 rounded-r-xl">
    <p className="text-sm md:text-base text-[#6b0f6b] leading-relaxed font-medium">{children}</p>
  </div>
);

/** Purple check-style row, used for things the customer/vendor should or may do. */
const CheckRow = ({ text }: { text: string }) => (
  <li className="flex items-start gap-3 text-gray-600 text-[15px] md:text-[16px] leading-relaxed">
    <span className="flex-shrink-0 mt-[3px] w-5 h-5 rounded-full bg-gradient-to-br from-[#9d4ae3] to-[#8236be] flex items-center justify-center">
      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
        <path d="M1 3.5L3.2 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
    <span>{text}</span>
  </li>
);

const CheckList = ({ items, columns = 1 }: { items: string[]; columns?: 1 | 2 }) => (
  <ul className={`mt-5 gap-x-8 gap-y-2.5 ${columns === 2 ? 'grid md:grid-cols-2' : 'space-y-2.5'}`}>
    {items.map((t) => (
      <CheckRow key={t} text={t} />
    ))}
  </ul>
);

/** Amber caution chip, used for ineligible categories and red-flag scenarios — a lighter register than an outright rule violation. */
const CautionGrid = ({ items }: { items: string[] }) => (
  <div className="mt-6 grid sm:grid-cols-2 gap-2.5">
    {items.map((item) => (
      <div key={item} className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#fffaf0] border border-[#ffe1a8]">
        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#ffbd30]/20 flex items-center justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-[#e5a100]" />
        </span>
        <span className="text-[14px] text-gray-600 leading-snug">{item}</span>
      </div>
    ))}
  </div>
);

/** Shipping-label styled checklist — a returns-specific motif for "what condition should this come back in". */
const TagChecklist = ({ items }: { items: string[] }) => (
  <div className="mt-6 relative rounded-2xl border-2 border-dashed border-[#d8b8e0] bg-[#fdf9ff] p-6 md:p-7">
    <div className="absolute -top-3.5 left-6 inline-flex items-center gap-1.5 bg-white border border-[#e8b8e4] text-[#8236be] text-[10px] font-black uppercase tracking-[2px] px-3 py-1.5 rounded-full">
      <Tag size={10} /> Return Condition
    </div>
    <ul className="space-y-3 mt-2">
      {items.map((t) => (
        <CheckRow key={t} text={t} />
      ))}
    </ul>
  </div>
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
            Section {number.padStart(2, '0')}
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
      <p className="text-[10px] font-black uppercase tracking-[3px] text-[#8236be] mb-4">Contents</p>
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

/* ─── HERO JOURNEY STRIP — the page's one signature visual ─── */
const JourneyStrip = () => {
  const steps = [
    { icon: RotateCcw, label: 'Request' },
    { icon: Search, label: 'Review' },
    { icon: Truck, label: 'Return' },
    { icon: Wallet, label: 'Refund' },
  ];
  return (
    <div className="flex items-center">
      {steps.map((s, i) => (
        <React.Fragment key={s.label}>
          <div className="flex flex-col items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#9d4ae3] to-[#8236be] flex items-center justify-center text-white shadow-lg shadow-[#9d4ae330]">
              <s.icon size={18} />
            </div>
            <span className="text-[11px] font-bold text-[#6b0f6b] uppercase tracking-wider">{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className="flex-1 h-px mx-2 md:mx-3 mb-6 border-t-2 border-dashed border-[#e0a8dc]" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

/* ─── RETURN PROCESS TIMELINE (Section 4's dedicated device) ─── */
const ProcessTimeline = ({ steps }: { steps: string[] }) => (
  <div className="mt-6 relative pl-2">
    <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-[#9d4ae3] via-[#e8b8e4] to-transparent" />
    <ol className="space-y-6">
      {steps.map((step, i) => (
        <li key={step} className="relative flex items-start gap-4">
          <span className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-white border-2 border-[#9d4ae3] text-[#8236be] font-black text-sm flex items-center justify-center">
            {i + 1}
          </span>
          <span className="text-gray-600 text-[15px] md:text-[16px] leading-relaxed pt-2">{step}</span>
        </li>
      ))}
    </ol>
  </div>
);

/* ─── COST RESPONSIBILITY PANEL (Section 5's dedicated device) ─── */
const ResponsibilityPanel = () => (
  <div className="mt-6 grid md:grid-cols-2 gap-4">
    <div className="rounded-2xl border border-[#e8b8e4] bg-[#fdf3fc]/60 p-6">
      <p className="text-xs font-black uppercase tracking-[3px] text-[#8236be] mb-3">When the vendor is responsible</p>
      <p className="text-sm md:text-[15.5px] text-gray-600 leading-relaxed">
        If the vendor is responsible, such as when the wrong, defective, damaged, or incorrectly described product was supplied, the vendor may be responsible for the applicable return costs.
      </p>
    </div>
    <div className="rounded-2xl border border-[#e8b8e4] bg-[#fdf3fc]/60 p-6">
      <p className="text-xs font-black uppercase tracking-[3px] text-[#8236be] mb-3">When the customer changes their mind</p>
      <p className="text-sm md:text-[15.5px] text-gray-600 leading-relaxed">
        If the customer changes their mind, where such returns are permitted, the customer may be responsible for the applicable return or delivery costs.
      </p>
    </div>
  </div>
);

/* ─── CLAUSE DATA (content preserved exactly; numbering follows the source, including the gap at 12) ─── */
const clauses: ClauseData[] = [
  {
    id: 'customer-returns',
    number: '1',
    title: 'Customer Returns',
    icon: RotateCcw,
    content: (
      <>
        <Lede>Customers may request a return when:</Lede>
        <CheckList
          items={[
            'The item received is damaged or defective.',
            'The wrong product, size, colour, or quantity was delivered.',
            'The product received is significantly different from the description or images provided by the vendor.',
            'The product is incomplete or missing essential parts.',
            'The vendor specifically offers returns for that product.',
          ]}
        />
        <NoteBox>
          Customers should submit a return request within 48 of receiving the order. The customer may be required to provide photographs, videos, or other evidence showing the problem with the product.
        </NoteBox>
      </>
    ),
  },
  {
    id: 'items-not-returnable',
    number: '2',
    title: 'Items That Cannot Be Returned',
    icon: Ban,
    content: (
      <>
        <Lede>For health, safety, hygiene, or other legitimate reasons, certain products may not be eligible for return, including:</Lede>
        <CautionGrid
          items={[
            'Used personal-care or hygiene products',
            'Perishable goods or food items',
            'Customised or personalised products',
            'Digital products or services that have already been accessed',
          ]}
        />
        <Prose>
          Where applicable, the product listing will clearly state that the item is non-returnable before the customer places an order.
        </Prose>
      </>
    ),
  },
  {
    id: 'product-condition',
    number: '3',
    title: 'Product Condition for Returns',
    icon: ClipboardCheck,
    content: (
      <>
        <Lede>Unless the product is defective, damaged, or incorrectly delivered, returned products should:</Lede>
        <TagChecklist
          items={[
            'Be unused and in their original condition.',
            'Include original packaging, tags, accessories, and documentation where applicable.',
            'Not show signs of damage caused by the customer.',
          ]}
        />
        <Prose>Faflora reserves the right to reject a return if the product does not meet the applicable return requirements.</Prose>
      </>
    ),
  },
  {
    id: 'return-process',
    number: '4',
    title: 'Return Process',
    icon: ListChecks,
    content: (
      <>
        <Lede>To request a return, the customer should:</Lede>
        <ProcessTimeline
          steps={[
            'Contact Faflora through the platform within the applicable return period.',
            'Provide the order number and reason for the return.',
            'Provide photographs or videos where requested.',
            'Wait for the return request to be reviewed and approved.',
            'Follow the return instructions provided by Faflora.',
          ]}
        />
        <NoteBox>
          Customers should not send products directly to a vendor without receiving return instructions from Faflora.
        </NoteBox>
      </>
    ),
  },
  {
    id: 'returning-to-vendor',
    number: '5',
    title: 'Returning a Product to the Vendor',
    icon: Truck,
    content: (
      <>
        <Lede>
          When a return is approved, Faflora may arrange for the product to be returned to the vendor. Depending on the reason for the return:
        </Lede>
        <ResponsibilityPanel />
        <Prose>Faflora will communicate the applicable arrangements to both parties before the return is completed.</Prose>
      </>
    ),
  },
  {
    id: 'vendor-responsibilities',
    number: '6',
    title: 'Vendor Responsibilities',
    icon: Store,
    content: (
      <>
        <Lede>Vendors are expected to:</Lede>
        <CheckList
          columns={2}
          items={[
            'Provide accurate product descriptions and images.',
            'Ensure products are properly packaged before dispatch.',
            'Send the correct product and quantity ordered.',
            'Respond promptly to approved return requests.',
            'Accept legitimate returns that fall within this policy.',
            'Provide any information reasonably required by Faflora to resolve a return dispute.',
            'Upload clear pictures for the user to see.',
          ]}
        />
        <NoteBox>
          A vendor must not refuse an eligible return solely because the customer contacted Faflora instead of the vendor directly.
        </NoteBox>
      </>
    ),
  },
  {
    id: 'inspection',
    number: '7',
    title: 'Inspection of Returned Products',
    icon: Search,
    content: (
      <>
        <Lede>
          When a product is returned, Faflora or the vendor may inspect the item to determine whether the return meets the requirements of this policy.
        </Lede>
        <Prose>
          If the returned product is found to be damaged through customer misuse, the refund or exchange may be denied or adjusted accordingly.
        </Prose>
      </>
    ),
  },
  {
    id: 'refunds',
    number: '8',
    title: 'Refunds',
    icon: Wallet,
    content: (
      <div className="relative rounded-2xl overflow-hidden border border-[#e8b8e4]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#fdf3fc] to-white" />
        <div className="relative p-6 md:p-8 space-y-4">
          <p className="text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
            Once an approved return has been received and, where necessary, inspected, Faflora will process the applicable refund.
          </p>
          <p className="text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
            Refunds may be issued to the customer&apos;s original payment method or through another approved method available on the platform.
          </p>
          <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-[#e8b8e4] shadow-sm">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#9d4ae3] to-[#8236be] flex items-center justify-center text-white shadow">
              <Wallet size={18} />
            </div>
            <p className="text-sm md:text-base text-gray-500 leading-relaxed">
              Depending on the payment provider, it may take additional business days for the refund to appear in the customer&apos;s account.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'exchanges',
    number: '9',
    title: 'Exchanges',
    icon: Repeat,
    content: (
      <>
        <Lede>Where available, customers may request an exchange instead of a refund.</Lede>
        <Prose>An exchange is subject to product availability. If the replacement product is unavailable, Faflora may process a refund instead.</Prose>
      </>
    ),
  },
  {
    id: 'delivery-damage',
    number: '10',
    title: 'Orders Damaged During Delivery',
    icon: PackageX,
    content: (
      <>
        <NoteBox>
          Customers should report products damaged during delivery as soon as possible, preferably within 48 hours of delivery, and provide clear photographs or videos of the product and packaging.
        </NoteBox>
        <Prose>Faflora will review the circumstances and determine the appropriate resolution.</Prose>
      </>
    ),
  },
  {
    id: 'fraudulent-returns',
    number: '11',
    title: 'Fraudulent or Abusive Returns',
    icon: ShieldAlert,
    content: (
      <>
        <Lede>Faflora reserves the right to restrict or refuse returns where there is evidence of:</Lede>
        <CautionGrid
          items={[
            'Fraudulent activity',
            'Repeated abuse of the return system',
            'Deliberate damage to products',
            'Returning a different product from the one purchased',
            'False claims regarding an order',
          ]}
        />
      </>
    ),
  },
  {
    id: 'changes',
    number: '13',
    title: 'Changes to This Policy',
    icon: RefreshCw,
    content: (
      <div className="rounded-2xl border-2 border-[#8236be]/20 bg-gradient-to-br from-[#fdf3fc] to-white p-6 md:p-8">
        <p className="text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          Faflora may update this Return, Refund &amp; Exchange Policy from time to time. Any changes will be published on the platform and will apply from the stated effective date.
        </p>
      </div>
    ),
  },
  {
    id: 'contact',
    number: '14',
    title: 'Contact Us',
    icon: Mail,
    content: (
      <>
        <Lede>
          For questions about returns, refunds, exchanges, or vendor disputes, customers and vendors can contact Faflora through the support channels provided on the platform.
        </Lede>
        <a
          href="/contact-us"
          className="mt-6 inline-flex items-center gap-3 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#9d4ae3] to-[#8236be] flex items-center justify-center text-white shadow-lg shadow-[#9d4ae330] group-hover:scale-110 transition-transform">
            <Mail size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[3px] text-[#8236be]">Support</p>
            <p className="text-[#9d4ae3] font-bold text-base group-hover:underline">Contact Faflora Support</p>
          </div>
        </a>
      </>
    ),
  },
];

/* ─── MAIN COMPONENT ─── */
export default function ReturnRefundExchangePolicy() {
  return (
    <div
      className="font-sans bg-white min-h-screen overflow-x-hidden"
      style={{ fontFamily: "'Palatino Linotype', 'Book Antiqua', 'Georgia', serif" }}
    >
      {/* ── HERO — light, warm, journey-led ── */}
      <section className="relative overflow-hidden min-h-[74vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50 via-white to-white" />
        <div className="absolute -top-24 -right-24 w-[50vw] h-[50vw] max-w-2xl max-h-2xl rounded-full bg-gradient-to-br from-brand-200 to-brand-300 opacity-30 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 -left-20 w-[35vw] h-[35vw] max-w-xl max-h-xl rounded-full bg-gradient-to-r from-brand-200 to-brand-300 opacity-10 blur-[90px] pointer-events-none" />

        <div className="absolute top-20 right-[6%] hidden md:flex flex-col gap-2">
          <div className="flex items-center gap-2 bg-white border border-[#e8b8e4] text-[#9d4ae3] text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-sm">
            <RotateCcw size={10} /> 48-Hour Report Window
          </div>
          <div className="flex items-center gap-2 bg-white border border-[#e8b8e4] text-[#9d4ae3] text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-sm">
            <Store size={10} /> Fair for Buyers &amp; Vendors
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-20 w-full pt-28 pb-16">
          <FadeInSection type="fadeDown" delay={0.1}>
            <div className="inline-flex items-center gap-2 border border-[#e8b8e4] text-[#9d4ae3] text-[10px] font-black uppercase tracking-[4px] px-4 py-2 rounded-full mb-8 bg-[#fdf3fc]">
              <RotateCcw size={11} />
              <span>Faflora · Support</span>
            </div>
          </FadeInSection>

          <FadeInSection type="fadeUp" delay={0.2}>
            <h1
              className="text-5xl md:text-6xl lg:text-[5.2rem] lg:-skew-x-6 -skew-x-4 font-black text-[#1a0018] leading-[0.95] tracking-tight"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              <TypingText text="Returns, Refunds" delay={350} typingSpeed={55} colorClass="text-[#8236be]" hideCursorOnComplete />
              <br />
              <span className="text-[#9d4ae3]">
                <TypingText text="& Exchanges" delay={1200} typingSpeed={55} colorClass="text-[#8236be]" />
              </span>
            </h1>
          </FadeInSection>

          <FadeInSection type="fadeUp" delay={0.5}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="h-px w-16 bg-gradient-to-r from-[#9d4ae3] to-[#8236be]" />
              <p className="text-gray-400 text-sm font-medium">
                Effective Date: <span className="text-[#9d4ae3] font-bold">&mdash;</span> <span className='text-[#9d4ae3] text-[10px] font-black uppercase tracking-[4px] px-4 py-2 rounded-full shadow-sm'>September 01, 2026</span>
              </p>
            </div>
            <p className="mt-6 text-gray-500 text-base md:text-lg max-w-2xl leading-relaxed">
              At Faflora we want every customer to have a positive shopping experience while ensuring that vendors are treated fairly. This policy explains when a customer can return a product, when a vendor may receive a returned product, and how refunds or exchanges are handled.
            </p>
          </FadeInSection>

          {/* Signature element — the return journey, at a glance */}
          <FadeInSection type="fadeUp" delay={0.72}>
            <div className="mt-12 max-w-xl bg-white/70 backdrop-blur-sm border border-[#e8b8e4] rounded-2xl px-6 py-6 shadow-sm">
              <JourneyStrip />
            </div>
          </FadeInSection>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none">
          <svg viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,32 C480,64 960,0 1440,32 L1440,64 L0,64 Z" fill="#fdf8ff" fillOpacity="0.6" />
          </svg>
        </div>
      </section>

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
          <div className="relative overflow-hidden rounded-3xl border border-[#e8b8e4]">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-brand-100" />
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#8236be] opacity-10 blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-gradient-to-r from-[#9d4ae3] to-[#8236be] opacity-10 blur-[60px] pointer-events-none" />

            <div className="relative px-8 md:px-16 py-12 md:py-16 flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-[#f0c8ec] text-[#9d4ae3] text-[10px] font-black uppercase tracking-[4px] px-4 py-2 rounded-full mb-5">
                  <RotateCcw size={11} /> Shop with confidence
                </div>
                <h3
                  className="text-2xl md:text-4xl lg:text-[42px] font-black text-[#1a0018] leading-tight mb-4"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  Fair returns.<br />
                  <span className="text-[#9d4ae3]">Every time.</span>
                </h3>
                <p className="text-gray-500 text-sm md:text-base lg:text-[17px] leading-relaxed max-w-md">
                  Read this policy alongside our Terms and Conditions, Privacy Policy, and Acceptable Use Policy for the full picture of how Faflora works.
                </p>
              </div>

              <div className="flex flex-col gap-3 flex-shrink-0 w-full md:w-auto">
                <a
                  href="/terms-and-conditions"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#9d4ae3] to-[#8236be] text-white px-8 py-3.5 rounded-full font-extrabold text-sm shadow-lg shadow-[#9d4ae330] hover:scale-105 active:scale-95 transition-transform"
                >
                  Read Terms of Service <ArrowRight size={16} />
                </a>
                <a
                  href="/"
                  className="inline-flex items-center justify-center gap-2 border-2 border-[#9d4ae3] text-[#9d4ae3] px-8 py-3.5 rounded-full font-extrabold text-sm hover:bg-[#fdf3fc] transition-colors"
                >
                  Return to Homepage
                </a>
              </div>
            </div>
          </div>
        </FadeInSection>
      </div>
    </div>
  );
}