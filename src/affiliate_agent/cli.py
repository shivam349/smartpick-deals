"""CLI interface for AffiliateAgent.

Powered by Google Gemini API & Cuelinks.
"""

import asyncio
from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import os
from pathlib import Path
import sys

import click
from dotenv import load_dotenv
from rich.console import Console
from rich.markdown import Markdown
from rich.panel import Panel
from rich.table import Table

from affiliate_agent.agents.orchestrator import AffiliatePipelineOrchestrator, run_agent
from affiliate_agent.config import Config

# Ensure utf-8 encoding on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

console = Console(highlight=False)


def _print_banner():
    console.print(
        Panel(
            "[bold cyan]AffiliateAgent[/bold cyan] - Automated Affiliate Marketing Site Generator\n"
            "[green]Model Layer:[/green] Google Gemini API  |  [yellow]Monetization:[/yellow] Cuelinks\n"
            "[magenta]Pipeline:[/magenta] ProductFinder (20-50 products) -> ResearchWriter -> SEOOptimizer -> Publisher (10-20 pages)",
            title="[bold]AffiliateAgent 2.0[/bold]",
            border_style="cyan",
        )
    )


@click.group()
@click.version_option(version="0.2.0")
def cli():
    """AffiliateAgent - Automated affiliate marketing site generator powered by Gemini & Cuelinks."""
    load_dotenv()


@cli.command()
@click.option("--products", "-p", default=25, help="Number of products to research (20-50)")
@click.option("--pages", "-n", default=15, help="Number of pages/articles to generate (10-20)")
@click.option("--output-dir", "-o", default="./output", help="Output data directory")
@click.option("--site-dir", "-s", default="./site_output", help="Static site output directory")
@click.option("--no-ai", is_flag=True, help="Run in offline/curated mode without API calls")
@click.option("--verbose", "-v", is_flag=True, default=True, help="Show detailed progress")
def pipeline(products: int, pages: int, output_dir: str, site_dir: str, no_ai: bool, verbose: bool):
    """Run the complete 4-agent pipeline:

    Research 20–50 products → 5–10 categories → 10–20 excellent pages → Static site build with Cuelinks.
    """
    _print_banner()

    orchestrator = AffiliatePipelineOrchestrator()
    use_ai = not no_ai

    result = asyncio.run(
        orchestrator.run_pipeline(
            target_products=products,
            target_pages=pages,
            output_dir=output_dir,
            site_output_dir=site_dir,
            use_ai=use_ai,
            verbose=verbose,
        )
    )

    if result["status"] == "success":
        table = Table(title="Pipeline Results", border_style="green")
        table.add_column("Stage", style="cyan", no_wrap=True)
        table.add_column("Output Summary", style="white")

        table.add_row("1. ProductFinder", f"{result['stages']['product_finder']['products_count']} products cataloged with Cuelinks")
        table.add_row("2. ResearchWriter", f"{result['stages']['research_writer']['articles_count']} articles drafted (reviews & guides)")
        table.add_row("3. SEOOptimizer", f"{result['stages']['seo_optimizer']['optimized_count']} pages optimized with Schema JSON-LD & FAQs")
        table.add_row("4. Publisher", f"Site built: {result['stages']['publisher']['pages_generated']['total']} total HTML pages + sitemap.xml")

        console.print(table)
        console.print(f"\n[bold green]To preview your new affiliate website, run:[/bold green]")
        console.print(f"[bold cyan]  affiliate-agent serve --dir {site_dir}[/bold cyan]\n")


@cli.command()
@click.option("--site-dir", "-s", default="./site_output", help="Static site output directory")
@click.option("--output-dir", "-o", default="./output", help="Output data directory")
def daily_update(site_dir: str, output_dir: str):
    """Run automated daily update: refresh deals, rotate spotlight, rebuild site."""
    _print_banner()
    console.print("\n[bold yellow]Running daily automated update...[/bold yellow]")

    orchestrator = AffiliatePipelineOrchestrator()
    report = orchestrator.run_daily_update(output_dir=output_dir, site_output_dir=site_dir)

    console.print(f"[bold green]✓ Daily update finished successfully at {report['update_date']}[/bold green]")
    console.print(f"  Deal of the Day: [bold cyan]{report['deal_of_the_day']}[/bold cyan]")
    console.print(f"  Total Active Products: {report['total_products_active']}")
    console.print(f"  Pages Published: {report['pages_published'].get('total', 'All')}")


@cli.command()
@click.option("--port", "-p", default=8000, help="Port to listen on")
@click.option("--dir", "site_dir", default="./site_output", help="Directory to serve")
def serve(port: int, site_dir: str):
    """Start a local preview web server for the generated affiliate site."""
    _print_banner()
    path = Path(site_dir).resolve()
    if not (path / "index.html").exists():
        console.print(f"[bold red]Error:[/bold red] No index.html found in {path}.")
        console.print("[yellow]Please run 'affiliate-agent pipeline' first to generate your site.[/yellow]")
        sys.exit(1)

    console.print(f"\n[bold green]Previewing site at:[/bold green] [bold cyan]http://localhost:{port}[/bold cyan]")
    console.print(f"[dim]Serving directory: {path}[/dim]")
    console.print("[dim]Press Ctrl+C to stop server.[/dim]\n")

    os.chdir(path)
    server = HTTPServer(("localhost", port), SimpleHTTPRequestHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        console.print("\n[dim]Server stopped.[/dim]")


@cli.command()
@click.option("--count", "-c", default=25, help="Number of products to discover (20-50)")
@click.option("--output-dir", "-o", default="./output", help="Output directory")
def find_products(count: int, output_dir: str):
    """Stage 1: Discover and catalog affiliate products with Cuelinks links."""
    _print_banner()
    console.print(f"\n[bold]Running ProductFinder for {count} products...[/bold]")

    orchestrator = AffiliatePipelineOrchestrator()
    products = asyncio.run(orchestrator.product_finder.discover_products(target_count=count))
    path = orchestrator.product_finder.save_catalog(products, f"{output_dir}/products_catalog.json")

    console.print(f"[bold green]✓ Successfully discovered {len(products)} products.[/bold green]")
    console.print(f"Saved catalog to: {path}")


@cli.command()
@click.option("--catalog", "-c", default="./output/products_catalog.json", help="Path to products catalog JSON")
@click.option("--pages", "-n", default=15, help="Number of articles to generate")
@click.option("--output-dir", "-o", default="./output", help="Output directory")
def write_content(catalog: str, pages: int, output_dir: str):
    """Stage 2: ResearchWriter generates deep reviews and category guides."""
    _print_banner()
    catalog_path = Path(catalog)
    if not catalog_path.exists():
        console.print(f"[bold red]Catalog file {catalog} not found. Run find-products first.[/bold red]")
        sys.exit(1)

    with open(catalog_path, encoding="utf-8") as f:
        products = json.load(f)

    orchestrator = AffiliatePipelineOrchestrator()
    articles = asyncio.run(orchestrator.research_writer.generate_articles(products, target_article_count=pages))
    paths = orchestrator.research_writer.save_articles(articles, f"{output_dir}/articles")

    console.print(f"[bold green]✓ Successfully drafted {len(paths)} articles in {output_dir}/articles[/bold green]")


@cli.command()
@click.option("--site-dir", "-s", default="./site_output", help="Site output directory")
@click.option("--output-dir", "-o", default="./output", help="Input data directory")
def publish(site_dir: str, output_dir: str):
    """Stage 4: Publisher compiles HTML site, Cuelinks scripts, and sitemap."""
    _print_banner()
    catalog_path = Path(output_dir) / "products_catalog.json"
    if not catalog_path.exists():
        console.print(f"[bold red]No products catalog found in {output_dir}. Run pipeline first.[/bold red]")
        sys.exit(1)

    orchestrator = AffiliatePipelineOrchestrator()
    res = asyncio.run(orchestrator.run_pipeline(output_dir=output_dir, site_output_dir=site_dir, use_ai=False))
    console.print(f"[bold green]✓ Site successfully published to {site_dir}![/bold green]")


@cli.command()
@click.option("--model", "-m", default=None, help="Gemini model to use")
def chat(model: str | None):
    """Interactive chat with AffiliateAgent powered by Gemini."""
    _print_banner()
    console.print("\n[dim]Type your request and press Enter. Type 'quit' to exit.[/dim]\n")

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

        result = asyncio.run(run_agent(user_input, model=model, verbose=True))
        if result["output"]:
            console.print(Panel(Markdown(result["output"][-1]), title="AffiliateAgent", border_style="cyan"))


def main():
    cli()


if __name__ == "__main__":
    main()
