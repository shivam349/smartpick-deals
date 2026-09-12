"""Tests for Cuelinks affiliate link integration and API endpoints."""

import pytest
from affiliate_agent.utils.cuelinks import CuelinksManager


def test_cuelinks_unconfigured_fallback():
    manager = CuelinksManager(publisher_id="", api_key="")
    assert not manager.is_configured()
    url = "https://www.amazon.in/dp/B09V4FN5HN"
    # When unconfigured, it returns the original url safely
    assert manager.generate_affiliate_url(url) == url


def test_cuelinks_generate_redirect_url():
    manager = CuelinksManager(publisher_id="123456", campaign_id="daily_deals")
    assert manager.is_configured()
    target_url = "https://www.amazon.in/dp/B09V4FN5HN"
    affiliate_url = manager.generate_affiliate_url(target_url)

    assert "https://linksredirect.com/?" in affiliate_url
    assert "cid=123456" in affiliate_url
    assert "subid=daily_deals" in affiliate_url
    assert "amazon.in" in affiliate_url


def test_cuelinks_script_tag():
    manager = CuelinksManager(publisher_id="123456")
    snippet = manager.get_javascript_snippet()
    assert "cuelink_publisher_id = '123456';" in snippet
    assert "cuelinksv2.js" in snippet


def test_ftc_disclosure():
    manager = CuelinksManager()
    disclosure = manager.get_ftc_disclosure()
    assert "Affiliate Disclosure" in disclosure
    assert "commission" in disclosure


@pytest.mark.asyncio
async def test_cuelinks_get_campaigns_discovery():
    """Test campaign discovery (GET /pub_api/v3/campaigns fallback/mock)."""
    manager = CuelinksManager()
    campaigns = await manager.get_campaigns()
    assert len(campaigns) >= 3
    assert any("Amazon" in c.get("name", "") for c in campaigns)
    assert any("Flipkart" in c.get("name", "") for c in campaigns)


@pytest.mark.asyncio
async def test_cuelinks_convert_link_affiliated_true():
    """Test link conversion (POST /pub_api/v3/links/convert) returning affiliated=True."""
    manager = CuelinksManager(publisher_id="123456")
    amazon_url = "https://www.amazon.in/dp/B09V4FN5HN"

    res = await manager.convert_link(amazon_url, subid="test_subid")
    assert res["affiliated"] is True
    assert "tracking_url" in res
    assert "linksredirect.com" in res["tracking_url"]
    assert "subid=test_subid" in res["tracking_url"]


@pytest.mark.asyncio
async def test_cuelinks_convert_link_affiliated_false():
    """Test link conversion for an unmonetized domain returning affiliated=False."""
    manager = CuelinksManager(publisher_id="123456")
    unaffiliated_url = "https://unknown-random-shop.org/item/123"

    res = await manager.convert_link(unaffiliated_url)
    assert res["affiliated"] is False
    assert res["original_url"] == unaffiliated_url
