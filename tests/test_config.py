"""Tests for configuration management."""

import tempfile
from pathlib import Path

from affiliate_agent.config import Config


def test_default_config():
    config = Config()
    assert config.agent.model == "claude-sonnet-4-6"
    assert config.content.min_word_count == 1500
    assert config.output.directory == "./output"


def test_config_load_missing_file():
    config = Config.load("/nonexistent/path.yaml")
    assert config.agent.model == "claude-sonnet-4-6"


def test_config_save_and_load():
    with tempfile.NamedTemporaryFile(suffix=".yaml", delete=False) as f:
        path = Path(f.name)

    config = Config()
    config.agent.model = "claude-opus-4-6"
    config.save(path)

    loaded = Config.load(path)
    assert loaded.agent.model == "claude-opus-4-6"

    path.unlink()
