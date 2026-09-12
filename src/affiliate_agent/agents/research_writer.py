"""ResearchWriter Agent: Powered by Gemini.

Performs:
- Product analysis
- Comparison
- Pros/Cons extraction
- Buying recommendation
- Review-theme summary
- Long-form article generation
"""

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

from affiliate_agent.core.gemini import GeminiClient, default_gemini_client
from affiliate_agent.utils.cuelinks import CuelinksManager, default_cuelinks

logger = logging.getLogger(__name__)


class ResearchWriterAgent:
    """Researches products and authors high-converting articles using Gemini."""

    def __init__(
        self,
        gemini_client: Optional[GeminiClient] = None,
        cuelinks: Optional[CuelinksManager] = None,
    ):
        self.gemini = gemini_client or default_gemini_client
        self.cuelinks = cuelinks or default_cuelinks

    async def generate_articles(
        self,
        catalog: List[Dict[str, Any]],
        target_article_count: int = 15,
        use_ai: bool = True,
    ) -> List[Dict[str, Any]]:
        """Generate comprehensive articles (reviews and guides) from the product catalog."""
        articles: List[Dict[str, Any]] = []

        # 1. Group products by category
        categories_map: Dict[str, List[Dict[str, Any]]] = {}
        for p in catalog:
            cat = p.get("category", "General")
            categories_map.setdefault(cat, []).append(p)

        # 2. Category Buying Guides (comparison & roundups)
        for category, prods in categories_map.items():
            if len(articles) >= target_article_count:
                break
            guide = await self.create_category_guide(category, prods, use_ai=use_ai)
            articles.append(guide)

        # 3. In-Depth Single Product Reviews (detailed product analysis & theme summaries)
        for p in catalog:
            if len(articles) >= target_article_count:
                break
            review = await self.create_single_product_review(p, use_ai=use_ai)
            articles.append(review)

        return articles

    async def create_single_product_review(
        self,
        product: Dict[str, Any],
        use_ai: bool = True,
    ) -> Dict[str, Any]:
        """Perform product analysis, review-theme summary, pros/cons, and draft the article."""
        name = product["name"]
        category = product.get("category", "Tech")
        price = product.get("price", "$99.99")
        rating = product.get("rating", 4.7)

        target_keyword = f"{name.lower()} review"

        if use_ai and self.gemini.is_configured:
            prompt = f"""Conduct a deep, authoritative review for "{name}".
Category: {category}
Price: {price}
Stated Specs/Features: {json.dumps(product.get('features', []))}

Execute the following 6 core research & writing tasks:
1. PRODUCT ANALYSIS: Analyze build quality, real-world ergonomics, engineering strengths, and hardware/software capabilities.
2. COMPARISON: Compare how this product stacks up against its closest 2 market rivals in terms of performance and price-to-value ratio.
3. PROS & CONS: Provide 3-4 distinct genuine pros and 2-3 genuine limitations or tradeoffs based on prolonged real-world usage.
4. BUYING RECOMMENDATION: Clearly explain who should buy this product, who should avoid it, and why.
5. REVIEW-THEME SUMMARY: Synthesize overall user consensus from customer sentiment (what buyers love most vs common pain points).
6. ARTICLE: Write the complete, engaging, long-form review article with clear markdown sections (## and ###).

Respond with valid JSON containing:
{{
  "product_analysis": "2-3 paragraphs analyzing build, usability, and performance",
  "comparison": "2 paragraphs comparing against top market rivals",
  "pros": ["Pro 1", "Pro 2", "Pro 3"],
  "cons": ["Con 1", "Con 2"],
  "buying_recommendation": "Who should buy vs who should skip",
  "review_theme_summary": "Consensus on what thousands of buyers report",
  "article_body": "Full structured markdown article combining all findings into a compelling read"
}}"""

            try:
                ai_data = await self.gemini.generate_json(
                    prompt=prompt,
                    system_instruction="You are ResearchWriter, an elite product testing and affiliate marketing researcher.",
                )
                if isinstance(ai_data, dict) and "article_body" in ai_data:
                    # Update product record with refined pros/cons/analysis
                    product["pros"] = ai_data.get("pros", product.get("pros", []))
                    product["cons"] = ai_data.get("cons", product.get("cons", []))
                    product["product_analysis"] = ai_data.get("product_analysis", "")
                    product["comparison"] = ai_data.get("comparison", "")
                    product["buying_recommendation"] = ai_data.get("buying_recommendation", "")
                    product["review_theme_summary"] = ai_data.get("review_theme_summary", "")

                    return {
                        "raw_title": f"{name} Comprehensive Review: Is It Worth Buying in 2026?",
                        "category": category,
                        "type": "review",
                        "target_keyword": target_keyword,
                        "product": product,
                        "product_analysis": ai_data.get("product_analysis", ""),
                        "comparison": ai_data.get("comparison", ""),
                        "pros": ai_data.get("pros", product.get("pros", [])),
                        "cons": ai_data.get("cons", product.get("cons", [])),
                        "buying_recommendation": ai_data.get("buying_recommendation", ""),
                        "review_theme_summary": ai_data.get("review_theme_summary", ""),
                        "content": ai_data.get("article_body", ""),
                        "reading_time_mins": 6,
                    }
            except Exception as e:
                logger.warning("Gemini product review failed: %s. Using deterministic fallback.", e)

        # Fallback if offline or AI failed
        fallback_body = self._build_fallback_review_body(product)
        return {
            "raw_title": f"{name} Comprehensive Review: Is It Worth Buying in 2026?",
            "category": category,
            "type": "review",
            "target_keyword": target_keyword,
            "product": product,
            "product_analysis": product.get("summary", ""),
            "comparison": f"Compared to similar products in {category}, {name} offers exceptional reliability and build quality.",
            "pros": product.get("pros", []),
            "cons": product.get("cons", []),
            "buying_recommendation": f"Best for {product.get('target_audience', 'demanding buyers')} who prioritize reliability.",
            "review_theme_summary": "Users praise the long-term durability and intuitive design, while noting the premium price point.",
            "content": fallback_body,
            "reading_time_mins": 6,
        }

    async def create_category_guide(
        self,
        category: str,
        products: List[Dict[str, Any]],
        use_ai: bool = True,
    ) -> Dict[str, Any]:
        """Create a comparative category buying guide."""
        target_keyword = f"best {category.lower()} 2026"
        featured_names = [p["name"] for p in products[:4]]

        if use_ai and self.gemini.is_configured:
            prompt = f"""Write a comprehensive buyer guide & comparison article for "{category}".
Featured Products: {json.dumps(featured_names)}

Execute these research steps:
1. CATEGORY & PRODUCT ANALYSIS: Overview of current market trends in {category}.
2. SIDE-BY-SIDE COMPARISON: Compare key features, price tiers, and performance differences across these picks.
3. PROS & CONS: Highlights and trade-offs of each top pick.
4. BUYING RECOMMENDATION: Specific advice on how to choose based on budget, lifestyle, and use cases.
5. REVIEW-THEME SUMMARY: What real users and testing labs report as the standout picks.
6. ARTICLE: Full markdown buyer guide with comparison table and in-depth reviews of each pick.

Respond with valid JSON:
{{
  "category_analysis": "Market analysis of the category",
  "comparison_summary": "Head-to-head comparison summary",
  "buying_recommendation": "Criteria for choosing between budget and premium picks",
  "review_theme_summary": "Summary of user reviews across the category",
  "article_body": "Full structured markdown guide"
}}"""

            try:
                ai_data = await self.gemini.generate_json(
                    prompt=prompt,
                    system_instruction="You are ResearchWriter, crafting comparative buying guides for affiliate marketing.",
                )
                if isinstance(ai_data, dict) and "article_body" in ai_data:
                    return {
                        "raw_title": f"The Definitive Guide to the Best {category} (2026 Tested & Reviewed)",
                        "category": category,
                        "type": "buying_guide",
                        "target_keyword": target_keyword,
                        "featured_products": products[:4],
                        "product_analysis": ai_data.get("category_analysis", ""),
                        "comparison": ai_data.get("comparison_summary", ""),
                        "buying_recommendation": ai_data.get("buying_recommendation", ""),
                        "review_theme_summary": ai_data.get("review_theme_summary", ""),
                        "content": ai_data.get("article_body", ""),
                        "reading_time_mins": 8,
                    }
            except Exception as e:
                logger.warning("Gemini category guide failed: %s. Using deterministic fallback.", e)

        fallback_body = self._build_fallback_guide_body(category, products)
        return {
            "raw_title": f"The Definitive Guide to the Best {category} (2026 Tested & Reviewed)",
            "category": category,
            "type": "buying_guide",
            "target_keyword": target_keyword,
            "featured_products": products[:4],
            "product_analysis": f"Overview of {category} innovations and benchmarks.",
            "comparison": "Side-by-side analysis of budget vs premium category picks.",
            "buying_recommendation": "Key criteria to prioritize when buying.",
            "review_theme_summary": "High satisfaction for flagship models with durable build materials.",
            "content": fallback_body,
            "reading_time_mins": 8,
        }

    def _build_fallback_review_body(self, product: Dict[str, Any]) -> str:
        name = product["name"]
        price = product.get("price", "$99.99")
        rating = product.get("rating", 4.7)
        affiliate_url = product.get("affiliate_url", "#")
        features_list = "\n".join(f"- {f}" for f in product.get("features", []))
        pros_list = "\n".join(f"- **Strength:** {pro}" for pro in product.get("pros", []))
        cons_list = "\n".join(f"- **Limitation:** {con}" for con in product.get("cons", []))

        return f"""## Product Analysis & Real-World Testing

The **{name}** has earned an exceptional **{rating} out of 5** rating. Priced at **{price}**, it delivers premium performance, robust build materials, and consistent reliability across daily demanding use.

### Core Engineering & Specifications
{features_list}

---

## Market Comparison & Competitor Benchmark

When compared to chief rivals in its price category, the **{name}** stands out primarily in usability, long-term durability, and seamless setup. While alternative models may occasionally offer lower entry pricing, they typically sacrifice component longevity and customer support.

---

## Pros and Cons Breakdown

### What Stands Out (Pros)
{pros_list}

### What Could Be Better (Cons)
{cons_list}

---

## Review-Theme Summary: What Buyers Say

Across hundreds of verified buyer reviews, the dominant themes praise the intuitive ergonomics and rock-solid performance. The primary minor criticism revolves around the premium initial purchase cost, though most agree the longevity easily offsets the expense.

---

## Buying Recommendation: Who Is This For?

- **Ideal For:** {product.get('target_audience', 'Shoppers looking for top-tier reliability and performance.')}
- **Skip If:** You only need bare-minimum entry specs and have strict budget limits.

[👉 Check Current Pricing and Available Offers]({affiliate_url})
"""

    def _build_fallback_guide_body(self, category: str, products: List[Dict[str, Any]]) -> str:
        picks_markdown = []
        for i, p in enumerate(products[:4], 1):
            features_list = "\n".join(f"- {f}" for f in p.get("features", []))
            pros_list = "\n".join(f"- **Pro:** {pro}" for pro in p.get("pros", []))
            cons_list = "\n".join(f"- **Con:** {con}" for con in p.get("cons", []))
            picks_markdown.append(f"""### Pick #{i}: {p['name']}
- **Brand:** {p.get('brand', 'Top Brand')}
- **Price:** {p.get('price', '$99')} | **Rating:** {p.get('rating', 4.5)}/5 ⭐
- **Best For:** {p.get('target_audience', 'Discerning buyers')}

#### Highlights
{features_list}

{pros_list}
{cons_list}

[View Verified Deal on Merchant Store]({p.get('affiliate_url', '#')})
""")

        picks_section = "\n\n".join(picks_markdown)

        return f"""## Category Overview & Market Trends

In **{category}**, technological improvements have delivered greater efficiency, refined build quality, and smarter ecosystem connectivity. Our research evaluated top options across price-to-performance benchmarks.

## Side-by-Side Comparison

| Product | Price | Rating | Key Strength |
|---------|-------|--------|--------------|
{"".join(f"| {p['name']} | {p.get('price')} | {p.get('rating')}/5 | {p.get('pros', ['Great build'])[0][:30]}... |\n" for p in products[:4])}

---

## In-Depth Reviews of Category Leaders

{picks_section}

---

## Buying Recommendations & Decision Checklist

1. **Prioritize Durability Over Gimmicks:** Seek established brands with proven reliability records.
2. **Match Specs to Daily Needs:** Choose the tier that corresponds with your actual usage pattern.
3. **Verify Warranty & After-Sales:** High-quality manufacturers stand behind their hardware with multi-year warranties."""

    def save_articles(self, articles: List[Dict[str, Any]], output_dir: str = "./output/articles") -> List[Path]:
        """Save generated articles to disk."""
        out = Path(output_dir)
        out.mkdir(parents=True, exist_ok=True)
        saved_paths = []
        for a in articles:
            slug = a.get("slug", a.get("raw_title", "article").lower().replace(" ", "-")[:40])
            file_path = out / f"{slug}.md"
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(f"# {a.get('title', a.get('raw_title', ''))}\n\n{a.get('content', '')}")
            saved_paths.append(file_path)
        return saved_paths
