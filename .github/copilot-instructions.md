# Copilot Instructions for fafloriesgroup

## Project Overview
This is a Next.js 16 e-commerce application for a florist/flower shop ("fafloriesgroup") built with the App Router. It features product listings, categories, and user authentication using Clerk. Currently uses dummy data for development.

## Architecture
- **Framework**: Next.js 16 with App Router (`app/` directory)
- **Styling**: Tailwind CSS v4 with custom components
- **Authentication**: Clerk for user management
- **Database**: MongoDB with Mongoose (planned, currently dummy data)
- **State Management**: React Redux (integrated but minimally used)
- **TypeScript**: Strict mode enabled

## Key Components Structure
- `components/`: Reusable UI components (ProductCard, HeroSubscribe, etc.)
- `container/`: Layout-specific components (HeaderNav, Subnavbar, Listfoot)
- `assets/`: Static assets and dummy data (`assets.ts` exports images and data)
- `app/`: App Router pages (`page.tsx`, `layout.tsx`, dynamic routes like `category/[slug]/page.tsx`)

## Data Management
- **Current**: Dummy data in `assets/assets.ts` (products, categories, ratings)
- **Planned**: MongoDB integration with Mongoose models
- **Client Components**: Use "use client" for interactivity (filtering, state)
- **Server Components**: Default for static content

## Component Patterns
- **Client Components**: Marked with `"use client"` for hooks/state (e.g., `ProductsSection.tsx`, `CategoryProductsClient.tsx`)
- **Product Display**: `ProductCard` component handles images, ratings, pricing
- **Image Handling**: Next.js `Image` component with `assets` imports
- **Styling**: Tailwind classes with hover effects and responsive design

## Development Workflow
- **Start Dev**: `npm run dev` (runs on localhost:3000)
- **Build**: `npm run build` (production build)
- **Lint**: `npm run lint` (ESLint with Next.js rules)
- **Format**: `npm run formate` (Prettier formatting)
- **Auth Setup**: Configure Clerk environment variables for authentication

## Conventions
- **Imports**: Use `@/*` alias for root imports (configured in `tsconfig.json`)
- **File Naming**: PascalCase for components (e.g., `ProductCard.tsx`)
- **Dummy Data**: All product data in `assets/assets.ts` - update here for new items
- **Categories**: Mapped in `CATEGORY_GROUPS` in `category/[slug]/page.tsx` for URL slugs
- **Currency**: Default to "₦" (Naira) in components
- **Ratings**: Calculated as average from array of rating objects

## Adding New Features
- **Products**: Add to `productDummyData` array in `assets/assets.ts`
- **Categories**: Update `categories` array and `CATEGORY_GROUPS` mapping
- **Pages**: Create in `app/` directory, use dynamic routes for categories
- **Auth**: Wrap components with Clerk providers as needed

## Common Patterns
- Filter products by category: `productDummyData.filter(p => p.category === activeCategory)`
- Calculate ratings: `ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length`
- Responsive design: Use Tailwind `md:`, `lg:` prefixes
- Image optimization: Import from `assets/` and use Next.js `Image` component