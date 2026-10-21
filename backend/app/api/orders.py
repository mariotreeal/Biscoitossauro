from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.deps import get_current_user
from backend.app.models.models import Order, OrderHistory, User, Company, Person, PipelineOpportunity
from backend.app.schemas.schemas import (
    OrderCreate,
    OrderUpdate,
    OrderResponse,
    OrderStatusUpdate,
)

router = APIRouter(prefix="/orders", tags=["Pedidos & Produção"])

VALID_STATUSES = [
    "aprovado",
    "provisao_recursos",
    "linha_producao",
    "embalagem",
    "entrega",
    "faturamento",
    "concluido",
    "cancelado"
]

def generate_order_number(db: Session) -> str:
    current_year = datetime.utcnow().year
    prefix = f"PED-{current_year}"
    count = db.query(Order).filter(Order.order_number.like(f"{prefix}%")).count()
    return f"{prefix}-{(count + 1):04d}"

@router.get("", response_model=List[OrderResponse])
def list_orders(
    status: Optional[str] = None,
    customer_type: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Order)

    if status:
        query = query.filter(Order.status == status)
    if customer_type:
        query = query.filter(Order.customer_type == customer_type)
    if priority:
        query = query.filter(Order.priority == priority)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Order.order_number.ilike(search_filter))
            | (Order.title.ilike(search_filter))
            | (Order.contact_name.ilike(search_filter))
            | (Order.description.ilike(search_filter))
        )

    return query.order_by(Order.created_at.desc()).all()

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if data.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Status de pedido inválido. Deve ser um de: {', '.join(VALID_STATUSES)}",
        )

    order_dict = data.model_dump()
    order_dict["order_number"] = generate_order_number(db)
    if not order_dict.get("order_date"):
        order_dict["order_date"] = datetime.utcnow().strftime("%Y-%m-%d")

    order = Order(**order_dict)
    db.add(order)
    db.commit()
    db.refresh(order)

    # Registra o histórico inicial de criação
    history = OrderHistory(
        order_id=order.id,
        from_status=None,
        to_status=order.status,
        notes="Pedido criado no sistema.",
        changed_by=current_user.name
    )
    db.add(history)
    db.commit()
    db.refresh(order)

    return order

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado.")
    return order

@router.put("/{order_id}", response_model=OrderResponse)
def update_order(
    order_id: int,
    data: OrderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado.")

    update_dict = data.model_dump(exclude_unset=True)
    old_status = order.status

    if "status" in update_dict and update_dict["status"] not in VALID_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Status de pedido inválido. Deve ser um de: {', '.join(VALID_STATUSES)}",
        )

    for field, value in update_dict.items():
        setattr(order, field, value)

    # Se houve transição de status, registra histórico
    if "status" in update_dict and update_dict["status"] != old_status:
        if update_dict["status"] == "concluido" and not order.finished_at:
            order.finished_at = datetime.utcnow()
        history = OrderHistory(
            order_id=order.id,
            from_status=old_status,
            to_status=update_dict["status"],
            notes="Status atualizado na edição do pedido.",
            changed_by=current_user.name
        )
        db.add(history)

    db.commit()
    db.refresh(order)
    return order

@router.patch("/{order_id}/status", response_model=OrderResponse)
def change_order_status(
    order_id: int,
    status_data: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado.")

    new_status = status_data.status
    if new_status not in VALID_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Status inválido. Deve ser um de: {', '.join(VALID_STATUSES)}",
        )

    old_status = order.status
    order.status = new_status
    if new_status == "concluido" and not order.finished_at:
        order.finished_at = datetime.utcnow()

    history = OrderHistory(
        order_id=order.id,
        from_status=old_status,
        to_status=new_status,
        notes=status_data.notes or f"Fase alterada de {old_status} para {new_status}.",
        changed_by=current_user.name
    )
    db.add(history)
    db.commit()
    db.refresh(order)
    return order

@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado.")

    db.delete(order)
    db.commit()
    return None
