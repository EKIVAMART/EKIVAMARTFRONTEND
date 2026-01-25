'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import { productDummyData } from '@/assets/assets';
import { Heart, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import './product-details.css';

interface ProductDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { id } = use(params);
  const product = productDummyData.find((p) => p.id === id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [activeTab, setActiveTab] = useState<
    'description' | 'additional' | 'reviews'
  >('description');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    setSelectedImage(0);
  }, [id]);

  if (!product) {
    return (
      <div className="pd-not-found">
        <div className="pd-not-found-content">
          <h1>Product Not Found</h1>
          <p>Sorry, the product you're looking for doesn't exist.</p>
          <Link href="/" className="pd-btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const discount = Math.round(
    ((product.mrp - product.price) / product.mrp) * 100
  );
  const avgRating = product.rating?.length
    ? product.rating.reduce((sum: number, r: any) => sum + r.rating, 0) /
      product.rating.length
    : 4.5;

  const images = product.images || [];
  const sizes = ['S', 'M', 'L', 'XL'];

  const handleQuantityChange = (value: number) => {
    if (value >= 1) {
      setQuantity(value);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="pd-container">
      {/* Breadcrumb */}
      <div className="pd-breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/">Shop</Link>
        <span>/</span>
        <Link
          href={`/category/${product.category?.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {product.category}
        </Link>
        <span>/</span>
        <span className="pd-breadcrumb-current">{product.name}</span>
      </div>

      {/* Main Content */}
      <div className="pd-main">
        {/* Left Side - Images */}
        <div className="pd-images-section">
          {/* Main Image */}
          <div className="pd-main-image-wrapper">
            <div className="pd-main-image">
              <Image
                src={images[selectedImage] || images[0]}
                alt={product.name}
                width={500}
                height={600}
                priority
                style={{ objectFit: 'contain' }}
              />
              {discount > 0 && (
                <div className="pd-discount-badge">
                  {discount}% <br /> Off
                </div>
              )}
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  className="pd-nav-arrow pd-nav-prev"
                  onClick={prevImage}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  className="pd-nav-arrow pd-nav-next"
                  onClick={nextImage}
                  aria-label="Next image"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Images */}
          {images.length > 1 && (
            <div className="pd-thumbnails">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  className={`pd-thumbnail ${idx === selectedImage ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedImage(idx);
                    setCurrentImageIndex(idx);
                  }}
                  aria-label={`View image ${idx + 1}`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} view ${idx + 1}`}
                    width={100}
                    height={100}
                    style={{ objectFit: 'contain' }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side - Product Details */}
        <div className="pd-details-section">
          {/* Product Info */}
          <div className="pd-info">
            <h1 className="pd-title">{product.name}</h1>

            {/* Rating */}
            <div className="pd-rating-section">
              <div className="pd-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className={`pd-star ${i < Math.floor(avgRating) ? 'filled' : 'empty'}`}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <span className="pd-review-count">
                ({product.rating?.length || 10} reviews)
              </span>
            </div>

            {/* Price Section */}
            <div className="pd-price-section">
              <div className="pd-price-wrapper">
                <span className="pd-current-price">
                  ₦{product.price.toLocaleString()}
                </span>
                {product.mrp > product.price && (
                  <>
                    <span className="pd-original-price">
                      ₦{product.mrp.toLocaleString()}
                    </span>
                    <span className="pd-discount-percent">{discount}% Off</span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="pd-description">{product.description}</p>

            {/* Size Selection */}
            <div className="pd-size-section">
              <label className="pd-section-label">Size:</label>
              <div className="pd-size-options">
                {sizes.map((size) => (
                  <button
                    key={size}
                    className={`pd-size-btn ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Weight */}
            <div className="pd-weight-section">
              <label className="pd-section-label">WEIGHT:</label>
              <span className="pd-weight-value">3KG</span>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="pd-actions-section">
              <div className="pd-quantity-selector">
                <button
                  className="pd-qty-btn"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <input
                  type="number"
                  className="pd-qty-input"
                  value={quantity}
                  onChange={(e) =>
                    handleQuantityChange(parseInt(e.target.value) || 1)
                  }
                  min="1"
                />
                <button
                  className="pd-qty-btn"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button className="pd-btn-primary pd-btn-add-to-cart">
                <svg className="pd-cart-icon" viewBox="0 0 24 24">
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-. 9-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zM7.17 14.75l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.86-7.01H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25z" />
                </svg>
                Add To Cart
              </button>

              <button
                className={`pd-btn-wishlist ${isWishlisted ? 'active' : ''}`}
                onClick={() => setIsWishlisted(!isWishlisted)}
                aria-label="Add to wishlist"
              >
                <Heart
                  size={20}
                  fill={isWishlisted ? 'currentColor' : 'none'}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="pd-tabs-section">
        <div className="pd-tabs-header">
          <button
            className={`pd-tab-btn ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          <button
            className={`pd-tab-btn ${activeTab === 'additional' ? 'active' : ''}`}
            onClick={() => setActiveTab('additional')}
          >
            Additional Info
          </button>
          <button
            className={`pd-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({product.rating?.length || 10})
          </button>
        </div>

        <div className="pd-tabs-content">
          {activeTab === 'description' && (
            <div className="pd-tab-pane">
              <p>{product.description}</p>
              <p>
                This premium product is crafted with the finest materials and
                attention to detail. Each piece is carefully designed to provide
                comfort, style, and durability. Perfect for everyday wear or
                special occasions.
              </p>
            </div>
          )}

          {activeTab === 'additional' && (
            <div className="pd-tab-pane">
              <div className="pd-info-table">
                <div className="pd-info-row">
                  <span className="pd-info-label">Material:</span>
                  <span className="pd-info-value">Premium Cotton Blend</span>
                </div>
                <div className="pd-info-row">
                  <span className="pd-info-label">Fit Type:</span>
                  <span className="pd-info-value">Regular Fit</span>
                </div>
                <div className="pd-info-row">
                  <span className="pd-info-label">Care Instructions:</span>
                  <span className="pd-info-value">
                    Machine wash cold, tumble dry low
                  </span>
                </div>
                <div className="pd-info-row">
                  <span className="pd-info-label">Origin:</span>
                  <span className="pd-info-value">Manufactured in India</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="pd-tab-pane">
              <div className="pd-reviews-list">
                {product.rating && product.rating.length > 0 ? (
                  product.rating.map((review: any, idx: number) => (
                    <div key={idx} className="pd-review-item">
                      <div className="pd-review-header">
                        <Image
                          src={review.user.image}
                          alt={review.user.name}
                          width={40}
                          height={40}
                          className="pd-review-avatar"
                        />
                        <div className="pd-review-info">
                          <h4>{review.user.name}</h4>
                          <div className="pd-review-rating">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <svg
                                key={i}
                                className={`pd-star-sm ${i < review.rating ? 'filled' : 'empty'}`}
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="pd-review-text">{review.review}</p>
                    </div>
                  ))
                ) : (
                  <p className="pd-no-reviews">
                    No reviews yet. Be the first to review this product!
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      <div className="pd-related-section">
        <h2>Related products</h2>
        <div className="pd-related-grid">
          {productDummyData
            .filter(
              (p) => p.category === product.category && p.id !== product.id
            )
            .slice(0, 4)
            .map((relatedProduct) => (
              <Link
                key={relatedProduct.id}
                href={`/product/${relatedProduct.id}`}
                className="pd-related-item"
              >
                <div className="pd-related-img">
                  <Image
                    src={relatedProduct.images[0]}
                    alt={relatedProduct.name}
                    width={200}
                    height={200}
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                <h3>{relatedProduct.name}</h3>
                <p className="pd-related-price">₦{relatedProduct.price}</p>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
