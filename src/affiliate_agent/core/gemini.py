"""Gemini API client wrapper for AffiliateAgent.

Replaces Claude Agent SDK with direct Google Gemini API integration.
Supports async generations, structured JSON output, retry backoff, and fallback mock modes.
"""

import asyncio
import json
import logging
import os
import re
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Check if google-genai is installed
try:
    from google import genai
    from google.genai import types
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False


class GeminiClient:
    """High-level client for Google Gemini API."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        default_model: str = "gemini-2.5-flash",
    ):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.default_model = os.getenv("GEMINI_MODEL", default_model)
        self._client: Optional[Any] = None

        if HAS_GENAI and self.api_key and self.api_key != "your-gemini-api-key-here":
            self._client = genai.Client(api_key=self.api_key)

    @property
    def is_configured(self) -> bool:
        """Return True if a valid Gemini API key is available."""
        return bool(self._client is not None)

    async def generate(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_output_tokens: Optional[int] = None,
        retries: int = 3,
    ) -> str:
        """Generate text completion from Gemini."""
        target_model = model or self.default_model

        if not self.is_configured:
            raise ValueError(
                "GEMINI_API_KEY is not configured. Please set GEMINI_API_KEY in your .env file or environment."
            )

        config_kwargs: Dict[str, Any] = {
            "temperature": temperature,
        }
        if system_instruction:
            config_kwargs["system_instruction"] = system_instruction
        if max_output_tokens:
            config_kwargs["max_output_tokens"] = max_output_tokens

        config = types.GenerateContentConfig(**config_kwargs)

        last_err: Optional[Exception] = None
        for attempt in range(retries):
            try:
                # Use client.aio for async execution
                response = await self._client.aio.models.generate_content(
                    model=target_model,
                    contents=prompt,
                    config=config,
                )
                return response.text or ""
            except Exception as e:
                last_err = e
                logger.warning("Gemini generation attempt %d failed: %s", attempt + 1, e)
                if attempt < retries - 1:
                    await asyncio.sleep(2 ** attempt)

        raise RuntimeError(f"Gemini API request failed after {retries} retries: {last_err}")

    async def generate_json(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.2,
        retries: int = 3,
    ) -> Any:
        """Generate structured JSON response from Gemini."""
        target_model = model or self.default_model

        if not self.is_configured:
            raise ValueError(
                "GEMINI_API_KEY is not configured. Please set GEMINI_API_KEY in your .env file or environment."
            )

        json_system = (
            (system_instruction + "\n\n" if system_instruction else "")
            + "CRITICAL: You MUST respond ONLY with valid JSON. Do not include introductory text, explanations, or code formatting beyond valid JSON."
        )

        config = types.GenerateContentConfig(
            system_instruction=json_system,
            temperature=temperature,
            response_mime_type="application/json",
        )

        last_err: Optional[Exception] = None
        for attempt in range(retries):
            try:
                response = await self._client.aio.models.generate_content(
                    model=target_model,
                    contents=prompt,
                    config=config,
                )
                raw_text = response.text or ""
                # Strip markdown code blocks if present
                clean_text = re.sub(r"^```(?:json)?\s*", "", raw_text.strip(), flags=re.MULTILINE)
                clean_text = re.sub(r"```$", "", clean_text.strip(), flags=re.MULTILINE)
                return json.loads(clean_text)
            except Exception as e:
                last_err = e
                logger.warning("Gemini JSON generation attempt %d failed: %s", attempt + 1, e)
                if attempt < retries - 1:
                    await asyncio.sleep(2 ** attempt)

        raise RuntimeError(f"Gemini JSON generation failed after {retries} retries: {last_err}")


# Default global client
default_gemini_client = GeminiClient()
