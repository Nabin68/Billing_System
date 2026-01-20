from pydantic import BaseModel # type: ignore
from typing import List, Optional


class PurchaseItemCreate(BaseModel):
    item_name: str
    quantity: int
    cost_price: float
    margin_percent: float
    selling_price: Optional[float] = None


class PurchaseCreate(BaseModel):
    supplier_phone: Optional[str] = None
    supplier_name: Optional[str] = None
    supplier_address: Optional[str] = None

    items: List[PurchaseItemCreate]
