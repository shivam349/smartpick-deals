"""Custom MCP tools for content generation."""

import json
from typing import Any

from affiliate_agent.core.tools import tool


@tool(
    "generate_content_brief",
    "Generate a detailed content brief for an affiliate marketing article. "
    "Specify the content type (review, comparison, buying_guide, how_to, listicle, roundup), "
    "target keyword, and product/niche context.",
    {"content_type": str, "target_keyword": str, "context": str},
)
async def generate_content_brief(args: dict[str, Any]) -> dict[str, Any]:
    """Create a structured content brief."""
    content_type = args["content_type"]
    target_keyword = args["target_keyword"]
    context = args.get("context", "")

    templates = {
        "review": {
            "sections": [
                "Introduction & Product Overview",
                "Key Features & Specifications",
                "Hands-on Experience / Analysis",
                "Pros and Cons",
                "Who Is This For?",
                "Pricing & Value",
                "Alternatives to Consider",
                "Final Verdict & Rating",
                "FAQ",
            ],
            "word_count": "2000-3000",
            "cta_placement": ["after pros/cons", "in verdict", "in FAQ"],
        },
        "comparison": {
            "sections": [
                "Introduction & Why This Comparison Matters",
                "Quick Comparison Table",
                "Product A Deep Dive",
                "Product B Deep Dive",
                "Head-to-Head: Features",
                "Head-to-Head: Pricing",
                "Head-to-Head: User Experience",
                "Which Should You Choose?",
                "FAQ",
            ],
            "word_count": "2500-3500",
            "cta_placement": ["comparison table", "each product section", "final recommendation"],
        },
        "buying_guide": {
            "sections": [
                "Introduction & Why You Need This Guide",
                "What to Look For (Key Buying Criteria)",
                "Top Picks Overview",
                "Detailed Reviews of Each Pick",
                "Comparison Table",
                "Budget Options",
                "Premium Options",
                "How to Make Your Final Decision",
                "FAQ",
            ],
            "word_count": "3000-4500",
            "cta_placement": ["top picks", "each review", "comparison table", "conclusion"],
        },
        "how_to": {
            "sections": [
                "Introduction & What You'll Learn",
                "What You'll Need",
                "Step-by-Step Instructions",
                "Pro Tips & Best Practices",
                "Common Mistakes to Avoid",
                "Recommended Tools & Products",
                "FAQ",
            ],
            "word_count": "1500-2500",
            "cta_placement": ["tools section", "within steps", "conclusion"],
        },
        "listicle": {
            "sections": [
                "Introduction & Selection Criteria",
                "Numbered List Items (each with mini-review)",
                "Comparison Summary",
                "How We Chose These",
                "FAQ",
            ],
            "word_count": "2000-3000",
            "cta_placement": ["each list item", "comparison summary"],
        },
        "roundup": {
            "sections": [
                "Introduction & Market Overview",
                "Our Top Pick",
                "Best for Budget",
                "Best for Premium",
                "Best for Beginners",
                "Full Roundup with Mini-Reviews",
                "How We Tested",
                "Final Thoughts",
            ],
            "word_count": "2500-4000",
            "cta_placement": ["each category winner", "mini-reviews", "final thoughts"],
        },
    }

    template = templates.get(content_type, templates["review"])

    brief = {
        "content_type": content_type,
        "target_keyword": target_keyword,
        "context": context,
        "recommended_sections": template["sections"],
        "target_word_count": template["word_count"],
        "cta_placements": template["cta_placement"],
        "seo_guidelines": {
            "title_format": f"Include '{target_keyword}' in the first 60 characters",
            "meta_description": "150-160 characters, include target keyword, add CTA",
            "h2_keywords": "Use semantic variations of target keyword in H2s",
            "internal_linking": "Link to 2-3 related articles",
            "image_alt_text": "Descriptive, include keyword naturally",
        },
        "affiliate_guidelines": {
            "disclosure": "Include FTC disclosure at the top of the article",
            "link_density": "Max 1 affiliate link per 300 words",
            "anchor_text": "Use natural, varied anchor text",
            "nofollow": "All affiliate links should use rel='nofollow sponsored'",
        },
    }

    return {"content": [{"type": "text", "text": json.dumps(brief, indent=2)}]}


@tool(
    "optimize_content_seo",
    "Analyze and optimize content for SEO. Takes the article content and target keyword, "
    "returns optimization suggestions.",
    {"content": str, "target_keyword": str},
)
async def optimize_content_seo(args: dict[str, Any]) -> dict[str, Any]:
    """Analyze content for SEO optimization opportunities."""
    content = args["content"]
    target_keyword = args["target_keyword"]
    word_count = len(content.split())
    keyword_count = content.lower().count(target_keyword.lower())
    keyword_density = (keyword_count / word_count * 100) if word_count > 0 else 0

    analysis = {
        "word_count": word_count,
        "keyword_count": keyword_count,
        "keyword_density": round(keyword_density, 2),
        "checks": {
            "word_count_ok": word_count >= 1500,
            "keyword_density_ok": 0.5 <= keyword_density <= 2.5,
            "has_enough_headings": content.count("## ") >= 3,
            "has_meta_elements": "meta" in content.lower() or word_count > 0,
        },
        "suggestions": [],
    }

    if word_count < 1500:
        analysis["suggestions"].append(
            f"Content is {word_count} words. Aim for at least 1500 for competitive keywords."
        )
    if keyword_density < 0.5:
        analysis["suggestions"].append(
            f"Keyword density is {keyword_density:.1f}%. Add more natural mentions of '{target_keyword}'."
        )
    elif keyword_density > 2.5:
        analysis["suggestions"].append(
            f"Keyword density is {keyword_density:.1f}%. Reduce keyword stuffing."
        )
    if content.count("## ") < 3:
        analysis["suggestions"].append("Add more H2 headings to improve content structure.")

    return {"content": [{"type": "text", "text": json.dumps(analysis, indent=2)}]}
