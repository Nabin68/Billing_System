from sqlalchemy import Column, Integer, String # type: ignore
from app.core.database import Base
from sqlalchemy.orm import relationship # type: ignore



class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=False)
    address = Column(String, nullable=True)
    sales = relationship("Sale", back_populates="customer")


