"""Publisher Agent: Generates static website, injects Cuelinks tracking, and runs daily automated updates."""

from datetime import datetime
import json
import logging
from pathlib import Path
import shutil
from typing import Any, Dict, List, Optional

from jinja2 import Environment, FileSystemLoader
from markdown_it import MarkdownIt

from affiliate_agent.utils.cuelinks import CuelinksManager, default_cuelinks

logger = logging.getLogger(__name__)


class PublisherAgent:
    """Builds and publishes the complete static affiliate marketing website."""

    def __init__(
        self,
        cuelinks: Optional[CuelinksManager] = None,
        templates_dir: Optional[str] = None,
    ):
        self.cuelinks = cuelinks or default_cuelinks
        if templates_dir:
            self.templates_dir = Path(templates_dir)
        else:
            self.templates_dir = Path(__file__).parent.parent / "templates" / "site"

        self.jinja_env = Environment(
            loader=FileSystemLoader(str(self.templates_dir)),
            autoescape=True,
        )
        self.md = MarkdownIt()

    def build_site(
        self,
        products: List[Dict[str, Any]],
        articles: List[Dict[str, Any]],
        output_dir: str = "./site_output",
        site_name: str = "SmartPick Reviews",
        site_url: str = "https://smartpick.reviews",
    ) -> Dict[str, Any]:
        """Compile and generate the entire static site."""
        out_path = Path(output_dir)
        out_path.mkdir(parents=True, exist_ok=True)
        (out_path / "categories").mkdir(exist_ok=True)
        (out_path / "reviews").mkdir(exist_ok=True)
        (out_path / "assets" / "css").mkdir(parents=True, exist_ok=True)

        current_date = datetime.now().strftime("%B %d, %Y")
        cuelinks_script = self.cuelinks.get_javascript_snippet()
        ftc_disclosure = self.cuelinks.get_ftc_disclosure()

        # 1. Copy stylesheet
        css_source = self.templates_dir / "styles.css"
        if css_source.exists():
            shutil.copyfile(css_source, out_path / "assets" / "css" / "styles.css")

        # 2. Build Category structures
        categories_dict: Dict[str, Dict[str, Any]] = {}
        for p in products:
            cat_name = p.get("category", "General")
            cat_slug = cat_name.lower().replace("&", "and").replace("/", "-").replace(" ", "-")
            cat_slug = "".join(c for c in cat_slug if c.isalnum() or c == "-")

            if cat_slug not in categories_dict:
                categories_dict[cat_slug] = {
                    "name": cat_name,
                    "slug": cat_slug,
                    "products": [],
                    "articles": [],
                    "product_count": 0,
                }
            categories_dict[cat_slug]["products"].append(p)
            categories_dict[cat_slug]["product_count"] += 1

        for a in articles:
            cat_name = a.get("category", "General")
            cat_slug = cat_name.lower().replace("&", "and").replace("/", "-").replace(" ", "-")
            cat_slug = "".join(c for c in cat_slug if c.isalnum() or c == "-")
            if cat_slug in categories_dict:
                categories_dict[cat_slug]["articles"].append(a)

        categories_list = list(categories_dict.values())

        # 3. Select Deal Spotlight
        spotlight = products[0] if products else None

        # 4. Render Homepage (index.html)
        index_template = self.jinja_env.get_template("index.html")
        index_html = index_template.render(
            site_name=site_name,
            site_url=site_url,
            root_path="",
            current_date=current_date,
            cuelinks_script=cuelinks_script,
            ftc_disclosure=ftc_disclosure,
            categories=categories_list,
            products=products,
            articles=articles,
            spotlight_product=spotlight,
        )
        with open(out_path / "index.html", "w", encoding="utf-8") as f:
            f.write(index_html)

        # 5. Render Category Pages (categories/*.html)
        cat_template = self.jinja_env.get_template("category.html")
        for cat in categories_list:
            cat_html = cat_template.render(
                site_name=site_name,
                site_url=site_url,
                root_path="../",
                current_date=current_date,
                cuelinks_script=cuelinks_script,
                ftc_disclosure=ftc_disclosure,
                category=cat,
                categories=categories_list,
            )
            with open(out_path / "categories" / f"{cat['slug']}.html", "w", encoding="utf-8") as f:
                f.write(cat_html)

        # 6. Render Article Pages (reviews/*.html)
        article_template = self.jinja_env.get_template("article.html")
        for art in articles:
            body_html = self.md.render(art.get("content", ""))
            art_cat_slug = art.get("category", "general").lower().replace("&", "and").replace(" ", "-")
            art_cat_slug = "".join(c for c in art_cat_slug if c.isalnum() or c == "-")

            art_html = article_template.render(
                site_name=site_name,
                site_url=site_url,
                root_path="../",
                current_date=current_date,
                cuelinks_script=cuelinks_script,
                ftc_disclosure=ftc_disclosure,
                article=art,
                category_slug=art_cat_slug,
                categories=categories_list,
                content_html=body_html,
            )
            with open(out_path / "reviews" / f"{art['slug']}.html", "w", encoding="utf-8") as f:
                f.write(art_html)

        # 7. Generate sitemap.xml
        self._generate_sitemap(out_path, site_url, categories_list, articles)

        # 8. Generate robots.txt
        self._generate_robots(out_path, site_url)

        # 9. Generate RSS feed
        self._generate_rss(out_path, site_name, site_url, articles)

        return {
            "status": "published",
            "output_dir": str(out_path.resolve()),
            "pages_generated": {
                "home": 1,
                "categories": len(categories_list),
                "reviews_and_guides": len(articles),
                "total": 1 + len(categories_list) + len(articles),
            },
            "products_monetized": len(products),
            "timestamp": datetime.now().isoformat(),
        }

    def _generate_sitemap(
        self,
        out_path: Path,
        site_url: str,
        categories: List[Dict[str, Any]],
        articles: List[Dict[str, Any]],
    ):
        """Generate XML sitemap."""
        now = datetime.now().strftime("%Y-%m-%d")
        xml_entries = [
            f"""  <url>
    <loc>{site_url}/index.html</loc>
    <lastmod>{now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>"""
        ]

        for cat in categories:
            xml_entries.append(
                f"""  <url>
    <loc>{site_url}/categories/{cat['slug']}.html</loc>
    <lastmod>{now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>"""
            )

        for art in articles:
            xml_entries.append(
                f"""  <url>
    <loc>{site_url}/reviews/{art['slug']}.html</loc>
    <lastmod>{now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>"""
            )

        sitemap_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(xml_entries)}
</urlset>"""

        with open(out_path / "sitemap.xml", "w", encoding="utf-8") as f:
            f.write(sitemap_content)

    def _generate_robots(self, out_path: Path, site_url: str):
        """Generate robots.txt file."""
        content = f"""User-agent: *
Allow: /
Sitemap: {site_url}/sitemap.xml
"""
        with open(out_path / "robots.txt", "w", encoding="utf-8") as f:
            f.write(content)

    def _generate_rss(
        self,
        out_path: Path,
        site_name: str,
        site_url: str,
        articles: List[Dict[str, Any]],
    ):
        """Generate RSS 2.0 syndication feed."""
        now = datetime.now().strftime("%a, %d %b %Y %H:%M:%S +0000")
        items_xml = []
        for art in articles[:10]:
            items_xml.append(f"""    <item>
      <title><![CDATA[{art['title']}]]></title>
      <link>{site_url}/reviews/{art['slug']}.html</link>
      <description><![CDATA[{art.get('seo_metadata', {}).get('meta_description', '')}]]></description>
      <pubDate>{now}</pubDate>
      <guid>{site_url}/reviews/{art['slug']}.html</guid>
    </item>""")

        rss_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>{site_name}</title>
    <link>{site_url}</link>
    <description>Latest verified buyer guides and product reviews</description>
    <language>en-us</language>
    <lastBuildDate>{now}</lastBuildDate>
{chr(10).join(items_xml)}
  </channel>
</rss>"""
        with open(out_path / "rss.xml", "w", encoding="utf-8") as f:
            f.write(rss_content)

    def run_daily_update(
        self,
        products: List[Dict[str, Any]],
        articles: List[Dict[str, Any]],
        output_dir: str = "./site_output",
        reports_dir: str = "./output/daily_reports",
    ) -> Dict[str, Any]:
        """Execute automated daily pipeline update: cycle spotlight deal, update prices, rebuild site."""
        # 1. Rotate today's spotlight deal based on day of year
        day_of_year = datetime.now().timetuple().tm_yday
        rotated_products = list(products)
        if rotated_products:
            shift = day_of_year % len(rotated_products)
            spotlight = rotated_products[shift]
            # Bring spotlight to index 0
            rotated_products.remove(spotlight)
            rotated_products.insert(0, spotlight)

        # 2. Rebuild site
        build_result = self.build_site(
            products=rotated_products,
            articles=articles,
            output_dir=output_dir,
        )

        # 3. Save daily log report
        rep_dir = Path(reports_dir)
        rep_dir.mkdir(parents=True, exist_ok=True)
        report_file = rep_dir / f"update-{datetime.now().strftime('%Y-%m-%d')}.json"

        report_data = {
            "update_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "deal_of_the_day": rotated_products[0]["name"] if rotated_products else None,
            "category": rotated_products[0].get("category") if rotated_products else None,
            "total_products_active": len(rotated_products),
            "pages_published": build_result.get("pages_generated", {}),
            "status": "success",
        }

        with open(report_file, "w", encoding="utf-8") as f:
            json.dump(report_data, f, indent=2)

        return report_data
