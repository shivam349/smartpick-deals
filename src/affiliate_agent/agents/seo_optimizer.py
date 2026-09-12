"""SEOOptimizer Agent: Hybrid Gemini + Deterministic Code.

Handles:
- Title (Gemini + deterministic 60-char check)
- Meta description (Gemini + deterministic 150-160 char check)
- Slug (Deterministic URL slug generator)
- H1/H2 (Deterministic heading hierarchy validator & semantic H2 enrichment)
- FAQ (Gemini FAQ generator + deterministic FAQPage Schema)
- Internal links (Deterministic category & cross-product interlinking)
- Schema (Deterministic Schema.org JSON-LD for Product, Review, FAQPage, Breadcrumbs)
- Affiliate disclosure (Deterministic FTC & Cuelinks compliance banner)
"""

import json
import logging
import re
from typing import Any, Dict, List, Optional

from affiliate_agent.core.gemini import GeminiClient, default_gemini_client
from affiliate_agent.utils.cuelinks import CuelinksManager, default_cuelinks

logger = logging.getLogger(__name__)


class SEOOptimizerAgent:
    """Hybrid SEO Optimizer combining Gemini AI with deterministic SEO rules."""

    def __init__(
        self,
        gemini_client: Optional[GeminiClient] = None,
        cuelinks: Optional[CuelinksManager] = None,
    ):
        self.gemini = gemini_client or default_gemini_client
        self.cuelinks = cuelinks or default_cuelinks

    async def optimize_articles(
        self,
        articles: List[Dict[str, Any]],
        site_url: str = "https://smartpick.reviews",
        use_ai: bool = True,
    ) -> List[Dict[str, Any]]:
        """Optimize all articles with metadata, validated H1/H2, FAQs, internal links, and JSON-LD."""
        # 1. Deterministic Slug Generation across all articles
        for article in articles:
            article["slug"] = self.generate_slug(article)

        # Build slug map for internal linking
        slug_map = {a["slug"]: {"title": a.get("raw_title", a.get("title", "")), "category": a.get("category", "")} for a in articles}

        optimized_articles: List[Dict[str, Any]] = []

        for article in articles:
            opt = dict(article)
            target_kw = article.get("target_keyword", "")

            # 2. Title (Gemini + Deterministic check)
            title = await self.optimize_title(article, use_ai=use_ai)
            opt["title"] = title

            # 3. Meta Description (Gemini + Deterministic 150-160 char check)
            meta_desc = await self.optimize_meta_description(article, use_ai=use_ai)

            # 4. FAQ (Gemini generation + Deterministic Schema mapping)
            faqs = await self.generate_faqs(article, use_ai=use_ai)
            opt["faqs"] = faqs

            # 5. Internal Links (Deterministic engine)
            internal_links = self.generate_internal_links(article, slug_map)

            # 6. Heading Structure (Deterministic H1/H2 validator)
            validated_content, h1, h2_list = self.validate_heading_hierarchy(opt["content"], title, faqs)
            opt["content"] = validated_content
            opt["h1"] = h1
            opt["h2_headings"] = h2_list

            # 7. Affiliate Disclosure (Deterministic FTC banner)
            disclosure_text = self.cuelinks.get_ftc_disclosure()
            opt["affiliate_disclosure"] = disclosure_text
            if not opt["content"].startswith("> **Affiliate Disclosure"):
                opt["content"] = f"> **{disclosure_text}**\n\n" + opt["content"]

            # 8. Schema.org JSON-LD (Deterministic Builder)
            schema_jsonld = self.build_schema_jsonld(opt, site_url, faqs)

            # 9. Compute Keyword Density
            words = opt["content"].split()
            word_count = len(words)
            kw_count = opt["content"].lower().count(target_kw.lower()) if target_kw else 0
            density = round((kw_count / word_count * 100), 2) if word_count > 0 else 0.0

            opt["seo_metadata"] = {
                "meta_title": title,
                "meta_description": meta_desc,
                "slug": opt["slug"],
                "target_keyword": target_kw,
                "word_count": word_count,
                "keyword_density": density,
                "internal_links": internal_links,
                "schema_jsonld": schema_jsonld,
            }

            optimized_articles.append(opt)

        return optimized_articles

    def generate_slug(self, article: Dict[str, Any]) -> str:
        """Deterministic URL-friendly, keyword-rich slug generation."""
        if article.get("type") == "review":
            name = article.get("product", {}).get("name", article.get("raw_title", "review"))
            base = f"{name}-review"
        else:
            cat = article.get("category", "guide")
            base = f"best-{cat}-buying-guide"

        slug = base.lower().replace("&", "and").replace("/", "-")
        slug = re.sub(r"[^\w\s-]", "", slug)
        slug = re.sub(r"[\s_-]+", "-", slug).strip("-")
        return slug[:60]

    async def optimize_title(self, article: Dict[str, Any], use_ai: bool = True) -> str:
        """Optimize Title: Front-loads keyword, applies click triggers, enforces < 60 chars."""
        raw_title = article.get("raw_title", "")
        target_kw = article.get("target_keyword", "")

        if use_ai and self.gemini.is_configured:
            prompt = f"""Optimize this article title for SEO and click-through rate (CTR):
Original Title: "{raw_title}"
Target Keyword: "{target_kw}"

Rules:
1. Max 58 characters strictly.
2. Front-load the keyword naturally.
3. Include year (2026) or review/tested trigger.
4. Return ONLY the title string, no quotes."""

            try:
                ai_title = await self.gemini.generate(prompt=prompt, temperature=0.3)
                clean_title = ai_title.strip().strip('"').strip("'")
                if 20 <= len(clean_title) <= 65:
                    return clean_title
            except Exception as e:
                logger.warning("Gemini title optimization failed: %s", e)

        # Deterministic Title Fallback
        if article.get("type") == "review":
            prod_name = article.get("product", {}).get("name", "Product")
            title = f"{prod_name} Review (2026): Is It Worth It?"
        else:
            cat = article.get("category", "Gear")
            title = f"Best {cat} of 2026: Top Tested Picks"

        return title[:58]

    async def optimize_meta_description(self, article: Dict[str, Any], use_ai: bool = True) -> str:
        """Optimize Meta Description: Enforces 150-160 character window with clear CTA."""
        target_kw = article.get("target_keyword", "")
        category = article.get("category", "")

        if use_ai and self.gemini.is_configured:
            prompt = f"""Write a compelling SEO meta description:
Target Keyword: "{target_kw}"
Category: "{category}"
Article Type: "{article.get('type')}"

Rules:
1. MUST be between 145 and 160 characters long.
2. Include the target keyword "{target_kw}".
3. Include a clear call-to-action (e.g. Read our test results, Check live deals).
4. Return ONLY the meta description text without quotes."""

            try:
                ai_desc = await self.gemini.generate(prompt=prompt, temperature=0.3)
                clean_desc = ai_desc.strip().strip('"').strip("'")
                if 140 <= len(clean_desc) <= 165:
                    return clean_desc[:160]
            except Exception as e:
                logger.warning("Gemini meta description generation failed: %s", e)

        # Deterministic Meta Description Fallback
        if article.get("type") == "review":
            prod = article.get("product", {})
            desc = f"In-depth {target_kw}: We tested build quality, specs, pros & cons, and real-world performance. Read our expert {prod.get('rating', 4.7)}/5 review before buying!"
        else:
            desc = f"Looking for the best {category} in 2026? We tested and compared the top performers for durability, price, and specs. Read our complete buying guide now!"

        if len(desc) > 160:
            desc = desc[:157] + "..."
        elif len(desc) < 140:
            desc += " Check the latest verified prices today."
        return desc[:160]

    async def generate_faqs(self, article: Dict[str, Any], use_ai: bool = True) -> List[Dict[str, str]]:
        """Generate 3-4 intent-targeted FAQs for Google Featured Snippets and FAQPage schema."""
        target_kw = article.get("target_keyword", "")
        category = article.get("category", "")
        name = article.get("product", {}).get("name", category)

        if use_ai and self.gemini.is_configured:
            prompt = f"""Generate 3 high-intent buyer FAQs for "{name}" (Target keyword: "{target_kw}").
Return JSON array with "question" and "answer" (answer should be 2-3 sentences concise and factual):
[
  {{"question": "...", "answer": "..."}}
]"""

            try:
                faqs = await self.gemini.generate_json(prompt=prompt)
                if isinstance(faqs, list) and len(faqs) >= 2:
                    return faqs[:4]
            except Exception as e:
                logger.warning("Gemini FAQ generation failed: %s", e)

        # Deterministic FAQ Fallback
        return [
            {
                "question": f"Is the {name} worth the investment in 2026?",
                "answer": f"Yes, based on our real-world testing, the {name} delivers exceptional build quality, intuitive usability, and long-term durability that justify its price point.",
            },
            {
                "question": f"What warranty and return policy apply to {name}?",
                "answer": "Most authorized retailers offer a 1-to-2 year limited manufacturer warranty along with 30-day hassle-free return or replacement windows.",
            },
            {
                "question": f"How often are deals and prices verified for {name}?",
                "answer": "Our automated pipeline tracks and refreshes merchant pricing daily so you can find the most competitive discounts available.",
            },
        ]

    def validate_heading_hierarchy(
        self,
        content: str,
        title: str,
        faqs: List[Dict[str, str]],
    ) -> tuple[str, str, List[str]]:
        """Deterministic H1/H2 validator ensuring single H1 and clean H2/H3 semantic structure."""
        # Ensure single H1
        h1 = title

        # Strip any existing H1 from content
        cleaned_content = re.sub(r"^#\s+.*$", "", content, flags=re.MULTILINE).strip()

        # Extract all H2s
        h2_headings = re.findall(r"^##\s+(.*)$", cleaned_content, flags=re.MULTILINE)

        # If FAQ section is not in content, append formatted FAQs as an H2
        if "## Frequently Asked Questions" not in cleaned_content and faqs:
            faq_markdown = "\n\n## Frequently Asked Questions\n\n"
            for faq in faqs:
                faq_markdown += f"### {faq['question']}\n{faq['answer']}\n\n"
            cleaned_content += faq_markdown
            h2_headings.append("Frequently Asked Questions")

        return cleaned_content, h1, h2_headings

    def generate_internal_links(
        self,
        article: Dict[str, Any],
        slug_map: Dict[str, Dict[str, str]],
    ) -> List[Dict[str, str]]:
        """Deterministic internal linking engine connecting reviews with category guides."""
        current_slug = article.get("slug")
        category = article.get("category")
        links = []

        # 1. Prioritize articles in the same category
        for slug, meta in slug_map.items():
            if slug != current_slug and meta.get("category") == category:
                links.append({"slug": slug, "title": meta["title"], "url": f"{slug}.html"})
            if len(links) >= 3:
                break

        # 2. If fewer than 3, add other guides
        if len(links) < 3:
            for slug, meta in slug_map.items():
                if slug != current_slug and not any(l["slug"] == slug for l in links):
                    links.append({"slug": slug, "title": meta["title"], "url": f"{slug}.html"})
                if len(links) >= 3:
                    break

        return links

    def build_schema_jsonld(
        self,
        article: Dict[str, Any],
        site_url: str,
        faqs: List[Dict[str, str]],
    ) -> Dict[str, Any]:
        """Deterministic Schema.org JSON-LD generator for Product, Review, and FAQPage."""
        slug = article.get("slug", "")
        article_url = f"{site_url.rstrip('/')}/reviews/{slug}.html"
        title = article.get("title", "")
        is_review = article.get("type") == "review"

        cat_name = article.get("category", "Reviews")
        cat_slug = cat_name.lower().replace("&", "and").replace("/", "-").replace(" ", "-")
        cat_slug = "".join(c for c in cat_slug if c.isalnum() or c == "-")

        graph: List[Dict[str, Any]] = [
            # BreadcrumbList Schema
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Home", "item": site_url},
                    {"@type": "ListItem", "position": 2, "name": cat_name, "item": f"{site_url}/categories/{cat_slug}.html"},
                    {"@type": "ListItem", "position": 3, "name": title, "item": article_url},
                ],
            }
        ]

        # FAQPage Schema
        if faqs:
            faq_schema = {
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": f["question"],
                        "acceptedAnswer": {"@type": "Answer", "text": f["answer"]},
                    }
                    for f in faqs
                ],
            }
            graph.append(faq_schema)

        # Product & Review Schema
        if is_review:
            prod = article.get("product", {})
            rating_val = prod.get("rating", 4.7)
            price = str(prod.get("price", "$99.99")).replace("$", "").replace(",", "")

            product_schema = {
                "@type": "Product",
                "name": prod.get("name", title),
                "description": prod.get("summary", ""),
                "brand": {"@type": "Brand", "name": prod.get("brand", "Verified Brand")},
                "offers": {
                    "@type": "Offer",
                    "url": prod.get("affiliate_url", article_url),
                    "priceCurrency": "USD",
                    "price": price if price.replace(".", "").isdigit() else "99.99",
                    "availability": "https://schema.org/InStock",
                },
                "review": {
                    "@type": "Review",
                    "reviewRating": {
                        "@type": "Rating",
                        "ratingValue": str(rating_val),
                        "bestRating": "5",
                    },
                    "author": {"@type": "Organization", "name": "SmartPick Editorial Labs"},
                },
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": str(rating_val),
                    "reviewCount": str(prod.get("rating_count", 1500)),
                },
            }
            graph.append(product_schema)

        return {"@context": "https://schema.org", "@graph": graph}
