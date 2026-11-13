import { Check as PlatformCheck } from '@/components/ui/platform-icons';
import PolicyDocument from '@/components/information/PolicyDocument';
import {
  Baby,
  Cookie,
  Database,
  ExternalLink,
  Fingerprint,
  Lock,
  Mail,
  RefreshCw,
  Server,
  ShieldCheck,
  type LucideIcon,
} from '@/components/ui/platform-icons';
import React from 'react';

/* ─── TYPES ─── */
interface SectionData {
  id: string;
  number: string;
  title: string;
  icon: LucideIcon;
  content: React.ReactNode;
}

const Pill = ({ text }: { text: string }) => (
  <span className="inline-flex items-center gap-1.5 bg-[#f5f7f3] border border-[#e2e7e1] text-[#228b22] text-xs font-semibold px-3 py-1.5 rounded-full">
    {text}
  </span>
);

const CheckRow = ({ text }: { text: string }) => (
  <li className="flex items-start gap-3 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
    <span className="flex-shrink-0 mt-1 w-5 h-5 rounded-full flex items-center justify-center">
      <PlatformCheck size={9} aria-hidden="true" />
    </span>
    <span>{text}</span>
  </li>
);

const NoteBox = ({ children }: { children: React.ReactNode }) => (
  <div className="relative mt-8 pl-5 border-l-4 border-[#1c711c] to-transparent py-4 pr-4 rounded-r-xl">
    <p className="text-sm md:text-base text-[#202820] leading-relaxed font-medium">
      {children}
    </p>
  </div>
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
          For a better experience while using our Service, we may require you to
          provide us with certain personally identifiable information, including
          but not limited to:
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            'Name',
            'Address',
            'Location',
            'Personalised Username',
            'Telephone Number',
          ].map((item) => (
            <Pill key={item} text={item} />
          ))}
        </div>
        <p className="text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          The information we request will be retained and used as described in
          this privacy policy. The app uses third-party services that may
          collect information used to identify you. Review the privacy policies
          of the third-party service providers used by the app:
        </p>
        <ul className="mt-5 space-y-2">
          {[
            'Google Play Services',
            'AdMob',
            'Google Analytics for Firebase',
            'Firebase Crashlytics',
            'Facebook',
          ].map((tp) => (
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
          Whenever you use our Service, in the case of an error in the app, we
          collect data and information (through third-party products) on your
          device called{' '}
          <span className="font-semibold text-[#228b22]">Log Data</span>. This
          Log Data may include:
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
          Log Data is collected automatically and is used strictly for
          diagnosing issues and improving Service reliability — never for
          marketing or profiling purposes.
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
          Cookies are files with a small amount of data commonly used as
          anonymous unique identifiers. They are sent to your browser from
          websites you visit and stored on your device's internal memory.
        </p>
        <p className="mt-5 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          This Service does not use "cookies" explicitly. However, the app may
          use third-party code and libraries that use cookies to collect
          information and improve their services.
        </p>
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-[#e2e7e1] bg-[#f5f7f3]/50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[3px] text-[#1c711c] mb-2">
              Your Control
            </p>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              You have the option to accept or refuse cookies and know when a
              cookie is sent to your device via your browser settings.
            </p>
          </div>
          <div className="rounded-lg border border-[#e2e7e1] bg-[#f5f7f3]/50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[3px] text-[#1c711c] mb-2">
              Important Note
            </p>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              If you choose to refuse cookies, you may not be able to use some
              portions of our Service fully.
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
          We may employ third-party companies and individuals for the following
          purposes:
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
          These third parties have access to your Personal Information solely to
          perform the tasks assigned to them on our behalf. They are obligated
          not to disclose or use the information for any other purpose.
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
      <div className="relative rounded-lg overflow-hidden border border-[#e2e7e1]">
        <div className="absolute inset-0 to-white" />
        <div className="relative p-6 md:p-8">
          <p className="text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
            We value your trust in providing us your Personal Information. We
            strive to use commercially acceptable means of protecting it using
            industry-standard encryption and security practices.
          </p>
          <div className="mt-6 flex items-start gap-4 p-4 rounded-xl bg-white border border-[#e2e7e1]">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-[#22643e]">
              <Lock size={18} />
            </div>
            <p className="text-sm md:text-base text-gray-500 leading-relaxed">
              <span className="font-bold text-[#228b22]">
                Transparency notice:
              </span>{' '}
              No method of transmission over the internet or electronic storage
              is 100% secure and reliable. While we endeavour to protect your
              data, we cannot guarantee its absolute security.
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
          This Service may contain links to other sites. If you click on a
          third-party link, you will be directed to that site. Note that these
          external sites are not operated by us.
        </p>
        <p className="mt-5 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          We strongly advise you to review the Privacy Policy of any website you
          visit. We have no control over, and assume no responsibility for, the
          content, privacy policies, or practices of any third-party sites or
          services.
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
      <div className="rounded-lg border-2 border-[#1c711c]/30 to-white p-6 md:p-8">
        <p className="text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          These Services do not address anyone under the age of{' '}
          <span className="font-semibold text-[#228b22] text-lg">13</span>. We
          do not knowingly collect personally identifiable information from
          children under 13.
        </p>
        <p className="mt-5 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          If we discover that a child under 13 has provided us with personal
          information, we immediately delete this from our servers.
        </p>
        <p className="mt-5 text-gray-600 text-[15.5px] md:text-[16.5px] lg:text-[17px] leading-relaxed">
          If you are a parent or guardian and you are aware that your child has
          provided us with personal information, please{' '}
          <a
            href="#contact"
            className="text-[#228b22] font-semibold hover:underline"
          >
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
          We may update our Privacy Policy from time to time. You are advised to
          review this page periodically for any changes. We will notify you of
          any changes by posting the new Privacy Policy on this page.
        </p>
        <NoteBox>
          Changes are effective immediately after they are posted on this page.
          Continued use of the Service after any changes constitutes acceptance
          of the updated Privacy Policy.
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
          If you have any questions or suggestions about our Privacy Policy, or
          if you need to exercise your rights regarding your personal data,
          please reach out to us:
        </p>
        <a
          href="mailto:support@faflora.com"
          className="inline-flex items-center gap-3 group"
        >
          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-[#22643e] group-hover:scale-110 transition-transform">
            <Mail size={20} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[3px] text-[#1c711c]">
              Email
            </p>
            <p className="text-[#228b22] font-bold text-base group-hover:underline">
              support@faflora.com
            </p>
          </div>
        </a>
      </>
    ),
  },
];

/* ─── MAIN COMPONENT ─── */
export default function PrivacyPolicy() {
  return (
    <PolicyDocument
      title="Privacy policy"
      date="Last updated: April 03, 2026"
      introduction={
        <>
          <p>
            This page informs visitors regarding our policies on the collection,
            use, and disclosure of Personal Information when anyone uses our
            Service. If you choose to use our Service, you agree to the
            collection and use of information in relation to this policy.
            Personal Information we collect is used solely for providing and
            improving the Service. We will not use or share your information
            except as described herein.
          </p>
          <p>
            Terms used in this Privacy Policy carry the same meanings as in our{' '}
            <a href="/terms-and-conditions">Terms and Conditions</a>, accessible
            at EkivaMart, unless otherwise defined herein.
          </p>
        </>
      }
      sections={sections}
    />
  );
}
