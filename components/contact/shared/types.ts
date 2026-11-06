import {
  ShoppingBag,
  CreditCard,
  Store,
  ArrowRight,
  Truck,
  LifeBuoy,
  Briefcase,
  MessageSquare,
  Mail,
  Phone
} from 'lucide-react';
import { FaInstagram, FaLinkedinIn, FaTiktok, FaWhatsapp } from 'react-icons/fa';

/* ─── TYPES ─── */
export type FormState = 'idle' | 'submitting' | 'success' | 'error';
export type Category =
  | ''
  | 'order-issue'
  | 'payment'
  | 'vendor-support'
  | 'returns'
  | 'delivery'
  | 'account'
  | 'partnerships'
  | 'other';

/* ─── CONSTANTS ─── */
export const CONTACT_REASONS = [
  { value: 'order-issue', label: 'Order Issue', icon: ShoppingBag },
  { value: 'payment', label: 'Payment & Billing', icon: CreditCard },
  { value: 'vendor-support', label: 'Vendor Support', icon: Store },
  { value: 'returns', label: 'Returns & Refunds', icon: ArrowRight },
  { value: 'delivery', label: 'Delivery & Shipping', icon: Truck },
  { value: 'account', label: 'Account Help', icon: LifeBuoy },
  { value: 'partnerships', label: 'Business & Partnerships', icon: Briefcase },
  { value: 'other', label: 'Something Else', icon: MessageSquare },
] as const;

export const SOCIALS = [
  { label: 'Instagram', icon: FaInstagram, href: 'https://www.instagram.com/faflora_ng', handle: '@faflora_ng' },
  { label: 'TikTok', icon: FaTiktok, href: 'https://www.tiktok.com/@faflora_ng', handle: '@faflora_ng' },
  { label: 'LinkedIn', icon: FaLinkedinIn, href: 'https://www.linkedin.com/company/faflora', handle: 'EkivaMart' },
];

export const RESPONSE_TIMES = [
  { channel: 'Email', time: 'Within 24 hours', icon: Mail, dot: 'bg-emerald-400' },
  { channel: 'WhatsApp', time: 'Within a few hours', icon: FaWhatsapp, dot: 'bg-emerald-400 animate-pulse' },
  { channel: 'Phone', time: 'Mon–Sat, 8am–8pm', icon: Phone, dot: 'bg-amber-400' },
];

export const faqs = [
  {
    q: 'How long does it take to get a response?',
    a: 'Our team responds to all email inquiries within 24 hours. For urgent order issues, reach us on WhatsApp for a faster reply — usually within a few hours during business hours.',
  },
  {
    q: "My order hasn't arrived. What should I do?",
    a: "First, check your order tracking from your account dashboard. If it's been more than 3 business days past the expected date, contact us with your Order ID and we'll investigate right away.",
  },
  {
    q: 'How do I become a vendor on Faflora?',
    a: 'Please reach out to our vendor team through this contact form or email vendors@faflora.com, and our vendor onboarding team will assist you directly.',
  },
  {
    q: 'Can I request a refund through this form?',
    a: 'Yes — select "Returns & Refunds" as your reason, include your Order ID in the message, and our team will process your request. Most refunds are completed within 5–10 business days.',
  },
  {
    q: "I sent a message but haven't received a reply yet. What should I do?",
    a: 'Please check your spam or junk folder first — our replies sometimes land there. If it has been more than 24 hours and nothing has arrived, feel free to reach out via WhatsApp or give us a call directly.',
  },
  {
    q: 'How do I report a fraudulent seller or suspicious listing?',
    a: 'We take fraud very seriously. Use this contact form, select "Something Else", and describe the issue with as much detail as possible — including the seller name and product link. Our trust & safety team will act swiftly.',
  },
];
