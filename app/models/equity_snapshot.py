from datetime import datetime, timezone

from sqlalchemy import DateTime, Float
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class EquitySnapshot(Base):
    __tablename__ = "equity_snapshots"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    patrimonio_total: Mapped[float] = mapped_column(Float, nullable=False)

    lucro_total: Mapped[float] = mapped_column(Float, nullable=False)

    margem_utilizada: Mapped[float] = mapped_column(Float, nullable=False)

    exposicao_total: Mapped[float] = mapped_column(Float, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )