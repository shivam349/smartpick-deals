"""Tests for the 4-agent affiliate pipeline."""

import json
from pathlib import Path
import tempfile
import pytest

from affiliate_agent.agents.product_finder import ProductFinderAgent
from affiliate_agent.agents.research_writer import ResearchWriterAgent
from affiliate_agent.agents.seo_optimizer import SEOOptimizerAgent
from affiliate_agent.agents.publisher import PublisherAgent
from affiliate_agent.agents.orchestrator import AffiliatePipelineOrchestrator
from affiliate_agent.utils.cuelinks import CuelinksManager


@pytest.mark.asyncio
async def test_product_finder_discovers_products():
    cuelinks = CuelinksManager(publisher_id="test_pub_123")
    finder = ProductFinderAgent(cuelinks=cuelinks)

    products = await finder.discover_products(target_count=10, use_ai_research=False)
    assert len(products) >= 10
    first = products[0]
    assert "name" in first
    assert "category" in first
    assert "price" in first
    assert "rating" in first
    assert "features" in first
    assert "affiliate_url" in first
    assert "https://linksredirect.com/?cid=test_pub_123" in first["affiliate_url"]


@pytest.mark.asyncio
async def test_research_writer_generates_articles():
    finder = ProductFinderAgent()
    products = await finder.discover_products(target_count=5, use_ai_research=False)

    writer = ResearchWriterAgent()
    articles = await writer.generate_articles(products, target_article_count=4, use_ai=False)

    assert len(articles) >= 4
    for a in articles:
        assert "title" in a or "raw_title" in a
        assert "category" in a
        assert "content" in a
        assert "product_analysis" in a
        assert "comparison" in a
        assert "buying_recommendation" in a
        assert "review_theme_summary" in a


@pytest.mark.asyncio
async def test_seo_optimizer_enhances_articles():
    finder = ProductFinderAgent()
    products = await finder.discover_products(target_count=3, use_ai_research=False)

    writer = ResearchWriterAgent()
    raw_articles = await writer.generate_articles(products, target_article_count=2, use_ai=False)

    optimizer = SEOOptimizerAgent()
    optimized = await optimizer.optimize_articles(raw_articles, use_ai=False)

    assert len(optimized) == len(raw_articles)
    for a in optimized:
        # Check all required SEO items:
        # title, meta description, slug, H1/H2, FAQ, internal links, schema, affiliate disclosure
        assert "title" in a
        assert len(a["title"]) <= 65
        assert "slug" in a
        assert "h1" in a
        assert len(a["h2_headings"]) >= 2
        assert "faqs" in a
        assert len(a["faqs"]) >= 2
        assert "affiliate_disclosure" in a
        assert "seo_metadata" in a
        seo = a["seo_metadata"]
        assert len(seo["meta_description"]) >= 50
        assert "schema_jsonld" in seo
        assert "@context" in seo["schema_jsonld"]
        assert "internal_links" in seo


@pytest.mark.asyncio
async def test_publisher_builds_site_and_daily_update():
    with tempfile.TemporaryDirectory() as tmp_dir:
        site_dir = Path(tmp_dir) / "site"
        cuelinks = CuelinksManager(publisher_id="test_pub_123")
        finder = ProductFinderAgent(cuelinks=cuelinks)
        products = await finder.discover_products(target_count=5, use_ai_research=False)

        writer = ResearchWriterAgent(cuelinks=cuelinks)
        raw_articles = await writer.generate_articles(products, target_article_count=3, use_ai=False)

        optimizer = SEOOptimizerAgent(cuelinks=cuelinks)
        optimized = await optimizer.optimize_articles(raw_articles, use_ai=False)

        publisher = PublisherAgent(cuelinks=cuelinks)
        res = publisher.build_site(
            products=products,
            articles=optimized,
            output_dir=str(site_dir),
        )

        assert res["status"] == "published"
        assert (site_dir / "index.html").exists()
        assert (site_dir / "sitemap.xml").exists()
        assert (site_dir / "robots.txt").exists()
        assert (site_dir / "rss.xml").exists()
        assert (site_dir / "assets" / "css" / "styles.css").exists()

        # Check Cuelinks script in index.html
        index_html = (site_dir / "index.html").read_text(encoding="utf-8")
        assert "cuelink_publisher_id = 'test_pub_123';" in index_html
        assert "cuelinksv2.js" in index_html

        # Test daily update
        daily_res = publisher.run_daily_update(
            products=products,
            articles=optimized,
            output_dir=str(site_dir),
            reports_dir=str(Path(tmp_dir) / "reports"),
        )
        assert daily_res["status"] == "success"
        assert daily_res["deal_of_the_day"] is not None


@pytest.mark.asyncio
async def test_pipeline_orchestrator_end_to_end():
    with tempfile.TemporaryDirectory() as tmp_dir:
        out_dir = Path(tmp_dir) / "output"
        site_dir = Path(tmp_dir) / "site_output"

        orchestrator = AffiliatePipelineOrchestrator()
        result = await orchestrator.run_pipeline(
            target_products=10,
            target_pages=6,
            output_dir=str(out_dir),
            site_output_dir=str(site_dir),
            use_ai=False,
            verbose=False,
        )

        assert result["status"] == "success"
        assert "product_finder" in result["stages"]
        assert "research_writer" in result["stages"]
        assert "seo_optimizer" in result["stages"]
        assert "publisher" in result["stages"]
        assert (site_dir / "index.html").exists()
        assert (out_dir / "products_catalog.json").exists()
