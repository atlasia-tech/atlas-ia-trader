from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Atlas IA Trader"
    VERSION: str = "1.0.0"

    OKX_API_KEY: str = ""
    OKX_SECRET_KEY: str = ""
    OKX_PASSPHRASE: str = ""

    DATABASE_URL: str = "sqlite:///atlas.db"

    class Config:
        env_file = ".env"


settings = Settings()