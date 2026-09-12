"""Tests for configuration management."""

import tempfile
from pathlib import Path

from affiliate_agent.config import Config


def test_default_config():
    config = Config()
    assert config.agent.model == "gemini-2.5-flash"
    assert config.content.min_word_count == 1500
    assert config.output.directory == "./output"
    assert config.site.name == "SmartPick Reviews"
    assert config.cuelinks.script_enabled is True


def test_config_load_missing_file():
    config = Config.load("/nonexistent/path.yaml")
    assert config.agent.model == "gemini-2.5-flash"


def test_config_save_and_load():
    with tempfile.NamedTemporaryFile(suffix=".yaml", delete=False) as f:
        path = Path(f.name)

    config = Config()
    config.agent.model = "gemini-2.5-pro"
    config.cuelinks.publisher_id = "12345"
    config.save(path)

    loaded = Config.load(path)
    assert loaded.agent.model == "gemini-2.5-pro"
    assert loaded.cuelinks.publisher_id == "12345"

    path.unlink()
