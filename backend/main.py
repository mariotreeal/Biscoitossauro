from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.database import Base, engine, SessionLocal
from backend.app.core.security import get_password_hash
from backend.app.models.models import User
from backend.app.api import auth, users, companies, persons, dashboard, interactions, pipeline

# Cria as tabelas do banco de dados
Base.metadata.create_all(bind=engine)

def seed_initial_admin():
    db = SessionLocal()
    try:
        admin_email = "biscoitossauros@gmail.com"
        existing = db.query(User).filter(User.email == admin_email).first()
        if not existing:
            admin_user = User(
                name="Administrador Biscoitossauro",
                email=admin_email,
                hashed_password=get_password_hash("baronildo"),
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            print(f"[*] Usuário admin padrão criado: {admin_email}")
    finally:
        db.close()

seed_initial_admin()

app = FastAPI(
    title="Portal Biscoitossauro API",
    description="API do Portal Administrativo e CRM da Fábrica de Biscoitos Biscoitossauro",
    version="1.0.0"
)

# CORS liberado para frontend local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclui rotas
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(companies.router, prefix="/api")
app.include_router(persons.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(interactions.router, prefix="/api")
app.include_router(pipeline.router, prefix="/api")

@app.get("/api/health")
def health():
    return {"status": "ok", "app": "Biscoitossauro Admin API"}
