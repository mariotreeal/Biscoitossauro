from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.deps import get_current_user
from backend.app.models.models import CRMInteraction, Company, Person, User
from backend.app.schemas.schemas import CRMInteractionCreate, CRMInteractionResponse

router = APIRouter(prefix="/crm/interactions", tags=["CRM Interações"])

@router.get("/{entity_type}/{entity_id}", response_model=List[CRMInteractionResponse])
def list_interactions(
    entity_type: str,
    entity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if entity_type not in ["company", "person"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Entidade inválida.")
    
    interactions = db.query(CRMInteraction).filter(
        CRMInteraction.entity_type == entity_type,
        CRMInteraction.entity_id == entity_id
    ).order_by(CRMInteraction.date.desc(), CRMInteraction.created_at.desc()).all()
    
    return interactions

@router.post("/{entity_type}/{entity_id}", response_model=CRMInteractionResponse, status_code=status.HTTP_201_CREATED)
def create_interaction(
    entity_type: str,
    entity_id: int,
    data: CRMInteractionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if entity_type not in ["company", "person"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Entidade inválida.")

    if entity_type == "company":
        exists = db.query(Company).filter(Company.id == entity_id).first()
    else:
        exists = db.query(Person).filter(Person.id == entity_id).first()

    if not exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro não encontrado.")

    interaction = CRMInteraction(
        entity_type=entity_type,
        entity_id=entity_id,
        type=data.type,
        description=data.description,
        contact_person=data.contact_person,
        date=data.date or datetime.utcnow(),
        created_by=current_user.name
    )
    db.add(interaction)
    db.commit()
    db.refresh(interaction)
    return interaction

@router.delete("/{interaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_interaction(
    interaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    interaction = db.query(CRMInteraction).filter(CRMInteraction.id == interaction_id).first()
    if not interaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interação não encontrada.")
    db.delete(interaction)
    db.commit()
    return None
