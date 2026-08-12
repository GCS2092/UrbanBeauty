export function ProductSchema({ product, reviews, avgRating }) {
  if (!product) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images?.map((img) => img.url || img) || [],
    sku: product.id,
    offers: {
      "@type": "Offer",
      url: `https://www.sonshop.beauty/products/${product.slug}`,
      priceCurrency: "XOF",
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  if (avgRating && reviews?.length) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: avgRating,
      reviewCount: reviews.length,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}