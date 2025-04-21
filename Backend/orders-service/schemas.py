from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class OrderCreate(BaseModel):
    product_id: int
    quantity: int
    price: float
    currency: str

class OrderResponse(OrderCreate):
    id: int
    user_email: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
