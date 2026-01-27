from fastapi import APIRouter, Depends, HTTPException # type: ignore
from sqlalchemy.orm import Session # type: ignore

from app.core.database import SessionLocal
from app.models.item import Item
from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.schemas.sale import SaleCreate
from app.services.billing import calculate_final_price
from app.models.customer import Customer
from app.services.credit_ledger import add_credit_entry
from math import floor


router = APIRouter(prefix="/sales", tags=["Sales"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def create_sale(sale: SaleCreate, db: Session = Depends(get_db)):

    # ------------------
    # 🔒 Sale type validation (NEW)
    # ------------------
    if sale.sale_type not in ["normal", "manual", "random"]:
        raise HTTPException(status_code=400, detail="Invalid sale_type")

    # ------------------
    # Customer handling
    # ------------------
    customer = None

    # Random sale → customer NOT required
    if sale.sale_type != "random" and sale.customer_phone:
        customer = db.query(Customer).filter(
            Customer.phone == sale.customer_phone
        ).first()

        if not customer:
            customer = Customer(
                name=sale.customer_name or "Unknown",
                phone=sale.customer_phone,
                address=sale.customer_address,
            )
            db.add(customer)
            db.commit()
            db.refresh(customer)
        else:
            if sale.customer_address and not customer.address:
                customer.address = sale.customer_address
                db.commit()

    # ------------------
    # Totals init
    # ------------------
    total_amount = 0
    total_discount = 0

    sale_record = Sale(
        customer_id=customer.id if customer else None,

        total_amount=0,
        total_discount=0,
        final_amount=0,
        rounded_final_amount=0,

        payment_mode=sale.payment_mode,
        amount_paid=sale.amount_paid or 0,
        due_amount=0,

        sale_type=sale.sale_type,                    # ✅ NEW
        manual_date=sale.manual_date                 # ✅ NEW (only meaningful for manual)
        if sale.sale_type == "manual" else None,

        is_manual=True if sale.sale_type == "manual" else False
    )

    db.add(sale_record)
    db.commit()
    db.refresh(sale_record)

    # 🔧 FIX 4: Manual sale date must override created_at
    if sale.sale_type == "manual" and sale.manual_date:
        sale_record.created_at = sale.manual_date
        db.commit()
        db.refresh(sale_record)

    # ------------------
    # Item loop (STOCK ALWAYS REDUCED)
    # ------------------
    for s_item in sale.items:
        item = db.query(Item).filter(Item.id == s_item.item_id).first()

        if not item:
            raise HTTPException(status_code=404, detail="Item not found")

        if item.quantity < s_item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough stock for {item.name}"
            )

        # 🔧 FIX 1: Use correct price per sale type
        price = (
            s_item.price
            if sale.sale_type in ["manual", "random"]
            else item.selling_price
        )

        line_total = price * s_item.quantity
        discount = (line_total * s_item.discount_percent) / 100
        final_price = line_total - discount

        # 🔻 STOCK REDUCTION (ALL SALE TYPES)
        item.quantity -= s_item.quantity

        sale_item = SaleItem(
            sale_id=sale_record.id,
            item_id=item.id,
            quantity=s_item.quantity,
            price=price,  # ✅ FIXED
            discount_percent=s_item.discount_percent,
            line_total=line_total,
            final_price=final_price,
        )

        total_amount += line_total
        total_discount += discount

        db.add(sale_item)

    # ------------------
    # Rounding & credit logic
    # ------------------
    final_amount = total_amount - total_discount
    rounded_final = round(final_amount, 2)

    if sale.payment_mode == "credit":
        sale_record.amount_paid = 0
        sale_record.due_amount = rounded_final
    else:
        sale_record.due_amount = rounded_final - sale_record.amount_paid

    sale_record.total_amount = total_amount
    sale_record.total_discount = total_discount
    sale_record.final_amount = final_amount
    sale_record.rounded_final_amount = rounded_final

    db.commit()

    # 🔥 CREDIT LEDGER INTEGRATION
    if sale_record.due_amount > 0:
        add_credit_entry(
            db=db,
            customer_id=sale_record.customer_id,
            amount=sale_record.due_amount,
            reference_type="sale",
            reference_id=sale_record.id
        )

    return {
        "message": "Sale completed",
        "bill_id": sale_record.id,
        "sale_type": sale_record.sale_type,
        "final_amount": rounded_final,
        "due_amount": sale_record.due_amount
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

        # 🔧 FIX 2: Preview endpoint must respect price
        price = (
            s_item.price
            if sale.sale_type in ["manual", "random"]
            else item.selling_price
        )

        line_total = price * s_item.quantity
        discount = (line_total * s_item.discount_percent) / 100
        final_price = line_total - discount

        total_amount += line_total
        total_discount += discount

        items_preview.append({
            "item_name": item.name,
            "quantity": s_item.quantity,
            "price": price,  # ✅ FIXED
            "discount_percent": s_item.discount_percent,
            "final_price": final_price
        })

    return {
        "items": items_preview,
        "total_amount": total_amount,
        "total_discount": total_discount,
        "final_amount": total_amount - total_discount
    }

@router.get("/history")
def sales_history(db: Session = Depends(get_db)):
    sales = (
        db.query(Sale)
        .filter(Sale.sale_type != "random")
        .order_by(Sale.created_at.desc())
        .all()
    )

    return [
        {
            "id": s.id,
            "created_at": s.created_at,
            "sale_type": s.sale_type,
            "customer_name": s.customer.name if s.customer else "Walk-in",
            "customer_phone": s.customer.phone if s.customer else None,  # ✅ ADD
            "payment_mode": s.payment_mode,
            "rounded_final_amount": s.rounded_final_amount,
        }
        for s in sales
    ]


@router.get("/random-history")
def random_sales(db: Session = Depends(get_db)):
    sales = (
        db.query(Sale)
        .filter(Sale.sale_type == "random")
        .order_by(Sale.created_at.desc())
        .all()
    )

    return [
        {
            "id": s.id,
            "created_at": s.created_at,
            "sale_type": "random",
            "customer_name": "—",
            "payment_mode": s.payment_mode,
            "rounded_final_amount": s.rounded_final_amount,
        }
        for s in sales
    ]

    
@router.get("/{sale_id}")
def get_sale_details(sale_id: int, db: Session = Depends(get_db)):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()

    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")

    # Proper SQLAlchemy join to get items with product names
    items_data = (
        db.query(SaleItem, Item)
        .join(Item, Item.id == SaleItem.item_id)
        .filter(SaleItem.sale_id == sale_id)
        .all()
    )

    items = [
        {
            "item_id": si.item_id,
            "item_name": item.name,   # ✅ IMPORTANT
            "quantity": si.quantity,
            "price": si.price,
            "discount_percent": si.discount_percent,
            "final_price": si.final_price,
        }
        for si, item in items_data
    ]


    return {
        "id": sale.id,
        "customer_name": sale.customer.name if sale.customer else None,
        "customer_phone": sale.customer.phone if sale.customer else None,
        "customer_address": sale.customer.address if sale.customer else None,
        "total_amount": sale.total_amount,
        "total_discount": sale.total_discount,
        "final_amount": sale.final_amount,
        "rounded_final_amount": sale.rounded_final_amount,
        "amount_paid": sale.amount_paid,
        "due_amount": sale.due_amount,
        "created_at": sale.created_at,
        "items": items,
    }



@router.get("/search")
def search_sales(q: str, db: Session = Depends(get_db)):
    sales = (
        db.query(Sale)
        .join(Customer, Sale.customer_id == Customer.id)
        .filter(
            (Customer.name.ilike(f"%{q}%")) |
            (Customer.phone.ilike(f"%{q}%"))
        )
        .order_by(Sale.created_at.desc())
        .limit(10)
        .all()
    )

    return [
        {
            "sale_id": s.id,
            "customer_name": s.customer.name,
            "customer_phone": s.customer.phone,
            "amount": s.rounded_final_amount
        }
        for s in sales
    ]