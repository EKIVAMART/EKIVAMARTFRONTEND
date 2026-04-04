import React from 'react';
import FadeInSection from '@/components/FadeInSection';
import TypingText from '@/components/TypingText';
import {
  Eye,
  Database,
  Cookie,
  Server,
  ShieldCheck,
  ExternalLink,
  Baby,
  RefreshCw,
  Mail,
  ArrowRight,
  Lock,
  Fingerprint,
  type LucideIcon,
} from 'lucide-react';

/* ─── TYPES ─── */
interface SectionData {
  id: string;
  number: string;
  title: string;
  icon: LucideIcon;
  content: React.ReactNode;
}

/* ─── REUSABLE COMPONENTS ─── */

const RunningNumber = ({ n }: { n: string }) => (
  <span
    className="select-none font-black text-[4.5rem] leading-none tracking-tighter text-[#f0c8ec] absolute -left-2 -top-6 pointer-events-none"
    style={{ fontFamily: "'Georgia', serif" }}
    aria-hidden="true"
  >
    {n}
  </span>
);

const SectionAnchor = ({ id }: { id: string }) => (
  <span id={id} className="block -mt-28 pt-28 invisible absolute" aria-hidden="true" />
);

const Divider = () => (
  <div className="flex items-center gap-3 my-12">
    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#e8b8e4] to-transparent" />
    <div className="w-1.5 h-1.5 rounded-full bg-[#c740b0]" />
    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#e8b8e4] to-transparent" />
  </div>
);

const Pill = ({ text }: { text: string }) => (
  <span className="inline-flex items-center gap-1.5 bg-[#fdf3fc] border border-[#e8b8e4] text-[#981d87] text-xs font-semibold px-3 py-1.5 rounded-full">
    {text}
  </span>
);

const CheckRow = ({ text }: { text: string }) => (
  <li className="flex items-start gap-3 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
    <span className="flex-shrink-0 mt-1 w-5 h-5 rounded-full bg-gradient-to-br from-[#981d87] to-[#c740b0] flex items-center justify-center shadow-sm">
      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
        <path d="M1 3.5L3.2 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
    <span>{text}</span>
  </li>
);

const NoteBox = ({ children }: { children: React.ReactNode }) => (
  <div className="relative mt-8 pl-5 border-l-4 border-[#c740b0] bg-gradient-to-r from-[#fdf3fc] to-transparent py-4 pr-4 rounded-r-xl">
    <p className="text-sm md:text-base text-[#6b0f6b] leading-relaxed font-medium">{children}</p>
  </div>
);

const SectionHeading = ({
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
      <RunningNumber n={number} />
      <div className="relative flex items-center gap-3 pt-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#981d87] to-[#c740b0] flex items-center justify-center text-white shadow-lg shadow-[#981d8730]">
          <Icon size={18} />
        </div>
        <div>
          <span className="block text-[10px] font-black uppercase tracking-[4px] text-[#c740b0] mb-0.5">
            Section {number}
          </span>
          <h2
            className="text-xl md:text-2xl lg:text-[26px] font-extrabold text-[#1a0018] leading-tight"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            {title}
          </h2>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-[#c740b0]/40 via-[#e8b8e4]/60 to-transparent" />
    </div>
  </FadeInSection>
);

const TableOfContents = () => (
  <aside className="hidden xl:block sticky top-28 self-start w-56 flex-shrink-0">
    <div className="rounded-2xl border border-[#e8b8e4] bg-white/70 backdrop-blur-sm p-5 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-[3px] text-[#c740b0] mb-4">Contents</p>
      <nav>
        <ul className="space-y-1">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#981d87] transition-colors py-1 group"
              >
                <span className="text-[#c740b0]/50 group-hover:text-[#c740b0] transition-colors">
                  <s.icon size={14} />
                </span>
                <span className="text-[10px] font-bold text-[#c740b0]/40 group-hover:text-[#c740b0]/70">
                  {s.number}
                </span>
                <span className="leading-tight">{s.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  </aside>
);

/* ─── SECTIONS DATA ─── */
const sections: SectionData[] = [
  {
    id: 'application',
    number: '01',
    title: 'The Application',
    icon: Fingerprint,
    content: (
      <>
        <p className="text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed mb-6">
          For a better experience while using our Service, we may require you to provide us with certain personally identifiable information, including but not limited to:
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          {['Name', 'Address', 'Location', 'Personalised Username', 'Telephone Number'].map((item) => (
            <Pill key={item} text={item} />
          ))}
        </div>
        <p className="text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          The information we request will be retained and used as described in this privacy policy. The app uses third-party services that may collect information used to identify you. Review the privacy policies of the third-party service providers used by the app:
        </p>
        <ul className="mt-5 space-y-2">
          {['Google Play Services', 'AdMob', 'Google Analytics for Firebase', 'Firebase Crashlytics', 'Facebook'].map((tp) => (
            <CheckRow key={tp} text={tp} />
          ))}
        </ul>
      </>
    ),
  },
  {
    id: 'log-data',
    number: '02',
    title: 'Log Data',
    icon: Database,
    content: (
      <>
        <p className="text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          Whenever you use our Service, in the case of an error in the app, we collect data and information (through third-party products) on your device called{' '}
          <span className="font-semibold text-[#981d87]">Log Data</span>. This Log Data may include:
        </p>
        <ul className="mt-5 space-y-2">
          {[
            'Device Internet Protocol ("IP") address',
            'Device name and operating system version',
            'Configuration of the app when utilising our Service',
            'Time and date of your use of the Service',
            'Other diagnostic statistics',
          ].map((item) => (
            <CheckRow key={item} text={item} />
          ))}
        </ul>
        <NoteBox>
          Log Data is collected automatically and is used strictly for diagnosing issues and improving Service reliability — never for marketing or profiling purposes.
        </NoteBox>
      </>
    ),
  },
  {
    id: 'cookies',
    number: '03',
    title: 'Cookies',
    icon: Cookie,
    content: (
      <>
        <p className="text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          Cookies are files with a small amount of data commonly used as anonymous unique identifiers. They are sent to your browser from websites you visit and stored on your device's internal memory.
        </p>
        <p className="mt-5 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          This Service does not use "cookies" explicitly. However, the app may use third-party code and libraries that use cookies to collect information and improve their services.
        </p>
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-[#e8b8e4] bg-[#fdf3fc]/50 p-5">
            <p className="text-xs font-black uppercase tracking-[3px] text-[#c740b0] mb-2">Your Control</p>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              You have the option to accept or refuse cookies and know when a cookie is sent to your device via your browser settings.
            </p>
          </div>
          <div className="rounded-2xl border border-[#e8b8e4] bg-[#fdf3fc]/50 p-5">
            <p className="text-xs font-black uppercase tracking-[3px] text-[#c740b0] mb-2">Important Note</p>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              If you choose to refuse cookies, you may not be able to use some portions of our Service fully.
            </p>
          </div>
        </div>
      </>
    ),
  },
  {
    id: 'service-providers',
    number: '04',
    title: 'Service Providers',
    icon: Server,
    content: (
      <>
        <p className="text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed mb-6">
          We may employ third-party companies and individuals for the following purposes:
        </p>
        <ul className="space-y-2 mb-6">
          {[
            'To facilitate our Service',
            'To provide the Service on our behalf',
            'To perform Service-related services',
            'To assist us in analysing how our Service is used',
          ].map((r) => (
            <CheckRow key={r} text={r} />
          ))}
        </ul>
        <NoteBox>
          These third parties have access to your Personal Information solely to perform the tasks assigned to them on our behalf. They are obligated not to disclose or use the information for any other purpose.
        </NoteBox>
      </>
    ),
  },
  {
    id: 'security',
    number: '05',
    title: 'Security',
    icon: ShieldCheck,
    content: (
      <div className="relative rounded-2xl overflow-hidden border border-[#e8b8e4]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#fdf3fc] to-white" />
        <div className="relative p-6 md:p-8">
          <p className="text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
            We value your trust in providing us your Personal Information. We strive to use commercially acceptable means of protecting it using industry-standard encryption and security practices.
          </p>
          <div className="mt-6 flex items-start gap-4 p-4 rounded-xl bg-white border border-[#e8b8e4] shadow-sm">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#981d87] to-[#c740b0] flex items-center justify-center text-white shadow">
              <Lock size={18} />
            </div>
            <p className="text-sm md:text-base text-gray-500 leading-relaxed">
              <span className="font-bold text-[#981d87]">Transparency notice:</span> No method of transmission over the internet or electronic storage is 100% secure and reliable. While we endeavour to protect your data, we cannot guarantee its absolute security.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'links',
    number: '06',
    title: 'Links to Other Sites',
    icon: ExternalLink,
    content: (
      <>
        <p className="text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          This Service may contain links to other sites. If you click on a third-party link, you will be directed to that site. Note that these external sites are not operated by us.
        </p>
        <p className="mt-5 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          We strongly advise you to review the Privacy Policy of any website you visit. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party sites or services.
        </p>
      </>
    ),
  },
  {
    id: 'children',
    number: '07',
    title: "Children's Privacy",
    icon: Baby,
    content: (
      <div className="rounded-2xl border-2 border-[#c740b0]/30 bg-gradient-to-br from-[#fdf3fc] to-white p-6 md:p-8">
        <p className="text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          These Services do not address anyone under the age of{' '}
          <span className="font-black text-[#981d87] text-lg">13</span>.
          We do not knowingly collect personally identifiable information from children under 13.
        </p>
        <p className="mt-5 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          If we discover that a child under 13 has provided us with personal information, we immediately delete this from our servers.
        </p>
        <p className="mt-5 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          If you are a parent or guardian and you are aware that your child has provided us with personal information, please{' '}
          <a href="#contact" className="text-[#981d87] font-semibold hover:underline">
            contact us
          </a>{' '}
          immediately so that we can take the necessary actions.
        </p>
      </div>
    ),
  },
  {
    id: 'changes',
    number: '08',
    title: 'Changes to This Policy',
    icon: RefreshCw,
    content: (
      <>
        <p className="text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          We may update our Privacy Policy from time to time. You are advised to review this page periodically for any changes. We will notify you of any changes by posting the new Privacy Policy on this page.
        </p>
        <NoteBox>
          Changes are effective immediately after they are posted on this page. Continued use of the Service after any changes constitutes acceptance of the updated Privacy Policy.
        </NoteBox>
      </>
    ),
  },
  {
    id: 'contact',
    number: '09',
    title: 'Contact Us',
    icon: Mail,
    content: (
      <>
        <p className="text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed mb-6">
          If you have any questions or suggestions about our Privacy Policy, or if you need to exercise your rights regarding your personal data, please reach out to us:
        </p>
        <a
          href="mailto:support@faflories.com"
          className="inline-flex items-center gap-3 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#981d87] to-[#c740b0] flex items-center justify-center text-white shadow-lg shadow-[#981d8730] group-hover:scale-110 transition-transform">
            <Mail size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[3px] text-[#c740b0]">Email</p>
            <p className="text-[#981d87] font-bold text-base group-hover:underline">support@faflories.com</p>
          </div>
        </a>
      </>
    ),
  },
];

/* ─── MAIN COMPONENT ─── */
export default function PrivacyPolicy() {
  return (
    <div
      className="font-sans bg-white min-h-screen overflow-x-hidden"
      style={{ fontFamily: "'Palatino Linotype', 'Book Antiqua', 'Georgia', serif" }}
    >
      {/* HERO SECTION */}
      <section className="relative overflow-hidden min-h-[72vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#fdf8ff] via-white to-white" />

        <div className="absolute -top-24 -right-24 w-[50vw] h-[50vw] max-w-2xl max-h-2xl rounded-full bg-gradient-to-br from-[#f0c8ec] to-[#e8b8e4] opacity-30 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 -left-20 w-[35vw] h-[35vw] max-w-xl max-h-xl rounded-full bg-[#981d87] opacity-10 blur-[90px] pointer-events-none" />

        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, #981d87 0px, #981d87 1px, transparent 1px, transparent 48px), repeating-linear-gradient(90deg, #981d87 0px, #981d87 1px, transparent 1px, transparent 48px)',
          }}
        />

        <div className="absolute top-20 right-[6%] hidden md:flex flex-col gap-2">
          <div className="flex items-center gap-2 bg-white border border-[#e8b8e4] text-[#981d87] text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-sm">
            <Lock size={10} /> NDPR Compliant
          </div>
          <div className="flex items-center gap-2 bg-white border border-[#e8b8e4] text-[#981d87] text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-sm">
            <Eye size={10} /> Transparent by Default
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-20 w-full pt-28 pb-20">
          <FadeInSection type="fadeDown" delay={0.1}>
            <div className="inline-flex items-center gap-2 border border-[#e8b8e4] text-[#981d87] text-[10px] font-black uppercase tracking-[4px] px-4 py-2 rounded-full mb-8 bg-[#fdf3fc]">
              <ShieldCheck size={11} />
              <span>Faflories · Legal</span>
            </div>
          </FadeInSection>

          <FadeInSection type="fadeUp" delay={0.2}>
            <div className="relative">
              <span
                className="absolute -top-8 -left-3 text-[8rem] md:text-[12rem] font-black text-[#f0c8ec]/50 leading-none select-none pointer-events-none tracking-tighter"
                aria-hidden="true"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                ⌂
              </span>
              <h1
                className="relative text-5xl md:text-7xl lg:-skew-x-8 -skew-x-6 lg:text-[6rem] font-black text-[#1a0018] leading-[0.92] tracking-tight"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                <TypingText text="Privacy" delay={400} typingSpeed={70} colorClass="text-[#c740b0]" />
                <br />
                <span className="text-[#981d87]">
                  <TypingText text="Policy" delay={1100} typingSpeed={70} colorClass="text-[#c740b0]" />
                </span>
              </h1>
            </div>
          </FadeInSection>

          <FadeInSection type="fadeUp" delay={0.5}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="h-px w-16 bg-gradient-to-r from-[#981d87] to-[#c740b0]" />
              <p className="text-gray-400 text-sm font-medium">
                Last updated: <span className="text-[#981d87] font-bold">April 03, 2026</span>
              </p>
              <div className="h-px w-8 bg-[#e8b8e4]" />
              <Pill text="Faflories Marketplace" />
            </div>
          </FadeInSection>

          <FadeInSection type="fadeUp" delay={0.65}>
            <p className="mt-8 text-gray-500 text-base md:text-lg lg:text-xl max-w-2xl leading-relaxed">
              Your privacy is the foundation of our trust. This page explains exactly how{' '}
              <span className="font-bold text-[#981d87]">Faflories</span> — Nigeria's premier
              multi-vendor marketplace — collects, uses, and safeguards your personal information.
            </p>
          </FadeInSection>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none">
          <svg viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,32 C480,64 960,0 1440,32 L1440,64 L0,64 Z" fill="#fdf8ff" fillOpacity="0.6" />
          </svg>
        </div>
      </section>

      {/* Intro Ribbon */}
      <FadeInSection type="fade" delay={0.1}>
        <div className="bg-gradient-to-r from-[#2d0029] via-[#6b0f6b] to-[#981d87] py-5 px-6 md:px-12">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <p className="text-white/80 text-sm md:text-base lg:text-[17px] leading-relaxed max-w-3xl">
              <span className="font-bold text-white">Faflories</span> is Nigeria's premier multi-vendor marketplace connecting buyers with affordable, high-quality, locally made products. We empower vendors, offer seamless shopping, secure payments, and fast delivery — supporting local businesses and celebrating Nigerian creativity.{' '}
              <span className="italic text-[#f0c8ec]">Shop smart. Shop Nigerian.</span>
            </p>
            <a
              href="/"
              className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-[#981d87] text-xs font-extrabold uppercase tracking-widest px-5 py-2.5 rounded-full hover:bg-[#f9eaf8] transition whitespace-nowrap shadow"
            >
              Visit Store <ArrowRight size={13} />
            </a>
          </div>
        </div>
      </FadeInSection>

      {/* Opening Statement */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-16 pb-4">
        <FadeInSection type="zoom" delay={0.15}>
          <div className="relative rounded-3xl overflow-hidden border border-[#e8b8e4] shadow-md bg-white">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#981d87] via-[#c740b0] to-[#981d87]" />
            <div className="px-8 md:px-12 py-8 md:py-10 pl-12 md:pl-16">
              <p className="text-xs font-black uppercase tracking-[4px] text-[#c740b0] mb-3">Overview</p>
              <p className="text-gray-700 text-base md:text-[17px] lg:text-[17.5px] leading-relaxed">
                This page informs visitors regarding our policies on the collection, use, and disclosure of Personal Information when anyone uses our Service. If you choose to use our Service, you agree to the collection and use of information in relation to this policy. Personal Information we collect is used solely for providing and improving the Service. We will not use or share your information except as described herein.
              </p>
              <p className="mt-4 text-gray-500 text-sm md:text-[15.5px] lg:text-[16px] leading-relaxed">
                Terms used in this Privacy Policy carry the same meanings as in our{' '}
                <a href="/terms-and-conditions" className="text-[#981d87] font-semibold hover:underline inline-flex items-center gap-1">
                  Terms and Conditions <ExternalLink size={12} />
                </a>, accessible at Faflories, unless otherwise defined herein.
              </p>
            </div>
          </div>
        </FadeInSection>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16">
        <div className="flex items-start gap-16">
          <TableOfContents />

          <main className="flex-1 min-w-0">
            {sections.map((section, index) => (
              <React.Fragment key={section.id}>
                <section className="relative">
                  <SectionAnchor id={section.id} />
                  <SectionHeading
                    number={section.number}
                    title={section.title}
                    icon={section.icon}
                    delay={0.1 + index * 0.04}
                  />
                  <FadeInSection type="fadeUp" delay={0.2}>
                    {section.content}
                  </FadeInSection>
                </section>
                {index < sections.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </main>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pb-24">
        <FadeInSection type="zoom" delay={0.1}>
          <div className="relative overflow-hidden rounded-3xl border border-[#e8b8e4]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#fdf3fc] via-white to-[#f9eaf8]" />
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#c740b0] opacity-10 blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-[#981d87] opacity-10 blur-[60px] pointer-events-none" />

            <div
              className="absolute inset-0 opacity-[0.025] pointer-events-none"
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, #981d87 0px, #981d87 1px, transparent 1px, transparent 28px)',
              }}
            />

            <div className="relative px-8 md:px-16 py-12 md:py-16 flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-[#f0c8ec] text-[#981d87] text-[10px] font-black uppercase tracking-[4px] px-4 py-2 rounded-full mb-5">
                  <ShieldCheck size={11} /> Your data. Your rights.
                </div>
                <h3
                  className="text-2xl md:text-4xl lg:text-[42px] font-black text-[#1a0018] leading-tight mb-4"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  Privacy-first.<br />
                  <span className="text-[#981d87]">Always.</span>
                </h3>
                <p className="text-gray-500 text-sm md:text-base lg:text-[17px] leading-relaxed max-w-md">
                  At Faflories, transparency is not a legal checkbox — it's a commitment. We build trust with every vendor and buyer, one interaction at a time.
                </p>
              </div>

              <div className="flex flex-col gap-3 flex-shrink-0 w-full md:w-auto">
                <a
                  href="/terms-and-conditions"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#981d87] to-[#c740b0] text-white px-8 py-3.5 rounded-full font-extrabold text-sm shadow-lg shadow-[#981d8730] hover:scale-105 active:scale-95 transition-transform"
                >
                  Read Terms of Service <ArrowRight size={16} />
                </a>
                <a
                  href="/"
                  className="inline-flex items-center justify-center gap-2 border-2 border-[#981d87] text-[#981d87] px-8 py-3.5 rounded-full font-extrabold text-sm hover:bg-[#fdf3fc] transition-colors"
                >
                  Return to Homepage
                </a>
                <p className="text-center text-[11px] text-gray-400 mt-1">
                  By using Faflories, you accept this Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </FadeInSection>
      </div>
    </div>
  );
}