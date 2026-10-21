from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.deps import get_current_user
from backend.app.models.models import PipelineOpportunity, User, Company, Person
from backend.app.schemas.schemas import (
    PipelineOpportunityCreate,
    PipelineOpportunityUpdate,
    PipelineOpportunityResponse,
    OpportunityStageUpdate,
)

router = APIRouter(prefix="/pipeline/opportunities", tags=["Funil Comercial"])

VALID_STAGES = [
    "novo lead",
    "qualificação",
    "gerar proposta",
    "proposta enviada",
    "negociação",
    "ganho",
    "perdido",
]

@router.get("", response_model=List[PipelineOpportunityResponse])
def list_opportunities(
    stage: Optional[str] = None,
    customer_type: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(PipelineOpportunity)

    if stage:
        query = query.filter(PipelineOpportunity.stage == stage)
    if customer_type:
        query = query.filter(PipelineOpportunity.customer_type == customer_type)
    if priority:
        query = query.filter(PipelineOpportunity.priority == priority)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (PipelineOpportunity.title.ilike(search_filter))
            | (PipelineOpportunity.description.ilike(search_filter))
            | (PipelineOpportunity.contact_name.ilike(search_filter))
        )

    # Ordena pelo order_index e depois data
    return query.order_by(PipelineOpportunity.order_index.asc(), PipelineOpportunity.created_at.desc()).all()

@router.post("", response_model=PipelineOpportunityResponse, status_code=status.HTTP_201_CREATED)
def create_opportunity(
    data: PipelineOpportunityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if data.stage not in VALID_STAGES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Estágio inválido. Deve ser um de: {', '.join(VALID_STAGES)}",
        )

    opp_data = data.model_dump()
    if not opp_data.get("assigned_to"):
        opp_data["assigned_to"] = current_user.name

    opp = PipelineOpportunity(**opp_data)
    db.add(opp)
    db.commit()
    db.refresh(opp)
    return opp

@router.get("/{opportunity_id}", response_model=PipelineOpportunityResponse)
def get_opportunity(
    opportunity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    opp = db.query(PipelineOpportunity).filter(PipelineOpportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Oportunidade não encontrada.")
    return opp

@router.put("/{opportunity_id}", response_model=PipelineOpportunityResponse)
def update_opportunity(
    opportunity_id: int,
    data: PipelineOpportunityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    opp = db.query(PipelineOpportunity).filter(PipelineOpportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Oportunidade não encontrada.")

    update_dict = data.model_dump(exclude_unset=True)
    if "stage" in update_dict and update_dict["stage"] not in VALID_STAGES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Estágio inválido. Deve ser um de: {', '.join(VALID_STAGES)}",
        )

    for field, val in update_dict.items():
        setattr(opp, field, val)

    db.commit()
    db.refresh(opp)
    return opp

@router.patch("/{opportunity_id}/stage", response_model=PipelineOpportunityResponse)
def update_stage(
    opportunity_id: int,
    data: OpportunityStageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    opp = db.query(PipelineOpportunity).filter(PipelineOpportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Oportunidade não encontrada.")

    if data.stage not in VALID_STAGES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Estágio inválido. Deve ser um de: {', '.join(VALID_STAGES)}",
        )

    opp.stage = data.stage
    if data.order_index is not None:
        opp.order_index = data.order_index
    if data.loss_reason is not None:
        opp.loss_reason = data.loss_reason

    db.commit()
    db.refresh(opp)
    return opp

@router.delete("/{opportunity_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_opportunity(
    opportunity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    opp = db.query(PipelineOpportunity).filter(PipelineOpportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Oportunidade não encontrada.")

    db.delete(opp)
    db.commit()
    return None
