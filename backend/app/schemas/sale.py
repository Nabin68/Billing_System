from pydantic import BaseModel
from typing import List

class SaleItemCreate(BaseModel):
    item_id: int
    quantity: int
    discount_percent: float


class SaleCreate(BaseModel):
    items: List[SaleItemCreate]
