"""ProductFinder Agent: Discovers and structures affiliate products across categories."""

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

from affiliate_agent.core.gemini import GeminiClient, default_gemini_client
from affiliate_agent.utils.cuelinks import CuelinksManager, default_cuelinks

logger = logging.getLogger(__name__)

DEFAULT_CATEGORIES = [
    "Smart Home & Automation",
    "Audio & Noise-Cancelling Headphones",
    "Ergonomic Office & Workstation",
    "Fitness Trackers & Smartwatches",
    "Smart Kitchen & Coffee Gadgets",
    "Gaming Gear & PC Accessories",
    "Home Security & Smart Cameras",
]

SEED_PRODUCTS = [
    # Smart Home & Automation
    {
        "name": "Philips Hue Smart LED Starter Kit",
        "category": "Smart Home & Automation",
        "brand": "Philips",
        "price": "$129.99",
        "rating": 4.7,
        "rating_count": 8420,
        "target_audience": "Smart home enthusiasts and mood lighting creators",
        "merchant_url": "https://www.amazon.com/dp/B07351P1JK",
        "features": ["16 million colors", "Zigbee + Bluetooth control", "Voice control via Alexa/Google"],
        "pros": ["Unmatched color accuracy", "Rock-solid ecosystem reliability", "Deep third-party integrations"],
        "cons": ["Requires Hue Bridge for full features", "Higher price than budget Wi-Fi bulbs"],
        "summary": "The gold standard of smart lighting systems offering rock-solid connectivity and vibrant colors.",
    },
    {
        "name": "Ecobee Smart Thermostat Premium",
        "category": "Smart Home & Automation",
        "brand": "Ecobee",
        "price": "$249.99",
        "rating": 4.6,
        "rating_count": 3150,
        "target_audience": "Energy-conscious homeowners and smart home upgraders",
        "merchant_url": "https://www.amazon.com/dp/B09XXS4VVR",
        "features": ["Built-in air quality monitor", "SmartSensor included", "Siri & Alexa built-in"],
        "pros": ["Includes remote room sensor", "Sleek zinc body with glass display", "Proven energy savings up to 26%"],
        "cons": ["Premium price point", "Setup requires C-wire or included Power Extender Kit"],
        "summary": "High-end smart thermostat with room sensing and built-in air quality tracking.",
    },
    {
        "name": "Roborock S8 Pro Ultra Robot Vacuum",
        "category": "Smart Home & Automation",
        "brand": "Roborock",
        "price": "$999.99",
        "rating": 4.8,
        "rating_count": 1920,
        "target_audience": "Busy professionals and pet owners seeking hands-free cleaning",
        "merchant_url": "https://www.amazon.com/dp/B0BSF8WZ8N",
        "features": ["6000Pa extreme suction", "RockDock all-in-one docking system", "VibraRise 2.0 mopping"],
        "pros": ["Automatic mop washing and warm air drying", "Flawless obstacle avoidance", "Dual roller brushes prevent tangles"],
        "cons": ["Dock has a large footprint", "Substantial investment"],
        "summary": "Ultimate hands-free automated vacuum and mopping system with self-washing dock.",
    },

    # Audio & Noise-Cancelling Headphones
    {
        "name": "Sony WH-1000XM5 Wireless Headphones",
        "category": "Audio & Noise-Cancelling Headphones",
        "brand": "Sony",
        "price": "$398.00",
        "rating": 4.7,
        "rating_count": 14500,
        "target_audience": "Frequent travelers, remote workers, and audiophiles",
        "merchant_url": "https://www.amazon.com/dp/B09XS7JWHH",
        "features": ["Auto NC Optimizer with 8 microphones", "30-hour battery life", "LDAC Hi-Res Audio"],
        "pros": ["Industry-leading active noise cancellation", "Extremely comfortable lightweight design", "Crystal-clear microphone call quality"],
        "cons": ["Earcups do not fold inward like XM4", "Case is relatively bulky"],
        "summary": "The pinnacle of commuter noise-cancelling headphones with superb acoustics and call quality.",
    },
    {
        "name": "Bose QuietComfort Ultra Earbuds",
        "category": "Audio & Noise-Cancelling Headphones",
        "brand": "Bose",
        "price": "$299.00",
        "rating": 4.5,
        "rating_count": 5200,
        "target_audience": "Commuters, runners, and everyday music lovers",
        "merchant_url": "https://www.amazon.com/dp/B0CCZ26B5V",
        "features": ["CustomTune sound calibration", "Immersive Audio spatial mode", "IPX4 sweat resistance"],
        "pros": ["Best-in-class in-ear noise cancellation", "Unbeatable ear-tip comfort and stability", "Engaging spatial audio"],
        "cons": ["No wireless charging out of the box without accessory cover", "Battery life average with spatial audio enabled"],
        "summary": "Ultra-portable wireless earbuds delivering unrivaled active noise cancellation in a compact package.",
    },
    {
        "name": "Sennheiser Momentum 4 Wireless",
        "category": "Audio & Noise-Cancelling Headphones",
        "brand": "Sennheiser",
        "price": "$279.95",
        "rating": 4.6,
        "rating_count": 4100,
        "target_audience": "Audiophiles who demand unmatched battery stamina and audiophile sound",
        "merchant_url": "https://www.amazon.com/dp/B0B6GHW1X5",
        "features": ["Massive 60-hour battery life", "42mm audiophile-grade dynamic transducer", "Adaptive noise cancellation"],
        "pros": ["Insane 60h battery endurance", "Warm, detailed, open soundstage", "Comfortable memory foam padding"],
        "cons": ["ANC slightly behind Sony and Bose", "Touch controls can occasionally misfire"],
        "summary": "Audiophile tuning meets a monster 60-hour battery life for serious music lovers.",
    },

    # Ergonomic Office & Workstation
    {
        "name": "Herman Miller Aeron Ergonomic Chair",
        "category": "Ergonomic Office & Workstation",
        "brand": "Herman Miller",
        "price": "$1295.00",
        "rating": 4.9,
        "rating_count": 7800,
        "target_audience": "Full-time remote workers and professionals suffering from posture issues",
        "merchant_url": "https://www.amazon.com/dp/B01MDV2B6A",
        "features": ["Pellicle breathable mesh", "PostureFit SL adjustable lumbar support", "Fully adjustable armrests"],
        "pros": ["Legendary 12-year warranty", "Zero pressure points with mesh suspension", "Promotes healthy upright posture"],
        "cons": ["High upfront cost", "Rigid outer frame limits lounging positions"],
        "summary": "The undisputed benchmark of ergonomic office chairs built to support 10+ hour workdays.",
    },
    {
        "name": "Logitech MX Master 3S Wireless Mouse",
        "category": "Ergonomic Office & Workstation",
        "brand": "Logitech",
        "price": "$99.99",
        "rating": 4.8,
        "rating_count": 22300,
        "target_audience": "Developers, designers, and spreadsheet power users",
        "merchant_url": "https://www.amazon.com/dp/B09HM94VDS",
        "features": ["MagSpeed electromagnetic scrolling (1,000 lines/sec)", "8K DPI sensor on glass", "Quiet Click switches"],
        "pros": ["Near-silent satisfying clicks", "Ergonomic thumb rest with gesture button", "Multi-computer Flow cross-transfer"],
        "cons": ["Right-hand ergonomic orientation only", "Slightly heavy for fast-paced gaming"],
        "summary": "The premier productivity mouse with whisper-quiet clicks and hyper-fast electromagnetic scrolling.",
    },
    {
        "name": "Uplift V2 Commercial Standing Desk",
        "category": "Ergonomic Office & Workstation",
        "brand": "Uplift",
        "price": "$649.00",
        "rating": 4.8,
        "rating_count": 4890,
        "target_audience": "Home office workers wanting dual-motor stability and height adjustment",
        "merchant_url": "https://www.amazon.com/dp/B082BKL7M2",
        "features": ["Dual motor 355 lb lifting capacity", "Commercial crossbar stability", "Advanced memory keypad"],
        "pros": ["Zero wobble even at max height", "Expansive desktop sizing and wood options", "Built-in cable management pathways"],
        "cons": ["Assembly requires patience due to heavy steel components", "High shipping weight"],
        "summary": "Heavy-duty motorized standing desk delivering uncompromised stability and smooth adjustment.",
    },

    # Fitness Trackers & Smartwatches
    {
        "name": "Garmin Forerunner 965",
        "category": "Fitness Trackers & Smartwatches",
        "brand": "Garmin",
        "price": "$599.99",
        "rating": 4.8,
        "rating_count": 2840,
        "target_audience": "Runners, triathletes, and endurance athletes",
        "merchant_url": "https://www.amazon.com/dp/B0BX798P6L",
        "features": ["1.4-inch brilliant AMOLED touchscreen", "Titanium bezel", "Full-color onboard mapping & GPS"],
        "pros": ["Up to 23 days battery life in smartwatch mode", "Deep training readiness and HRV metrics", "Multi-band GNSS accuracy"],
        "cons": ["Limited third-party smartwatch apps", "Premium price for dedicated runners"],
        "summary": "Elite GPS smartwatch featuring stunning AMOLED display and advanced endurance training analytics.",
    },
    {
        "name": "Apple Watch Ultra 2",
        "category": "Fitness Trackers & Smartwatches",
        "brand": "Apple",
        "price": "$799.00",
        "rating": 4.8,
        "rating_count": 6700,
        "target_audience": "iPhone users, outdoor adventurers, and fitness enthusiasts",
        "merchant_url": "https://www.amazon.com/dp/B0CHX3W1V7",
        "features": ["3000-nit brightest display", "S9 SiP chip with Double Tap", "Precision dual-frequency GPS"],
        "pros": ["Titanium rugged case with flat sapphire glass", "Rich app ecosystem and cellular capability", "72-hour low power battery life"],
        "cons": ["Only compatible with iOS devices", "Chunky 49mm case not for small wrists"],
        "summary": "The ultimate adventure and sports smartwatch seamlessly integrated into the Apple ecosystem.",
    },
    {
        "name": "Whoop 4.0 Activity & Recovery Band",
        "category": "Fitness Trackers & Smartwatches",
        "brand": "Whoop",
        "price": "$239.00",
        "rating": 4.4,
        "rating_count": 3400,
        "target_audience": "Athletes focused on strain, sleep coaching, and HRV recovery",
        "merchant_url": "https://www.amazon.com/dp/B09J5DNL9G",
        "features": ["Screenless minimalist band", "24/7 continuous health tracking", "Waterproof on-the-go battery pack"],
        "pros": ["Distraction-free screenless design", "Unmatched recovery and sleep coaching algorithm", "Lightweight and discreet"],
        "cons": ["Requires ongoing subscription membership", "No screen for glanceable time or notifications"],
        "summary": "Screenless biometric tracker designed specifically for recovery, sleep tracking, and strain optimization.",
    },

    # Smart Kitchen & Coffee Gadgets
    {
        "name": "Breville Barista Touch Impress Espresso Machine",
        "category": "Smart Kitchen & Coffee Gadgets",
        "brand": "Breville",
        "price": "$1499.95",
        "rating": 4.8,
        "rating_count": 1820,
        "target_audience": "Coffee lovers wanting third-wave specialty espresso at home",
        "merchant_url": "https://www.amazon.com/dp/B0C39L41XG",
        "features": ["Assisted tamping with 10kg pressure", "Auto MilQ microfoam technology", "Touchscreen recipe step-by-step guidance"],
        "pros": ["Takes the guesswork out of espresso dosing and tamping", "Alternative milk microfoam calibration", "Heats up in 3 seconds"],
        "cons": ["Requires routine descaling and maintenance", "Premium financial investment"],
        "summary": "Automated bean-to-cup espresso mastery with assisted tamping and dairy/plant-milk microfoam.",
    },
    {
        "name": "Ninja Foodi 6-in-1 DualZone Air Fryer (XL 10-Qt)",
        "category": "Smart Kitchen & Coffee Gadgets",
        "brand": "Ninja",
        "price": "$199.99",
        "rating": 4.8,
        "rating_count": 34200,
        "target_audience": "Families, meal preppers, and health-conscious home chefs",
        "merchant_url": "https://www.amazon.com/dp/B089TQWJKK",
        "features": ["2 independent 5-qt baskets", "Smart Finish & Match Cook technology", "6 versatile cooking functions"],
        "pros": ["Cook two distinct dishes simultaneously and finish at the same moment", "Dishwasher safe crisper plates", "Huge capacity"],
        "cons": ["Takes up significant countertop space", "Heavier unit to store away"],
        "summary": "Dual-basket air fryer allowing simultaneous cooking of entrees and sides with sync-finish tech.",
    },
    {
        "name": "Fellow Stagg EKG Electric Gooseneck Kettle",
        "category": "Smart Kitchen & Coffee Gadgets",
        "brand": "Fellow",
        "price": "$165.00",
        "rating": 4.7,
        "rating_count": 6900,
        "target_audience": "Pour-over coffee aficionados and tea purists",
        "merchant_url": "https://www.amazon.com/dp/B077JBQZPX",
        "features": ["Precision pour spout", "To-the-degree variable temperature control", "60-minute temperature hold mode"],
        "pros": ["Sleek museum-grade minimalist aesthetics", "Counterbalanced handle for controlled pour flow", "LCD screen with built-in stopwatch"],
        "cons": ["0.9L capacity is compact for large batches", "Exterior gets hot to touch"],
        "summary": "Artisan pour-over kettle engineered with laser-accurate temperature stability and flawless flow rate.",
    },

    # Gaming Gear & PC Accessories
    {
        "name": "SteelSeries Arctis Nova Pro Wireless",
        "category": "Gaming Gear & PC Accessories",
        "brand": "SteelSeries",
        "price": "$349.99",
        "rating": 4.6,
        "rating_count": 4600,
        "target_audience": "Competitive PC and console gamers wanting dual-system connectivity",
        "merchant_url": "https://www.amazon.com/dp/B09ZWKD9TF",
        "features": ["Infinity Power hot-swappable dual battery system", "Active Noise Cancellation", "Multi-System Connect OLED Base Station"],
        "pros": ["Never plug in to charge thanks to hot-swap batteries", "Simultaneous 2.4GHz and Bluetooth audio", "Superb parametric EQ customization"],
        "cons": ["Microphone is good but not broadcast condenser quality", "ANC earcups have slight protrusion"],
        "summary": "Elite wireless gaming headset with hot-swappable dual batteries and audiophile DAC hub.",
    },
    {
        "name": "Logitech G Pro X Superlight 2 Lightspeed",
        "category": "Gaming Gear & PC Accessories",
        "brand": "Logitech G",
        "price": "$159.00",
        "rating": 4.8,
        "rating_count": 8900,
        "target_audience": "Esports competitors and FPS gamers demanding zero latency and featherweight feel",
        "merchant_url": "https://www.amazon.com/dp/B07NSSPV9S",
        "features": ["Lightforce hybrid optical-mechanical switches", "HERO 2 sensor up to 32,000 DPI", "Sub-60 gram ultra-lightweight design"],
        "pros": ["Incredible 60g featherweight balance", "Crisp optical click response with zero debounce delay", "95-hour battery life"],
        "cons": ["No RGB illumination (to save weight)", "Simple 5-button layout may lack MMO bindings"],
        "summary": "The quintessential esports wireless mouse trusted by top tournament champions worldwide.",
    },
    {
        "name": "Keychron Q1 Pro Custom Mechanical Keyboard",
        "category": "Gaming Gear & PC Accessories",
        "brand": "Keychron",
        "price": "$199.00",
        "rating": 4.7,
        "rating_count": 2100,
        "target_audience": "Mechanical keyboard connoisseurs, typists, and gamers",
        "merchant_url": "https://www.amazon.com/dp/B0BSGMFXMV",
        "features": ["Full CNC machined aluminum body", "Double-gasket mount design", "QMK/VIA wireless custom remapping"],
        "pros": ["Unbelievably deep, creamy acoustic typing profile", "Hot-swappable switches with South-facing LEDs", "Bluetooth + wired multi-device switching"],
        "cons": ["Heavy aluminum body is not portable", "Keycaps are non-shine-through PBT"],
        "summary": "Enthusiast-grade custom mechanical keyboard featuring double-gasket dampening and CNC aluminum chassis.",
    },

    # Home Security & Smart Cameras
    {
        "name": "EufyCam S330 (eufyCam 3) 2-Cam Kit",
        "category": "Home Security & Smart Cameras",
        "brand": "Eufy Security",
        "price": "$549.99",
        "rating": 4.6,
        "rating_count": 3950,
        "target_audience": "Homeowners who refuse to pay monthly subscription fees for cloud storage",
        "merchant_url": "https://www.amazon.com/dp/B0B68T8T26",
        "features": ["4K Ultra HD day & night clarity", "Integrated solar panel on every camera", "BionicMind AI face recognition with local storage up to 16TB"],
        "pros": ["Zero monthly subscription fees forever", "Forever Power with only 2 hours of daily direct sunlight", "Expandable local storage"],
        "cons": ["Higher initial hardware purchase cost", "HomeBase 3 required for AI processing"],
        "summary": "Subscription-free 4K outdoor security camera system powered by integrated solar panels and local AI.",
    },
    {
        "name": "Ring Video Doorbell Pro 2",
        "category": "Home Security & Smart Cameras",
        "brand": "Ring",
        "price": "$249.99",
        "rating": 4.6,
        "rating_count": 12100,
        "target_audience": "Homeowners wanting head-to-toe package detection and radar bird's eye view",
        "merchant_url": "https://www.amazon.com/dp/B086Q54K53",
        "features": ["1536p HD Head-to-Toe Video", "3D Motion Detection with Bird's Eye View", "Two-Way Talk with Audio+"],
        "pros": ["Tall 1:1 aspect ratio captures packages on doorstep", "Radar distance detection reduces false alarms", "Crisp audio clarity"],
        "cons": ["Requires hardwired installation", "Ring Protect subscription required for video recording archive"],
        "summary": "Premium wired smart video doorbell featuring radar-assisted 3D motion tracking and package view.",
    },
    {
        "name": "Blink Outdoor 4 Wireless Smart Camera",
        "category": "Home Security & Smart Cameras",
        "brand": "Blink",
        "price": "$99.99",
        "rating": 4.4,
        "rating_count": 18700,
        "target_audience": "Renters and budget-conscious homeowners wanting quick wire-free placement",
        "merchant_url": "https://www.amazon.com/dp/B0B1N5K5S8",
        "features": ["2-year battery life on 2 AA lithium batteries", "1080p HD video with infrared night vision", "Weather-resistant IP65"],
        "pros": ["Extremely affordable multi-camera packages", "Genuinely lasts up to 2 years on standard batteries", "Simple mounting"],
        "cons": ["1080p resolution rather than 2K/4K", "Clip recording has slight delay"],
        "summary": "Value-packed wireless weather-resistant security camera with renowned 2-year battery stamina.",
    },
]


class ProductFinderAgent:
    """Discovers, filters, and formats products with Cuelinks affiliate links."""

    def __init__(
        self,
        gemini_client: Optional[GeminiClient] = None,
        cuelinks: Optional[CuelinksManager] = None,
    ):
        self.gemini = gemini_client or default_gemini_client
        self.cuelinks = cuelinks or default_cuelinks

    async def discover_products(
        self,
        categories: Optional[List[str]] = None,
        target_count: int = 25,
        use_ai_research: bool = True,
    ) -> List[Dict[str, Any]]:
        """Research and curate products across categories."""
        selected_categories = categories or DEFAULT_CATEGORIES
        products: List[Dict[str, Any]] = []

        # 1. Discover active merchant campaigns from Cuelinks API
        logger.info("Fetching active affiliate campaigns from Cuelinks (GET /pub_api/v3/campaigns)...")
        campaigns = await self.cuelinks.get_campaigns()
        campaign_names = [c.get("name") for c in campaigns if isinstance(c, dict) and "name" in c]
        logger.info("Active Cuelinks campaigns available: %s", ", ".join(campaign_names[:5]))

        # 2. Check if we should call Gemini for dynamic AI discovery
        if use_ai_research and self.gemini.is_configured:
            logger.info("Discovering products using Gemini API across %d categories...", len(selected_categories))
            prompt = f"""Discover {target_count} top-performing, high-demand affiliate products across these categories:
{json.dumps(selected_categories, indent=2)}

Available Active Affiliate Merchant Campaigns:
{json.dumps(campaign_names[:10], indent=2)}

For each product, provide:
- name: Full commercial product name
- category: One of the selected categories
- brand: Manufacturer brand name
- price: Formatted retail price (e.g., "$199.99")
- rating: Float between 4.0 and 5.0
- rating_count: Estimated number of reviews (integer)
- target_audience: Brief persona of who this is ideal for
- merchant_url: A realistic clean merchant product URL from an active merchant (e.g., https://www.amazon.com/dp/...)
- features: Array of 3 key technical specifications/features
- pros: Array of 3 genuine strengths
- cons: Array of 2 genuine drawbacks/limitations
- summary: 1-2 sentence compelling editorial summary

Return valid JSON array of product objects."""

            try:
                ai_products = await self.gemini.generate_json(
                    prompt=prompt,
                    system_instruction="You are ProductFinder, an expert affiliate researcher identifying high-converting products.",
                )
                if isinstance(ai_products, list) and len(ai_products) > 0:
                    products = ai_products
            except Exception as e:
                logger.warning("Gemini AI discovery failed or timed out: %s. Falling back to curated catalog.", e)

        # 3. If not enough products found via AI or AI was disabled, fill from seed catalog
        if len(products) < target_count:
            existing_names = {p["name"].lower() for p in products}
            for seed in SEED_PRODUCTS:
                if seed["name"].lower() not in existing_names:
                    products.append(seed)
                if len(products) >= target_count:
                    break

        # 4. Convert links via Cuelinks API (POST /pub_api/v3/links/convert) and check 'affiliated' status
        enriched_products = []
        for p in products:
            raw_url = p.get("merchant_url", "https://www.amazon.com")
            conversion = await self.cuelinks.convert_link(raw_url, subid="product_finder")

            p["affiliate_url"] = conversion.get("tracking_url", raw_url)
            p["affiliated"] = conversion.get("affiliated", False)
            p["campaign"] = conversion.get("campaign", {})

            if not p["affiliated"]:
                logger.warning(
                    "Link '%s' for '%s' is NOT affiliated (not currently monetizable for your Cuelinks account)",
                    raw_url, p["name"]
                )

            slug = p["name"].lower().replace(" ", "-").replace("/", "-").replace("&", "and")
            slug = "".join(c for c in slug if c.isalnum() or c == "-")
            p["slug"] = slug
            enriched_products.append(p)

        return enriched_products

    def save_catalog(self, products: List[Dict[str, Any]], output_path: str = "./output/products_catalog.json") -> Path:
        """Save structured catalog to disk."""
        path = Path(output_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(products, f, indent=2, ensure_ascii=False)
        return path
