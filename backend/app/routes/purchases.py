from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.item import Item
from app.models.purchase import Purchase
from app.schemas.purchase import PurchaseCreate
from app.services.pricing import calculate_selling_price
from app.services.stock import increase_stock

router = APIRouter(prefix="/purchases", tags=["Purchases"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/")
def create_purchase(purchase: PurchaseCreate, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == purchase.item_id).first()

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Update item pricing & stock
    item.cost_price = purchase.cost_price
    item.margin_percent = purchase.margin_percent
    item.selling_price = calculate_selling_price(
        purchase.cost_price, purchase.margin_percent
    )
    item.quantity = increase_stock(item.quantity, purchase.quantity)

    db_purchase = Purchase(
        item_id=purchase.item_id,
        dealer_name=purchase.dealer_name,
        quantity=purchase.quantity,
        cost_price=purchase.cost_price,
        margin_percent=purchase.margin_percent,
    )

    db.add(db_purchase)
    db.commit()

    return {"message": "Purchase added and stock updated"}
