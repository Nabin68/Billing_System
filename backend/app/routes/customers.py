from fastapi import APIRouter, Depends # type: ignore
from sqlalchemy.orm import Session # type: ignore
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
def search_customers(q: str, db: Session = Depends(get_db)):
    return (
        db.query(Customer)
        .filter(
            (Customer.name.ilike(f"%{q}%")) |
            (Customer.phone.ilike(f"%{q}%"))
        )
        .all()
    )

@router.get("/{customer_id}/sales")
def customer_sales(customer_id: int, db: Session = Depends(get_db)):
    return db.query(Sale).filter(
        Sale.customer_id == customer_id
    ).all()
