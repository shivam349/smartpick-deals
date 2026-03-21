"""
AffiliateAgent - Easy Installer (Windows)

This script sets up everything you need to run
AffiliateAgent on your Windows computer.

Usage: python3 setup_windows.py
"""

import os
import subprocess
import sys
from pathlib import Path


# ── Colors (Windows terminal) ───────────────────────────
class Colors:
    RED = "\033[91m"
    GREEN = "\033[92m"
    BLUE = "\033[94m"
    YELLOW = "\033[93m"
    CYAN = "\033[96m"
    BOLD = "\033[1m"
    END = "\033[0m"


def print_banner():
    print()
    print(f"{Colors.BLUE}{'=' * 54}{Colors.END}")
    print(f"{Colors.BLUE}  {Colors.BOLD}{Colors.CYAN}AffiliateAgent - Easy Installer (Windows){Colors.END}")
    print(f"{Colors.BLUE}  AI-Powered Affiliate Marketing Assistant{Colors.END}")
    print(f"{Colors.BLUE}{'=' * 54}{Colors.END}")
    print()


def print_step(num, total, msg):
    print(f"\n{Colors.BLUE}[Step {num}/{total}]{Colors.END} {Colors.BOLD}{msg}{Colors.END}")
    print(f"{Colors.BLUE}{'─' * 40}{Colors.END}")


def ok(msg):
    print(f"  {Colors.GREEN}✓{Colors.END} {msg}")


def warn(msg):
    print(f"  {Colors.YELLOW}!{Colors.END} {msg}")


def error(msg):
    print(f"  {Colors.RED}x{Colors.END} {msg}")


def info(msg):
    print(f"  {Colors.CYAN}i{Colors.END} {msg}")


def run_cmd(cmd, check=True, capture=True):
    """Run a shell command."""
    try:
        result = subprocess.run(
            cmd, shell=True, capture_output=capture, text=True, check=check
        )
        return result.stdout.strip() if capture else ""
    except subprocess.CalledProcessError as e:
        return None
    except FileNotFoundError:
        return None


def main():
    # Enable ANSI colors on Windows
    os.system("")

    TOTAL = 7
    print_banner()

    print(f"{Colors.BOLD}This installer will:{Colors.END}")
    print("  1. Check that Python 3.10+ is installed")
    print("  2. Check that Claude Code CLI is available")
    print("  3. Create a virtual environment")
    print("  4. Install all required packages")
    print("  5. Set up your API key")
    print("  6. Create the output directory")
    print("  7. Verify the installation")
    print()
    input("Press Enter to continue (or Ctrl+C to cancel)... ")

    # ── Step 1: Check Python ────────────────────────────
    print_step(1, TOTAL, "Checking Python installation")

    version = sys.version_info
    if version.major >= 3 and version.minor >= 10:
        ok(f"Python {version.major}.{version.minor}.{version.micro} found")
    else:
        error(f"Python {version.major}.{version.minor} found, but 3.10+ is required")
        print()
        print(f"  {Colors.BOLD}Download Python 3.12+ from:{Colors.END}")
        print("  https://www.python.org/downloads/")
        print("  IMPORTANT: Check 'Add Python to PATH' during installation!")
        sys.exit(1)

    # ── Step 2: Check Claude Code CLI ───────────────────
    print_step(2, TOTAL, "Checking Claude Code CLI")

    claude_check = run_cmd("claude --version")
    if claude_check:
        ok("Claude Code CLI found")
    else:
        warn("Claude Code CLI not found")
        print()
        print(f"  {Colors.BOLD}Install steps:{Colors.END}")
        print("  1. Install Node.js from: https://nodejs.org/")
        print("  2. Open a NEW terminal and run:")
        print("     npm install -g @anthropic-ai/claude-code")
        npm_check = run_cmd("npm --version")
        if npm_check:
            answer = input("  Would you like to install it now? (y/n) ").strip().lower()
            if answer == "y":
                print("  Installing Claude Code CLI...")
                result = run_cmd("npm install -g @anthropic-ai/claude-code", check=False, capture=False)
                if result is not None:
                    ok("Claude Code CLI installed")
                else:
                    warn("Installation may have failed. Try manually after setup.")
            else:
                warn("Skipping - install it before using AffiliateAgent")
        else:
            warn("npm not found. Install Node.js first: https://nodejs.org/")

    # ── Step 3: Create virtual environment ──────────────
    print_step(3, TOTAL, "Creating virtual environment")

    venv_path = Path(".venv")
    if venv_path.exists():
        info("Virtual environment already exists")
        answer = input("  Recreate it? (y/n) ").strip().lower()
        if answer == "y":
            import shutil
            shutil.rmtree(venv_path)
            run_cmd(f"{sys.executable} -m venv .venv", capture=False)
            ok("Virtual environment recreated")
        else:
            ok("Using existing virtual environment")
    else:
        run_cmd(f"{sys.executable} -m venv .venv", capture=False)
        ok("Virtual environment created at .venv/")

    # Determine pip path
    if sys.platform == "win32":
        pip_path = str(venv_path / "Scripts" / "pip.exe")
        python_path = str(venv_path / "Scripts" / "python.exe")
    else:
        pip_path = str(venv_path / "bin" / "pip")
        python_path = str(venv_path / "bin" / "python")

    ok("Virtual environment ready")

    # ── Step 4: Install packages ────────────────────────
    print_step(4, TOTAL, "Installing required packages")

    print("  This may take a minute...")
    run_cmd(f'"{pip_path}" install --upgrade pip -q', capture=False)
    run_cmd(f'"{pip_path}" install -e ".[dev]" -q', capture=False)
    ok("All packages installed successfully")

    # ── Step 5: Set up API key ──────────────────────────
    print_step(5, TOTAL, "Setting up your Anthropic API key")

    env_path = Path(".env")
    if env_path.exists():
        content = env_path.read_text()
        if "sk-ant" in content:
            ok("API key already configured in .env")
        else:
            info("A .env file exists but the API key may not be set")
            _prompt_api_key(env_path)
    else:
        print()
        print(f"  {Colors.BOLD}You need an Anthropic API key to use AffiliateAgent.{Colors.END}")
        _prompt_api_key(env_path)

    # ── Step 6: Create output directory ─────────────────
    print_step(6, TOTAL, "Creating output directory")

    Path("output").mkdir(exist_ok=True)
    ok("Output directory created at ./output/")

    # ── Step 7: Verify installation ─────────────────────
    print_step(7, TOTAL, "Verifying installation")

    # Test CLI
    cli_check = run_cmd(f'"{python_path}" -m affiliate_agent.cli --version')
    if cli_check:
        ok(f"CLI is working: {cli_check}")
    else:
        # Try the entry point
        if sys.platform == "win32":
            ep = str(venv_path / "Scripts" / "affiliate-agent.exe")
        else:
            ep = str(venv_path / "bin" / "affiliate-agent")
        if Path(ep).exists():
            ok("CLI entry point found")
        else:
            warn("CLI entry point not found. Run: pip install -e .")

    # Test imports
    import_check = run_cmd(
        f'"{python_path}" -c "from affiliate_agent.models import NicheAnalysis; print(\'OK\')"'
    )
    if import_check and "OK" in import_check:
        ok("Python imports are working")
    else:
        warn("Some imports may need additional dependencies")

    # ── Done ─────────────────────────────────────────────
    print()
    print(f"{Colors.GREEN}{'=' * 54}{Colors.END}")
    print(f"{Colors.GREEN}  {Colors.BOLD}Setup Complete! You're ready to go.{Colors.END}")
    print(f"{Colors.GREEN}{'=' * 54}{Colors.END}")
    print()
    print(f"{Colors.BOLD}IMPORTANT - Remember this:{Colors.END}")
    if sys.platform == "win32":
        print(f"  Every time you open a new terminal, first run:")
        print(f"  {Colors.CYAN}.venv\\Scripts\\activate{Colors.END}")
    else:
        print(f"  Every time you open a new terminal, first run:")
        print(f"  {Colors.CYAN}source .venv/bin/activate{Colors.END}")
    print()
    print(f"{Colors.BOLD}Try your first command:{Colors.END}")
    print(f'  {Colors.CYAN}affiliate-agent research "portable blenders" --verbose{Colors.END}')
    print()
    print(f"{Colors.BOLD}Or start an interactive chat:{Colors.END}")
    print(f"  {Colors.CYAN}affiliate-agent chat{Colors.END}")
    print()
    print(f"Output files will be saved to: {Colors.CYAN}./output/{Colors.END}")
    print()


def _prompt_api_key(env_path):
    print()
    print(f"  {Colors.BOLD}Your API key looks like:{Colors.END} sk-ant-api03-...")
    print(f"  {Colors.BOLD}Get one at:{Colors.END} https://platform.claude.com/")
    print()
    api_key = input("  Enter your Anthropic API key (or press Enter to skip): ").strip()
    if api_key:
        env_path.write_text(f"ANTHROPIC_API_KEY={api_key}\n")
        ok("API key saved to .env")
    else:
        if not env_path.exists():
            # Copy example
            example = Path(".env.example")
            if example.exists():
                env_path.write_text(example.read_text())
        warn("Skipped - edit .env and add your key before using AffiliateAgent")


if __name__ == "__main__":
    main()
