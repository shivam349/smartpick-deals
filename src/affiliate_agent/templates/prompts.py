"""Reusable prompt templates for common affiliate marketing tasks."""

NICHE_RESEARCH_PROMPT = """Research the niche "{niche}" for affiliate marketing potential.

Analyze:
1. Market size and growth trends
2. Top 10 keywords with buyer intent (include search volume estimates)
3. Competition analysis (top 5 sites, their strengths/weaknesses)
4. Available affiliate programs (commission rates, cookie duration)
5. Content gaps and opportunities
6. Monetization strategies

Use the analyze_niche_viability tool to structure your findings.
Save a detailed report to {output_dir}/niche-{slug}.md"""

PRODUCT_REVIEW_PROMPT = """Write a comprehensive product review for "{product}" targeting the keyword "{keyword}".

Requirements:
1. Use generate_content_brief with content_type="review"
2. Research the product thoroughly (features, pricing, alternatives)
3. Write an honest, balanced review (2000-3000 words)
4. Include: overview, features, pros/cons, who it's for, verdict
5. Add FTC affiliate disclosure at the top
6. Use optimize_content_seo to verify quality
7. Save to {output_dir}/review-{slug}.md"""

COMPARISON_PROMPT = """Write a detailed comparison article: "{product_a} vs {product_b}" targeting "{keyword}".

Requirements:
1. Use generate_content_brief with content_type="comparison"
2. Research both products thoroughly
3. Compare features, pricing, user experience, and value
4. Include a comparison table
5. Provide a clear recommendation based on use cases
6. Add FTC affiliate disclosure
7. Save to {output_dir}/comparison-{slug}.md"""

BUYING_GUIDE_PROMPT = """Create a comprehensive buying guide for "{category}" targeting "{keyword}".

Requirements:
1. Use generate_content_brief with content_type="buying_guide"
2. Research the product category and top options
3. Include buying criteria, top picks, and detailed mini-reviews
4. Add comparison table and budget/premium recommendations
5. Add FTC affiliate disclosure
6. Save to {output_dir}/guide-{slug}.md"""

CONTENT_AUDIT_PROMPT = """Audit the affiliate content in "{content_dir}" for SEO and conversion optimization.

For each content file:
1. Read the content
2. Use optimize_content_seo to analyze SEO quality
3. Check for: keyword optimization, content structure, CTA placement, disclosure compliance
4. Provide specific improvement recommendations

Save audit report to {output_dir}/content-audit.md"""


def format_prompt(template: str, **kwargs) -> str:
    """Format a prompt template with the given variables."""
    # Generate slug from the first meaningful string argument
    for key, value in kwargs.items():
        if isinstance(value, str) and key not in ("output_dir", "content_dir"):
            kwargs.setdefault("slug", value.lower().replace(" ", "-")[:50])
            break
    kwargs.setdefault("output_dir", "./output")
    return template.format(**kwargs)
