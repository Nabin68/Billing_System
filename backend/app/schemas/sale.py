from pydantic import BaseModel
from typing import List, Optional

class SaleItemCreate(BaseModel):
    item_id: int
    quantity: int
    discount_percent: float

class SaleCreate(BaseModel):
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None

    payment_mode: str  # cash / online / credit
    amount_paid: Optional[float] = 0

    is_manual: Optional[int] = 0

    items: List[SaleItemCreate]
