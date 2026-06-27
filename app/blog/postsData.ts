export interface BlogSection {
  type: 'paragraph' | 'heading' | 'list' | 'quote';
  text?: string;
  items?: string[];
  author?: string;
}

export interface BlogPost {
  slug: string;
  category: string;
  tag: string;
  title: string;
  excerpt: string;
  readTime: string;
  date: string;
  gradient: string;
  accentColor: string;
  featured?: boolean;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  content: BlogSection[];
}

export const categories = ['All', 'Sellers', 'Buyers', 'Platform Updates', 'Commerce Insights'];

export const posts: BlogPost[] = [
  {
    slug: 'how-to-sell-on-faflora-and-reach-millions',
    category: 'Sellers',
    tag: 'Getting Started',
    title: 'How to Sell on Faflora and Reach Millions of Nigerian Shoppers',
    excerpt:
      'Your complete guide to setting up a vendor account, listing your first products, and building a reputation that converts browsers into loyal buyers.',
    readTime: '8 min read',
    date: 'June 5, 2026',
    gradient: 'from-[#8b0d7a] via-[#5c0060] to-[#1a0016]',
    accentColor: '#8b0d7a',
    featured: true,
    author: {
      name: 'Chinedu Okeke',
      role: 'Head of Vendor Success',
      avatar: 'CO',
    },
    content: [
      {
        type: 'paragraph',
        text: 'Nigeria\'s e-commerce landscape is expanding rapidly, and Faflora stands at the forefront of this growth. For small business owners, artisans, and established brands alike, selling online is no longer a luxury—it is a necessity. But how do you start, and more importantly, how do you stand out?',
      },
      {
        type: 'heading',
        text: 'Step 1: Creating Your Vendor Account',
      },
      {
        type: 'paragraph',
        text: 'The onboarding process on Faflora is designed to be seamless. Navigate to the Vendor Registration page and fill out your business profile. You will need your official business name, contact details, and bank account information for payouts. Once submitted, our review team typically approves accounts within 24 to 48 hours.',
      },
      {
        type: 'heading',
        text: 'Step 2: Crafting Irresistible Product Listings',
      },
      {
        type: 'paragraph',
        text: 'When listing your products, details matter. Buyers cannot touch or feel your product, so your description and imagery must do the selling for you. Keep these guidelines in mind:',
      },
      {
        type: 'list',
        items: [
          'Use clear, high-resolution photos taken under bright, natural light.',
          'Write descriptive titles containing the brand, size, color, and key material.',
          'Provide transparent pricing and list all relevant specifications.',
        ],
      },
      {
        type: 'quote',
        text: 'Your product listings are your virtual storefront window. If they look cluttered or unclear, customers will simply walk past.',
        author: 'Chinedu Okeke',
      },
      {
        type: 'heading',
        text: 'Step 3: Building Buyer Trust',
      },
      {
        type: 'paragraph',
        text: 'Trust is the ultimate currency in Nigerian e-commerce. Deliver what you promise, ship orders within 24 hours, and respond to customer queries immediately. A high vendor rating will automatically boost your visibility in search results, helping you reach millions of active buyers across the country.',
      },
    ],
  },
  {
    slug: 'top-10-product-photography-tips',
    category: 'Sellers',
    tag: 'Product Photography',
    title: 'Top 10 Product Photography Tips That Skyrocket Your Sales',
    excerpt:
      'Great photos sell products. Learn how to capture stunning images using just your phone, from lighting techniques to angle selection.',
    readTime: '6 min read',
    date: 'June 3, 2026',
    gradient: 'from-[#ff7043] via-[#e65100] to-[#1a0016]',
    accentColor: '#ff7043',
    author: {
      name: 'Amara Nwosu',
      role: 'Creative Director',
      avatar: 'AN',
    },
    content: [
      {
        type: 'paragraph',
        text: 'In the digital marketplace, visual presentation is everything. Shoppers make split-second decisions based on images. If your product photos look dark, blurry, or unprofessional, your conversion rates will suffer. Fortunately, you don\'t need an expensive DSLR camera to shoot high-converting product photos.',
      },
      {
        type: 'heading',
        text: '1. Harness the Power of Natural Light',
      },
      {
        type: 'paragraph',
        text: 'Natural sunlight is soft, balanced, and free. Set up your shooting table next to a large window. Avoid shooting under direct sunlight, which creates harsh shadows. Cloudy days or indirect window light provide the perfect diffused glow.',
      },
      {
        type: 'heading',
        text: '2. Use a Clean, Consistent Background',
      },
      {
        type: 'paragraph',
        text: 'Keep the focus entirely on your product. A solid white or light-grey backdrop works best. You can create a simple sweep using a roll of white craft paper or poster board taped to a wall and curved onto your table.',
      },
      {
        type: 'quote',
        text: 'Simplicity is the key to professional product photography. A clean backdrop tells the buyer exactly what they are getting.',
        author: 'Amara Nwosu',
      },
      {
        type: 'heading',
        text: '3. Capture Multiple Angles',
      },
      {
        type: 'paragraph',
        text: 'Shoppers want to inspect products from all sides. Include at least 4 to 5 photos showing: the front view, side view, back view, close-up details (like stitching, textures, or ports), and the product in use.',
      },
      {
        type: 'list',
        items: [
          'Show the product in scale (e.g., a handbag being held).',
          'Include close-ups of texture and packaging.',
          'Keep your camera steady to prevent motion blur.',
        ],
      },
    ],
  },
  {
    slug: 'smart-shopping-guide-faflora',
    category: 'Buyers',
    tag: 'Shopping Tips',
    title: 'The Smart Shopper\'s Guide to Getting the Best Deals on Faflora',
    excerpt:
      'Discover how to use filters, wishlist alerts, and Flash Sale notifications to never miss a bargain again.',
    readTime: '5 min read',
    date: 'June 1, 2026',
    gradient: 'from-[#00b8d9] via-[#005f73] to-[#1a0016]',
    accentColor: '#00b8d9',
    author: {
      name: 'Tunde Bello',
      role: 'Consumer Advocate',
      avatar: 'TB',
    },
    content: [
      {
        type: 'paragraph',
        text: 'Everyone loves a good deal. But on a marketplace as massive as Faflora, finding the absolute best value requires a bit of strategy. From leveraging search parameters to configuring instant alerts, here is how you can shop smart and save big.',
      },
      {
        type: 'heading',
        text: '1. Make Friends with Your Wishlist',
      },
      {
        type: 'paragraph',
        text: 'Never rush into a purchase. When you spot an item you like, add it to your wishlist. Our platform tracks price drops on wishlisted items and sends you an automatic notification when the vendor applies a discount or runs a flash sale.',
      },
      {
        type: 'heading',
        text: '2. Check Vendor Ratings and Customer Reviews',
      },
      {
        type: 'paragraph',
        text: 'Price isn\'t the only factor—reliability matters. Always scroll down to view reviews from other buyers. A vendor with a rating above 4.5 and numerous positive reviews is much more likely to deliver exactly what you expect, saving you the hassle of refunds or returns.',
      },
      {
        type: 'quote',
        text: 'A cheap product that breaks immediately is not a deal. Real value is a balance of price, quality, and vendor trust.',
        author: 'Tunde Bello',
      },
      {
        type: 'heading',
        text: '3. Use Advanced Filtering Options',
      },
      {
        type: 'paragraph',
        text: 'Don\'t scroll through thousands of irrelevant listings. Use the filter bar to sort items by price range, discount level, shipping speed, and location. Filtering by your state can drastically reduce delivery costs and transit times.',
      },
    ],
  },
  {
    slug: 'made-in-nigeria-movement',
    category: 'Commerce Insights',
    tag: 'Entrepreneurship',
    title: 'The Made-in-Nigeria Movement: How Local Creators Are Winning Online',
    excerpt:
      'Nigeria\'s handmade and artisan economy is booming. We look at the stories, trends, and data behind the rise of local commerce.',
    readTime: '9 min read',
    date: 'May 28, 2026',
    gradient: 'from-[#43a047] via-[#1b5e20] to-[#1a0016]',
    accentColor: '#43a047',
    author: {
      name: 'Yejide Alao',
      role: 'Lead Business Analyst',
      avatar: 'YA',
    },
    content: [
      {
        type: 'paragraph',
        text: 'A profound shift is occurring in Nigeria\'s retail sector. Buyers are moving away from imported consumer goods and turning their attention toward homegrown products. From fashion to skincare, organic foods, and home decor, local entrepreneurs are capturing market share by offering unique, high-quality alternatives tailored to Nigerian tastes.',
      },
      {
        type: 'heading',
        text: 'The Rise of Artisanal Brands',
      },
      {
        type: 'paragraph',
        text: 'Local manufacturing was once hindered by distribution challenges. An artisan in Aba or a leatherworker in Kano struggled to reach buyers in Lagos or Abuja. Digital marketplaces have eliminated these geographic boundaries, enabling micro-businesses to operate nationally overnight.',
      },
      {
        type: 'quote',
        text: 'The internet has democratized distribution. Now, quality and brand storytelling are what define success, not physical storefront location.',
        author: 'Yejide Alao',
      },
      {
        type: 'heading',
        text: 'Why Shoppers Support Local Commerce',
      },
      {
        type: 'paragraph',
        text: 'Our latest platform analytics point to three primary drivers of the "Made-in-Nigeria" boom:',
      },
      {
        type: 'list',
        items: [
          'Unique Customization: Local creators offer bespoke designs that mass-produced imports cannot match.',
          'Economic Pride: A growing conscious effort by consumers to support the local economy and create domestic jobs.',
          'Price Stability: Homegrown goods are less vulnerable to foreign exchange fluctuations, making them price-competitive.',
        ],
      },
      {
        type: 'paragraph',
        text: 'As logistics networks expand and digital payments become even more secure, we expect the domestic artisan economy to grow by over 35% year-on-year, solidifying its place as a cornerstone of Nigerian commerce.',
      },
    ],
  },
  {
    slug: 'faflora-2026-platform-updates',
    category: 'Platform Updates',
    tag: 'New Features',
    title: 'What\'s New on Faflora: Q2 2026 Platform Updates',
    excerpt:
      'From AI-powered recommendations to faster checkout flows — here\'s everything that launched on Faflora this quarter.',
    readTime: '4 min read',
    date: 'May 25, 2026',
    gradient: 'from-[#9d4ae3] via-[#6a0dad] to-[#1a0016]',
    accentColor: '#9d4ae3',
    author: {
      name: 'Kofi Mensah',
      role: 'VP of Product',
      avatar: 'KM',
    },
    content: [
      {
        type: 'paragraph',
        text: 'At Faflora, we continuously refine our tools to ensure buyers enjoy a frictionless shopping experience and vendors have the power to expand. This quarter, our engineering team focused on speed, personalization, and conversion rate optimization. Here is a summary of the latest features available on the platform.',
      },
      {
        type: 'heading',
        text: '1. AI-Powered Recommendation Engine',
      },
      {
        type: 'paragraph',
        text: 'We have deployed a new deep learning model that analyzes shopper preferences, browsing patterns, and historical purchases to display highly relevant product recommendations. Initial test groups showed a 22% increase in average order value and a 15% reduction in search time for buyers.',
      },
      {
        type: 'heading',
        text: '2. Express One-Tap Checkout',
      },
      {
        type: 'paragraph',
        text: 'Cart abandonment is a major challenge for online stores. To combat this, we consolidated the shipping, payment selection, and review steps into a single, intuitive layout. Returning users can now complete their purchases in under three seconds with our one-tap checkout system.',
      },
      {
        type: 'quote',
        text: 'Reducing checkout friction directly correlates with higher revenue for our sellers. Every tap saved is a potential sale captured.',
        author: 'Kofi Mensah',
      },
      {
        type: 'heading',
        text: '3. Enhanced Vendor Analytics Dashboard',
      },
      {
        type: 'paragraph',
        text: 'Sellers can now access granular insights, including traffic sources, cart addition funnels, and real-time stock alert predictions. Head over to your vendor admin page to explore the updated data representations.',
      },
    ],
  },
  {
    slug: 'understanding-vendor-analytics',
    category: 'Sellers',
    tag: 'Analytics',
    title: 'Understanding Your Vendor Analytics Dashboard: A Deep Dive',
    excerpt:
      'Revenue charts, conversion funnels, traffic sources — we break down every metric so you can turn data into decisions.',
    readTime: '7 min read',
    date: 'May 20, 2026',
    gradient: 'from-[#ffd54f] via-[#ff8f00] to-[#1a0016]',
    accentColor: '#ff8f00',
    author: {
      name: 'Yejide Alao',
      role: 'Lead Business Analyst',
      avatar: 'YA',
    },
    content: [
      {
        type: 'paragraph',
        text: 'Running a successful online store requires more than great products—it requires datacentric insights. Your Faflora vendor dashboard is packed with valuable metrics that show you exactly what is happening in your business. Let\'s explore the key performance indicators (KPIs) you should monitor.',
      },
      {
        type: 'heading',
        text: '1. The Conversion Funnel',
      },
      {
        type: 'paragraph',
        text: 'The funnel visualizes your customers\' journey in three stages: Views, Add-to-Carts, and Purchases. A bottleneck at any stage highlights a specific problem:',
      },
      {
        type: 'list',
        items: [
          'High Views but Low Add-to-Carts: Your price might be too high, or your photos and descriptions are not convincing enough.',
          'High Add-to-Carts but Low Purchases: Your delivery fees might be unexpected, or customers encountered shipping speed hurdles at checkout.',
          'Low Views: Your products need better SEO keywords, or you should consider running a Sponsored Listing campaign.',
        ],
      },
      {
        type: 'heading',
        text: '2. Traffic Sources and Search Analytics',
      },
      {
        type: 'paragraph',
        text: 'Where do your visitors come from? Our dashboard breaks down traffic by search queries, internal recommendation links, and external social media referrals. Doubling down on your top traffic channels is the fastest way to multiply sales.',
      },
      {
        type: 'quote',
        text: 'Without data, you are steering your business in the dark. Analytics turn random guesses into profitable strategies.',
        author: 'Yejide Alao',
      },
      {
        type: 'heading',
        text: '3. Customer Demographics',
      },
      {
        type: 'paragraph',
        text: 'Identify the geographic locations driving the most orders. If 70% of your sales originate in Abuja and Lagos, you can optimize your shipping logistics and target your advertising budgets specifically to those regions.',
      },
    ],
  },
  {
    slug: 'cash-on-delivery-guide-nigeria',
    category: 'Buyers',
    tag: 'Payments',
    title: 'Cash on Delivery in Nigeria: What You Need to Know Before You Shop',
    excerpt:
      'COD is one of Nigeria\'s most popular payment methods — but it has rules. Here\'s everything buyers and sellers should know.',
    readTime: '5 min read',
    date: 'May 15, 2026',
    gradient: 'from-[#26c6da] via-[#00838f] to-[#1a0016]',
    accentColor: '#26c6da',
    author: {
      name: 'Tunde Bello',
      role: 'Consumer Advocate',
      avatar: 'TB',
    },
    content: [
      {
        type: 'paragraph',
        text: 'In Nigeria\'s fast-paced e-commerce space, Cash on Delivery (COD) remains a widely preferred payment option. It provides shoppers with peace of mind, allowing them to inspect items before handing over money. However, for a transaction to go smoothly, both buyers and sellers must understand the guidelines.',
      },
      {
        type: 'heading',
        text: 'Why Cash on Delivery Exists',
      },
      {
        type: 'paragraph',
        text: 'COD bridges the trust gap. Many consumers are hesitant to pay in advance due to fears of receiving mismatched items or facing delivery challenges. With COD, the courier acts as an intermediary, collecting payment only when the package is delivered.',
      },
      {
        type: 'quote',
        text: 'COD is a temporary bridge of trust. As vendors build reputations and delivery windows shorten, digital pre-payments will naturally take over.',
        author: 'Tunde Bello',
      },
      {
        type: 'heading',
        text: 'Important Rules for Buyers',
      },
      {
        type: 'paragraph',
        text: 'To maintain a positive buyer score on Faflora, remember these guidelines when choosing COD:',
      },
      {
        type: 'list',
        items: [
          'Be available: Ensure you or your representative are at the delivery address to receive the package and make payment.',
          'Prepare funds: Have the exact cash ready, or coordinate card/bank transfer details with the delivery agent beforehand.',
          'Do not open before paying: Couriers cannot allow package contents to be used or opened prior to receipt of payment.',
        ],
      },
    ],
  },
  {
    slug: 'scaling-your-ecommerce-business-nigeria',
    category: 'Commerce Insights',
    tag: 'Business Strategy',
    title: 'Scaling Your E-Commerce Business in Nigeria: From ₦100K to ₦1M Monthly',
    excerpt:
      'Practical strategies used by top Faflora vendors to multiply their revenue — from pricing psychology to campaign timing.',
    readTime: '10 min read',
    date: 'May 10, 2026',
    gradient: 'from-[#ef5350] via-[#b71c1c] to-[#1a0016]',
    accentColor: '#ef5350',
    author: {
      name: 'Chinedu Okeke',
      role: 'Head of Vendor Success',
      avatar: 'CO',
    },
    content: [
      {
        type: 'paragraph',
        text: 'Scaling a retail business requires transitioning from manual, day-to-day operations to structured, automated systems. Many vendors hit a ceiling around ₦100,000 in monthly sales because they handle everything themselves. To reach the ₦1,000,000 milestone, you must optimize your strategy.',
      },
      {
        type: 'heading',
        text: '1. Master the Art of Product Bundling',
      },
      {
        type: 'paragraph',
        text: 'Increasing your order volume is costly; increasing your average order value (AOV) is highly profitable. Group complementary products together—such as matching accessories with a dress, or a cleanser with a serum—and offer a 10% discount on the bundle. Shoppers see the savings, and your revenue per shipment doubles.',
      },
      {
        type: 'heading',
        text: '2. Leverage Automated Marketing Tools',
      },
      {
        type: 'paragraph',
        text: 'Do not rely entirely on organic search traffic. Set aside a small, consistent advertising budget (e.g., 5% of monthly revenue) to run Sponsored Listings. Target keywords with high commercial intent to ensure your ads are shown to active buyers ready to purchase.',
      },
      {
        type: 'quote',
        text: 'Marketing is not an expense—it is an investment in acceleration. The faster you drive traffic to high-converting listings, the quicker you scale.',
        author: 'Chinedu Okeke',
      },
      {
        type: 'heading',
        text: '3. Optimize Inventory Management',
      },
      {
        type: 'paragraph',
        text: 'Nothing hurts a scaling business more than running out of stock of a bestseller. Use your vendor dashboard\'s analytics to track sales velocity. Re-order stock before inventory drops to critical levels, and maintain open communication channels with your raw material suppliers.',
      },
    ],
  },
];
