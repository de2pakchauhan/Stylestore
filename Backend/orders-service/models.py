from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime,func
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True)
    product_id = Column(Integer)
    quantity = Column(Integer)
    price = Column(Float)
    status = Column(String, default="pending")
    currency = Column(String, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
