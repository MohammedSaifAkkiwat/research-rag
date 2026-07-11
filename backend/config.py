# config.py
from pydantic_settings import BaseSettings  # pip install pydantic-settings
from functools import lru_cache

class Settings(BaseSettings):
    google_api_key: str
    cohere_api_key: str
    app_env: str = "development"
    max_file_size_mb: int = 10
    # Local dev defaults only. In production (Render), set ALLOWED_ORIGINS
    # in the dashboard to a comma-separated list including your real Vercel
    # URL(s) — see the deployment guide in README.md.
    allowed_origins: str = "http://localhost:3000,http://localhost:5173"

    class Config:
        env_file = ".env"
        case_sensitive = False  # GOOGLE_API_KEY matches google_api_key

    def origins_list(self) -> list[str]:
        """Parsed, whitespace-trimmed, empty-filtered list of allowed origins."""
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]

@lru_cache()  # Only load settings once, cache the result
def get_settings() -> Settings:
    return Settings()
