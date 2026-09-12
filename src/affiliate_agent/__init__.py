"""AffiliateAgent - An agentic AI system for affiliate marketing."""

from pathlib import Path
from dotenv import load_dotenv, find_dotenv

# Automatically locate and load .env file
_env_path = find_dotenv(usecwd=True)
if _env_path:
    load_dotenv(_env_path)
else:
    _fallback = Path(__file__).resolve().parent.parent.parent / ".env"
    if _fallback.exists():
        load_dotenv(_fallback)

__version__ = "0.1.0"
