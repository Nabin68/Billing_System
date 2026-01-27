from sqlalchemy.orm import Session # type: ignore
from app.models.credit_ledger import CreditLedger


def get_last_balance(db: Session, customer_id: int) -> float:
    last = (
        db.query(CreditLedger)
        .filter(CreditLedger.customer_id == customer_id)
        .order_by(CreditLedger.created_at.desc())
        .first()
    )
    return float(last.balance_after) if last else 0.0


def add_credit_entry(
    db: Session,
    customer_id: int,
    amount: float,
    reference_type: str,
    reference_id: int
):
    last_balance = get_last_balance(db, customer_id)
    new_balance = last_balance + amount

    entry = CreditLedger(
        customer_id=customer_id,
        entry_type="credit",
        amount=amount,
        balance_after=new_balance,
        reference_type=reference_type,
        reference_id=reference_id
    )

    db.add(entry)
    db.commit()


def add_debit_entry(
    db: Session,
    customer_id: int,
    amount: float
):
    last_balance = get_last_balance(db, customer_id)
    new_balance = last_balance - amount

    entry = CreditLedger(
        customer_id=customer_id,
        entry_type="debit",
        amount=amount,
        balance_after=new_balance,
        reference_type="payment",
        reference_id=None
    )

    db.add(entry)
    db.commit()
