import { FaWhatsapp } from 'react-icons/fa';

export default function SupportLauncher() {
  return (
    <a className="ek-support-launcher" href="https://wa.me/2349069910407" target="_blank" rel="noopener noreferrer" aria-label="Contact EkivaMart on WhatsApp">
      <span className="ek-launcher-icon"><FaWhatsapp size={22} aria-hidden="true" /></span>
      <span>WhatsApp</span>
    </a>
  );
}
