import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Kanban,
  Plus,
  Search,
  Filter,
  DollarSign,
  Calendar,
  Building2,
  User,
  AlertCircle,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  ChevronRight,
  Layers,
  ArrowRight,
  Clock,
  Sparkles,
  Phone,
  Mail,
  X
} from 'lucide-react';

export const PIPELINE_STAGES = [
  { id: 'novo lead', label: 'Novo Lead', color: 'border-blue-400 bg-blue-50/70 text-blue-800 badge-blue', headerBg: 'bg-blue-100/80 text-blue-900' },
  { id: 'qualificação', label: 'Qualificação', color: 'border-amber-400 bg-amber-50/70 text-amber-800 badge-amber', headerBg: 'bg-amber-100/80 text-amber-900' },
  { id: 'gerar proposta', label: 'Gerar Proposta', color: 'border-orange-400 bg-orange-50/70 text-orange-800 badge-orange', headerBg: 'bg-orange-100/80 text-orange-900' },
  { id: 'proposta enviada', label: 'Proposta Enviada', color: 'border-purple-400 bg-purple-50/70 text-purple-800 badge-purple', headerBg: 'bg-purple-100/80 text-purple-900' },
  { id: 'negociação', label: 'Negociação', color: 'border-indigo-400 bg-indigo-50/70 text-indigo-800 badge-indigo', headerBg: 'bg-indigo-100/80 text-indigo-900' },
  { id: 'ganho', label: 'Ganho', color: 'border-emerald-500 bg-emerald-50/70 text-emerald-800 badge-emerald', headerBg: 'bg-emerald-100/80 text-emerald-900' },
  { id: 'perdido', label: 'Perdido', color: 'border-rose-400 bg-rose-50/70 text-rose-800 badge-rose', headerBg: 'bg-rose-100/80 text-rose-900' },
];

export default function PipelineKanban() {
  const [opportunities, setOpportunities] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCustomerType, setFilterCustomerType] = useState('');

  // Modal de criação / edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    stage: 'novo lead',
    value: 0,
    quantity: '',
    priority: 'Média',
    customer_type: 'B2B',
    company_id: '',
    person_id: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    source: 'Instagram',
    expected_closing_date: '',
    event_date: '',
    loss_reason: '',
    assigned_to: ''
  });

  // Modal para motivo de perda rápido
  const [lossModalOpen, setLossModalOpen] = useState(false);
  const [lossTargetOpp, setLossTargetOpp] = useState(null);
  const [lossReasonInput, setLossReasonInput] = useState('');

  // Drag and drop state
  const [draggedOppId, setDraggedOppId] = useState(null);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const res = await api.get('/pipeline/opportunities');
      setOpportunities(res.data);
    } catch (err) {
      console.error('Erro ao buscar oportunidades:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelationalData = async () => {
    try {
      const [compRes, persRes] = await Promise.all([
        api.get('/companies'),
        api.get('/persons')
      ]);
      setCompanies(compRes.data);
      setPersons(persRes.data);
    } catch (err) {
      console.error('Erro ao buscar empresas/pessoas para o funil:', err);
    }
  };

  useEffect(() => {
    fetchOpportunities();
    fetchRelationalData();
  }, []);

  const openCreateModal = (defaultStage = 'novo lead') => {
    setEditingOpp(null);
    setFormData({
      title: '',
      description: '',
      stage: defaultStage,
      value: 0,
      quantity: '',
      priority: 'Média',
      customer_type: 'B2B',
      company_id: '',
      person_id: '',
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      source: 'Instagram',
      expected_closing_date: '',
      event_date: '',
      loss_reason: '',
      assigned_to: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (opp) => {
    setEditingOpp(opp);
    setFormData({
      title: opp.title,
      description: opp.description || '',
      stage: opp.stage,
      value: opp.value ? opp.value / 100 : 0,
      quantity: opp.quantity || '',
      priority: opp.priority || 'Média',
      customer_type: opp.customer_type || 'B2B',
      company_id: opp.company_id || '',
      person_id: opp.person_id || '',
      contact_name: opp.contact_name || '',
      contact_email: opp.contact_email || '',
      contact_phone: opp.contact_phone || '',
      source: opp.source || 'Instagram',
      expected_closing_date: opp.expected_closing_date || '',
      event_date: opp.event_date || '',
      loss_reason: opp.loss_reason || '',
      assigned_to: opp.assigned_to || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        value: Math.round(Number(formData.value || 0) * 100),
        quantity: formData.quantity ? Number(formData.quantity) : null,
        company_id: formData.company_id ? Number(formData.company_id) : null,
        person_id: formData.person_id ? Number(formData.person_id) : null,
      };

      if (editingOpp) {
        await api.put(`/pipeline/opportunities/${editingOpp.id}`, payload);
      } else {
        await api.post('/pipeline/opportunities', payload);
      }
      setIsModalOpen(false);
      fetchOpportunities();
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao salvar oportunidade.');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja remover esta oportunidade do funil?')) {
      try {
        await api.delete(`/pipeline/opportunities/${id}`);
        fetchOpportunities();
      } catch (err) {
        alert('Erro ao excluir oportunidade.');
      }
    }
  };

  const handleStageChange = async (oppId, newStage, lossReason = null) => {
    if (newStage === 'perdido' && !lossReason) {
      const opp = opportunities.find(o => o.id === oppId);
      setLossTargetOpp(opp);
      setLossReasonInput('');
      setLossModalOpen(true);
      return;
    }

    try {
      // Otimista
      setOpportunities(prev =>
        prev.map(o => (o.id === oppId ? { ...o, stage: newStage, loss_reason: lossReason || o.loss_reason } : o))
      );

      await api.patch(`/pipeline/opportunities/${oppId}/stage`, {
        stage: newStage,
        loss_reason: lossReason
      });
    } catch (err) {
      console.error('Erro ao atualizar estágio:', err);
      fetchOpportunities();
    }
  };

  const confirmLoss = async () => {
    if (!lossTargetOpp) return;
    try {
      await api.patch(`/pipeline/opportunities/${lossTargetOpp.id}/stage`, {
        stage: 'perdido',
        loss_reason: lossReasonInput || 'Não informado'
      });
      setLossModalOpen(false);
      setLossTargetOpp(null);
      fetchOpportunities();
    } catch (err) {
      alert('Erro ao registrar perda da oportunidade.');
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, oppId) => {
    e.dataTransfer.setData('text/plain', oppId.toString());
    setDraggedOppId(oppId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStage) => {
    e.preventDefault();
    const oppIdStr = e.dataTransfer.getData('text/plain');
    const oppId = Number(oppIdStr);
    if (!oppId) return;

    setDraggedOppId(null);
    handleStageChange(oppId, targetStage);
  };

  // Filtros
  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = 
      opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (opp.contact_name && opp.contact_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (opp.description && opp.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPriority = !filterPriority || opp.priority === filterPriority;
    const matchesCustomerType = !filterCustomerType || opp.customer_type === filterCustomerType;

    return matchesSearch && matchesPriority && matchesCustomerType;
  });

  const formatCurrency = (cents) => {
    const val = (cents || 0) / 100;
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Totalizador geral do funil
  const totalValueInFunnel = filteredOpportunities
    .filter(o => o.stage !== 'perdido')
    .reduce((acc, curr) => acc + (curr.value || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#d4c3b5] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#855300]">
            <Kanban className="w-4 h-4" />
            CRM Pipeline
          </div>
          <h1 className="text-2xl font-black text-[#211a14] tracking-tight mt-1">
            Funil Comercial de Oportunidades
          </h1>
          <p className="text-sm text-[#715b41] mt-0.5">
            Acompanhe o fluxo de leads desde o primeiro contato até o fechamento de pedidos personalizados.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col text-right pr-3 border-r border-[#d4c3b5]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#715b41]">Em Negociação / Ativos</span>
            <span className="text-lg font-black text-[#855300]">{formatCurrency(totalValueInFunnel)}</span>
          </div>

          <button
            onClick={() => openCreateModal()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#855300] text-white text-sm font-bold shadow-sm hover:bg-[#6c4300] hover:scale-102 active:scale-98 transition-all"
          >
            <Plus className="w-4 h-4" /> Nova Oportunidade
          </button>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f7ede5] p-3 rounded-2xl border border-[#d4c3b5]">
        <div className="flex flex-1 items-center gap-2 min-w-[240px] bg-white px-3 py-1.5 rounded-xl border border-[#d4c3b5]">
          <Search className="w-4 h-4 text-[#715b41]" />
          <input
            type="text"
            placeholder="Buscar por título, lead ou detalhe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs bg-transparent focus:outline-hidden text-[#211a14]"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="text-xs bg-white border border-[#d4c3b5] rounded-xl px-3 py-2 text-[#211a14] focus:outline-hidden"
          >
            <option value="">Todas as Prioridades</option>
            <option value="Baixa">Baixa</option>
            <option value="Média">Média</option>
            <option value="Alta">Alta</option>
            <option value="Urgente">Urgente</option>
          </select>

          <select
            value={filterCustomerType}
            onChange={(e) => setFilterCustomerType(e.target.value)}
            className="text-xs bg-white border border-[#d4c3b5] rounded-xl px-3 py-2 text-[#211a14] focus:outline-hidden"
          >
            <option value="">Todos os Tipos</option>
            <option value="B2B">B2B (Empresa)</option>
            <option value="B2C">B2C (Consumidor)</option>
          </select>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-1 select-none min-h-[650px] scrollbar-thin">
        {PIPELINE_STAGES.map((col) => {
          const colOpportunities = filteredOpportunities.filter(o => o.stage === col.id);
          const colTotal = colOpportunities.reduce((acc, curr) => acc + (curr.value || 0), 0);

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="flex flex-col flex-shrink-0 w-80 bg-[#f7ede5]/60 rounded-3xl border border-[#d4c3b5] shadow-xs"
            >
              {/* Cabeçalho da Coluna */}
              <div className="p-3.5 border-b border-[#d4c3b5] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`px-2.5 py-1 rounded-full text-xs font-black capitalize ${col.headerBg}`}>
                    {col.label}
                  </div>
                  <span className="text-xs font-bold text-[#715b41] bg-white/80 px-2 py-0.5 rounded-full border border-[#d4c3b5]">
                    {colOpportunities.length}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold text-[#855300]">
                    {formatCurrency(colTotal)}
                  </span>
                </div>
              </div>

              {/* Botão rápido de adicionar no topo da coluna */}
              <div className="p-2 border-b border-[#d4c3b5]/40">
                <button
                  onClick={() => openCreateModal(col.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-dashed border-[#d4c3b5] text-xs font-semibold text-[#715b41] hover:bg-white hover:text-[#855300] hover:border-[#855300] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>

              {/* Lista de Cards da Coluna */}
              <div className="p-2 space-y-3 flex-1 overflow-y-auto max-h-[700px]">
                {colOpportunities.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-center p-4 border border-dashed border-[#d4c3b5]/60 rounded-2xl text-xs text-[#a08a73]">
                    Nenhuma oportunidade nesta etapa
                  </div>
                ) : (
                  colOpportunities.map((opp) => (
                    <div
                      key={opp.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, opp.id)}
                      className={`group relative bg-white rounded-2xl p-4 border border-[#d4c3b5] shadow-xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
                        draggedOppId === opp.id ? 'opacity-50 border-dashed border-[#855300]' : ''
                      }`}
                    >
                      {/* Topo do Card: Tipo & Prioridade com destaque */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-[11px] font-black tracking-wide px-2.5 py-1 rounded-lg shadow-xs border ${
                          opp.customer_type === 'B2B' 
                            ? 'bg-amber-100 text-amber-950 border-amber-300 ring-1 ring-amber-400/40' 
                            : 'bg-emerald-100 text-emerald-950 border-emerald-300 ring-1 ring-emerald-400/40'
                        }`}>
                          {opp.customer_type}
                        </span>

                        <span className={`text-[11px] font-black tracking-wide px-2.5 py-1 rounded-lg shadow-xs border ${
                          opp.priority === 'Urgente' 
                            ? 'bg-red-500 text-white border-red-600 animate-pulse' :
                          opp.priority === 'Alta' 
                            ? 'bg-orange-500 text-white border-orange-600' :
                          opp.priority === 'Baixa' 
                            ? 'bg-gray-100 text-gray-700 border-gray-300' 
                            : 'bg-blue-500 text-white border-blue-600'
                        }`}>
                          {opp.priority}
                        </span>
                      </div>

                      {/* Título */}
                      <h4 
                        onClick={() => openEditModal(opp)}
                        className="font-bold text-[#211a14] text-sm leading-snug line-clamp-2 hover:text-[#855300] cursor-pointer"
                        title={opp.title}
                      >
                        {opp.title}
                      </h4>

                      {/* Descrição com limite de caracteres */}
                      {opp.description && (
                        <p className="text-xs text-[#715b41] mt-1.5 line-clamp-2" title={opp.description}>
                          {opp.description}
                        </p>
                      )}

                      {/* Informações simples: Nome, Empresa, Pessoa, Quantidade */}
                      <div className="mt-3 pt-2.5 border-t border-[#f2e6dc] space-y-1.5 text-xs text-[#50453a]">
                        {opp.contact_name && (
                          <div className="flex items-center gap-1.5 font-medium truncate">
                            <User className="w-3.5 h-3.5 text-[#855300] flex-shrink-0" />
                            <span className="truncate"><strong>Nome:</strong> {opp.contact_name}</span>
                          </div>
                        )}
                        {opp.company && (
                          <div className="flex items-center gap-1.5 font-medium truncate">
                            <Building2 className="w-3.5 h-3.5 text-[#855300] flex-shrink-0" />
                            <span className="truncate"><strong>Empresa:</strong> {opp.company.trade_name}</span>
                          </div>
                        )}
                        {opp.person && (
                          <div className="flex items-center gap-1.5 font-medium truncate">
                            <User className="w-3.5 h-3.5 text-[#496636] flex-shrink-0" />
                            <span className="truncate"><strong>Pessoa:</strong> {opp.person.name}</span>
                          </div>
                        )}
                        {opp.quantity && (
                          <div className="text-[11px] font-semibold text-[#855300] flex items-center gap-1">
                            <span>🍪</span>
                            <span><strong>Qtd:</strong> {opp.quantity} un</span>
                          </div>
                        )}
                      </div>

                      {/* Rodapé do Card: Valor Estimado & Ações */}
                      <div className="mt-3 pt-2 border-t border-[#f2e6dc] flex items-center justify-between">
                        <div className="font-extrabold text-sm text-[#211a14]">
                          <span className="text-[11px] font-normal text-[#715b41] block">Valor Est.:</span>
                          {formatCurrency(opp.value)}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(opp)}
                            title="Editar"
                            className="p-1 rounded-lg text-gray-400 hover:text-[#855300] hover:bg-[#fff8f4]"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(opp.id)}
                            title="Excluir"
                            className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Seletor Rápido de Mudança de Etapa */}
                      <div className="mt-2.5 pt-2 border-t border-dashed border-[#d4c3b5]/60 flex items-center justify-between text-[11px]">
                        <span className="text-[#a08a73]">Mover:</span>
                        <select
                          value={opp.stage}
                          onChange={(e) => handleStageChange(opp.id, e.target.value)}
                          className="bg-[#f7ede5] border border-[#d4c3b5] rounded-lg px-1.5 py-0.5 text-[#211a14] focus:outline-hidden text-[11px]"
                        >
                          {PIPELINE_STAGES.map(s => (
                            <option key={s.id} value={s.id}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Criação / Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-[#d4c3b5] shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#d4c3b5] pb-4 mb-5">
              <div>
                <h3 className="text-xl font-bold text-[#211a14]">
                  {editingOpp ? 'Editar Oportunidade' : 'Nova Oportunidade de Negócio'}
                </h3>
                <p className="text-xs text-[#715b41] mt-0.5">
                  Preencha os detalhes para controlar o avanço do lead no funil comercial.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Título & Estágio */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#211a14] mb-1">
                    Título da Oportunidade *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 500 Biscoitos Decorados com Logo para Convenção"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full text-xs bg-[#f7ede5] border border-[#d4c3b5] rounded-xl px-3 py-2 text-[#211a14] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#211a14] mb-1">
                    Coluna / Etapa *
                  </label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    className="w-full text-xs bg-[#f7ede5] border border-[#d4c3b5] rounded-xl px-3 py-2 text-[#211a14] focus:outline-hidden"
                  >
                    {PIPELINE_STAGES.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-bold text-[#211a14] mb-1">
                  Descrição & Especificações dos Biscoitos *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Sabores desejados, embalagens personalizadas, temática, restrições alimentares..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-xs bg-[#f7ede5] border border-[#d4c3b5] rounded-xl p-3 text-[#211a14] focus:outline-hidden"
                />
              </div>

              {/* Valores & Quantidade */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#211a14] mb-1">
                    Valor Estimado (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full text-xs bg-[#f7ede5] border border-[#d4c3b5] rounded-xl px-3 py-2 text-[#211a14] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#211a14] mb-1">
                    Qtd Biscoitos/Pacotes
                  </label>
                  <input
                    type="number"
                    placeholder="Ex: 250"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full text-xs bg-[#f7ede5] border border-[#d4c3b5] rounded-xl px-3 py-2 text-[#211a14] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#211a14] mb-1">
                    Prioridade *
                  </label>
                  <select
                    required
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full text-xs bg-[#f7ede5] border border-[#d4c3b5] rounded-xl px-3 py-2 text-[#211a14] focus:outline-hidden"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>
              </div>

              {/* Tipo de Cliente & Vínculo com CRM */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#d4c3b5]/60">
                <div>
                  <label className="block text-xs font-bold text-[#211a14] mb-1">
                    Tipo de Cliente *
                  </label>
                  <select
                    required
                    value={formData.customer_type}
                    onChange={(e) => setFormData({ ...formData, customer_type: e.target.value })}
                    className="w-full text-xs bg-[#f7ede5] border border-[#d4c3b5] rounded-xl px-3 py-2 text-[#211a14] focus:outline-hidden"
                  >
                    <option value="B2B">B2B (Empresa / Corporativo)</option>
                    <option value="B2C">B2C (Consumidor Final)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#211a14] mb-1">
                    Empresa Cadastrada
                  </label>
                  <select
                    value={formData.company_id}
                    onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                    className="w-full text-xs bg-[#f7ede5] border border-[#d4c3b5] rounded-xl px-3 py-2 text-[#211a14] focus:outline-hidden"
                  >
                    <option value="">Nenhuma ou Novo Lead</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.trade_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#211a14] mb-1">
                    Pessoa Cadastrada
                  </label>
                  <select
                    value={formData.person_id}
                    onChange={(e) => setFormData({ ...formData, person_id: e.target.value })}
                    className="w-full text-xs bg-[#f7ede5] border border-[#d4c3b5] rounded-xl px-3 py-2 text-[#211a14] focus:outline-hidden"
                  >
                    <option value="">Nenhuma ou Novo Lead</option>
                    {persons.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Informações Diretas do Contato / Lead Frio */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#211a14] mb-1">
                    Nome do Contato
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Mariana Silva"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    className="w-full text-xs bg-[#f7ede5] border border-[#d4c3b5] rounded-xl px-3 py-2 text-[#211a14] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#211a14] mb-1">
                    WhatsApp / Telefone
                  </label>
                  <input
                    type="text"
                    placeholder="(11) 99999-9999"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    className="w-full text-xs bg-[#f7ede5] border border-[#d4c3b5] rounded-xl px-3 py-2 text-[#211a14] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#211a14] mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    placeholder="contato@empresa.com"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    className="w-full text-xs bg-[#f7ede5] border border-[#d4c3b5] rounded-xl px-3 py-2 text-[#211a14] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Origem e Datas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#211a14] mb-1">
                    Origem do Lead
                  </label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full text-xs bg-[#f7ede5] border border-[#d4c3b5] rounded-xl px-3 py-2 text-[#211a14] focus:outline-hidden"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Indicação">Indicação</option>
                    <option value="Site / Google">Site / Google</option>
                    <option value="Feira / Evento">Feira / Evento</option>
                    <option value="Prospecção Ativa">Prospecção Ativa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#211a14] mb-1">
                    Data da Entrega
                  </label>
                  <input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className="w-full text-xs bg-[#f7ede5] border border-[#d4c3b5] rounded-xl px-3 py-2 text-[#211a14] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#211a14] mb-1">
                    Previsão Fechamento
                  </label>
                  <input
                    type="date"
                    value={formData.expected_closing_date}
                    onChange={(e) => setFormData({ ...formData, expected_closing_date: e.target.value })}
                    className="w-full text-xs bg-[#f7ede5] border border-[#d4c3b5] rounded-xl px-3 py-2 text-[#211a14] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Se estágio for 'perdido' */}
              {formData.stage === 'perdido' && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                  <label className="block text-xs font-bold text-rose-800 mb-1">
                    Motivo da Perda
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Preço acima do orçamento, prazo incompatível..."
                    value={formData.loss_reason}
                    onChange={(e) => setFormData({ ...formData, loss_reason: e.target.value })}
                    className="w-full text-xs bg-white border border-rose-300 rounded-lg px-3 py-2 text-rose-900 focus:outline-hidden"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-[#d4c3b5]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#d4c3b5] text-xs font-bold text-[#715b41] hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#855300] text-white text-xs font-bold hover:bg-[#6c4300] shadow-sm"
                >
                  {editingOpp ? 'Salvar Alterações' : 'Criar Oportunidade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Rápido de Motivo de Perda */}
      {lossModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#d4c3b5] shadow-xl">
            <div className="flex items-center gap-2 text-rose-600 mb-3">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-bold text-base text-[#211a14]">Registrar Perda da Oportunidade</h3>
            </div>
            <p className="text-xs text-[#715b41] mb-4">
              Informe o motivo pelo qual a oportunidade <strong>"{lossTargetOpp?.title}"</strong> foi perdida:
            </p>
            <input
              type="text"
              placeholder="Ex: Preço alto, optou por brinde não-comestível, prazo curto..."
              value={lossReasonInput}
              onChange={(e) => setLossReasonInput(e.target.value)}
              className="w-full text-xs bg-[#f7ede5] border border-[#d4c3b5] rounded-xl px-3 py-2 text-[#211a14] focus:outline-hidden mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setLossModalOpen(false); setLossTargetOpp(null); }}
                className="px-4 py-1.5 rounded-xl border border-[#d4c3b5] text-xs font-bold text-[#715b41]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmLoss}
                className="px-4 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
              >
                Confirmar Perda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
