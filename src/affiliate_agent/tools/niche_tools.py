"""Custom MCP tools for niche research."""

import json
from typing import Any

from affiliate_agent.core.tools import tool


@tool(
    "analyze_niche_viability",
    "Analyze a niche for affiliate marketing viability. Takes a niche name and returns "
    "a structured analysis including competition level, monetization potential, and "
    "keyword opportunities. Use this after web research to structure findings.",
    {"niche": str, "research_data": str},
)
async def analyze_niche_viability(args: dict[str, Any]) -> dict[str, Any]:
    """Structure niche research data into a viability analysis."""
    niche = args["niche"]
    research_data = args.get("research_data", "")

    analysis_prompt = f"""Based on the following research data for the niche "{niche}",
create a structured viability analysis as JSON with these fields:
- niche: the niche name
- score: 0-100 viability score
- competition_level: low/medium/high
- estimated_monthly_traffic: estimated number
- monetization_potential: low/medium/high
- summary: 2-3 sentence summary
- recommendations: list of 3-5 actionable recommendations
- top_keywords: list of objects with keyword, estimated search_volume, difficulty (0-100)

Research data:
{research_data}

Return ONLY valid JSON."""

    return {
        "content": [
            {
                "type": "text",
                "text": f"Niche analysis request prepared for: {niche}\n\n"
                f"Use this structured prompt to analyze the research data:\n{analysis_prompt}",
            }
        ]
    }


@tool(
    "score_niche_competition",
    "Score the competition level for a given niche based on top search results. "
    "Input should include the niche and data about top-ranking sites.",
    {"niche": str, "competitor_data": str},
)
async def score_niche_competition(args: dict[str, Any]) -> dict[str, Any]:
    """Score competition based on competitor data."""
    niche = args["niche"]
    competitor_data = args.get("competitor_data", "")

    return {
        "content": [
            {
                "type": "text",
                "text": json.dumps(
                    {
                        "niche": niche,
                        "analysis_type": "competition_scoring",
                        "input_data": competitor_data,
                        "scoring_criteria": [
                            "Domain authority of top 5 results",
                            "Content quality and depth",
                            "Number of dedicated affiliate sites",
                            "Presence of major brands",
                            "Content freshness and update frequency",
                        ],
                        "instructions": "Score each criterion 1-10 and provide overall assessment",
                    },
                    indent=2,
                ),
            }
        ]
    }
