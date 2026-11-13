import { Check as PlatformCheck } from '@/components/ui/platform-icons';
import PolicyDocument from '@/components/information/PolicyDocument';
import {
  Ban,
  ClipboardCheck,
  ListChecks,
  Mail,
  PackageX,
  RefreshCw,
  Repeat,
  RotateCcw,
  Search,
  ShieldAlert,
  Store,
  Tag,
  Truck,
  Wallet,
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

const Lede = ({ children }: { children: React.ReactNode }) => (
  <p className="text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
    {children}
  </p>
);

const Prose = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-5 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
    {children}
  </p>
);

const NoteBox = ({ children }: { children: React.ReactNode }) => (
  <div className="relative mt-6 pl-5 border-l-4 border-[#1c711c] to-transparent py-4 pr-4 rounded-r-xl">
    <p className="text-sm md:text-base text-[#202820] leading-relaxed font-medium">
      {children}
    </p>
  </div>
);

/** Purple check-style row, used for things the customer/vendor should or may do. */
const CheckRow = ({ text }: { text: string }) => (
  <li className="flex items-start gap-3 text-gray-600 text-[15px] md:text-[16px] leading-relaxed">
    <span className="flex-shrink-0 mt-[3px] w-5 h-5 rounded-full flex items-center justify-center">
      <PlatformCheck size={9} aria-hidden="true" />
    </span>
    <span>{text}</span>
  </li>
);

const CheckList = ({
  items,
  columns = 1,
}: {
  items: string[];
  columns?: 1 | 2;
}) => (
  <ul
    className={`mt-5 gap-x-8 gap-y-2.5 ${columns === 2 ? 'grid md:grid-cols-2' : 'space-y-2.5'}`}
  >
    {items.map((t) => (
      <CheckRow key={t} text={t} />
    ))}
  </ul>
);

/** Amber caution chip, used for ineligible categories and red-flag scenarios — a lighter register than an outright rule violation. */
const CautionGrid = ({ items }: { items: string[] }) => (
  <div className="mt-6 grid sm:grid-cols-2 gap-2.5">
    {items.map((item) => (
      <div
        key={item}
        className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#fffaf0] border border-[#ffe1a8]"
      >
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
  <div className="mt-6 relative rounded-lg border-2 border-dashed border-[#d8b8e0] bg-[#fdf9ff] p-6 md:p-7">
    <div className="absolute -top-3.5 left-6 inline-flex items-center gap-1.5 bg-white border border-[#e2e7e1] text-[#1c711c] text-[10px] font-semibold uppercase tracking-[2px] px-3 py-1.5 rounded-full">
      <Tag size={10} /> Return Condition
    </div>
    <ul className="space-y-3 mt-2">
      {items.map((t) => (
        <CheckRow key={t} text={t} />
      ))}
    </ul>
  </div>
);

/* ─── RETURN PROCESS TIMELINE (Section 4's dedicated device) ─── */
const ProcessTimeline = ({ steps }: { steps: string[] }) => (
  <div className="mt-6 relative pl-2">
    <div className="absolute left-[19px] top-2 bottom-2 w-px to-transparent" />
    <ol className="space-y-6">
      {steps.map((step, i) => (
        <li key={step} className="relative flex items-start gap-4">
          <span className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-white border-2 border-[#228b22] text-[#1c711c] font-semibold text-sm flex items-center justify-center">
            {i + 1}
          </span>
          <span className="text-gray-600 text-[15px] md:text-[16px] leading-relaxed pt-2">
            {step}
          </span>
        </li>
      ))}
    </ol>
  </div>
);

/* ─── COST RESPONSIBILITY PANEL (Section 5's dedicated device) ─── */
const ResponsibilityPanel = () => (
  <div className="mt-6 grid md:grid-cols-2 gap-4">
    <div className="rounded-lg border border-[#e2e7e1] bg-[#f5f7f3]/60 p-6">
      <p className="text-xs font-semibold uppercase tracking-[3px] text-[#1c711c] mb-3">
        When the vendor is responsible
      </p>
      <p className="text-sm md:text-[15.5px] text-gray-600 leading-relaxed">
        If the vendor is responsible, such as when the wrong, defective,
        damaged, or incorrectly described product was supplied, the vendor may
        be responsible for the applicable return costs.
      </p>
    </div>
    <div className="rounded-lg border border-[#e2e7e1] bg-[#f5f7f3]/60 p-6">
      <p className="text-xs font-semibold uppercase tracking-[3px] text-[#1c711c] mb-3">
        When the customer changes their mind
      </p>
      <p className="text-sm md:text-[15.5px] text-gray-600 leading-relaxed">
        If the customer changes their mind, where such returns are permitted,
        the customer may be responsible for the applicable return or delivery
        costs.
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
          Customers should submit a return request within 48 of receiving the
          order. The customer may be required to provide photographs, videos, or
          other evidence showing the problem with the product.
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
        <Lede>
          For health, safety, hygiene, or other legitimate reasons, certain
          products may not be eligible for return, including:
        </Lede>
        <CautionGrid
          items={[
            'Used personal-care or hygiene products',
            'Perishable goods or food items',
            'Customised or personalised products',
            'Digital products or services that have already been accessed',
          ]}
        />
        <Prose>
          Where applicable, the product listing will clearly state that the item
          is non-returnable before the customer places an order.
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
        <Lede>
          Unless the product is defective, damaged, or incorrectly delivered,
          returned products should:
        </Lede>
        <TagChecklist
          items={[
            'Be unused and in their original condition.',
            'Include original packaging, tags, accessories, and documentation where applicable.',
            'Not show signs of damage caused by the customer.',
          ]}
        />
        <Prose>
          EkivaMart reserves the right to reject a return if the product does
          not meet the applicable return requirements.
        </Prose>
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
            'Contact EkivaMart through the platform within the applicable return period.',
            'Provide the order number and reason for the return.',
            'Provide photographs or videos where requested.',
            'Wait for the return request to be reviewed and approved.',
            'Follow the return instructions provided by EkivaMart.',
          ]}
        />
        <NoteBox>
          Customers should not send products directly to a vendor without
          receiving return instructions from EkivaMart.
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
          When a return is approved, EkivaMart may arrange for the product to be
          returned to the vendor. Depending on the reason for the return:
        </Lede>
        <ResponsibilityPanel />
        <Prose>
          EkivaMart will communicate the applicable arrangements to both parties
          before the return is completed.
        </Prose>
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
            'Provide any information reasonably required by EkivaMart to resolve a return dispute.',
            'Upload clear pictures for the user to see.',
          ]}
        />
        <NoteBox>
          A vendor must not refuse an eligible return solely because the
          customer contacted EkivaMart instead of the vendor directly.
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
          When a product is returned, EkivaMart or the vendor may inspect the
          item to determine whether the return meets the requirements of this
          policy.
        </Lede>
        <Prose>
          If the returned product is found to be damaged through customer
          misuse, the refund or exchange may be denied or adjusted accordingly.
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
      <div className="relative rounded-lg overflow-hidden border border-[#e2e7e1]">
        <div className="absolute inset-0 to-white" />
        <div className="relative p-6 md:p-8 space-y-4">
          <p className="text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
            Once an approved return has been received and, where necessary,
            inspected, EkivaMart will process the applicable refund.
          </p>
          <p className="text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
            Refunds may be issued to the customer&apos;s original payment method
            or through another approved method available on the platform.
          </p>
          <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-[#e2e7e1]">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-[#22643e]">
              <Wallet size={18} />
            </div>
            <p className="text-sm md:text-base text-gray-500 leading-relaxed">
              Depending on the payment provider, it may take additional business
              days for the refund to appear in the customer&apos;s account.
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
        <Lede>
          Where available, customers may request an exchange instead of a
          refund.
        </Lede>
        <Prose>
          An exchange is subject to product availability. If the replacement
          product is unavailable, EkivaMart may process a refund instead.
        </Prose>
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
          Customers should report products damaged during delivery as soon as
          possible, preferably within 48 hours of delivery, and provide clear
          photographs or videos of the product and packaging.
        </NoteBox>
        <Prose>
          EkivaMart will review the circumstances and determine the appropriate
          resolution.
        </Prose>
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
        <Lede>
          EkivaMart reserves the right to restrict or refuse returns where there
          is evidence of:
        </Lede>
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
      <div className="rounded-lg border-2 border-[#1c711c]/20 to-white p-6 md:p-8">
        <p className="text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          EkivaMart may update this Return, Refund &amp; Exchange Policy from
          time to time. Any changes will be published on the platform and will
          apply from the stated effective date.
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
          For questions about returns, refunds, exchanges, or vendor disputes,
          customers and vendors can contact EkivaMart through the support
          channels provided on the platform.
        </Lede>
        <a
          href="/contact-us"
          className="mt-6 inline-flex items-center gap-3 group"
        >
          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-[#22643e] group-hover:scale-110 transition-transform">
            <Mail size={20} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[3px] text-[#1c711c]">
              Support
            </p>
            <p className="text-[#228b22] font-bold text-base group-hover:underline">
              Contact EkivaMart Support
            </p>
          </div>
        </a>
      </>
    ),
  },
];

/* ─── MAIN COMPONENT ─── */
export default function ReturnRefundExchangePolicy() {
  return (
    <PolicyDocument
      title="Returns, refunds & exchanges"
      date="Effective date: September 01, 2026"
      introduction={
        <p>
          At EkivaMart we want every customer to have a positive shopping
          experience while ensuring that vendors are treated fairly. This policy
          explains when a customer can return a product, when a vendor may
          receive a returned product, and how refunds or exchanges are handled.
        </p>
      }
      sections={clauses}
    />
  );
}
