interface VendorPricingInput {
  id?: string;
  compareAtPrice: number;
  discount?: number;
}

export function getVendorPricingFields({ id, compareAtPrice, discount }: VendorPricingInput) {
  if (id && compareAtPrice <= 0) return {};

  const percentage = typeof discount === 'number' && Number.isFinite(discount)
    ? Math.max(0, Math.min(99, discount))
    : 0;

  return {
    compareAtPrice,
    ...(id || percentage > 0 ? { discount: percentage } : {}),
  };
}
