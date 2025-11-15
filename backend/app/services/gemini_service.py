from typing import Optional

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
    ) -> str:
        """Generate content synchronously and return the text portion of the response.

        Raises RuntimeError if API key missing or underlying client raises.
        """
        client = self._client()
        config = types.GenerateContentConfig(
            temperature=temperature,
            max_output_tokens=max_output_tokens,
            system_instruction=system_instruction,
        )
        response = client.models.generate_content(
            model=model or self.default_model,
            config=config,
            contents=[prompt],
        )

        # response.text can be None in some SDK versions; coerce to empty string
        return response.text or ""
