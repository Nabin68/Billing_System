from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from datetime import datetime
from app.core.database import Base

class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)

    dealer_name = Column(String, nullable=True)
    quantity = Column(Integer, nullable=False)
    cost_price = Column(Float, nullable=False)
    margin_percent = Column(Float, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
