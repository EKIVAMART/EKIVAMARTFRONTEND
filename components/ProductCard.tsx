import React from "react";
import Image, { StaticImageData } from "next/image";

type ProductCardProps = {
    image?: string | StaticImageData;
    category?: string;
    title: string;
    rating?: number;
    author?: string;
    price: number;
    originalPrice?: number;
    currency?: string;
    href?: string;
};

export default function ProductCard({
    image = "/placeholder.png",
    category = "Fashion",
    title,
    rating = 4.2,
    author = "Tazo",
    price,
    originalPrice,
    currency = "Rs",
    href = "#",
}: ProductCardProps) {
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
        <a className="pc-card" href={href}>
            <div className="pc-image-wrap">
                <div className="pc-image-inner">
                    <Image src={image} alt={title} className="pc-image" width={260} height={260} style={{ objectFit: "contain" }} />
                </div>
            </div>

            <div className="pc-body">
                <div className="pc-category">{category}</div>

                <h3 className="pc-title">{title}</h3>

                <div className="pc-rating-row">
                    <div className="pc-stars" aria-label={`Rating ${rating} out of 5`}>
                        {Array.from({ length: fullStars }).map((_, i) => (
                            <svg key={"f" + i} viewBox="0 0 24 24" className="star star-filled">
                                <path d="M12 .587l3.668 7.431L23 9.75l-5.5 5.357L18.834 24 12 19.897 5.166 24l1.334-8.893L1 9.75l7.332-1.732z" />
                            </svg>
                        ))}
                        {halfStar && (
                            <svg viewBox="0 0 24 24" className="star star-half">
                                <defs>
                                    <linearGradient id="halfGrad">
                                        <stop offset="50%" stopColor="#f6c84c" />
                                        <stop offset="50%" stopColor="#e6e6e6" />
                                    </linearGradient>
                                </defs>
                                <path fill="url(#halfGrad)" d="M12 .587l3.668 7.431L23 9.75l-5.5 5.357L18.834 24 12 19.897 5.166 24l1.334-8.893L1 9.75l7.332-1.732z" />
                            </svg>
                        )}
                        {Array.from({ length: emptyStars }).map((_, i) => (
                            <svg key={"e" + i} viewBox="0 0 24 24" className="star star-empty">
                                <path d="M12 .587l3.668 7.431L23 9.75l-5.5 5.357L18.834 24 12 19.897 5.166 24l1.334-8.893L1 9.75l7.332-1.732z" />
                            </svg>
                        ))}
                    </div>

                    <div className="pc-by">By <span className="pc-author">{author}</span></div>
                </div>

                <div className="pc-price-row">
                    <div className="pc-price">
                        <span className="pc-currency">{currency} </span>
                        <span className="pc-current">{price}</span>
                    </div>
                    {originalPrice && (
                        <div className="pc-original">{currency} {originalPrice}</div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .pc-card {
                    display: block;
                    max-width: 320px;
                    border-radius: 14px;
                    overflow: hidden;
                    background: #ffffff;
                    box-shadow: 0 6px 18px rgba(22, 27, 36, 0.08);
                    text-decoration: none;
                    color: inherit;
                    transition: transform .22s ease, box-shadow .22s ease;
                }
                .pc-card:hover { transform: translateY(-6px); box-shadow: 0 12px 30px rgba(22,27,36,0.12); }

                .pc-image-wrap{
                    background: linear-gradient(180deg, #fff 0%, #fafafa 100%);
                    padding: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .pc-image{
                    width: 100%;
                    max-width: 260px;
                    height: auto;
                    border-radius: 10px;
                    object-fit: contain;
                    background: #fff;
                }

                .pc-body{ padding: 16px 18px 20px; }
                .pc-category{ font-size: 12px; color: #6b7280; margin-bottom:6px }
                .pc-title{ font-size: 16px; margin: 0 0 8px; font-weight: 700; color: #111827 }

                .pc-rating-row{ display:flex; align-items:center; justify-content:space-between; gap:10px }
                .pc-stars{ display:flex; gap:6px; align-items:center }
                .star{ width:16px; height:16px }
                .star-filled path{ fill:#f6c84c }
                .star-half path{ fill: url(#halfGrad) }
                .star-empty path{ fill:#e6e6e6 }

                .pc-by{ font-size:13px; color:#374151 }
                .pc-author{ color:#10b981; font-weight:600; text-decoration:none }

                .pc-price-row{ display:flex; align-items:center; gap:12px; margin-top:12px }
                .pc-price{ font-size:18px; font-weight:700; color:#059669 }
                .pc-original{ font-size:14px; color:#9ca3af; text-decoration:line-through }

                @media (max-width:480px){
                    .pc-card{ max-width: 100%; border-radius:12px }
                    .pc-image-wrap{ padding:14px }
                    .pc-title{ font-size:15px }
                }
            `}</style>
        </a>
    );
}