from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.models.base import Base
from app.models.equity_snapshot import EquitySnapshot
from app.models.settings import Settings as DatabaseSettings
from app.models.system_event import SystemEvent

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def create_database():
    Base.metadata.create_all(bind=engine)