from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.deps import get_current_user
from backend.app.models.models import User, Company, Person, CompanyContact, PipelineOpportunity

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/metrics")
def get_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_companies = db.query(Company).count()
    active_companies = db.query(Company).filter(Company.status == "Ativo").count()
    total_persons = db.query(Person).count()
    b2b_contacts = db.query(Person).filter(Person.type == "Contato Corporativo").count()
    b2c_customers = db.query(Person).filter(Person.type == "Consumidor Final").count()
    total_links = db.query(CompanyContact).count()
    total_users = db.query(User).count()

    # Oportunidades do funil
    total_opportunities = db.query(PipelineOpportunity).count()
    open_opportunities = db.query(PipelineOpportunity).filter(~PipelineOpportunity.stage.in_(["ganho", "perdido"])).count()
    won_opportunities = db.query(PipelineOpportunity).filter(PipelineOpportunity.stage == "ganho").count()
    
    # Soma de valores em negociação/aberto
    pipeline_total_value = sum(
        opp.value for opp in db.query(PipelineOpportunity).filter(~PipelineOpportunity.stage.in_(["perdido"])).all()
    )

    # Recentes
    recent_companies = db.query(Company).order_by(Company.created_at.desc()).limit(5).all()
    recent_persons = db.query(Person).order_by(Person.created_at.desc()).limit(5).all()
    recent_opportunities = db.query(PipelineOpportunity).order_by(PipelineOpportunity.created_at.desc()).limit(5).all()

    return {
        "total_companies": total_companies,
        "active_companies": active_companies,
        "total_persons": total_persons,
        "b2b_contacts": b2b_contacts,
        "b2c_customers": b2c_customers,
        "total_links": total_links,
        "total_users": total_users,
        "total_opportunities": total_opportunities,
        "open_opportunities": open_opportunities,
        "won_opportunities": won_opportunities,
        "pipeline_total_value": pipeline_total_value,
        "recent_companies": [
            {"id": c.id, "trade_name": c.trade_name, "city": c.city, "status": c.status}
            for c in recent_companies
        ],
        "recent_persons": [
            {"id": p.id, "name": p.name, "type": p.type, "phone": p.phone or p.whatsapp}
            for p in recent_persons
        ],
        "recent_opportunities": [
            {
                "id": o.id,
                "title": o.title,
                "stage": o.stage,
                "value": o.value,
                "contact_name": o.contact_name,
                "priority": o.priority
            }
            for o in recent_opportunities
        ]
    }
