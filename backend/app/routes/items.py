from fastapi import APIRouter, Depends, HTTPException # type: ignore
from sqlalchemy.orm import Session # type: ignore

from app.core.database import SessionLocal
from app.models.item import Item
from app.schemas.item import ItemCreate, ItemResponse, ItemUpdate
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


@router.get("/")
def list_items(db: Session = Depends(get_db)):
    items = (
        db.query(Item)
        .order_by(Item.name.asc())
        .all()
    )

    return [
        {
            "id": i.id,
            "name": i.name,
            "quantity": i.quantity,
            "cost_price": i.cost_price,
            "margin_percent": i.margin_percent,
            "selling_price": i.selling_price,
        }
        for i in items
    ]


@router.get("/search")
def search_items(q: str, db: Session = Depends(get_db)):
    keywords = q.strip().split()

    query = db.query(Item).filter(Item.quantity > 0)

    for word in keywords:
        query = query.filter(Item.name.ilike(f"%{word}%"))

    return (
        query
        .order_by(Item.name.asc())
        .limit(20)
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

@router.put("/{item_id}")
def update_item(item_id: int, data: ItemUpdate, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    item.name = data.name
    item.quantity = data.quantity
    item.cost_price = data.cost_price
    item.margin_percent = data.margin_percent

    # 🔒 Always calculate selling price on backend
    item.selling_price = calculate_selling_price(
        data.cost_price, data.margin_percent
    )

    db.commit()

    return {"message": "Item updated successfully"}

