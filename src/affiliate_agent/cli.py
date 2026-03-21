"""CLI interface for AffiliateAgent."""

import asyncio
from pathlib import Path

import click
from dotenv import load_dotenv
from rich.console import Console
from rich.markdown import Markdown
from rich.panel import Panel

from affiliate_agent.agents.orchestrator import run_agent

console = Console()


def _print_banner():
    console.print(
        Panel(
            "[bold blue]AffiliateAgent[/bold blue] - AI-Powered Affiliate Marketing Assistant\n"
            "Powered by Claude Agent SDK",
            title="[bold]Welcome[/bold]",
            border_style="blue",
        )
    )


@click.group()
@click.version_option(version="0.1.0")
def cli():
    """AffiliateAgent - An agentic AI for affiliate marketing."""
    load_dotenv()


@cli.command()
@click.argument("niche")
@click.option("--output-dir", "-o", default="./output", help="Output directory")
@click.option("--model", "-m", default=None, help="Claude model to use")
@click.option("--max-budget", type=float, default=None, help="Max budget in USD")
@click.option("--verbose", "-v", is_flag=True, help="Verbose output")
def research(niche: str, output_dir: str, model: str | None, max_budget: float | None, verbose: bool):
    """Research a niche for affiliate marketing viability."""
    _print_banner()
    console.print(f"\n[bold]Researching niche:[/bold] {niche}\n")

    prompt = f"""Research the niche "{niche}" for affiliate marketing viability.

Your tasks:
1. Use web search to research this niche thoroughly
2. Identify the top 10 keywords with buyer intent
3. Analyze the competition (who are the top 5 affiliate sites?)
4. Find the best affiliate programs in this niche
5. Evaluate monetization potential
6. Use the analyze_niche_viability tool to structure your findings
7. Save a detailed report to {output_dir}/niche-research-{niche.replace(' ', '-')}.md

Provide a comprehensive, data-backed analysis with actionable recommendations."""

    result = asyncio.run(
        run_agent(prompt, working_dir=".", model=model, max_budget_usd=max_budget, verbose=verbose)
    )
    _print_result(result)


@cli.command()
@click.argument("topic")
@click.option("--type", "content_type", default="review", help="Content type: review, comparison, buying_guide, how_to, listicle, roundup")
@click.option("--keyword", "-k", required=True, help="Target keyword")
@click.option("--output-dir", "-o", default="./output", help="Output directory")
@click.option("--model", "-m", default=None, help="Claude model to use")
@click.option("--max-budget", type=float, default=None, help="Max budget in USD")
@click.option("--verbose", "-v", is_flag=True, help="Verbose output")
def create_content(
    topic: str,
    content_type: str,
    keyword: str,
    output_dir: str,
    model: str | None,
    max_budget: float | None,
    verbose: bool,
):
    """Generate SEO-optimized affiliate content."""
    _print_banner()
    console.print(f"\n[bold]Creating {content_type}:[/bold] {topic}")
    console.print(f"[bold]Target keyword:[/bold] {keyword}\n")

    prompt = f"""Create a high-quality {content_type} article about "{topic}".

Target keyword: "{keyword}"

Your tasks:
1. Use generate_content_brief to plan the article structure
2. Research the topic thoroughly using web search
3. Write a comprehensive, SEO-optimized article
4. Use optimize_content_seo to verify SEO quality
5. Include FTC affiliate disclosure
6. Save the article to {output_dir}/{content_type}-{topic.replace(' ', '-').lower()}.md

The article should be helpful, honest, and optimized for both readers and search engines."""

    result = asyncio.run(
        run_agent(prompt, working_dir=".", model=model, max_budget_usd=max_budget, verbose=verbose)
    )
    _print_result(result)


@cli.command()
@click.argument("niche")
@click.option("--output-dir", "-o", default="./output", help="Output directory")
@click.option("--model", "-m", default=None, help="Claude model to use")
@click.option("--max-budget", type=float, default=None, help="Max budget in USD")
@click.option("--verbose", "-v", is_flag=True, help="Verbose output")
def find_products(niche: str, output_dir: str, model: str | None, max_budget: float | None, verbose: bool):
    """Find affiliate programs and products in a niche."""
    _print_banner()
    console.print(f"\n[bold]Finding products in:[/bold] {niche}\n")

    prompt = f"""Find the best affiliate programs and products in the "{niche}" niche.

Your tasks:
1. Search for affiliate programs in this niche
2. Research at least 5-10 programs
3. Use structure_affiliate_program for each program found
4. Use compare_affiliate_programs to compare them
5. Recommend the top 3-5 programs to join
6. Save the report to {output_dir}/products-{niche.replace(' ', '-')}.md

Focus on programs with good commissions, reliable payments, and quality products."""

    result = asyncio.run(
        run_agent(prompt, working_dir=".", model=model, max_budget_usd=max_budget, verbose=verbose)
    )
    _print_result(result)


@cli.command()
@click.argument("data_file", type=click.Path(exists=True))
@click.option("--period", "-p", default="last 30 days", help="Reporting period")
@click.option("--output-dir", "-o", default="./output", help="Output directory")
@click.option("--model", "-m", default=None, help="Claude model to use")
@click.option("--verbose", "-v", is_flag=True, help="Verbose output")
def analyze(data_file: str, period: str, output_dir: str, model: str | None, verbose: bool):
    """Analyze affiliate marketing performance data."""
    _print_banner()
    console.print(f"\n[bold]Analyzing:[/bold] {data_file}")
    console.print(f"[bold]Period:[/bold] {period}\n")

    prompt = f"""Analyze the affiliate marketing performance data in "{data_file}".

Period: {period}

Your tasks:
1. Read and understand the data file
2. Use generate_performance_report to create a structured report
3. Use calculate_affiliate_roi if cost/revenue data is available
4. Identify top and bottom performers
5. Provide 5+ specific, actionable optimization recommendations
6. Save the report to {output_dir}/performance-report.md

Be specific with numbers and tie recommendations to data."""

    result = asyncio.run(
        run_agent(prompt, working_dir=".", model=model, verbose=verbose)
    )
    _print_result(result)


@cli.command()
@click.option("--model", "-m", default=None, help="Claude model to use")
@click.option("--max-turns", type=int, default=None, help="Max conversation turns")
@click.option("--max-budget", type=float, default=None, help="Max budget in USD")
@click.option("--verbose", "-v", is_flag=True, help="Verbose output")
def chat(model: str | None, max_turns: int | None, max_budget: float | None, verbose: bool):
    """Interactive chat with AffiliateAgent."""
    _print_banner()
    console.print(
        "\n[dim]Type your request and press Enter. Type 'quit' to exit.[/dim]\n"
    )

    while True:
        try:
            user_input = console.input("[bold green]You:[/bold green] ")
        except (EOFError, KeyboardInterrupt):
            console.print("\n[dim]Goodbye![/dim]")
            break

        if user_input.strip().lower() in ("quit", "exit", "q"):
            console.print("[dim]Goodbye![/dim]")
            break

        if not user_input.strip():
            continue

        result = asyncio.run(
            run_agent(
                user_input,
                working_dir=".",
                model=model,
                max_turns=max_turns,
                max_budget_usd=max_budget,
                verbose=verbose,
            )
        )
        _print_result(result)
        console.print()


def _print_result(result: dict):
    if result["success"]:
        console.print("\n[bold green]Task completed successfully.[/bold green]")
    else:
        console.print("\n[bold red]Task encountered an error.[/bold red]")

    if result["output"]:
        last_output = result["output"][-1] if result["output"] else ""
        if last_output:
            console.print(Panel(Markdown(last_output[:2000]), title="Result", border_style="green"))

    if result["cost_usd"] is not None:
        console.print(f"[dim]Cost: ${result['cost_usd']:.4f}[/dim]")

    if result["tools_used"]:
        unique_tools = sorted(set(result["tools_used"]))
        console.print(f"[dim]Tools used: {', '.join(unique_tools)}[/dim]")


def main():
    cli()


if __name__ == "__main__":
    main()
