from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Integer, String, Text

from app.models.base import Base


class SystemEvent(Base):
    __tablename__ = "system_events"

    id = Column(Integer, primary_key=True, index=True)

    source = Column(String(50), nullable=False)
    title = Column(String(120), nullable=False)
    description = Column(Text, nullable=False)

    level = Column(String(20), nullable=False, default="info")

    created_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )