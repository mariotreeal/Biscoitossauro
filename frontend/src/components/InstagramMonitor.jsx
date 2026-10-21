import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Share2, 
  Eye, 
  ExternalLink, 
  Sparkles, 
  BarChart3, 
  Calendar, 
  ArrowUpRight, 
  Filter, 
  RefreshCw,
  Sliders,
  CheckCircle2,
  Clock,
  Video,
  Image as ImageIcon,
  Layers,
  HelpCircle
} from 'lucide-react';
import InstagramIcon from './InstagramIcon';
import api from '../services/api';

export default function InstagramMonitor() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'stories', 'connect'
  const [postFilter, setPostFilter] = useState('all'); // 'all', 'saves', 'engagement', 'reach'

  const fetchInstagramData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/instagram/overview');
      setData(res.data);
    } catch (err) {
      console.error('Erro ao carregar dados do Instagram:', err);
      setError('Não foi possível carregar as métricas do Instagram.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstagramData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-10 h-10 border-3 border-[#e1306c] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-semibold text-[#715b41]">Carregando métricas do Instagram @biscoitossauros...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-red-200 text-red-600">
        <p className="font-semibold">{error || 'Dados indisponíveis'}</p>
        <button 
          onClick={fetchInstagramData}
          className="mt-4 px-4 py-2 bg-[#855300] text-white rounded-xl text-xs font-bold"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  const { account, overview, weekly_chart, top_posts, recent_stories } = data;

  // Filtro de ordenação dos posts
  const filteredPosts = [...top_posts].sort((a, b) => {
    if (postFilter === 'saves') return b.saves - a.saves;
    if (postFilter === 'engagement') return b.engagement_rate - a.engagement_rate;
    if (postFilter === 'reach') return b.reach - a.reach;
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Hero Card com Identidade Instagram */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#833ab4]/15 via-[#fd1d1d]/10 to-[#fcb045]/20 p-6 sm:p-8 border border-[#d4c3b5] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-[3px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shadow-md flex-shrink-0">
                <img 
                  src={account.profile_picture_url || '/mascot.png'} 
                  alt="Perfil" 
                  className="w-full h-full rounded-full object-cover bg-white p-1"
                />
              </div>
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-[#496636] border-2 border-white rounded-full flex items-center justify-center text-white text-[10px]" title="Conta Ativa">
                ✓
              </span>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/80 border border-[#d4c3b5] text-xs font-bold text-[#855300] mb-1.5">
                <InstagramIcon className="w-3.5 h-3.5 text-[#e1306c]" />
                @{account.username}
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#211a14] tracking-tight">
                {account.name}
              </h1>
              <p className="text-xs text-[#50453a] max-w-xl mt-1 leading-relaxed">
                {account.biography}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs font-semibold text-[#715b41]">
                <span><strong>{account.media_count}</strong> publicações</span>
                <span><strong>{account.followers_count.toLocaleString('pt-BR')}</strong> seguidores</span>
                <span><strong>{account.follows_count}</strong> seguindo</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start md:self-center">
            <a 
              href={`https://instagram.com/${account.username}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#833ab4] to-[#fd1d1d] text-white text-xs font-bold hover:opacity-90 shadow-sm transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Abrir no Instagram
            </a>
            <button 
              onClick={fetchInstagramData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-[#d4c3b5] text-[#211a14] text-xs font-bold hover:bg-[#fff8f4] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#715b41]" /> Atualizar
            </button>
          </div>
        </div>
      </div>

      {/* 2. Grid de Indicadores Principais (KPIs dos últimos 30 dias) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Alcance Total */}
        <div className="bg-white rounded-3xl p-5 border border-[#d4c3b5] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#715b41]">Alcance Mensal</span>
            <div className="w-10 h-10 rounded-2xl bg-[#ffddb8] flex items-center justify-center text-[#855300]">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#211a14]">
              {overview.reach_total.toLocaleString('pt-BR')}
            </div>
            <div className="text-xs text-[#496636] mt-1 flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{overview.reach_growth_pct}% vs mês anterior</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Salvamentos (Inspiração de Festas/Eventos) */}
        <div className="bg-white rounded-3xl p-5 border border-[#d4c3b5] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#715b41]">Biscoitos Salvos (Saves)</span>
            <div className="w-10 h-10 rounded-2xl bg-[#feddbd] flex items-center justify-center text-[#9c4300]">
              <Bookmark className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#211a14]">
              {overview.total_saves.toLocaleString('pt-BR')}
            </div>
            <div className="text-xs text-[#715b41] mt-1 font-medium">
              Clientes salvando modelos para inspiração
            </div>
          </div>
        </div>

        {/* KPI 3: Taxa de Engajamento */}
        <div className="bg-white rounded-3xl p-5 border border-[#d4c3b5] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#715b41]">Taxa de Engajamento</span>
            <div className="w-10 h-10 rounded-2xl bg-[#caeca0] flex items-center justify-center text-[#496636]">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#211a14]">
              {overview.avg_engagement_rate}%
            </div>
            <div className="text-xs text-[#496636] mt-1 font-semibold">
              Excelente (Média confeitaria: 3.5% a 5%)
            </div>
          </div>
        </div>

        {/* KPI 4: Cliques para Encomendas (Bio / WhatsApp) */}
        <div className="bg-white rounded-3xl p-5 border border-[#d4c3b5] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#715b41]">Cliques para Encomendas</span>
            <div className="w-10 h-10 rounded-2xl bg-[#e0e2ec] flex items-center justify-center text-[#43474e]">
              <ExternalLink className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#211a14]">
              {overview.website_clicks}
            </div>
            <div className="text-xs text-[#715b41] mt-1 font-medium">
              Visitantes direcionados ao WhatsApp/Site
            </div>
          </div>
        </div>
      </div>

      {/* 3. Desempenho Semanal (Alcance por Dia da Semana) */}
      <div className="bg-white rounded-3xl p-6 border border-[#d4c3b5] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#855300]" />
              <h3 className="font-bold text-[#211a14] text-base">Ritmo Semanal de Audiência & Melhores Dias</h3>
            </div>
            <p className="text-xs text-[#715b41] mt-0.5">
              Identifique os dias de maior engajamento para agendar postagens de coleções e lançamentos de biscoitos.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f7ede5] text-xs font-semibold text-[#855300]">
            <Clock className="w-3.5 h-3.5" /> Melhor horário: 11h30 e 18h00
          </div>
        </div>

        {/* Gráfico de barras simples em CSS puro */}
        <div className="grid grid-cols-7 gap-2 pt-4">
          {weekly_chart.map((dayData, idx) => {
            const maxReach = Math.max(...weekly_chart.map(d => d.reach));
            const pct = Math.round((dayData.reach / maxReach) * 100);
            const isBest = dayData.reach === maxReach;

            return (
              <div key={idx} className="flex flex-col items-center gap-2 text-center">
                <span className="text-[11px] font-bold text-[#211a14]">{dayData.reach.toLocaleString('pt-BR')}</span>
                <div className="w-full bg-[#f7ede5] rounded-xl h-28 flex items-end p-1">
                  <div 
                    className={`w-full rounded-lg transition-all duration-500 ${
                      isBest 
                        ? 'bg-gradient-to-t from-[#855300] to-[#e0a050]' 
                        : 'bg-gradient-to-t from-[#caeca0] to-[#b3de80]'
                    }`}
                    style={{ height: `${pct}%` }}
                    title={`${dayData.day}: ${dayData.reach} alcance, ${dayData.interactions} interações`}
                  />
                </div>
                <span className={`text-xs font-medium ${isBest ? 'font-bold text-[#855300]' : 'text-[#715b41]'}`}>
                  {dayData.day.slice(0, 3)}
                </span>
                <span className="text-[10px] text-[#715b41]">
                  {dayData.profile_clicks} cliques
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Abas de Conteúdo: Posts do Feed vs. Stories das 24h vs. Conexão Meta */}
      <div className="flex border-b border-[#d4c3b5] gap-4">
        <button
          onClick={() => setActiveTab('posts')}
          className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'posts'
              ? 'border-[#855300] text-[#855300]'
              : 'border-transparent text-[#715b41] hover:text-[#211a14]'
          }`}
        >
          <ImageIcon className="w-4 h-4" /> Desempenho do Feed & Reels ({top_posts.length})
        </button>

        <button
          onClick={() => setActiveTab('stories')}
          className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'stories'
              ? 'border-[#855300] text-[#855300]'
              : 'border-transparent text-[#715b41] hover:text-[#211a14]'
          }`}
        >
          <Layers className="w-4 h-4" /> Stories Recentes ({recent_stories.length})
        </button>

        <button
          onClick={() => setActiveTab('connect')}
          className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'connect'
              ? 'border-[#855300] text-[#855300]'
              : 'border-transparent text-[#715b41] hover:text-[#211a14]'
          }`}
        >
          <Sliders className="w-4 h-4" /> Configuração da Meta API
        </button>
      </div>

      {/* Aba 1: Feed & Reels */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#d4c3b5]">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#715b41]" />
              <span className="text-xs font-bold text-[#211a14]">Classificar posts por:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'Mais Recentes' },
                { id: 'saves', label: 'Mais Salvos (Inspiração)' },
                { id: 'engagement', label: 'Maior Engajamento %' },
                { id: 'reach', label: 'Maior Alcance' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setPostFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    postFilter === f.id
                      ? 'bg-[#855300] text-white shadow-xs'
                      : 'bg-[#f7ede5] text-[#50453a] hover:bg-[#edd9c9]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Cards de Posts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <div 
                key={post.id}
                className="bg-white rounded-3xl overflow-hidden border border-[#d4c3b5] shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Imagem do Biscoito */}
                  <div className="relative aspect-square overflow-hidden bg-slate-100 group">
                    <img 
                      src={post.media_url} 
                      alt="Biscoito post" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold">
                        {post.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      {post.media_type === 'VIDEO' ? (
                        <span className="p-1.5 rounded-full bg-black/60 text-white inline-block">
                          <Video className="w-3.5 h-3.5" />
                        </span>
                      ) : post.media_type === 'CAROUSEL_ALBUM' ? (
                        <span className="p-1.5 rounded-full bg-black/60 text-white inline-block">
                          <Layers className="w-3.5 h-3.5" />
                        </span>
                      ) : null}
                    </div>

                    {/* Badge de Engajamento sobreposto */}
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-[#855300] text-xs font-extrabold shadow-sm">
                      {post.engagement_rate}% engajamento
                    </div>
                  </div>

                  {/* Legenda e Métricas */}
                  <div className="p-5">
                    <p className="text-xs text-[#211a14] line-clamp-3 leading-relaxed mb-4">
                      {post.caption}
                    </p>

                    {/* Grid com as métricas detalhadas */}
                    <div className="grid grid-cols-4 gap-2 py-3 border-y border-[#f7ede5] text-center">
                      <div>
                        <div className="flex items-center justify-center gap-1 text-[#e1306c]">
                          <Heart className="w-3.5 h-3.5 fill-current" />
                          <span className="text-xs font-bold">{post.likes}</span>
                        </div>
                        <span className="text-[10px] text-[#715b41]">Curtidas</span>
                      </div>

                      <div>
                        <div className="flex items-center justify-center gap-1 text-[#715b41]">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold">{post.comments}</span>
                        </div>
                        <span className="text-[10px] text-[#715b41]">Comentários</span>
                      </div>

                      <div className="bg-[#fff4e6] rounded-lg py-0.5">
                        <div className="flex items-center justify-center gap-1 text-[#9c4300]">
                          <Bookmark className="w-3.5 h-3.5 fill-current" />
                          <span className="text-xs font-bold">{post.saves}</span>
                        </div>
                        <span className="text-[10px] font-bold text-[#9c4300]">Salvos</span>
                      </div>

                      <div>
                        <div className="flex items-center justify-center gap-1 text-[#715b41]">
                          <Share2 className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold">{post.shares}</span>
                        </div>
                        <span className="text-[10px] text-[#715b41]">Envios</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer do Card com Alcance */}
                <div className="px-5 pb-5 pt-0 flex items-center justify-between text-xs text-[#715b41]">
                  <span>Alcance: <strong>{post.reach.toLocaleString('pt-BR')} pessoas</strong></span>
                  <a 
                    href={post.permalink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-bold text-[#855300] hover:underline flex items-center gap-1"
                  >
                    Ver Post <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aba 2: Stories */}
      {activeTab === 'stories' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#fff8f4] border border-[#d4c3b5] rounded-2xl flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[#855300] flex-shrink-0" />
            <p className="text-xs text-[#50453a]">
              Os Stories são o canal direto mais eficiente para gerar conversas no WhatsApp e direct. Respostas aos stories indicam intenção imediata de compra!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recent_stories.map((story) => (
              <div 
                key={story.id} 
                className="bg-white rounded-3xl overflow-hidden border border-[#d4c3b5] p-5 shadow-xs"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#855300]">{story.posted_at}</span>
                  <span className="text-xs bg-[#caeca0] text-[#0b2000] px-2.5 py-0.5 rounded-full font-semibold">
                    {story.views} visualizações
                  </span>
                </div>

                <div className="aspect-[9/14] rounded-2xl overflow-hidden bg-slate-100 relative mb-4">
                  <img 
                    src={story.media_url} 
                    alt="Story" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white text-xs font-semibold">
                    {story.theme}
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#f7ede5]">
                    <span className="text-[#715b41]">Respostas diretas (DMs):</span>
                    <strong className="text-emerald-700 font-bold">{story.replies} leads</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#f7ede5]">
                    <span className="text-[#715b41]">Toques em adesivos / links:</span>
                    <strong className="text-[#855300] font-bold">{story.sticker_taps} cliques</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#715b41]">Compartilhamentos:</span>
                    <strong>{story.shares} vezes</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aba 3: Conexão Oficial Meta Graph API */}
      {activeTab === 'connect' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#d4c3b5] shadow-sm max-w-3xl space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <InstagramIcon className="w-5 h-5 text-[#e1306c]" />
              <h3 className="font-bold text-[#211a14] text-lg">Vincular Conta Oficial do Instagram (Meta Graph API)</h3>
            </div>
            <p className="text-xs text-[#715b41] mt-1 leading-relaxed">
              O portal já está preparado para receber as credenciais oficiais da Meta para sincronizar automaticamente seguidores, impressões e interações sem precisar consultar o aplicativo.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#fff8f4] border border-[#ffddb8] space-y-2 text-xs text-[#50453a]">
            <p className="font-bold text-[#855300] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Pré-requisitos para obter o Token da Meta:
            </p>
            <ol className="list-decimal list-inside space-y-1 pl-1">
              <li>A conta <strong>@biscoitossauros</strong> precisa ser uma conta Profissional (Comercial ou Criador de Conteúdo).</li>
              <li>A conta deve estar vinculada a uma Página do Facebook da Biscoitossauro.</li>
              <li>No portal <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="text-[#855300] font-bold underline">Meta for Developers</a>, crie um App do tipo "Business" e adicione o produto "Instagram Graph API".</li>
            </ol>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); alert('Configurações salvas!'); }} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#211a14] uppercase mb-1">
                Instagram Business Account ID
              </label>
              <input 
                type="text" 
                placeholder="Ex: 17841405822384..." 
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d4c3b5] text-sm focus:outline-none focus:ring-2 focus:ring-[#855300]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#211a14] uppercase mb-1">
                Token de Acesso de Longa Duração (Long-Lived Page Access Token)
              </label>
              <textarea 
                rows={3}
                placeholder="Cole aqui o token gerado pelo Meta Graph API Explorer..." 
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d4c3b5] text-sm focus:outline-none focus:ring-2 focus:ring-[#855300] font-mono text-xs"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button 
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#855300] text-white text-xs font-bold hover:bg-[#6c4300] shadow-sm transition-colors"
              >
                Salvar Credenciais da Meta
              </button>
              <span className="text-xs text-[#715b41]">
                Os dados atuais exibidos no painel já utilizam as métricas de demonstração da confeitaria.
              </span>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
