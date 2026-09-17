import React from "react";

interface JsonLdProps {
  data: Record<string, any>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  "https://smartpick-dealss.vercel.app"
).replace(/\/+$/, "");

export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "SmartPick",
    "alternateName": "SmartPick Reviews",
    "url": siteUrl,
    "description": "Compare products, discover genuine deals, and find the best tech products with independent research.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${siteUrl}/deals?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SmartPick",
    "url": siteUrl,
    "logo": `${siteUrl}/logo.png`,
    "sameAs": []
  };
}

export function generateProductSchema(product: {
  name: string;
  image_url: string;
  description: string;
  price?: string | number | null;
  currency?: string | null;
  rating?: number | null;
  review_count?: number | null;
  merchant?: string | null;
  slug: string;
}) {
  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": [product.image_url],
    "description": product.description,
  };

  if (product.merchant) {
    schema.brand = {
      "@type": "Brand",
      "name": product.merchant,
    };
  }

  // Only include offer if verified price is present
  if (product.price) {
    const rawPrice = typeof product.price === "number" ? product.price : parseFloat(String(product.price).replace(/[^0-9.]/g, ""));
    if (!isNaN(rawPrice) && rawPrice > 0) {
      schema.offers = {
        "@type": "Offer",
        "price": rawPrice,
        "priceCurrency": product.currency || "INR",
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": product.merchant || "BoAt"
        }
      };
    }
  }

  // Only include AggregateRating if legitimate verified ratings exist
  if (product.rating && product.rating > 0 && product.review_count && product.review_count > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.review_count,
      "bestRating": "5",
      "worstRating": "1"
    };
  }

  return schema;
}

export function generateArticleSchema(article: {
  title: string;
  meta_description?: string;
  slug: string;
  created_at?: string;
  updated_at?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.meta_description || "",
    "mainEntityOfPage": `${siteUrl}/guides/${article.slug}`,
    "url": `${siteUrl}/guides/${article.slug}`,
    "author": {
      "@type": "Organization",
      "name": "SmartPick Editorial Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "SmartPick"
    },
    "datePublished": article.created_at || new Date().toISOString(),
    "dateModified": article.updated_at || new Date().toISOString()
  };
}
