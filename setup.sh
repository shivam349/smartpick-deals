#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────
#  AffiliateAgent - Easy Installer (Mac / Linux)
#  This script sets up everything you need to run
#  AffiliateAgent on your computer.
# ─────────────────────────────────────────────────────────

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

print_banner() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                                                    ║${NC}"
    echo -e "${BLUE}║${BOLD}${CYAN}         AffiliateAgent - Easy Installer           ${NC}${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}       AI-Powered Affiliate Marketing Assistant     ${BLUE}║${NC}"
    echo -e "${BLUE}║                                                    ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_step() {
    echo -e "\n${BLUE}[Step $1/$TOTAL_STEPS]${NC} ${BOLD}$2${NC}"
    echo -e "${BLUE}─────────────────────────────────────────${NC}"
}

print_ok() {
    echo -e "  ${GREEN}✓${NC} $1"
}

print_warn() {
    echo -e "  ${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "  ${RED}✗${NC} $1"
}

print_info() {
    echo -e "  ${CYAN}ℹ${NC} $1"
}

TOTAL_STEPS=7

# ── Start ────────────────────────────────────────────────
print_banner

echo -e "${BOLD}This installer will:${NC}"
echo "  1. Check that Python 3.10+ is installed"
echo "  2. Check that Claude Code CLI is available"
echo "  3. Create a virtual environment"
echo "  4. Install all required packages"
echo "  5. Set up your API key"
echo "  6. Create the output directory"
echo "  7. Verify the installation"
echo ""
read -p "Press Enter to continue (or Ctrl+C to cancel)... "

# ── Step 1: Check Python ────────────────────────────────
print_step 1 "Checking Python installation"

if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
    PYTHON_MAJOR=$(echo "$PYTHON_VERSION" | cut -d. -f1)
    PYTHON_MINOR=$(echo "$PYTHON_VERSION" | cut -d. -f2)

    if [ "$PYTHON_MAJOR" -ge 3 ] && [ "$PYTHON_MINOR" -ge 10 ]; then
        print_ok "Python $PYTHON_VERSION found"
    else
        print_error "Python $PYTHON_VERSION found, but 3.10+ is required"
        echo ""
        echo -e "  ${BOLD}How to fix:${NC}"
        echo "  • Mac: brew install python@3.12"
        echo "  • Linux: sudo apt install python3.12 (Ubuntu/Debian)"
        echo "  • Or download from: https://www.python.org/downloads/"
        exit 1
    fi
else
    print_error "Python 3 not found"
    echo ""
    echo -e "  ${BOLD}How to install Python:${NC}"
    echo "  • Mac: brew install python@3.12"
    echo "  • Linux: sudo apt install python3 (Ubuntu/Debian)"
    echo "  • Or download from: https://www.python.org/downloads/"
    exit 1
fi

# ── Step 2: Check Claude Code CLI ───────────────────────
print_step 2 "Checking Claude Code CLI"

if command -v claude &> /dev/null; then
    print_ok "Claude Code CLI found"
else
    print_warn "Claude Code CLI not found"
    echo ""
    echo -e "  ${BOLD}The Claude Code CLI is required. Install it:${NC}"
    echo ""

    if command -v npm &> /dev/null; then
        echo "  npm install -g @anthropic-ai/claude-code"
        echo ""
        read -p "  Would you like to install it now? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "  Installing Claude Code CLI..."
            npm install -g @anthropic-ai/claude-code
            print_ok "Claude Code CLI installed"
        else
            print_warn "Skipping - you'll need to install it before using AffiliateAgent"
        fi
    else
        echo "  You need Node.js first: https://nodejs.org/"
        echo "  Then run: npm install -g @anthropic-ai/claude-code"
        print_warn "Skipping - install Node.js and Claude Code CLI manually"
    fi
fi

# ── Step 3: Create virtual environment ──────────────────
print_step 3 "Creating virtual environment"

if [ -d ".venv" ]; then
    print_info "Virtual environment already exists"
    read -p "  Recreate it? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf .venv
        python3 -m venv .venv
        print_ok "Virtual environment recreated"
    else
        print_ok "Using existing virtual environment"
    fi
else
    python3 -m venv .venv
    print_ok "Virtual environment created at .venv/"
fi

# Activate it
source .venv/bin/activate
print_ok "Virtual environment activated"

# ── Step 4: Install packages ────────────────────────────
print_step 4 "Installing required packages"

echo "  This may take a minute..."
pip install --upgrade pip -q 2>&1 | tail -1
pip install -e ".[dev]" -q 2>&1 | tail -1
print_ok "All packages installed successfully"

# ── Step 5: Set up API key ──────────────────────────────
print_step 5 "Setting up your Anthropic API key"

if [ -f ".env" ]; then
    # Check if key is already set (not the placeholder)
    if grep -q "^ANTHROPIC_API_KEY=sk-" .env 2>/dev/null; then
        print_ok "API key already configured in .env"
    else
        print_info "A .env file exists but the API key may not be set"
        echo ""
        echo -e "  ${BOLD}Your API key looks like:${NC} sk-ant-api03-..."
        echo -e "  ${BOLD}Get one at:${NC} https://platform.claude.com/"
        echo ""
        read -p "  Enter your Anthropic API key (or press Enter to skip): " API_KEY
        if [ -n "$API_KEY" ]; then
            echo "ANTHROPIC_API_KEY=$API_KEY" > .env
            print_ok "API key saved to .env"
        else
            print_warn "Skipped - edit .env manually before using AffiliateAgent"
        fi
    fi
else
    echo ""
    echo -e "  ${BOLD}You need an Anthropic API key to use AffiliateAgent.${NC}"
    echo -e "  ${BOLD}Your API key looks like:${NC} sk-ant-api03-..."
    echo -e "  ${BOLD}Get one at:${NC} https://platform.claude.com/"
    echo ""
    read -p "  Enter your Anthropic API key (or press Enter to skip): " API_KEY
    if [ -n "$API_KEY" ]; then
        echo "ANTHROPIC_API_KEY=$API_KEY" > .env
        print_ok "API key saved to .env"
    else
        cp .env.example .env
        print_warn "Skipped - edit .env and add your key before using AffiliateAgent"
    fi
fi

# ── Step 6: Create output directory ─────────────────────
print_step 6 "Creating output directory"

mkdir -p output
print_ok "Output directory created at ./output/"

# ── Step 7: Verify installation ─────────────────────────
print_step 7 "Verifying installation"

# Test the CLI
if affiliate-agent --version &> /dev/null; then
    VERSION=$(affiliate-agent --version 2>&1)
    print_ok "CLI is working: $VERSION"
else
    print_error "CLI verification failed"
    echo "  Try running: pip install -e ."
fi

# Test Python imports
if python3 -c "from affiliate_agent.agents.orchestrator import run_agent; print('OK')" 2>/dev/null | grep -q "OK"; then
    print_ok "Python imports are working"
else
    print_warn "Some imports may need the Claude Agent SDK to be installed"
    print_info "Run: pip install claude-agent-sdk"
fi

# ── Done ─────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                    ║${NC}"
echo -e "${GREEN}║${BOLD}          Setup Complete! You're ready to go.       ${NC}${GREEN}║${NC}"
echo -e "${GREEN}║                                                    ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BOLD}IMPORTANT - Remember this:${NC}"
echo -e "  Every time you open a new terminal, first run:"
echo -e "  ${CYAN}source .venv/bin/activate${NC}"
echo ""
echo -e "${BOLD}Try your first command:${NC}"
echo -e "  ${CYAN}affiliate-agent research \"portable blenders\" --verbose${NC}"
echo ""
echo -e "${BOLD}Or start an interactive chat:${NC}"
echo -e "  ${CYAN}affiliate-agent chat${NC}"
echo ""
echo -e "Output files will be saved to: ${CYAN}./output/${NC}"
echo -e "PDF guide available at: ${CYAN}./AffiliateAgent-Guide.pdf${NC}"
echo ""
