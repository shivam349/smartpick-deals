"""Main orchestrator for the AffiliateAgent multi-agent system."""

import asyncio
from pathlib import Path
from typing import Any

from claude_agent_sdk import (
    AssistantMessage,
    ClaudeAgentOptions,
    ResultMessage,
    TextBlock,
    ToolUseBlock,
    create_sdk_mcp_server,
    query,
)

from affiliate_agent.agents.definitions import ALL_AGENTS
from affiliate_agent.tools.content_tools import generate_content_brief, optimize_content_seo
from affiliate_agent.tools.niche_tools import analyze_niche_viability, score_niche_competition
from affiliate_agent.tools.performance_tools import (
    calculate_affiliate_roi,
    generate_performance_report,
)
from affiliate_agent.tools.product_tools import (
    compare_affiliate_programs,
    structure_affiliate_program,
)

SYSTEM_PROMPT = """You are AffiliateAgent, an expert AI system for affiliate marketing.

You orchestrate a team of specialized sub-agents to help users build and optimize
their affiliate marketing business. You have access to the following agents:

1. **niche_scout** - Researches and analyzes profitable niches
2. **product_finder** - Discovers affiliate programs and products
3. **content_creator** - Generates SEO-optimized affiliate content
4. **seo_optimizer** - Optimizes content for search engines
5. **performance_analyst** - Analyzes performance and ROI

You also have custom tools for:
- Niche analysis and competition scoring
- Content brief generation and SEO optimization
- Affiliate program structuring and comparison
- Performance reporting and ROI calculation

Your workflow for a typical task:
1. Understand the user's goal (new niche, content, optimization, etc.)
2. Delegate to the appropriate sub-agent(s)
3. Use custom tools to structure and analyze data
4. Save outputs to the project's output/ directory
5. Provide clear, actionable summaries

Always be honest about limitations. Never promise specific income figures.
Include FTC disclosure reminders in all content.
Focus on providing genuine value to the end reader.

Save all generated content and reports to the ./output/ directory."""


def _build_mcp_server():
    """Build the custom MCP server with all affiliate marketing tools."""
    return create_sdk_mcp_server(
        name="affiliate_tools",
        version="0.1.0",
        tools=[
            analyze_niche_viability,
            score_niche_competition,
            generate_content_brief,
            optimize_content_seo,
            structure_affiliate_program,
            compare_affiliate_programs,
            generate_performance_report,
            calculate_affiliate_roi,
        ],
    )


def build_options(
    working_dir: str | Path | None = None,
    model: str | None = None,
    max_turns: int | None = None,
    max_budget_usd: float | None = None,
) -> ClaudeAgentOptions:
    """Build ClaudeAgentOptions for the orchestrator."""
    mcp_server = _build_mcp_server()

    tool_names = [
        "Read",
        "Write",
        "Edit",
        "Glob",
        "Grep",
        "Bash",
        "WebSearch",
        "WebFetch",
        "Agent",
        # Custom MCP tools
        "mcp__affiliate_tools__analyze_niche_viability",
        "mcp__affiliate_tools__score_niche_competition",
        "mcp__affiliate_tools__generate_content_brief",
        "mcp__affiliate_tools__optimize_content_seo",
        "mcp__affiliate_tools__structure_affiliate_program",
        "mcp__affiliate_tools__compare_affiliate_programs",
        "mcp__affiliate_tools__generate_performance_report",
        "mcp__affiliate_tools__calculate_affiliate_roi",
    ]

    return ClaudeAgentOptions(
        system_prompt=SYSTEM_PROMPT,
        allowed_tools=tool_names,
        permission_mode="acceptEdits",
        mcp_servers={"affiliate_tools": mcp_server},
        agents=ALL_AGENTS,
        model=model,
        cwd=str(working_dir) if working_dir else None,
        max_turns=max_turns,
        max_budget_usd=max_budget_usd,
    )


async def run_agent(
    prompt: str,
    working_dir: str | Path | None = None,
    model: str | None = None,
    max_turns: int | None = None,
    max_budget_usd: float | None = None,
    verbose: bool = False,
) -> dict[str, Any]:
    """Run the AffiliateAgent with the given prompt.

    Returns a dict with the result summary, cost, and session info.
    """
    options = build_options(
        working_dir=working_dir,
        model=model,
        max_turns=max_turns,
        max_budget_usd=max_budget_usd,
    )

    result_info: dict[str, Any] = {
        "success": False,
        "output": [],
        "tools_used": [],
        "cost_usd": None,
        "session_id": None,
    }

    async for message in query(prompt=prompt, options=options):
        if isinstance(message, AssistantMessage):
            for block in message.content:
                if isinstance(block, TextBlock):
                    if verbose:
                        print(block.text)
                    result_info["output"].append(block.text)
                elif isinstance(block, ToolUseBlock):
                    if verbose:
                        print(f"  [Tool: {block.name}]")
                    result_info["tools_used"].append(block.name)

        elif isinstance(message, ResultMessage):
            result_info["success"] = not message.is_error
            result_info["cost_usd"] = message.total_cost_usd
            result_info["session_id"] = message.session_id
            if verbose:
                status = "completed" if not message.is_error else "failed"
                print(f"\n--- Agent {status} in {message.duration_ms}ms ---")

    return result_info
