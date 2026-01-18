from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.item import Item
from app.schemas.item import ItemCreate, ItemResponse
from app.services.pricing import calculate_selling_price

router = APIRouter(prefix="/items", tags=["Items"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=ItemResponse)
def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    selling_price = calculate_selling_price(
        item.cost_price, item.margin_percent
    )

    db_item = Item(
        name=item.name,
        category=item.category,
        dealer_name=item.dealer_name,
        cost_price=item.cost_price,
        margin_percent=item.margin_percent,
        selling_price=selling_price,
        quantity=item.quantity,
    )

    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    return db_item


@router.get("/", response_model=list[ItemResponse])
def list_items(db: Session = Depends(get_db)):
    return db.query(Item).all()

@router.get("/search")
def search_items(q: str, db: Session = Depends(get_db)):
    return (
        db.query(Item)
        .filter(
            Item.name.ilike(f"%{q}%"),
            Item.quantity > 0
        )
        .all()
    )
    
@router.get("/low-stock")
def low_stock_items(threshold: int = 5, db: Session = Depends(get_db)):
    items = (
        db.query(Item)
        .filter(Item.quantity <= threshold)
        .all()
    )

    return [
        {
            "id": i.id,
            "name": i.name,
            "quantity": i.quantity,
            "selling_price": i.selling_price,
        }
        for i in items
    ]

