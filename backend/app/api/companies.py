from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.deps import get_current_user
from backend.app.models.models import Company, User, CompanyContact, Person
from backend.app.schemas.schemas import (
    CompanyCreate, CompanyUpdate, CompanyDetailResponse,
    CompanyContactCreate, CompanyContactUpdate, CompanyContactResponse
)

router = APIRouter(prefix="/companies", tags=["Empresas"])

@router.get("", response_model=List[CompanyDetailResponse])
def list_companies(
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Company)
    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            (Company.trade_name.ilike(search_fmt)) |
            (Company.corporate_name.ilike(search_fmt)) |
            (Company.cnpj.ilike(search_fmt)) |
            (Company.city.ilike(search_fmt))
        )
    if status_filter:
        query = query.filter(Company.status == status_filter)
    return query.order_by(Company.trade_name.asc()).all()

@router.post("", response_model=CompanyDetailResponse, status_code=status.HTTP_201_CREATED)
def create_company(
    data: CompanyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if data.cnpj:
        clean_cnpj = data.cnpj.strip()
        existing = db.query(Company).filter(Company.cnpj == clean_cnpj).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Já existe uma empresa cadastrada com este CNPJ."
            )
    company = Company(**data.model_dump())
    db.add(company)
    db.commit()
    db.refresh(company)
    return company

@router.get("/{company_id}", response_model=CompanyDetailResponse)
def get_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empresa não encontrada.")
    return company

@router.put("/{company_id}", response_model=CompanyDetailResponse)
def update_company(
    company_id: int,
    data: CompanyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empresa não encontrada.")

    update_data = data.model_dump(exclude_unset=True)
    if "cnpj" in update_data and update_data["cnpj"]:
        clean_cnpj = update_data["cnpj"].strip()
        existing = db.query(Company).filter(Company.cnpj == clean_cnpj, Company.id != company_id).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Outra empresa já possui este CNPJ cadastrado."
            )

    for field, value in update_data.items():
        setattr(company, field, value)

    db.commit()
    db.refresh(company)
    return company

@router.delete("/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empresa não encontrada.")
    db.delete(company)
    db.commit()
    return None

# Vínculo: Adicionar pessoa à empresa
@router.post("/{company_id}/contacts", response_model=CompanyContactResponse, status_code=status.HTTP_201_CREATED)
def add_contact_to_company(
    company_id: int,
    data: CompanyContactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empresa não encontrada.")
    person = db.query(Person).filter(Person.id == data.person_id).first()
    if not person:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pessoa não encontrada.")

    # Se já existir vínculo exato ativo entre a mesma pessoa e a empresa
    existing = db.query(CompanyContact).filter(
        CompanyContact.company_id == company_id,
        CompanyContact.person_id == data.person_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Esta pessoa já está vinculada a esta empresa."
        )

    contact = CompanyContact(
        company_id=company_id,
        person_id=data.person_id,
        role=data.role,
        department=data.department,
        is_primary=data.is_primary,
        start_date=data.start_date,
        end_date=data.end_date,
        notes=data.notes
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact
