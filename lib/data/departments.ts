export const departments = [
  "Fashion",
  "Footwear",
  "Bags & Luggage",
  "Jewelry & Fashion Accessories",
  "Mobile Phones & Accessories",
  "Computers & Accessories",
  "Electronics",
  "Photography & Video",
  "Gaming",
  "Musical Instruments",
  "Audio Equipment",
  "Home Appliances",
  "Home & Kitchen",
  "Home Decor",
  "Furniture",
  "Groceries & Food",
  "Beauty & Cosmetics",
  "Hair Care & Extensions",
  "Personal Care",
  "Health & Wellness",
  "Sports & Fitness",
  "Toys & Games",
  "Baby Products",
  "Pet Supplies",
  "Automotive",
  "Books & Stationery",
  "Tools & Home Improvement",
  "Garden & Outdoor",
  "Office & School Supplies",
  "Solar & Electrical"
];

const aliases: Record<string, string> = {
  'foot-wear': 'footwear',
  'jewellery-fashion-accessories': 'jewelry-fashion-accessories',
  'computer-accessories': 'computers-accessories',
  photography: 'photography-video',
  'musical-instrument': 'musical-instruments',
  groceries: 'groceries-food',
  'hair-extensions': 'hair-care-extensions',
};

export function departmentSlug(value: string) {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return aliases[slug] ?? slug;
}

export const homepageDepartments = [
  ['Fashion', 'Find your next everyday favourite.'],
  ['Footwear', 'Step into something new.'],
  ['Bags & Luggage', 'For everyday plans and journeys ahead.'],
  ['Jewelry & Fashion Accessories', 'The details that complete your look.'],
  ['Beauty & Cosmetics', 'Refresh your beauty routine.'],
  ['Groceries & Food', 'Stock up on everyday essentials.'],
  ['Home Appliances', 'Make more of life at home.'],
] as const;
