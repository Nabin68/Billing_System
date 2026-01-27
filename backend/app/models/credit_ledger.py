from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Numeric # type: ignore
from sqlalchemy.orm import relationship # type: ignore
from datetime import datetime

from app.core.database import Base


class CreditLedger(Base):
    __tablename__ = "credit_ledger"

    id = Column(Integer, primary_key=True, index=True)

    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)

    # credit = sale, debit = payment
    entry_type = Column(String, nullable=False)  # "credit" | "debit"

    amount = Column(Numeric(10, 2), nullable=False)

    balance_after = Column(Numeric(10, 2), nullable=False)

    reference_type = Column(String, nullable=True)  # "sale" | "payment"
    reference_id = Column(Integer, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", backref="ledger_entries")
