"""Configuration management for AffiliateAgent."""

from pathlib import Path

import yaml
from pydantic import BaseModel, Field


class AgentConfig(BaseModel):
    model: str = "claude-sonnet-4-6"
    max_turns: int | None = None
    max_budget_usd: float | None = None
    verbose: bool = False


class ContentConfig(BaseModel):
    default_type: str = "review"
    min_word_count: int = 1500
    max_keyword_density: float = 2.5
    include_faq: bool = True
    include_disclosure: bool = True


class OutputConfig(BaseModel):
    directory: str = "./output"
    format: str = "markdown"


class Config(BaseModel):
    agent: AgentConfig = Field(default_factory=AgentConfig)
    content: ContentConfig = Field(default_factory=ContentConfig)
    output: OutputConfig = Field(default_factory=OutputConfig)

    @classmethod
    def load(cls, path: str | Path = "affiliate-agent.yaml") -> "Config":
        path = Path(path)
        if path.exists():
            with open(path) as f:
                data = yaml.safe_load(f) or {}
            return cls(**data)
        return cls()

    def save(self, path: str | Path = "affiliate-agent.yaml"):
        path = Path(path)
        with open(path, "w") as f:
            yaml.dump(self.model_dump(), f, default_flow_style=False)
