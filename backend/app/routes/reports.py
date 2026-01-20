from fastapi import APIRouter, Depends,HTTPException # type: ignore
from sqlalchemy.orm import Session # type: ignore
from app.core.database import SessionLocal
import csv
from fastapi.responses import StreamingResponse # type: ignore
from datetime import datetime, date, time
import traceback
from sqlalchemy import func # type: ignore
from app.models.sale import Sale
from datetime import datetime

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

    total_sales = 0
    total_discount = 0

    for s in sales:
        total_sales += s.final_amount or 0
        total_discount += s.total_discount or 0

    return {
        "total_bills": len(sales),
        "total_sales_amount": round(total_sales, 2),
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


@router.get("/dashboard/today")
def dashboard_today(db: Session = Depends(get_db)):
    today = date.today()

    sales = db.query(Sale).filter(
        func.date(Sale.created_at) == today
    ).all()

    total_sales = 0
    total_credit = 0
    customers = set()

    for s in sales:
        total_sales += s.rounded_final_amount or 0
        total_credit += s.due_amount or 0
        if s.customer_id:
            customers.add(s.customer_id)

    return {
        "total_sales": round(total_sales, 2),
        "bill_count": len(sales),
        "customers_count": len(customers),
        "total_credit": round(total_credit, 2),
    }

@router.get("/dashboard/last-7-days")
def dashboard_last_7_days(db: Session = Depends(get_db)):
    results = (
        db.query(
            func.date(Sale.created_at).label("date"),
            func.coalesce(func.sum(Sale.rounded_final_amount), 0).label("total")
        )
        .group_by(func.date(Sale.created_at))
        .order_by(func.date(Sale.created_at).desc())
        .limit(7)
        .all()
    )

    return [
        {
            "date": str(r.date),
            "total": round(r.total, 2),
        }
        for r in reversed(results)
    ]
