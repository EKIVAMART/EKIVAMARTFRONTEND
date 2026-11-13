import Image from 'next/image';
import Link from 'next/link';
import { UserRound } from '@/components/ui/platform-icons';
import { BinocularsIcon, StorefrontIcon, HandHeartIcon, SealCheckIcon, UsersThreeIcon, ShieldCheckIcon, PlantIcon, ArrowsClockwiseIcon } from '@phosphor-icons/react/ssr';
import styles from './AboutUs.module.css';
import shoppingPhoto from '@/assets/imgapt.jpg';

const values = [
  { icon: HandHeartIcon, title: 'Start with people', text: 'Every decision starts with the people using EkivaMart. We listen to shoppers and sellers to understand what would make their day easier.' },
  { icon: SealCheckIcon, title: 'Make the details count', text: 'From finding a product to managing an order, small details matter. We put care into making each step clear and useful.' },
  { icon: UsersThreeIcon, title: 'Build together', text: 'A marketplace grows through its community. We share ideas, learn from our sellers and work together to solve real problems.' },
  { icon: ShieldCheckIcon, title: 'Earn trust every day', text: 'We believe in clear communication and taking responsibility. When something goes wrong, we focus on understanding it and putting it right.' },
  { icon: PlantIcon, title: 'Champion local ambition', text: 'Behind every independent store is someone building a future. We want to help their products reach more people, beyond their usual neighbourhood.' },
  { icon: ArrowsClockwiseIcon, title: 'Keep getting better', text: 'Good ideas can come from anywhere. We welcome feedback, question what could work better and keep improving as our community grows.' },
];

const team = [
  { name: 'Oghenefego Oghenekohworo', role: 'Chief Executive Officer', image: '/images/ceo.png', position: '72% 65%' },
  { name: 'Adekunle Mustapha Akintola', role: 'Software Developer Lead', image: '/images/adekunle-mustapha-akintola.png', position: '50% 45%' },
  { name: 'Donald Emma-Ogbame', role: 'Software Developer', image: '/images/donald-emma-ogbame.png', position: '50% 50%' },
  { name: 'Uchenna Raphael', role: 'Technical Support Engineer', image: '/images/uchenna-raphael.png', position: '50% 30%' },
  { name: 'Asoya Somtochukwu Victoria', role: 'Social Media and Content', image: '/images/asoya-somtochukwu-victoria.png', position: '50% 55%' },
  { name: 'David Adewale', role: 'Lead Product Designer and Branding', image: '/images/david-adewale.png', position: '50% 40%' },
  { name: 'Okonkwo Emmanuel Ogorchukwu', role: 'Customer Support', image: '/images/okonkwo-emmanuel-ogorchukwu.png', position: '50% 60%' },
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
          <article className={`${styles.purposeCard} ${styles.vision}`}>
            <div className={styles.purposeLabel}><BinocularsIcon size={32} weight="duotone" aria-hidden="true" /><span>Our vision</span></div>
            <h3>Local ambition.<br />Limitless possibility.</h3>
            <p>We imagine an Africa where a business’s location never limits its potential. Where independent stores can reach beyond their neighbourhoods, and shoppers can discover the talent and products around them.</p>
            <div className={styles.signature}>Rooted locally. Looking further.</div>
          </article>
          <article className={`${styles.purposeCard} ${styles.mission}`}>
            <div className={styles.purposeLabel}><StorefrontIcon size={32} weight="duotone" aria-hidden="true" /><span>Our mission</span></div>
            <h3>Bring great stores<br />closer to everyone.</h3>
            <p>We’re building a marketplace that connects shoppers with independent businesses, starting in Nigeria. One place to discover products, and practical tools for sellers to open a store, manage orders and grow online.</p>
            <div className={styles.signature}>Discover. Connect. Grow.</div>
          </article>
        </div>
      </section>

      <section className="ek-about-section" aria-labelledby="about-values">
        <div className="ek-about-heading">
          <span className="ek-about-kicker">Our values</span>
          <h2 id="about-values">What we stand for</h2>
          <p className={styles.valuesIntro}>The principles behind the decisions we make and the marketplace we’re building.</p>
        </div>
        <div className="ek-about-values">
          {values.map(({ icon: Icon, title, text }, index) => (
            <article className={styles.valueCard} key={title}>
              <div className={styles.valueTop}><span className={styles.valueIcon}><Icon size={48} weight="duotone" aria-hidden="true" /></span><span className={styles.valueNumber} aria-hidden="true">0{index + 1}</span></div>
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
<p>Build your storefront, publish your products and manage orders from your vendor dashboard.</p>
      </section>

      <section className="ek-about-section" aria-labelledby="about-team">
        <div className="ek-about-heading">
          <span className="ek-about-kicker">The people behind EkivaMart</span>
          <h2 id="about-team">Meet the team</h2>
        </div>
        <ul className="ek-about-team">
          {team.map(({ name, role, image, position }) => (
            <li className="ek-about-card ek-about-person" key={name}>
              <div className="ek-about-portrait">
                {image ? (
                  <Image src={image} alt={name} fill sizes="(max-width: 767px) 45vw, 270px" style={{ objectFit: 'cover', objectPosition: position }} />
                ) : <UserRound size={42} strokeWidth={1.4} aria-hidden="true" />}
              </div>
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
