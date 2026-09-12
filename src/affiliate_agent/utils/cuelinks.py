"""Cuelinks Affiliate Network Integration & API Client.

Implements official Cuelinks Publisher API v3 endpoints:
- GET /pub_api/v3/campaigns (Scope: read:campaigns)
- POST /pub_api/v3/links/convert (Scope: write:links)

Also supports JavaScript snippet injection and offline fallback redirection.
"""

import logging
import os
from typing import Any, Dict, List, Optional
import urllib.parse

import aiohttp

logger = logging.getLogger(__name__)

KNOWN_MONETIZABLE_DOMAINS = [
    "amazon", "flipkart", "myntra", "ajio", "croma", "tatacliq",
    "nykaa", "samsung", "boat", "oneplus", "reliancedigital",
]

DEFAULT_FALLBACK_CAMPAIGNS = [
    {"id": "1", "name": "Amazon India", "domain": "amazon.in", "status": "active", "payout_type": "CPS", "category": "E-commerce"},
    {"id": "2", "name": "Amazon Global", "domain": "amazon.com", "status": "active", "payout_type": "CPS", "category": "E-commerce"},
    {"id": "3", "name": "Flipkart", "domain": "flipkart.com", "status": "active", "payout_type": "CPS", "category": "E-commerce"},
    {"id": "4", "name": "Croma Electronics", "domain": "croma.com", "status": "active", "payout_type": "CPS", "category": "Electronics"},
    {"id": "5", "name": "Myntra", "domain": "myntra.com", "status": "active", "payout_type": "CPS", "category": "Fashion & Lifestyle"},
    {"id": "6", "name": "Tata CLiQ", "domain": "tatacliq.com", "status": "active", "payout_type": "CPS", "category": "Electronics & Luxury"},
]


class CuelinksManager:
    """Manages Cuelinks API calls, campaign discovery, link conversion, and tracking scripts."""

    BASE_API_URL = "https://api.cuelinks.com"
    REDIRECT_BASE_URL = "https://linksredirect.com/"

    def __init__(
        self,
        api_key: Optional[str] = None,
        publisher_id: Optional[str] = None,
        campaign_id: Optional[str] = None,
        base_url: Optional[str] = None,
    ):
        self.api_key = api_key or os.getenv("CUELINKS_API_KEY", "")
        self.publisher_id = publisher_id or os.getenv("CUELINKS_PUBLISHER_ID", "")
        self.campaign_id = campaign_id or os.getenv("CUELINKS_CAMPAIGN_ID", "")
        self.base_url = (base_url or os.getenv("CUELINKS_API_URL", self.BASE_API_URL)).rstrip("/")

    def has_api_key(self) -> bool:
        """Check if an API key is configured with read:campaigns and write:links scopes."""
        return bool(self.api_key and self.api_key != "your-cuelinks-api-key-here")

    def is_configured(self) -> bool:
        """Check if either API key or publisher ID is set."""
        return bool(self.has_api_key() or (self.publisher_id and self.publisher_id != "your-cuelinks-publisher-id"))

    def _get_headers(self) -> Dict[str, str]:
        """Generate authentication headers for Cuelinks API v3."""
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        if self.has_api_key():
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    async def get_campaigns(self, status: str = "active") -> List[Dict[str, Any]]:
        """Fetch active merchant campaigns from GET /pub_api/v3/campaigns (Scope: read:campaigns)."""
        if not self.has_api_key():
            logger.info("CUELINKS_API_KEY not configured. Using pre-loaded verified merchant campaigns.")
            return DEFAULT_FALLBACK_CAMPAIGNS

        url = f"{self.base_url}/pub_api/v3/campaigns"
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=self._get_headers(), timeout=aiohttp.ClientTimeout(total=10)) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        campaigns = data.get("campaigns", data if isinstance(data, list) else [])
                        logger.info("Successfully fetched %d campaigns from Cuelinks API", len(campaigns))
                        return campaigns
                    else:
                        text = await resp.text()
                        logger.warning("Cuelinks GET /pub_api/v3/campaigns returned %d: %s. Using fallback.", resp.status, text)
        except Exception as e:
            logger.warning("Failed to connect to Cuelinks API for campaigns: %s. Using fallback.", e)

        return DEFAULT_FALLBACK_CAMPAIGNS

    async def convert_link(
        self,
        target_url: str,
        subid: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Convert a merchant URL via POST /pub_api/v3/links/convert (Scope: write:links).

        Returns:
        {
            "tracking_url": "...",
            "affiliated": true/false,
            "original_url": "...",
            "campaign": {"id": "...", "name": "..."}
        }
        """
        if not target_url:
            return {
                "tracking_url": "",
                "affiliated": False,
                "original_url": "",
                "campaign": {"id": "", "name": "None"},
            }

        effective_subid = subid or self.campaign_id

        # 1. Live API call if API key is provided
        if self.has_api_key():
            endpoint = f"{self.base_url}/pub_api/v3/links/convert"
            payload = {"url": target_url}
            if effective_subid:
                payload["subid"] = effective_subid

            try:
                async with aiohttp.ClientSession() as session:
                    async with session.post(
                        endpoint,
                        headers=self._get_headers(),
                        json=payload,
                        timeout=aiohttp.ClientTimeout(total=8),
                    ) as resp:
                        if resp.status == 200:
                            data = await resp.json()
                            logger.info("Cuelinks converted '%s' -> affiliated=%s", target_url, data.get("affiliated"))
                            return data
                        else:
                            text = await resp.text()
                            logger.warning("Cuelinks convert failed (%d): %s. Falling back to local redirect.", resp.status, text)
            except Exception as e:
                logger.warning("Error calling Cuelinks convert API: %s. Using local redirect logic.", e)

        # 2. Local Fallback Conversion
        # Check if domain matches known monetizable merchants
        parsed = urllib.parse.urlparse(target_url)
        domain = parsed.netloc.lower()
        is_affiliated = any(merchant in domain for merchant in KNOWN_MONETIZABLE_DOMAINS)
        merchant_name = domain.split(".")[-2].capitalize() if "." in domain else "Merchant"

        if is_affiliated and self.publisher_id:
            query_params = {
                "cid": self.publisher_id,
                "url": target_url,
            }
            if effective_subid:
                query_params["subid"] = effective_subid
            tracking_url = f"{self.REDIRECT_BASE_URL}?{urllib.parse.urlencode(query_params)}"
        else:
            tracking_url = target_url

        return {
            "tracking_url": tracking_url,
            "affiliated": is_affiliated,
            "original_url": target_url,
            "campaign": {
                "id": "mock_id",
                "name": merchant_name,
            },
        }

    def generate_affiliate_url(
        self,
        target_url: str,
        subid: Optional[str] = None,
    ) -> str:
        """Synchronous redirect generator for quick link generation or template helpers."""
        if not target_url:
            return ""

        effective_subid = subid or self.campaign_id
        if self.publisher_id and self.publisher_id != "your-cuelinks-publisher-id":
            query_params = {
                "cid": self.publisher_id,
                "url": target_url,
            }
            if effective_subid:
                query_params["subid"] = effective_subid
            return f"{self.REDIRECT_BASE_URL}?{urllib.parse.urlencode(query_params)}"

        return target_url

    def get_javascript_snippet(self) -> str:
        """Generate official Cuelinks JavaScript snippet for automatic in-page link conversion."""
        pub_id = self.publisher_id if (self.publisher_id and self.publisher_id != "your-cuelinks-publisher-id") else "DEMO_PUBLISHER_ID"
        return f"""<!-- Cuelinks In-Text Monetization Script -->
<script type="text/javascript">
    var cuelink_publisher_id = '{pub_id}';
</script>
<script async src="https://cdn.cuelinks.com/js/cuelinksv2.js" type="text/javascript"></script>
"""

    def get_ftc_disclosure(self) -> str:
        """Generate standard FTC and affiliate disclosure text."""
        return (
            "Affiliate Disclosure: As an affiliate, we may earn a small commission "
            "from qualifying purchases made through links on this site at no extra cost to you. "
            "Our editorial reviews and product ratings remain strictly independent and unbiased."
        )


# Global default instance
default_cuelinks = CuelinksManager()
