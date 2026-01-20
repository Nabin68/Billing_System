from pydantic import BaseModel # type: ignore
from typing import List, Optional
from datetime import datetime

class SaleItemCreate(BaseModel):
    item_id: int
    quantity: int
    price: float                     # ✅ REQUIRED
    discount_percent: float = 0


class SaleCreate(BaseModel):
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_address: Optional[str] = None

    payment_mode: str
    amount_paid: float = 0

    sale_type: str = "normal"        # normal | manual | random
    manual_date: Optional[datetime] = None

    items: List[SaleItemCreate]


