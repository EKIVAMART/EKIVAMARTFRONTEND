"use client";
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
    currency = "₦",
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
                    box-shadow: 0 8px 22px rgba(16, 24, 40, 0.06);
                    text-decoration: none;
                    color: inherit;
                    transition: transform .34s cubic-bezier(.2,.9,.2,1), box-shadow .34s ease;
                    will-change: transform;
                    position: relative;
                }

                .pc-card:hover {
                    transform: translateY(-10px) scale(1.01);
                    box-shadow: 0 22px 44px rgba(16, 24, 40, 0.14);
                }

                .pc-image-wrap{
                    background: linear-gradient(180deg, #fff 0%, #fbfdfc 100%);
                    height: 240px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                }

                .pc-image-inner{ width:100%; height:100%; display:flex; align-items:center; justify-content:center }

                .pc-image{
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform .7s cubic-bezier(.2,.9,.3,1);
                    border-radius: 0;
                }

                .pc-card:hover .pc-image{ transform: scale(1.08) }

                .pc-body{ padding: 14px 16px 18px; display:flex; flex-direction:column; gap:8px }
                .pc-category{ font-size: 12px; color: #6b7280; margin-bottom:2px; text-transform: capitalize }
                .pc-title{ font-size: 16px; margin: 0; font-weight: 700; color: #0f172a; line-height:1.2 }

                .pc-rating-row{ display:flex; align-items:center; justify-content:space-between; gap:10px }
                .pc-stars{ display:flex; gap:6px; align-items:center }
                .star{ width:14px; height:14px }
                .star-filled path{ fill:#f6c84c }
                .star-half path{ fill: url(#halfGrad) }
                .star-empty path{ fill:#e6e6e6 }

                .pc-by{ font-size:13px; color:#374151 }
                .pc-author{ color:#10b981; font-weight:600; text-decoration:none }

                .pc-price-row{ display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:6px }
                .pc-price{ font-size:18px; font-weight:800; color:#059669; display:flex; align-items:baseline; gap:6px }
                .pc-currency{ font-size:14px }
                .pc-current{ font-size:18px }
                .pc-original{ font-size:13px; color:#9ca3af; text-decoration:line-through }

                /* small screens */
                @media (max-width:480px){
                    .pc-card{ max-width: 100%; border-radius:12px }
                    .pc-image-wrap{ height:180px }
                    .pc-title{ font-size:15px }
                }
            `}</style>
        </a>
    );
}