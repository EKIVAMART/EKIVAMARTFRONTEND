import Image from 'next/image';
import Link from 'next/link';

const Separator = () => <div className="h-8 w-[1px] bg-white/40 mx-2 shrink-0" />;

function VendorBlock() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col leading-tight">
        <span className="become-vendor-text text-accent-amber whitespace-nowrap md:text-3xl md:mt-3 text-xl">
          Show, Sell, Cashout
        </span>
        <Link
          href="/become-a-vendor"
          className="font-bold text-white hover:text-neutral-100 text-xs whitespace-nowrap tracking-wide md:text-lg"
        >
          Become A Vendor
        </Link>
      </div>
      <Link
        href="/become-a-vendor"
        className="flex items-center gap-1.5 rounded-lg bg-black/15 hover:bg-black/25 border border-white/10 px-3.5 py-1.5 font-bold text-white text-xs cursor-pointer transition-all"
      >
        <span className="font-normal md:text-sm text-[10px]">Sell on faflora</span>
        <Image src="/icons/ph_shopping-bag-duotone.png" alt="" width={14} height={14} className="brightness-0 invert md:w-7 md:h-7" />
      </Link>
    </div>
  );
}

function TopBarItem() {
  return (
    <div className="flex md:w-full md:justify-between shrink-0 items-center px-4 md:px-0 text-xs text-white sm:text-[13px]">
      {/* 24/7 Support */}
      <div className="flex items-center gap-2.5 md:gap-6 pr-4">
        <div className="flex flex-col leading-tight">
          <span className="font-semibold text-white md:text-lg text-[11px]">24/7 Support</span>
          <span className="text-white/75 md:text-sm text-[10px]">WhatsApp or Call</span>
        </div>
        <span className="text-sm md:text-xl font-bold tracking-wide text-white">09069910407</span>
      </div>

      <Separator />

      {/* Delivery Guaranteed */}
      <div className="flex items-center gap-2 md:gap-4 px-4">
        <Image
          src="/icons/solar_delivery-bold-duotone.png"
          alt=""
          width={28}
          height={28}
          aria-hidden
          className='md:w-10 md:h-10 w-7 h-7'
        />
        <div className="flex flex-col leading-tight">
          <span className="font-semibold text-white md:text-lg text-[11px]">Delivery Guaranteed</span>
          <span className="text-white/75 md:text-sm text-[10px]">Refund for any issues. T&C Apply</span>
        </div>
      </div>

      <Separator />

      {/* Personalized Experience */}
      <div className="flex items-center gap-3 px-4">
        <div className="flex flex-col leading-tight">
          <span className="font-semibold text-white md:text-lg text-[11px]">Personalized Experience</span>
          <span className="text-white/75 md:text-sm text-[10px]">Download faflora Mobile app</span>
        </div>
        <div className="flex items-center gap-1.5 md:gap-3 rounded-lg bg-black/15 hover:bg-black/25 border border-white/10 px-3 py-1.5 cursor-pointer text-white transition-all">
          <Image src="/icons/ri_apple-fill.png" alt="" width={12} height={12} className="brightness-0 invert md:w-7 md:h-7" />
          <Image src="/icons/bi_google-play.png" alt="" width={12} height={12} className="brightness-0 invert md:w-6 md:h-6" />
          <span className="font-normal md:text-sm text-[10px] ml-0.5">Get App</span>
        </div>
      </div>

      <Separator />

      {/* Vendor block */}
      <div className="pl-4">
        <VendorBlock />
      </div>
    </div>
  );
}

export default function TopBar() {
  return (
    <div className="w-full bg-[#9d4ae3] overflow-hidden py-3 border-b border-white/15">
      {/* Mobile: continuous marquee */}
      <div className="flex w-max animate-marquee md:hidden items-center">
        <TopBarItem />
        <div className="h-8 w-[1px] bg-white/40 mx-2 shrink-0" />
        <TopBarItem />
      </div>

      {/* Desktop: centered row */}
      <div className="mx-auto hidden max-w-screen items-center justify-center px-12 md:flex">
        <TopBarItem />
      </div>
    </div>
  );
}
