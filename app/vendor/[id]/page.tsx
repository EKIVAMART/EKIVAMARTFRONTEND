'use client';

import { useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Search, Share, UserPlus, Calendar, Heart, MapPin, CheckCircle, ChevronDown, Plus, Monitor, Watch, Headphones, Speaker, MousePointerClick, Home } from 'lucide-react';
import { productDummyData, dummyStoreData } from '@/assets/assets';
import './vendor-details.css';
import { useAppDispatch } from '@/lib/hooks';
import { addToCart } from '@/lib/features/cart/cartSlice';

interface VendorPageProps {
  params: Promise<{ id: string }>;
}

export default function VendorPage({ params }: VendorPageProps) {
  const { id } = use(params);
  const vendor = dummyStoreData; // Using dummy data for now
  const vendorProducts = productDummyData.filter(p => p.storeId === vendor.id || true).slice(0, 8); // Just show some products for UI
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState<'items' | 'categories' | 'reviews'>('items');
  const [activeFilter, setActiveFilter] = useState('relevance');

  const ratingBars = [
    { stars: 5, percent: 85.2 },
    { stars: 4, percent: 7 },
    { stars: 3, percent: 4.3 },
    { stars: 2, percent: 1.2 },
    { stars: 1, percent: 2.3 },
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300 fill-current'}`}
        viewBox="0 0 24 24"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ));
  };

  return (
    <div className="vp-container">
      {/* Header */}
      <header className="vp-header">
        <Link href="/" className="vp-back-btn">
          <ChevronLeft size={24} />
        </Link>
        <div className="vp-header-actions ml-auto">
          <button><Search size={22} /></button>
          <button><Share size={22} /></button>
        </div>
      </header>

      {/* Profile Section */}
      <div className="vp-cover-photo">
        <div className="vp-cover-content">
          <div className="vp-title-group -mt-16">
            <h1 className="vp-brilliant-title">{vendor.name}</h1>
            <div className="vp-brilliant-badge">VERIFIED SELLER</div>
          </div>
        </div>
      </div>

      <div className="vp-profile">
        <div className="vp-profile-top">
          <div className="vp-avatar -top-8">
            {vendor.logo ? (
              <Image src={vendor.logo} alt={vendor.name} width={80} height={80} className="vp-avatar-img" />
            ) : (
              <span>{vendor.name.substring(0, 2).toUpperCase()}</span>
            )}
          </div>
          
          <div className="vp-profile-actions">
            <button className="vp-follow-btn -mt-8">
              <UserPlus size={16} /> Follow
            </button>
          </div>
        </div>

        <div className="vp-stats-row">
          <span className="vp-stat-primary">450K+ Sold</span>
          <span className="vp-stat-info-icon">?</span>
          <span className="vp-stat-divider">|</span>
          <span className="vp-stat-secondary">276 Items</span>
        </div>

        <div className="vp-joined-date mt-4">
          <Calendar size={16} className="text-gray-400" />
          <span>Started to sell on Faflories 3 years ago</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="vp-tabs">
        <button
          className={`vp-tab ${activeTab === 'items' ? 'active' : ''}`}
          onClick={() => setActiveTab('items')}
        >
          Items
        </button>
        <button
          className={`vp-tab ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
        <button
          className={`vp-tab ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Reviews(4.7★)
        </button>
      </div>

      {/* Tab Content */}
      <div className="vp-content">
        {activeTab === 'items' && (
          <div className="vp-items-tab">
            {/* Filters */}
            <div className="vp-filters">
              {['relevance', 'top-sales', 'most-recent'].map((filter) => (
                <button
                  key={filter}
                  className={`vp-filter-btn ${activeFilter === filter ? 'active' : ''}`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>

            {/* Product Grid */}
            <div className="vp-product-grid">
              {vendorProducts.map((product) => {
                const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
                return (
                  <div key={product.id} className="vp-product-card">
                    <div className="vp-product-img-wrapper">
                      <Image src={product.images[0]} alt={product.name} fill className="vp-product-img" />
                      <button className="vp-wishlist-btn">
                        <Heart size={16} />
                      </button>
                    </div>
                    <div className="vp-product-details">
                      <Link href={`/product/${product.id}`} className="vp-product-name line-clamp-2">
                        {product.name}
                      </Link>
                      <div className="vp-product-rating">
                        <div className="flex">{renderStars(4.5)}</div>
                        <span className="vp-rating-count">1.2k</span>
                      </div>
                      <div className="vp-product-price-row">
                        {discount > 0 && <span className="vp-discount">-{discount}%</span>}
                        <span className="vp-price">₦{product.price.toLocaleString()}</span><span className="vp-price-decimals">.00</span>
                      </div>
                      {product.mrp > product.price && (
                        <div className="vp-list-price">List Price: ₦{product.mrp.toLocaleString()}</div>
                      )}
                      <div className="vp-location">
                        <MapPin size={12} />
                        <span>From {product.location || 'Lagos'}</span>
                      </div>
                      <button 
                        className="vp-add-to-cart-btn"
                        onClick={() => dispatch(addToCart({ productId: product.id }))}
                      >
                        Add to cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="vp-categories-grid">
            {[
              { name: 'Electronics', count: 120, icon: <Monitor size={28} /> },
              { name: 'Headphones', count: 45, icon: <Headphones size={28} /> },
              { name: 'Smart Watches', count: 32, icon: <Watch size={28} /> },
              { name: 'Speakers', count: 28, icon: <Speaker size={28} /> },
              { name: 'Accessories', count: 85, icon: <MousePointerClick size={28} /> },
              { name: 'Home & Living', count: 14, icon: <Home size={28} /> },
            ].map((cat, idx) => (
              <div key={idx} className="vp-category-card">
                <div className="vp-category-icon-wrapper">
                  {cat.icon}
                </div>
                <div className="vp-category-info">
                  <h3>{cat.name}</h3>
                  <p>{cat.count} Products</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="vp-reviews-tab">
            <div className="vp-verified-banner">
              <CheckCircle size={16} className="text-green-600" />
              <span>All reviews are from verified purchases</span>
              <span className="vp-info-circle ml-auto">?</span>
            </div>

            <div className="vp-rating-overview">
              <div className="vp-rating-score">
                <h2>4.7</h2>
                <p>772 reviews</p>
              </div>
              <div className="vp-rating-bars">
                {ratingBars.map((bar) => (
                  <div key={bar.stars} className="vp-rating-bar-row">
                    <div className="vp-stars-label">{renderStars(bar.stars)}</div>
                    <div className="vp-progress-bar">
                      <div className="vp-progress-fill" style={{ width: `${bar.percent}%` }}></div>
                    </div>
                    <div className="vp-percent-label">{bar.percent}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="vp-reviews-filter">
              <button className="flex items-center gap-2 border rounded-full px-4 py-1.5 text-sm font-medium text-gray-700">
                Recommended <ChevronDown size={16} />
              </button>
            </div>

            <div className="vp-reviews-list">
              {[
                { name: 'Top***pe', date: '17 Dec 2025', text: 'the sole pulled off on the first day i put it on', variant: 'Black', rating: 2 },
                { name: 'Chi***ma', date: '3 Oct 2025', text: "it's actually the original adidas", variant: 'White', rating: 5 },
                { name: 'Eme***ka', date: '20 Nov 2025', text: 'Worth the money, delivery was fast too', variant: 'Black', rating: 4 }
              ].map((review, idx) => (
                <div key={idx} className="vp-review-item">
                  <div className="vp-reviewer-header">
                    <div className="vp-reviewer-avatar" style={{ backgroundColor: `hsl(${idx * 137 % 360}, 70%, 40%)` }}>
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <div className="vp-reviewer-name">{review.name}</div>
                      <div className="vp-review-date">on {review.date}</div>
                    </div>
                  </div>
                  <div className="vp-review-stars mb-1.5 flex">{renderStars(review.rating)}</div>
                  <div className="vp-review-variant">Purchased: {review.variant}</div>
                  <p className="vp-review-text">{review.text}</p>
                  
                  {/* Product Mini Card inside review */}
                  <div className="vp-review-product-card">
                    <Image src={vendorProducts[0].images[0]} alt="Product" width={40} height={40} className="rounded-lg object-contain bg-yellow-400 p-1" />
                    <div className="vp-review-product-info">
                      <p className="vp-review-product-name line-clamp-1 text-xs text-gray-600">{vendorProducts[0].name}</p>
                      <p className="vp-review-product-price text-sm font-bold">₦{vendorProducts[0].price.toLocaleString()}</p>
                    </div>
                    <button className="vp-review-add-btn">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
