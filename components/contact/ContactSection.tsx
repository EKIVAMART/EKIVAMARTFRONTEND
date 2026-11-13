'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Loader2 } from '@/components/ui/platform-icons';
import { API_BASE_URL } from '@/lib/axios';
import styles from '@/app/contact-us/contact.module.css';

const emptyForm = { fullName: '', email: '', phoneNumber: '', message: '' };
type ContactForm = typeof emptyForm;
type FieldErrors = Partial<Record<keyof ContactForm, string>>;

export default function ContactSection() {
  const [form, setForm] = useState<ContactForm>(emptyForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const [submitError, setSubmitError] = useState('');
  const sending = useRef(false);
  const successHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (status === 'success') successHeading.current?.focus();
  }, [status]);

  function update(field: keyof ContactForm, value: string) {
    setForm(current => ({ ...current, [field]: value }));
    setErrors(current => ({ ...current, [field]: undefined }));
    setSubmitError('');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phoneNumber: form.phoneNumber.trim(),
      message: form.message.trim(),
    };
    const nextErrors: FieldErrors = {};
    if (payload.fullName.length < 2 || payload.fullName.length > 150) nextErrors.fullName = 'Enter your name (2–150 characters).';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email) || payload.email.length > 255) nextErrors.email = 'Enter a valid email address.';
    if (payload.phoneNumber.length < 7 || payload.phoneNumber.length > 25) nextErrors.phoneNumber = 'Enter a phone number (7–25 characters).';
    if (payload.message.length < 10 || payload.message.length > 3000) nextErrors.message = 'Enter a message between 10 and 3,000 characters.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      const field = event.currentTarget.elements.namedItem(Object.keys(nextErrors)[0]);
      if (field instanceof HTMLElement) field.focus();
      return;
    }
    sending.current = true;
    setStatus('sending');
    setSubmitError('');
    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000),
      });
      const result = await response.json();
      if (!response.ok || result?.success !== true) {
        throw new Error(response.status === 429
          ? 'Too many messages. Please wait 15 minutes before trying again.'
          : 'We couldn’t send your message. Please try again or contact us on WhatsApp.');
      }
      setStatus('success');
    } catch (error) {
      setStatus('idle');
      setSubmitError(error instanceof Error && error.name === 'TimeoutError'
        ? 'We couldn’t confirm whether your message arrived. Please contact us on WhatsApp.'
        : error instanceof Error && error.message.startsWith('Too many messages.')
          ? error.message
          : 'We couldn’t confirm your message was sent. Please try again or contact us on WhatsApp.');
    } finally {
      sending.current = false;
    }
  }

  if (status === 'success') return (
    <div className={styles.success} role="status">
      <CheckCircle2 size={30} strokeWidth={1.6} aria-hidden="true" />
      <h3 ref={successHeading} tabIndex={-1}>Message received</h3>
      <p>Thank you for getting in touch. Our team will reply to <strong>{form.email.trim()}</strong>.</p>
      <button type="button" onClick={() => { setForm(emptyForm); setStatus('idle'); }}>Send another message <ArrowRight size={16} aria-hidden="true" /></button>
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className={styles.form} aria-label="Contact support" aria-busy={status === 'sending'}>
      <fieldset disabled={status === 'sending'}>
        <legend className="sr-only">Your contact details and message</legend>
        <div className={styles.fieldGrid}>
          {([
            ['fullName', 'Full name', 'text', 'name', 150],
            ['email', 'Email address', 'email', 'email', 255],
          ] as const).map(([name, label, type, autoComplete, maxLength]) => (
            <div className={styles.field} key={name}>
              <label htmlFor={`contact-${name}`}>{label}</label>
              <input id={`contact-${name}`} name={name} type={type} autoComplete={autoComplete} required maxLength={maxLength} value={form[name]} onChange={event => update(name, event.target.value)} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `contact-${name}-error` : undefined} />
              {errors[name] && <p id={`contact-${name}-error`} className={styles.fieldError}>{errors[name]}</p>}
            </div>
          ))}
        </div>
        <div className={styles.field}>
          <label htmlFor="contact-phoneNumber">Phone number</label>
          <input id="contact-phoneNumber" name="phoneNumber" type="tel" autoComplete="tel" required maxLength={25} value={form.phoneNumber} onChange={event => update('phoneNumber', event.target.value)} aria-invalid={Boolean(errors.phoneNumber)} aria-describedby={errors.phoneNumber ? 'contact-phone-error' : undefined} />
          {errors.phoneNumber && <p id="contact-phone-error" className={styles.fieldError}>{errors.phoneNumber}</p>}
        </div>
        <div className={styles.field}>
          <label htmlFor="contact-message">Your message</label>
          <textarea id="contact-message" name="message" rows={5} required maxLength={3000} value={form.message} onChange={event => update('message', event.target.value)} aria-invalid={Boolean(errors.message)} aria-describedby={`contact-message-hint${errors.message ? ' contact-message-error' : ''}`} />
          <div className={styles.messageHint}><span id="contact-message-hint">Include your order reference, if relevant.</span><span>{form.message.length.toLocaleString()} / 3,000</span></div>
          {errors.message && <p id="contact-message-error" className={styles.fieldError}>{errors.message}</p>}
        </div>
        {submitError && <p role="alert" className={styles.submitError}>{submitError}</p>}
        <div className={styles.formActions}>
          <p>Read our <Link href="/privacy-policy">privacy policy</Link> to learn how we handle your information.</p>
          <button type="submit" disabled={status === 'sending'}>{status === 'sending' ? <>Sending… <Loader2 size={16} className={styles.spinner} aria-hidden="true" /></> : <>Send message <ArrowRight size={16} aria-hidden="true" /></>}</button>
        </div>
      </fieldset>
    </form>
  );
}
