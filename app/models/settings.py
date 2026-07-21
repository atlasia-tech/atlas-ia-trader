from sqlalchemy import Column, Integer, String

from app.models.base import Base


class Settings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)

    exchange = Column(String, default="OKX")

    account_mode = Column(String, default="demo")

    leverage = Column(Integer, default=5)

    operation_value = Column(Integer, default=20)

    daily_profit_target = Column(Integer, default=50)

    daily_loss_limit = Column(Integer, default=30)