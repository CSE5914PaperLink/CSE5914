from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    debug: bool = False

    gemini_api_key: str | None = None
    gemini_base_url: str = "https://generativelanguage.googleapis.com/v1beta"
    gemini_default_model: str = "gemini-2.0-flash"
    gemini_embedding_model: str = "gemini-embedding-001"

    # ChromaDB configuration
    chroma_persist_path: str = "./chroma"  # relative to backend working dir
    chroma_collection_name: str = "documents"

    # GitHub configuration
    github_api_token: str = ""  # Optional; if empty, uses unauthenticated requests
    github_raw_url: str = "https://raw.githubusercontent.com"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


settings = Settings()
