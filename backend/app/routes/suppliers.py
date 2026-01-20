from fastapi import APIRouter, Depends, HTTPException, Query # type: ignore
from sqlalchemy.orm import Session # type: ignore

from app.core.database import SessionLocal
from app.models.supplier import Supplier

router = APIRouter(prefix="/suppliers", tags=["Suppliers"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 🔍 Search supplier by phone (autocomplete)
@router.get("/search")
def search_supplier(phone: str = Query(..., min_length=3), db: Session = Depends(get_db)):
    suppliers = (
        db.query(Supplier)
        .filter(Supplier.phone.like(f"%{phone}%"))
        .limit(5)
        .all()
    )

    return [
        {
            "id": s.id,
            "name": s.name,
            "phone": s.phone,
            "alt_phone": s.alt_phone,
            "address": s.address,
        }
        for s in suppliers
    ]


# ➕ Create supplier (used during purchase submit)
@router.post("/")
def create_supplier(data: dict, db: Session = Depends(get_db)):
    if not data.get("phone"):
        raise HTTPException(status_code=400, detail="Phone is required")

    existing = db.query(Supplier).filter(Supplier.phone == data["phone"]).first()
    if existing:
        return existing

    supplier = Supplier(
        name=data.get("name", "Unknown"),
        phone=data["phone"],
        alt_phone=data.get("alt_phone"),
        address=data.get("address"),
    )

    db.add(supplier)
    db.commit()
    db.refresh(supplier)

    return supplier
