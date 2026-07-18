import Image from 'next/image';

const linkColumns = [
  {
    heading: 'Company',
    links: ['About Us', 'Talent Solutions', 'Marketing Solutions & Analytics', 'Advertising', 'Small Business', 'Black Friday', 'Flash Sales'],
  },
  {
    heading: 'Account',
    links: ['Delivery Information', 'Privacy Policy', 'Terms & Conditions', 'Contact Us', 'Support Center'],
  },
  {
    heading: 'Useful Links',
    links: ['Announcement', 'Trust Management Center', 'Voice of the Customer', 'Store Entry Partnership Inquiries', 'Sitemap', 'Accessibility'],
  },
  {
    heading: 'Popular',
    links: ['Payment Methods', 'Cancellation & Returns', 'Shopping & Delivery', 'FAQ', 'Customer Care', 'New Arrivals'],
  },
];

/** Instagram icon */
function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="white" />
    </svg>
  );
}

/** LinkedIn icon */
function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="3" stroke="white" strokeWidth="2" />
      <path d="M7 10v7M7 7v.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M11 17v-4c0-1.1.9-2 2-2s2 .9 2 2v4M11 10v7" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** TikTok icon */
function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M19 3C19 3 18.5 7 15 8V16C15 18.8 12.8 21 10 21C7.2 21 5 18.8 5 16C5 13.2 7.2 11 10 11C10.3 11 10.6 11 11 11.1V14.1C10.7 14 10.4 14 10 14C8.9 14 8 14.9 8 16C8 17.1 8.9 18 10 18C11.1 18 12 17.1 12 16V3H15C15 3 15.3 5 19 5V3Z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Footer() {
  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          Section before footer: Newsletter / Subscribe — dark background
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#1a1a1a]">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-6 py-10 md:grid-cols-3">
          {/* Left: Inverted logo */}
          <div className="flex flex-col gap-4">
            <Image
              src="/logo.jpg"
              alt="Faflora"
              width={130}
              height={44}
              className="h-11 w-auto object-contain"
              style={{ filter: 'invert(1) brightness(10)' }}
            />
          </div>

          {/* Middle: "New to Faflora?" */}
          <div>
            <h3 className="mb-3 text-base font-semibold text-white">New to Flaflora?</h3>
            <p className="mb-3 text-sm text-white/70">
              You can subscribe to our newsletter to get updates on our latest offers, deals and
              marketing campaigns.
            </p>
            <p className="mb-3 text-sm text-white/70">
              To subscribe to our newsletter, you must first read and agree to the Faflora{' '}
              <a href="/privacy-policy" className="text-brand-400 underline">
                Privacy Policy
              </a>{' '}
              and{' '}
              <a href="#" className="text-brand-400 underline">
                Cookie Notice
              </a>
              .
            </p>
            <p className="text-sm text-white/70">
              You can unsubscribe at any time as described in Privacy Policy
            </p>
          </div>

          {/* Right: email subscribe */}
          <div>
            <h3 className="mb-2 text-xl font-bold text-white">
              Stay home &amp; get your daily needs from our shop
            </h3>
            <p className="mb-1 text-sm text-white/70">Start Your Daily Shopping with Faflora</p>
            <p className="mb-4 text-xs text-white/50">
              By subscribing i give consent to faflora processing my data to send me newsletters.
            </p>
            <form className="mb-2 flex max-w-md gap-2">
              <input
                type="email"
                placeholder="Enter e-mail address"
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs text-white/40">
              You can unsubscribe at any time as described in our Privacy Policy
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          Main footer — purple brand background
      ───────────────────────────────────────────────────────────── */}
      <footer className="bg-brand-600 text-white">
        {/* Link columns grid */}
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-5 md:px-6">
          {/* Contact info column */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="mb-1 flex items-center gap-1.5">
              <span className="text-sm">📍</span>
              <p className="text-xs text-white/80">
                7 Tony Aki Str. Off Okpanam Rd, Behind Corner Int&apos;l School Asaba, Asaba 320242, Delta
              </p>
            </div>
            <div className="my-2 flex items-center gap-1.5">
              <span className="text-sm">📞</span>
              <p className="text-xs text-white/80">WhatsApp or Call Us: (+234)80069910407</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm">✉️</span>
              <p className="text-xs text-white/80">faflora@outlook.com</p>
            </div>
          </div>

          {/* Link columns */}
          {linkColumns.map((col) => (
            <div key={col.heading}>
              <h4 className="mb-3 text-sm font-bold text-white">{col.heading}</h4>
              <ul className="space-y-2 text-xs text-white/80">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="hover:text-white">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom strip: copyright + app preview + social */}
        <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-6 border-t border-white/20 px-4 py-6 md:flex-row md:items-center md:px-6">
          <p className="text-xs text-white/70">© 2026, Faflora</p>

          {/* App store buttons + phone preview */}
          <div className="flex items-center gap-4">
            <div className="relative h-24 w-16 overflow-hidden rounded-xl">
              <Image
                src="/images/mini_app_preview.png"
                alt="Faflora app preview"
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-xs text-white"
              >
                <Image src="/icons/ri_apple-fill.png" alt="" width={14} height={14} aria-hidden />
                Get it on App Store
              </button>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-xs text-white"
              >
                <Image src="/icons/bi_google-play.png" alt="" width={14} height={14} aria-hidden />
                Get it on Play Store
              </button>
            </div>
          </div>

          {/* Social media icons with brand colors */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-white/80">Follow Us</span>
            {/* Instagram — pink/purple gradient circle */}
            <a
              href="#"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full"
              style={{
                background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
              }}
            >
              <InstagramIcon />
            </a>
            {/* LinkedIn — LinkedIn blue circle */}
            <a
              href="#"
              aria-label="LinkedIn"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0077B5]"
            >
              <LinkedInIcon />
            </a>
            {/* TikTok — near-black circle */}
            <a
              href="#"
              aria-label="TikTok"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#111111]"
            >
              <TikTokIcon />
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
