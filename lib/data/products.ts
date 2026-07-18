export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  location: string;
  vendor: string;
}

// Every card reuses "product_cover_image.png" as a placeholder — swap the
// `image` field for real product photography per item later.
function buildProducts(count: number, namePrefix: string): Product[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: `${namePrefix.toLowerCase().replace(/\s+/g, '-')}-${i + 1}`,
    name: `Royal 65" Inches QLED Google TV`,
    image: '/images/product_cover_image.png',
    price: 100230560,
    compareAtPrice: 109230560,
    discountPercent: 10,
    rating: 4.6,
    reviewCount: 500,
    location: i % 2 === 0 ? 'Ipaja, Lagos' : 'Yobe',
    vendor: 'Faflora',
  }));
}

export const flashSaleProducts: Product[] = buildProducts(10, 'flash');
export const featuredProducts: Product[] = buildProducts(10, 'featured');
export const fashionProducts: Product[] = buildProducts(10, 'fashion');
export const footwearProducts: Product[] = buildProducts(10, 'footwear');
export const bagsProducts: Product[] = buildProducts(10, 'bags');
export const jewelleryProducts: Product[] = buildProducts(10, 'jewellery');
export const mobileAccessoriesProducts: Product[] = buildProducts(10, 'mobile');
