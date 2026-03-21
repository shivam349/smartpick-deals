"""Tests for custom MCP tools."""

import json

import pytest

from affiliate_agent.tools.content_tools import generate_content_brief, optimize_content_seo
from affiliate_agent.tools.performance_tools import calculate_affiliate_roi, generate_performance_report
from affiliate_agent.tools.product_tools import compare_affiliate_programs, structure_affiliate_program


@pytest.mark.asyncio
async def test_generate_content_brief_review():
    result = await generate_content_brief.handler(
        {"content_type": "review", "target_keyword": "best laptop stand", "context": "home office"}
    )
    text = result["content"][0]["text"]
    data = json.loads(text)
    assert data["content_type"] == "review"
    assert data["target_keyword"] == "best laptop stand"
    assert "sections" in str(data)


@pytest.mark.asyncio
async def test_generate_content_brief_comparison():
    result = await generate_content_brief.handler(
        {"content_type": "comparison", "target_keyword": "macbook vs dell", "context": "laptops"}
    )
    text = result["content"][0]["text"]
    data = json.loads(text)
    assert data["content_type"] == "comparison"


@pytest.mark.asyncio
async def test_optimize_content_seo():
    content = "## Best Laptop Stand Review\n\n" + "best laptop stand " * 50 + "\n## Features\n## Conclusion"
    result = await optimize_content_seo.handler(
        {"content": content, "target_keyword": "best laptop stand"}
    )
    text = result["content"][0]["text"]
    data = json.loads(text)
    assert "word_count" in data
    assert "keyword_density" in data
    assert "checks" in data


@pytest.mark.asyncio
async def test_structure_affiliate_program():
    result = await structure_affiliate_program.handler(
        {
            "name": "Amazon Associates",
            "url": "https://affiliate-program.amazon.com",
            "commission_rate": "1-10%",
            "cookie_duration": "24 hours",
            "category": "General",
            "notes": "Largest marketplace",
        }
    )
    text = result["content"][0]["text"]
    data = json.loads(text)
    assert data["name"] == "Amazon Associates"


@pytest.mark.asyncio
async def test_compare_affiliate_programs():
    programs = [
        {"name": "Program A", "commission_rate": "10%"},
        {"name": "Program B", "commission_rate": "15%"},
    ]
    result = await compare_affiliate_programs.handler({"programs_json": json.dumps(programs)})
    text = result["content"][0]["text"]
    data = json.loads(text)
    assert data["programs_compared"] == 2


@pytest.mark.asyncio
async def test_compare_affiliate_programs_invalid_json():
    result = await compare_affiliate_programs.handler({"programs_json": "not json"})
    text = result["content"][0]["text"]
    assert "Error" in text


@pytest.mark.asyncio
async def test_calculate_affiliate_roi_profitable():
    result = await calculate_affiliate_roi.handler(
        {"total_cost": 500.0, "total_revenue": 2000.0, "time_period_days": 30}
    )
    text = result["content"][0]["text"]
    data = json.loads(text)
    assert data["calculations"]["profit"] == 1500.0
    assert data["calculations"]["roi_percentage"] == 300.0
    assert data["assessment"] == "profitable"


@pytest.mark.asyncio
async def test_calculate_affiliate_roi_unprofitable():
    result = await calculate_affiliate_roi.handler(
        {"total_cost": 2000.0, "total_revenue": 500.0, "time_period_days": 30}
    )
    text = result["content"][0]["text"]
    data = json.loads(text)
    assert data["assessment"] == "unprofitable"


@pytest.mark.asyncio
async def test_generate_performance_report():
    metrics = {"clicks": 1000, "conversions": 50, "revenue": 1500}
    result = await generate_performance_report.handler(
        {"metrics_json": json.dumps(metrics), "period": "March 2026"}
    )
    text = result["content"][0]["text"]
    data = json.loads(text)
    assert data["period"] == "March 2026"
    assert "analysis_framework" in data
