from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.sale import Sale
import csv
from fastapi.responses import StreamingResponse
from datetime import datetime, date, time
from fastapi import HTTPException
import traceback
from sqlalchemy import func

router = APIRouter(prefix="/reports", tags=["Reports"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



@router.get("/today")
def today_report(db: Session = Depends(get_db)):
    sales = (
        db.query(Sale)
        .filter(func.date(Sale.created_at) == date.today())
        .all()
    )

    return {
        "total_bills": len(sales),
        "total_sales_amount": round(
            sum((s.final_amount or 0) for s in sales), 2
        ),
        "total_discount": round(
            sum((s.total_discount or 0) for s in sales), 2
        ),
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
