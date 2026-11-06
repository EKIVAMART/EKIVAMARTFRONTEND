import Image from 'next/image';
import Link from 'next/link';

const collections = [
  { title: 'The desk setup', link: 'Shop computers', slug: 'computers-accessories', image: 'workspace' },
  { title: 'The weekly shop', link: 'Shop groceries', slug: 'groceries-food', image: 'pantry' },
];

export default function CategoryPromoBanner() {
  return (
    <nav aria-label="Featured collections" className="grid gap-5">
      {collections.map(({ title, link, slug, image }) => (
        <Link
          key={slug}
          href={`/categories/${slug}`}
          className="group block overflow-hidden rounded-md border border-stone-200 bg-white text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <div className="relative aspect-[3/2] overflow-hidden">
            <Image
              src={`/images/collections/${image}.webp`}
              alt=""
              fill
              sizes="(min-width:1024px) 24vw, 100vw"
              className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.025]"
            />
          </div>
          <div className="px-4 py-4">
            <h3 className="text-xl font-semibold leading-tight tracking-tight">{title}</h3>
            <span className="mt-2 inline-block text-sm text-stone-700 underline decoration-stone-400 underline-offset-4">{link}</span>
          </div>
        </Link>
      ))}
    </nav>
  );
}
