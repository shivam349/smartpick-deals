# AffiliateAgent

An agentic AI system for affiliate marketing powered by the [Claude Agent SDK](https://platform.claude.com/docs/en/agent-sdk/overview).

AffiliateAgent automates the entire affiliate marketing workflow — from niche research and product discovery to content creation, SEO optimization, and performance analysis — using a multi-agent architecture where specialized AI agents collaborate to produce results.

## Architecture

AffiliateAgent uses a **multi-agent orchestrator** pattern with 5 specialized sub-agents:

| Agent | Role |
|-------|------|
| **NicheScout** | Researches profitable niches, analyzes competition, identifies keyword opportunities |
| **ProductFinder** | Discovers affiliate programs, compares commission structures, evaluates product-market fit |
| **ContentCreator** | Generates SEO-optimized reviews, comparisons, buying guides, and how-to articles |
| **SEOOptimizer** | Keyword research, on-page optimization, content structure, meta tag recommendations |
| **PerformanceAnalyst** | Analyzes campaign data, calculates ROI, identifies optimization opportunities |

The orchestrator delegates tasks to the appropriate agent(s) based on the user's request, with custom MCP tools providing structured data processing for each workflow.

## Features

- **Niche Research** — Automated market analysis with competition scoring and keyword identification
- **Product Discovery** — Find and compare affiliate programs across any niche
- **Content Generation** — Create SEO-optimized reviews, comparisons, buying guides, listicles, and roundups
- **SEO Optimization** — Keyword density analysis, content structure checks, meta tag recommendations
- **Performance Analysis** — ROI calculation, KPI tracking, actionable optimization recommendations
- **FTC Compliance** — Automatic affiliate disclosure inclusion in all generated content
- **Interactive Chat** — Conversational interface for ad-hoc tasks

## Quick Start

### Prerequisites

- Python 3.10+
- [Claude Code CLI](https://code.claude.com) installed
- Anthropic API key

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/affiliate-agent.git
cd affiliate-agent

# Create virtual environment and install
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"

# Set your API key
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

### Usage

#### Research a Niche

```bash
affiliate-agent research "wireless earbuds"
```

#### Find Affiliate Products

```bash
affiliate-agent find-products "home office equipment"
```

#### Create Content

```bash
# Product review
affiliate-agent create-content "AirPods Pro 3" --type review --keyword "airpods pro 3 review"

# Comparison article
affiliate-agent create-content "AirPods vs Galaxy Buds" --type comparison --keyword "airpods vs galaxy buds"

# Buying guide
affiliate-agent create-content "Wireless Earbuds" --type buying_guide --keyword "best wireless earbuds 2026"
```

#### Analyze Performance

```bash
affiliate-agent analyze ./data/monthly-report.csv --period "March 2026"
```

#### Interactive Chat

```bash
affiliate-agent chat
```

### Options

All commands support:

| Flag | Description |
|------|-------------|
| `--model`, `-m` | Claude model to use (default: claude-sonnet-4-6) |
| `--output-dir`, `-o` | Output directory (default: ./output) |
| `--max-budget` | Maximum API spend in USD |
| `--verbose`, `-v` | Show detailed agent output |

## Configuration

Create an `affiliate-agent.yaml` file to customize defaults:

```yaml
agent:
  model: claude-sonnet-4-6
  max_turns: 50
  max_budget_usd: 5.0
  verbose: false

content:
  default_type: review
  min_word_count: 1500
  max_keyword_density: 2.5
  include_faq: true
  include_disclosure: true

output:
  directory: ./output
  format: markdown
```

## Programmatic Usage

```python
import asyncio
from affiliate_agent.agents.orchestrator import run_agent

result = asyncio.run(
    run_agent(
        prompt="Research the 'smart home' niche for affiliate marketing",
        working_dir="./my-project",
        model="claude-sonnet-4-6",
        verbose=True,
    )
)

print(f"Success: {result['success']}")
print(f"Cost: ${result['cost_usd']:.4f}")
```

## Custom Tools

AffiliateAgent includes 8 custom MCP tools:

| Tool | Description |
|------|-------------|
| `analyze_niche_viability` | Structure niche research into a viability analysis |
| `score_niche_competition` | Score competition level from search result data |
| `generate_content_brief` | Create structured content briefs for any article type |
| `optimize_content_seo` | Analyze content for SEO optimization opportunities |
| `structure_affiliate_program` | Create standardized affiliate program records |
| `compare_affiliate_programs` | Side-by-side program comparison |
| `generate_performance_report` | Structured performance analysis reports |
| `calculate_affiliate_roi` | Calculate ROI and financial metrics |

## Project Structure

```
affiliate-agent/
├── src/affiliate_agent/
│   ├── agents/
│   │   ├── definitions.py    # Sub-agent definitions
│   │   └── orchestrator.py   # Main orchestrator
│   ├── models/
│   │   └── schemas.py        # Pydantic data models
│   ├── tools/
│   │   ├── niche_tools.py    # Niche research tools
│   │   ├── content_tools.py  # Content generation tools
│   │   ├── product_tools.py  # Product discovery tools
│   │   └── performance_tools.py  # Performance analysis tools
│   ├── templates/
│   │   └── prompts.py        # Reusable prompt templates
│   ├── cli.py                # CLI interface
│   └── config.py             # Configuration management
├── tests/
├── pyproject.toml
└── README.md
```

## Development

```bash
# Install dev dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Lint
ruff check src/ tests/
```

## Ethical Guidelines

AffiliateAgent follows responsible affiliate marketing practices:

- **FTC Compliance**: All generated content includes affiliate disclosures
- **Honest Reviews**: Content includes genuine pros AND cons
- **No Income Claims**: Never promises specific earnings
- **Reader-First**: Content prioritizes helping readers make informed decisions
- **Transparency**: Clear about AI-generated content

## License

MIT License. See [LICENSE](LICENSE) for details.
