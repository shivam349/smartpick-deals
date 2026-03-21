"""Custom MCP tools for performance tracking and analysis."""

import json
from datetime import datetime
from typing import Any

from claude_agent_sdk import tool


@tool(
    "generate_performance_report",
    "Generate a performance analysis report from affiliate marketing data. "
    "Input should include metrics like clicks, conversions, revenue as a JSON string.",
    {"metrics_json": str, "period": str},
)
async def generate_performance_report(args: dict[str, Any]) -> dict[str, Any]:
    """Generate a structured performance report."""
    period = args.get("period", "last 30 days")
    try:
        metrics = json.loads(args["metrics_json"])
    except json.JSONDecodeError:
        metrics = {"raw_data": args["metrics_json"]}

    report = {
        "report_date": datetime.now().isoformat(),
        "period": period,
        "metrics": metrics,
        "analysis_framework": {
            "kpis": [
                "Click-through rate (CTR)",
                "Conversion rate",
                "Earnings per click (EPC)",
                "Revenue per 1000 visitors (RPM)",
                "Average order value (AOV)",
            ],
            "benchmarks": {
                "good_ctr": "2-5%",
                "good_conversion_rate": "1-3%",
                "good_epc": "$0.50-$2.00",
            },
            "optimization_areas": [
                "Content with high traffic but low conversion",
                "Products with high commission but low clicks",
                "Pages with high bounce rate",
                "Seasonal trends and opportunities",
            ],
        },
        "instructions": (
            "Analyze the provided metrics against benchmarks. Identify top performers, "
            "underperformers, and provide 3-5 specific, actionable recommendations."
        ),
    }

    return {"content": [{"type": "text", "text": json.dumps(report, indent=2)}]}


@tool(
    "calculate_affiliate_roi",
    "Calculate ROI metrics for an affiliate marketing campaign. Provide costs and revenue data.",
    {"total_cost": float, "total_revenue": float, "time_period_days": int},
)
async def calculate_affiliate_roi(args: dict[str, Any]) -> dict[str, Any]:
    """Calculate affiliate marketing ROI metrics."""
    total_cost = args["total_cost"]
    total_revenue = args["total_revenue"]
    time_period_days = args.get("time_period_days", 30)

    profit = total_revenue - total_cost
    roi = ((total_revenue - total_cost) / total_cost * 100) if total_cost > 0 else 0
    daily_revenue = total_revenue / time_period_days if time_period_days > 0 else 0
    daily_profit = profit / time_period_days if time_period_days > 0 else 0

    result = {
        "inputs": {
            "total_cost": total_cost,
            "total_revenue": total_revenue,
            "time_period_days": time_period_days,
        },
        "calculations": {
            "profit": round(profit, 2),
            "roi_percentage": round(roi, 2),
            "daily_revenue": round(daily_revenue, 2),
            "daily_profit": round(daily_profit, 2),
            "monthly_projected_revenue": round(daily_revenue * 30, 2),
            "monthly_projected_profit": round(daily_profit * 30, 2),
            "break_even_days": (
                round(total_cost / daily_revenue, 1)
                if daily_revenue > 0
                else "N/A - no revenue"
            ),
        },
        "assessment": (
            "profitable"
            if profit > 0
            else "break-even" if profit == 0 else "unprofitable"
        ),
    }

    return {"content": [{"type": "text", "text": json.dumps(result, indent=2)}]}
