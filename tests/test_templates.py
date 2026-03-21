"""Tests for prompt templates."""

from affiliate_agent.templates.prompts import NICHE_RESEARCH_PROMPT, format_prompt


def test_format_prompt_basic():
    result = format_prompt(NICHE_RESEARCH_PROMPT, niche="VPN")
    assert "VPN" in result
    assert "vpn" in result  # slug


def test_format_prompt_custom_output_dir():
    result = format_prompt(NICHE_RESEARCH_PROMPT, niche="coffee makers", output_dir="./reports")
    assert "./reports" in result


def test_format_prompt_slug_generation():
    result = format_prompt(NICHE_RESEARCH_PROMPT, niche="best wireless headphones")
    assert "best-wireless-headphones" in result
