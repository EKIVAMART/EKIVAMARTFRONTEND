import HeroSection from '@/components/contact/HeroSection';
import ContactSection from '@/components/contact/ContactSection';
import FAQSection from '@/components/contact/FAQSection';
import VendorCTABanner from '@/components/contact/VendorCTABanner';
import Divider from '@/components/contact/shared/Divider';

export default function ContactUs() {
  return (
    <div
      className="font-sans bg-[#fafbf8] min-h-screen overflow-x-hidden"

    >
      {/* ══ HERO ══ */}
      <HeroSection />

      {/* ══ BODY ══ */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 md:px-10 lg:px-12 pb-28">
        {/* ── MAIN GRID: Form + Info (equal height) ── */}
        <ContactSection />

        <Divider />

        {/* ── FAQ + Quick Self-Help ── */}
        <FAQSection />

        <Divider />

        {/* ── VENDOR CTA BANNER ── */}
        <VendorCTABanner />
      </div>
    </div>
  );
}