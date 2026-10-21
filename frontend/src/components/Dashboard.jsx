import React from 'react';
import { 
  Building2, 
  Users, 
  UserCheck, 
  Briefcase, 
  TrendingUp, 
  Clock, 
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

export default function Dashboard({ metrics, onNavigate }) {
  return (
    <div className="space-y-6">
      {/* Welcome Banner Material 3 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#ffddb8] via-[#f7ede5] to-[#caeca0]/40 p-6 sm:p-8 border border-[#d4c3b5]">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#855300]/10 text-[#855300] text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Visão Geral do CRM
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#211a14] tracking-tight">
            Bem-vindo ao Portal Biscoitossauro
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#50453a] leading-relaxed">
            Gerencie empresas clientes, contatos corporativos e consumidores finais personalizados para eventos e marcas.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Empresas Cadastradas */}
        <div 
          onClick={() => onNavigate('companies')}
          className="cursor-pointer bg-white rounded-3xl p-5 border border-[#d4c3b5] hover:border-[#855300] transition-all hover:shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#715b41]">Empresas</span>
            <div className="w-10 h-10 rounded-2xl bg-[#ffddb8] flex items-center justify-center text-[#855300] group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#211a14]">
              {metrics?.total_companies ?? 0}
            </div>
            <div className="text-xs text-[#715b41] mt-1 flex items-center gap-1 font-medium">
              <span>{metrics?.active_companies ?? 0} ativas no catálogo</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-auto text-[#855300]" />
            </div>
          </div>
        </div>

        {/* Card 2: Pessoas Cadastradas */}
        <div 
          onClick={() => onNavigate('persons')}
          className="cursor-pointer bg-white rounded-3xl p-5 border border-[#d4c3b5] hover:border-[#855300] transition-all hover:shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#715b41]">Pessoas (CRM)</span>
            <div className="w-10 h-10 rounded-2xl bg-[#caeca0] flex items-center justify-center text-[#496636] group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#211a14]">
              {metrics?.total_persons ?? 0}
            </div>
            <div className="text-xs text-[#715b41] mt-1 flex items-center gap-1 font-medium">
              <span>{metrics?.b2c_customers ?? 0} B2C • {metrics?.b2b_contacts ?? 0} B2B</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-auto text-[#496636]" />
            </div>
          </div>
        </div>

        {/* Card 3: Vínculos Corporativos */}
        <div 
          onClick={() => onNavigate('companies')}
          className="cursor-pointer bg-white rounded-3xl p-5 border border-[#d4c3b5] hover:border-[#855300] transition-all hover:shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#715b41]">Vínculos & Cargos</span>
            <div className="w-10 h-10 rounded-2xl bg-[#feddbd] flex items-center justify-center text-[#715b41] group-hover:scale-110 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#211a14]">
              {metrics?.total_links ?? 0}
            </div>
            <div className="text-xs text-[#715b41] mt-1 flex items-center gap-1 font-medium">
              <span>Relações de equipe registradas</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-auto text-[#715b41]" />
            </div>
          </div>
        </div>

        {/* Card 4: Usuários do Sistema */}
        <div 
          onClick={() => onNavigate('users')}
          className="cursor-pointer bg-white rounded-3xl p-5 border border-[#d4c3b5] hover:border-[#855300] transition-all hover:shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#715b41]">Operadores</span>
            <div className="w-10 h-10 rounded-2xl bg-[#e0e2ec] flex items-center justify-center text-[#43474e] group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#211a14]">
              {metrics?.total_users ?? 0}
            </div>
            <div className="text-xs text-[#715b41] mt-1 flex items-center gap-1 font-medium">
              <span>Acesso administrativo liberado</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-auto text-[#43474e]" />
            </div>
          </div>
        </div>
      </div>

      {/* Two columns: Recent Companies & Recent Persons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Empresas Recentes */}
        <div className="bg-white rounded-3xl p-6 border border-[#d4c3b5] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#855300]" />
              <h3 className="font-bold text-[#211a14] text-base">Últimas Empresas</h3>
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
              <h3 className="font-bold text-[#211a14] text-base">Últimas Pessoas</h3>
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
