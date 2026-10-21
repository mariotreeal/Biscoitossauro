from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user_name: str
    user_email: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# User Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Contact Link Schemas
class CompanyContactBase(BaseModel):
    role: Optional[str] = None
    department: Optional[str] = None
    is_primary: bool = False
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    notes: Optional[str] = None

class CompanyContactCreate(CompanyContactBase):
    person_id: int

class CompanyContactUpdate(CompanyContactBase):
    pass

# Nested representations
class PersonSummary(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    type: Optional[str] = None

    class Config:
        from_attributes = True

class CompanySummary(BaseModel):
    id: int
    trade_name: str
    corporate_name: Optional[str] = None
    cnpj: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    status: Optional[str] = None

    class Config:
        from_attributes = True

class CompanyContactResponse(CompanyContactBase):
    id: int
    company_id: int
    person_id: int
    person: Optional[PersonSummary] = None
    company: Optional[CompanySummary] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Company Schemas
class CompanyBase(BaseModel):
    trade_name: str
    corporate_name: Optional[str] = None
    cnpj: Optional[str] = None
    state_registration: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    website: Optional[str] = None
    zip_code: Optional[str] = None
    street: Optional[str] = None
    number: Optional[str] = None
    complement: Optional[str] = None
    neighborhood: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    segment: Optional[str] = None
    status: Optional[str] = "Ativo"
    notes: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    trade_name: Optional[str] = None
    corporate_name: Optional[str] = None
    cnpj: Optional[str] = None
    state_registration: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    website: Optional[str] = None
    zip_code: Optional[str] = None
    street: Optional[str] = None
    number: Optional[str] = None
    complement: Optional[str] = None
    neighborhood: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    segment: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class CompanyDetailResponse(CompanyBase):
    id: int
    created_at: datetime
    updated_at: datetime
    contacts: List[CompanyContactResponse] = []

    class Config:
        from_attributes = True

# Person Schemas
class PersonBase(BaseModel):
    name: str
    cpf: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    birth_date: Optional[str] = None
    type: Optional[str] = "Consumidor Final"
    zip_code: Optional[str] = None
    street: Optional[str] = None
    number: Optional[str] = None
    complement: Optional[str] = None
    neighborhood: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    notes: Optional[str] = None

class PersonCreate(PersonBase):
    # Opcional: já criar associando a uma empresa
    initial_company_id: Optional[int] = None
    initial_role: Optional[str] = None
    initial_department: Optional[str] = None

class PersonUpdate(BaseModel):
    name: Optional[str] = None
    cpf: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    birth_date: Optional[str] = None
    type: Optional[str] = None
    zip_code: Optional[str] = None
    street: Optional[str] = None
    number: Optional[str] = None
    complement: Optional[str] = None
    neighborhood: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    notes: Optional[str] = None

class PersonDetailResponse(PersonBase):
    id: int
    created_at: datetime
    updated_at: datetime
    companies: List[CompanyContactResponse] = []

    class Config:
        from_attributes = True

# CRM Interaction Schemas
class CRMInteractionBase(BaseModel):
    type: str = "Anotação"
    description: str
    contact_person: Optional[str] = None
    date: Optional[datetime] = None

class CRMInteractionCreate(CRMInteractionBase):
    pass

class CRMInteractionResponse(CRMInteractionBase):
    id: int
    entity_type: str
    entity_id: int
    created_by: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Funil Comercial / Pipeline Opportunity Schemas
class PipelineOpportunityBase(BaseModel):
    title: str
    description: Optional[str] = None
    stage: str = "novo lead"
    value: int = 0
    quantity: Optional[int] = None
    priority: str = "Média"
    customer_type: str = "B2B"
    company_id: Optional[int] = None
    person_id: Optional[int] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    source: Optional[str] = None
    expected_closing_date: Optional[str] = None
    event_date: Optional[str] = None
    loss_reason: Optional[str] = None
    assigned_to: Optional[str] = None
    order_index: int = 0

class PipelineOpportunityCreate(PipelineOpportunityBase):
    pass

class PipelineOpportunityUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    stage: Optional[str] = None
    value: Optional[int] = None
    quantity: Optional[int] = None
    priority: Optional[str] = None
    customer_type: Optional[str] = None
    company_id: Optional[int] = None
    person_id: Optional[int] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    source: Optional[str] = None
    expected_closing_date: Optional[str] = None
    event_date: Optional[str] = None
    loss_reason: Optional[str] = None
    assigned_to: Optional[str] = None
    order_index: Optional[int] = None

class PipelineOpportunityResponse(PipelineOpportunityBase):
    id: int
    created_at: datetime
    updated_at: datetime
    company: Optional[CompanySummary] = None
    person: Optional[PersonSummary] = None

    class Config:
        from_attributes = True

class OpportunityStageUpdate(BaseModel):
    stage: str
    order_index: Optional[int] = None
    loss_reason: Optional[str] = None


