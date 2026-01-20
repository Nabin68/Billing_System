from fastapi import APIRouter, Depends, HTTPException  # type: ignore
from sqlalchemy.orm import Session  # type: ignore

from app.core.database import SessionLocal
from app.models.purchase import Purchase
from app.models.purchase_item import PurchaseItem
from app.models.item import Item
from app.models.supplier import Supplier
from app.schemas.purchase import PurchaseCreate

router = APIRouter(prefix="/purchases", tags=["Purchases"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/")
def create_purchase(data: PurchaseCreate, db: Session = Depends(get_db)):

    # ---------- Supplier handling ----------
    supplier = None
    if data.supplier_phone:
        supplier = db.query(Supplier).filter(
            Supplier.phone == data.supplier_phone
        ).first()

        if not supplier:
            supplier = Supplier(
                name=data.supplier_name or "Unknown",
                phone=data.supplier_phone,
                address=data.supplier_address
            )
            db.add(supplier)
            db.commit()
            db.refresh(supplier)

    # ---------- Create Purchase ----------
    purchase = Purchase(
        supplier_id=supplier.id if supplier else None,
        total_amount=0
    )

    db.add(purchase)
    db.commit()
    db.refresh(purchase)

    total_amount = 0

    # ---------- Process each item ----------
    for p_item in data.items:

        # ⚠️ Margin must be present
        if p_item.margin_percent is None:
            raise HTTPException(
                status_code=400,
                detail=f"margin_percent is required for item '{p_item.item_name}'"
            )

        # Calculate selling price (ONLY from cost + margin)
        selling_price = p_item.cost_price + (
            p_item.cost_price * p_item.margin_percent / 100
        )

        # Find item
        item = db.query(Item).filter(Item.name == p_item.item_name).first()

        if not item:
            # ---------- Create new item ----------
            item = Item(
                name=p_item.item_name,
                cost_price=p_item.cost_price,
                margin_percent=p_item.margin_percent,   # ✅ REQUIRED
                selling_price=selling_price,            # ✅ CALCULATED
                quantity=p_item.quantity                # ✅ INITIAL STOCK
            )
            db.add(item)
            db.commit()
            db.refresh(item)
        else:
            # ---------- Update existing item ----------
            item.cost_price = p_item.cost_price
            item.margin_percent = p_item.margin_percent   # ✅ REQUIRED
            item.selling_price = selling_price
            item.quantity += p_item.quantity              # ✅ STOCK INCREASE

        # Line total
        line_total = p_item.quantity * p_item.cost_price
        total_amount += line_total

        # ---------- Create purchase item ----------
        purchase_item = PurchaseItem(
            purchase_id=purchase.id,
            item_id=item.id,
            quantity=p_item.quantity,
            cost_price=p_item.cost_price,
            margin_percent=p_item.margin_percent,
            selling_price=selling_price,
            line_total=line_total
        )

        db.add(purchase_item)

    # ---------- Finalize purchase ----------
    purchase.total_amount = total_amount
    db.commit()

    return {
        "message": "Purchase recorded",
        "purchase_id": purchase.id,
        "total_amount": total_amount
    }

@router.get("/")
def list_purchases(db: Session = Depends(get_db)):
    purchases = (
        db.query(Purchase)
        .order_by(Purchase.created_at.desc())
        .all()
    )

    return [
        {
            "id": p.id,
            "supplier_name": p.supplier.name if p.supplier else None,
            "supplier_phone": p.supplier.phone if p.supplier else None,
            "total_amount": p.total_amount,
            "created_at": p.created_at,
        }
        for p in purchases
    ]

@router.get("/{purchase_id}")
def get_purchase_details(purchase_id: int, db: Session = Depends(get_db)):
    purchase = db.query(Purchase).filter(Purchase.id == purchase_id).first()

    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")

    items_data = (
        db.query(PurchaseItem, Item)
        .join(Item, Item.id == PurchaseItem.item_id)
        .filter(PurchaseItem.purchase_id == purchase_id)
        .all()
    )

    items = [
        {
            "item_name": item.name,          # ✅ REAL NAME
            "quantity": pi.quantity,
            "cost_price": pi.cost_price,
            "margin_percent": pi.margin_percent,
            "selling_price": pi.selling_price,
            "line_total": pi.line_total,
        }
        for pi, item in items_data
    ]

    return {
        "id": purchase.id,
        "supplier_name": purchase.supplier.name if purchase.supplier else None,
        "supplier_phone": purchase.supplier.phone if purchase.supplier else None,
        "supplier_address": purchase.supplier.address if purchase.supplier else None,
        "created_at": purchase.created_at,
        "items": items,
        "total_amount": purchase.total_amount,
    }
