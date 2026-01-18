from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from app.core.database import Base

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=True)
    dealer_name = Column(String, nullable=True)

    cost_price = Column(Float, nullable=False)
    margin_percent = Column(Float, nullable=False)
    selling_price = Column(Float, nullable=False)

    quantity = Column(Integer, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
