from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date
from app.core.database import SessionLocal
from app.models.sale import Sale
import csv
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/reports", tags=["Reports"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/today")
def today_report(db: Session = Depends(get_db)):
    today = date.today()

    sales = db.query(Sale).filter(
        Sale.created_at >= today
    ).all()

    total_bills = len(sales)
    total_sales_amount = sum(s.final_amount for s in sales)
    total_discount = sum(s.total_discount for s in sales)

    return {
        "total_bills": total_bills,
        "total_sales_amount": round(total_sales_amount, 2),
        "total_discount": round(total_discount, 2),
    }

@router.get("/export/sales")
def export_sales_csv(db: Session = Depends(get_db)):
    def generate():
        yield "Bill ID,Total Amount,Total Discount,Final Amount,Date\n"
        sales = db.query(Sale).all()
        for s in sales:
            yield f"{s.id},{s.total_amount},{s.total_discount},{s.final_amount},{s.created_at}\n"

    return StreamingResponse(
        generate(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=sales.csv"},
    )
