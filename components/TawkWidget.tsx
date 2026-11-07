'use client';

import { useEffect, type MouseEvent } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

const widget = '6a8ccce732c63a3448b62764/1k0r00qf1';

function ChatMascot() {
  return (
    <svg className="ek-chat-mascot" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M16 8V5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="16" cy="4.5" r="1.7" fill="currentColor" />
      <path d="M7 14H5.8a1.8 1.8 0 0 0-1.8 1.8v3.4A1.8 1.8 0 0 0 5.8 21H7m18-7h1.2a1.8 1.8 0 0 1 1.8 1.8v3.4a1.8 1.8 0 0 1-1.8 1.8H25" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 14a6 6 0 0 1 6-6h6a6 6 0 0 1 6 6v6a6 6 0 0 1-6 6h-5l-4.5 3v-4A6 6 0 0 1 7 20v-6Z" fill="currentColor" />
      <rect x="9.5" y="11" width="13" height="10" rx="4" fill="#183d27" />
      <g className="ek-chat-mascot-eyes" fill="#d9eba2">
        <rect x="12" y="14" width="2.5" height="3.5" rx="1.25" />
        <rect x="17.5" y="14" width="2.5" height="3.5" rx="1.25" />
      </g>
    </svg>
  );
}

declare global {
  interface Window {
    Tawk_API?: {
      showWidget?: () => void;
      hideWidget?: () => void;
      maximize?: () => void;
    };
  }
}

export default function TawkWidget() {
  const pathname = usePathname();
  const storefront = !/^\/(?:admin|super-admin|vendor-registration|landing)(?:\/|$)/.test(pathname)
    && !/^\/vendor\/(?:apply|application|dashboard)(?:\/|$)/.test(pathname);

  useEffect(() => {
    if (!storefront) window.Tawk_API?.hideWidget?.();
  }, [storefront]);

  if (!storefront) return null;

  function openChat(event: MouseEvent<HTMLAnchorElement>) {
    const chat = window.Tawk_API;
    if (!chat?.showWidget || !chat.maximize) return;
    event.preventDefault();
    chat.showWidget();
    chat.maximize();
  }

  return (
    <>
      <Script id="tawk-init" strategy="afterInteractive">{`
        window.Tawk_LoadStart = new Date();
        window.Tawk_API = window.Tawk_API || {};
        window.Tawk_API.onLoad = window.Tawk_API.onChatMinimized = function () {
          window.Tawk_API.hideWidget();
        };
      `}</Script>
      <Script id="tawk-script" strategy="afterInteractive" src={`https://embed.tawk.to/${widget}`} crossOrigin="anonymous" />
      <a className="ek-chat-launcher" href={`https://tawk.to/chat/${widget}`} target="_blank" rel="noopener noreferrer" aria-label="Chat with EkivaMart" onClick={openChat}>
        <span className="ek-launcher-icon"><ChatMascot /></span>
        <span>Live chat</span>
      </a>
    </>
  );
}
