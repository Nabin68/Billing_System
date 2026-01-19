from pydantic import BaseModel
from typing import List

class PurchaseItem(BaseModel):
    item_id: int
    quantity: int
    cost_price: float
    margin_percent: float

class PurchaseBatch(BaseModel):
    dealer_name: str
    items: List[PurchaseItem]
