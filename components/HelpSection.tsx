import Image from "next/image";
import type { ReactNode } from "react";

type ContactItem = {
  id: string;
  label: string;
  value: string;
  href: string;
  icon: ReactNode;
};

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden="true">
    <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1L6.6 10.8Z" />
  </svg>
);

const WhatsappIcon = () => (
  <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
    <path
      d="M12 2.5a9.5 9.5 0 0 0-8.1 14.4L2.5 21.5l4.7-1.3A9.5 9.5 0 1 0 12 2.5Z"
      className="fill-current"
    />
    <path
      d="M9.2 7.8c.2-.2.5-.2.7 0l.9 1.7c.1.2.1.4-.1.6l-.5.6c.6 1.1 1.5 2 2.6 2.6l.6-.6c.2-.2.4-.2.6-.1l1.7.9c.2.1.2.5 0 .7-.5.8-1.3 1.1-2.2.9-2.5-.6-4.3-2.4-4.9-4.9-.2-.9.1-1.7.7-2.4Z"
      fill="white"
    />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="3" className="fill-current" />
    <path
      d="m7.5 10 4.5 3.5 4.5-3.5"
      fill="none"
      stroke="white"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const contacts: ContactItem[] = [
  {
    id: "phone",
    label: "Contact number",
    value: "+234 1234 56789",
    href: "tel:+234123456789",
    icon: <PhoneIcon />,
  },
  {
    id: "whatsapp",
    label: "Whatsapp",
    value: "+234 1234 56789",
    href: "https://wa.me/234123456789",
    icon: <WhatsappIcon />,
  },
  {
    id: "email",
    label: "Email Support",
    value: "vendors@faflora.com",
    href: "mailto:vendors@faflora.com",
    icon: <MailIcon />,
  },
];

export default function HelpSection() {
  return (
    <section className="w-full bg-[#f4f2f5] py-16 lg:py-24">
      <div className="mx-auto grid w-[90%] grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Intro */}
        <div>
          <h2 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-[#9b4de0] lg:text-[44px]">
            Need help with your
            <br />
            application?
          </h2>
          <p className="mt-4 max-w-[560px] text-xl leading-[1.35] tracking-tight text-[#6b6672]">
            Our onboarding team is available to help with required
            documentation, BVN verification, and business setup.
          </p>
        </div>

        {/* Contact card */}
        <div className="rounded-xl bg-white p-4 sm:p-5">
          <ul>
            {contacts.map((item) => (
              <li
                key={item.id}
                className="border-b border-[#efecf1] first:pt-0"
              >
                <a
                  href={item.href}
                  className="flex items-center gap-4 py-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9b4de0]"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center text-[#a45be8]">
                    {item.icon}
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm leading-tight text-[#8b8794]">
                      {item.label}
                    </span>
                    <span className="text-lg font-medium leading-tight text-[#2b2929]">
                      {item.value}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <a
            href="/support"
            className="mt-5 flex h-20 items-center gap-4 overflow-hidden rounded-lg bg-[#9b4de0] pl-3 pr-5 text-white transition-colors hover:bg-[#8c3fd1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9b4de0]"
          >
            <Image
              src="/support-agent.png"
              alt=""
              width={56}
              height={64}
              className="mt-auto h-16 w-14 shrink-0 object-contain object-bottom"
            />
            <span className="flex flex-1 flex-col">
              <span className="text-lg font-semibold leading-tight">
                Talk to a support agent
              </span>
              <span className="text-sm leading-tight text-white/85">
                Get in touch with a 24/7 support agent to address your issue
              </span>
            </span>
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m9 6 6 6-6 6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}