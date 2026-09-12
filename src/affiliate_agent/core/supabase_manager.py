"""Supabase Database Manager for AffiliateAgent.

Manages persistent storage in Supabase for:
- products (catalog items, pricing, affiliate links, ratings)
- articles (generated reviews, buying guides, SEO content)
- research (deep-dive pros/cons, comparisons, recommendations)
"""

import logging
import os
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

try:
    from supabase import Client, create_client
    HAS_SUPABASE = True
except ImportError:
    HAS_GENAI = False
    HAS_SUPABASE = False


class SupabaseManager:
    """Handles automated synchronization of products, articles, and research with Supabase."""

    def __init__(
        self,
        url: Optional[str] = None,
        key: Optional[str] = None,
    ):
        self.url = url or os.getenv("SUPABASE_URL", "")
        self.key = key or os.getenv("SUPABASE_KEY", "")
        self._client: Optional[Client] = None

        if HAS_SUPABASE and self.url and self.key and "your" not in self.key.lower():
            try:
                self._client = create_client(self.url, self.key)
                logger.info("Connected to Supabase project at %s", self.url)
            except Exception as e:
                logger.warning("Failed to initialize Supabase client: %s", e)

    def is_configured(self) -> bool:
        """Check if Supabase client is connected and ready."""
        return self._client is not None

    def save_products(self, products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Insert or upsert products into the Supabase 'products' table."""
        if not self.is_configured():
            logger.info("Supabase not configured or offline. Skipping database sync.")
            return products

        saved_records = []
        for p in products:
            record = {
                "name": p.get("name", "Unnamed Product"),
                "merchant": p.get("brand") or p.get("merchant", "Merchant"),
                "source_url": p.get("merchant_url", ""),
                "affiliate_url": p.get("affiliate_url", ""),
                "image_url": p.get("image_url", ""),
                "price": str(p.get("price", "")),
                "old_price": str(p.get("old_price", "")),
                "rating": float(p.get("rating", 4.5)),
                "review_count": int(p.get("rating_count", p.get("review_count", 1000))),
                "category": p.get("category", "General"),
                "description": p.get("summary", p.get("description", "")),
                "score": float(p.get("rating", 4.5) * 20),  # 0-100 score scale
                "status": "active",
            }
            try:
                # Upsert into products table based on name
                res = self._client.table("products").upsert(record, on_conflict="name").execute()
                if res.data:
                    p["supabase_id"] = res.data[0].get("id")
                    saved_records.append(res.data[0])
            except Exception as e:
                logger.warning("Error saving product '%s' to Supabase: %s", p.get("name"), e)

        logger.info("Successfully synced %d products to Supabase.", len(saved_records))
        return products

    def save_research(self, product_id: str, research: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Insert or upsert research record for a specific product into 'research' table."""
        if not self.is_configured() or not product_id:
            return None

        record = {
            "product_id": product_id,
            "pros": research.get("pros", []),
            "cons": research.get("cons", []),
            "best_for": research.get("best_for", research.get("buying_recommendation", "")),
            "not_for": research.get("not_for", ""),
            "comparison": research.get("comparison", ""),
            "review_summary": research.get("review_summary", research.get("review_theme_summary", "")),
            "recommendation": research.get("recommendation", research.get("buying_recommendation", "")),
            "source_data": research.get("source_data", {}),
        }
        try:
            res = self._client.table("research").upsert(record, on_conflict="product_id").execute()
            return res.data[0] if res.data else None
        except Exception as e:
            logger.warning("Error saving research to Supabase: %s", e)
            return None

    def save_articles(self, articles: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Insert or upsert articles into the Supabase 'articles' table."""
        if not self.is_configured():
            return articles

        saved_articles = []
        for art in articles:
            meta = art.get("seo_metadata", {})
            record = {
                "slug": art.get("slug", ""),
                "title": art.get("title", ""),
                "meta_description": meta.get("meta_description", ""),
                "content": art.get("content", ""),
                "category": art.get("category", "General"),
                "published": True,
            }
            try:
                res = self._client.table("articles").upsert(record, on_conflict="slug").execute()
                if res.data:
                    saved_articles.append(res.data[0])
            except Exception as e:
                logger.warning("Error saving article '%s' to Supabase: %s", art.get("slug"), e)

        logger.info("Successfully synced %d articles to Supabase.", len(saved_articles))
        return articles

    def get_products(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieve active products from Supabase."""
        if not self.is_configured():
            return []
        try:
            res = self._client.table("products").select("*").limit(limit).execute()
            return res.data or []
        except Exception as e:
            logger.warning("Error reading products from Supabase: %s", e)
            return []

    def get_articles(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Retrieve published articles from Supabase."""
        if not self.is_configured():
            return []
        try:
            res = self._client.table("articles").select("*").limit(limit).execute()
            return res.data or []
        except Exception as e:
            logger.warning("Error reading articles from Supabase: %s", e)
            return []


default_supabase_manager = SupabaseManager()
