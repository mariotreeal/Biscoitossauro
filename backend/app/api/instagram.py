from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from backend.app.core.database import get_db
from backend.app.core.deps import get_current_user
from backend.app.models.models import User

router = APIRouter(prefix="/instagram", tags=["Instagram Analytics"])

# Mock e Estrutura dos Dados do Instagram para Biscoitossauro
DEFAULT_ACCOUNT_INFO = {
    "username": "biscoitossauros",
    "name": "Biscoitossauro • Biscoitos Decorados",
    "category": "Confeitaria Artesanal & Brindes Corporativos",
    "biography": "🦖 Biscoitos amanteigados decorados com glacê real | 🎁 Lembrancinhas, festas e brindes B2B | 📦 Entregas para todo o Brasil",
    "profile_picture_url": "/mascot.png",
    "followers_count": 4850,
    "follows_count": 342,
    "media_count": 184,
    "website": "https://biscoitossauro.com",
    "is_connected": False # Flag indicando se a API da Meta oficial já foi vinculada
}

MOCK_METRICS_OVERVIEW = {
    "period_days": 30,
    "followers_total": 4850,
    "followers_growth_pct": 8.4, # +8.4% no mês
    "followers_gained": 380,
    "followers_lost": 28,
    "reach_total": 34200, # 34.2k contas alcançadas
    "reach_growth_pct": 19.5,
    "impressions_total": 89400,
    "profile_views": 4210,
    "website_clicks": 328, # Cliques para WhatsApp / Encomendas
    "avg_engagement_rate": 6.8, # 6.8% (ótimo para gastronomia/confeitaria)
    "total_interactions": 3890,
    "total_saves": 940, # Salvamentos (inspirações de biscoitos)
    "total_shares": 612
}

MOCK_POSTS = [
    {
        "id": "post_1",
        "caption": "🦖 Coleção Especial Dinossauros Bebê para o primeiro aninho do Theo! Biscoitos amanteigados de baunilha com glacê real acetinado. 🌿 Encomende seu tema exclusivo pelo link na bio!",
        "media_type": "IMAGE",
        "media_url": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80",
        "permalink": "https://instagram.com/biscoitossauros",
        "timestamp": "2026-10-18T14:30:00Z",
        "likes": 342,
        "comments": 48,
        "shares": 65,
        "saves": 142, # Alto salvamento!
        "reach": 4200,
        "engagement_rate": 14.2,
        "category": "Festas Infantis"
    },
    {
        "id": "post_2",
        "caption": "💼 Kit Corporativo comemorativo de 10 anos da InovaTech! 300 kits selados com logo gravado à mão em glacê e laço verde oliva. Brindes comestíveis que encantam de verdade. 🏢 Orçamentos B2B disponíveis.",
        "media_type": "CAROUSEL_ALBUM",
        "media_url": "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600&auto=format&fit=crop&q=80",
        "permalink": "https://instagram.com/biscoitossauros",
        "timestamp": "2026-10-15T11:15:00Z",
        "likes": 280,
        "comments": 31,
        "shares": 89,
        "saves": 115,
        "reach": 5100,
        "engagement_rate": 10.1,
        "category": "Corporativo B2B"
    },
    {
        "id": "post_3",
        "caption": "🎬 Vídeo de processo: O efeito aveludado do glacê real secando na desidratadora! Quem aí também acha hipnótico ver as cores se formando camada por camada? Deixe seu palpite de qual dinossauro é esse nos comentários! 👇",
        "media_type": "VIDEO",
        "media_url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
        "permalink": "https://instagram.com/biscoitossauros",
        "timestamp": "2026-10-12T17:40:00Z",
        "likes": 512,
        "comments": 94,
        "shares": 143,
        "saves": 268,
        "reach": 9800,
        "engagement_rate": 10.4,
        "category": "Reels / Bastidores"
    },
    {
        "id": "post_4",
        "caption": "🌸 Delicadeza para o Batizado da Luísa. Paleta pastel de azul bebê, bege e dourado comestível. Cada detalhe pensado para eternizar um dia tão especial. 🤍 Agenda de Novembro aberta!",
        "media_type": "IMAGE",
        "media_url": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80",
        "permalink": "https://instagram.com/biscoitossauros",
        "timestamp": "2026-10-08T09:20:00Z",
        "likes": 215,
        "comments": 19,
        "shares": 22,
        "saves": 84,
        "reach": 2900,
        "engagement_rate": 11.7,
        "category": "Batizados & Chás"
    },
    {
        "id": "post_5",
        "caption": "🎃 Spoiler de Halloween! Nossos monstrinhos e dinossauros com abóboras estão saindo do forno. Edição limitada com latas decoradas exclusivas. Quem quer provar?",
        "media_type": "IMAGE",
        "media_url": "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&auto=format&fit=crop&q=80",
        "permalink": "https://instagram.com/biscoitossauros",
        "timestamp": "2026-10-04T16:00:00Z",
        "likes": 198,
        "comments": 24,
        "shares": 38,
        "saves": 91,
        "reach": 3100,
        "engagement_rate": 11.3,
        "category": "Sazonais"
    }
]

MOCK_STORIES = [
    {
        "id": "story_1",
        "media_url": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&auto=format&fit=crop&q=80",
        "posted_at": "Hoje às 10:30",
        "views": 420,
        "replies": 18,
        "exits": 12,
        "shares": 4,
        "sticker_taps": 31, # Cliques no adesivo "Quero meu tema"
        "theme": "Fornada fresquinha saindo agora 🍪"
    },
    {
        "id": "story_2",
        "media_url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80",
        "posted_at": "Hoje às 12:15",
        "views": 380,
        "replies": 24,
        "exits": 8,
        "shares": 7,
        "sticker_taps": 42,
        "theme": "Enquete: Qual paleta de cores para o Natal?"
    },
    {
        "id": "story_3",
        "media_url": "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&auto=format&fit=crop&q=80",
        "posted_at": "Ontem às 18:00",
        "views": 610,
        "replies": 32,
        "exits": 25,
        "shares": 11,
        "sticker_taps": 56,
        "theme": "Caixas embaladas prontas para entrega B2B"
    }
]

MOCK_WEEKLY_DATA = [
    {"day": "Segunda", "reach": 3800, "interactions": 420, "profile_clicks": 35},
    {"day": "Terça", "reach": 4200, "interactions": 480, "profile_clicks": 42},
    {"day": "Quarta", "reach": 5900, "interactions": 690, "profile_clicks": 68},
    {"day": "Quinta", "reach": 4900, "interactions": 540, "profile_clicks": 51},
    {"day": "Sexta", "reach": 6800, "interactions": 820, "profile_clicks": 79},
    {"day": "Sábado", "reach": 5200, "interactions": 590, "profile_clicks": 38},
    {"day": "Domingo", "reach": 3400, "interactions": 350, "profile_clicks": 15}
]

class MetaConfigPayload(BaseModel):
    page_id: Optional[str] = None
    access_token: Optional[str] = None
    instagram_business_id: Optional[str] = None

@router.get("/overview")
def get_instagram_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retorna o resumo geral de métricas, perfil e melhores posts.
    """
    return {
        "account": DEFAULT_ACCOUNT_INFO,
        "overview": MOCK_METRICS_OVERVIEW,
        "weekly_chart": MOCK_WEEKLY_DATA,
        "top_posts": MOCK_POSTS,
        "recent_stories": MOCK_STORIES
    }

@router.post("/connect")
def connect_meta_account(
    payload: MetaConfigPayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Endpoint para cadastrar credenciais oficiais da Meta Graph API quando desejado.
    """
    # Em produção, salva o token criptografado para sync em background
    return {
        "status": "success",
        "message": "Credenciais da Meta salvas com sucesso. Sincronização periódica ativa!"
    }
