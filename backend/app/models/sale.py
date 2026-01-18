from sqlalchemy import Column, Integer, Float, DateTime
from datetime import datetime
from app.core.database import Base

class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    total_amount = Column(Float, nullable=False)
    total_discount = Column(Float, nullable=False)
    final_amount = Column(Float, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
