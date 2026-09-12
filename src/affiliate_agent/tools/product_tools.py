"""Custom MCP tools for product and affiliate program discovery."""

import json
from typing import Any

from affiliate_agent.core.tools import tool


@tool(
    "structure_affiliate_program",
    "Structure information about an affiliate program into a standardized format. "
    "Use after researching a program to create a clean data record.",
    {
        "name": str,
        "url": str,
        "commission_rate": str,
        "cookie_duration": str,
        "category": str,
        "notes": str,
    },
)
async def structure_affiliate_program(args: dict[str, Any]) -> dict[str, Any]:
    """Create a structured affiliate program record."""
    program = {
        "name": args["name"],
        "url": args.get("url", ""),
        "commission_rate": args.get("commission_rate", ""),
        "cookie_duration": args.get("cookie_duration", ""),
        "category": args.get("category", ""),
        "notes": args.get("notes", ""),
        "evaluation_criteria": {
            "commission_attractiveness": "Rate based on industry average",
            "cookie_duration_score": "30+ days is good, 90+ is excellent",
            "brand_recognition": "Higher recognition = easier conversions",
            "product_quality": "Check reviews and reputation",
            "payment_reliability": "Research payment history and threshold",
        },
    }

    return {"content": [{"type": "text", "text": json.dumps(program, indent=2)}]}


@tool(
    "compare_affiliate_programs",
    "Compare multiple affiliate programs side by side. Input should be a JSON string "
    "containing a list of program objects with name, commission_rate, cookie_duration, and category.",
    {"programs_json": str},
)
async def compare_affiliate_programs(args: dict[str, Any]) -> dict[str, Any]:
    """Compare affiliate programs and provide recommendations."""
    try:
        programs = json.loads(args["programs_json"])
    except json.JSONDecodeError:
        return {
            "content": [
                {
                    "type": "text",
                    "text": "Error: Invalid JSON. Please provide a valid JSON array of programs.",
                }
            ]
        }

    comparison = {
        "programs_compared": len(programs),
        "programs": programs,
        "comparison_dimensions": [
            "Commission Rate",
            "Cookie Duration",
            "Payment Terms",
            "Product Quality",
            "Brand Trust",
            "Conversion Rate (estimated)",
            "Support Quality",
        ],
        "recommendation_prompt": (
            "Based on these programs, recommend the best option for a new affiliate "
            "marketer considering: ease of approval, commission potential, and "
            "product-market fit."
        ),
    }

    return {"content": [{"type": "text", "text": json.dumps(comparison, indent=2)}]}
