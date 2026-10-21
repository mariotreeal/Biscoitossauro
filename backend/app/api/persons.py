from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.deps import get_current_user
from backend.app.models.models import Person, User, CompanyContact, Company
from backend.app.schemas.schemas import (
    PersonCreate, PersonUpdate, PersonDetailResponse,
    CompanyContactUpdate, CompanyContactResponse
)

router = APIRouter(prefix="/persons", tags=["Pessoas"])

@router.get("", response_model=List[PersonDetailResponse])
def list_persons(
    search: Optional[str] = Query(None),
    type_filter: Optional[str] = Query(None, alias="type"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Person)
    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            (Person.name.ilike(search_fmt)) |
            (Person.email.ilike(search_fmt)) |
            (Person.cpf.ilike(search_fmt)) |
            (Person.phone.ilike(search_fmt)) |
            (Person.city.ilike(search_fmt))
        )
    if type_filter:
        query = query.filter(Person.type == type_filter)
    return query.order_by(Person.name.asc()).all()

@router.post("", response_model=PersonDetailResponse, status_code=status.HTTP_201_CREATED)
def create_person(
    data: PersonCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if data.cpf:
        clean_cpf = data.cpf.strip()
        existing = db.query(Person).filter(Person.cpf == clean_cpf).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Já existe uma pessoa cadastrada com este CPF."
            )

    person_data = data.model_dump(exclude={"initial_company_id", "initial_role", "initial_department"})
    person = Person(**person_data)
    db.add(person)
    db.commit()
    db.refresh(person)

    # Se informado initial_company_id, já cria o vínculo com a empresa
    if data.initial_company_id:
        company = db.query(Company).filter(Company.id == data.initial_company_id).first()
        if company:
            contact = CompanyContact(
                company_id=company.id,
                person_id=person.id,
                role=data.initial_role,
                department=data.initial_department
            )
            db.add(contact)
            db.commit()
            db.refresh(person)

    return person

@router.get("/{person_id}", response_model=PersonDetailResponse)
def get_person(
    person_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    person = db.query(Person).filter(Person.id == person_id).first()
    if not person:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pessoa não encontrada.")
    return person

@router.put("/{person_id}", response_model=PersonDetailResponse)
def update_person(
    person_id: int,
    data: PersonUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    person = db.query(Person).filter(Person.id == person_id).first()
    if not person:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pessoa não encontrada.")

    update_data = data.model_dump(exclude_unset=True)
    if "cpf" in update_data and update_data["cpf"]:
        clean_cpf = update_data["cpf"].strip()
        existing = db.query(Person).filter(Person.cpf == clean_cpf, Person.id != person_id).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Outra pessoa já possui este CPF cadastrado."
            )

    for field, value in update_data.items():
        setattr(person, field, value)

    db.commit()
    db.refresh(person)
    return person

@router.delete("/{person_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_person(
    person_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    person = db.query(Person).filter(Person.id == person_id).first()
    if not person:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pessoa não encontrada.")
    db.delete(person)
    db.commit()
    return None

# Rotas de gerenciamento de contatos/vínculos (CompanyContact)
@router.put("/contacts/{contact_id}", response_model=CompanyContactResponse)
def update_contact_role(
    contact_id: int,
    data: CompanyContactUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contact = db.query(CompanyContact).filter(CompanyContact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vínculo não encontrado.")
    
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(contact, field, value)

    db.commit()
    db.refresh(contact)
    return contact

@router.delete("/contacts/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contact = db.query(CompanyContact).filter(CompanyContact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vínculo não encontrado.")
    db.delete(contact)
    db.commit()
    return None
