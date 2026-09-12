"""Main orchestrator for the 4-agent AffiliateAgent system."""

import asyncio
from datetime import datetime
import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

from affiliate_agent.agents.product_finder import ProductFinderAgent
from affiliate_agent.agents.research_writer import ResearchWriterAgent
from affiliate_agent.agents.seo_optimizer import SEOOptimizerAgent
from affiliate_agent.agents.publisher import PublisherAgent
from affiliate_agent.config import Config
from affiliate_agent.core.gemini import GeminiClient, default_gemini_client
from affiliate_agent.core.supabase_manager import SupabaseManager, default_supabase_manager
from affiliate_agent.utils.cuelinks import CuelinksManager, default_cuelinks

logger = logging.getLogger(__name__)


class AffiliatePipelineOrchestrator:
    """Coordinates the 4-agent affiliate pipeline:

    ProductFinder -> ResearchWriter -> SEOOptimizer -> Publisher
    """

    def __init__(
        self,
        config: Optional[Config] = None,
        gemini_client: Optional[GeminiClient] = None,
        cuelinks: Optional[CuelinksManager] = None,
        supabase_manager: Optional[SupabaseManager] = None,
    ):
        self.config = config or Config.load()
        self.gemini = gemini_client or default_gemini_client
        self.cuelinks = cuelinks or default_cuelinks
        self.supabase = supabase_manager or default_supabase_manager

        # Initialize the 4 specialized agents
        self.product_finder = ProductFinderAgent(gemini_client=self.gemini, cuelinks=self.cuelinks)
        self.research_writer = ResearchWriterAgent(gemini_client=self.gemini, cuelinks=self.cuelinks)
        self.seo_optimizer = SEOOptimizerAgent(gemini_client=self.gemini, cuelinks=self.cuelinks)
        self.publisher = PublisherAgent(cuelinks=self.cuelinks)

    async def run_pipeline(
        self,
        categories: Optional[List[str]] = None,
        target_products: int = 25,
        target_pages: int = 15,
        output_dir: str = "./output",
        site_output_dir: str = "./site_output",
        use_ai: bool = True,
        verbose: bool = True,
    ) -> Dict[str, Any]:
        """Execute the full 4-stage pipeline."""
        start_time = datetime.now()
        results: Dict[str, Any] = {
            "status": "in_progress",
            "stages": {},
        }

        if verbose:
            print("\n" + "=" * 60)
            print(">>> STARTING AFFILIATE AGENT PIPELINE")
            print(f"Goal: {target_products} products | 5-10 categories | {target_pages} pages | Site publish")
            print("=" * 60 + "\n")

        # -------------------------------------------------------------
        # STAGE 1: ProductFinder
        # -------------------------------------------------------------
        if verbose:
            print("[Stage 1/4] ProductFinder: Discovering and cataloging products with Cuelinks links...")

        products = await self.product_finder.discover_products(
            categories=categories,
            target_count=target_products,
            use_ai_research=use_ai,
        )
        catalog_path = self.product_finder.save_catalog(products, f"{output_dir}/products_catalog.json")

        # Sync products to Supabase if configured
        if self.supabase.is_configured():
            products = self.supabase.save_products(products)
            if verbose:
                print(f"  [+] Synced {len(products)} products to Supabase")

        results["stages"]["product_finder"] = {
            "status": "completed",
            "products_count": len(products),
            "catalog_path": str(catalog_path),
        }
        if verbose:
            print(f"  [+] Found and formatted {len(products)} products across categories")
            print(f"  [+] Saved catalog to: {catalog_path}\n")

        # -------------------------------------------------------------
        # STAGE 2: ResearchWriter
        # -------------------------------------------------------------
        if verbose:
            print("[Stage 2/4] ResearchWriter: Synthesizing deep product analysis, pros/cons, comparisons...")

        raw_articles = await self.research_writer.generate_articles(
            catalog=products,
            target_article_count=target_pages,
            use_ai=use_ai,
        )
        article_paths = self.research_writer.save_articles(raw_articles, f"{output_dir}/articles")

        # Sync deep research for products to Supabase
        if self.supabase.is_configured():
            research_synced = 0
            for p in products:
                sub_id = p.get("supabase_id")
                if sub_id:
                    research_payload = {
                        "pros": p.get("pros", []),
                        "cons": p.get("cons", []),
                        "best_for": p.get("buying_recommendation", f"Users seeking top performance in {p.get('category')}"),
                        "not_for": p.get("not_for", "Shoppers on an ultra-strict budget"),
                        "comparison": p.get("comparison", f"Ranks at the top of its tier against competing {p.get('category')} options."),
                        "review_summary": p.get("review_theme_summary", f"Consistently high ratings across {p.get('rating_count', 1000)}+ customer reviews."),
                        "recommendation": p.get("buying_recommendation", "Highly recommended editor's choice."),
                        "source_data": {
                            "price": p.get("price"),
                            "rating": p.get("rating"),
                            "features": p.get("features", []),
                            "merchant": p.get("merchant"),
                        },
                    }
                    if self.supabase.save_research(sub_id, research_payload):
                        research_synced += 1
            if verbose:
                print(f"  [+] Synced {research_synced} product research records to Supabase")

        results["stages"]["research_writer"] = {
            "status": "completed",
            "articles_count": len(raw_articles),
            "articles_saved": len(article_paths),
        }
        if verbose:
            print(f"  [+] Authored {len(raw_articles)} comprehensive review and buying guide pages")
            print(f"  [+] Saved markdown drafts to: {output_dir}/articles\n")

        # -------------------------------------------------------------
        # STAGE 3: SEOOptimizer
        # -------------------------------------------------------------
        if verbose:
            print("[Stage 3/4] SEOOptimizer: Applying title/meta rules, H1/H2 checks, FAQs, schemas, disclosures...")

        optimized_articles = await self.seo_optimizer.optimize_articles(
            articles=raw_articles,
            site_url=self.config.site.url,
            use_ai=use_ai,
        )

        # Sync optimized articles to Supabase
        if self.supabase.is_configured():
            self.supabase.save_articles(optimized_articles)
            if verbose:
                print(f"  [+] Synced {len(optimized_articles)} articles to Supabase")

        results["stages"]["seo_optimizer"] = {
            "status": "completed",
            "optimized_count": len(optimized_articles),
        }
        if verbose:
            print(f"  [+] Optimized {len(optimized_articles)} articles with JSON-LD Schema, FAQs & internal links\n")

        # -------------------------------------------------------------
        # STAGE 4: Publisher
        # -------------------------------------------------------------
        if verbose:
            print("[Stage 4/4] Publisher: Building static website, injecting Cuelinks script, sitemap.xml...")

        publish_result = self.publisher.build_site(
            products=products,
            articles=optimized_articles,
            output_dir=site_output_dir,
            site_name=self.config.site.name,
            site_url=self.config.site.url,
        )

        results["stages"]["publisher"] = publish_result
        results["status"] = "success"
        results["duration_seconds"] = (datetime.now() - start_time).total_seconds()

        if verbose:
            print(f"  [+] Generated index.html (Homepage)")
            print(f"  [+] Generated {publish_result['pages_generated']['categories']} Category Hub pages")
            print(f"  [+] Generated {publish_result['pages_generated']['reviews_and_guides']} Article & Review pages")
            print(f"  [+] Generated sitemap.xml, robots.txt, and rss.xml")
            print(f"  [+] Injected Cuelinks monetization script & affiliate redirects")
            print(f"\n[***] SITE BUILD COMPLETE! Output directory: {publish_result['output_dir']}")
            print("=" * 60 + "\n")

        return results

    def run_daily_update(
        self,
        output_dir: str = "./output",
        site_output_dir: str = "./site_output",
    ) -> Dict[str, Any]:
        """Run daily automated price/deal refresh and rotate spotlight."""
        catalog_path = Path(output_dir) / "products_catalog.json"
        if not catalog_path.exists():
            # If no catalog exists yet, run discovery first
            loop = asyncio.get_event_loop()
            products = loop.run_until_complete(self.product_finder.discover_products())
        else:
            with open(catalog_path, encoding="utf-8") as f:
                products = json.load(f)

        # Load articles or generate basic set
        articles_dir = Path(output_dir) / "articles"
        articles = []
        if articles_dir.exists():
            for f in articles_dir.glob("*.md"):
                slug = f.stem
                with open(f, encoding="utf-8") as af:
                    content = af.read()
                articles.append({
                    "slug": slug,
                    "title": slug.replace("-", " ").title(),
                    "category": "General",
                    "content": content,
                    "type": "review" if "review" in slug else "buying_guide",
                    "seo_metadata": {
                        "meta_title": f"{slug.replace('-', ' ').title()} | 2026 Review",
                        "meta_description": f"Read our expert test results and verified deals on {slug}.",
                        "internal_links": [],
                        "schema_jsonld": {},
                    },
                    "reading_time_mins": 5,
                })

        return self.publisher.run_daily_update(
            products=products,
            articles=articles,
            output_dir=site_output_dir,
            reports_dir=f"{output_dir}/daily_reports",
        )


async def run_agent(
    prompt: str,
    working_dir: str | Path | None = None,
    model: str | None = None,
    max_turns: int | None = None,
    max_budget_usd: float | None = None,
    verbose: bool = False,
) -> Dict[str, Any]:
    """Fallback runner for CLI commands and chat interactions using Gemini."""
    client = GeminiClient(default_model=model or "gemini-2.5-flash")

    result_info: Dict[str, Any] = {
        "success": False,
        "output": [],
        "tools_used": ["Gemini"],
        "cost_usd": 0.0,
        "session_id": "gemini-session",
    }

    if not client.is_configured:
        # Informative response if API key is not yet added to .env
        message = (
            "AffiliateAgent is running. Note: GEMINI_API_KEY is not set in your .env file.\n\n"
            "To unlock live AI research and generation, add your GEMINI_API_KEY to .env:\n"
            "  GEMINI_API_KEY=your_key_here\n"
            "  CUELINKS_PUBLISHER_ID=your_publisher_id\n\n"
            "You can still generate and build the full 20+ product affiliate site using our "
            "curated research engine by running:\n"
            "  affiliate-agent pipeline"
        )
        result_info["output"].append(message)
        result_info["success"] = True
        return result_info

    try:
        response_text = await client.generate(
            prompt=prompt,
            system_instruction=(
                "You are AffiliateAgent, an expert AI assistant specializing in affiliate marketing, "
                "Cuelinks monetization, SEO content creation, and product discovery."
            ),
        )
        result_info["output"].append(response_text)
        result_info["success"] = True
    except Exception as e:
        logger.error("Error executing agent prompt: %s", e)
        result_info["output"].append(f"Error: {str(e)}")
        result_info["success"] = False

    return result_info
