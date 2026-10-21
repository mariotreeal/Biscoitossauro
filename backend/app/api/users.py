from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.security import get_password_hash
from backend.app.core.deps import get_current_user
from backend.app.models.models import User
from backend.app.schemas.schemas import UserCreate, UserUpdate, UserResponse

router = APIRouter(prefix="/users", tags=["Usuários"])

@router.get("", response_model=List[UserResponse])
def list_users(
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(User)
    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter((User.name.ilike(search_fmt)) | (User.email.ilike(search_fmt)))
    return query.order_by(User.name.asc()).all()

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(User).filter(User.email == data.email.lower().strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um usuário cadastrado com este e-mail."
        )
    user = User(
        name=data.name.strip(),
        email=data.email.lower().strip(),
        hashed_password=get_password_hash(data.password),
        is_active=data.is_active
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado.")
    return user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado.")
    
    if data.email and data.email.lower().strip() != user.email:
        existing = db.query(User).filter(User.email == data.email.lower().strip()).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Outro usuário já está utilizando este e-mail."
            )
        user.email = data.email.lower().strip()

    if data.name is not None:
        user.name = data.name.strip()
    if data.password:
        user.hashed_password = get_password_hash(data.password)
    if data.is_active is not None:
        user.is_active = data.is_active

    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado.")
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você não pode excluir seu próprio usuário logado."
        )
    db.delete(user)
    db.commit()
    return None
