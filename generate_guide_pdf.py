"""Generate the AffiliateAgent PDF guide for non-technical users."""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    PageBreak,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether,
    ListFlowable,
    ListItem,
)
from reportlab.platypus.frames import Frame
from reportlab.platypus.doctemplate import PageTemplate


# ── Colors ──────────────────────────────────────────────
BRAND_BLUE = HexColor("#1a56db")
BRAND_DARK = HexColor("#1e293b")
BRAND_LIGHT = HexColor("#f1f5f9")
BRAND_GREEN = HexColor("#16a34a")
BRAND_ORANGE = HexColor("#ea580c")
BRAND_GRAY = HexColor("#64748b")
BRAND_ACCENT = HexColor("#7c3aed")
BRAND_BG_BLUE = HexColor("#eff6ff")
BRAND_BG_GREEN = HexColor("#f0fdf4")
BRAND_BG_ORANGE = HexColor("#fff7ed")
BRAND_BG_PURPLE = HexColor("#f5f3ff")
BORDER_COLOR = HexColor("#e2e8f0")


def get_styles():
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        "CoverTitle",
        parent=styles["Title"],
        fontSize=36,
        leading=44,
        textColor=white,
        alignment=TA_CENTER,
        spaceAfter=12,
        fontName="Helvetica-Bold",
    ))
    styles.add(ParagraphStyle(
        "CoverSubtitle",
        parent=styles["Normal"],
        fontSize=16,
        leading=22,
        textColor=HexColor("#bfdbfe"),
        alignment=TA_CENTER,
        spaceAfter=8,
        fontName="Helvetica",
    ))
    styles.add(ParagraphStyle(
        "CoverTagline",
        parent=styles["Normal"],
        fontSize=12,
        leading=18,
        textColor=HexColor("#93c5fd"),
        alignment=TA_CENTER,
        fontName="Helvetica-Oblique",
    ))
    styles.add(ParagraphStyle(
        "ChapterTitle",
        parent=styles["Heading1"],
        fontSize=26,
        leading=34,
        textColor=BRAND_BLUE,
        spaceAfter=16,
        spaceBefore=0,
        fontName="Helvetica-Bold",
    ))
    styles.add(ParagraphStyle(
        "SectionTitle",
        parent=styles["Heading2"],
        fontSize=18,
        leading=24,
        textColor=BRAND_DARK,
        spaceBefore=18,
        spaceAfter=10,
        fontName="Helvetica-Bold",
    ))
    styles.add(ParagraphStyle(
        "SubSection",
        parent=styles["Heading3"],
        fontSize=14,
        leading=20,
        textColor=BRAND_BLUE,
        spaceBefore=14,
        spaceAfter=8,
        fontName="Helvetica-Bold",
    ))
    styles.add(ParagraphStyle(
        "BodyText2",
        parent=styles["Normal"],
        fontSize=11,
        leading=17,
        textColor=BRAND_DARK,
        alignment=TA_JUSTIFY,
        spaceAfter=8,
        fontName="Helvetica",
    ))
    styles.add(ParagraphStyle(
        "CodeBlock",
        parent=styles["Code"],
        fontSize=9.5,
        leading=14,
        textColor=HexColor("#1e293b"),
        backColor=BRAND_LIGHT,
        borderColor=BORDER_COLOR,
        borderWidth=1,
        borderPadding=(8, 8, 8, 8),
        spaceAfter=10,
        fontName="Courier",
        leftIndent=12,
        rightIndent=12,
    ))
    styles.add(ParagraphStyle(
        "TipText",
        parent=styles["Normal"],
        fontSize=10.5,
        leading=16,
        textColor=BRAND_DARK,
        fontName="Helvetica",
        leftIndent=12,
    ))
    styles.add(ParagraphStyle(
        "BulletText",
        parent=styles["Normal"],
        fontSize=11,
        leading=17,
        textColor=BRAND_DARK,
        fontName="Helvetica",
        spaceAfter=4,
        bulletIndent=18,
        leftIndent=36,
    ))
    styles.add(ParagraphStyle(
        "NumberText",
        parent=styles["Normal"],
        fontSize=11,
        leading=17,
        textColor=BRAND_DARK,
        fontName="Helvetica",
        spaceAfter=6,
        leftIndent=36,
        bulletIndent=18,
    ))
    styles.add(ParagraphStyle(
        "FooterStyle",
        parent=styles["Normal"],
        fontSize=8,
        textColor=BRAND_GRAY,
        alignment=TA_CENTER,
    ))
    styles.add(ParagraphStyle(
        "TOCEntry",
        parent=styles["Normal"],
        fontSize=13,
        leading=26,
        textColor=BRAND_DARK,
        fontName="Helvetica",
        leftIndent=20,
    ))
    styles.add(ParagraphStyle(
        "CaptionStyle",
        parent=styles["Normal"],
        fontSize=9,
        leading=13,
        textColor=BRAND_GRAY,
        fontName="Helvetica-Oblique",
        alignment=TA_CENTER,
        spaceAfter=12,
    ))
    return styles


def tip_box(text, styles, color=BRAND_BG_BLUE, icon="TIP"):
    """Create a styled tip/note box."""
    icon_colors = {
        "TIP": BRAND_BLUE,
        "NOTE": BRAND_ACCENT,
        "WARNING": BRAND_ORANGE,
        "SUCCESS": BRAND_GREEN,
    }
    ic = icon_colors.get(icon, BRAND_BLUE)
    data = [[Paragraph(
        f'<font color="{ic.hexval()}"><b>{icon}:</b></font> {text}',
        styles["TipText"],
    )]]
    t = Table(data, colWidths=[6.3 * inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), color),
        ("BOX", (0, 0), (-1, -1), 1, BORDER_COLOR),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
    ]))
    return t


def code_box(lines):
    """Create a styled code block from a list of strings."""
    text = "<br/>".join(
        line.replace(" ", "&nbsp;").replace("<", "&lt;").replace(">", "&gt;")
        for line in lines
    )
    data = [[Paragraph(
        f'<font face="Courier" size="9" color="#1e293b">{text}</font>',
        ParagraphStyle("inner", fontSize=9, leading=14),
    )]]
    t = Table(data, colWidths=[6.3 * inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), BRAND_LIGHT),
        ("BOX", (0, 0), (-1, -1), 1, BORDER_COLOR),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
    ]))
    return t


def header_footer(canvas_obj, doc):
    """Add header and footer to each page."""
    canvas_obj.saveState()
    # Footer
    canvas_obj.setFont("Helvetica", 8)
    canvas_obj.setFillColor(BRAND_GRAY)
    canvas_obj.drawCentredString(
        letter[0] / 2, 0.5 * inch,
        f"AffiliateAgent Guide  |  Page {doc.page}"
    )
    # Top accent line
    if doc.page > 1:
        canvas_obj.setStrokeColor(BRAND_BLUE)
        canvas_obj.setLineWidth(2)
        canvas_obj.line(0.75 * inch, letter[1] - 0.55 * inch, letter[0] - 0.75 * inch, letter[1] - 0.55 * inch)
    canvas_obj.restoreState()


def build_cover(story, styles):
    """Build the cover page."""
    story.append(Spacer(1, 1.5 * inch))

    # Blue cover box
    cover_data = [[""]]
    cover_table = Table(cover_data, colWidths=[6.5 * inch], rowHeights=[3.8 * inch])
    cover_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), BRAND_BLUE),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ROUNDEDCORNERS", [12, 12, 12, 12]),
    ]))

    # We'll build the cover content separately
    story.append(Spacer(1, 0.5 * inch))

    # Title block with background
    title_data = [[
        Paragraph("AffiliateAgent", styles["CoverTitle"]),
    ], [
        Paragraph("The Complete Beginner's Guide", styles["CoverSubtitle"]),
    ], [
        Spacer(1, 8),
    ], [
        Paragraph("Set up and run your AI-powered affiliate marketing<br/>assistant in minutes - no coding required", styles["CoverTagline"]),
    ]]

    title_table = Table(title_data, colWidths=[6.5 * inch])
    title_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), BRAND_BLUE),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (0, 0), 40),
        ("BOTTOMPADDING", (-1, -1), (-1, -1), 40),
        ("LEFTPADDING", (0, 0), (-1, -1), 20),
        ("RIGHTPADDING", (0, 0), (-1, -1), 20),
        ("ROUNDEDCORNERS", [12, 12, 12, 12]),
    ]))
    story.append(title_table)

    story.append(Spacer(1, 0.8 * inch))

    # Version and date
    story.append(Paragraph(
        '<font color="#64748b">Version 1.0  |  March 2026</font>',
        ParagraphStyle("meta", parent=styles["Normal"], alignment=TA_CENTER, fontSize=11),
    ))
    story.append(Spacer(1, 0.3 * inch))
    story.append(Paragraph(
        '<font color="#64748b">Powered by Claude Agent SDK</font>',
        ParagraphStyle("meta2", parent=styles["Normal"], alignment=TA_CENTER, fontSize=10),
    ))

    story.append(PageBreak())


def build_toc(story, styles):
    """Build the table of contents."""
    story.append(Paragraph("Table of Contents", styles["ChapterTitle"]))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=2, color=BRAND_BLUE))
    story.append(Spacer(1, 16))

    chapters = [
        ("1.", "What is AffiliateAgent?"),
        ("2.", "What You Need Before Starting"),
        ("3.", "Step-by-Step Setup (Easy Installer)"),
        ("4.", "Your First Command"),
        ("5.", "The 5 AI Agents Explained"),
        ("6.", "Complete Command Reference"),
        ("7.", "Real-World Workflow Examples"),
        ("8.", "Understanding Your Output Files"),
        ("9.", "Controlling Costs"),
        ("10.", "Troubleshooting Common Issues"),
        ("11.", "Glossary"),
        ("12.", "Quick Reference Card"),
    ]

    for num, title in chapters:
        story.append(Paragraph(
            f'<font color="{BRAND_BLUE.hexval()}"><b>{num}</b></font>&nbsp;&nbsp;&nbsp;{title}',
            styles["TOCEntry"],
        ))

    story.append(PageBreak())


def build_chapter_1(story, styles):
    """What is AffiliateAgent?"""
    story.append(Paragraph("1. What is AffiliateAgent?", styles["ChapterTitle"]))
    story.append(HRFlowable(width="100%", thickness=2, color=BRAND_BLUE))
    story.append(Spacer(1, 12))

    story.append(Paragraph(
        "AffiliateAgent is an AI-powered assistant that helps you build and grow an affiliate marketing business. "
        "Instead of spending hours researching niches, hunting for affiliate programs, and writing product reviews, "
        "you give AffiliateAgent a simple command and it does the work for you.",
        styles["BodyText2"],
    ))
    story.append(Spacer(1, 8))

    story.append(Paragraph("What it can do for you:", styles["SectionTitle"]))

    benefits = [
        ("<b>Find profitable niches</b> - Discovers market opportunities with low competition and high earning potential",
         BRAND_BLUE),
        ("<b>Discover affiliate programs</b> - Finds the best programs to join, compares commission rates and terms",
         BRAND_GREEN),
        ("<b>Write SEO content</b> - Creates product reviews, comparisons, buying guides optimized for Google",
         BRAND_ACCENT),
        ("<b>Optimize for search engines</b> - Checks your content for SEO best practices automatically",
         BRAND_ORANGE),
        ("<b>Analyze performance</b> - Reviews your data and tells you exactly what to improve",
         BRAND_BLUE),
    ]

    for text, color in benefits:
        data = [[Paragraph(
            f'<font color="{color.hexval()}">\u25cf</font>&nbsp;&nbsp;{text}',
            styles["BodyText2"],
        )]]
        t = Table(data, colWidths=[6.3 * inch])
        t.setStyle(TableStyle([
            ("LEFTPADDING", (0, 0), (-1, -1), 14),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(t)

    story.append(Spacer(1, 12))
    story.append(tip_box(
        "You do NOT need to know how to code. This guide will walk you through every step with "
        "copy-paste commands. If you can type in a terminal, you can use AffiliateAgent.",
        styles, BRAND_BG_GREEN, "SUCCESS",
    ))

    story.append(Spacer(1, 12))
    story.append(Paragraph("How it works (simplified):", styles["SectionTitle"]))
    story.append(Paragraph(
        "AffiliateAgent uses five specialized AI \"agents\" (think of them as virtual team members), "
        "each expert in a different area. When you give it a task, the main orchestrator figures out "
        "which agent(s) to use and coordinates their work. The agents search the web, analyze data, "
        "and write files - all automatically.",
        styles["BodyText2"],
    ))

    # Architecture diagram as table
    arch_data = [
        [Paragraph('<font color="#ffffff"><b>You type a command</b></font>',
                    ParagraphStyle("c", alignment=TA_CENTER, fontSize=10, textColor=white))],
        [Paragraph('<font color="#1a56db">\u2193</font>',
                    ParagraphStyle("c", alignment=TA_CENTER, fontSize=16, textColor=BRAND_BLUE))],
        [Paragraph('<font color="#ffffff"><b>Orchestrator decides which agent(s) to use</b></font>',
                    ParagraphStyle("c", alignment=TA_CENTER, fontSize=10, textColor=white))],
        [Paragraph('<font color="#1a56db">\u2193</font>',
                    ParagraphStyle("c", alignment=TA_CENTER, fontSize=16, textColor=BRAND_BLUE))],
        [Paragraph('<font color="#ffffff"><b>Agents research, analyze, and write</b></font>',
                    ParagraphStyle("c", alignment=TA_CENTER, fontSize=10, textColor=white))],
        [Paragraph('<font color="#1a56db">\u2193</font>',
                    ParagraphStyle("c", alignment=TA_CENTER, fontSize=16, textColor=BRAND_BLUE))],
        [Paragraph('<font color="#ffffff"><b>Results saved to your output/ folder</b></font>',
                    ParagraphStyle("c", alignment=TA_CENTER, fontSize=10, textColor=white))],
    ]
    arch_table = Table(arch_data, colWidths=[4 * inch])
    arch_styles = []
    for i in range(7):
        if i % 2 == 0:  # Box rows
            arch_styles.append(("BACKGROUND", (0, i), (-1, i), BRAND_BLUE))
            arch_styles.append(("ROUNDEDCORNERS", [6, 6, 6, 6]))
        arch_styles.append(("ALIGN", (0, i), (-1, i), "CENTER"))
        arch_styles.append(("TOPPADDING", (0, i), (-1, i), 6))
        arch_styles.append(("BOTTOMPADDING", (0, i), (-1, i), 6))

    arch_table.setStyle(TableStyle(arch_styles))
    arch_table.hAlign = "CENTER"
    story.append(Spacer(1, 8))
    story.append(arch_table)

    story.append(PageBreak())


def build_chapter_2(story, styles):
    """Prerequisites."""
    story.append(Paragraph("2. What You Need Before Starting", styles["ChapterTitle"]))
    story.append(HRFlowable(width="100%", thickness=2, color=BRAND_BLUE))
    story.append(Spacer(1, 12))

    story.append(Paragraph(
        "Before running the setup, make sure you have these three things ready:",
        styles["BodyText2"],
    ))
    story.append(Spacer(1, 8))

    # Prerequisite cards
    prereqs = [
        ("1", "Python 3.10 or newer",
         "Python is a programming language that AffiliateAgent runs on. "
         "Most modern Macs and Linux computers have it pre-installed. "
         "Windows users may need to install it.",
         "Check by opening Terminal and typing:  python3 --version",
         "If you see 3.10 or higher, you're good! If not, download from python.org"),
        ("2", "Claude Code CLI",
         "This is the engine that powers AffiliateAgent. It connects to Anthropic's AI.",
         "Install it by running:  npm install -g @anthropic-ai/claude-code",
         "Requires Node.js 18+. Get Node.js from nodejs.org if needed"),
        ("3", "Anthropic API Key",
         "This is your personal key to access the AI. Think of it like a password for the AI service.",
         "Get yours at:  platform.claude.com",
         "Sign up, go to API Keys, create a new key. Keep it secret!"),
    ]

    for num, title, desc, check, note in prereqs:
        card_data = [[
            Paragraph(
                f'<font size="22" color="{BRAND_BLUE.hexval()}"><b>{num}</b></font>',
                ParagraphStyle("num", alignment=TA_CENTER, fontSize=22),
            ),
            Paragraph(
                f'<font size="14" color="{BRAND_DARK.hexval()}"><b>{title}</b></font><br/><br/>'
                f'<font size="10" color="{BRAND_DARK.hexval()}">{desc}</font><br/><br/>'
                f'<font size="9" color="{BRAND_BLUE.hexval()}">{check}</font><br/>'
                f'<font size="9" color="{BRAND_GRAY.hexval()}">{note}</font>',
                ParagraphStyle("card_body", fontSize=10, leading=15),
            ),
        ]]
        card = Table(card_data, colWidths=[0.6 * inch, 5.7 * inch])
        card.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), BRAND_BG_BLUE),
            ("BOX", (0, 0), (-1, -1), 1, BORDER_COLOR),
            ("VALIGN", (0, 0), (0, 0), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 12),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
            ("LEFTPADDING", (0, 0), (-1, -1), 12),
            ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ]))
        story.append(card)
        story.append(Spacer(1, 8))

    story.append(Spacer(1, 8))
    story.append(tip_box(
        "Not sure if you have these? No worries! The Easy Installer in Chapter 3 will check "
        "for you and tell you exactly what's missing.",
        styles, BRAND_BG_GREEN, "TIP",
    ))

    story.append(PageBreak())


def build_chapter_3(story, styles):
    """Setup guide."""
    story.append(Paragraph("3. Step-by-Step Setup", styles["ChapterTitle"]))
    story.append(HRFlowable(width="100%", thickness=2, color=BRAND_BLUE))
    story.append(Spacer(1, 12))

    story.append(Paragraph(
        "We've created an Easy Installer script that does everything for you. "
        "Just follow these steps:",
        styles["BodyText2"],
    ))

    # Step 1
    story.append(Paragraph("Step 1: Open your Terminal", styles["SectionTitle"]))
    story.append(Paragraph(
        '<b>On Mac:</b> Press <font face="Courier" color="#1a56db">Cmd + Space</font>, type "Terminal", press Enter<br/>'
        '<b>On Windows:</b> Press <font face="Courier" color="#1a56db">Win + R</font>, type "cmd", press Enter<br/>'
        '<b>On Linux:</b> Press <font face="Courier" color="#1a56db">Ctrl + Alt + T</font>',
        styles["BodyText2"],
    ))

    # Step 2
    story.append(Paragraph("Step 2: Navigate to the project", styles["SectionTitle"]))
    story.append(Paragraph("Copy and paste this command, then press Enter:", styles["BodyText2"]))
    story.append(code_box(["cd ~/Desktop/affiliate-agent"]))
    story.append(tip_box(
        "If you downloaded the project somewhere else, replace ~/Desktop/affiliate-agent "
        "with your actual path.",
        styles, BRAND_BG_BLUE, "NOTE",
    ))

    # Step 3
    story.append(Paragraph("Step 3: Run the Easy Installer", styles["SectionTitle"]))
    story.append(Paragraph("Copy and paste this command:", styles["BodyText2"]))
    story.append(code_box([
        "# On Mac/Linux:",
        "chmod +x setup.sh && ./setup.sh",
        "",
        "# On Windows (in Command Prompt):",
        "python3 setup_windows.py",
    ]))

    story.append(Spacer(1, 8))
    story.append(Paragraph(
        "The installer will:",
        styles["BodyText2"],
    ))

    checks = [
        "Check that Python 3.10+ is installed",
        "Check that Claude Code CLI is available",
        "Create a virtual environment (keeps things tidy)",
        "Install all required packages",
        "Ask you for your Anthropic API key",
        "Create the output folder for your results",
        "Run a quick test to make sure everything works",
    ]
    for c in checks:
        story.append(Paragraph(
            f'<font color="{BRAND_GREEN.hexval()}">\u2713</font>&nbsp;&nbsp;{c}',
            styles["BulletText"],
        ))

    story.append(Spacer(1, 12))

    # Step 4
    story.append(Paragraph("Step 4: Verify the installation", styles["SectionTitle"]))
    story.append(Paragraph("After the installer finishes, test it:", styles["BodyText2"]))
    story.append(code_box([
        "source .venv/bin/activate",
        "affiliate-agent --version",
    ]))
    story.append(Paragraph(
        'You should see: <font face="Courier" color="#1a56db">affiliate-agent, version 0.1.0</font>',
        styles["BodyText2"],
    ))

    story.append(Spacer(1, 10))
    story.append(tip_box(
        '<b>Every time</b> you open a new terminal to use AffiliateAgent, first run: '
        '<font face="Courier">source .venv/bin/activate</font> to activate the environment. '
        "The setup script will remind you of this.",
        styles, BRAND_BG_ORANGE, "WARNING",
    ))

    story.append(PageBreak())


def build_chapter_4(story, styles):
    """First command."""
    story.append(Paragraph("4. Your First Command", styles["ChapterTitle"]))
    story.append(HRFlowable(width="100%", thickness=2, color=BRAND_BLUE))
    story.append(Spacer(1, 12))

    story.append(Paragraph(
        "Let's run your first task! We'll research a niche to see AffiliateAgent in action.",
        styles["BodyText2"],
    ))

    story.append(Paragraph("Try this command:", styles["SectionTitle"]))
    story.append(code_box([
        'affiliate-agent research "portable blenders" --verbose',
    ]))

    story.append(Spacer(1, 8))
    story.append(Paragraph("What happens next:", styles["SectionTitle"]))

    steps = [
        ("1.", "The AI searches the web for information about the portable blender market"),
        ("2.", "It identifies the top keywords people search for (like \"best portable blender\")"),
        ("3.", "It analyzes the competition (which sites rank for these keywords)"),
        ("4.", "It finds affiliate programs (Amazon, BlendJet, etc.)"),
        ("5.", "It scores the niche viability and writes recommendations"),
        ("6.", 'It saves a detailed report to <font face="Courier">./output/niche-research-portable-blenders.md</font>'),
    ]
    for num, desc in steps:
        story.append(Paragraph(
            f'<font color="{BRAND_BLUE.hexval()}"><b>{num}</b></font>&nbsp;&nbsp;{desc}',
            styles["NumberText"],
        ))

    story.append(Spacer(1, 12))
    story.append(tip_box(
        "The --verbose flag shows you what the AI is doing in real time. "
        "Remove it for quieter output. Your first run may take 1-3 minutes "
        "depending on the complexity.",
        styles, BRAND_BG_BLUE, "TIP",
    ))

    story.append(Spacer(1, 12))
    story.append(Paragraph("Reading the output:", styles["SectionTitle"]))
    story.append(Paragraph(
        'Open the file <font face="Courier" color="#1a56db">./output/niche-research-portable-blenders.md</font> '
        "with any text editor (TextEdit on Mac, Notepad on Windows). "
        "The .md file is Markdown format - it's plain text with simple formatting. "
        "You can also paste it into Google Docs or Notion for nicer formatting.",
        styles["BodyText2"],
    ))

    story.append(PageBreak())


def build_chapter_5(story, styles):
    """Agent explanations."""
    story.append(Paragraph("5. The 5 AI Agents Explained", styles["ChapterTitle"]))
    story.append(HRFlowable(width="100%", thickness=2, color=BRAND_BLUE))
    story.append(Spacer(1, 12))

    story.append(Paragraph(
        "Think of each agent as a specialist on your virtual marketing team. "
        "The main AI (the orchestrator) automatically picks the right agent for each job.",
        styles["BodyText2"],
    ))
    story.append(Spacer(1, 8))

    agents = [
        ("NicheScout", BRAND_BLUE, BRAND_BG_BLUE,
         "Market Researcher",
         "Finds profitable niches by analyzing search trends, competition levels, "
         "keyword opportunities, and monetization potential.",
         "\"Which niches can I actually compete in and make money?\""),
        ("ProductFinder", BRAND_GREEN, BRAND_BG_GREEN,
         "Partnership Manager",
         "Discovers affiliate programs, compares commission rates, cookie durations, "
         "payment terms, and product quality.",
         "\"Which affiliate programs should I join in this niche?\""),
        ("ContentCreator", BRAND_ACCENT, BRAND_BG_PURPLE,
         "Content Writer",
         "Writes SEO-optimized product reviews, comparisons, buying guides, "
         "how-to articles, listicles, and roundups.",
         "\"Write me a professional article that ranks on Google.\""),
        ("SEOOptimizer", BRAND_ORANGE, BRAND_BG_ORANGE,
         "SEO Specialist",
         "Analyzes content for keyword optimization, heading structure, "
         "meta tags, and search engine best practices.",
         "\"Is my content optimized to rank well in search results?\""),
        ("PerformanceAnalyst", BRAND_BLUE, BRAND_BG_BLUE,
         "Data Analyst",
         "Reviews your affiliate data to calculate ROI, identify top performers, "
         "and provide optimization recommendations.",
         "\"How are my campaigns performing and what should I improve?\""),
    ]

    for name, color, bg, role, desc, question in agents:
        card_data = [[
            Paragraph(
                f'<font size="14" color="{color.hexval()}"><b>{name}</b></font>'
                f'<br/><font size="9" color="{BRAND_GRAY.hexval()}">{role}</font>',
                ParagraphStyle("agent_title", fontSize=14, leading=18),
            ),
        ], [
            Paragraph(f'<font size="10">{desc}</font>', styles["TipText"]),
        ], [
            Paragraph(
                f'<font size="9" color="{BRAND_GRAY.hexval()}"><i>Answers: "{question}"</i></font>',
                ParagraphStyle("q", fontSize=9, leading=13, leftIndent=12),
            ),
        ]]
        card = Table(card_data, colWidths=[6.3 * inch])
        card.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), bg),
            ("BOX", (0, 0), (-1, -1), 1, BORDER_COLOR),
            ("TOPPADDING", (0, 0), (0, 0), 10),
            ("BOTTOMPADDING", (-1, -1), (-1, -1), 10),
            ("LEFTPADDING", (0, 0), (-1, -1), 14),
            ("RIGHTPADDING", (0, 0), (-1, -1), 14),
        ]))
        story.append(card)
        story.append(Spacer(1, 6))

    story.append(PageBreak())


def build_chapter_6(story, styles):
    """Command reference."""
    story.append(Paragraph("6. Complete Command Reference", styles["ChapterTitle"]))
    story.append(HRFlowable(width="100%", thickness=2, color=BRAND_BLUE))
    story.append(Spacer(1, 12))

    # research
    story.append(Paragraph("research", styles["SectionTitle"]))
    story.append(Paragraph("Researches a niche for affiliate marketing viability.", styles["BodyText2"]))
    story.append(code_box([
        'affiliate-agent research "YOUR NICHE HERE"',
        '',
        '# Examples:',
        'affiliate-agent research "yoga mats"',
        'affiliate-agent research "pet cameras" --verbose',
        'affiliate-agent research "coffee grinders" -o ./reports --max-budget 2.0',
    ]))

    # find-products
    story.append(Paragraph("find-products", styles["SectionTitle"]))
    story.append(Paragraph("Finds affiliate programs and products in a niche.", styles["BodyText2"]))
    story.append(code_box([
        'affiliate-agent find-products "YOUR NICHE HERE"',
        '',
        '# Examples:',
        'affiliate-agent find-products "gaming accessories"',
        'affiliate-agent find-products "organic skincare" --verbose',
    ]))

    # create-content
    story.append(Paragraph("create-content", styles["SectionTitle"]))
    story.append(Paragraph("Generates SEO-optimized articles. Requires --keyword (-k) flag.", styles["BodyText2"]))
    story.append(code_box([
        'affiliate-agent create-content "TOPIC" --type TYPE -k "KEYWORD"',
        '',
        '# Content types: review, comparison, buying_guide,',
        '#                 how_to, listicle, roundup',
        '',
        '# Examples:',
        'affiliate-agent create-content "Dyson V15" \\',
        '  --type review -k "dyson v15 review"',
        '',
        'affiliate-agent create-content "Robot Vacuums" \\',
        '  --type buying_guide -k "best robot vacuum 2026"',
        '',
        'affiliate-agent create-content "Roomba vs Roborock" \\',
        '  --type comparison -k "roomba vs roborock"',
    ]))

    # analyze
    story.append(Paragraph("analyze", styles["SectionTitle"]))
    story.append(Paragraph("Analyzes your affiliate performance data from a file.", styles["BodyText2"]))
    story.append(code_box([
        'affiliate-agent analyze YOUR_DATA_FILE.csv',
        '',
        '# Examples:',
        'affiliate-agent analyze ./data/march.csv -p "March 2026"',
        'affiliate-agent analyze ./data/q1.json -p "Q1 2026" -v',
    ]))

    # chat
    story.append(Paragraph("chat", styles["SectionTitle"]))
    story.append(Paragraph("Interactive mode. Type any request and the AI handles it.", styles["BodyText2"]))
    story.append(code_box([
        'affiliate-agent chat',
        'affiliate-agent chat --verbose --max-budget 5.0',
    ]))

    story.append(Spacer(1, 10))

    # Options table
    story.append(Paragraph("Common Options (work with all commands):", styles["SubSection"]))
    opts_data = [
        [Paragraph("<b>Option</b>", styles["BodyText2"]),
         Paragraph("<b>Short</b>", styles["BodyText2"]),
         Paragraph("<b>What it does</b>", styles["BodyText2"])],
        ["--verbose", "-v", "Shows detailed AI output in real time"],
        ["--output-dir", "-o", "Where to save results (default: ./output)"],
        ["--model", "-m", "AI model to use (default: claude-sonnet-4-6)"],
        ["--max-budget", "", "Maximum $ to spend on this command"],
    ]
    opts_table = Table(opts_data, colWidths=[1.5 * inch, 0.8 * inch, 4 * inch])
    opts_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), BRAND_BLUE),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("BACKGROUND", (0, 1), (-1, -1), BRAND_BG_BLUE),
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(opts_table)

    story.append(PageBreak())


def build_chapter_7(story, styles):
    """Workflow examples."""
    story.append(Paragraph("7. Real-World Workflow Examples", styles["ChapterTitle"]))
    story.append(HRFlowable(width="100%", thickness=2, color=BRAND_BLUE))
    story.append(Spacer(1, 12))

    story.append(Paragraph(
        "Here are complete workflows showing how to use AffiliateAgent for "
        "common affiliate marketing tasks.",
        styles["BodyText2"],
    ))

    # Workflow 1
    story.append(Paragraph('Workflow A: Launch a New Niche Site', styles["SectionTitle"]))
    story.append(code_box([
        '# Step 1: Research the niche',
        'affiliate-agent research "standing desks" -v',
        '',
        '# Step 2: Find the best affiliate programs',
        'affiliate-agent find-products "standing desks" -v',
        '',
        '# Step 3: Create a pillar buying guide',
        'affiliate-agent create-content "Standing Desks" \\',
        '  --type buying_guide \\',
        '  -k "best standing desks 2026" -v',
        '',
        '# Step 4: Write individual product reviews',
        'affiliate-agent create-content "FlexiSpot E7" \\',
        '  --type review -k "flexispot e7 review" -v',
        '',
        '# Step 5: Create a comparison article',
        'affiliate-agent create-content "FlexiSpot vs Uplift" \\',
        '  --type comparison \\',
        '  -k "flexispot vs uplift desk" -v',
    ]))

    story.append(Spacer(1, 8))

    # Workflow 2
    story.append(Paragraph('Workflow B: Monthly Performance Review', styles["SectionTitle"]))
    story.append(code_box([
        '# Analyze last month\'s data',
        'affiliate-agent analyze ./data/feb-2026.csv \\',
        '  -p "February 2026" -v',
        '',
        '# Then use chat mode for follow-up questions',
        'affiliate-agent chat',
        '> "My top article gets 5000 visits but only 0.3% conversion.',
        '>  What specific changes should I make?"',
    ]))

    story.append(Spacer(1, 8))

    # Workflow 3
    story.append(Paragraph('Workflow C: Quick Content Sprint', styles["SectionTitle"]))
    story.append(code_box([
        '# Generate 3 articles in sequence',
        'affiliate-agent create-content "Budget Headphones" \\',
        '  --type listicle -k "best budget headphones under 50" -v',
        '',
        'affiliate-agent create-content "Noise Cancelling Guide" \\',
        '  --type how_to -k "how to choose noise cancelling headphones" -v',
        '',
        'affiliate-agent create-content "Sony vs Bose" \\',
        '  --type comparison -k "sony wh1000xm6 vs bose qc ultra" -v',
    ]))

    story.append(PageBreak())


def build_chapter_8(story, styles):
    """Output files."""
    story.append(Paragraph("8. Understanding Your Output Files", styles["ChapterTitle"]))
    story.append(HRFlowable(width="100%", thickness=2, color=BRAND_BLUE))
    story.append(Spacer(1, 12))

    story.append(Paragraph(
        "All results are saved as .md (Markdown) files in the output/ folder. "
        "Here's how to find and use them:",
        styles["BodyText2"],
    ))

    story.append(Spacer(1, 8))
    story.append(Paragraph("File naming convention:", styles["SectionTitle"]))

    file_data = [
        [Paragraph("<b>Command</b>", styles["BodyText2"]),
         Paragraph("<b>Output file</b>", styles["BodyText2"])],
        ["research", "output/niche-research-{niche}.md"],
        ["find-products", "output/products-{niche}.md"],
        ["create-content (review)", "output/review-{topic}.md"],
        ["create-content (comparison)", "output/comparison-{topic}.md"],
        ["create-content (buying_guide)", "output/buying_guide-{topic}.md"],
        ["analyze", "output/performance-report.md"],
    ]
    file_table = Table(file_data, colWidths=[2.2 * inch, 4.1 * inch])
    file_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), BRAND_BLUE),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("BACKGROUND", (0, 1), (-1, -1), BRAND_BG_BLUE),
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("FONTNAME", (1, 1), (1, -1), "Courier"),
        ("FONTSIZE", (1, 1), (1, -1), 9),
    ]))
    story.append(file_table)

    story.append(Spacer(1, 12))
    story.append(Paragraph("How to open .md files:", styles["SectionTitle"]))

    methods = [
        "<b>Any text editor</b> - TextEdit (Mac), Notepad (Windows), or VS Code",
        "<b>Paste into Google Docs</b> - Copy the content, it'll look great",
        "<b>Paste into Notion</b> - Markdown is supported natively",
        "<b>Use a Markdown viewer</b> - Search for \"Markdown preview\" browser extension",
    ]
    for m in methods:
        story.append(Paragraph(f'\u2022&nbsp;&nbsp;{m}', styles["BulletText"]))

    story.append(PageBreak())


def build_chapter_9(story, styles):
    """Cost control."""
    story.append(Paragraph("9. Controlling Costs", styles["ChapterTitle"]))
    story.append(HRFlowable(width="100%", thickness=2, color=BRAND_BLUE))
    story.append(Spacer(1, 12))

    story.append(Paragraph(
        "AffiliateAgent uses the Anthropic API, which charges per use. "
        "Here's how to keep costs predictable:",
        styles["BodyText2"],
    ))

    story.append(Paragraph("Typical costs per task:", styles["SectionTitle"]))

    cost_data = [
        [Paragraph("<b>Task</b>", styles["BodyText2"]),
         Paragraph("<b>Typical Cost</b>", styles["BodyText2"]),
         Paragraph("<b>Suggested Budget Cap</b>", styles["BodyText2"])],
        ["Niche research", "$0.50 - $2.00", "$3.00"],
        ["Find products", "$0.30 - $1.50", "$2.00"],
        ["Create content", "$1.00 - $3.00", "$5.00"],
        ["Analyze performance", "$0.20 - $0.80", "$1.50"],
        ["Chat (per message)", "$0.10 - $0.50", "$1.00"],
    ]
    cost_table = Table(cost_data, colWidths=[1.8 * inch, 1.6 * inch, 2.0 * inch])
    cost_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), BRAND_BLUE),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("BACKGROUND", (0, 1), (-1, -1), BRAND_BG_BLUE),
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(cost_table)

    story.append(Spacer(1, 12))
    story.append(Paragraph("How to set a budget cap:", styles["SectionTitle"]))
    story.append(code_box([
        '# Add --max-budget to any command',
        'affiliate-agent research "yoga mats" --max-budget 2.0',
        '',
        '# The agent will stop if it reaches $2.00',
    ]))

    story.append(Spacer(1, 8))
    story.append(tip_box(
        "Start with small budgets ($1-2) while you learn. You can always re-run a "
        "command with a higher budget if you need more detailed results.",
        styles, BRAND_BG_GREEN, "TIP",
    ))

    story.append(PageBreak())


def build_chapter_10(story, styles):
    """Troubleshooting."""
    story.append(Paragraph("10. Troubleshooting Common Issues", styles["ChapterTitle"]))
    story.append(HRFlowable(width="100%", thickness=2, color=BRAND_BLUE))
    story.append(Spacer(1, 12))

    issues = [
        ("\"command not found: affiliate-agent\"",
         "You need to activate the virtual environment first.",
         "source .venv/bin/activate"),
        ("\"API key not found\"",
         "Your .env file is missing or the key isn't set.",
         "Check that .env exists and contains: ANTHROPIC_API_KEY=sk-ant-..."),
        ("\"ModuleNotFoundError\"",
         "Dependencies aren't installed in the current environment.",
         "source .venv/bin/activate && pip install -e ."),
        ("Agent seems stuck or takes too long",
         "The AI may be doing extensive web research. Use --max-budget to set a limit.",
         "affiliate-agent research \"niche\" --max-budget 1.5"),
        ("\"Permission denied\" when running setup.sh",
         "The script needs execute permission.",
         "chmod +x setup.sh && ./setup.sh"),
        ("Output folder is empty",
         "The agent may have failed silently. Re-run with --verbose to see details.",
         "affiliate-agent research \"niche\" --verbose"),
    ]

    for problem, explanation, fix in issues:
        card_data = [[
            Paragraph(
                f'<font color="{BRAND_ORANGE.hexval()}" size="11"><b>Problem:</b></font> '
                f'<font face="Courier" size="9">{problem}</font><br/><br/>'
                f'<font size="10"><b>Why:</b> {explanation}</font><br/><br/>'
                f'<font color="{BRAND_GREEN.hexval()}" size="10"><b>Fix:</b></font> '
                f'<font face="Courier" size="9">{fix}</font>',
                ParagraphStyle("issue", fontSize=10, leading=15),
            ),
        ]]
        card = Table(card_data, colWidths=[6.3 * inch])
        card.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), BRAND_BG_ORANGE),
            ("BOX", (0, 0), (-1, -1), 1, BORDER_COLOR),
            ("TOPPADDING", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ("LEFTPADDING", (0, 0), (-1, -1), 12),
            ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ]))
        story.append(card)
        story.append(Spacer(1, 6))

    story.append(PageBreak())


def build_chapter_11(story, styles):
    """Glossary."""
    story.append(Paragraph("11. Glossary", styles["ChapterTitle"]))
    story.append(HRFlowable(width="100%", thickness=2, color=BRAND_BLUE))
    story.append(Spacer(1, 12))

    terms = [
        ("Affiliate Marketing", "Earning commissions by promoting other people's products. You share a special link, and when someone buys through it, you get paid."),
        ("API Key", "A secret code that lets AffiliateAgent connect to the AI service. Like a password for the AI."),
        ("CLI", "Command Line Interface. The text-based way to give commands to your computer (Terminal on Mac, Command Prompt on Windows)."),
        ("Commission Rate", "The percentage of a sale you earn. A 10% commission on a $100 product = $10 for you."),
        ("Cookie Duration", "How long after someone clicks your link you still get credit for their purchase. 30 days means if they buy within 30 days, you get paid."),
        ("CPC", "Cost Per Click. How much advertisers pay per click on ads for a keyword. Higher CPC = more commercial value."),
        ("CTR", "Click-Through Rate. The percentage of people who click your affiliate link after seeing it."),
        ("EPC", "Earnings Per Click. How much money you make on average for each click on your affiliate links."),
        ("FTC Disclosure", "A required notice telling readers you earn commissions from links. Legally required in the US."),
        ("Keyword", "A word or phrase people type into Google. \"best wireless earbuds\" is a keyword."),
        ("Markdown (.md)", "A simple text format used for the output files. Readable as plain text, renders nicely with proper tools."),
        ("Niche", "A specific topic or market segment. \"Wireless earbuds\" is a niche within \"consumer electronics.\""),
        ("ROI", "Return on Investment. If you spend $100 and earn $300, your ROI is 200%."),
        ("SEO", "Search Engine Optimization. Making your content rank higher in Google search results."),
        ("Virtual Environment", "An isolated space on your computer where AffiliateAgent's software lives, keeping it separate from other programs."),
    ]

    for term, definition in terms:
        story.append(Paragraph(
            f'<font color="{BRAND_BLUE.hexval()}"><b>{term}</b></font>',
            ParagraphStyle("term", fontSize=11, leading=15, spaceBefore=6, fontName="Helvetica-Bold"),
        ))
        story.append(Paragraph(definition, styles["BodyText2"]))

    story.append(PageBreak())


def build_chapter_12(story, styles):
    """Quick reference card."""
    story.append(Paragraph("12. Quick Reference Card", styles["ChapterTitle"]))
    story.append(HRFlowable(width="100%", thickness=2, color=BRAND_BLUE))
    story.append(Spacer(1, 12))

    story.append(Paragraph(
        "Print this page and keep it near your computer!",
        ParagraphStyle("print_note", parent=styles["BodyText2"], textColor=BRAND_GRAY,
                       fontName="Helvetica-Oblique"),
    ))
    story.append(Spacer(1, 10))

    # Essential commands table
    story.append(Paragraph("Essential Commands", styles["SectionTitle"]))

    ref_data = [
        [Paragraph("<b>What you want to do</b>", styles["BodyText2"]),
         Paragraph("<b>Command</b>", styles["BodyText2"])],
        ["Activate the environment", Paragraph('<font face="Courier" size="8">source .venv/bin/activate</font>', styles["BodyText2"])],
        ["Research a niche", Paragraph('<font face="Courier" size="8">affiliate-agent research "NICHE"</font>', styles["BodyText2"])],
        ["Find affiliate programs", Paragraph('<font face="Courier" size="8">affiliate-agent find-products "NICHE"</font>', styles["BodyText2"])],
        ["Write a product review", Paragraph('<font face="Courier" size="8">affiliate-agent create-content "PRODUCT" --type review -k "KEYWORD"</font>', styles["BodyText2"])],
        ["Write a comparison", Paragraph('<font face="Courier" size="8">affiliate-agent create-content "A vs B" --type comparison -k "KEYWORD"</font>', styles["BodyText2"])],
        ["Write a buying guide", Paragraph('<font face="Courier" size="8">affiliate-agent create-content "CATEGORY" --type buying_guide -k "KEYWORD"</font>', styles["BodyText2"])],
        ["Analyze performance", Paragraph('<font face="Courier" size="8">affiliate-agent analyze DATA_FILE.csv</font>', styles["BodyText2"])],
        ["Interactive chat", Paragraph('<font face="Courier" size="8">affiliate-agent chat</font>', styles["BodyText2"])],
        ["See verbose output", Paragraph('<font face="Courier" size="8">Add --verbose to any command</font>', styles["BodyText2"])],
        ["Set budget limit", Paragraph('<font face="Courier" size="8">Add --max-budget 2.0 to any command</font>', styles["BodyText2"])],
    ]
    ref_table = Table(ref_data, colWidths=[2.2 * inch, 4.1 * inch])
    ref_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), BRAND_BLUE),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("BACKGROUND", (0, 1), (-1, -1), BRAND_BG_BLUE),
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(ref_table)

    story.append(Spacer(1, 16))

    # Content types
    story.append(Paragraph("Content Types", styles["SectionTitle"]))
    ct_data = [
        [Paragraph("<b>Type</b>", styles["BodyText2"]),
         Paragraph("<b>--type flag</b>", styles["BodyText2"]),
         Paragraph("<b>Best for</b>", styles["BodyText2"])],
        ["Product Review", "review", "Single product deep-dive"],
        ["Comparison", "comparison", "\"X vs Y\" articles"],
        ["Buying Guide", "buying_guide", "\"Best X for Y\" roundups"],
        ["How-To", "how_to", "Tutorials with product recs"],
        ["Listicle", "listicle", "\"Top 10\" numbered lists"],
        ["Roundup", "roundup", "Category winners overview"],
    ]
    ct_table = Table(ct_data, colWidths=[1.4 * inch, 1.3 * inch, 3.6 * inch])
    ct_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), BRAND_BLUE),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("BACKGROUND", (0, 1), (-1, -1), BRAND_BG_BLUE),
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("FONTNAME", (1, 1), (1, -1), "Courier"),
        ("FONTSIZE", (1, 1), (1, -1), 9),
    ]))
    story.append(ct_table)

    story.append(Spacer(1, 20))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER_COLOR))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        '<font color="#64748b">AffiliateAgent v0.1.0  |  github.com/stay4ever/affiliate-agent  |  Powered by Claude Agent SDK</font>',
        ParagraphStyle("final_footer", alignment=TA_CENTER, fontSize=9),
    ))


def generate_pdf(output_path="AffiliateAgent-Guide.pdf"):
    """Generate the complete PDF guide."""
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
        leftMargin=0.85 * inch,
        rightMargin=0.85 * inch,
        title="AffiliateAgent - The Complete Beginner's Guide",
        author="AffiliateAgent Team",
        subject="Setup and usage guide for non-technical users",
    )

    styles = get_styles()
    story = []

    build_cover(story, styles)
    build_toc(story, styles)
    build_chapter_1(story, styles)
    build_chapter_2(story, styles)
    build_chapter_3(story, styles)
    build_chapter_4(story, styles)
    build_chapter_5(story, styles)
    build_chapter_6(story, styles)
    build_chapter_7(story, styles)
    build_chapter_8(story, styles)
    build_chapter_9(story, styles)
    build_chapter_10(story, styles)
    build_chapter_11(story, styles)
    build_chapter_12(story, styles)

    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print(f"PDF generated: {output_path}")


if __name__ == "__main__":
    generate_pdf()
