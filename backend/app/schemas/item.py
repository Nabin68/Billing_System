from pydantic import BaseModel

class ItemCreate(BaseModel):
    name: str
    category: str | None = None
    dealer_name: str | None = None
    cost_price: float
    margin_percent: float
    quantity: int


class ItemResponse(BaseModel):
    id: int
    name: str
    category: str | None
    dealer_name: str | None
    cost_price: float
    margin_percent: float
    selling_price: float
    quantity: int

    class Config:
        orm_mode = True
