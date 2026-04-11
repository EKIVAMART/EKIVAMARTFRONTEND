'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Send, CheckCircle2, AlertCircle, ArrowRight, Phone, Clock, MapPin, ExternalLink } from 'lucide-react';
import FadeInSection from '@/components/FadeInSection';
import FloatInput from './shared/FloatInput';
import FloatTextarea from './shared/FloatTextarea';
import CategorySelector from './shared/CategorySelector';
import CopyButton from './shared/CopyButton';
import { FormState, Category, SOCIALS } from './shared/types';

/* ─── CONTACT INFO CARD ─── */
const ContactInfoCard = ({
  icon: Icon,
  label,
  value,
  href,
  copyable,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  href?: string;
  copyable?: boolean;
  delay: number;
}) => (
  <FadeInSection type="fadeUp" delay={delay}>
    <div className="group flex items-start gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-[#e8b8e4] hover:border-[#c740b0]/60 hover:shadow-lg transition-all duration-300">
      <div className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#981d87] to-[#c740b0] flex items-center justify-center text-white shadow-md shadow-[#981d8730]">
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase tracking-[3px] text-[#c740b0] mb-1">{label}</p>
        <div className="flex items-center flex-wrap gap-1">
          {href ? (
            <a
              href={href}
              className="text-[14px] sm:text-[15px] font-semibold text-[#1a0018] hover:text-[#981d87] transition-colors break-all"
            >
              {value}
            </a>
          ) : (
            <span className="text-[14px] sm:text-[15px] font-semibold text-[#1a0018]">{value}</span>
          )}
          {copyable && <CopyButton value={value} />}
        </div>
      </div>
    </div>
  </FadeInSection>
);

/* ─── OFFICE CARD ─── */
const OfficeCard = ({ delay }: { delay: number }) => (
  <FadeInSection type="zoom" delay={delay}>
    <div className="relative overflow-hidden rounded-3xl border border-[#e8b8e4] bg-white hover:shadow-xl transition-all duration-300 group">
      {/* Map-style header */}
      <div className="relative h-40 bg-gradient-to-br from-[#2d0029] via-[#6b0f6b] to-[#981d87] overflow-hidden flex items-center justify-center">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'repeating-linear-gradient(135deg, white 0px, white 1px, transparent 1px, transparent 32px)' }}
        />
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/20"
            style={{
              width: `${4 + (i % 4) * 3}px`,
              height: `${4 + (i % 4) * 3}px`,
              top: `${15 + (i * 17) % 70}%`,
              left: `${10 + (i * 13) % 80}%`,
              opacity: 0.2 + (i % 5) * 0.1,
            }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-28 h-28 rounded-full border border-white/10" />
          <div className="absolute w-16 h-16 rounded-full border border-white/15" />
        </div>
        <div className="relative z-10 text-center px-4">
          <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center mx-auto mb-2">
            <MapPin size={18} className="text-white" />
          </div>
          <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest">Delta State, Nigeria</p>
        </div>
        <div className="absolute top-3 right-3">
          <span className="text-[9px] font-black uppercase tracking-[2px] bg-white/20 border border-white/30 text-white/90 px-2.5 py-1 rounded-full">
            Headquarters
          </span>
        </div>
      </div>
      {/* Address content */}
      <div className="px-6 py-5">
        <h4
          className="text-lg font-extrabold text-[#1a0018] mb-1.5 group-hover:text-[#981d87] transition-colors"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          Asaba HQ
        </h4>
        <p className="text-gray-500 text-sm leading-relaxed mb-4">
          7 Tony Aki Str. Off Okpanam Rd,<br />
          Behind Corner Int'l School,<br />
          Asaba 320242, Delta State
        </p>
        <a
          href="https://maps.google.com/?q=7+Tony+Aki+Str+Off+Okpanam+Rd+Asaba+Delta+State+Nigeria"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c740b0] hover:text-[#981d87] transition-colors"
        >
          Get Directions <ExternalLink size={11} />
        </a>
      </div>
    </div>
  </FadeInSection>
);

/* ─── MAIN CONTACT FORM ─── */
const ContactForm = () => {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', orderId: '', subject: '', message: '',
  });
  const [category, setCategory] = useState<Category>('');
  const [errors, setErrors] = useState<Partial<typeof form & { category: string }>>({});
  const [status, setStatus] = useState<FormState>('idle');

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim())  e.name = 'Please enter your name';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email address';
    if (!category) e.category = 'Please select a reason';
    if (!form.message.trim() || form.message.length < 20)
      e.message = 'Please describe your issue (min 20 characters)';
    return e;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStatus('submitting');
    await new Promise((r) => setTimeout(r, 1800));
    setStatus('success');
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#981d87] to-[#c740b0] flex items-center justify-center shadow-2xl shadow-[#981d8730]">
          <CheckCircle2 size={38} className="text-white" />
        </div>
        <div>
          <h3
            className="text-3xl font-extrabold text-[#1a0018] mb-2"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Message received!
          </h3>
          <p className="text-gray-500 max-w-xs leading-relaxed">
            We'll get back to you at{' '}
            <span className="text-[#981d87] font-semibold">{form.email}</span> within 24 hours.
          </p>
        </div>
        <button
          onClick={() => {
            setStatus('idle');
            setForm({ name: '', email: '', phone: '', orderId: '', subject: '', message: '' });
            setCategory('');
          }}
          className="inline-flex items-center gap-2 text-sm font-bold text-[#981d87] hover:text-[#c740b0] transition-colors"
        >
          <ArrowRight size={14} className="rotate-180" /> Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FloatInput label="Full Name *" value={form.name} onChange={set('name')} error={errors.name} autoComplete="name" />
        <FloatInput label="Email Address *" type="email" value={form.email} onChange={set('email')} error={errors.email} autoComplete="email" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FloatInput label="Phone Number (optional)" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" />
        <FloatInput label="Order ID (if applicable)" value={form.orderId} onChange={set('orderId')} />
      </div>
      <CategorySelector value={category} onChange={setCategory} />
      {errors.category && (
        <p className="flex items-center gap-1 text-xs text-red-500 -mt-3">
          <AlertCircle size={11} /> {errors.category}
        </p>
      )}
      <FloatInput label="Subject" value={form.subject} onChange={set('subject')} />
      <FloatTextarea label="Your Message *" value={form.message} onChange={set('message')} error={errors.message} />
      <div className="flex items-start gap-3 text-xs text-gray-500 border border-dashed border-[#e8b8e4] rounded-xl px-4 py-3 bg-[#fdf8ff]">
        <Mail size={13} className="text-[#c740b0] mt-0.5 flex-shrink-0" />
        <span>
          Need to share a screenshot or invoice? Email us directly at{' '}
          <a href="mailto:support@faflories.com" className="text-[#981d87] font-semibold hover:underline">
            support@faflories.com
          </a>{' '}
          with your attachments.
        </span>
      </div>
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#981d87] to-[#c740b0] text-white font-extrabold text-base px-8 py-4 rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all shadow-xl shadow-[#981d8730] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'submitting' ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Sending…
          </>
        ) : (
          <>Send Message <Send size={18} /></>
        )}
      </button>
      <p className="text-center text-[11px] text-gray-400 leading-relaxed">
        By submitting this form you agree to our{' '}
        <Link href="/privacy-policy" className="text-[#981d87] hover:underline">Privacy Policy</Link>.
        {' '}We never share your data with third parties.
      </p>
    </form>
  );
};

export default function ContactSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 lg:gap-14 items-start h-full">
      {/* LEFT: Form */}
      <div className="flex flex-col h-full">
        <FadeInSection type="slideLeft" delay={0.1}>
          <div className="mb-8">
            <span className="block text-[10px] font-black uppercase tracking-[4px] text-[#c740b0] mb-1">
              Send a message
            </span>
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1a0018] leading-tight"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Tell us what's on<br />your mind.
            </h2>
            <p className="mt-3 text-gray-500 text-[15px] leading-relaxed max-w-md">
              Fill in the form below and we'll route your message to the right team. Typical reply time is under 24 hours.
            </p>
          </div>
        </FadeInSection>

        <FadeInSection type="fadeUp" delay={0.18} className="flex-1 flex flex-col">
          <div className="bg-white border border-[#e8b8e4] rounded-3xl p-6 sm:p-8 md:p-9 shadow-sm hover:shadow-lg transition-shadow duration-500 flex-1">
            <ContactForm />
          </div>
        </FadeInSection>
      </div>

      {/* RIGHT: Contact Info + Office + Social */}
      <div className="flex flex-col h-full space-y-6 sm:space-y-8">
        <FadeInSection type="slideRight" delay={0.12}>
          <div>
            <span className="block text-[10px] font-black uppercase tracking-[4px] text-[#c740b0] mb-4">
              Direct Channels
            </span>
            <div className="space-y-3">
              <ContactInfoCard icon={Mail}  label="General Email"    value="faflories@outlook.com" href="mailto:faflories@outlook.com" copyable delay={0.14} />
              <ContactInfoCard icon={Mail}  label="Support Email"    value="support@faflories.com" href="mailto:support@faflories.com" copyable delay={0.18} />
              <ContactInfoCard icon={Phone} label="Phone / WhatsApp" value="+234 900 699 1040"     href="tel:+2349006991040"           copyable delay={0.22} />
              <ContactInfoCard icon={Clock} label="Business Hours"   value="24 hours, 7 days a week"                                           delay={0.26} />
            </div>
          </div>
        </FadeInSection>

        <FadeInSection type="slideRight" delay={0.30}>
          <div>
            <span className="block text-[10px] font-black uppercase tracking-[4px] text-[#c740b0] mb-4">
              Our Office
            </span>
            <OfficeCard delay={0.0} />
          </div>
        </FadeInSection>

        <FadeInSection type="fadeUp" delay={0.38}>
          <div className="rounded-2xl border border-[#e8b8e4] bg-white p-5 sm:p-6 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[4px] text-[#c740b0] mb-4">
              Find Us Online
            </p>
            <div className="flex flex-col gap-2">
              {SOCIALS.map(({ label, icon: Icon, href, handle }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#e8b8e4] hover:border-[#c740b0]/60 hover:bg-[#fdf3fc] transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#981d87] to-[#c740b0] flex items-center justify-center text-white flex-shrink-0">
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#1a0018] group-hover:text-[#981d87] transition-colors text-[13px] leading-tight">{label}</p>
                    <p className="text-gray-400 text-[11px]">{handle}</p>
                  </div>
                  <ExternalLink size={13} className="text-[#c740b0]/40 group-hover:text-[#c740b0] transition-colors flex-shrink-0" />
                </a>
              ))}
            </div>
          </div>
        </FadeInSection>
      </div>
    </div>
  );
}