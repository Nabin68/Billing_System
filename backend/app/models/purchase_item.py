from sqlalchemy import Column, Integer, Float, ForeignKey # type: ignore
from sqlalchemy.orm import relationship # type: ignore

from app.core.database import Base


class PurchaseItem(Base):
    __tablename__ = "purchase_items"

    id = Column(Integer, primary_key=True)

    purchase_id = Column(Integer, ForeignKey("purchases.id"))
    item_id = Column(Integer, ForeignKey("items.id"))

    quantity = Column(Integer)
    cost_price = Column(Float)
    margin_percent = Column(Float)
    selling_price = Column(Float)
    line_total = Column(Float)

    purchase = relationship("Purchase", back_populates="items")
    item = relationship("Item")
