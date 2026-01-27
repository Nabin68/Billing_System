from fastapi import HTTPException # type: ignore
from fastapi import APIRouter, Depends  # type: ignore
from sqlalchemy.orm import Session  # type: ignore
from sqlalchemy import func  # type: ignore

from app.core.database import SessionLocal
from app.models.customer import Customer
from app.models.sale import Sale

router = APIRouter(prefix="/customers", tags=["Customers"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/search")
def search_customer(q: str, db: Session = Depends(get_db)):
    return (
        db.query(Customer)
        .filter(Customer.phone.ilike(f"%{q}%"))
        .limit(10)
        .all()
    )


@router.get("/{customer_id}/sales")
def customer_sales(customer_id: int, db: Session = Depends(get_db)):
    return db.query(Sale).filter(
        Sale.customer_id == customer_id
    ).all()


@router.get("/by-phone")
def get_customer_by_phone(phone: str, db: Session = Depends(get_db)):
    return db.query(Customer).filter(Customer.phone == phone).first()


# ✅ MAIN PART: Customer Summary API
@router.get("/summary")
def customer_summary(db: Session = Depends(get_db)):
    results = (
        db.query(
            Customer.id.label("customer_id"),
            Customer.name,
            Customer.phone,
            Customer.address,

            func.max(Sale.created_at).label("last_purchase_date"),
            func.coalesce(func.sum(Sale.rounded_final_amount), 0).label("total_purchase"),
            func.coalesce(func.sum(Sale.amount_paid), 0).label("total_paid"),
            func.coalesce(func.sum(Sale.due_amount), 0).label("total_credit"),
        )
        .join(Sale, Sale.customer_id == Customer.id)
        .group_by(Customer.id)
        .order_by(func.max(Sale.created_at).desc())
        .all()
    )

    return [
        {
            "customer_id": r.customer_id,
            "name": r.name,
            "phone": r.phone,
            "address": r.address,
            "last_purchase_date": r.last_purchase_date,
            "total_purchase": float(r.total_purchase),
            "total_paid": float(r.total_paid),
            "total_credit": float(r.total_credit),
        }
        for r in results
    ]
    
    
@router.get("/{customer_id}/details")
def get_customer_details(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    sales = (
        db.query(Sale)
        .filter(Sale.customer_id == customer_id)
        .order_by(Sale.created_at.desc())
        .all()
    )

    total_purchase = sum(s.rounded_final_amount for s in sales)
    total_paid = sum(s.amount_paid for s in sales)
    total_credit = total_purchase - total_paid

    return {
        "customer": {
            "id": customer.id,
            "name": customer.name,
            "phone": customer.phone,
            "address": customer.address
        },
        "summary": {
            "total_purchase": total_purchase,
            "total_paid": total_paid,
            "total_credit": total_credit
        },
        "sales": [
            {
                "sale_id": s.id,
                "date": s.created_at,
                "total_amount": s.rounded_final_amount,
                "paid": s.amount_paid,
                "credit": s.due_amount,
                "payment_mode": s.payment_mode
            }
            for s in sales
        ]
    }