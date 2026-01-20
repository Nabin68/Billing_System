from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey # type: ignore
from sqlalchemy.orm import relationship # type: ignore
from datetime import datetime

from app.core.database import Base


class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)

    total_amount = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    supplier = relationship("Supplier")
    items = relationship("PurchaseItem", back_populates="purchase")
