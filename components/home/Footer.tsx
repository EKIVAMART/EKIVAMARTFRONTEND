import Image from 'next/image';
import Link from 'next/link';

// ─── Link column data (matching Listfoot) ──────────────────────────────────

const linkColumns = [
  {
    heading: 'Company',
    links: [
      { label: 'About Us', href: '/about-us' },
      { label: 'Delivery Information', href: '#' },
      { label: 'Acceptable Use Policy', href: '/acceptable-use-policy' },
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms & Conditions', href: '/terms-and-conditions' },
      { label: 'Return, Refund & Exchange Policy', href: '/return-policy' },
      { label: 'Contact Us', href: '/contact-us' },
      { label: 'Support Center', href: '/support' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Talent Solutions', href: '#' },
      { label: 'Marketing Solutions & Analytics', href: '/marketing-solutions-analytics' },
      { label: 'Advertising', href: '#' },
      { label: 'Small Business', href: '#' },
      { label: 'Black Friday', href: '#' },
      { label: 'Flash Sales', href: '/categories/flash-sales' },
    ],
  },
  {
    heading: 'Useful Links',
    links: [
      { label: 'Announcement', href: '#' },
      { label: 'Trust Management Center', href: '#' },
      { label: 'Voice of the Customer', href: '#' },
      { label: 'Store Entry Partnership Inquiries', href: '#' },
      { label: 'Sitemap', href: '#' },
      { label: 'Accessibility', href: '#' },
    ],
  },
  {
    heading: 'Popular',
    links: [
      { label: 'Payment Methods', href: '#' },
      { label: 'Cancellation & Returns', href: '#' },
      { label: 'Shopping & Delivery', href: '#' },
      { label: 'Blog', href: '/blog' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Customer Care', href: '/contact-us' },
      { label: 'New Arrivals', href: '/categories/shop' },
    ],
  },
];

// ─── Social links (matching Listfoot) ──────────────────────────────────────


/** Instagram icon (filled) */
function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

/** LinkedIn icon (filled) */
function LinkedInIcon() {
  return (
   <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

/** TikTok icon (filled) */
function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M19 3C19 3 18.5 7 15 8V16C15 18.8 12.8 21 10 21C7.2 21 5 18.8 5 16C5 13.2 7.2 11 10 11C10.3 11 10.6 11 11 11.1V14.1C10.7 14 10.4 14 10 14C8.9 14 8 14.9 8 16C8 17.1 8.9 18 10 18C11.1 18 12 17.1 12 16V3H15C15 3 15.3 5 19 5V3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const socialLinks = [
  { label: 'Instagram', href: 'https://www.instagram.com/faflora?igsh=N3dld2VpMzNycDQy', Icon: InstagramIcon },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/108237871/admin/dashboard/', Icon: LinkedInIcon },
  { label: 'TikTok', href: 'https://www.tiktok.com/@faflora?_r=1&_t=ZS-92NK2t2CIlB', Icon: TikTokIcon },
];

export default function Footer() {
  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          Section before footer: Newsletter / Subscribe — dark background
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#1a1a1a]">
        <div className="mx-auto grid max-w-full grid-cols-1 gap-8 md:gap-16 px-6 md:px-12 py-10 md:grid-cols-3">
          {/* Left: Inverted logo */}
          <div className="flex flex-col justify-self-start gap-4">
            <Image
              src="/fa_logo_brand.png"
              alt="Faflora"
              width={130}
              height={44}
              className="md:h-11 h-8 w-auto object-contain"
              style={{ filter: 'invert(1) brightness(10)' }}
              priority
            />
          </div>

          {/* Middle: "New to Faflora?" */}
          <div className="md:w-[80%]">
            <h3 className="mb-3 text-2xl font-bold text-neutral-100">New to Faflora?</h3>
            <p className="mb-3 text-base text-white/70">
              You can subscribe to our newsletter to get updates on our latest offers, deals and
              marketing campaigns.
            </p>
            <p className="mb-3 text-base text-white/70">
              To subscribe to our newsletter, you must first read and agree to the Faflora{' '}
              <Link href="/privacy-policy" className="text-accent-orange">
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link href="/terms-and-conditions" className="text-accent-orange">
                Terms and Conditions
              </Link>
              .
            </p>
            <p className="mb-3 text-base text-white/70">
              You can unsubscribe at any time as described in Privacy Policy
            </p>
          </div>

          {/* Right: email subscribe */}
          <div>
            <h3 className="mb-2 text-2xl font-bold text-white">
              Stay home &amp; get your daily needs from our shop
            </h3>
            <p className="mb-1 text-lg text-white/70">Start Your Daily Shopping with Faflora</p>
            <p className="mb-4 text-base text-white/50">
              By subscribing i give consent to faflora processing my data to send me newsletters.
            </p>
            <form className="mb-4 flex max-w-md gap-2">
              <input
                type="email"
                placeholder="Enter e-mail address"
                className="w-full rounded-lg border border-white/20 bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Subscribe
              </button>
            </form>
            <p className="text-base text-white/40">
              You can unsubscribe at any time as described in our Privacy Policy
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          Footer Main
      ───────────────────────────────────────────────────────────── */}
      <footer className="bg-brand-600 text-white">
        {/* Link columns grid */}
        <div className="mx-auto grid max-w-full gap-8 px-4 py-10 grid-cols-2 md:grid-cols-6 md:px-12">
          {/* Contact info column */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-3 flex items-start gap-1.5">
              <svg className="w-4 h-4 text-accent-orange shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <p className="text-sm text-neutral-200">
                7 Tony Aki Str. Off Okpanam Rd, Behind Corner Int&apos;l School Asaba, Asaba 320242, Delta
              </p>
            </div>
            <div className="mb-3 flex items-start gap-1.5">
              <svg className="w-4 h-4 text-accent-orange shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <p className="text-sm text-neutral-200">WhatsApp or Call Us: (+234)80069910407</p>
            </div>
            <div className="flex items-start gap-1.5">
              <svg className="w-4 h-4 text-accent-orange shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <p className="text-sm text-neutral-200">faflora@outlook.com</p>
            </div>
          </div>

          {/* Links columns */}
          {linkColumns.map((col) => (
            <div key={col.heading}>
              <h4 className="mb-3 text-base font-bold text-neutral-100">{col.heading}</h4>
              <ul className="space-y-3 text-sm text-neutral-200">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* App store buttons + phone preview */}
          <div className="flex flex-col items-center gap-4 col-span-2 md:col-span-1">
            <div className="relative h-35 md:h-56 w-48 md:w-full overflow-hidden">
              <Image
                src="/images/mini_app.svg"
                alt="Faflora app preview"
                fill
                sizes="64px"
                className="object-contain"
              />
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 px-4 py-2 text-sm md:text-lg text-white"
              >
                <Image src="/icons/ri_apple-fill.png" alt="" width={14} height={14} aria-hidden />
                Get it on App Store
              </button>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 px-4 py-2 text-sm md:text-lg text-white"
              >
                <Image src="/icons/play_store.png" alt="" width={14} height={14} aria-hidden />
                Get it on Play Store
              </button>
            </div>
          </div>
        </div>

        {/* Bottom strip: copyright + social (always flex-row on same line) */}
        <div className="mx-auto flex flex-row items-center justify-between gap-4 px-4 py-6 md:px-12">
          <p className="text-sm text-white/70">© 2026, Faflora</p>

          {/* Social media icons with brand colors */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-white/80">Follow Us</span>
            {socialLinks.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={`flex h-9 w-9 items-center justify-center rounded-full bg-neutral-50 hover:opacity-90 transition-opacity ${
                  label === 'TikTok' ? 'text-brand-600' : 'text-brand-600'
                }`}
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
