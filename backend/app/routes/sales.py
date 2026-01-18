from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.item import Item
from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.schemas.sale import SaleCreate
from app.services.billing import calculate_final_price

router = APIRouter(prefix="/sales", tags=["Sales"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/")
def create_sale(sale: SaleCreate, db: Session = Depends(get_db)):
    total_amount = 0
    total_discount = 0

    sale_record = Sale(
        total_amount=0,
        total_discount=0,
        final_amount=0
    )
    db.add(sale_record)
    db.commit()
    db.refresh(sale_record)

    for s_item in sale.items:
        item = db.query(Item).filter(Item.id == s_item.item_id).first()

        if not item:
            raise HTTPException(status_code=404, detail="Item not found")

        if item.quantity < s_item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough stock for {item.name}"
            )

        line_total, discount, final_price = calculate_final_price(
            item.selling_price,
            s_item.quantity,
            s_item.discount_percent
        )

        item.quantity -= s_item.quantity  # 🔥 stock goes down

        sale_item = SaleItem(
            sale_id=sale_record.id,
            item_id=item.id,
            quantity=s_item.quantity,
            price=item.selling_price,
            discount_percent=s_item.discount_percent,
            final_price=final_price
        )

        total_amount += line_total
        total_discount += discount

        db.add(sale_item)

    sale_record.total_amount = total_amount
    sale_record.total_discount = total_discount
    sale_record.final_amount = total_amount - total_discount

    db.commit()

    return {
        "message": "Sale completed",
        "bill_id": sale_record.id,
        "final_amount": sale_record.final_amount
    }

@router.post("/preview")
def preview_sale(sale: SaleCreate, db: Session = Depends(get_db)):
    total_amount = 0
    total_discount = 0
    items_preview = []

    for s_item in sale.items:
        item = db.query(Item).filter(Item.id == s_item.item_id).first()

        if not item:
            raise HTTPException(status_code=404, detail="Item not found")

        if item.quantity < s_item.quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock")

        line_total, discount, final_price = calculate_final_price(
            item.selling_price,
            s_item.quantity,
            s_item.discount_percent
        )

        total_amount += line_total
        total_discount += discount

        items_preview.append({
            "item_name": item.name,
            "quantity": s_item.quantity,
            "price": item.selling_price,
            "discount_percent": s_item.discount_percent,
            "final_price": final_price
        })

    return {
        "items": items_preview,
        "total_amount": total_amount,
        "total_discount": total_discount,
        "final_amount": total_amount - total_discount
    }


@router.get("/{sale_id}")
def get_sale_details(sale_id: int, db: Session = Depends(get_db)):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()

    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")

    items = (
        db.query(SaleItem)
        .filter(SaleItem.sale_id == sale_id)
        .all()
    )

    return {
        "bill_id": sale.id,
        "date": sale.created_at,
        "total_amount": sale.total_amount,
        "total_discount": sale.total_discount,
        "final_amount": sale.final_amount,
        "items": items
    }
