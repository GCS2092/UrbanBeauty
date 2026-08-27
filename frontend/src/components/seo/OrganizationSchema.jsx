export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.sonshop.beauty/#organization",
        name: "SonShop",
        url: "https://www.sonshop.beauty",
        logo: "https://www.sonshop.beauty/icons/icon-512x512.png",
        image: "https://www.sonshop.beauty/icons/icon-512x512.png",
        description:
          "Boutique en ligne de vêtements et accessoires authentiques, livraison rapide partout au Sénégal et à l'international.",
        sameAs: [
          "https://www.facebook.com/share/17PicDQeZm/?mibextid=wwXIfr",
          "https://www.tiktok.com/@sonshop221",
          "https://www.instagram.com/sonshop221",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://www.sonshop.beauty/#website",
        name: "SonShop",
        url: "https://www.sonshop.beauty",
        publisher: { "@id": "https://www.sonshop.beauty/#organization" },
        potentialAction: {
          "@type": "SearchAction",
          target: "https://www.sonshop.beauty/products?search={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}