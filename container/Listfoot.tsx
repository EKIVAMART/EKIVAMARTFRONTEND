'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FiMapPin, FiPhone, FiMail, FiClock } from 'react-icons/fi';
import { FaInstagram, FaLinkedinIn, FaTiktok } from 'react-icons/fa';
import { assets } from '@/assets/assets';

/* ================== DATA ARRAYS ================== */

const footerLinks = [
  {
    title: 'Company',
    links: [
      'About Us',
      'Delivery Information',
      'Privacy Policy',
      'Terms & Conditions',
      'Contact Us',
      'Support Center',
      'Admin', 
    ],
  },
  {
    title: 'Account',
    links: [
      'About Us',
      'Delivery Information',
      'Privacy Policy',
      'Terms & Conditions',
      'Contact Us',
      'Support Center',
      'Careers',
    ],
  },
  {
    title: 'Corporate',
    links: [
      'About Us',
      'Delivery Information',
      'Privacy Policy',
      'Terms & Conditions',
      'Contact Us',
      'Support Center',
      'Careers',
    ],
  },
  {
    title: 'Popular',
    links: [
      'About Us',
      'Delivery Information',
      'Privacy Policy',
      'Terms & Conditions',
      'Contact Us',
      'Support Center',
      'Careers',
    ],
  },
];

const contactInfo = [
  {
    icon: FiMapPin,
    text: '7 Tony Aki Str. Off Okpanam Rd, Behind Corner Int’l School Asaba, Asaba 320242, Delta',
  },
  {
    icon: FiPhone,
    text: 'Call Us: (+234)90069910407',
  },
  {
    icon: FiMail,
    text: 'Email: faflories@outlook.com',
  },
  {
    icon: FiClock,
    text: 'Hours: 24hours',
  },
];

const socialLinks = [
  {
    icon: FaInstagram,
    href: 'https://www.instagram.com/faflories?igsh=N3dld2VpMzNycDQy',
  },
  {
    icon: FaLinkedinIn,
    href: 'https://www.linkedin.com/company/108237871/admin/dashboard/',
  },
  {
    icon: FaTiktok,
    href: 'https://www.tiktok.com/@faflories?_r=1&_t=ZS-92NK2t2CIlB',
  },
];

/* ================== COMPONENT ================== */

const Listfoot = () => {
  return (
    <footer className="bg-white">
      {/* MAIN CONTENT */}
      <div className="w-[90%] mx-auto px-4 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* BRAND & CONTACT */}
          <div className="lg:col-span-2 space-y-6">
            <Image src={assets.gs_logo} alt="Faflories" width={150} height={40} />

            <p className="text-gray-500 text-sm max-w-sm">
              Awesome grocery store website template
            </p>

            <ul className="space-y-3">
              {contactInfo.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-sm text-gray-600"
                  >
                    <Icon className="text-[#981d87] mt-1" />
                    <span>{item.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* FOOTER LINKS */}
          {footerLinks.map((section, index) => (
            <div key={index}>
              <h4 className="font-semibold text-gray-900 mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link, idx) => {
                  const isAbout = link === 'About Us';;
                  const isTerms = link === 'Terms & Conditions';
                  const isPrivacy = link === 'Privacy Policy';
                  const isSupport = link === 'Support Center';
                  const isContact = link === 'Contact Us';
                  const isAdmin = link === 'Admin';
                  const href = isAbout
                    ? '/about-us'
                    : isTerms 
                    ? '/terms-and-conditions' 
                    : isPrivacy
                    ? '/privacy-policy'
                    : isSupport
                    ? '/support'
                    : isContact
                    ? '/contact-us'
                    : isAdmin 
                    ? '/admin/login' 
                    : ''; // All other links point to current page for now

                  return (
                    <li
                      key={idx}
                      className="text-sm text-gray-600 hover:text-[#981d87] cursor-pointer transition"
                    >
                      <Link href={href} className="block w-full">
                        {link}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div>
        <div className="w-[90%] mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© 2026, Faflories</p>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Follow Us</span>

            <div className="flex gap-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-[#981d87] text-white hover:bg-[#7a176c] transition"
                  >
                    <Icon size={14} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Listfoot;
