from fastapi import APIRouter, Depends,HTTPException # type: ignore
from sqlalchemy.orm import Session # type: ignore
from app.core.database import SessionLocal
from app.models.sale import Sale
from app.models.customer import Customer
from app.services.credit_ledger import add_debit_entry

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
    
@router.post("/pay/{customer_id}")
def pay_credit(customer_id: int, amount: float, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    if amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid amount")

    add_debit_entry(db, customer_id, amount)

    return {"message": "Payment recorded"}
