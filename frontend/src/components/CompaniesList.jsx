import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { searchCep } from '../services/cep';
import InteractionsTimeline from './InteractionsTimeline';
import { 
  Building2, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  Users, 
  X, 
  AlertCircle,
  Briefcase,
  UserPlus,
  ExternalLink,
  ChevronRight,
  Filter,
  Globe,
  FileText,
  Loader2,
  Calendar,
  LayoutGrid,
  List
} from 'lucide-react';

const DEFAULT_SEGMENTS = [
  'Brindes Corporativos',
  'Eventos & Festas',
  'Varejo & Cafeterias',
  'Hotelaria & Turismo',
  'Datas Comemorativas',
  'Kits Boas-Vindas / Onboarding',
  'Outros'
];

export default function CompaniesList() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'list'

  // Segmentos disponíveis
  const [segmentsList, setSegmentsList] = useState(DEFAULT_SEGMENTS);
  const [isAddingSegment, setIsAddingSegment] = useState(false);
  const [newSegmentInput, setNewSegmentInput] = useState('');

  // Modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [viewingCompany, setViewingCompany] = useState(null);
  
  // Link Contact Modal
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [availablePersons, setAvailablePersons] = useState([]);
  const [linkData, setLinkData] = useState({
    person_id: '',
    role: '',
    department: '',
    is_primary: false
  });
  const [linkingError, setLinkingError] = useState('');

  // Form State
  const initialForm = {
    trade_name: '',
    corporate_name: '',
    cnpj: '',
    state_registration: '',
    email: '',
    phone: '',
    whatsapp: '',
    website: '',
    zip_code: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    segment: '',
    notes: ''
  };
  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  // Exclusão
  const [deletingCompany, setDeletingCompany] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      const res = await api.get('/companies', { params });
      
      let list = res.data;
      if (segmentFilter) {
        list = list.filter(c => c.segment === segmentFilter);
      }
      setCompanies(list);

      // Descobre novos segmentos a partir dos dados já salvos
      const existingSegments = new Set(DEFAULT_SEGMENTS);
      res.data.forEach(c => {
        if (c.segment && c.segment.trim()) {
          existingSegments.add(c.segment.trim());
        }
      });
      setSegmentsList(Array.from(existingSegments));

      // Se estiver visualizando uma empresa, atualiza seus dados
      if (viewingCompany) {
        const updated = res.data.find(c => c.id === viewingCompany.id);
        if (updated) setViewingCompany(updated);
      }
    } catch (err) {
      console.error('Erro ao buscar empresas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCompanies();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, segmentFilter]);

  // Busca CEP automático
  const handleCepChange = async (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, zip_code: value }));

    const clean = value.replace(/\D/g, '');
    if (clean.length === 8) {
      setLoadingCep(true);
      const address = await searchCep(clean);
      setLoadingCep(false);
      if (address) {
        setFormData(prev => ({
          ...prev,
          street: address.street || prev.street,
          neighborhood: address.neighborhood || prev.neighborhood,
          city: address.city || prev.city,
          state: address.state || prev.state,
          complement: address.complement || prev.complement
        }));
      }
    }
  };

  const handleOpenCreate = () => {
    setEditingCompany(null);
    setFormData(initialForm);
    setFormError('');
    setIsAddingSegment(false);
    setNewSegmentInput('');
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (comp) => {
    setEditingCompany(comp);
    setFormData({
      trade_name: comp.trade_name || '',
      corporate_name: comp.corporate_name || '',
      cnpj: comp.cnpj || '',
      state_registration: comp.state_registration || '',
      email: comp.email || '',
      phone: comp.phone || '',
      whatsapp: comp.whatsapp || '',
      website: comp.website || '',
      zip_code: comp.zip_code || '',
      street: comp.street || '',
      number: comp.number || '',
      complement: comp.complement || '',
      neighborhood: comp.neighborhood || '',
      city: comp.city || '',
      state: comp.state || '',
      segment: comp.segment || '',
      notes: comp.notes || ''
    });
    setFormError('');
    setIsAddingSegment(false);
    setNewSegmentInput('');
    setIsFormModalOpen(true);
  };

  const handleAddNewSegment = () => {
    if (!newSegmentInput.trim()) return;
    const trimmed = newSegmentInput.trim();
    if (!segmentsList.includes(trimmed)) {
      setSegmentsList([...segmentsList, trimmed]);
    }
    setFormData({ ...formData, segment: trimmed });
    setIsAddingSegment(false);
    setNewSegmentInput('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (editingCompany) {
        await api.put(`/companies/${editingCompany.id}`, formData);
      } else {
        await api.post('/companies', formData);
      }
      setIsFormModalOpen(false);
      fetchCompanies();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Erro ao salvar empresa.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCompany) return;
    setDeleting(true);
    try {
      await api.delete(`/companies/${deletingCompany.id}`);
      if (viewingCompany?.id === deletingCompany.id) {
        setViewingCompany(null);
      }
      setDeletingCompany(null);
      fetchCompanies();
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao excluir empresa.');
    } finally {
      setDeleting(false);
    }
  };

  // Vínculo de pessoa
  const handleOpenLinkModal = async () => {
    try {
      const res = await api.get('/persons');
      const linkedIds = viewingCompany.contacts?.map(c => c.person_id) || [];
      const unlinked = res.data.filter(p => !linkedIds.includes(p.id));
      setAvailablePersons(unlinked);
      setLinkData({
        person_id: unlinked[0]?.id || '',
        role: '',
        department: '',
        is_primary: false
      });
      setLinkingError('');
      setIsLinkModalOpen(true);
    } catch (err) {
      alert('Erro ao carregar lista de pessoas.');
    }
  };

  const handleSaveLink = async (e) => {
    e.preventDefault();
    if (!linkData.person_id) {
      setLinkingError('Selecione uma pessoa para vincular.');
      return;
    }
    try {
      await api.post(`/companies/${viewingCompany.id}/contacts`, {
        person_id: parseInt(linkData.person_id),
        role: linkData.role,
        department: linkData.department,
        is_primary: linkData.is_primary
      });
      setIsLinkModalOpen(false);
      const updated = await api.get(`/companies/${viewingCompany.id}`);
      setViewingCompany(updated.data);
      fetchCompanies();
    } catch (err) {
      setLinkingError(err.response?.data?.detail || 'Erro ao vincular pessoa.');
    }
  };

  const handleRemoveContact = async (contactId) => {
    if (!window.confirm('Deseja desvincular esta pessoa da empresa?')) return;
    try {
      await api.delete(`/persons/contacts/${contactId}`);
      const updated = await api.get(`/companies/${viewingCompany.id}`);
      setViewingCompany(updated.data);
      fetchCompanies();
    } catch (err) {
      alert('Erro ao remover vínculo.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#211a14] tracking-tight">
              Empresas
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ffddb8] text-[#855300]">
              CRM
            </span>
          </div>
          <p className="text-sm text-[#715b41]">
            Cadastro de clientes corporativos, parceiros e eventos
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#855300] hover:bg-[#6c4300] text-white font-semibold text-sm shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Empresa</span>
        </button>
      </div>

      {/* Barra de Filtro e Busca + Alternador de Visualização */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 bg-white rounded-2xl p-2 border border-[#d4c3b5] flex items-center gap-2 shadow-xs">
          <Search className="w-5 h-5 text-[#715b41] ml-2 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por razão social, nome fantasia, CNPJ ou cidade..."
            className="w-full text-sm bg-transparent outline-none text-[#211a14] placeholder-[#827568]"
          />
          {search && (
            <button onClick={() => setSearch('')} className="p-1 text-[#715b41] hover:text-[#211a14]">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filtro por Segmento */}
        <div className="sm:w-64 bg-white rounded-2xl px-3 py-2 border border-[#d4c3b5] flex items-center gap-2 shadow-xs">
          <Filter className="w-4 h-4 text-[#715b41] flex-shrink-0" />
          <select
            value={segmentFilter}
            onChange={(e) => setSegmentFilter(e.target.value)}
            className="w-full text-xs bg-transparent outline-none text-[#211a14] font-medium"
          >
            <option value="">Todos os Segmentos</option>
            {segmentsList.map((seg) => (
              <option key={seg} value={seg}>
                {seg}
              </option>
            ))}
          </select>
        </div>

        {/* Botões de Alternância de Visualização: Cards vs Lista */}
        <div className="flex items-center bg-white rounded-2xl p-1 border border-[#d4c3b5] shadow-xs">
          <button
            onClick={() => setViewMode('cards')}
            title="Visualização em Cards"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'cards'
                ? 'bg-[#855300] text-white shadow-xs'
                : 'text-[#715b41] hover:text-[#211a14] hover:bg-[#ffddb8]/20'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden md:inline">Cards</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            title="Visualização em Lista"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'list'
                ? 'bg-[#855300] text-white shadow-xs'
                : 'text-[#715b41] hover:text-[#211a14] hover:bg-[#ffddb8]/20'
            }`}
          >
            <List className="w-4 h-4" />
            <span className="hidden md:inline">Lista</span>
          </button>
        </div>
      </div>

      {/* Exibição: Cards ou Lista */}
      {loading ? (
        <div className="text-center py-12 text-[#715b41]">
          <div className="inline-block w-7 h-7 border-3 border-[#855300] border-t-transparent rounded-full animate-spin mb-2" />
          <div>Carregando empresas...</div>
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-[#d4c3b5]">
          <Building2 className="w-10 h-10 text-[#d4c3b5] mx-auto mb-2" />
          <p className="text-sm font-semibold text-[#50453a]">Nenhuma empresa encontrada.</p>
          <p className="text-xs text-[#715b41] mt-1">Clique em "Nova Empresa" para iniciar o cadastro.</p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {companies.map((comp) => (
            <div
              key={comp.id}
              className="bg-white rounded-3xl border border-[#d4c3b5] p-5 hover:border-[#855300]/50 transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
            >
              <div>
                {/* Cabeçalho do Card */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#ffddb8] text-[#855300] flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {comp.trade_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3
                        onClick={() => setViewingCompany(comp)}
                        className="font-bold text-[#211a14] text-base leading-snug line-clamp-1 hover:text-[#855300] cursor-pointer"
                        title={comp.trade_name}
                      >
                        {comp.trade_name}
                      </h3>
                      {comp.corporate_name && (
                        <p className="text-xs text-[#715b41] line-clamp-1" title={comp.corporate_name}>
                          {comp.corporate_name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dados resumidos */}
                <div className="mt-4 space-y-2 text-xs text-[#50453a]">
                  {comp.cnpj && (
                    <div className="flex items-center gap-2 font-mono text-[11px] text-[#715b41]">
                      <span className="font-semibold text-[#211a14]">CNPJ:</span> {comp.cnpj}
                    </div>
                  )}

                  {comp.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#855300] flex-shrink-0" />
                      <span>{comp.city} - {comp.state}</span>
                    </div>
                  )}

                  {comp.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#855300] flex-shrink-0" />
                      <span>{comp.phone}</span>
                    </div>
                  )}
                </div>

                {/* Badge de Contatos Vinculados */}
                <div className="pt-3 mt-3 border-t border-[#f7ede5] flex items-center justify-between text-xs text-[#715b41]">
                  <div className="flex items-center gap-1 font-medium">
                    <Users className="w-4 h-4 text-[#855300]" />
                    <span>{comp.contacts?.length || 0} pessoa(s) vinculada(s)</span>
                  </div>
                  {comp.segment && (
                    <span className="text-[11px] bg-[#ffddb8]/50 px-2 py-0.5 rounded-md text-[#855300] font-semibold">
                      {comp.segment}
                    </span>
                  )}
                </div>
              </div>

              {/* Ações do Card */}
              <div className="pt-4 mt-3 border-t border-[#f7ede5] flex items-center justify-between">
                <button
                  onClick={() => setViewingCompany(comp)}
                  className="text-xs font-bold text-[#855300] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Visão Completa</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(comp)}
                    title="Editar Empresa"
                    className="p-1.5 rounded-lg text-[#715b41] hover:text-[#855300] hover:bg-[#ffddb8]/40 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingCompany(comp)}
                    title="Excluir Empresa"
                    className="p-1.5 rounded-lg text-[#ba1a1a] hover:bg-[#ffdad6]/40 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Modo Lista / Tabela */
        <div className="bg-white rounded-3xl border border-[#d4c3b5] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f7ede5] text-[#50453a] border-b border-[#d4c3b5] font-bold">
                  <th className="py-3.5 px-4">Empresa</th>
                  <th className="py-3.5 px-4">CNPJ</th>
                  <th className="py-3.5 px-4">Segmento</th>
                  <th className="py-3.5 px-4">Localização</th>
                  <th className="py-3.5 px-4">Telefone</th>
                  <th className="py-3.5 px-4 text-center">Pessoas</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f7ede5]">
                {companies.map((comp) => (
                  <tr key={comp.id} className="hover:bg-[#fffaf6] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#ffddb8] text-[#855300] flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {comp.trade_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div
                            onClick={() => setViewingCompany(comp)}
                            className="font-bold text-[#211a14] hover:text-[#855300] cursor-pointer text-sm"
                          >
                            {comp.trade_name}
                          </div>
                          {comp.corporate_name && (
                            <div className="text-[11px] text-[#715b41] truncate max-w-xs">
                              {comp.corporate_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#715b41]">
                      {comp.cnpj || '—'}
                    </td>
                    <td className="py-3 px-4">
                      {comp.segment ? (
                        <span className="text-[11px] bg-[#ffddb8]/60 px-2 py-0.5 rounded-md text-[#855300] font-semibold">
                          {comp.segment}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#50453a]">
                      {comp.city ? `${comp.city} - ${comp.state}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-[#50453a]">
                      {comp.phone || '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-semibold text-[#855300] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Users className="w-3 h-3" />
                        {comp.contacts?.length || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingCompany(comp)}
                          className="px-2.5 py-1 text-xs font-bold text-[#855300] hover:bg-[#ffddb8]/30 rounded-lg cursor-pointer"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => handleOpenEdit(comp)}
                          title="Editar"
                          className="p-1.5 rounded-lg text-[#715b41] hover:text-[#855300] hover:bg-[#ffddb8]/40 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingCompany(comp)}
                          title="Excluir"
                          className="p-1.5 rounded-lg text-[#ba1a1a] hover:bg-[#ffdad6]/40 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal M3 de Criação / Edição de Empresa */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#fff8f4] border border-[#d4c3b5] w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl m3-elevation-3 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#d4c3b5]">
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-[#855300]" />
                <h3 className="text-xl font-bold text-[#211a14]">
                  {editingCompany ? 'Editar Empresa' : 'Cadastrar Nova Empresa'}
                </h3>
              </div>
              <button 
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 text-[#715b41] hover:text-[#211a14] rounded-full hover:bg-[#f7ede5] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-2xl bg-[#ffdad6] text-[#ba1a1a] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="mt-6 space-y-6">
              {/* Seção 1: Identificação */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#855300] mb-3">
                  1. Dados Principais
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#50453a] mb-1">
                      Nome Fantasia *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.trade_name}
                      onChange={(e) => setFormData({ ...formData, trade_name: e.target.value })}
                      placeholder="Ex: Supermercados Estrela"
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#50453a] mb-1">
                      Razão Social
                    </label>
                    <input
                      type="text"
                      value={formData.corporate_name}
                      onChange={(e) => setFormData({ ...formData, corporate_name: e.target.value })}
                      placeholder="Ex: Estrela Alimentos LTDA"
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#50453a] mb-1">
                      CNPJ
                    </label>
                    <input
                      type="text"
                      value={formData.cnpj}
                      onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                      placeholder="00.000.000/0001-00"
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#50453a] mb-1">
                      Inscrição Estadual
                    </label>
                    <input
                      type="text"
                      value={formData.state_registration}
                      onChange={(e) => setFormData({ ...formData, state_registration: e.target.value })}
                      placeholder="Isento ou número estadual"
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white"
                    />
                  </div>

                  {/* Campo Segmento com Combobox Dinâmico e Adição de Novos Itens */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-[#50453a]">
                        Segmento de Atuação
                      </label>
                      {!isAddingSegment ? (
                        <button
                          type="button"
                          onClick={() => setIsAddingSegment(true)}
                          className="text-[11px] font-bold text-[#855300] hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Novo Segmento</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsAddingSegment(false)}
                          className="text-[11px] text-[#715b41] hover:underline cursor-pointer"
                        >
                          Selecionar existente
                        </button>
                      )}
                    </div>

                    {!isAddingSegment ? (
                      <select
                        value={formData.segment}
                        onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white font-medium"
                      >
                        <option value="">Selecione um segmento...</option>
                        {segmentsList.map((seg) => (
                          <option key={seg} value={seg}>
                            {seg}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          autoFocus
                          value={newSegmentInput}
                          onChange={(e) => setNewSegmentInput(e.target.value)}
                          placeholder="Digite o novo segmento..."
                          className="flex-1 px-4 py-2.5 rounded-2xl border border-[#855300] outline-none text-sm bg-white font-medium"
                        />
                        <button
                          type="button"
                          onClick={handleAddNewSegment}
                          className="px-4 py-2.5 rounded-2xl bg-[#855300] text-white text-xs font-bold hover:bg-[#6c4300] cursor-pointer"
                        >
                          Adicionar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Seção 2: Contato & Canais */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#855300] mb-3">
                  2. Contato & Canais
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#50453a] mb-1">
                      E-mail Geral
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contato@empresa.com.br"
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#50453a] mb-1">
                      Telefone Fixo
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(11) 3456-7890"
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#50453a] mb-1">
                      WhatsApp Comercial
                    </label>
                    <input
                      type="text"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="(11) 98765-4321"
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#50453a] mb-1">
                      Website
                    </label>
                    <input
                      type="text"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://empresa.com.br"
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 3: Endereço com Busca Automática por CEP */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#855300] mb-3">
                  3. Endereço Comercial
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-[#50453a]">CEP</label>
                      {loadingCep && (
                        <span className="text-[10px] text-[#855300] flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" /> Buscando...
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={formData.zip_code}
                      onChange={handleCepChange}
                      placeholder="00000-000"
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#50453a] mb-1">Logradouro / Rua</label>
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      placeholder="Av. Paulista"
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#50453a] mb-1">Número</label>
                    <input
                      type="text"
                      value={formData.number}
                      onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                      placeholder="1000"
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#50453a] mb-1">Complemento</label>
                    <input
                      type="text"
                      value={formData.complement}
                      onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                      placeholder="Sala 42"
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#50453a] mb-1">Bairro</label>
                    <input
                      type="text"
                      value={formData.neighborhood}
                      onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                      placeholder="Bela Vista"
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#50453a] mb-1">Cidade</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="São Paulo"
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#50453a] mb-1">UF / Estado</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="SP"
                      maxLength={2}
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 4: Notas Gerais Iniciais */}
              <div>
                <label className="block text-xs font-semibold text-[#50453a] mb-1">
                  Anotações Gerais da Empresa
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Informações relevantes sobre volumes de compra, datas comemorativas recorrentes..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white resize-y"
                />
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#d4c3b5]">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-[#827568] text-xs font-semibold text-[#50453a] hover:bg-[#f7ede5] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-full bg-[#855300] hover:bg-[#6c4300] text-white text-sm font-semibold shadow-sm cursor-pointer"
                >
                  {saving ? 'Salvando...' : 'Salvar Empresa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VISÃO COMPLETA DA EMPRESA (Full Overview + Contatos + Histórico de Interações) */}
      {viewingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#fff8f4] border border-[#d4c3b5] w-full max-w-4xl rounded-3xl p-6 sm:p-8 shadow-2xl m3-elevation-3 my-4 max-h-[95vh] overflow-y-auto">
            {/* Header da Visão Completa */}
            <div className="flex items-start justify-between pb-5 border-b border-[#d4c3b5]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#ffddb8] text-[#855300] font-black text-2xl flex items-center justify-center shadow-xs">
                  {viewingCompany.trade_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black text-[#211a14] tracking-tight">
                      {viewingCompany.trade_name}
                    </h2>
                    {viewingCompany.segment && (
                      <span className="text-xs px-3 py-1 rounded-full bg-[#ffddb8] text-[#855300] font-bold">
                        {viewingCompany.segment}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#715b41] mt-0.5">
                    {viewingCompany.corporate_name || 'Razão Social não informada'} • CNPJ: {viewingCompany.cnpj || 'Não informado'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleOpenEdit(viewingCompany);
                  }}
                  className="p-2 rounded-xl text-[#715b41] hover:text-[#855300] hover:bg-[#ffddb8]/40 cursor-pointer"
                  title="Editar Dados da Empresa"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewingCompany(null)}
                  className="p-2 text-[#715b41] hover:text-[#211a14] rounded-full hover:bg-[#f7ede5] cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Conteúdo da Visão Completa em Grid */}
            <div className="mt-6 space-y-6">
              {/* Painel Informativo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Comunicação */}
                <div className="bg-white p-4 rounded-2xl border border-[#d4c3b5] shadow-xs space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#855300] flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Comunicação & Contato
                  </span>
                  <div className="text-xs text-[#211a14] space-y-1.5 pt-1">
                    <div>
                      <span className="font-semibold text-[#715b41]">Telefone:</span> {viewingCompany.phone || 'Não informado'}
                    </div>
                    {viewingCompany.whatsapp && (
                      <div>
                        <span className="font-semibold text-[#715b41]">WhatsApp:</span>{' '}
                        <a
                          href={`https://wa.me/55${viewingCompany.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-700 font-bold hover:underline"
                        >
                          {viewingCompany.whatsapp}
                        </a>
                      </div>
                    )}
                    {viewingCompany.email && (
                      <div className="break-all">
                        <span className="font-semibold text-[#715b41]">E-mail:</span> {viewingCompany.email}
                      </div>
                    )}
                    {viewingCompany.website && (
                      <div>
                        <span className="font-semibold text-[#715b41]">Site:</span>{' '}
                        <a
                          href={viewingCompany.website.startsWith('http') ? viewingCompany.website : `https://${viewingCompany.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#855300] hover:underline"
                        >
                          {viewingCompany.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Localização */}
                <div className="bg-white p-4 rounded-2xl border border-[#d4c3b5] shadow-xs space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#855300] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Endereço Comercial
                  </span>
                  <div className="text-xs text-[#211a14] pt-1">
                    {viewingCompany.street || viewingCompany.city ? (
                      <div className="space-y-1">
                        <div className="font-semibold">
                          {viewingCompany.street || ''} {viewingCompany.number ? `, ${viewingCompany.number}` : ''}
                        </div>
                        {viewingCompany.complement && <div className="text-[#715b41]">{viewingCompany.complement}</div>}
                        <div className="text-[#50453a]">
                          {viewingCompany.neighborhood && `${viewingCompany.neighborhood} • `}
                          {viewingCompany.city} - {viewingCompany.state}
                        </div>
                        {viewingCompany.zip_code && (
                          <div className="text-[11px] text-[#715b41]">CEP: {viewingCompany.zip_code}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-[#715b41] italic">Endereço não cadastrado</span>
                    )}
                  </div>
                </div>

                {/* Dados Fiscais / Inscrição */}
                <div className="bg-white p-4 rounded-2xl border border-[#d4c3b5] shadow-xs space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#855300] flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" /> Dados Fiscais & Cadastro
                  </span>
                  <div className="text-xs text-[#211a14] space-y-1.5 pt-1">
                    <div>
                      <span className="font-semibold text-[#715b41]">Inscrição Estadual:</span>{' '}
                      {viewingCompany.state_registration || 'Não informada'}
                    </div>
                    <div>
                      <span className="font-semibold text-[#715b41]">Cliente Desde:</span>{' '}
                      {new Date(viewingCompany.created_at).toLocaleDateString('pt-BR')}
                    </div>
                    {viewingCompany.notes && (
                      <div className="pt-1 border-t border-[#f7ede5]">
                        <span className="text-[10px] font-bold uppercase text-[#715b41] block">Anotação Cadastral:</span>
                        <p className="text-xs text-[#50453a] line-clamp-3 italic">{viewingCompany.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Seção de Pessoas e Equipe Vinculada */}
              <div className="bg-[#fff8f4] border border-[#d4c3b5] rounded-3xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-[#211a14] flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#855300]" />
                      Pessoas e Contatos Vinculados ({viewingCompany.contacts?.length || 0})
                    </h3>
                    <p className="text-xs text-[#715b41]">
                      Equipe e pessoas que interagem pela empresa com seus respectivos cargos e departamentos
                    </p>
                  </div>

                  <button
                    onClick={handleOpenLinkModal}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ffddb8] hover:bg-[#feddbd] text-[#855300] font-bold text-xs transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Vincular Pessoa</span>
                  </button>
                </div>

                {/* Lista de Vínculos da Empresa */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {viewingCompany.contacts && viewingCompany.contacts.length > 0 ? (
                    viewingCompany.contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="bg-white p-4 rounded-2xl border border-[#d4c3b5] flex items-center justify-between hover:shadow-xs transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#caeca0] text-[#496636] font-bold flex items-center justify-center text-xs">
                            {contact.person?.name?.charAt(0).toUpperCase() || 'P'}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-[#211a14] flex items-center gap-2">
                              <span>{contact.person?.name}</span>
                              {contact.is_primary && (
                                <span className="text-[10px] bg-[#ffddb8] text-[#855300] px-2 py-0.5 rounded-full font-bold">
                                  Principal
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-[#715b41] flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                              <span className="font-medium text-[#855300]">
                                {contact.role || 'Cargo não especificado'}
                              </span>
                              {contact.department && <span>• {contact.department}</span>}
                              {contact.person?.phone && <span>• {contact.person.phone}</span>}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveContact(contact.id)}
                          title="Desvincular esta pessoa"
                          className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full bg-white p-6 rounded-2xl border border-dashed border-[#d4c3b5] text-center text-xs text-[#715b41]">
                      Nenhuma pessoa associada a esta empresa ainda. Clique em "Vincular Pessoa" para selecionar uma pessoa cadastrada no CRM e definir seu cargo.
                    </div>
                  )}
                </div>
              </div>

              {/* Seção CRÍTICA: Histórico de Contatos e Anotações no CRM */}
              <div className="bg-[#f7ede5]/60 border border-[#d4c3b5] rounded-3xl p-5 shadow-xs">
                <InteractionsTimeline
                  entityType="company"
                  entityId={viewingCompany.id}
                  contactPersonList={viewingCompany.contacts?.map(c => c.person).filter(Boolean) || []}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal M3 para Vincular Pessoa à Empresa */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#fff8f4] border border-[#d4c3b5] w-full max-w-md rounded-3xl p-6 shadow-2xl m3-elevation-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#d4c3b5]">
              <h3 className="font-bold text-[#211a14] text-base">
                Vincular Pessoa a {viewingCompany?.trade_name}
              </h3>
              <button onClick={() => setIsLinkModalOpen(false)} className="cursor-pointer">
                <X className="w-5 h-5 text-[#715b41]" />
              </button>
            </div>

            {linkingError && (
              <div className="mt-3 p-3 rounded-2xl bg-[#ffdad6] text-[#ba1a1a] text-xs">
                {linkingError}
              </div>
            )}

            {availablePersons.length === 0 ? (
              <div className="mt-4 text-center py-6">
                <p className="text-xs text-[#715b41]">
                  Todas as pessoas cadastradas já estão vinculadas a esta empresa, ou não há pessoas no cadastro.
                </p>
                <button
                  onClick={() => setIsLinkModalOpen(false)}
                  className="mt-4 px-4 py-2 rounded-full bg-[#855300] text-white text-xs font-semibold cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveLink} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#50453a] mb-1">
                    Selecione a Pessoa *
                  </label>
                  <select
                    required
                    value={linkData.person_id}
                    onChange={(e) => setLinkData({ ...linkData, person_id: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] bg-white text-sm outline-none font-medium"
                  >
                    {availablePersons.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.email || p.phone || 'Sem contato'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#50453a] mb-1">
                    Cargo / Função nesta Empresa
                  </label>
                  <input
                    type="text"
                    value={linkData.role}
                    onChange={(e) => setLinkData({ ...linkData, role: e.target.value })}
                    placeholder="Ex: Gerente de RH, Comprador, Diretor de Marketing"
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] bg-white text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#50453a] mb-1">
                    Departamento
                  </label>
                  <input
                    type="text"
                    value={linkData.department}
                    onChange={(e) => setLinkData({ ...linkData, department: e.target.value })}
                    placeholder="Ex: Recursos Humanos, Compras, Eventos"
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] bg-white text-sm outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="is_primary"
                    checked={linkData.is_primary}
                    onChange={(e) => setLinkData({ ...linkData, is_primary: e.target.checked })}
                    className="w-4 h-4 text-[#855300] rounded focus:ring-[#855300]"
                  />
                  <label htmlFor="is_primary" className="text-xs text-[#211a14] font-medium cursor-pointer">
                    Definir como contato principal desta empresa
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[#d4c3b5]">
                  <button
                    type="button"
                    onClick={() => setIsLinkModalOpen(false)}
                    className="px-4 py-2 rounded-full border border-[#827568] text-xs font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#855300] text-white text-xs font-bold shadow-sm cursor-pointer"
                  >
                    Confirmar Vínculo
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal de Exclusão de Empresa */}
      {deletingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#fff8f4] border border-[#d4c3b5] w-full max-w-sm rounded-3xl p-6 shadow-2xl m3-elevation-3">
            <h3 className="font-bold text-lg text-[#ba1a1a] mb-2">Excluir Empresa</h3>
            <p className="text-xs text-[#50453a] mb-6">
              Tem certeza que deseja remover <b>{deletingCompany.trade_name}</b>?
              Isso não apagará as pessoas do sistema, apenas removerá seus vínculos com esta empresa.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeletingCompany(null)}
                className="px-4 py-2 rounded-full border border-[#827568] text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2 rounded-full bg-[#ba1a1a] hover:bg-[#93000a] text-white text-xs font-bold cursor-pointer"
              >
                {deleting ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
