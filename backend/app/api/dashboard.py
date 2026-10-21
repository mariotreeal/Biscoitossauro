from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.core.database import get_db
from backend.app.core.deps import get_current_user
from backend.app.models.models import User, Company, Person, CompanyContact, PipelineOpportunity, Order

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/metrics")
def get_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. CRM - Empresas e Pessoas
    total_companies = db.query(Company).count()
    active_companies = db.query(Company).filter(Company.status == "Ativo").count()
    total_persons = db.query(Person).count()
    b2b_contacts = db.query(Person).filter(Person.type == "Contato Corporativo").count()
    b2c_customers = db.query(Person).filter(Person.type == "Consumidor Final").count()
    total_links = db.query(CompanyContact).count()
    total_users = db.query(User).count()

    # 2. Funil Comercial (Pipeline)
    total_opportunities = db.query(PipelineOpportunity).count()
    open_opportunities = db.query(PipelineOpportunity).filter(~PipelineOpportunity.stage.in_(["ganho", "perdido"])).count()
    won_opportunities = db.query(PipelineOpportunity).filter(PipelineOpportunity.stage == "ganho").count()
    lost_opportunities = db.query(PipelineOpportunity).filter(PipelineOpportunity.stage == "perdido").count()

    # Valor total no pipeline (oportunidades ativas e ganhas)
    pipeline_total_value = sum(
        opp.value for opp in db.query(PipelineOpportunity).filter(~PipelineOpportunity.stage.in_(["perdido"])).all()
    )
    pipeline_won_value = sum(
        opp.value for opp in db.query(PipelineOpportunity).filter(PipelineOpportunity.stage == "ganho").all()
    )

    # Distribuição de oportunidades por estágio
    stages_order = ["novo_lead", "qualificacao", "gerar_proposta", "proposta_enviada", "negociacao", "ganho", "perdido"]
    opps_by_stage = {stage: 0 for stage in stages_order}
    stage_counts = db.query(PipelineOpportunity.stage, func.count(PipelineOpportunity.id)).group_by(PipelineOpportunity.stage).all()
    for stage, count in stage_counts:
        if stage in opps_by_stage:
            opps_by_stage[stage] = count

    # 3. Pedidos & Produção
    total_orders = db.query(Order).count()
    orders_active = db.query(Order).filter(~Order.status.in_(["concluido", "cancelado"])).count()
    orders_completed = db.query(Order).filter(Order.status == "concluido").count()
    
    # Biscoitos em produção / encomendados
    total_cookies_in_production = sum(
        o.quantity for o in db.query(Order).filter(~Order.status.in_(["concluido", "cancelado"])).all()
    )
    total_cookies_completed = sum(
        o.quantity for o in db.query(Order).filter(Order.status == "concluido").all()
    )

    # Faturamento de Pedidos
    orders_total_revenue = sum(
        o.total_value for o in db.query(Order).filter(Order.status != "cancelado").all()
    )
    orders_paid_revenue = sum(
        o.total_value for o in db.query(Order).filter(Order.payment_status == "Pago").all()
    )
    orders_pending_revenue = sum(
        o.total_value for o in db.query(Order).filter(Order.payment_status.in_(["Pendente", "Faturado"])).all()
    )

    # Distribuição de pedidos por status fabril
    order_statuses = ["aprovado", "provisao_recursos", "linha_producao", "embalagem", "entrega", "faturamento", "concluido"]
    orders_by_status = {st: 0 for st in order_statuses}
    order_counts = db.query(Order.status, func.count(Order.id)).group_by(Order.status).all()
    for st, count in order_counts:
        if st in orders_by_status:
            orders_by_status[st] = count

    # Pedidos urgentes ou de alta prioridade em andamento
    urgent_orders_count = db.query(Order).filter(
        Order.priority.in_(["Urgente", "Alta"]),
        ~Order.status.in_(["concluido", "cancelado"])
    ).count()

    # 4. Registros Recentes
    recent_companies = db.query(Company).order_by(Company.created_at.desc()).limit(5).all()
    recent_persons = db.query(Person).order_by(Person.created_at.desc()).limit(5).all()
    recent_opportunities = db.query(PipelineOpportunity).order_by(PipelineOpportunity.created_at.desc()).limit(5).all()
    recent_orders = db.query(Order).order_by(Order.created_at.desc()).limit(6).all()

    return {
        # CRM
        "total_companies": total_companies,
        "active_companies": active_companies,
        "total_persons": total_persons,
        "b2b_contacts": b2b_contacts,
        "b2c_customers": b2c_customers,
        "total_links": total_links,
        "total_users": total_users,

        # Pipeline
        "total_opportunities": total_opportunities,
        "open_opportunities": open_opportunities,
        "won_opportunities": won_opportunities,
        "lost_opportunities": lost_opportunities,
        "pipeline_total_value": pipeline_total_value,
        "pipeline_won_value": pipeline_won_value,
        "opps_by_stage": opps_by_stage,

        # Pedidos & Produção
        "total_orders": total_orders,
        "orders_active": orders_active,
        "orders_completed": orders_completed,
        "total_cookies_in_production": total_cookies_in_production,
        "total_cookies_completed": total_cookies_completed,
        "orders_total_revenue": orders_total_revenue,
        "orders_paid_revenue": orders_paid_revenue,
        "orders_pending_revenue": orders_pending_revenue,
        "orders_by_status": orders_by_status,
        "urgent_orders_count": urgent_orders_count,

        # Listas Recentes
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
        ],
        "recent_orders": [
            {
                "id": ord.id,
                "order_number": ord.order_number,
                "title": ord.title,
                "status": ord.status,
                "quantity": ord.quantity,
                "total_value": ord.total_value,
                "customer_type": ord.customer_type,
                "priority": ord.priority,
                "delivery_date": ord.delivery_date,
                "contact_name": ord.contact_name or (ord.company.trade_name if ord.company else (ord.person.name if ord.person else 'Cliente'))
            }
            for ord in recent_orders
        ]
    }
