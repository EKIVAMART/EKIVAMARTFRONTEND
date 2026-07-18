export interface Subcategory {
  name: string;
}

export interface Category {
  slug: string;
  name: string;
  subcategories: Subcategory[];
}

// Dummy category tree. Every category shows "product_cover_image.png" inside
// the circular avatar shape used across the desktop + mobile screenshots —
// real per-category photography can replace that image later without any
// other markup changes.
export const categories: Category[] = [
  {
    slug: 'fashion',
    name: 'Fashion',
    subcategories: [
      { name: 'T-Shirts & Polo' },
      { name: 'Shirts' },
      { name: 'Jeans & Trousers' },
      { name: 'Hoodies & Sweatshirts' },
      { name: 'Jackets' },
      { name: 'Skirts' },
      { name: 'Traditional Wear' },
      { name: 'Lingerie' },
    ],
  },
  {
    slug: 'footwear',
    name: 'Foot wear',
    subcategories: [
      { name: 'Sneakers' },
      { name: 'Sandals & Slippers' },
      { name: 'Official Shoes' },
      { name: 'Boots' },
      { name: 'Sports Shoes' },
    ],
  },
  {
    slug: 'bags-luggage',
    name: 'Bags & Luggage',
    subcategories: [
      { name: 'Handbags' },
      { name: 'Backpacks' },
      { name: 'Travel Luggage' },
      { name: 'Wallets & Purses' },
    ],
  },
  {
    slug: 'jewellery-fashion-accessories',
    name: 'Jewellery & Fashion Accessories',
    subcategories: [
      { name: 'Necklaces' },
      { name: 'Earrings' },
      { name: 'Watches' },
      { name: 'Belts' },
    ],
  },
  {
    slug: 'mobile-phones-accessories',
    name: 'Mobile Phones & Accessories',
    subcategories: [
      { name: 'Smartphones' },
      { name: 'Phone Cases' },
      { name: 'Chargers & Cables' },
      { name: 'Power Banks' },
    ],
  },
  {
    slug: 'computer-accessories',
    name: 'Computer & Accessories',
    subcategories: [
      { name: 'Laptops' },
      { name: 'Keyboards & Mice' },
      { name: 'Monitors' },
      { name: 'Storage Devices' },
    ],
  },
  {
    slug: 'electronics',
    name: 'Electronics',
    subcategories: [
      { name: 'Televisions' },
      { name: 'Home Theatre' },
      { name: 'Cameras' },
      { name: 'Small Appliances' },
    ],
  },
  {
    slug: 'photography',
    name: 'Photography',
    subcategories: [
      { name: 'Cameras' },
      { name: 'Lenses' },
      { name: 'Tripods' },
      { name: 'Lighting' },
    ],
  },
  {
    slug: 'gaming',
    name: 'Gaming',
    subcategories: [
      { name: 'Consoles' },
      { name: 'Games' },
      { name: 'Controllers' },
      { name: 'Gaming Chairs' },
    ],
  },
  {
    slug: 'musical-instrument',
    name: 'Musical Instrument',
    subcategories: [
      { name: 'Guitars' },
      { name: 'Keyboards & Pianos' },
      { name: 'Drums' },
    ],
  },
  {
    slug: 'audio-equipment',
    name: 'Audio Equipment',
    subcategories: [
      { name: 'Headphones' },
      { name: 'Speakers' },
      { name: 'Microphones' },
    ],
  },
  {
    slug: 'home-appliances',
    name: 'Home Appliances',
    subcategories: [
      { name: 'Refrigerators' },
      { name: 'Washing Machines' },
      { name: 'Microwaves' },
    ],
  },
  {
    slug: 'home-kitchen',
    name: 'Home & Kitchen',
    subcategories: [
      { name: 'Cookware' },
      { name: 'Storage & Organization' },
      { name: 'Dining' },
    ],
  },
  {
    slug: 'home-decor',
    name: 'Home & Decor',
    subcategories: [
      { name: 'Wall Art' },
      { name: 'Rugs' },
      { name: 'Lighting' },
    ],
  },
  {
    slug: 'furniture',
    name: 'Furniture',
    subcategories: [
      { name: 'Living Room' },
      { name: 'Bedroom' },
      { name: 'Office' },
    ],
  },
  {
    slug: 'groceries',
    name: 'Groceries',
    subcategories: [
      { name: 'Pantry Staples' },
      { name: 'Beverages' },
      { name: 'Snacks' },
    ],
  },
  {
    slug: 'beauty-cosmetics',
    name: 'Beauty & Cosmetics',
    subcategories: [
      { name: 'Skincare' },
      { name: 'Makeup' },
      { name: 'Fragrances' },
    ],
  },
  {
    slug: 'hair-extensions',
    name: 'Hair & Extensions',
    subcategories: [
      { name: 'Wigs' },
      { name: 'Weaves' },
      { name: 'Hair Care' },
    ],
  },
];

// Quick-link chips shown inside the desktop navbar dropdown / mobile
// "Featured" panel next to the category list (see Desktop_Navbar_modal.png
// and mobile_sidebar_category_view.png).
export const featuredQuickLinks: Subcategory[] = [
  { name: 'T-Shirts & Polo' },
  { name: 'Shirts' },
  { name: 'Jeans & Trousers' },
  { name: 'Jackets' },
  { name: 'Hoodies & Sweatshirts' },
  { name: 'Skirts' },
  { name: 'Traditional Wear' },
  { name: 'Lingerie' },
];
