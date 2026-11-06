import Image from 'next/image';

export default function AppScreenPreview() {
  return (
    <div className="ek-pocket-art">
      <Image
        src="/images/collections/app-showcase.webp"
        width={1000}
        height={854}
        sizes="(max-width:700px) 100vw, (max-width:1360px) 55vw, 713px"
        alt="EkivaMart shopping app showing categories and flash sales beneath a green and lime shop awning"
      />
    </div>
  );
}
