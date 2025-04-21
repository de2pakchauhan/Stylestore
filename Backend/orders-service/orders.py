from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from schemas import OrderCreate, OrderResponse
from models import Order
from database import get_db
from auth import get_current_user

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    try:
        # Validate required fields
        if not all([order_data.product_id, order_data.quantity, order_data.price]):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Missing required order fields"
            )

        new_order = Order(
            user_email=user["email"],
            product_id=order_data.product_id,
            quantity=order_data.quantity,
            price=order_data.price,
            currency=order_data.currency,
            status="pending"
        )
        
        db.add(new_order)
        await db.commit()
        await db.refresh(new_order)
        return new_order
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/", response_model=list[OrderResponse])
async def get_orders(
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(Order).where(Order.user_email == user["email"])
    )
    orders = result.scalars().all()
    return orders or []