from pydantic import BaseModel # type: ignore
from typing import Optional


class ItemCreate(BaseModel):
    name: str
    cost_price: float
    margin_percent: float
    quantity: int
    category: Optional[str] = None
    dealer_name: Optional[str] = None


class ItemUpdate(BaseModel):
    name: str
    quantity: int
    cost_price: float
    margin_percent: float
    selling_price: float


class ItemResponse(BaseModel):
    id: int
    name: str
    quantity: int
    cost_price: float
    margin_percent: float
    selling_price: float

    class Config:
        from_attributes = True
