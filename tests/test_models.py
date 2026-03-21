"""Tests for data models."""

from affiliate_agent.models import (
    AffiliateProgram,
    ContentPiece,
    ContentType,
    KeywordData,
    NicheAnalysis,
    PerformanceReport,
    ProductRecommendation,
)


def test_keyword_data():
    kw = KeywordData(keyword="best vpn", search_volume=50000, difficulty=45, cpc=3.50)
    assert kw.keyword == "best vpn"
    assert kw.search_volume == 50000
    assert kw.intent == "informational"


def test_niche_analysis():
    analysis = NicheAnalysis(
        niche="VPN",
        score=75.0,
        competition_level="high",
        estimated_monthly_traffic=100000,
        top_keywords=[KeywordData(keyword="best vpn")],
        summary="Competitive but profitable niche.",
    )
    assert analysis.score == 75.0
    assert len(analysis.top_keywords) == 1


def test_niche_analysis_score_bounds():
    analysis = NicheAnalysis(niche="test", score=0)
    assert analysis.score == 0

    analysis = NicheAnalysis(niche="test", score=100)
    assert analysis.score == 100


def test_affiliate_program():
    program = AffiliateProgram(
        name="Amazon Associates",
        commission_rate="1-10%",
        cookie_duration="24 hours",
        category="General",
    )
    assert program.name == "Amazon Associates"
    assert program.pros == []


def test_product_recommendation():
    product = ProductRecommendation(
        name="NordVPN",
        description="Top-rated VPN service",
        price_range="$3-12/month",
        unique_selling_points=["Fast speeds", "No-log policy"],
    )
    assert len(product.unique_selling_points) == 2


def test_content_piece():
    content = ContentPiece(
        title="Best VPN for 2026",
        content_type=ContentType.ROUNDUP,
        target_keyword="best vpn",
        secondary_keywords=["top vpn", "vpn review"],
    )
    assert content.content_type == ContentType.ROUNDUP
    assert len(content.secondary_keywords) == 2


def test_performance_report():
    report = PerformanceReport(
        period="March 2026",
        total_clicks=5000,
        total_conversions=150,
        total_revenue=4500.00,
        conversion_rate=3.0,
    )
    assert report.conversion_rate == 3.0
    assert report.total_revenue == 4500.00
