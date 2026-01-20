from sqlalchemy import Column, Integer, Float, ForeignKey # type: ignore
from sqlalchemy.orm import relationship # type: ignore
from app.core.database import Base


class SaleItem(Base):
    __tablename__ = "sale_items"

    id = Column(Integer, primary_key=True, index=True)

    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)

    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    discount_percent = Column(Float, nullable=False)
    line_total = Column(Float, nullable=False)
    final_price = Column(Float, nullable=False)

    # 🔥 PROPER RELATIONSHIP TO Item TABLE
    item = relationship("Item")
