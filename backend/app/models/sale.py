from sqlalchemy import Column, Integer, Float, DateTime, String, ForeignKey # type: ignore
from datetime import datetime
from app.core.database import Base
from sqlalchemy.orm import relationship # type: ignore

class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)

    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    customer = relationship("Customer", back_populates="sales")

    total_amount = Column(Float, nullable=False)
    total_discount = Column(Float, nullable=False)
    final_amount = Column(Float, nullable=False)
    rounded_final_amount = Column(Float, nullable=False)

    payment_mode = Column(String, nullable=False)  # cash / online / credit
    amount_paid = Column(Float, default=0)
    due_amount = Column(Float, default=0)

    is_manual = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)
    
     # ✅ NEW FIELDS
    sale_type = Column(String, default="normal")  
    # values: normal | manual | random

    manual_date = Column(DateTime, nullable=True)

