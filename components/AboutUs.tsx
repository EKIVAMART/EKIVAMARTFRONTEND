import Image from 'next/image';
import Link from 'next/link';
import { UserRound } from 'lucide-react';
import shoppingPhoto from '@/assets/imgapt.jpg';

const values = [
  { title: 'Put customers first', text: 'We listen to shoppers and sellers and use what we learn to make EkivaMart easier to use.' },
  { title: 'Work hard', text: 'We pay attention to the details that make shopping and selling easier.' },
  { title: 'Work together', text: 'We share what we know and help each other solve problems for our customers.' },
  { title: 'Act with integrity', text: 'We communicate clearly and take responsibility when something goes wrong.' },
  { title: 'Care about the work', text: 'We take pride in helping independent businesses find customers and grow.' },
  { title: 'Keep improving', text: 'We stay curious and adapt as the needs of our marketplace change.' },
];

const stats = [
  { value: '100+', label: 'Vendor partners' },
  { value: '3 min', label: 'Store setup time' },
  { value: '₦0', label: 'Setup cost' },
  { value: '24/7', label: 'Online ordering' },
];

const team = [
  { name: 'Oghenefego Oghenekohworo', role: 'Co-founder' },
  { name: 'Ebikebuna Rufus', role: 'Co-founder' },
  { name: 'Seigha Rufus', role: 'CTO' },
  { name: 'Mustapha Adekunle', role: 'Backend developer' },
  { name: 'Team member' },
  { name: 'Team member' },
  { name: 'Team member' },
  { name: 'Team member' },
];

export default function AboutUs() {
  return (
    <div className="ek-home ek-about">
      <section className="ek-about-hero" aria-labelledby="about-title">
        <div className="ek-about-hero-copy">
          <span className="ek-kicker">Our story</span>
          <h1 id="about-title">About EkivaMart</h1>
          <p>EkivaMart brings independent stores across Nigeria together so shoppers can discover more and sellers can reach new customers.</p>
          <Link href="/stores">Explore stores</Link>
        </div>
        <figure className="ek-about-photo">
          <Image src={shoppingPhoto} alt="Two smiling women taking a selfie with their shopping bags" fill priority sizes="(max-width: 767px) calc(100vw - 48px), (max-width: 1184px) 55vw, 610px" />
        </figure>
      </section>

      <section className="ek-about-section" aria-labelledby="about-purpose">
        <div className="ek-about-heading">
          <span className="ek-about-kicker">Our purpose</span>
          <h2 id="about-purpose">Make it easier to trade across Africa</h2>
        </div>
        <div className="ek-about-purpose">
          <article className="ek-about-card">
            <h3>Our vision</h3>
            <p>Make commerce across Africa more accessible to independent businesses and the people who shop with them.</p>
          </article>
          <article className="ek-about-card">
            <h3>Our mission</h3>
            <p>Give shoppers one place to discover independent stores, and give sellers the tools to open a shop, manage orders, and grow online.</p>
          </article>
        </div>
      </section>

      <section className="ek-about-section" aria-labelledby="about-values">
        <div className="ek-about-heading">
          <span className="ek-about-kicker">Our values</span>
          <h2 id="about-values">How we work</h2>
        </div>
        <div className="ek-about-values">
          {values.map(({ title, text }) => (
            <article className="ek-about-card" key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ek-about-section ek-about-sellers" aria-labelledby="about-sellers">
        <div>
          <span className="ek-about-kicker">For independent sellers</span>
          <h2 id="about-sellers">Make room for your business online</h2>
          <Link href="/become-a-vendor">Sell on EkivaMart</Link>
        </div>
        <dl>
          {stats.map(({ value, label }) => (
            <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
          ))}
        </dl>
      </section>

      <section className="ek-about-section" aria-labelledby="about-team">
        <div className="ek-about-heading">
          <span className="ek-about-kicker">The people behind EkivaMart</span>
          <h2 id="about-team">Meet the team</h2>
        </div>
        <ul className="ek-about-team">
          {team.map(({ name, role }, index) => (
            <li className="ek-about-card ek-about-person" key={index}>
              <div className="ek-about-portrait" aria-hidden="true"><UserRound size={42} strokeWidth={1.4} /></div>
              <h3>{name}</h3>
              {role && <p>{role}</p>}
            </li>
          ))}
        </ul>
      </section>

      <section className="ek-about-section ek-about-contact" aria-labelledby="about-help">
        <div>
          <span className="ek-about-kicker">Get in touch</span>
          <h2 id="about-help">How can we help?</h2>
          <p>Get help with shopping, orders, or opening your store.</p>
        </div>
        <div>
          <Link className="ek-action" href="/support">Visit the help centre</Link>
          <Link href="/contact-us">Contact us</Link>
        </div>
      </section>
    </div>
  );
}
