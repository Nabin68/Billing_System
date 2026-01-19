from fastapi import APIRouter, Depends # type: ignore
from sqlalchemy.orm import Session # type: ignore
from app.core.database import SessionLocal
from app.models.sale import Sale
from app.models.customer import Customer

router = APIRouter(prefix="/credit", tags=["Credit"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def credit_list(db: Session = Depends(get_db)):
    sales = (
        db.query(Sale, Customer)
        .join(Customer, Sale.customer_id == Customer.id)
        .filter(Sale.due_amount > 0)
        .all()
    )

    return [
        {
            "sale_id": s.id,
            "customer_name": c.name,
            "customer_phone": c.phone,
            "total": s.rounded_final_amount,
            "paid": s.amount_paid,
            "due": s.due_amount,
            "date": s.created_at,
        }
        for s, c in sales
    ]

@router.post("/pay/{sale_id}")
def pay_credit(sale_id: int, amount: float, db: Session = Depends(get_db)):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()

    if not sale:
        return {"error": "Sale not found"}

    sale.amount_paid += amount
    sale.due_amount = max(
        sale.rounded_final_amount - sale.amount_paid, 0
    )

    if sale.due_amount == 0:
        sale.payment_mode = "paid"

    db.commit()
    return {"message": "Payment updated"}
