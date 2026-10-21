import React from 'react';
import { 
  Building2, 
  Users, 
  Briefcase, 
  TrendingUp, 
  ArrowUpRight,
  Sparkles,
  Kanban,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Cookie,
  DollarSign,
  Layers,
  ChevronRight,
  Truck,
  Box,
  Flame,
  FileCheck
} from 'lucide-react';
import InstagramIcon from './InstagramIcon';

export default function Dashboard({ metrics, onNavigate }) {
  // Formatadores
  const formatCurrency = (val) => {
    return ((val || 0) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Nomes amigáveis e cores para estágios do funil comercial
  const stageLabels = {
    novo_lead: 'Novo Lead',
    qualificacao: 'Qualificação',
    gerar_proposta: 'Gerar Proposta',
    proposta_enviada: 'Proposta Enviada',
    negociacao: 'Negociação',
    ganho: 'Ganho',
    perdido: 'Perdido'
  };

  // Nomes amigáveis e cores para status do pedido de produção
  const orderStatusConfig = {
    aprovado: { label: 'Aprovado', icon: FileCheck, color: 'text-amber-700 bg-amber-50 border-amber-200' },
    provisao_recursos: { label: 'Recursos', icon: Box, color: 'text-orange-700 bg-orange-50 border-orange-200' },
    linha_producao: { label: 'Produção', icon: Flame, color: 'text-rose-700 bg-rose-50 border-rose-200' },
    embalagem: { label: 'Embalagem', icon: Layers, color: 'text-purple-700 bg-purple-50 border-purple-200' },
    entrega: { label: 'Entrega', icon: Truck, color: 'text-blue-700 bg-blue-50 border-blue-200' },
    faturamento: { label: 'Faturamento', icon: DollarSign, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    concluido: { label: 'Concluído', icon: CheckCircle2, color: 'text-teal-700 bg-teal-50 border-teal-200' }
  };

  const priorityColors = {
    'Baixa': 'bg-slate-100 text-slate-700',
    'Média': 'bg-blue-100 text-blue-800',
    'Alta': 'bg-orange-100 text-orange-800',
    'Urgente': 'bg-red-100 text-red-800 font-bold animate-pulse'
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Hero Banner Material 3 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#ffddb8] via-[#f7ede5] to-[#caeca0]/40 p-6 sm:p-8 border border-[#d4c3b5] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#855300]/10 text-[#855300] text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Painel Estratégico & Operacional
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#211a14] tracking-tight">
              Visão Geral do Biscoitossauro
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[#50453a] leading-relaxed">
              Monitore o funil de vendas corporativo, pedidos em forno e confeitagem, clientes B2B/B2C e metas financeiras em tempo real.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <button 
                onClick={() => onNavigate('orders')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#855300] text-white text-xs font-bold hover:bg-[#6c4300] transition-colors shadow-sm"
              >
                <ShoppingBag className="w-4 h-4" /> Módulo de Pedidos
              </button>
              <button 
                onClick={() => onNavigate('pipeline')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#50453a] text-white text-xs font-bold hover:bg-[#382f25] transition-colors shadow-sm"
              >
                <Kanban className="w-4 h-4" /> Funil Comercial
              </button>
              <button 
                onClick={() => onNavigate('instagram')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#833ab4] to-[#fd1d1d] text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-sm"
              >
                <InstagramIcon className="w-4 h-4" /> Instagram Analytics
              </button>
              <button 
                onClick={() => onNavigate('companies')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-[#d4c3b5] text-[#211a14] text-xs font-bold hover:bg-[#fff8f4] transition-colors"
              >
                <Building2 className="w-4 h-4 text-[#855300]" /> Empresas
              </button>
              <button 
                onClick={() => onNavigate('persons')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-[#d4c3b5] text-[#211a14] text-xs font-bold hover:bg-[#fff8f4] transition-colors"
              >
                <Users className="w-4 h-4 text-[#496636]" /> Pessoas
              </button>
            </div>
          </div>

          {/* Logo Oficial sem molduras */}
          <div className="hidden sm:flex items-center justify-center flex-shrink-0">
            <img 
              src="/logo.png" 
              alt="Logo Biscoitossauro" 
              className="w-40 h-40 md:w-52 md:h-52 object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </div>

      {/* 2. Principais Indicadores Globais (KPI Cards Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pedidos em Andamento */}
        <div 
          onClick={() => onNavigate('orders')}
          className="cursor-pointer bg-white rounded-3xl p-5 border border-[#d4c3b5] hover:border-[#855300] transition-all hover:shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#715b41]">Pedidos em Produção</span>
            <div className="w-10 h-10 rounded-2xl bg-[#ffddb8] flex items-center justify-center text-[#855300] group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#211a14] flex items-baseline gap-2">
              {metrics?.orders_active ?? 0}
              <span className="text-xs font-normal text-[#715b41]">pedidos ativos</span>
            </div>
            <div className="text-xs text-[#715b41] mt-1 flex items-center gap-1 font-medium">
              <span>{metrics?.orders_completed ?? 0} já entregues • {metrics?.urgent_orders_count ?? 0} urgentes</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-auto text-[#855300]" />
            </div>
          </div>
        </div>

        {/* Card 2: Biscoitos Encomendados */}
        <div 
          onClick={() => onNavigate('orders')}
          className="cursor-pointer bg-white rounded-3xl p-5 border border-[#d4c3b5] hover:border-[#855300] transition-all hover:shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#715b41]">Volume de Biscoitos</span>
            <div className="w-10 h-10 rounded-2xl bg-[#feddbd] flex items-center justify-center text-[#9c4300] group-hover:scale-110 transition-transform">
              <Cookie className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#211a14] flex items-baseline gap-2">
              {(metrics?.total_cookies_in_production ?? 0).toLocaleString('pt-BR')}
              <span className="text-xs font-normal text-[#715b41]">unidades</span>
            </div>
            <div className="text-xs text-[#715b41] mt-1 flex items-center gap-1 font-medium">
              <span>Produção ativa e encomendas confirmadas</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-auto text-[#9c4300]" />
            </div>
          </div>
        </div>

        {/* Card 3: Pipeline Comercial */}
        <div 
          onClick={() => onNavigate('pipeline')}
          className="cursor-pointer bg-white rounded-3xl p-5 border border-[#d4c3b5] hover:border-[#855300] transition-all hover:shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#715b41]">Funil Comercial</span>
            <div className="w-10 h-10 rounded-2xl bg-[#caeca0] flex items-center justify-center text-[#496636] group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#211a14]">
              {formatCurrency(metrics?.pipeline_total_value)}
            </div>
            <div className="text-xs text-[#715b41] mt-1 flex items-center gap-1 font-medium">
              <span>{metrics?.open_opportunities ?? 0} em negociação • {metrics?.won_opportunities ?? 0} ganhos</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-auto text-[#496636]" />
            </div>
          </div>
        </div>

        {/* Card 4: Base Cadastrada (CRM) */}
        <div 
          onClick={() => onNavigate('companies')}
          className="cursor-pointer bg-white rounded-3xl p-5 border border-[#d4c3b5] hover:border-[#855300] transition-all hover:shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#715b41]">Base CRM (B2B/B2C)</span>
            <div className="w-10 h-10 rounded-2xl bg-[#e0e2ec] flex items-center justify-center text-[#43474e] group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#211a14]">
              {metrics?.total_companies ?? 0}
            </div>
            <div className="text-xs text-[#715b41] mt-1 flex items-center gap-1 font-medium">
              <span>{metrics?.active_companies ?? 0} empresas • {metrics?.total_persons ?? 0} pessoas</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-auto text-[#43474e]" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Seção Intermediária: Pipeline de Produção & Funil de Vendas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Painel: Fluxo da Linha de Produção */}
        <div className="bg-white rounded-3xl p-6 border border-[#d4c3b5] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#855300]" />
                <h3 className="font-bold text-[#211a14] text-base">Fases da Linha de Produção</h3>
              </div>
              <button 
                onClick={() => onNavigate('orders')}
                className="text-xs font-semibold text-[#855300] hover:underline flex items-center gap-1"
              >
                Gerenciar Pedidos <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-[#715b41] mb-5">
              Distribuição de pedidos por estágio de fabricação e logística:
            </p>

            {/* Grid dos status de produção */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {Object.entries(orderStatusConfig).map(([statusKey, cfg]) => {
                const count = metrics?.orders_by_status?.[statusKey] ?? 0;
                const IconComponent = cfg.icon;
                return (
                  <div 
                    key={statusKey}
                    onClick={() => onNavigate('orders')}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer hover:shadow-sm ${cfg.color}`}
                  >
                    <div className="flex items-center justify-between">
                      <IconComponent className="w-4 h-4 opacity-80" />
                      <span className="text-lg font-extrabold">{count}</span>
                    </div>
                    <p className="text-xs font-semibold mt-1 tracking-tight truncate">{cfg.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#f7ede5] flex items-center justify-between text-xs text-[#715b41]">
            <span>Receita faturada de pedidos: <strong>{formatCurrency(metrics?.orders_total_revenue)}</strong></span>
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {formatCurrency(metrics?.orders_paid_revenue)} recebido
            </span>
          </div>
        </div>

        {/* Painel: Funil Comercial por Estágios */}
        <div className="bg-white rounded-3xl p-6 border border-[#d4c3b5] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Kanban className="w-5 h-5 text-[#855300]" />
                <h3 className="font-bold text-[#211a14] text-base">Funil Comercial & Conversão</h3>
              </div>
              <button 
                onClick={() => onNavigate('pipeline')}
                className="text-xs font-semibold text-[#855300] hover:underline flex items-center gap-1"
              >
                Abrir Kanban <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-[#715b41] mb-5">
              Volume de oportunidades em cada etapa da negociação comercial:
            </p>

            {/* Barras de progresso do Funil Comercial */}
            <div className="space-y-2.5">
              {Object.entries(stageLabels).map(([stageKey, label]) => {
                const count = metrics?.opps_by_stage?.[stageKey] ?? 0;
                const total = metrics?.total_opportunities || 1;
                const pct = Math.round((count / total) * 100);
                
                return (
                  <div key={stageKey} className="text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-[#211a14]">{label}</span>
                      <span className="text-[#715b41] font-medium">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-[#f7ede5] rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          stageKey === 'ganho' ? 'bg-[#496636]' :
                          stageKey === 'perdido' ? 'bg-red-400' :
                          stageKey === 'negociacao' ? 'bg-[#855300]' : 'bg-[#e0b080]'
                        }`}
                        style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#f7ede5] flex items-center justify-between text-xs text-[#715b41]">
            <span>Oportunidades fechadas (Ganhas):</span>
            <span className="font-bold text-[#496636] bg-[#caeca0] px-2.5 py-0.5 rounded-full">
              {formatCurrency(metrics?.pipeline_won_value)} fechados
            </span>
          </div>
        </div>
      </div>

      {/* 4. Tabelas Operacionais Recentes: Últimos Pedidos & Oportunidades Quentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimos Pedidos de Produção */}
        <div className="bg-white rounded-3xl p-6 border border-[#d4c3b5] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#855300]" />
              <h3 className="font-bold text-[#211a14] text-base">Últimos Pedidos Cadastrados</h3>
            </div>
            <button 
              onClick={() => onNavigate('orders')}
              className="text-xs font-semibold text-[#855300] hover:underline"
            >
              Ver todos
            </button>
          </div>

          <div className="divide-y divide-[#f7ede5]">
            {metrics?.recent_orders && metrics.recent_orders.length > 0 ? (
              metrics.recent_orders.map((ord) => {
                const stCfg = orderStatusConfig[ord.status] || { label: ord.status, color: 'text-slate-700 bg-slate-50' };
                return (
                  <div key={ord.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0 gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#855300]">{ord.order_number}</span>
                        <h4 className="font-semibold text-sm text-[#211a14] truncate">{ord.title}</h4>
                      </div>
                      <p className="text-xs text-[#715b41] mt-0.5 flex items-center gap-2">
                        <span>{ord.contact_name}</span>
                        <span>•</span>
                        <span>{ord.quantity} un</span>
                        <span>•</span>
                        <span className="font-semibold text-[#211a14]">{formatCurrency(ord.total_value)}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className={`text-[11px] px-2.5 py-1 rounded-full border font-semibold ${stCfg.color}`}>
                        {stCfg.label}
                      </span>
                      {ord.priority && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold hidden sm:inline-block ${priorityColors[ord.priority] || 'bg-gray-100'}`}>
                          {ord.priority}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-[#715b41] py-4 text-center">Nenhum pedido de produção cadastrado ainda.</p>
            )}
          </div>
        </div>

        {/* Oportunidades Recentes do Funil Comercial */}
        <div className="bg-white rounded-3xl p-6 border border-[#d4c3b5] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Kanban className="w-5 h-5 text-[#855300]" />
              <h3 className="font-bold text-[#211a14] text-base">Oportunidades Comerciais Recentes</h3>
            </div>
            <button 
              onClick={() => onNavigate('pipeline')}
              className="text-xs font-semibold text-[#855300] hover:underline"
            >
              Ver funil
            </button>
          </div>

          <div className="divide-y divide-[#f7ede5]">
            {metrics?.recent_opportunities && metrics.recent_opportunities.length > 0 ? (
              metrics.recent_opportunities.map((o) => (
                <div key={o.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0 gap-3">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-[#211a14] truncate">{o.title}</h4>
                    <p className="text-xs text-[#715b41] mt-0.5 flex items-center gap-2">
                      <span>{o.contact_name || 'Sem contato'}</span>
                      <span>•</span>
                      <span className="font-semibold text-[#211a14]">{formatCurrency(o.value)}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-[#f7ede5] text-[#50453a] font-medium capitalize">
                      {stageLabels[o.stage] || o.stage}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#715b41] py-4 text-center">Nenhuma oportunidade registrada no funil ainda.</p>
            )}
          </div>
        </div>
      </div>

      {/* 5. Seção CRM: Empresas e Pessoas Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Empresas Recentes */}
        <div className="bg-white rounded-3xl p-6 border border-[#d4c3b5] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#855300]" />
              <h3 className="font-bold text-[#211a14] text-base">Últimas Empresas Cadastradas</h3>
            </div>
            <button 
              onClick={() => onNavigate('companies')}
              className="text-xs font-semibold text-[#855300] hover:underline"
            >
              Ver todas
            </button>
          </div>

          <div className="divide-y divide-[#f7ede5]">
            {metrics?.recent_companies && metrics.recent_companies.length > 0 ? (
              metrics.recent_companies.map((c) => (
                <div key={c.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div>
                    <h4 className="font-semibold text-sm text-[#211a14]">{c.trade_name}</h4>
                    <p className="text-xs text-[#715b41]">{c.city || 'Cidade não informada'}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    c.status === 'Ativo' 
                      ? 'bg-[#caeca0] text-[#0b2000]' 
                      : 'bg-[#f7ede5] text-[#715b41]'
                  }`}>
                    {c.status || 'Ativo'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#715b41] py-4 text-center">Nenhuma empresa cadastrada ainda.</p>
            )}
          </div>
        </div>

        {/* Pessoas Recentes */}
        <div className="bg-white rounded-3xl p-6 border border-[#d4c3b5] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#496636]" />
              <h3 className="font-bold text-[#211a14] text-base">Últimas Pessoas / Contatos</h3>
            </div>
            <button 
              onClick={() => onNavigate('persons')}
              className="text-xs font-semibold text-[#855300] hover:underline"
            >
              Ver todas
            </button>
          </div>

          <div className="divide-y divide-[#f7ede5]">
            {metrics?.recent_persons && metrics.recent_persons.length > 0 ? (
              metrics.recent_persons.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div>
                    <h4 className="font-semibold text-sm text-[#211a14]">{p.name}</h4>
                    <p className="text-xs text-[#715b41]">{p.phone || 'Sem telefone registrado'}</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-[#feddbd] text-[#281805] font-medium">
                    {p.type || 'Consumidor'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#715b41] py-4 text-center">Nenhuma pessoa cadastrada ainda.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
