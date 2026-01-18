from pydantic import BaseModel

class PurchaseCreate(BaseModel):
    item_id: int
    dealer_name: str | None = None
    quantity: int
    cost_price: float
    margin_percent: float
