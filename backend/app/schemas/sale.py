from pydantic import BaseModel # type: ignore
from typing import List, Optional
from datetime import datetime

class SaleItemCreate(BaseModel):
    item_id: int
    quantity: int
    discount_percent: float = 0
    price: Optional[float] = None   # ✅ MUST BE OPTIONAL


class SaleCreate(BaseModel):
    sale_type: str = "normal"       # normal | manual | random

    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_address: Optional[str] = None

    payment_mode: str
    amount_paid: Optional[float] = 0  # ✅ OPTIONAL

    manual_date: Optional[datetime] = None

    items: List[SaleItemCreate]
