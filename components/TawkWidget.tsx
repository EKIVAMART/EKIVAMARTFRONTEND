'use client';

import Script from 'next/script';

export default function TawkWidget() {
  return (
    <>
      <Script id="tawk-init" strategy="afterInteractive">
        {`var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();`}
      </Script>
      <Script
        id="tawk-script"
        strategy="afterInteractive"
        src="https://embed.tawk.to/6a64f002846c4d1d49b062c1/1jud4j2o7"
        crossOrigin="anonymous"
      />
    </>
  );
}
