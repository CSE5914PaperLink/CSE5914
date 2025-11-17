from typing import Optional, List, Dict, Any
import base64

from google import genai
from google.genai import types

from app.core.config import settings


class GeminiService:
    """Thin wrapper around Google genai client for content generation.

    Purpose: centralize client creation and generation config so routes can remain small.
    """

    def __init__(
        self, api_key: Optional[str] = None, default_model: Optional[str] = None
    ):
        self.api_key = api_key or settings.gemini_api_key
        self.default_model = default_model or settings.gemini_default_model

    def _client(self) -> genai.Client:
        if not self.api_key:
            raise RuntimeError("Gemini API key not configured")
        return genai.Client(api_key=self.api_key)

    def generate_content(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.2,
        max_output_tokens: Optional[int] = None,
        images: Optional[List[Dict[str, Any]]] = None,
    ) -> str:
        """Generate content synchronously with optional multimodal support.

        Args:
            prompt: Text prompt
            system_instruction: Optional system instruction
            model: Model name
            temperature: Generation temperature
            max_output_tokens: Max tokens to generate
            images: Optional list of image dicts with 'data' (base64) and metadata

        Returns:
            Generated text response

        Raises RuntimeError if API key missing or underlying client raises.
        """
        client = self._client()
        config = types.GenerateContentConfig(
            temperature=temperature,
            max_output_tokens=max_output_tokens,
            system_instruction=system_instruction,
        )

        # Build content parts: text prompt + images
        content_parts: List[Any] = [prompt]

        if images:
            for img in images:
                # Add each image as an inline data part
                # Gemini expects format: {"inline_data": {"mime_type": "image/png", "data": base64_string}}
                content_parts.append(
                    {"inline_data": {"mime_type": "image/png", "data": img["data"]}}
                )

        response = client.models.generate_content(
            model=model or self.default_model,
            config=config,
            contents=content_parts,  # type: ignore
        )

        # response.text can be None in some SDK versions; coerce to empty string
        return response.text or ""
