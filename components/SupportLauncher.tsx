'use client';

import { FaWhatsapp } from 'react-icons/fa';
import { usePathname } from 'next/navigation';

export default function SupportLauncher() {
  const pathname = usePathname();
  if (/^\/(?:admin|super-admin)(?:\/|$)/.test(pathname)) return null;
  return (
    <a className="ek-support-launcher" href="https://wa.me/2349069910407" target="_blank" rel="noopener noreferrer" aria-label="Contact EkivaMart on WhatsApp">
      <span className="ek-launcher-icon"><FaWhatsapp size={22} aria-hidden="true" /></span>
      <span>WhatsApp</span>
    </a>
  );
}
