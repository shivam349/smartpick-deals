"""Pydantic models for affiliate marketing data."""

from enum import Enum

from pydantic import BaseModel, Field


class KeywordData(BaseModel):
    keyword: str
    search_volume: int = 0
    difficulty: int = 0
    cpc: float = 0.0
    intent: str = "informational"


class NicheAnalysis(BaseModel):
    niche: str
    score: float = Field(ge=0, le=100, description="Overall niche viability score")
    competition_level: str = "medium"
    estimated_monthly_traffic: int = 0
    top_keywords: list[KeywordData] = Field(default_factory=list)
    top_competitors: list[str] = Field(default_factory=list)
    monetization_potential: str = "medium"
    summary: str = ""
    recommendations: list[str] = Field(default_factory=list)


class AffiliateProgram(BaseModel):
    name: str
    url: str = ""
    commission_rate: str = ""
    cookie_duration: str = ""
    payment_threshold: str = ""
    category: str = ""
    pros: list[str] = Field(default_factory=list)
    cons: list[str] = Field(default_factory=list)


class ProductRecommendation(BaseModel):
    name: str
    description: str = ""
    price_range: str = ""
    affiliate_program: str = ""
    commission_rate: str = ""
    target_audience: str = ""
    unique_selling_points: list[str] = Field(default_factory=list)
    content_angles: list[str] = Field(default_factory=list)


class ContentType(str, Enum):
    REVIEW = "review"
    COMPARISON = "comparison"
    BUYING_GUIDE = "buying_guide"
    HOW_TO = "how_to"
    LISTICLE = "listicle"
    ROUNDUP = "roundup"


class ContentPiece(BaseModel):
    title: str
    content_type: ContentType
    target_keyword: str
    secondary_keywords: list[str] = Field(default_factory=list)
    outline: list[str] = Field(default_factory=list)
    body: str = ""
    meta_title: str = ""
    meta_description: str = ""
    estimated_word_count: int = 0
    affiliate_links_placement: list[str] = Field(default_factory=list)


class PerformanceReport(BaseModel):
    period: str = ""
    total_clicks: int = 0
    total_conversions: int = 0
    total_revenue: float = 0.0
    conversion_rate: float = 0.0
    top_performing_content: list[str] = Field(default_factory=list)
    top_performing_products: list[str] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)
    summary: str = ""
