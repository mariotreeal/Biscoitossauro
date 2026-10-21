import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  DollarSign,
  Calendar,
  Building2,
  User,
  AlertCircle,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  Layers,
  ChefHat,
  Receipt,
  FileText,
  ChevronRight,
  ArrowRight,
  Edit2,
  Trash2,
  X,
  LayoutGrid,
  List,
  Sparkles,
  Phone,
  Mail,
  History,
  CreditCard
} from 'lucide-react';

export const ORDER_STAGES = [
  {
    id: 'aprovado',
    label: 'Pedido Aprovado',
    icon: CheckCircle2,
    color: 'border-blue-400 bg-blue-50/70 text-blue-800',
    headerBg: 'bg-blue-100/80 text-blue-900',
    badge: 'bg-blue-100 text-blue-900 border-blue-300'
  },
  {
    id: 'provisao_recursos',
    label: 'Provisão de Recursos',
    icon: Layers,
    color: 'border-amber-400 bg-amber-50/70 text-amber-800',
    headerBg: 'bg-amber-100/80 text-amber-900',
    badge: 'bg-amber-100 text-amber-900 border-amber-300'
  },
  {
    id: 'linha_producao',
    label: 'Linha de Produção',
    icon: ChefHat,
    color: 'border-orange-400 bg-orange-50/70 text-orange-800',
    headerBg: 'bg-orange-100/80 text-orange-900',
    badge: 'bg-orange-100 text-orange-900 border-orange-300'
  },
  {
    id: 'embalagem',
    label: 'Embalagem',
    icon: Package,
    color: 'border-purple-400 bg-purple-50/70 text-purple-800',
    headerBg: 'bg-purple-100/80 text-purple-900',
    badge: 'bg-purple-100 text-purple-900 border-purple-300'
  },
  {
    id: 'entrega',
    label: 'Entrega / Logística',
    icon: Truck,
    color: 'border-indigo-400 bg-indigo-50/70 text-indigo-800',
    headerBg: 'bg-indigo-100/80 text-indigo-900',
    badge: 'bg-indigo-100 text-indigo-900 border-indigo-300'
  },
  {
    id: 'faturamento',
    label: 'Faturamento',
    icon: Receipt,
    color: 'border-teal-400 bg-teal-50/70 text-teal-800',
    headerBg: 'bg-teal-100/80 text-teal-900',
    badge: 'bg-teal-100 text-teal-900 border-teal-300'
  },
  {
    id: 'concluido',
    label: 'Concluído',
    icon: CheckCircle2,
    color: 'border-emerald-500 bg-emerald-50/70 text-emerald-800',
    headerBg: 'bg-emerald-100/80 text-emerald-900',
    badge: 'bg-emerald-100 text-emerald-900 border-emerald-300'
  }
];

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  
  // Filtros
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('');

  // Modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);

  // Form State
  const initialForm = {
    title: '',
    description: '',
    status: 'aprovado',
    customer_type: 'B2B',
    priority: 'Média',
    company_id: '',
    person_id: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    quantity: 1,
    total_value: 0,
    payment_method: 'Pix',
    payment_status: 'Pendente',
    order_date: new Date().toISOString().split('T')[0],
    production_date: '',
    delivery_date: '',
    resources_notes: '',
    production_notes: '',
    packaging_notes: '',
    delivery_notes: '',
    billing_notes: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      setOrders(res.data);
      if (viewingOrder) {
        const updated = res.data.find(o => o.id === viewingOrder.id);
        if (updated) setViewingOrder(updated);
      }
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err);
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
      console.error('Erro ao buscar empresas/pessoas:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchRelationalData();
  }, []);

  const openCreateModal = (defaultStatus = 'aprovado') => {
    setEditingOrder(null);
    setFormData({
      ...initialForm,
      status: defaultStatus
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (order) => {
    setEditingOrder(order);
    setFormData({
      title: order.title,
      description: order.description || '',
      status: order.status || 'aprovado',
      customer_type: order.customer_type || 'B2B',
      priority: order.priority || 'Média',
      company_id: order.company_id || '',
      person_id: order.person_id || '',
      contact_name: order.contact_name || '',
      contact_phone: order.contact_phone || '',
      contact_email: order.contact_email || '',
      quantity: order.quantity || 1,
      total_value: order.total_value ? order.total_value / 100 : 0,
      payment_method: order.payment_method || 'Pix',
      payment_status: order.payment_status || 'Pendente',
      order_date: order.order_date || '',
      production_date: order.production_date || '',
      delivery_date: order.delivery_date || '',
      resources_notes: order.resources_notes || '',
      production_notes: order.production_notes || '',
      packaging_notes: order.packaging_notes || '',
      delivery_notes: order.delivery_notes || '',
      billing_notes: order.billing_notes || ''
    });
    setIsFormModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        total_value: Math.round(Number(formData.total_value || 0) * 100),
        quantity: Number(formData.quantity || 1),
        company_id: formData.company_id ? Number(formData.company_id) : null,
        person_id: formData.person_id ? Number(formData.person_id) : null
      };

      if (editingOrder) {
        await api.put(`/orders/${editingOrder.id}`, payload);
      } else {
        await api.post('/orders', payload);
      }

      setIsFormModalOpen(false);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao salvar pedido.');
    }
  };

  const handleStatusChange = async (orderId, newStatus, notes = '') => {
    try {
      // Otimista
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      await api.patch(`/orders/${orderId}/status`, {
        status: newStatus,
        notes: notes || `Movido para a etapa ${newStatus}`
      });
      fetchOrders();
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      fetchOrders();
    }
  };

  const handleDelete = async (orderId) => {
    if (confirm('Tem certeza que deseja excluir este pedido e todo seu histórico de produção?')) {
      try {
        await api.delete(`/orders/${orderId}`);
        if (viewingOrder?.id === orderId) setViewingOrder(null);
        fetchOrders();
      } catch (err) {
        alert('Erro ao excluir pedido.');
      }
    }
  };

  const formatCurrency = (cents) => {
    const val = (cents || 0) / 100;
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Filtragem
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(search.toLowerCase()) ||
      order.title.toLowerCase().includes(search.toLowerCase()) ||
      (order.contact_name && order.contact_name.toLowerCase().includes(search.toLowerCase())) ||
      (order.description && order.description.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = !statusFilter || order.status === statusFilter;
    const matchesPriority = !priorityFilter || order.priority === priorityFilter;
    const matchesCustomerType = !customerTypeFilter || order.customer_type === customerTypeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCustomerType;
  });

  const totalValueInOrders = filteredOrders
    .filter(o => o.status !== 'cancelado')
    .reduce((acc, curr) => acc + (curr.total_value || 0), 0);

  const totalCookies = filteredOrders
    .filter(o => o.status !== 'cancelado')
    .reduce((acc, curr) => acc + (curr.quantity || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#d4c3b5] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#855300]">
            <ShoppingBag className="w-4 h-4" />
            Controle de Produção & Fábrica
          </div>
          <h1 className="text-2xl font-black text-[#211a14] tracking-tight mt-1">
            Gestão do Fluxo de Pedidos
          </h1>
          <p className="text-sm text-[#715b41] mt-0.5">
            Acompanhe cada pedido aprovado desde a provisão de insumos até a entrega e faturamento.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col text-right pr-4 border-r border-[#d4c3b5]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#715b41]">Total em Produção</span>
            <span className="text-lg font-black text-[#855300]">{formatCurrency(totalValueInOrders)}</span>
            <span className="text-[11px] text-[#715b41] font-semibold">{totalCookies.toLocaleString()} biscoitos</span>
          </div>

          <button
            onClick={() => openCreateModal()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#855300] text-white text-sm font-bold shadow-sm hover:bg-[#6c4300] hover:scale-102 active:scale-98 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Novo Pedido
          </button>
        </div>
      </div>

      {/* Barra de Filtros, Busca e Alternador de Visão */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f7ede5] p-3 rounded-2xl border border-[#d4c3b5]">
        <div className="flex flex-1 items-center gap-2 min-w-[240px] bg-white px-3 py-1.5 rounded-xl border border-[#d4c3b5]">
          <Search className="w-4 h-4 text-[#715b41]" />
          <input
            type="text"
            placeholder="Buscar por número (PED-...), título, cliente ou item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs bg-transparent focus:outline-hidden text-[#211a14]"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-white border border-[#d4c3b5] rounded-xl px-3 py-2 text-[#211a14] focus:outline-hidden"
          >
            <option value="">Todas as Etapas</option>
            {ORDER_STAGES.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs bg-white border border-[#d4c3b5] rounded-xl px-3 py-2 text-[#211a14] focus:outline-hidden"
          >
            <option value="">Todas as Prioridades</option>
            <option value="Baixa">Baixa</option>
            <option value="Média">Média</option>
            <option value="Alta">Alta</option>
            <option value="Urgente">Urgente</option>
          </select>

          <select
            value={customerTypeFilter}
            onChange={(e) => setCustomerTypeFilter(e.target.value)}
            className="text-xs bg-white border border-[#d4c3b5] rounded-xl px-3 py-2 text-[#211a14] focus:outline-hidden"
          >
            <option value="">Todos os Tipos</option>
            <option value="B2B">B2B (Empresa)</option>
            <option value="B2C">B2C (Consumidor)</option>
          </select>

          {/* Toggle Kanban / Lista */}
          <div className="flex items-center bg-white rounded-xl p-1 border border-[#d4c3b5]">
            <button
              onClick={() => setViewMode('kanban')}
              title="Fluxo de Produção (Etapas)"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-[#855300] text-white shadow-xs'
                  : 'text-[#715b41] hover:text-[#211a14]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Etapas</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="Visão em Lista"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#855300] text-white shadow-xs'
                  : 'text-[#715b41] hover:text-[#211a14]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lista</span>
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal: Fluxo em Etapas (Kanban) ou Tabela Lista */}
      {loading ? (
        <div className="text-center py-16 text-[#715b41]">
          <div className="inline-block w-8 h-8 border-3 border-[#855300] border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-sm font-semibold">Carregando pedidos de produção...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#d4c3b5]">
          <ShoppingBag className="w-12 h-12 text-[#d4c3b5] mx-auto mb-2" />
          <h3 className="text-base font-bold text-[#211a14]">Nenhum pedido encontrado</h3>
          <p className="text-xs text-[#715b41] mt-1">
            Cadastre um novo pedido aprovado para dar início à esteira de produção e faturamento.
          </p>
        </div>
      ) : viewMode === 'kanban' ? (
        /* Board de Etapas do Pedido */
        <div className="flex gap-4 overflow-x-auto pb-6 pt-1 select-none min-h-[650px] scrollbar-thin">
          {ORDER_STAGES.map((stage) => {
            const stageOrders = filteredOrders.filter(o => o.status === stage.id);
            const stageTotal = stageOrders.reduce((acc, curr) => acc + (curr.total_value || 0), 0);
            const StageIcon = stage.icon;

            return (
              <div
                key={stage.id}
                className="flex flex-col flex-shrink-0 w-80 bg-[#f7ede5]/60 rounded-3xl border border-[#d4c3b5] shadow-xs"
              >
                {/* Cabeçalho da Etapa */}
                <div className="p-3.5 border-b border-[#d4c3b5] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black ${stage.headerBg}`}>
                      <StageIcon className="w-3.5 h-3.5" />
                      {stage.label}
                    </div>
                    <span className="text-xs font-bold text-[#715b41] bg-white/80 px-2 py-0.5 rounded-full border border-[#d4c3b5]">
                      {stageOrders.length}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-[#855300]">
                    {formatCurrency(stageTotal)}
                  </span>
                </div>

                {/* Botão rápido de adicionar na etapa */}
                <div className="p-2 border-b border-[#d4c3b5]/40">
                  <button
                    onClick={() => openCreateModal(stage.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-dashed border-[#d4c3b5] text-xs font-semibold text-[#715b41] hover:bg-white hover:text-[#855300] hover:border-[#855300] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Pedido
                  </button>
                </div>

                {/* Lista de Pedidos na Etapa */}
                <div className="p-2 space-y-3 flex-1 overflow-y-auto max-h-[700px]">
                  {stageOrders.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center text-center p-4 border border-dashed border-[#d4c3b5]/60 rounded-2xl text-xs text-[#a08a73]">
                      Nenhum pedido nesta fase
                    </div>
                  ) : (
                    stageOrders.map((order) => (
                      <div
                        key={order.id}
                        className="group relative bg-white rounded-2xl p-4 border border-[#d4c3b5] shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          {/* Topo do Card: Número & Tags com Destaque */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="font-mono text-xs font-black text-[#855300] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              {order.order_number}
                            </span>

                            <div className="flex items-center gap-1.5">
                              <span className={`text-[10px] font-black tracking-wide px-2 py-0.5 rounded-md border ${
                                order.customer_type === 'B2B'
                                  ? 'bg-amber-100 text-amber-950 border-amber-300'
                                  : 'bg-emerald-100 text-emerald-950 border-emerald-300'
                              }`}>
                                {order.customer_type}
                              </span>

                              <span className={`text-[10px] font-black tracking-wide px-2 py-0.5 rounded-md border ${
                                order.priority === 'Urgente'
                                  ? 'bg-red-500 text-white border-red-600 animate-pulse'
                                  : order.priority === 'Alta'
                                  ? 'bg-orange-500 text-white border-orange-600'
                                  : order.priority === 'Baixa'
                                  ? 'bg-gray-100 text-gray-700 border-gray-300'
                                  : 'bg-blue-500 text-white border-blue-600'
                              }`}>
                                {order.priority}
                              </span>
                            </div>
                          </div>

                          {/* Título do Pedido */}
                          <h4
                            onClick={() => setViewingOrder(order)}
                            className="font-bold text-[#211a14] text-sm leading-snug line-clamp-2 hover:text-[#855300] cursor-pointer"
                            title={order.title}
                          >
                            {order.title}
                          </h4>

                          {/* Descrição resumida */}
                          {order.description && (
                            <p className="text-xs text-[#715b41] mt-1 line-clamp-2" title={order.description}>
                              {order.description}
                            </p>
                          )}

                          {/* Dados de Cliente e Produção */}
                          <div className="mt-3 pt-2.5 border-t border-[#f2e6dc] space-y-1.5 text-xs text-[#50453a]">
                            {order.company && (
                              <div className="flex items-center gap-1.5 font-medium truncate">
                                <Building2 className="w-3.5 h-3.5 text-[#855300] flex-shrink-0" />
                                <span className="truncate"><strong>Empresa:</strong> {order.company.trade_name}</span>
                              </div>
                            )}
                            {order.person && (
                              <div className="flex items-center gap-1.5 font-medium truncate">
                                <User className="w-3.5 h-3.5 text-[#496636] flex-shrink-0" />
                                <span className="truncate"><strong>Pessoa:</strong> {order.person.name}</span>
                              </div>
                            )}
                            {!order.company && !order.person && order.contact_name && (
                              <div className="flex items-center gap-1.5 font-medium truncate">
                                <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                <span className="truncate"><strong>Contato:</strong> {order.contact_name}</span>
                              </div>
                            )}

                            <div className="flex items-center justify-between text-[11px] pt-1">
                              <span className="font-semibold text-[#855300]">
                                🍪 {order.quantity} un.
                              </span>
                              {order.delivery_date && (
                                <span className="flex items-center gap-1 text-purple-700 font-bold">
                                  <Calendar className="w-3 h-3" /> {order.delivery_date}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Rodapé: Valor e Mudança de Fase */}
                        <div className="mt-3 pt-2 border-t border-[#f2e6dc]">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-extrabold text-sm text-[#211a14]">
                              {formatCurrency(order.total_value)}
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setViewingOrder(order)}
                                title="Ver Detalhes & Histórico"
                                className="p-1 rounded-lg text-gray-400 hover:text-[#855300] hover:bg-[#fff8f4] cursor-pointer"
                              >
                                <History className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openEditModal(order)}
                                title="Editar Pedido"
                                className="p-1 rounded-lg text-gray-400 hover:text-[#855300] hover:bg-[#fff8f4] cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(order.id)}
                                title="Excluir Pedido"
                                className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Seletor Rápido de Fase */}
                          <div className="pt-2 border-t border-dashed border-[#d4c3b5]/60 flex items-center justify-between text-[11px]">
                            <span className="text-[#a08a73]">Avançar para:</span>
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              className="bg-[#f7ede5] border border-[#d4c3b5] rounded-lg px-1.5 py-0.5 text-[#211a14] focus:outline-hidden text-[11px] font-semibold"
                            >
                              {ORDER_STAGES.map(s => (
                                <option key={s.id} value={s.id}>{s.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Modo Lista / Tabela */
        <div className="bg-white rounded-3xl border border-[#d4c3b5] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f7ede5] text-[#50453a] border-b border-[#d4c3b5] font-bold">
                  <th className="py-3.5 px-4">Pedido / Título</th>
                  <th className="py-3.5 px-4">Fase Atual</th>
                  <th className="py-3.5 px-4">Cliente / Contato</th>
                  <th className="py-3.5 px-4">Qtd</th>
                  <th className="py-3.5 px-4">Valor Total</th>
                  <th className="py-3.5 px-4">Entrega</th>
                  <th className="py-3.5 px-4">Pagamento</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f7ede5]">
                {filteredOrders.map((order) => {
                  const stageObj = ORDER_STAGES.find(s => s.id === order.status);
                  return (
                    <tr key={order.id} className="hover:bg-[#fffaf6] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono text-[11px] font-bold text-[#855300]">
                          {order.order_number}
                        </div>
                        <div
                          onClick={() => setViewingOrder(order)}
                          className="font-bold text-[#211a14] hover:text-[#855300] cursor-pointer text-sm"
                        >
                          {order.title}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${stageObj?.badge || 'bg-gray-100 text-gray-800'}`}>
                          {stageObj?.label || order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#50453a]">
                        {order.company ? (
                          <div className="font-medium text-[#211a14] flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-[#855300]" />
                            <span>{order.company.trade_name}</span>
                          </div>
                        ) : order.person ? (
                          <div className="font-medium text-[#211a14] flex items-center gap-1">
                            <User className="w-3 h-3 text-[#496636]" />
                            <span>{order.person.name}</span>
                          </div>
                        ) : (
                          <span>{order.contact_name || '—'}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#855300]">
                        🍪 {order.quantity} un.
                      </td>
                      <td className="py-3 px-4 font-bold text-[#211a14]">
                        {formatCurrency(order.total_value)}
                      </td>
                      <td className="py-3 px-4 text-[#50453a]">
                        {order.delivery_date ? (
                          <span className="flex items-center gap-1 text-purple-700 font-medium">
                            <Calendar className="w-3 h-3" /> {order.delivery_date}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          order.payment_status === 'Pago' ? 'bg-emerald-100 text-emerald-800' :
                          order.payment_status === 'Faturado' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingOrder(order)}
                            className="px-2.5 py-1 text-xs font-bold text-[#855300] hover:bg-[#ffddb8]/30 rounded-lg cursor-pointer"
                          >
                            Ver
                          </button>
                          <button
                            onClick={() => openEditModal(order)}
                            title="Editar"
                            className="p-1.5 rounded-lg text-[#715b41] hover:text-[#855300] hover:bg-[#ffddb8]/40 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(order.id)}
                            title="Excluir"
                            className="p-1.5 rounded-lg text-[#ba1a1a] hover:bg-[#ffdad6]/40 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal M3 de Criação / Edição do Pedido */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#fff8f4] border border-[#d4c3b5] w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-2xl m3-elevation-3 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#d4c3b5]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-[#855300]" />
                <h3 className="text-xl font-bold text-[#211a14]">
                  {editingOrder ? `Editar Pedido ${editingOrder.order_number}` : 'Cadastrar Novo Pedido'}
                </h3>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-2 text-[#715b41] hover:text-[#211a14] rounded-full hover:bg-[#f7ede5] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-5">
              {/* Seção 1: Dados Básicos e Fase */}
              <div className="bg-white p-4 rounded-2xl border border-[#d4c3b5] space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#855300] flex items-center gap-1.5">
                  <Package className="w-4 h-4" /> Informações do Pedido
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#211a14] mb-1">
                      Título do Pedido *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 300 Biscoitos Decorados com Glacê Real e Logo"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full text-xs bg-[#f7ede5] border border-[#d4c3b5] rounded-xl px-3 py-2 text-[#211a14] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#211a14] mb-1">
                      Fase do Pedido *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full text-xs bg-[#f7ede5] border border-[#d4c3b5] rounded-xl px-3 py-2 text-[#211a14] focus:outline-hidden font-semibold"
                    >
                      {ORDER_STAGES.map(s => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#211a14] mb-1">
                    Descrição & Especificações do Biscoito *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Sabores (baunilha, especiarias), cortadores personalizados, cores do glacê, acabamento..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full text-xs bg-[#f7ede5] border border-[#d4c3b5] rounded-xl p-3 text-[#211a14] focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#211a14] mb-1">
                      Quantidade (unidades)
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full text-xs bg-[#f7ede5] border border-[#d4c3b5] rounded-xl px-3 py-2 text-[#211a14] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#211a14] mb-1">
                      Valor Total (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.total_value}
                      onChange={(e) => setFormData({ ...formData, total_value: e.target.value })}
                      className="w-full text-xs bg-[#f7ede5] border border-[#d4c3b5] rounded-xl px-3 py-2 text-[#211a14] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#211a14] mb-1">
                      Prioridade *
                    </label>
                    <select
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
                  <div>
                    <label className="block text-xs font-bold text-[#211a14] mb-1">
                      Tipo de Cliente *
                    </label>
                    <select
                      value={formData.customer_type}
                      onChange={(e) => setFormData({ ...formData, customer_type: e.target.value })}
                      className="w-full text-xs bg-[#f7ede5] border border-[#d4c3b5] rounded-xl px-3 py-2 text-[#211a14] focus:outline-hidden"
                    >
                      <option value="B2B">B2B (Empresa)</option>
                      <option value="B2C">B2C (Consumidor)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Seção 2: Cliente & Datas */}
              <div className="bg-white p-4 rounded-2xl border border-[#d4c3b5] space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#855300] flex items-center gap-1.5">
                  <User className="w-4 h-4" /> Cliente & Prazos de Entrega
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#211a14] mb-1">
                      Empresa Cadastrada
                    </label>
                    <select
                      value={formData.company_id}
                      onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                      className="w-full text-xs bg-[#f7ede5] border border-[#d4c3b5] rounded-xl px-3 py-2 text-[#211a14] focus:outline-hidden"
                    >
                      <option value="">Nenhuma empresa selecionada</option>
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
                      <option value="">Nenhuma pessoa selecionada</option>
                      {persons.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

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
                      Telefone / WhatsApp
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
                      Data da Entrega / Evento
                    </label>
                    <input
                      type="date"
                      value={formData.delivery_date}
                      onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                      className="w-full text-xs bg-[#f7ede5] border border-[#d4c3b5] rounded-xl px-3 py-2 text-[#211a14] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 3: Fases Específicas de Produção */}
              <div className="bg-white p-4 rounded-2xl border border-[#d4c3b5] space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#855300] flex items-center gap-1.5">
                  <ChefHat className="w-4 h-4" /> Detalhamento Operacional das Fases
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#211a14] mb-1">
                      Provisão de Recursos (Insumos & Cortadores)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Farinha especial, corantes, laços, tags gráficas, caixas..."
                      value={formData.resources_notes}
                      onChange={(e) => setFormData({ ...formData, resources_notes: e.target.value })}
                      className="w-full text-xs bg-[#f7ede5] border border-[#d4c3b5] rounded-xl p-2.5 text-[#211a14] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#211a14] mb-1">
                      Linha de Produção (Fornada & Confeitagem)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Lote de massa batida, tempo de forno, secagem do glacê real..."
                      value={formData.production_notes}
                      onChange={(e) => setFormData({ ...formData, production_notes: e.target.value })}
                      className="w-full text-xs bg-[#f7ede5] border border-[#d4c3b5] rounded-xl p-2.5 text-[#211a14] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#211a14] mb-1">
                      Embalagem & Finalização
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Embalagem individual celofane selado, selo de validade, fita cetim..."
                      value={formData.packaging_notes}
                      onChange={(e) => setFormData({ ...formData, packaging_notes: e.target.value })}
                      className="w-full text-xs bg-[#f7ede5] border border-[#d4c3b5] rounded-xl p-2.5 text-[#211a14] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#211a14] mb-1">
                      Entrega & Logística
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Retirada no ateliê, motoboy, transportadora, endereço e horário..."
                      value={formData.delivery_notes}
                      onChange={(e) => setFormData({ ...formData, delivery_notes: e.target.value })}
                      className="w-full text-xs bg-[#f7ede5] border border-[#d4c3b5] rounded-xl p-2.5 text-[#211a14] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-[#f2e6dc] grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#211a14] mb-1">
                      Forma de Pagamento
                    </label>
                    <select
                      value={formData.payment_method}
                      onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                      className="w-full text-xs bg-[#f7ede5] border border-[#d4c3b5] rounded-xl px-3 py-2 text-[#211a14] focus:outline-hidden"
                    >
                      <option value="Pix">Pix</option>
                      <option value="Boleto">Boleto Bancário</option>
                      <option value="Cartão de Crédito">Cartão de Crédito</option>
                      <option value="Faturado 15D">Faturado 15 Dias</option>
                      <option value="Faturado 30D">Faturado 30 Dias</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#211a14] mb-1">
                      Status do Pagamento
                    </label>
                    <select
                      value={formData.payment_status}
                      onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                      className="w-full text-xs bg-[#f7ede5] border border-[#d4c3b5] rounded-xl px-3 py-2 text-[#211a14] focus:outline-hidden font-bold"
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Entrada Paga (50%)">Entrada Paga (50%)</option>
                      <option value="Pago">Pago</option>
                      <option value="Faturado">Faturado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#211a14] mb-1">
                      Faturamento & Notas
                    </label>
                    <input
                      type="text"
                      placeholder="NF-e nº 1234, chave de acesso..."
                      value={formData.billing_notes}
                      onChange={(e) => setFormData({ ...formData, billing_notes: e.target.value })}
                      className="w-full text-xs bg-[#f7ede5] border border-[#d4c3b5] rounded-xl px-3 py-2 text-[#211a14] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Botões do Modal */}
              <div className="flex justify-end gap-3 pt-3 border-t border-[#d4c3b5]">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#d4c3b5] text-xs font-bold text-[#715b41] hover:bg-gray-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#855300] text-white text-xs font-bold hover:bg-[#6c4300] shadow-sm cursor-pointer"
                >
                  {editingOrder ? 'Salvar Alterações' : 'Criar Pedido'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal M3 de Visão Completa & Histórico do Pedido */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#fff8f4] border border-[#d4c3b5] w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-2xl m3-elevation-3 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#d4c3b5]">
              <div>
                <span className="font-mono text-xs font-black text-[#855300] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  {viewingOrder.order_number}
                </span>
                <h3 className="text-xl font-black text-[#211a14] mt-1">
                  {viewingOrder.title}
                </h3>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="p-2 text-[#715b41] hover:text-[#211a14] rounded-full hover:bg-[#f7ede5] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Visual do Ciclo do Pedido */}
            <div className="mt-5 p-4 bg-white rounded-2xl border border-[#d4c3b5]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#855300] mb-3">
                Esteira de Produção
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {ORDER_STAGES.map((st, idx) => {
                  const isCurrent = viewingOrder.status === st.id;
                  const currentIndex = ORDER_STAGES.findIndex(s => s.id === viewingOrder.status);
                  const isPast = idx < currentIndex;
                  const StIcon = st.icon;

                  return (
                    <div
                      key={st.id}
                      onClick={() => handleStatusChange(viewingOrder.id, st.id)}
                      className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-[#855300] text-white border-[#855300] shadow-sm font-bold scale-102'
                          : isPast
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <StIcon className={`w-4 h-4 mx-auto mb-1 ${isCurrent ? 'text-white' : ''}`} />
                      <div className="text-[10px] leading-tight font-semibold">{st.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detalhes do Pedido */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-[#d4c3b5] space-y-2 text-xs">
                <h5 className="font-bold text-[#211a14] uppercase text-[11px] border-b pb-1 text-[#855300]">
                  Dados Comerciais
                </h5>
                <div><strong>Tipo:</strong> {viewingOrder.customer_type}</div>
                <div><strong>Prioridade:</strong> {viewingOrder.priority}</div>
                <div><strong>Quantidade:</strong> 🍪 {viewingOrder.quantity} unidades</div>
                <div><strong>Valor Total:</strong> {formatCurrency(viewingOrder.total_value)}</div>
                <div><strong>Pagamento:</strong> {viewingOrder.payment_method} ({viewingOrder.payment_status})</div>
                <div><strong>Data do Pedido:</strong> {viewingOrder.order_date || '—'}</div>
                <div><strong>Data da Entrega:</strong> {viewingOrder.delivery_date || '—'}</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#d4c3b5] space-y-2 text-xs">
                <h5 className="font-bold text-[#211a14] uppercase text-[11px] border-b pb-1 text-[#855300]">
                  Vínculos com CRM
                </h5>
                {viewingOrder.company && (
                  <div><strong>Empresa:</strong> {viewingOrder.company.trade_name}</div>
                )}
                {viewingOrder.person && (
                  <div><strong>Pessoa:</strong> {viewingOrder.person.name}</div>
                )}
                {viewingOrder.contact_name && (
                  <div><strong>Contato:</strong> {viewingOrder.contact_name}</div>
                )}
                {viewingOrder.contact_phone && (
                  <div><strong>Telefone:</strong> {viewingOrder.contact_phone}</div>
                )}
                {viewingOrder.billing_notes && (
                  <div><strong>Faturamento:</strong> {viewingOrder.billing_notes}</div>
                )}
              </div>
            </div>

            {/* Notas Técnicas de cada fase */}
            <div className="mt-4 bg-white p-4 rounded-2xl border border-[#d4c3b5] space-y-3 text-xs">
              <h5 className="font-bold text-[#211a14] uppercase text-[11px] border-b pb-1 text-[#855300]">
                Anotações de Fabricação
              </h5>
              {viewingOrder.resources_notes && (
                <div><strong>Provisão de Recursos:</strong> {viewingOrder.resources_notes}</div>
              )}
              {viewingOrder.production_notes && (
                <div><strong>Linha de Produção:</strong> {viewingOrder.production_notes}</div>
              )}
              {viewingOrder.packaging_notes && (
                <div><strong>Embalagem:</strong> {viewingOrder.packaging_notes}</div>
              )}
              {viewingOrder.delivery_notes && (
                <div><strong>Entrega:</strong> {viewingOrder.delivery_notes}</div>
              )}
            </div>

            {/* Histórico de Mudanças de Fase */}
            <div className="mt-4 bg-white p-4 rounded-2xl border border-[#d4c3b5]">
              <h5 className="font-bold text-[#211a14] uppercase text-[11px] border-b pb-2 mb-3 text-[#855300] flex items-center gap-1.5">
                <History className="w-4 h-4" /> Histórico de Transições
              </h5>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {viewingOrder.history && viewingOrder.history.length > 0 ? (
                  viewingOrder.history.map((h) => (
                    <div key={h.id} className="text-xs p-2 bg-[#f7ede5]/60 rounded-xl border border-[#d4c3b5]/60 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-[#211a14]">
                          {h.from_status ? `${h.from_status} → ${h.to_status}` : `Início: ${h.to_status}`}
                        </span>
                        {h.notes && <p className="text-[11px] text-[#715b41] mt-0.5">{h.notes}</p>}
                      </div>
                      <div className="text-right text-[10px] text-gray-400">
                        <div>{new Date(h.created_at).toLocaleDateString('pt-BR')}</div>
                        <div>{h.changed_by}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">Nenhum histórico registrado.</p>
                )}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => {
                  const ord = viewingOrder;
                  setViewingOrder(null);
                  openEditModal(ord);
                }}
                className="px-4 py-2 rounded-xl bg-[#855300] text-white text-xs font-bold hover:bg-[#6c4300] cursor-pointer"
              >
                Editar Este Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
