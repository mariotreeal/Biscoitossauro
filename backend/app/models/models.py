from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    trade_name = Column(String(200), nullable=False, index=True) # Nome Fantasia
    corporate_name = Column(String(200), nullable=True) # Razão Social
    cnpj = Column(String(20), unique=True, index=True, nullable=True)
    state_registration = Column(String(30), nullable=True) # Inscrição Estadual
    email = Column(String(150), nullable=True)
    phone = Column(String(30), nullable=True)
    whatsapp = Column(String(30), nullable=True)
    website = Column(String(200), nullable=True)
    
    # Endereço
    zip_code = Column(String(15), nullable=True) # CEP
    street = Column(String(200), nullable=True)
    number = Column(String(30), nullable=True)
    complement = Column(String(100), nullable=True)
    neighborhood = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(10), nullable=True)

    # CRM info
    segment = Column(String(100), nullable=True) # Ex: Brindes Corporativos, Eventos, Varejo
    status = Column(String(50), default="Ativo") # Lead, Em Negociação, Ativo, Inativo
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relação com Contatos/Pessoas
    contacts = relationship("CompanyContact", back_populates="company", cascade="all, delete-orphan")

class Person(Base):
    __tablename__ = "persons"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    cpf = Column(String(20), unique=True, index=True, nullable=True)
    email = Column(String(150), nullable=True, index=True)
    phone = Column(String(30), nullable=True)
    whatsapp = Column(String(30), nullable=True)
    birth_date = Column(String(20), nullable=True) # YYYY-MM-DD
    type = Column(String(50), default="Consumidor Final") # Consumidor Final, Contato Corporativo, Parceiro
    
    # Endereço
    zip_code = Column(String(15), nullable=True)
    street = Column(String(200), nullable=True)
    number = Column(String(30), nullable=True)
    complement = Column(String(100), nullable=True)
    neighborhood = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(10), nullable=True)

    # CRM info
    notes = Column(Text, nullable=True) # Gostos, sabores favoritos, restrições alimentares
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relação com Empresas
    companies = relationship("CompanyContact", back_populates="person", cascade="all, delete-orphan")

class CompanyContact(Base):
    __tablename__ = "company_contacts"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    person_id = Column(Integer, ForeignKey("persons.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(100), nullable=True) # Cargo / Função (ex: Comprador, Gerente de RH, Diretor)
    department = Column(String(100), nullable=True) # Departamento
    is_primary = Column(Boolean, default=False) # Contato Principal
    start_date = Column(String(20), nullable=True) # Início do vínculo
    end_date = Column(String(20), nullable=True) # Término (se houver histórico)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    company = relationship("Company", back_populates="contacts")
    person = relationship("Person", back_populates="companies")
