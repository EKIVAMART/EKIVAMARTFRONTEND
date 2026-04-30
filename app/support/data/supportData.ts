// app/support/data/supportData.ts
export interface SupportArticle {
  id: string;
  slug: string;
  title: string;
  content: string;
  lastUpdated: string;
}

export interface SupportTopic {
  id: string;
  slug: string;
  title: string;
  description: string;
  articleCount: number;
  articles: SupportArticle[];
}

// Full data (you can expand articles later)
export const fafloraSupportData: SupportTopic[] = [
  // ==================== TOPIC 1: Account Creation & Verification ====================
  {
    id: "account-creation-verification",
    slug: "account-creation-verification",
    title: "Account Creation & Verification",
    description: "Learn how to create and verify your Faflora account as a buyer or seller.",
    articleCount: 12,
    articles: [
      {
        id: "1",
        slug: "how-do-i-create-a-buyer-account-on-faflora",
        title: "How do I create a buyer account on Faflora?",
        content: `# How do I create a buyer account on Faflora?\n\nCreating a buyer account on Faflora is completely free and takes less than 2 minutes.\n\n### Step-by-step guide:\n1. Visit [faflora.com](https://faflora.com) or download the Faflora app from Google Play Store.\n2. Tap on **Sign Up**.\n3. Enter your Nigerian phone number (MTN, Airtel, Glo, or 9mobile).\n4. You will receive a One-Time Password (OTP) via SMS — enter it to verify your number.\n5. Provide your full name and a valid email address.\n6. Create a strong password.\n7. Tap **Create Account**.\n\nOnce completed, you will be automatically logged in and can start browsing thousands of high-quality, locally made Nigerian products.\n\n**Pro Tip**: Use your primary phone number. This makes order tracking, delivery updates, and account recovery much easier.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "2",
        slug: "why-do-i-need-to-verify-my-phone-number-and-email",
        title: "Why do I need to verify my phone number and email?",
        content: `# Why do I need to verify my phone number and email?\n\nVerification is an important security step that helps us protect your account and provide better service.\n\n### Benefits of verification:\n- Prevents fake accounts and fraudulent activities.\n- Ensures you receive important notifications such as order confirmations, delivery updates, and tracking links.\n- Allows you to enjoy higher purchase limits and faster customer support.\n- Builds trust on the platform for both buyers and sellers.\n\nWe take your privacy and security seriously while keeping the process simple and fast.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "3",
        slug: "how-to-complete-kyc-as-a-buyer",
        title: "How to complete KYC as a buyer (Level 1 & Level 2)",
        content: `# How to complete KYC as a buyer (Level 1 & Level 2)\n\nFaflora uses a simple two-level KYC system to keep the platform safe.\n\n**Level 1 (Basic Verification)** — Done automatically during signup:\n- Phone number verification via OTP\n- Email verification\n\n**Level 2 (Full KYC)** — Recommended for frequent shoppers:\n1. Go to your **Profile** → **Verification**.\n2. Upload a valid government-issued ID (NIN Slip, Voter’s Card, Driver’s License, or International Passport).\n3. Take a quick selfie for face matching.\n4. Submit for review.\n\n**Approval usually takes 5–30 minutes.** Once approved, you unlock higher daily purchase limits and faster dispute resolution.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "4",
        slug: "cant-receive-otp-what-to-do",
        title: "I can’t receive the OTP – what should I do?",
        content: `# I can’t receive the OTP – what should I do?\n\nIf you’re not receiving the OTP, try these troubleshooting steps:\n\n1. Check your mobile network signal strength.\n2. Wait 60 seconds and request a new OTP.\n3. Make sure you entered the correct phone number.\n4. Check if your phone has any SMS blocking apps or Do Not Disturb mode enabled.\n5. Try using a different network (MTN, Airtel, Glo, 9mobile).\n6. Disable any active VPN if you’re using one.\n\nIf the problem continues, tap **Need Help?** on the signup screen or contact support through the app chat. We usually resolve OTP issues quickly.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "5",
        slug: "how-to-reset-password",
        title: "How to reset my password or recover my account",
        content: `# How to reset my password or recover my account\n\nForgot your password? No worries — resetting it is easy.\n\n### Steps:\n1. On the login page, tap **Forgot Password**.\n2. Enter the phone number or email address linked to your account.\n3. You will receive a reset code via SMS or email.\n4. Enter the code and create a new strong password.\n5. Log in with your new password.\n\nYour account data and order history will remain safe throughout the process.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "6",
        slug: "can-i-use-same-account-for-buying-and-selling",
        title: "Can I use the same account for buying and selling?",
        content: `# Can I use the same account for buying and selling?\n\n**Yes!** One Faflora account can be used for both buying and selling.\n\nAfter you create a buyer account, you can apply to become a vendor from your profile. Once your vendor application is approved, you can easily switch between **Buyer Mode** and **Seller Mode** anytime from the app menu.\n\nThis makes it convenient for users who want to both shop and sell on the platform.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "7",
        slug: "documents-needed-for-verification",
        title: "What documents are needed for full verification?",
        content: `# What documents are needed for full verification?\n\nFor **Buyer Level 2 KYC**, we require:\n- A valid government-issued ID (NIN is preferred)\n- A clear selfie for face verification\n\nFor **Vendors** (additional requirements):\n- Business registration documents (CAC certificate or Business Name registration)\n- Bank account details (BVN-linked)\n- Utility bill or proof of address\n\nAll documents are securely stored and used only for verification purposes.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "8",
        slug: "why-was-my-account-verification-rejected",
        title: "Why was my account verification rejected?",
        content: `# Why was my account verification rejected?\n\nCommon reasons for rejection include:\n- Blurry or unclear document images\n- Mismatch between selfie and ID photo\n- Expired ID document\n- Information on ID does not match the details you provided during signup\n- Using someone else’s ID\n\nYou will receive a notification explaining the exact reason. You can re-upload corrected documents immediately. Most re-submissions are approved within minutes.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "9",
        slug: "how-long-does-verification-take",
        title: "How long does verification take?",
        content: `# How long does verification take?\n\n- **Level 1 (Phone + Email)**: Instant after entering OTP.\n- **Level 2 (Full KYC)**: Usually **5 to 30 minutes** during business hours.\n- **Vendor Application**: 1 to 3 business days.\n\nYou will receive a notification as soon as your verification status changes.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "10",
        slug: "how-to-switch-from-buyer-to-vendor-account",
        title: "How to switch from buyer to vendor account",
        content: `# How to switch from buyer to vendor account\n\n1. Log into your Faflora account.\n2. Go to **Profile**.\n3. Tap **Switch to Seller** or **Become a Vendor**.\n4. Complete the vendor application form and upload required documents.\n5. Once approved, you can switch between buyer and seller modes easily from the side menu.\n\nYou can still buy products even after becoming a vendor.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "11",
        slug: "can-i-sign-up-with-google-or-apple",
        title: "Can I sign up with Google or Apple?",
        content: `# Can I sign up with Google or Apple?\n\nYes! You can sign up quickly using your Google or Apple account.\n\nSimply tap **Continue with Google** or **Continue with Apple** on the signup screen. We will still ask you to verify your phone number for security and delivery purposes.\n\nThis option is fast and secure.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "12",
        slug: "signed-up-but-cant-log-in",
        title: "I signed up but can’t log in – troubleshooting steps",
        content: `# I signed up but can’t log in – troubleshooting steps\n\nTry these steps:\n1. Make sure you’re using the correct phone number or email.\n2. Check if Caps Lock is on when typing your password.\n3. Try resetting your password using **Forgot Password**.\n4. Clear your app cache or try logging in from a different device.\n5. Ensure you have a stable internet connection.\n\nIf none of these work, use the **Help** button on the login screen to contact support directly.`,
        lastUpdated: "April 06, 2026"
      }
    ]
  },
  // ==================== TOPIC 2: Buyer Account Management ====================
  {
    id: "buyer-account-management",
    slug: "buyer-account-management",
    title: "Buyer Account Management",
    description: "Manage your profile, addresses, payment methods, and account settings.",
    articleCount: 9,
    articles: [
      {
        id: "13",
        slug: "how-to-update-profile-address-and-delivery-details",
        title: "How to update my profile, address, and delivery details",
        content: `# How to update my profile, address, and delivery details\n\nKeeping your information up to date ensures smooth delivery and better service.\n\n### Steps to update:\n1. Open the Faflora app and tap on your **Profile** (bottom right).\n2. Tap **Edit Profile**.\n3. Update your full name, phone number, or email address.\n4. Go to **My Addresses** section.\n5. Tap **Add New Address** or edit an existing one.\n6. Fill in your full address, landmark, city, and state.\n7. Mark one address as **Default Delivery Address**.\n\n**Tip**: Always include a clear landmark and phone number for the delivery person.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "14",
        slug: "how-to-change-phone-number-or-email",
        title: "How to change my phone number or email",
        content: `# How to change my phone number or email\n\n1. Go to **Profile** → **Edit Profile**.\n2. Tap on the phone number or email field you want to change.\n3. Enter the new phone number or email.\n4. Verify with the OTP sent to the **new** number/email.\n5. Once verified, the change will take effect immediately.\n\n**Note**: You may need to log in again after changing your phone number.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "15",
        slug: "how-to-delete-or-deactivate-buyer-account",
        title: "How do I delete or deactivate my buyer account?",
        content: `# How do I delete or deactivate my buyer account?\n\nWe hope you don’t leave, but if you need to:\n\n1. Go to **Profile** → **Account Settings**.\n2. Scroll down and tap **Deactivate Account** or **Delete Account**.\n3. Choose a reason for leaving.\n4. Enter your password to confirm.\n\n**Difference**:\n- **Deactivate**: Temporarily hides your account. You can reactivate anytime by logging in.\n- **Delete**: Permanently removes your account and data after 30 days.\n\nBefore deleting, make sure you have no pending orders or refunds.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "16",
        slug: "how-to-view-purchase-history",
        title: "How to view my purchase history",
        content: `# How to view my purchase history\n\n1. Tap on **Profile**.\n2. Select **My Orders**.\n3. You will see all your past and current orders.\n4. Tap on any order to see details, tracking, and invoice.\n\nYou can filter by status: All, Pending, Shipped, Delivered, Cancelled.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "17",
        slug: "how-to-manage-saved-addresses-and-payment-methods",
        title: "How to manage saved addresses and payment methods",
        content: `# How to manage saved addresses and payment methods\n\n- **Addresses**: Go to Profile → My Addresses. You can add, edit, delete, or set default.\n- **Payment Methods**: Go to Profile → Payment Methods. You can add new cards, bank accounts, or manage saved ones.\n\nWe use secure encryption for all payment information.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "18",
        slug: "why-cant-i-change-my-username",
        title: "Why can’t I change my username?",
        content: `# Why can’t I change my username?\n\nYour username is unique and permanently linked to your account for security and identification purposes. Once set during signup, it cannot be changed.\n\nYou can however change your **display name** anytime from Edit Profile.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "19",
        slug: "how-to-add-or-remove-delivery-address",
        title: "How to add or remove a delivery address",
        content: `# How to add or remove a delivery address\n\n**To add**:\n1. Profile → My Addresses → Add New Address.\n2. Fill details and save.\n\n**To remove**:\n1. Go to My Addresses.\n2. Swipe left on the address or tap the delete icon.\n\nWe recommend keeping at least one default address for faster checkout.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "20",
        slug: "account-suspended-how-to-appeal",
        title: "Account suspended – how to appeal",
        content: `# Account suspended – how to appeal\n\nIf your account is suspended, you will receive a notification with the reason.\n\nTo appeal:\n1. Tap the notification or go to Profile → Account Status.\n2. Tap **Submit Appeal**.\n3. Provide any supporting information or documents.\n4. Submit and wait for review (usually within 48 hours).\n\nCommon reasons: Multiple failed payments, dispute violations, or suspicious activity.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "21",
        slug: "how-to-download-my-data",
        title: "How to download my data (NDPR/GDPR request)",
        content: `# How to download my data (NDPR request)\n\nFaflora respects your data rights under NDPR.\n\n1. Go to **Profile** → **Account Settings** → **Privacy & Data**.\n2. Tap **Request My Data**.\n3. Select the data you want (orders, profile, etc.).\n4. Submit request.\n\nWe will prepare and send your data via email within 7 business days.`,
        lastUpdated: "April 06, 2026"
      }
    ]
  },
  // ==================== TOPIC 3: Becoming a Vendor / Seller Onboarding ====================
  {
    id: "becoming-a-vendor",
    slug: "becoming-a-vendor",
    title: "Becoming a Vendor / Seller Onboarding",
    description: "Everything you need to start selling successfully on Faflora.",
    articleCount: 18,
    articles: [
      {
        id: "22",
        slug: "how-to-register-as-a-vendor",
        title: "How to register as a vendor on Faflora",
        content: `# How to register as a vendor on Faflora\n\n1. Log into your existing Faflora account (buyer account is fine).\n2. Go to **Profile** → **Switch to Seller**.\n3. Tap **Apply to Become a Vendor**.\n4. Fill the vendor application form with your business details.\n5. Upload required documents.\n6. Submit application.\n\nOur team reviews applications within 1–3 business days. You will be notified once approved.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "23",
        slug: "documents-required-for-vendor",
        title: "What documents are required to become a verified vendor?",
        content: `# What documents are required to become a verified vendor?\n\n**For Individual / Sole Proprietor**:\n- Valid Government ID (NIN preferred)\n- BVN-linked bank account details\n- Recent utility bill or bank statement\n- Passport photograph\n\n**For Registered Business**:\n- CAC Certificate of Incorporation\n- Memorandum and Articles of Association\n- Director’s valid IDs\n- Tax Identification Number (TIN)\n- Proof of business address\n\nAll documents are reviewed securely to protect buyers and maintain platform quality.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "24",
        slug: "how-long-does-vendor-approval-take",
        title: "How long does vendor approval take?",
        content: `# How long does vendor approval take?\n\nStandard review time is **1 to 3 business days**.\n\nOnce approved, you will receive an email and in-app notification. You can then start listing products immediately.\n\nDuring peak periods, it may take up to 5 business days.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "25",
        slug: "vendor-account-rejected-common-reasons",
        title: "Vendor account rejected – common reasons and fixes",
        content: `# Vendor account rejected – common reasons and fixes\n\nCommon rejection reasons:\n- Incomplete or unclear documents\n- Mismatch between business name and documents\n- Previous policy violations on other platforms\n- Products fall under prohibited categories\n\n**Fix**: Review the rejection reason in the notification, correct the issues, and re-apply. Most re-applications are approved faster.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "26",
        slug: "how-to-set-up-my-vendor-store",
        title: "How to set up my vendor store and logo",
        content: `# How to set up my vendor store and logo\n\nAfter approval:\n1. Go to **Seller Dashboard**.\n2. Tap **Store Settings**.\n3. Upload your store logo (recommended size: 500x500px).\n4. Write a compelling store description.\n5. Add your business contact information.\n6. Save changes.\n\nA well-set-up store helps buyers trust and find you easily.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "27",
        slug: "how-to-add-first-product-listing",
        title: "How to add my first product listing",
        content: `# How to add my first product listing\n\n1. Open Seller Dashboard.\n2. Tap **Products** → **Add New Product**.\n3. Upload high-quality photos (minimum 3 recommended).\n4. Enter product name, description, price, and category.\n5. Set inventory quantity and variations if any.\n6. Publish the product.\n\nMake sure your description is detailed and honest to avoid disputes.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "28",
        slug: "vendor-commission-structure",
        title: "What is the vendor commission structure?",
        content: `# What is the vendor commission structure?\n\nFaflora charges a competitive commission rate ranging from **8% to 15%** depending on category.\n\n- Fashion & Apparel: 10%\n- Beauty & Personal Care: 12%\n- Home & Kitchen: 8%\n- Handmade & Crafts: 15%\n\nNo monthly subscription or listing fees. You only pay commission when a sale is completed.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "29",
        slug: "how-to-link-bank-account-for-payouts",
        title: "How to link my bank account for payouts",
        content: `# How to link my bank account for payouts\n\n1. Go to Seller Dashboard → **Payouts**.\n2. Tap **Add Bank Account**.\n3. Enter Account Name, Account Number, and Bank Name.\n4. Verify with OTP sent to your registered phone.\n\nPayouts are processed every Monday and Thursday.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "30",
        slug: "can-i-sell-on-multiple-categories",
        title: "Can I sell on multiple categories?",
        content: `# Can I sell on multiple categories?\n\nYes, you can sell across multiple categories once your vendor account is approved.\n\nWhen adding products, simply select the most appropriate category for each item. Popular combinations include Fashion + Beauty, Home + Kitchen, or Handmade Crafts across different sections.\n\nThis flexibility helps you grow your business without restrictions.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "31",
        slug: "how-to-get-verified-vendor-badge",
        title: "How to get the “Verified Vendor” badge",
        content: `# How to get the “Verified Vendor” badge\n\nThe Verified Vendor badge increases buyer trust and visibility.\n\nTo qualify:\n1. Complete full KYC with valid documents.\n2. Have at least 10 successfully delivered orders.\n3. Maintain a rating of 4.5 stars or higher.\n4. Have no unresolved disputes in the last 90 days.\n\nOnce you meet these criteria, the badge is automatically applied to your store.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "32",
        slug: "minimum-requirements-to-start-selling",
        title: "Minimum requirements to start selling",
        content: `# Minimum requirements to start selling\n\n- Approved vendor account\n- At least 3 high-quality product photos per listing\n- Clear product description and accurate pricing\n- Linked and verified bank account for payouts\n- Valid government ID and business details\n\nMeeting these helps you start strong and avoid delays in approval or payouts.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "33",
        slug: "how-to-manage-multiple-vendors-under-one-business",
        title: "How to manage multiple vendors under one business",
        content: `# How to manage multiple vendors under one business\n\nIf you run multiple brands or shops:\n1. Apply for each brand separately using the same business documents.\n2. Use different store names and logos for each.\n3. Link all stores to the same bank account for payouts.\n\nEach store operates independently with its own products, ratings, and performance metrics.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "34",
        slug: "vendor-dashboard-first-time-setup",
        title: "Vendor dashboard first-time setup guide",
        content: `# Vendor dashboard first-time setup guide\n\nAfter approval:\n1. Complete your store profile (logo, banner, description).\n2. Add your business contact and return policy.\n3. Set up shipping options and rates.\n4. Add your first 5–10 products.\n5. Connect your bank account for payouts.\n\nA well-set-up dashboard helps you manage orders efficiently from day one.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "35",
        slug: "how-to-upload-product-images-and-descriptions",
        title: "How to upload product images and descriptions",
        content: `# How to upload product images and descriptions\n\nBest practices:\n- Use at least 3–5 clear, well-lit photos (main image first).\n- Show different angles and details.\n- Write detailed descriptions including materials, size, care instructions, and features.\n- Be honest about condition (new, handmade, etc.).\n\nHigh-quality visuals significantly increase sales conversion.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "36",
        slug: "pricing-guidelines-for-vendors",
        title: "Pricing guidelines and rules for vendors",
        content: `# Pricing guidelines and rules for vendors\n\n- Set competitive but realistic prices.\n- Include all costs (production, packaging, shipping if applicable).\n- Clearly state if price includes delivery or not.\n- Avoid artificial inflation followed by fake discounts.\n\nFair pricing builds long-term customer loyalty and reduces disputes.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "37",
        slug: "can-i-sell-both-new-and-handmade-products",
        title: "Can I sell both new and handmade products?",
        content: `# Can I sell both new and handmade products?\n\nYes, you can sell both new factory-made and handmade/original products on Faflora.\n\nWe encourage authentic Nigerian handmade items with the “Made in Nigeria” badge. Just make sure to accurately categorize and describe each product so buyers know what they are getting.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "38",
        slug: "how-to-contact-faflora-for-vendor-support",
        title: "How to contact Faflora for vendor support",
        content: `# How to contact Faflora for vendor support\n\nVendors have priority support:\n1. Use the **Seller Dashboard** → **Support** tab.\n2. Chat directly with the vendor support team.\n3. Email vendor@faflora.com for complex issues.\n4. Call our dedicated vendor helpline (available on dashboard).\n\nResponse time for vendors is usually under 2 hours during business days.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "39",
        slug: "what-happens-after-i-am-approved-as-a-vendor",
        title: "What happens after I’m approved as a vendor?",
        content: `# What happens after I’m approved as a vendor?\n\nAfter approval you will:\n- Receive a welcome email and notification.\n- Gain access to the full Seller Dashboard.\n- Be able to start listing products immediately.\n- Appear in search results and category pages.\n- Receive your first payout once you make sales and reach the minimum threshold.\n\nWe also provide new vendors with a short onboarding guide and tips to get their first sales quickly.`,
        lastUpdated: "April 06, 2026"
      }
    ]
  },

  // ==================== TOPIC 4: Browsing & Purchasing ====================
  {
    id: "browsing-purchasing",
    slug: "browsing-purchasing",
    title: "Browsing & Purchasing",
    description: "Tips and guides for finding and buying products on Faflora.",
    articleCount: 11,
    articles: [
      {
        id: "40",
        slug: "how-to-search-and-filter-products-effectively",
        title: "How to search and filter products effectively",
        content: `# How to search and filter products effectively\n\n1. Use the search bar at the top — be specific (e.g. “Ankara gown Lagos”).\n2. Apply filters: Price range, Location, Category, Rating, Vendor type.\n3. Use “Made in Nigeria” filter to support local creators.\n4. Sort by “Best Match”, “Price: Low to High”, or “Customer Rating”.\n\nGood filters help you find exactly what you need faster.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "41",
        slug: "what-does-made-in-nigeria-badge-mean",
        title: "What does “Made in Nigeria” badge mean?",
        content: `# What does “Made in Nigeria” badge mean?\n\nThis badge is awarded to products that are designed, produced, or significantly assembled in Nigeria by local vendors.\n\nIt highlights authentic Nigerian creativity and helps buyers easily discover and support local businesses.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "42",
        slug: "how-to-save-items-to-wishlist",
        title: "How to save items to wishlist",
        content: `# How to save items to wishlist\n\n1. Open any product page.\n2. Tap the heart icon at the top right.\n3. The item is now saved in your Wishlist.\n4. Access your wishlist anytime from Profile → Wishlist.\n\nWishlist helps you save items for later and track price changes.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "43",
        slug: "how-to-contact-a-seller-before-buying",
        title: "How to contact a seller before buying",
        content: `# How to contact a seller before buying\n\n1. Open the product page.\n2. Scroll down to “Seller Information”.\n3. Tap **Message Seller**.\n4. Ask your questions directly (size, color, customization, etc.).\n\nMost sellers respond within a few hours.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "44",
        slug: "why-is-a-product-showing-as-out-of-stock",
        title: "Why is a product showing as “Out of stock”?",
        content: `# Why is a product showing as “Out of stock”?\n\nThis means the vendor has temporarily run out of stock.\n\nYou can:\n- Add it to your wishlist to get notified when it’s back in stock.\n- Message the seller to ask when restock is expected.\n- Check similar products from other vendors.\n\nVendors are encouraged to update stock levels regularly.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "45",
        slug: "how-does-recommendation-engine-work",
        title: "How does the recommendation engine work?",
        content: `# How does the recommendation engine work?\n\nFaflora shows personalized recommendations based on:\n- Your browsing and purchase history\n- Similar buyer behavior\n- Product popularity and ratings\n- Your location and preferences\n\nThe more you shop and rate products, the better our recommendations become.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "46",
        slug: "can-i-buy-from-multiple-vendors-in-one-order",
        title: "Can I buy from multiple vendors in one order?",
        content: `# Can I buy from multiple vendors in one order?\n\nYes! Faflora supports **multi-vendor checkout**.\n\nYou can add products from different sellers to your cart and complete them in a single order. Each vendor ships their items separately, and you may receive multiple delivery packages.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "47",
        slug: "how-to-use-discount-codes-and-promo-offers",
        title: "How to use discount codes and promo offers",
        content: `# How to use discount codes and promo offers\n\n1. Add items to your cart.\n2. On the checkout page, look for “Have a promo code?”.\n3. Enter the code and tap Apply.\n4. The discount will be reflected in the total.\n\nPromo codes are occasionally sent via email or shown on the homepage.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "48",
        slug: "what-payment-options-are-available",
        title: "What payment options are available?",
        content: `# What payment options are available?\n\nFaflora supports:\n- Card payments (Visa, Mastercard, Verve)\n- Bank transfers\n- Wallet balance\n- Cash on Delivery (available in select cities)\n- Paystack and Flutterwave secure gateways\n\nAll payments are encrypted and secure.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "49",
        slug: "how-to-track-price-drops",
        title: "How to track price drops on items",
        content: `# How to track price drops on items\n\n1. Add the product to your Wishlist.\n2. Enable “Notify me on price drop” if available.\n3. You will receive a notification when the price decreases.\n\nThis feature helps you buy at the best price.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "50",
        slug: "why-cant-i-see-some-products-in-my-location",
        title: "Why can’t I see some products in my location?",
        content: `# Why can’t I see some products in my location?\n\nSome vendors only ship to certain states or cities to keep delivery fast and affordable.\n\nYou can:\n- Change your delivery address in profile.\n- Use the “Ships to my location” filter.\n- Contact the seller to ask if they can deliver to your area.\n\nWe are constantly expanding delivery coverage across Nigeria.`,
        lastUpdated: "April 06, 2026"
      }
    ]
  },
  // ==================== TOPIC 5: Orders & Tracking ====================
  {
    id: "orders-tracking",
    slug: "orders-tracking",
    title: "Orders & Tracking",
    description: "Everything about placing, managing, and tracking your orders.",
    articleCount: 14,
    articles: [
      {
        id: "51",
        slug: "how-to-view-all-my-orders",
        title: "How to view all my orders",
        content: `# How to view all my orders\n\n1. Open the Faflora app and go to your **Profile**.\n2. Tap **My Orders**.\n3. You will see a list of all your orders with their current status.\n4. Use the tabs to filter: All, Pending, Shipped, Delivered, Cancelled.\n\nTap any order to see detailed information including items, total amount, and tracking details.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "52",
        slug: "how-do-i-track-my-order-in-real-time",
        title: "How do I track my order in real time?",
        content: `# How do I track my order in real time?\n\n1. Go to **My Orders** and tap on the specific order.\n2. Scroll to the **Tracking** section.\n3. You will see real-time updates with estimated delivery date and current location of your package.\n4. Some orders also show courier partner name and tracking number.\n\nNotifications are sent automatically when the status changes.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "53",
        slug: "what-does-each-order-status-mean",
        title: "What does each order status mean?",
        content: `# What does each order status mean?\n\n- **Pending**: Order placed but not yet confirmed by seller.\n- **Confirmed**: Seller has accepted and is preparing your order.\n- **Shipped**: Package has been handed over to the courier.\n- **Out for Delivery**: Courier is delivering to your address.\n- **Delivered**: Order successfully delivered.\n- **Cancelled**: Order was cancelled by you or the seller.\n\nUnderstanding these helps you know what to expect at each stage.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "54",
        slug: "order-is-delayed-what-should-i-do",
        title: "Order is delayed – what should I do?",
        content: `# Order is delayed – what should I do?\n\n1. Check the tracking information in **My Orders**.\n2. If it’s been more than 2 days past the estimated delivery, tap **Contact Seller** or **Need Help?**.\n3. You can also open a dispute if necessary.\n\nMost delays are resolved quickly once the seller or courier is contacted.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "55",
        slug: "how-to-cancel-an-order-before-it-ships",
        title: "How to cancel an order before it ships",
        content: `# How to cancel an order before it ships\n\n1. Go to **My Orders**.\n2. Select the order you want to cancel.\n3. Tap **Cancel Order** (available only if status is Pending or Confirmed).\n4. Choose a reason and confirm.\n\nRefunds for cancelled orders are usually processed within 3–5 business days.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "56",
        slug: "why-is-my-order-split-into-multiple-packages",
        title: "Why is my order split into multiple packages?",
        content: `# Why is my order split into multiple packages?\n\nWhen you buy from different vendors in one cart, each seller ships their items separately to ensure faster delivery.\n\nYou may receive 2 or more packages. Each package will have its own tracking information in your order details.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "57",
        slug: "how-to-change-delivery-address-after-ordering",
        title: "How to change delivery address after ordering",
        content: `# How to change delivery address after ordering\n\nIf the order is still in **Pending** or **Confirmed** status:\n1. Go to the order details.\n2. Tap **Change Delivery Address**.\n3. Select or add a new address.\n\nNote: Once the order is shipped, the address cannot be changed.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "58",
        slug: "how-long-does-delivery-usually-take",
        title: "How long does delivery usually take?",
        content: `# How long does delivery usually take?\n\n- Lagos & major cities: 1–3 business days\n- Other South-West & South-South: 2–5 business days\n- North & far locations: 4–7 business days\n\nDelivery time depends on the seller’s location and chosen courier. Express options may be available at checkout for some products.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "59",
        slug: "i-received-the-wrong-item-next-steps",
        title: "I received the wrong item – next steps",
        content: `# I received the wrong item – next steps\n\n1. Do not dispose of the item.\n2. Take clear photos of the received item and packaging.\n3. Go to the order details and tap **Report Issue**.\n4. Select “Wrong Item” and upload evidence.\n5. Our team will review and guide you on return or refund.\n\nMost cases are resolved in favor of the buyer when evidence is provided.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "60",
        slug: "how-to-contact-the-seller-about-my-order",
        title: "How to contact the seller about my order",
        content: `# How to contact the seller about my order\n\n1. Go to **My Orders** → select the order.\n2. Tap **Message Seller**.\n3. Type your message and send.\n\nSellers are required to respond within 24 hours. This is the fastest way to resolve order-specific questions.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "61",
        slug: "can-i-combine-orders-from-different-vendors",
        title: "Can I combine orders from different vendors?",
        content: `# Can I combine orders from different vendors?\n\nUnfortunately, orders from different vendors cannot be combined into one package because each seller handles their own fulfillment.\n\nHowever, you can still checkout multiple vendors in one transaction for convenience.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "62",
        slug: "order-marked-as-delivered-but-i-havent-received-it",
        title: "Order marked as delivered but I haven’t received it",
        content: `# Order marked as delivered but I haven’t received it\n\n1. Check with neighbors or security if the package was left with them.\n2. Go to the order and tap **Mark as Not Received**.\n3. Upload any supporting evidence if available.\n4. Our support team will investigate with the courier.\n\nMost cases are resolved quickly with a refund or replacement.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "63",
        slug: "how-to-download-order-invoice",
        title: "How to download order invoice/receipt",
        content: `# How to download order invoice/receipt\n\n1. Go to **My Orders**.\n2. Select the completed order.\n3. Tap **Download Invoice** or **View Receipt**.\n4. The PDF will download to your device.\n\nThis is useful for business records or warranty claims.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "64",
        slug: "bulk-ordering-for-businesses",
        title: "Bulk ordering for businesses – how it works",
        content: `# Bulk ordering for businesses – how it works\n\nBusinesses can request bulk orders by:\n1. Contacting the seller directly via message.\n2. Mentioning quantity needed and delivery timeline.\n3. Some vendors offer special pricing for wholesale.\n\nFor very large orders, you can also email support@faflora.com for assistance in coordinating with multiple vendors.`,
        lastUpdated: "April 06, 2026"
      }
    ]
  },

  // ==================== TOPIC 6: Payments, Refunds & Withdrawals ====================
  {
    id: "payments-refunds-withdrawals",
    slug: "payments-refunds-withdrawals",
    title: "Payments, Refunds & Withdrawals",
    description: "All about making payments, getting refunds, and receiving payouts.",
    articleCount: 16,
    articles: [
      {
        id: "65",
        slug: "what-payment-methods-does-faflora-accept",
        title: "What payment methods does Faflora accept?",
        content: `# What payment methods does Faflora accept?\n\nFaflora supports secure payments through:\n- Debit/Credit Cards (Visa, Mastercard, Verve)\n- Bank Account transfers via Paystack/Flutterwave\n- Mobile Money / USSD\n- Wallet balance\n- Cash on Delivery (in selected cities)\n\nAll transactions are protected with industry-standard encryption.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "66",
        slug: "why-was-my-card-declined",
        title: "Why was my card declined?",
        content: `# Why was my card declined?\n\nCommon reasons include:\n- Insufficient funds\n- Card limit exceeded\n- Incorrect card details (CVV, expiry date)\n- Bank temporarily blocking online transactions\n- International transaction restrictions (if applicable)\n\nTry another card or contact your bank to enable online payments.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "67",
        slug: "how-safe-is-my-payment-information",
        title: "How safe is my payment information?",
        content: `# How safe is my payment information?\n\nFaflora does **not** store your full card details. All payments are processed securely by Paystack and Flutterwave using 256-bit SSL encryption and PCI-DSS compliance.\n\nYou can also enable additional security like PIN or biometric authentication on your bank app.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "68",
        slug: "how-to-request-a-refund",
        title: "How to request a refund",
        content: `# How to request a refund\n\n1. Go to **My Orders** and select the order.\n2. Tap **Request Refund** or **Report Issue**.\n3. Choose the reason (wrong item, damaged, not as described, etc.).\n4. Upload clear photos as evidence.\n5. Submit the request.\n\nRefunds are reviewed within 48 hours.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "69",
        slug: "when-will-my-refund-be-processed",
        title: "When will my refund be processed?",
        content: `# When will my refund be processed?\n\n- Card refunds: 3–7 business days\n- Bank transfer refunds: 2–5 business days\n- Wallet refunds: Usually instant or within 24 hours\n\nYou will receive a notification once the refund is initiated.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "70",
        slug: "how-long-do-refunds-take-to-appear",
        title: "How long do refunds take to appear in my account?",
        content: `# How long do refunds take to appear in my account?\n\nRefund timelines depend on your payment method:\n- Wallet: Immediate\n- Card: 3–10 business days (depending on your bank)\n- Bank transfer: 2–7 business days\n\nPlease check with your bank if it takes longer than expected.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "71",
        slug: "how-do-vendor-payouts-work",
        title: "How do vendor payouts work?",
        content: `# How do vendor payouts work?\n\nAfter a successful delivery and refund window (usually 7 days), the amount (minus commission) is transferred to your linked bank account.\n\nPayouts are processed twice a week (Mondays and Thursdays). You can track payout history in your Seller Dashboard.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "72",
        slug: "minimum-payout-threshold-for-sellers",
        title: "Minimum payout threshold for sellers",
        content: `# Minimum payout threshold for sellers\n\nThe minimum amount for automatic payout is ₦5,000.\n\nAny balance below ₦5,000 will remain in your wallet until it reaches the threshold or you request a manual payout.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "73",
        slug: "why-is-my-payout-delayed",
        title: "Why is my payout delayed?",
        content: `# Why is my payout delayed?\n\nPossible reasons:\n- Pending deliveries still in refund window\n- High number of open disputes\n- Bank account verification issues\n- Public holidays or weekends\n\nYou can check payout status in Seller Dashboard → Payouts.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "74",
        slug: "how-to-add-or-change-payout-bank-account",
        title: "How to add or change my payout bank account",
        content: `# How to add or change my payout bank account\n\n1. Go to Seller Dashboard → **Payout Settings**.\n2. Tap **Manage Bank Account**.\n3. Enter new account details.\n4. Verify with OTP.\n\nChanges usually take effect within 24 hours.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "75",
        slug: "can-i-pay-with-cash-on-delivery",
        title: "Can I pay with cash on delivery?",
        content: `# Can I pay with cash on delivery?\n\nYes, Cash on Delivery (COD) is available in selected major cities and towns.\n\nThis option appears at checkout when available for your delivery address. A small service fee may apply for COD orders.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "76",
        slug: "how-to-use-wallet-balance",
        title: "How to use wallet balance",
        content: `# How to use wallet balance\n\nYour Faflora Wallet holds refunds and promotional credits.\n\nAt checkout, your wallet balance is automatically applied first. You can also manually add money to your wallet from the Profile section.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "77",
        slug: "failed-payment-how-to-retry",
        title: "Failed payment – how to retry",
        content: `# Failed payment – how to retry\n\n1. Go to **My Orders**.\n2. Find the order with “Payment Failed” status.\n3. Tap **Retry Payment**.\n4. Choose a different payment method if needed.\n\nThe order will remain reserved for a short time while you retry.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "78",
        slug: "transaction-fees-explained",
        title: "Transaction fees explained",
        content: `# Transaction fees explained\n\n- Platform commission: 8–15% (paid by seller)\n- Payment gateway fee: Usually 1.5% + ₦100 (included in total at checkout)\n- Cash on Delivery fee: Small additional charge (shown at checkout)\n\nBuyers only see the final amount with all fees included.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "79",
        slug: "how-to-dispute-a-charge",
        title: "How to dispute a charge",
        content: `# How to dispute a charge\n\n1. Go to the order in My Orders.\n2. Tap **Report Issue**.\n3. Select the appropriate reason and provide evidence.\n4. Submit the dispute.\n\nOur team reviews all disputes fairly and usually responds within 48–72 hours.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "80",
        slug: "can-i-get-an-instant-refund",
        title: "Can I get an instant refund?",
        content: `# Can I get an instant refund?\n\nInstant refunds are available when:\n- You paid using Faflora Wallet\n- The seller agrees to an immediate refund\n- The order was cancelled before shipping\n\nFor card payments, refunds follow standard bank processing times.`,
        lastUpdated: "April 06, 2026"
      }
    ]
  },
  // ==================== TOPIC 7: Delivery & Shipping ====================
  {
    id: "delivery-shipping",
    slug: "delivery-shipping",
    title: "Delivery & Shipping",
    description: "Everything you need to know about delivery times, costs, and tracking.",
    articleCount: 13,
    articles: [
      {
        id: "81",
        slug: "how-does-faflora-delivery-work",
        title: "How does Faflora delivery work?",
        content: `# How does Faflora delivery work?\n\nFaflora partners with reliable local courier services across Nigeria. When you place an order:\n\n1. The seller prepares and packages your item.\n2. The package is handed over to our courier partner.\n3. You receive real-time tracking updates via the app.\n4. The courier delivers to your provided address.\n\nMultiple vendors = multiple packages is normal.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "82",
        slug: "what-areas-do-you-deliver-to",
        title: "What areas do you deliver to?",
        content: `# What areas do you deliver to?\n\nWe currently deliver to **all 36 states** in Nigeria, including major cities and many rural areas.\n\nDelivery coverage is expanding rapidly. Some remote locations may have longer delivery times. You can check delivery availability by adding items to cart and entering your address at checkout.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "83",
        slug: "how-much-does-shipping-cost",
        title: "How much does shipping cost?",
        content: `# How much does shipping cost?\n\nShipping cost depends on:\n- Seller’s location\n- Your delivery address\n- Weight and size of the package\n- Chosen delivery speed\n\nShipping fees are clearly shown at checkout before you pay. Some sellers offer free shipping on orders above a certain amount.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "84",
        slug: "can-i-choose-express-delivery",
        title: "Can I choose express delivery?",
        content: `# Can I choose express delivery?\n\nYes, Express Delivery is available for many products and locations.\n\nAt checkout, look for the **Express** option. It usually costs more but reduces delivery time significantly (often 1–2 days in major cities). Availability depends on the seller and your location.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "85",
        slug: "why-is-my-delivery-taking-longer-than-expected",
        title: "Why is my delivery taking longer than expected?",
        content: `# Why is my delivery taking longer than expected?\n\nPossible reasons:\n- High order volume during peak periods\n- Delay from the seller in handing over to courier\n- Weather conditions or logistics challenges\n- Remote delivery location\n\nCheck tracking for latest updates or contact the seller/courier for clarification.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "86",
        slug: "how-to-track-my-parcel-with-the-courier",
        title: "How to track my parcel with the courier",
        content: `# How to track my parcel with the courier\n\n1. Go to **My Orders** → select your order.\n2. In the Tracking section, you will see the courier name and tracking number.\n3. Tap the tracking number to open it in the courier’s website or app.\n\nYou can also track directly in the Faflora app for most orders.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "87",
        slug: "what-happens-if-im-not-home-during-delivery",
        title: "What happens if I’m not home during delivery?",
        content: `# What happens if I’m not home during delivery?\n\nThe courier will usually:\n- Attempt delivery up to 2 times\n- Leave a note or call you\n- Return the package to the nearest pickup point\n\nYou can then schedule a redelivery or pick it up yourself. Always provide a working phone number for smooth delivery.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "88",
        slug: "partner-courier-services-we-use",
        title: "Partner courier services we use",
        content: `# Partner courier services we use\n\nFaflora works with trusted partners including:\n- GIG Logistics\n- DHL Express\n- UPS Nigeria\n- Local courier partners in different states\n\nThe specific courier for your order is shown in the tracking details.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "89",
        slug: "is-international-shipping-available",
        title: "International shipping – is it available?",
        content: `# International shipping – is it available?\n\nCurrently, Faflora delivers **only within Nigeria**.\n\nWe are focused on supporting local Nigerian vendors and fast domestic delivery. International shipping is not yet available but is being considered for the future.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "90",
        slug: "how-to-change-delivery-date-or-time",
        title: "How to change delivery date or time",
        content: `# How to change delivery date or time\n\nIf the order is still in **Confirmed** or **Shipped** status:\n1. Go to the order details.\n2. Tap **Modify Delivery**.\n3. Select a preferred date or time window if available.\n\nOnce the package is out for delivery, changes may no longer be possible.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "91",
        slug: "damaged-package-on-arrival",
        title: "Damaged package on arrival – what to do",
        content: `# Damaged package on arrival – what to do\n\n1. Do not accept the package if heavily damaged.\n2. Take clear photos of the package and damage before opening.\n3. Immediately report it in the app under the order → **Report Issue**.\n4. Select “Damaged on Arrival” and upload photos.\n\nOur team will assist with return or refund.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "92",
        slug: "how-to-schedule-a-pickup-for-returns",
        title: "How to schedule a pickup for returns",
        content: `# How to schedule a pickup for returns\n\n1. Go to the order and start a return request.\n2. Choose “Return via Pickup”.\n3. Select a convenient date and time.\n4. A courier will come to your address to collect the item.\n\nMake sure the item is properly packaged before pickup.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "93",
        slug: "delivery-to-rural-areas-or-villages",
        title: "Delivery to rural areas or villages",
        content: `# Delivery to rural areas or villages\n\nWe deliver to many rural areas and villages across Nigeria.\n\nDelivery to remote locations may take longer (5–10 days) and sometimes requires pickup from a nearby town. Enter your exact address at checkout to see available options and estimated time.`,
        lastUpdated: "April 06, 2026"
      }
    ]
  },

  // ==================== TOPIC 8: Returns, Refunds & Disputes ====================
  {
    id: "returns-refunds-disputes",
    slug: "returns-refunds-disputes",
    title: "Returns, Refunds & Disputes",
    description: "How to return items, request refunds, and resolve issues with sellers.",
    articleCount: 15,
    articles: [
      {
        id: "94",
        slug: "what-is-faflora-return-policy",
        title: "What is Faflora return policy?",
        content: `# What is Faflora return policy?\n\nFaflora offers a **7-day return window** for most items from the date of delivery.\n\nReturns are accepted if the item is unused, in original condition, and with all tags intact. Some categories like underwear, custom-made, or perishable items are non-returnable. Always check the product page for specific return rules.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "95",
        slug: "how-to-start-a-return",
        title: "How to start a return",
        content: `# How to start a return\n\n1. Go to **My Orders** and select the delivered order.\n2. Tap **Return Item**.\n3. Choose the item(s) you want to return and select a reason.\n4. Upload clear photos of the item.\n5. Submit the return request.\n\nYou will receive confirmation and instructions for returning the item.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "96",
        slug: "how-many-days-do-i-have-to-return-an-item",
        title: "How many days do I have to return an item?",
        content: `# How many days do I have to return an item?\n\nYou have **7 calendar days** from the date you received the item to start a return.\n\nAfter 7 days, returns are generally not accepted unless the item is faulty or significantly different from the description.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "97",
        slug: "what-items-are-non-returnable",
        title: "What items are non-returnable?",
        content: `# What items are non-returnable?\n\nNon-returnable items include:\n- Underwear and intimate apparel\n- Custom-made or personalized products\n- Perishable food items\n- Opened beauty and skincare products\n- Digital downloads\n\nAlways check the product page for return eligibility before purchase.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "98",
        slug: "how-to-print-a-return-label",
        title: "How to print a return label",
        content: `# How to print a return label\n\n1. After your return request is approved, go to the order details.\n2. Tap **Download Return Label**.\n3. Print the label and attach it securely to the package.\n4. Schedule a pickup or drop off at the designated point.\n\nIf you can’t print, the courier can sometimes generate a digital label.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "99",
        slug: "return-approved-but-no-refund-yet",
        title: "Return approved but I haven’t received refund",
        content: `# Return approved but I haven’t received refund\n\nOnce the returned item reaches the seller and is inspected:\n- Refund is usually processed within 48 hours.\n- Card refunds take 3–7 business days to reflect.\n- Wallet refunds are faster.\n\nYou can track the refund status in the order details.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "100",
        slug: "how-to-open-a-dispute-with-a-seller",
        title: "How to open a dispute with a seller",
        content: `# How to open a dispute with a seller\n\n1. Go to the order in **My Orders**.\n2. Tap **Open Dispute**.\n3. Select the issue (wrong item, damaged, not as described, etc.).\n4. Provide detailed explanation and upload evidence (photos/videos).\n5. Submit the dispute.\n\nFaflora mediation team will review and help resolve it fairly.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "101",
        slug: "dispute-resolution-timeline",
        title: "Dispute resolution timeline",
        content: `# Dispute resolution timeline\n\n- Initial review: Within 48 hours\n- Seller response period: 3–5 business days\n- Final decision by Faflora: Usually within 7–10 days from opening the dispute\n\nYou will receive regular updates via notification and email.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "102",
        slug: "what-happens-after-a-dispute-is-raised",
        title: "What happens after a dispute is raised?",
        content: `# What happens after a dispute is raised?\n\n1. The seller is notified and given time to respond.\n2. Faflora reviews all evidence from both sides.\n3. A fair resolution is proposed (refund, replacement, or partial refund).\n4. Both parties are notified of the decision.\n\nMost disputes are resolved in favor of the buyer when clear evidence is provided.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "103",
        slug: "seller-is-not-responding-what-next",
        title: "Seller is not responding – what next?",
        content: `# Seller is not responding – what next?\n\nIf the seller doesn’t respond within the given time:\n1. The dispute automatically escalates to Faflora support team.\n2. We will review the case based on your evidence.\n3. A decision will be made, usually in the buyer’s favor if evidence is strong.\n\nYou don’t need to do anything extra — just wait for our update.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "104",
        slug: "how-to-escalate-a-dispute",
        title: "How to escalate a dispute",
        content: `# How to escalate a dispute\n\nIf you’re not satisfied with the initial resolution:\n1. Go to the dispute details.\n2. Tap **Escalate Dispute**.\n3. Provide additional comments or evidence.\n4. Our senior support team will review the case again.\n\nEscalation is usually resolved within 3–5 business days.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "105",
        slug: "refund-vs-replacement-which-is-faster",
        title: "Refund vs replacement – which is faster?",
        content: `# Refund vs replacement – which is faster?\n\n**Refund** is generally faster because it only requires inspection of the returned item.\n\n**Replacement** takes longer as the seller must prepare and ship a new item.\n\nChoose refund if you no longer want the product; choose replacement if you still want the correct item.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "106",
        slug: "can-i-return-a-used-or-opened-item",
        title: "Can I return a used or opened item?",
        content: `# Can I return a used or opened item?\n\nGenerally, **no**. Returns are only accepted for unused items in original condition.\n\nExceptions may be made for defective or significantly misrepresented items. In such cases, provide strong evidence (photos, videos) when submitting the return request.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "107",
        slug: "return-window-for-handmade-custom-products",
        title: "Return window for handmade/custom products",
        content: `# Return window for handmade/custom products\n\nHandmade and custom-made products have a shorter return window (usually 3 days) and stricter conditions.\n\nReturns are accepted only if the item has a clear manufacturing defect or does not match the agreed specifications. Always confirm return policy on the product page before buying.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "108",
        slug: "how-to-upload-proof-for-a-dispute",
        title: "How to upload proof for a dispute",
        content: `# How to upload proof for a dispute\n\nWhen opening or responding to a dispute:\n1. Tap the **Upload Evidence** button.\n2. Select clear photos or short videos.\n3. Add captions describing what each image shows.\n4. Submit.\n\nGood quality evidence significantly improves the chances of a favorable resolution.`,
        lastUpdated: "April 06, 2026"
      }
    ]
  },
  // ==================== TOPIC 9: Security, Fraud & Privacy ====================
  {
    id: "security-fraud-privacy",
    slug: "security-fraud-privacy",
    title: "Security, Fraud & Privacy",
    description: "How we protect your account, data, and help you stay safe on Faflora.",
    articleCount: 10,
    articles: [
      {
        id: "109",
        slug: "how-does-faflora-protect-my-data",
        title: "How does Faflora protect my data?",
        content: `# How does Faflora protect my data?\n\nWe take your privacy seriously and are fully NDPR compliant.\n\n- All data is encrypted in transit and at rest\n- We only collect information necessary to provide our service\n- Access to personal data is strictly limited to authorized personnel\n- You can request your data or deletion at any time\n\nYour trust is the foundation of our marketplace.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "110",
        slug: "how-to-spot-and-report-fake-vendors",
        title: "How to spot and report fake vendors",
        content: `# How to spot and report fake vendors\n\nRed flags include:\n- Extremely low prices compared to market rate\n- Very few reviews or suspiciously perfect ratings\n- Poor quality product images\n- Seller avoids communication\n\nTo report: Go to the seller’s store or product page → Tap **Report Seller** → Select reason and submit. Our team investigates promptly.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "111",
        slug: "i-think-ive-been-scammed-what-should-i-do",
        title: "I think I’ve been scammed – what should I do?",
        content: `# I think I’ve been scammed – what should I do?\n\n1. Immediately open a dispute on the order with clear evidence.\n2. Do not make payment outside the Faflora platform.\n3. Report the seller through the app.\n4. Contact support@faflora.com with order details.\n\nWe take fraud very seriously and will investigate and take action against fraudulent vendors.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "112",
        slug: "how-to-enable-two-factor-authentication",
        title: "How to enable two-factor authentication (2FA)",
        content: `# How to enable two-factor authentication (2FA)\n\n1. Go to **Profile** → **Security Settings**.\n2. Tap **Two-Factor Authentication**.\n3. Choose SMS or Authenticator App.\n4. Follow the prompts to set it up.\n\nWe strongly recommend enabling 2FA to keep your account secure.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "113",
        slug: "suspicious-activity-on-my-account",
        title: "Suspicious activity on my account",
        content: `# Suspicious activity on my account\n\nIf you notice unusual logins or activity:\n1. Immediately change your password.\n2. Enable 2FA if not already active.\n3. Go to **Security Settings** → **Sign out all other devices**.\n4. Contact support to report the issue.\n\nWe will help secure your account and investigate.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "114",
        slug: "how-to-report-a-fraudulent-listing",
        title: "How to report a fraudulent listing",
        content: `# How to report a fraudulent listing\n\n1. Open the suspicious product.\n2. Scroll down and tap **Report this Product**.\n3. Choose the reason (fake item, misleading description, etc.).\n4. Add any supporting details.\n\nOur moderation team reviews all reports and takes appropriate action.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "115",
        slug: "is-my-payment-information-safe",
        title: "Is my payment information safe?",
        content: `# Is my payment information safe?\n\nYes. Faflora does not store your full card details. Payments are securely processed by licensed partners (Paystack and Flutterwave) using bank-level encryption. We only see confirmation of successful payment.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "116",
        slug: "privacy-policy-summary-for-buyers-and-sellers",
        title: "Privacy policy summary for buyers and sellers",
        content: `# Privacy policy summary for buyers and sellers\n\nWe collect only necessary information (name, contact, address, payment confirmation).\nWe never sell your data to third parties.\nYou can request access, correction, or deletion of your data anytime.\nVendors only see buyer information needed for order fulfillment and shipping.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "117",
        slug: "how-we-verify-vendors-to-prevent-fraud",
        title: "How we verify vendors to prevent fraud",
        content: `# How we verify vendors to prevent fraud\n\nAll vendors must:\n- Submit valid government ID and business documents\n- Link a BVN-verified bank account\n- Pass manual review by our team\n- Maintain good performance after approval\n\nThis rigorous process helps protect buyers from fraudulent sellers.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "118",
        slug: "what-to-do-if-your-account-is-hacked",
        title: "What to do if your account is hacked",
        content: `# What to do if your account is hacked\n\n1. Change your password immediately from another device.\n2. Enable 2FA.\n3. Sign out all other sessions from Security Settings.\n4. Contact support@faflora.com with details of suspicious activity.\n5. We will help secure your account and review recent transactions.`,
        lastUpdated: "April 06, 2026"
      }
    ]
  },

  // ==================== TOPIC 10: App & Technical Issues ====================
  {
    id: "app-technical-issues",
    slug: "app-technical-issues",
    title: "App & Technical Issues",
    description: "Troubleshooting common problems with the Faflora app and website.",
    articleCount: 8,
    articles: [
      {
        id: "119",
        slug: "app-keeps-crashing-troubleshooting",
        title: "App keeps crashing – troubleshooting steps",
        content: `# App keeps crashing – troubleshooting steps\n\n1. Close and reopen the app.\n2. Clear app cache: Profile → Settings → Clear Cache.\n3. Update the app to the latest version.\n4. Restart your phone.\n5. Reinstall the app as a last resort.\n\nMost crashing issues are resolved by updating or clearing cache.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "120",
        slug: "how-to-update-the-faflora-app",
        title: "How to update the Faflora app",
        content: `# How to update the Faflora app\n\n1. Open Google Play Store.\n2. Search for “Faflora”.\n3. Tap **Update** if available.\n\nRegular updates bring new features and fix bugs. We recommend keeping the app updated.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "121",
        slug: "cant-log-in-on-the-mobile-app",
        title: "I can’t log in on the mobile app",
        content: `# I can’t log in on the mobile app\n\nTry these steps:\n1. Check your internet connection.\n2. Verify your phone number and password.\n3. Try resetting your password.\n4. Clear app cache and data.\n5. Reinstall the app and try again.\n\nIf the issue persists, contact support via the website login page.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "122",
        slug: "notifications-not-working",
        title: "Notifications not working",
        content: `# Notifications not working\n\n1. Go to your phone Settings → Apps → Faflora → Notifications.\n2. Make sure notifications are enabled.\n3. Check Do Not Disturb mode is off.\n4. In the Faflora app, go to Settings → Notifications and enable all options.\n\nRestart the app after making changes.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "123",
        slug: "slow-loading-or-images-not-showing",
        title: "Slow loading or images not showing",
        content: `# Slow loading or images not showing\n\n1. Check your internet connection (switch between Wi-Fi and mobile data).\n2. Clear app cache.\n3. Update the app.\n4. Free up storage space on your phone.\n\nUsing a stable connection usually resolves loading issues.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "124",
        slug: "how-to-clear-cache-and-data",
        title: "How to clear cache and data",
        content: `# How to clear cache and data\n\nOn Android:\n1. Go to phone Settings → Apps → Faflora.\n2. Tap **Storage** → **Clear Cache** (try this first).\n3. If needed, tap **Clear Data** (you may need to log in again).\n\nThis often fixes many technical glitches.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "125",
        slug: "app-not-available-in-my-countrys-app-store",
        title: "App not available in my country’s app store",
        content: `# App not available in my country’s app store\n\nThe Faflora app is currently available only on Google Play Store in Nigeria.\n\nYou can also use the full website version at faflora.com on any browser. We are working on expanding availability to more regions.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "126",
        slug: "how-to-switch-between-buyer-and-vendor-mode",
        title: "How to switch between buyer and vendor mode in the app",
        content: `# How to switch between buyer and vendor mode in the app\n\n1. Tap your profile picture in the bottom right.\n2. Look for **Switch to Seller** or **Switch to Buyer**.\n3. Tap it to toggle between modes.\n\nYou must have an approved vendor account to access Seller Mode.`,
        lastUpdated: "April 06, 2026"
      }
    ]
  },
  // ==================== TOPIC 11: Vendor Tools & Dashboard ====================
  {
    id: "vendor-tools-dashboard",
    slug: "vendor-tools-dashboard",
    title: "Vendor Tools & Dashboard",
    description: "Complete guide to using the seller dashboard and managing your store.",
    articleCount: 17,
    articles: [
      {
        id: "127",
        slug: "how-to-use-the-vendor-dashboard",
        title: "How to use the vendor dashboard",
        content: `# How to use the vendor dashboard\n\nAfter approval, log into your account and switch to Seller Mode. The dashboard gives you:\n- Overview of sales and earnings\n- Order management\n- Product listings\n- Payout history\n- Customer messages\n- Analytics and performance reports\n\nTake time to explore each section — it’s designed to help you grow your business efficiently.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "128",
        slug: "how-to-add-edit-or-delete-products",
        title: "How to add, edit, or delete products",
        content: `# How to add, edit, or delete products\n\n**To add**: Dashboard → Products → Add New Product. Upload images, write description, set price and inventory.\n\n**To edit**: Go to Products list → tap the product → make changes → Save.\n\n**To delete**: Select the product and choose Delete (only possible if no pending orders).`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "129",
        slug: "how-to-manage-inventory-and-stock-levels",
        title: "How to manage inventory and stock levels",
        content: `# How to manage inventory and stock levels\n\n1. Go to Products in your dashboard.\n2. For each product, set the available quantity.\n3. Enable low-stock alerts if desired.\n4. Update stock immediately after sales to avoid overselling.\n\nKeeping accurate stock levels prevents order cancellations and unhappy customers.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "130",
        slug: "how-to-handle-customer-messages",
        title: "How to handle customer messages",
        content: `# How to handle customer messages\n\n1. Go to **Messages** in the Seller Dashboard.\n2. All buyer inquiries appear here.\n3. Reply promptly — fast responses improve your rating.\n4. You can also message buyers directly from order details.\n\nAim to respond within a few hours during business days.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "131",
        slug: "how-to-create-discount-codes",
        title: "How to create discount codes for my store",
        content: `# How to create discount codes for my store\n\n1. Dashboard → Promotions → Create Discount Code.\n2. Set code name, discount percentage or fixed amount.\n3. Choose validity period and minimum order value.\n4. Select which products it applies to.\n5. Save and share the code with customers.\n\nDiscounts help boost sales and attract new buyers.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "132",
        slug: "analytics-and-sales-reports-explained",
        title: "Analytics and sales reports explained",
        content: `# Analytics and sales reports explained\n\nThe Analytics tab shows:\n- Total sales and earnings\n- Best-selling products\n- Traffic sources\n- Customer demographics\n- Order trends over time\n\nUse these insights to decide what to stock more of and when to run promotions.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "133",
        slug: "how-to-promote-my-products",
        title: "How to promote my products",
        content: `# How to promote my products\n\n- Create attractive listings with good photos and descriptions\n- Offer limited-time discounts\n- Ask satisfied customers to leave reviews\n- Share your store link on social media (WhatsApp, Instagram, etc.)\n- Participate in Faflora promotional campaigns when available\n\nConsistent promotion leads to more visibility and sales.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "134",
        slug: "how-to-respond-to-reviews-and-ratings",
        title: "How to respond to reviews and ratings",
        content: `# How to respond to reviews and ratings\n\n1. Go to Products → select a product → Reviews section.\n2. Reply to both positive and negative reviews professionally.\n3. Thank customers for positive feedback.\n4. Address concerns politely and offer solutions for negative ones.\n\nPublic replies show buyers that you care about customer satisfaction.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "135",
        slug: "store-customization-options",
        title: "Store customization options",
        content: `# Store customization options\n\nIn Store Settings you can:\n- Upload store logo and banner\n- Write a compelling store description\n- Add business story or policies\n- Choose store theme colors (limited options)\n- Set return and shipping policies\n\nA professional-looking store builds buyer confidence.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "136",
        slug: "how-to-feature-my-products",
        title: "How to feature my products",
        content: `# How to feature my products\n\nFaflora occasionally features high-quality products on the homepage and category pages.\n\nTo increase chances:\n- Maintain excellent ratings\n- Use high-resolution images\n- Keep stock updated\n- Price competitively\n\nYou can also promote products using discount codes and social sharing.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "137",
        slug: "bulk-product-upload-guide",
        title: "Bulk product upload guide",
        content: `# Bulk product upload guide\n\nFor vendors with many products:\n1. Go to Products → Bulk Upload.\n2. Download the Excel/CSV template.\n3. Fill in product details following the format.\n4. Upload the completed file.\n5. Review and publish the products.\n\nBulk upload saves time when adding large inventories.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "138",
        slug: "how-to-pause-or-close-store-temporarily",
        title: "How to pause or close my store temporarily",
        content: `# How to pause or close my store temporarily\n\n1. Go to Store Settings.\n2. Choose **Pause Store** (customers see “Temporarily Unavailable”).\n3. Or select **Close Store** for longer periods.\n4. Set a reason and expected reopening date.\n\nPausing is useful during holidays or restocking.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "139",
        slug: "vendor-performance-metrics",
        title: "Vendor performance metrics",
        content: `# Vendor performance metrics\n\nKey metrics shown in dashboard:\n- Order fulfillment rate\n- Average delivery time\n- Customer satisfaction rating\n- Cancellation rate\n- Return rate\n\nMaintaining high metrics improves your visibility and helps you get the Verified Vendor badge.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "140",
        slug: "how-to-view-customer-orders-in-dashboard",
        title: "How to view customer orders in dashboard",
        content: `# How to view customer orders in dashboard\n\n1. In Seller Dashboard, go to **Orders**.\n2. Filter by status (Pending, Shipped, Delivered, etc.).\n3. Tap any order to see details and buyer information.\n4. Update order status as you process shipments.\n\nPrompt order handling improves your ratings.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "141",
        slug: "payout-history-and-statements",
        title: "Payout history and statements",
        content: `# Payout history and statements\n\nGo to **Payouts** in the dashboard to:\n- View all past payouts\n- See commission deducted per order\n- Download monthly statements\n- Track pending payouts\n\nStatements can be used for business accounting and tax purposes.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "142",
        slug: "how-to-get-featured-on-faflora-homepage",
        title: "How to get featured on Faflora homepage",
        content: `# How to get featured on Faflora homepage\n\nFeatured spots are given to vendors who:\n- Have excellent ratings and fast delivery\n- Offer unique, high-quality Made-in-Nigeria products\n- Maintain good stock levels\n- Actively promote their store\n\nKeep performing well — our team may reach out when good opportunities arise.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "143",
        slug: "vendor-support-ticket-system",
        title: "Vendor support ticket system",
        content: `# Vendor support ticket system\n\nVendors have access to priority support:\n1. In Seller Dashboard, go to **Support**.\n2. Create a new ticket with your issue.\n3. Attach screenshots if needed.\n4. Our dedicated vendor team will respond quickly.\n\nThis system ensures sellers get faster help than regular buyers.`,
        lastUpdated: "April 06, 2026"
      }
    ]
  },

  // ==================== TOPIC 12: Policies & Legal ====================
  {
    id: "policies-legal",
    slug: "policies-legal",
    title: "Policies & Legal",
    description: "Important policies, terms, and legal information for buyers and sellers.",
    articleCount: 7,
    articles: [
      {
        id: "144",
        slug: "faflora-terms-of-service-summary",
        title: "Faflora Terms of Service summary",
        content: `# Faflora Terms of Service summary\n\nBy using Faflora, you agree to our Terms of Service. Key points:\n- You must be at least 18 years old or have guardian consent.\n- All listings must be accurate and honest.\n- Prohibited activities include fraud, counterfeit goods, and abusive behavior.\n- We may suspend accounts that violate policies.\n\nFull Terms are available on the website.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "145",
        slug: "privacy-policy-summary",
        title: "Privacy Policy – what data we collect",
        content: `# Privacy Policy – what data we collect\n\nWe collect:\n- Account information (name, phone, email)\n- Delivery addresses\n- Order and payment confirmation data\n- Device and usage information for security\n\nWe do not sell your data. Full details are in our Privacy Policy page.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "146",
        slug: "vendor-agreement-and-commission-rules",
        title: "Vendor agreement and commission rules",
        content: `# Vendor agreement and commission rules\n\nWhen you become a vendor, you agree to:\n- Pay platform commission on successful sales\n- Fulfill orders promptly and accurately\n- Provide quality products and good customer service\n- Comply with all marketplace policies\n\nCommission rates range from 8% to 15% depending on category.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "147",
        slug: "intellectual-property-and-copyright-policy",
        title: "Intellectual property and copyright policy",
        content: `# Intellectual property and copyright policy\n\nVendors must only list products they have the right to sell.\nUploading copyrighted material without permission is prohibited.\nWe respond to valid copyright complaints and may remove infringing listings.\nRepeated violations can lead to account suspension.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "148",
        slug: "prohibited-products-list",
        title: "Prohibited products list",
        content: `# Prohibited products list\n\nThe following are not allowed on Faflora:\n- Counterfeit or fake goods\n- Weapons, drugs, or illegal substances\n- Hazardous or toxic materials\n- Stolen goods\n- Adult content or services\n- Items that violate Nigerian laws\n\nListing prohibited items can result in immediate account suspension.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "149",
        slug: "how-we-handle-buyer-seller-disputes",
        title: "How we handle buyer-seller disputes",
        content: `# How we handle buyer-seller disputes\n\nWhen a dispute is raised:\n- Both parties are given opportunity to provide evidence\n- Our mediation team reviews all information fairly\n- We aim for equitable resolutions (refund, replacement, or partial settlement)\n- Decisions are final but can be escalated in exceptional cases\n\nOur goal is fair outcomes that protect both buyers and honest sellers.`,
        lastUpdated: "April 06, 2026"
      },
      {
        id: "150",
        slug: "contact-us-for-legal-or-policy-questions",
        title: "Contact us for legal or policy questions",
        content: `# Contact us for legal or policy questions\n\nFor legal, policy, or compliance matters:\n- Email: legal@faflora.com\n- Use the Support ticket system in the Seller Dashboard\n- For urgent issues, use the in-app chat (priority for verified vendors)\n\nWe aim to respond to legal inquiries within 48 business hours.`,
        lastUpdated: "April 06, 2026"
      }
    ]
  }
];

export const popularArticles = [
  {
    title: "How do I create a buyer account on Faflora?",
    slug: "how-do-i-create-a-buyer-account-on-faflora",
    topicSlug: "account-creation-verification"
  },
  {
    title: "How to register as a vendor on Faflora",
    slug: "how-to-register-as-a-vendor",
    topicSlug: "becoming-a-vendor"
  },
  {
    title: "How do I track my order in real time?",
    slug: "how-do-i-track-my-order-in-real-time",
    topicSlug: "orders-tracking"
  },
  {
    title: "How to request a refund",
    slug: "how-to-request-a-refund",
    topicSlug: "payments-refunds-withdrawals"
  },
  {
    title: "What is Faflora return policy?",
    slug: "what-is-faflora-return-policy",
    topicSlug: "returns-refunds-disputes"
  },
  {
    title: "Why was my card declined?",
    slug: "why-was-my-card-declined",
    topicSlug: "payments-refunds-withdrawals"
  }
];