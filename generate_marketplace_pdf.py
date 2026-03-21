"""Generate the AffiliateAgent Marketplace PDF - complete guide for all 5 agents."""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    Table, TableStyle, HRFlowable, KeepTogether,
)

# ── Colors ──────────────────────────────────────────────
BLUE = HexColor("#1a56db")
DARK = HexColor("#1e293b")
LIGHT = HexColor("#f1f5f9")
GREEN = HexColor("#16a34a")
ORANGE = HexColor("#ea580c")
GRAY = HexColor("#64748b")
PURPLE = HexColor("#7c3aed")
BG_BLUE = HexColor("#eff6ff")
BG_GREEN = HexColor("#f0fdf4")
BG_ORANGE = HexColor("#fff7ed")
BG_PURPLE = HexColor("#f5f3ff")
BORDER = HexColor("#e2e8f0")

# Agent theme colors
AGENT_COLORS = {
    "NicheScout": (BLUE, BG_BLUE),
    "ProductFinder": (GREEN, BG_GREEN),
    "ContentCreator": (PURPLE, BG_PURPLE),
    "SEOOptimizer": (ORANGE, BG_ORANGE),
    "PerformanceAnalyst": (BLUE, BG_BLUE),
}


def get_styles():
    s = getSampleStyleSheet()
    styles = {}
    styles["CoverTitle"] = ParagraphStyle("CoverTitle", parent=s["Title"], fontSize=34, leading=42, textColor=white, alignment=TA_CENTER, fontName="Helvetica-Bold")
    styles["CoverSub"] = ParagraphStyle("CoverSub", parent=s["Normal"], fontSize=15, leading=21, textColor=HexColor("#bfdbfe"), alignment=TA_CENTER)
    styles["CoverTag"] = ParagraphStyle("CoverTag", parent=s["Normal"], fontSize=11, leading=16, textColor=HexColor("#93c5fd"), alignment=TA_CENTER, fontName="Helvetica-Oblique")
    styles["Chapter"] = ParagraphStyle("Chapter", parent=s["Heading1"], fontSize=26, leading=34, textColor=BLUE, spaceAfter=16, fontName="Helvetica-Bold")
    styles["Section"] = ParagraphStyle("Section", parent=s["Heading2"], fontSize=18, leading=24, textColor=DARK, spaceBefore=18, spaceAfter=10, fontName="Helvetica-Bold")
    styles["SubSec"] = ParagraphStyle("SubSec", parent=s["Heading3"], fontSize=14, leading=20, textColor=BLUE, spaceBefore=14, spaceAfter=8, fontName="Helvetica-Bold")
    styles["Body"] = ParagraphStyle("Body", parent=s["Normal"], fontSize=11, leading=17, textColor=DARK, alignment=TA_JUSTIFY, spaceAfter=8, fontName="Helvetica")
    styles["Bullet"] = ParagraphStyle("Bullet", parent=s["Normal"], fontSize=11, leading=17, textColor=DARK, spaceAfter=4, bulletIndent=18, leftIndent=36)
    styles["Num"] = ParagraphStyle("Num", parent=s["Normal"], fontSize=11, leading=17, textColor=DARK, spaceAfter=6, leftIndent=36, bulletIndent=18)
    styles["TOC"] = ParagraphStyle("TOC", parent=s["Normal"], fontSize=13, leading=26, textColor=DARK, leftIndent=20)
    styles["Footer"] = ParagraphStyle("Footer", parent=s["Normal"], fontSize=8, textColor=GRAY, alignment=TA_CENTER)
    styles["Tip"] = ParagraphStyle("Tip", parent=s["Normal"], fontSize=10.5, leading=16, textColor=DARK, leftIndent=12)
    styles["Meta"] = ParagraphStyle("Meta", parent=s["Normal"], fontSize=11, alignment=TA_CENTER, textColor=GRAY)
    return styles


def hf(canvas_obj, doc):
    canvas_obj.saveState()
    canvas_obj.setFont("Helvetica", 8)
    canvas_obj.setFillColor(GRAY)
    canvas_obj.drawCentredString(letter[0] / 2, 0.5 * inch, f"AffiliateAgent Marketplace Guide  |  Page {doc.page}")
    if doc.page > 1:
        canvas_obj.setStrokeColor(BLUE)
        canvas_obj.setLineWidth(2)
        canvas_obj.line(0.75 * inch, letter[1] - 0.55 * inch, letter[0] - 0.75 * inch, letter[1] - 0.55 * inch)
    canvas_obj.restoreState()


def tip_box(text, styles, color=BG_BLUE, icon="TIP"):
    ic = {"TIP": BLUE, "NOTE": PURPLE, "WARNING": ORANGE, "SUCCESS": GREEN, "PRICING": GREEN}.get(icon, BLUE)
    data = [[Paragraph(f'<font color="{ic.hexval()}"><b>{icon}:</b></font> {text}', styles["Tip"])]]
    t = Table(data, colWidths=[6.3 * inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), color),
        ("BOX", (0, 0), (-1, -1), 1, BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 10), ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING", (0, 0), (-1, -1), 14), ("RIGHTPADDING", (0, 0), (-1, -1), 14),
    ]))
    return t


def code_box(lines):
    text = "<br/>".join(l.replace(" ", "&nbsp;").replace("<", "&lt;").replace(">", "&gt;") for l in lines)
    data = [[Paragraph(f'<font face="Courier" size="9" color="#1e293b">{text}</font>', ParagraphStyle("c", fontSize=9, leading=14))]]
    t = Table(data, colWidths=[6.3 * inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT),
        ("BOX", (0, 0), (-1, -1), 1, BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 10), ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING", (0, 0), (-1, -1), 14), ("RIGHTPADDING", (0, 0), (-1, -1), 14),
    ]))
    return t


def styled_table(headers, rows, col_widths):
    s = getSampleStyleSheet()
    data = [[Paragraph(f"<b>{h}</b>", s["Normal"]) for h in headers]]
    for row in rows:
        data.append([str(c) for c in row])
    t = Table(data, colWidths=col_widths)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), BLUE), ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"), ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("BACKGROUND", (0, 1), (-1, -1), BG_BLUE), ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    return t


def build_cover(story, S):
    story.append(Spacer(1, 1.8 * inch))
    td = [
        [Paragraph("AffiliateAgent", S["CoverTitle"])],
        [Paragraph("Marketplace Agent Guide", S["CoverSub"])],
        [Spacer(1, 8)],
        [Paragraph("Complete documentation for all 5 AI agents.<br/>How each works, how to install, and how to optimize usage.", S["CoverTag"])],
    ]
    tt = Table(td, colWidths=[6.5 * inch])
    tt.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), BLUE),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("TOPPADDING", (0, 0), (0, 0), 40), ("BOTTOMPADDING", (-1, -1), (-1, -1), 40),
        ("LEFTPADDING", (0, 0), (-1, -1), 20), ("RIGHTPADDING", (0, 0), (-1, -1), 20),
        ("ROUNDEDCORNERS", [12, 12, 12, 12]),
    ]))
    story.append(tt)
    story.append(Spacer(1, 0.6 * inch))
    story.append(Paragraph('<font color="#64748b">Version 1.0  |  March 2026  |  Per-Run Pricing</font>', S["Meta"]))
    story.append(Spacer(1, 0.2 * inch))
    story.append(Paragraph('<font color="#64748b">Platform: GitHub-linked  |  Users charged per run</font>', S["Meta"]))
    story.append(PageBreak())


def build_toc(story, S):
    story.append(Paragraph("Table of Contents", S["Chapter"]))
    story.append(HRFlowable(width="100%", thickness=2, color=BLUE))
    story.append(Spacer(1, 16))
    chapters = [
        "1.  Platform Overview & How Billing Works",
        "2.  Architecture: How the Agents Connect",
        "3.  NicheScout Agent",
        "4.  ProductFinder Agent",
        "5.  ContentCreator Agent",
        "6.  SEOOptimizer Agent",
        "7.  PerformanceAnalyst Agent",
        "8.  Installation Guide (All Agents)",
        "9.  Optimization Playbook: Get More for Less",
        "10. Combining Agents: Power Workflows",
        "11. Troubleshooting",
        "12. Quick Reference Card",
    ]
    for c in chapters:
        story.append(Paragraph(f'<font color="{BLUE.hexval()}"><b>{c[:3]}</b></font>&nbsp;&nbsp;{c[4:]}', S["TOC"]))
    story.append(PageBreak())


def build_ch1(story, S):
    story.append(Paragraph("1. Platform Overview & How Billing Works", S["Chapter"]))
    story.append(HRFlowable(width="100%", thickness=2, color=BLUE))
    story.append(Spacer(1, 12))
    story.append(Paragraph(
        "Each AffiliateAgent is a standalone AI agent published on the marketplace. "
        "The platform links directly to each agent's GitHub repository and allows users "
        "to run agents on-demand, paying only for what they use.", S["Body"]))
    story.append(Paragraph("How per-run billing works:", S["Section"]))
    steps = [
        ("1.", "You select an agent on the marketplace (e.g., NicheScout)"),
        ("2.", "You provide the required inputs (e.g., a niche name)"),
        ("3.", "The platform runs the agent using your inputs"),
        ("4.", "You're charged based on the AI API usage for that run"),
        ("5.", "Results are delivered (reports, articles, analysis)"),
    ]
    for n, d in steps:
        story.append(Paragraph(f'<font color="{BLUE.hexval()}"><b>{n}</b></font>&nbsp;&nbsp;{d}', S["Num"]))
    story.append(Spacer(1, 12))
    story.append(Paragraph("Pricing per agent:", S["Section"]))
    story.append(styled_table(
        ["Agent", "Cost Per Run", "Typical Output"],
        [
            ["NicheScout", "$0.50 - $2.00", "Niche viability report"],
            ["ProductFinder", "$0.30 - $1.50", "Affiliate program comparison"],
            ["ContentCreator", "$1.00 - $3.00", "SEO-optimized article"],
            ["SEOOptimizer", "$0.30 - $1.00", "SEO audit + recommendations"],
            ["PerformanceAnalyst", "$0.20 - $0.80", "Performance report + ROI"],
        ],
        [1.8 * inch, 1.5 * inch, 3.0 * inch],
    ))
    story.append(Spacer(1, 12))
    story.append(tip_box(
        "Costs vary based on the complexity of the task and how much web research the agent needs to do. "
        "Simple tasks cost less; deep research costs more. The platform shows the actual cost after each run.",
        S, BG_GREEN, "PRICING"))
    story.append(Spacer(1, 10))
    story.append(Paragraph("GitHub integration:", S["Section"]))
    story.append(Paragraph(
        "Each agent links to its own GitHub repository. The platform pulls the agent code directly from GitHub, "
        "ensuring you always run the latest version. Repositories are public so you can review the code, "
        "open issues, and suggest improvements.", S["Body"]))
    bullets = [
        "Each agent has its own repo (e.g., <font face='Courier'>affiliate-agent-niche-scout</font>)",
        "All agents depend on <font face='Courier'>affiliate-agent-core</font> (shared foundation)",
        "Updates are automatic when the GitHub repo is updated",
        "You can also install agents locally with <font face='Courier'>pip</font> for development",
    ]
    for b in bullets:
        story.append(Paragraph(f'\u2022&nbsp;&nbsp;{b}', S["Bullet"]))
    story.append(PageBreak())


def build_ch2(story, S):
    story.append(Paragraph("2. Architecture: How the Agents Connect", S["Chapter"]))
    story.append(HRFlowable(width="100%", thickness=2, color=BLUE))
    story.append(Spacer(1, 12))
    story.append(Paragraph(
        "The AffiliateAgent ecosystem uses a modular architecture. Each agent is independent "
        "but they all share a common core foundation.", S["Body"]))
    story.append(Spacer(1, 8))
    # Architecture diagram
    arch = [
        [Paragraph('<font color="#fff"><b>affiliate-agent-core</b></font><br/><font color="#bfdbfe" size="9">Models, Config, Runner, Utilities</font>',
                    ParagraphStyle("a", alignment=TA_CENTER, fontSize=11, textColor=white, leading=16))],
    ]
    at = Table(arch, colWidths=[5.5 * inch])
    at.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), DARK), ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("TOPPADDING", (0, 0), (-1, -1), 14), ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
        ("ROUNDEDCORNERS", [8, 8, 8, 8]),
    ]))
    at.hAlign = "CENTER"
    story.append(at)
    story.append(Paragraph('<font color="#1a56db" size="14">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\u2193&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\u2193&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\u2193&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\u2193&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\u2193</font>',
                           ParagraphStyle("arr", alignment=TA_CENTER, fontSize=14)))

    agents_row = []
    for name, (color, bg) in AGENT_COLORS.items():
        agents_row.append(Paragraph(
            f'<font color="{color.hexval()}" size="8"><b>{name}</b></font>',
            ParagraphStyle("ag", alignment=TA_CENTER, fontSize=8, leading=12)))
    agt = Table([agents_row], colWidths=[1.3 * inch] * 5)
    agt.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), BG_BLUE), ("BACKGROUND", (1, 0), (1, 0), BG_GREEN),
        ("BACKGROUND", (2, 0), (2, 0), BG_PURPLE), ("BACKGROUND", (3, 0), (3, 0), BG_ORANGE),
        ("BACKGROUND", (4, 0), (4, 0), BG_BLUE),
        ("BOX", (0, 0), (0, 0), 1, BORDER), ("BOX", (1, 0), (1, 0), 1, BORDER),
        ("BOX", (2, 0), (2, 0), 1, BORDER), ("BOX", (3, 0), (3, 0), 1, BORDER),
        ("BOX", (4, 0), (4, 0), 1, BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 10), ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
    ]))
    agt.hAlign = "CENTER"
    story.append(agt)

    story.append(Spacer(1, 16))
    story.append(Paragraph("What each layer provides:", S["Section"]))
    story.append(Paragraph(
        "<b>Core (affiliate-agent-core)</b> provides the shared Pydantic data models, "
        "YAML configuration management, and the generic <font face='Courier'>run_agent()</font> function "
        "that all agents use to connect to the Claude Agent SDK.", S["Body"]))
    story.append(Paragraph(
        "<b>Each Agent</b> provides: a specialized system prompt (the agent's expertise), "
        "custom MCP tools (structured data processing), and an entry point (CLI + Python API).", S["Body"]))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Key technical concepts:", S["Section"]))
    terms = [
        ("<b>System Prompt</b> - Detailed instructions that define the agent's personality, expertise, and workflow. This is what makes each agent a specialist.",),
        ("<b>MCP Tools</b> - Custom functions the AI can call during execution. For example, NicheScout's <font face='Courier'>analyze_niche_viability</font> tool structures raw research into a scored analysis.",),
        ("<b>Agent Runner</b> - The core function that starts the AI, feeds it the prompt, manages tool calls, and collects results. Handles the full agentic loop.",),
        ("<b>Per-Run Execution</b> - Each time you run an agent, it starts fresh. The AI searches the web, processes data, and writes output files in a single session.",),
    ]
    for (t,) in terms:
        story.append(Paragraph(f'\u2022&nbsp;&nbsp;{t}', S["Bullet"]))
    story.append(PageBreak())


def build_agent_chapter(story, S, num, name, tagline, color, bg, description, capabilities, tools_desc, inputs, outputs, usage_cli, usage_python, optimization_tips, example_output):
    """Build a chapter for a single agent."""
    story.append(Paragraph(f"{num}. {name} Agent", S["Chapter"]))
    story.append(HRFlowable(width="100%", thickness=2, color=color))
    story.append(Spacer(1, 6))

    # Tagline banner
    tag_data = [[Paragraph(f'<font color="{color.hexval()}" size="13"><b>{name}</b></font><br/>'
                            f'<font color="{GRAY.hexval()}" size="10">{tagline}</font>',
                            ParagraphStyle("tag", fontSize=13, leading=18))]]
    tag_t = Table(tag_data, colWidths=[6.3 * inch])
    tag_t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg), ("BOX", (0, 0), (-1, -1), 1, BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 12), ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
    ]))
    story.append(tag_t)
    story.append(Spacer(1, 10))

    # What it does
    story.append(Paragraph("What it does", S["Section"]))
    story.append(Paragraph(description, S["Body"]))

    # Capabilities
    story.append(Paragraph("Capabilities", S["Section"]))
    for c in capabilities:
        story.append(Paragraph(f'<font color="{color.hexval()}">\u2713</font>&nbsp;&nbsp;{c}', S["Bullet"]))

    # Custom tools
    story.append(Paragraph("Custom AI Tools", S["Section"]))
    for tool_name, tool_desc in tools_desc:
        story.append(Paragraph(f'<font face="Courier" color="{color.hexval()}">{tool_name}</font>', S["SubSec"]))
        story.append(Paragraph(tool_desc, S["Body"]))

    # Inputs & Outputs
    story.append(Paragraph("Inputs", S["Section"]))
    for inp_name, inp_type, inp_req, inp_desc in inputs:
        req_label = '<font color="#16a34a"><b>required</b></font>' if inp_req else '<font color="#64748b">optional</font>'
        story.append(Paragraph(
            f'<font face="Courier" color="{DARK.hexval()}">{inp_name}</font> '
            f'<font color="{GRAY.hexval()}" size="9">({inp_type})</font> {req_label}<br/>'
            f'<font size="10">{inp_desc}</font>', S["Bullet"]))

    story.append(Paragraph("Outputs", S["Section"]))
    for o in outputs:
        story.append(Paragraph(f'\u2022&nbsp;&nbsp;{o}', S["Bullet"]))

    # How to run
    story.append(Paragraph("How to run - Platform", S["Section"]))
    story.append(Paragraph(
        "On the marketplace platform, select this agent, fill in the inputs, and click Run. "
        "Results are delivered directly. You're charged per run based on actual API usage.", S["Body"]))

    story.append(Paragraph("How to run - Command Line", S["Section"]))
    story.append(code_box(usage_cli))

    story.append(Paragraph("How to run - Python", S["Section"]))
    story.append(code_box(usage_python))

    # Example output description
    story.append(Paragraph("What you get", S["Section"]))
    story.append(Paragraph(example_output, S["Body"]))

    # Optimization tips
    story.append(Paragraph("Optimization tips", S["Section"]))
    for t in optimization_tips:
        story.append(Paragraph(f'<font color="{GREEN.hexval()}">\u25b8</font>&nbsp;&nbsp;{t}', S["Bullet"]))

    story.append(PageBreak())


def build_ch8(story, S):
    story.append(Paragraph("8. Installation Guide (All Agents)", S["Chapter"]))
    story.append(HRFlowable(width="100%", thickness=2, color=BLUE))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Option A: Run on the Platform (Easiest)", S["Section"]))
    story.append(Paragraph(
        "No installation required! Simply visit the marketplace, select an agent, "
        "provide inputs, and click Run. The platform handles everything.", S["Body"]))
    story.append(tip_box("This is the recommended option for most users. No coding or setup needed.", S, BG_GREEN, "SUCCESS"))

    story.append(Paragraph("Option B: Install Locally", S["Section"]))
    story.append(Paragraph("For developers who want to run agents from their own machine:", S["Body"]))
    story.append(Paragraph("Prerequisites:", S["SubSec"]))
    prereqs = ["Python 3.10 or newer", "Claude Code CLI (npm install -g @anthropic-ai/claude-code)", "Anthropic API key (from platform.claude.com)"]
    for p in prereqs:
        story.append(Paragraph(f'\u2022&nbsp;&nbsp;{p}', S["Bullet"]))

    story.append(Paragraph("Install core + any agent:", S["SubSec"]))
    story.append(code_box([
        "# Install core (required by all agents)",
        "pip install affiliate-agent-core",
        "",
        "# Install individual agents",
        "pip install affiliate-agent-niche-scout",
        "pip install affiliate-agent-product-finder",
        "pip install affiliate-agent-content-creator",
        "pip install affiliate-agent-seo-optimizer",
        "pip install affiliate-agent-performance-analyst",
        "",
        "# Or install from GitHub",
        "pip install git+https://github.com/stay4ever/affiliate-agent-core.git",
        "pip install git+https://github.com/stay4ever/affiliate-agent-niche-scout.git",
    ]))

    story.append(Paragraph("Set your API key:", S["SubSec"]))
    story.append(code_box([
        "# Create .env file in your working directory",
        "echo 'ANTHROPIC_API_KEY=sk-ant-...' > .env",
    ]))

    story.append(Paragraph("Run an agent:", S["SubSec"]))
    story.append(code_box([
        '# Via CLI entry point',
        'niche-scout "wireless earbuds"',
        '',
        '# Via Python module',
        'python -m affiliate_agent_niche_scout "wireless earbuds"',
    ]))
    story.append(PageBreak())


def build_ch9(story, S):
    story.append(Paragraph("9. Optimization Playbook: Get More for Less", S["Chapter"]))
    story.append(HRFlowable(width="100%", thickness=2, color=BLUE))
    story.append(Spacer(1, 12))

    story.append(Paragraph(
        "Since you pay per run, optimizing your usage means better results at lower cost. "
        "Here are proven strategies:", S["Body"]))

    tips = [
        ("Be specific with inputs",
         "\"wireless earbuds under $50 for runners\" costs about the same as \"earbuds\" "
         "but produces much more targeted, useful output.",
         "$0.10-0.30 saved per run"),
        ("Start with NicheScout before other agents",
         "Researching the niche first tells you exactly which products to focus on and which "
         "keywords to target. This makes ProductFinder and ContentCreator runs more efficient.",
         "30-50% more relevant output"),
        ("Use ContentCreator with specific keywords",
         "Providing a clear target keyword means less research time for the agent. "
         "Don't make it guess what to optimize for.",
         "$0.20-0.50 saved per content run"),
        ("Batch your SEO audits",
         "Run SEOOptimizer on multiple articles by pointing it to a directory. "
         "One run can audit many files.",
         "5-10x more files per dollar"),
        ("Feed PerformanceAnalyst clean data",
         "Pre-format your CSV/JSON data clearly. The less time the agent spends parsing "
         "messy data, the more it spends on actual analysis.",
         "$0.10-0.20 saved per run"),
        ("Use the right content type",
         "A 'listicle' is cheaper than a 'buying_guide' because it's shorter. "
         "Match the content type to your actual need.",
         "Up to 50% cost difference"),
    ]

    for title, desc, saving in tips:
        card = [[Paragraph(
            f'<font color="{GREEN.hexval()}" size="12"><b>{title}</b></font><br/><br/>'
            f'<font size="10">{desc}</font><br/><br/>'
            f'<font color="{GREEN.hexval()}" size="9"><b>Savings:</b> {saving}</font>',
            ParagraphStyle("tip_card", fontSize=10, leading=15))]]
        ct = Table(card, colWidths=[6.3 * inch])
        ct.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), BG_GREEN), ("BOX", (0, 0), (-1, -1), 1, BORDER),
            ("TOPPADDING", (0, 0), (-1, -1), 10), ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ("LEFTPADDING", (0, 0), (-1, -1), 14), ("RIGHTPADDING", (0, 0), (-1, -1), 14),
        ]))
        story.append(ct)
        story.append(Spacer(1, 6))

    story.append(PageBreak())


def build_ch10(story, S):
    story.append(Paragraph("10. Combining Agents: Power Workflows", S["Chapter"]))
    story.append(HRFlowable(width="100%", thickness=2, color=BLUE))
    story.append(Spacer(1, 12))

    story.append(Paragraph(
        "While each agent works independently, combining them creates powerful end-to-end workflows. "
        "Here are the most effective sequences:", S["Body"]))

    story.append(Paragraph("Workflow A: Launch a New Niche Site", S["Section"]))
    wf_a = [
        ("1. NicheScout", "Research the niche viability", "$0.50-$2.00"),
        ("2. ProductFinder", "Find the best affiliate programs", "$0.30-$1.50"),
        ("3. ContentCreator", "Write 3-5 pillar articles", "$3.00-$15.00"),
        ("4. SEOOptimizer", "Audit and optimize all content", "$0.30-$1.00"),
        ("", "", ""),
        ("Total", "Complete niche site content", "$4.10-$19.50"),
    ]
    story.append(styled_table(
        ["Step", "Action", "Est. Cost"],
        wf_a, [1.8 * inch, 3.0 * inch, 1.5 * inch]))

    story.append(Spacer(1, 14))
    story.append(Paragraph("Workflow B: Monthly Content Sprint", S["Section"]))
    wf_b = [
        ("1. ContentCreator", "Write 10 product reviews", "$10-$30"),
        ("2. ContentCreator", "Write 2 comparison articles", "$2-$6"),
        ("3. ContentCreator", "Write 1 buying guide", "$1-$3"),
        ("4. SEOOptimizer", "Batch audit all 13 articles", "$0.30-$1.00"),
        ("", "", ""),
        ("Total", "13 optimized articles", "$13.30-$40.00"),
    ]
    story.append(styled_table(
        ["Step", "Action", "Est. Cost"],
        wf_b, [1.8 * inch, 3.0 * inch, 1.5 * inch]))

    story.append(Spacer(1, 14))
    story.append(Paragraph("Workflow C: Performance Review & Optimization", S["Section"]))
    wf_c = [
        ("1. PerformanceAnalyst", "Analyze last month's data", "$0.20-$0.80"),
        ("2. SEOOptimizer", "Optimize underperforming articles", "$0.30-$1.00"),
        ("3. ContentCreator", "Rewrite low-conversion content", "$1.00-$3.00"),
        ("", "", ""),
        ("Total", "Data-driven optimization", "$1.50-$4.80"),
    ]
    story.append(styled_table(
        ["Step", "Action", "Est. Cost"],
        wf_c, [1.8 * inch, 3.0 * inch, 1.5 * inch]))

    story.append(Spacer(1, 12))
    story.append(tip_box(
        "Start with Workflow A when entering a new niche. Use Workflow B for ongoing content production. "
        "Run Workflow C monthly to continuously improve your results.", S, BG_BLUE, "TIP"))
    story.append(PageBreak())


def build_ch11(story, S):
    story.append(Paragraph("11. Troubleshooting", S["Chapter"]))
    story.append(HRFlowable(width="100%", thickness=2, color=BLUE))
    story.append(Spacer(1, 12))

    issues = [
        ("Agent run fails on the platform", "Check that all required inputs are filled in correctly. The niche/topic should be a clear, specific string.", "Try with a simpler input like 'yoga mats' to test"),
        ("Output seems too short or generic", "The agent may not have found enough data via web search. Try a more specific or popular niche.", "Add more context to your input, e.g., 'budget yoga mats for beginners'"),
        ("Cost was higher than expected", "Complex niches with lots of competition data require more research steps.", "Use budget caps when available, start with simpler queries"),
        ("'Module not found' error (local install)", "The core package or agent isn't installed in the active environment.", "pip install affiliate-agent-core && pip install affiliate-agent-<name>"),
        ("API key error (local install)", "Your .env file is missing or the key is invalid.", "Verify ANTHROPIC_API_KEY is set correctly in your .env file"),
        ("Agent doesn't save output files (local)", "The output directory may not exist.", "Create it with: mkdir -p output"),
    ]

    for problem, cause, fix in issues:
        card = [[Paragraph(
            f'<font color="{ORANGE.hexval()}" size="10"><b>{problem}</b></font><br/><br/>'
            f'<font size="10"><b>Cause:</b> {cause}</font><br/>'
            f'<font color="{GREEN.hexval()}" size="10"><b>Fix:</b> {fix}</font>',
            ParagraphStyle("iss", fontSize=10, leading=15))]]
        ct = Table(card, colWidths=[6.3 * inch])
        ct.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), BG_ORANGE), ("BOX", (0, 0), (-1, -1), 1, BORDER),
            ("TOPPADDING", (0, 0), (-1, -1), 10), ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ("LEFTPADDING", (0, 0), (-1, -1), 12), ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ]))
        story.append(ct)
        story.append(Spacer(1, 6))
    story.append(PageBreak())


def build_ch12(story, S):
    story.append(Paragraph("12. Quick Reference Card", S["Chapter"]))
    story.append(HRFlowable(width="100%", thickness=2, color=BLUE))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Agent Summary", S["Section"]))
    story.append(styled_table(
        ["Agent", "Best For", "Cost/Run", "Key Input"],
        [
            ["NicheScout", "Market research", "$0.50-$2.00", "Niche name"],
            ["ProductFinder", "Finding programs", "$0.30-$1.50", "Niche name"],
            ["ContentCreator", "Writing articles", "$1.00-$3.00", "Topic + keyword + type"],
            ["SEOOptimizer", "SEO audits", "$0.30-$1.00", "Content file + keyword"],
            ["PerformanceAnalyst", "Data analysis", "$0.20-$0.80", "Data file + period"],
        ],
        [1.5 * inch, 1.5 * inch, 1.3 * inch, 2.0 * inch]))

    story.append(Spacer(1, 14))
    story.append(Paragraph("Content Types (ContentCreator)", S["Section"]))
    story.append(styled_table(
        ["Type", "Word Count", "Best For"],
        [
            ["review", "2000-3000", "Single product deep-dive"],
            ["comparison", "2500-3500", "'X vs Y' articles"],
            ["buying_guide", "3000-4500", "'Best X for Y' roundups"],
            ["how_to", "1500-2500", "Tutorial + product recommendations"],
            ["listicle", "2000-3000", "'Top 10' numbered lists"],
            ["roundup", "2500-4000", "Category winners overview"],
        ],
        [1.5 * inch, 1.5 * inch, 3.3 * inch]))

    story.append(Spacer(1, 14))
    story.append(Paragraph("CLI Commands (Local Install)", S["Section"]))
    story.append(code_box([
        '# NicheScout',
        'niche-scout "wireless earbuds"',
        '',
        '# ProductFinder',
        'product-finder "home office"',
        '',
        '# ContentCreator',
        'content-creator "AirPods Pro" --type review --keyword "airpods pro review"',
        '',
        '# SEOOptimizer',
        'seo-optimizer ./output/review-airpods.md --keyword "airpods pro review"',
        '',
        '# PerformanceAnalyst',
        'performance-analyst ./data/march.csv --period "March 2026"',
    ]))

    story.append(Spacer(1, 14))
    story.append(Paragraph("GitHub Repositories", S["Section"]))
    repos = [
        ["Core", "github.com/stay4ever/affiliate-agent-core"],
        ["NicheScout", "github.com/stay4ever/affiliate-agent-niche-scout"],
        ["ProductFinder", "github.com/stay4ever/affiliate-agent-product-finder"],
        ["ContentCreator", "github.com/stay4ever/affiliate-agent-content-creator"],
        ["SEOOptimizer", "github.com/stay4ever/affiliate-agent-seo-optimizer"],
        ["PerformanceAnalyst", "github.com/stay4ever/affiliate-agent-performance-analyst"],
    ]
    story.append(styled_table(["Package", "Repository"], repos, [1.8 * inch, 4.5 * inch]))

    story.append(Spacer(1, 20))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        '<font color="#64748b">AffiliateAgent v0.1.0  |  Per-run pricing  |  Powered by Claude Agent SDK</font>',
        ParagraphStyle("ff", alignment=TA_CENTER, fontSize=9)))


def generate_pdf(output_path="AffiliateAgent-Marketplace-Guide.pdf"):
    doc = SimpleDocTemplate(
        output_path, pagesize=letter,
        topMargin=0.75 * inch, bottomMargin=0.75 * inch,
        leftMargin=0.85 * inch, rightMargin=0.85 * inch,
        title="AffiliateAgent - Marketplace Agent Guide",
        author="AffiliateAgent Team",
        subject="Complete guide for all 5 marketplace agents",
    )

    S = get_styles()
    story = []

    build_cover(story, S)
    build_toc(story, S)
    build_ch1(story, S)
    build_ch2(story, S)

    # ── Agent chapters ──────────────────────────────────
    build_agent_chapter(story, S, 3, "NicheScout",
        "AI-powered niche research for affiliate marketing",
        BLUE, BG_BLUE,
        "NicheScout is an autonomous AI agent that researches and analyzes profitable niches for affiliate marketing. "
        "It searches the web for market data, identifies keyword opportunities with buyer intent, scores competition "
        "levels, and delivers structured viability reports with actionable recommendations.",
        [
            "Web research for market trends, competition, and products",
            "Competition scoring using a 5-criteria framework (1-10 each)",
            "Keyword identification with buyer intent classification",
            "Affiliate program discovery within the niche",
            "Structured viability reports with 0-100 scoring",
            "Actionable recommendations based on data",
        ],
        [
            ("analyze_niche_viability", "Takes raw research data about a niche and structures it into a scored viability analysis. Returns JSON with: niche score (0-100), competition level, estimated traffic, monetization potential, top keywords, and specific recommendations."),
            ("score_niche_competition", "Analyzes competitor data and scores competition across 5 criteria: domain authority of top results, content quality, number of affiliate sites, brand presence, and content freshness. Each scored 1-10."),
        ],
        [("niche", "string", True, "The niche to research (e.g., 'wireless earbuds', 'yoga mats', 'pet cameras')"),
         ("output_dir", "string", False, "Directory to save the report (default: ./output)")],
        ["Markdown report with complete niche viability analysis",
         "Competition scoring with 5-criteria breakdown",
         "Top 10 keywords with buyer intent indicators",
         "Affiliate program recommendations for the niche"],
        ['niche-scout "wireless earbuds"',
         'niche-scout "home gym equipment" --verbose',
         'niche-scout "organic skincare" --max-budget 2.0'],
        ['from affiliate_agent_niche_scout.entry import run_niche_scout',
         'import asyncio',
         '',
         'result = asyncio.run(run_niche_scout(',
         '    niche="portable blenders",',
         '    verbose=True,',
         '    max_budget_usd=2.0,',
         '))'],
        [
            "<b>Be specific</b> - 'budget wireless earbuds for running' produces better results than 'earbuds'",
            "<b>Research before writing</b> - Always run NicheScout before ContentCreator to know which keywords to target",
            "<b>Compare 2-3 niches</b> - Run NicheScout on multiple niches and compare scores before committing",
            "<b>Check competition first</b> - A high score with low competition is the sweet spot",
        ],
        "A structured Markdown report (typically 1000-2000 words) containing: executive summary with viability score, "
        "keyword table with search volume and difficulty estimates, competitor analysis with strengths and weaknesses, "
        "affiliate program overview, and 3-5 specific next-step recommendations."
    )

    build_agent_chapter(story, S, 4, "ProductFinder",
        "Discover the most profitable affiliate programs in any niche",
        GREEN, BG_GREEN,
        "ProductFinder is an autonomous AI agent that discovers, evaluates, and compares affiliate programs. "
        "It searches the web for programs in your niche, creates standardized profiles for each, "
        "and delivers a ranked comparison report recommending the best programs to join.",
        [
            "Affiliate program discovery via web research",
            "Standardized program profiling (commission, cookies, payments)",
            "Side-by-side comparison across 7 dimensions",
            "Ranked recommendations based on earning potential",
            "Official source verification for program details",
        ],
        [
            ("structure_affiliate_program", "Creates a standardized record for an affiliate program with fields for name, URL, commission rate, cookie duration, category, and evaluation criteria. Ensures consistent data format across all discovered programs."),
            ("compare_affiliate_programs", "Takes an array of program records and generates a side-by-side comparison across 7 dimensions: commission rate, cookie duration, payment terms, product quality, brand trust, estimated conversion rate, and support quality."),
        ],
        [("niche", "string", True, "The niche to search for programs (e.g., 'home office', 'fitness equipment')"),
         ("output_dir", "string", False, "Directory to save the report (default: ./output)")],
        ["Structured profiles for each affiliate program found",
         "Side-by-side comparison table across 7 dimensions",
         "Ranked recommendations with pros and cons"],
        ['product-finder "home office equipment"',
         'product-finder "fitness supplements" --verbose'],
        ['from affiliate_agent_product_finder.entry import run_product_finder',
         'import asyncio',
         '',
         'result = asyncio.run(run_product_finder(',
         '    niche="home office equipment",',
         '    verbose=True,',
         '))'],
        [
            "<b>Narrow your niche</b> - 'ergonomic standing desks' finds better programs than 'furniture'",
            "<b>Run after NicheScout</b> - Use NicheScout's recommendations to know exactly which sub-niches to search",
            "<b>Look for recurring commissions</b> - SaaS and subscription products often pay monthly recurring commissions",
            "<b>Prioritize cookie duration</b> - Longer cookies (30-90 days) mean more credited sales",
        ],
        "A comparison report listing 5-10 affiliate programs with standardized profiles, a comparison table, "
        "and a final ranked recommendation section explaining which programs to prioritize and why."
    )

    build_agent_chapter(story, S, 5, "ContentCreator",
        "Generate SEO-optimized affiliate marketing content automatically",
        PURPLE, BG_PURPLE,
        "ContentCreator is an autonomous AI agent that writes professional affiliate marketing content. "
        "It supports 6 content types (review, comparison, buying guide, how-to, listicle, roundup), "
        "plans content structure with a brief, researches topics via web search, writes the full article, "
        "and verifies SEO quality - all in a single run.",
        [
            "6 content types with optimized templates",
            "Structured content briefs with section planning",
            "Web research for current, accurate information",
            "SEO optimization with keyword density analysis",
            "FTC-compliant affiliate disclosures",
            "Meta title and description generation",
        ],
        [
            ("generate_content_brief", "Creates a structured content plan based on the content type. Returns section outlines (7-9 sections), word count targets (1500-4500), CTA placement recommendations, SEO guidelines, and affiliate compliance rules."),
            ("optimize_content_seo", "Analyzes finished content for SEO quality. Checks word count, keyword density (target: 0.5-2.5%), heading count, and returns a checklist with specific suggestions for improvement."),
        ],
        [("topic", "string", True, "The topic to write about (e.g., 'Sony WH-1000XM6', 'Budget Standing Desks')"),
         ("content_type", "string", False, "review, comparison, buying_guide, how_to, listicle, or roundup (default: review)"),
         ("keyword", "string", True, "Target SEO keyword (e.g., 'sony wh-1000xm6 review')"),
         ("output_dir", "string", False, "Directory to save the article (default: ./output)")],
        ["Complete Markdown article (1500-4500 words depending on type)",
         "Structured headings, comparison tables, FAQ sections",
         "FTC affiliate disclosure included",
         "SEO optimization report"],
        ['content-creator "Sony WH-1000XM6" --type review --keyword "sony xm6 review"',
         'content-creator "AirPods vs Galaxy Buds" --type comparison --keyword "airpods vs galaxy buds"',
         'content-creator "Standing Desks" --type buying_guide --keyword "best standing desks 2026"'],
        ['from affiliate_agent_content_creator.entry import run_content_creator',
         'import asyncio',
         '',
         'result = asyncio.run(run_content_creator(',
         '    topic="Sony WH-1000XM6",',
         '    content_type="review",',
         '    keyword="sony wh-1000xm6 review",',
         '    verbose=True,',
         '))'],
        [
            "<b>Always provide a keyword</b> - This is the most important optimization; it focuses the entire article",
            "<b>Match content type to intent</b> - Use 'review' for product pages, 'buying_guide' for category pages, 'comparison' for vs. pages",
            "<b>Listicles are cheapest</b> - If you need volume, listicles produce good content at lower cost than buying guides",
            "<b>Review and edit</b> - AI content is a strong first draft; add personal experience and unique angles before publishing",
            "<b>Batch similar topics</b> - Writing 5 reviews in the same niche is more cost-effective than 5 across different niches",
        ],
        "A complete, publish-ready Markdown article with: meta title and description, FTC disclosure, structured headings (H2/H3), "
        "comparison tables where appropriate, pros and cons, clear CTAs with affiliate link placement suggestions, and an FAQ section."
    )

    build_agent_chapter(story, S, 6, "SEOOptimizer",
        "Optimize your affiliate content for search engine rankings",
        ORANGE, BG_ORANGE,
        "SEOOptimizer is an autonomous AI agent that audits and optimizes affiliate marketing content for search engines. "
        "It analyzes keyword usage, content structure, heading hierarchy, and meta tags, then provides a scored audit "
        "(0-100) with specific, actionable recommendations to improve rankings.",
        [
            "Comprehensive SEO content auditing with 0-100 score",
            "Keyword density and placement analysis",
            "Heading structure and hierarchy validation",
            "Meta tag recommendations",
            "Internal linking suggestions",
            "Keyword expansion with buyer intent classification",
        ],
        [
            ("audit_content_seo", "Performs a comprehensive SEO audit on content. Returns: word count, keyword metrics, heading analysis, a 0-100 score, and a prioritized list of specific improvements."),
            ("generate_keyword_suggestions", "Takes a seed keyword and niche, returns structured suggestions categorized by intent: informational, commercial, transactional, and navigational."),
        ],
        [("content_path", "string", True, "Path to content file or directory to audit"),
         ("keyword", "string", False, "Target keyword to optimize for"),
         ("output_dir", "string", False, "Directory to save the audit report (default: ./output)")],
        ["SEO audit report with 0-100 score",
         "Prioritized list of specific optimization recommendations",
         "Keyword suggestions with intent classification"],
        ['seo-optimizer ./output/review-sony-xm6.md --keyword "sony xm6 review"',
         'seo-optimizer ./output/ --verbose'],
        ['from affiliate_agent_seo_optimizer.entry import run_seo_optimizer',
         'import asyncio',
         '',
         'result = asyncio.run(run_seo_optimizer(',
         '    content_path="./output/review-sony-xm6.md",',
         '    keyword="sony wh-1000xm6 review",',
         '    verbose=True,',
         '))'],
        [
            "<b>Audit entire directories</b> - Point SEOOptimizer at your output/ folder to audit all articles in one run",
            "<b>Run after ContentCreator</b> - First draft from ContentCreator + SEO audit = optimized final content",
            "<b>Provide the target keyword</b> - Without a keyword, the audit is generic; with one, it's targeted and actionable",
            "<b>Re-audit after changes</b> - After implementing recommendations, run again to verify improvement",
        ],
        "An SEO audit report with a 0-100 score, a breakdown of keyword density, heading structure, word count checks, "
        "and a prioritized list of 5-10 specific recommendations with expected impact on rankings."
    )

    build_agent_chapter(story, S, 7, "PerformanceAnalyst",
        "Turn your affiliate data into actionable optimization insights",
        BLUE, BG_BLUE,
        "PerformanceAnalyst is an autonomous AI agent that analyzes your affiliate marketing performance data. "
        "It reads your data files (CSV, JSON, or any tabular format), calculates key metrics including ROI, "
        "benchmarks against industry standards, identifies top and bottom performers, and delivers specific "
        "optimization recommendations backed by numbers.",
        [
            "Performance data analysis (CSV, JSON, tabular formats)",
            "ROI calculation with break-even analysis",
            "KPI benchmarking against industry standards",
            "Top and bottom performer identification",
            "Revenue forecasting and projections",
            "5+ specific, actionable recommendations",
        ],
        [
            ("generate_performance_report", "Structures raw metrics into a professional report. Includes KPI framework (CTR, conversion rate, EPC, RPM, AOV), benchmarks (good CTR: 2-5%, good conversion: 1-3%), optimization areas, and analysis instructions."),
            ("calculate_affiliate_roi", "Calculates financial metrics from cost and revenue data: profit, ROI percentage, daily revenue, daily profit, monthly projections, and break-even estimate. Returns 'profitable', 'break-even', or 'unprofitable' assessment."),
        ],
        [("data_file", "string", True, "Path to performance data file (CSV, JSON, etc.)"),
         ("period", "string", False, "Reporting period (default: 'last 30 days')"),
         ("output_dir", "string", False, "Directory to save the report (default: ./output)")],
        ["Performance report with KPI analysis vs. benchmarks",
         "ROI calculation with monthly projections",
         "Top and bottom performer identification",
         "5+ specific optimization recommendations with expected impact"],
        ['performance-analyst ./data/march-2026.csv --period "March 2026"',
         'performance-analyst ./data/q1.json --period "Q1 2026" --verbose'],
        ['from affiliate_agent_performance_analyst.entry import run_performance_analyst',
         'import asyncio',
         '',
         'result = asyncio.run(run_performance_analyst(',
         '    data_file="./data/march-2026.csv",',
         '    period="March 2026",',
         '    verbose=True,',
         '))'],
        [
            "<b>Clean data = better analysis</b> - Format your CSV with clear headers (clicks, conversions, revenue, product_name)",
            "<b>Include cost data</b> - If you have costs, the ROI calculator adds massive value to the report",
            "<b>Monthly cadence</b> - Run PerformanceAnalyst monthly to track trends and catch issues early",
            "<b>Act on recommendations</b> - The agent identifies your lowest-hanging fruit; prioritize those fixes first",
            "<b>Compare periods</b> - Run for 'February 2026' and 'March 2026' to see month-over-month trends",
        ],
        "A performance report with: executive summary, KPI dashboard comparing your metrics to industry benchmarks, "
        "ROI analysis with monthly projections and break-even timeline, ranked list of top and bottom performing content/products, "
        "and 5+ specific recommendations each tied to a data point and expected outcome."
    )

    build_ch8(story, S)
    build_ch9(story, S)
    build_ch10(story, S)
    build_ch11(story, S)
    build_ch12(story, S)

    doc.build(story, onFirstPage=hf, onLaterPages=hf)
    print(f"PDF generated: {output_path}")


if __name__ == "__main__":
    generate_pdf()
