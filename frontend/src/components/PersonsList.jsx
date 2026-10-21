import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { searchCep } from '../services/cep';
import InteractionsTimeline from './InteractionsTimeline';
import { 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  X, 
  AlertCircle,
  Briefcase,
  ChevronRight,
  Filter,
  Calendar,
  Building,
  Loader2,
  Cake,
  ExternalLink,
  LayoutGrid,
  List
} from 'lucide-react';

export default function PersonsList() {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'list'

  // Modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [viewingPerson, setViewingPerson] = useState(null);

  // Form State
  const initialForm = {
    name: '',
    cpf: '',
    email: '',
    phone: '',
    whatsapp: '',
    birth_date: '',
    type: 'Consumidor Final',
    zip_code: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    notes: '',
    initial_company_id: '',
    initial_role: '',
    initial_department: ''
  };
  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  // Empresas disponíveis para vínculo
  const [availableCompanies, setAvailableCompanies] = useState([]);

  // Modal para adicionar nova empresa a pessoa existente
  const [isAddCompanyModalOpen, setIsAddCompanyModalOpen] = useState(false);
  const [newCompanyLink, setNewCompanyLink] = useState({
    company_id: '',
    role: '',
    department: '',
    is_primary: false
  });
  const [linkingError, setLinkingError] = useState('');

  // Exclusão
  const [deletingPerson, setDeletingPerson] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPersons = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (typeFilter) params.type = typeFilter;
      const res = await api.get('/persons', { params });
      setPersons(res.data);
      if (viewingPerson) {
        const updated = res.data.find(p => p.id === viewingPerson.id);
        if (updated) setViewingPerson(updated);
      }
    } catch (err) {
      console.error('Erro ao buscar pessoas:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/companies');
      setAvailableCompanies(res.data);
    } catch (err) {
      console.error('Erro ao carregar empresas:', err);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPersons();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, typeFilter]);

  // Busca de CEP Automática
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
    setEditingPerson(null);
    setFormData(initialForm);
    setFormError('');
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingPerson(p);
    setFormData({
      name: p.name || '',
      cpf: p.cpf || '',
      email: p.email || '',
      phone: p.phone || '',
      whatsapp: p.whatsapp || '',
      birth_date: p.birth_date || '',
      type: p.type || 'Consumidor Final',
      zip_code: p.zip_code || '',
      street: p.street || '',
      number: p.number || '',
      complement: p.complement || '',
      neighborhood: p.neighborhood || '',
      city: p.city || '',
      state: p.state || '',
      notes: p.notes || '',
      initial_company_id: '',
      initial_role: '',
      initial_department: ''
    });
    setFormError('');
    setIsFormModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (editingPerson) {
        await api.put(`/persons/${editingPerson.id}`, formData);
      } else {
        const payload = { ...formData };
        if (payload.initial_company_id) {
          payload.initial_company_id = parseInt(payload.initial_company_id);
        } else {
          delete payload.initial_company_id;
          delete payload.initial_role;
          delete payload.initial_department;
        }
        await api.post('/persons', payload);
      }
      setIsFormModalOpen(false);
      fetchPersons();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Erro ao salvar pessoa.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingPerson) return;
    setDeleting(true);
    try {
      await api.delete(`/persons/${deletingPerson.id}`);
      if (viewingPerson?.id === deletingPerson.id) {
        setViewingPerson(null);
      }
      setDeletingPerson(null);
      fetchPersons();
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao excluir pessoa.');
    } finally {
      setDeleting(false);
    }
  };

  // Vínculo com Empresa
  const handleOpenAddCompany = () => {
    const linkedCompanyIds = viewingPerson.companies?.map(c => c.company_id) || [];
    const unlinked = availableCompanies.filter(c => !linkedCompanyIds.includes(c.id));
    setNewCompanyLink({
      company_id: unlinked[0]?.id || '',
      role: '',
      department: '',
      is_primary: false
    });
    setLinkingError('');
    setIsAddCompanyModalOpen(true);
  };

  const handleSaveCompanyLink = async (e) => {
    e.preventDefault();
    if (!newCompanyLink.company_id) {
      setLinkingError('Selecione uma empresa.');
      return;
    }
    try {
      await api.post(`/companies/${newCompanyLink.company_id}/contacts`, {
        person_id: viewingPerson.id,
        role: newCompanyLink.role,
        department: newCompanyLink.department,
        is_primary: newCompanyLink.is_primary
      });
      setIsAddCompanyModalOpen(false);
      const updated = await api.get(`/persons/${viewingPerson.id}`);
      setViewingPerson(updated.data);
      fetchPersons();
    } catch (err) {
      setLinkingError(err.response?.data?.detail || 'Erro ao associar empresa.');
    }
  };

  const handleRemoveCompanyLink = async (contactId) => {
    if (!window.confirm('Deseja desassociar esta pessoa da empresa?')) return;
    try {
      await api.delete(`/persons/contacts/${contactId}`);
      const updated = await api.get(`/persons/${viewingPerson.id}`);
      setViewingPerson(updated.data);
      fetchPersons();
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
              Pessoas
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#caeca0] text-[#0b2000]">
              CRM
            </span>
          </div>
          <p className="text-sm text-[#715b41]">
            Cadastro independente de contatos corporativos, compradores e consumidores finais
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#855300] hover:bg-[#6c4300] text-white font-semibold text-sm shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Pessoa</span>
        </button>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 bg-white rounded-2xl p-2 border border-[#d4c3b5] flex items-center gap-2 shadow-xs">
          <Search className="w-5 h-5 text-[#715b41] ml-2 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail, CPF, telefone ou cidade..."
            className="w-full text-sm bg-transparent outline-none text-[#211a14] placeholder-[#827568]"
          />
          {search && (
            <button onClick={() => setSearch('')} className="p-1 text-[#715b41] hover:text-[#211a14] cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="sm:w-56 bg-white rounded-2xl px-3 py-2 border border-[#d4c3b5] flex items-center gap-2 shadow-xs">
          <Filter className="w-4 h-4 text-[#715b41] flex-shrink-0" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full text-xs bg-transparent outline-none text-[#211a14] font-medium"
          >
            <option value="">Todos os Tipos</option>
            <option value="Consumidor Final">Consumidor Final</option>
            <option value="Contato Corporativo">Contato Corporativo</option>
            <option value="Parceiro">Parceiro</option>
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
          <div>Carregando pessoas...</div>
        </div>
      ) : persons.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-[#d4c3b5]">
          <Users className="w-10 h-10 text-[#d4c3b5] mx-auto mb-2" />
          <p className="text-sm font-semibold text-[#50453a]">Nenhuma pessoa encontrada.</p>
          <p className="text-xs text-[#715b41] mt-1">Clique em "Nova Pessoa" para iniciar o cadastro.</p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {persons.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-3xl border border-[#d4c3b5] p-5 hover:border-[#855300]/50 transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#caeca0] text-[#496636] flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3
                        onClick={() => setViewingPerson(p)}
                        className="font-bold text-[#211a14] text-base leading-snug line-clamp-1 hover:text-[#855300] cursor-pointer"
                        title={p.name}
                      >
                        {p.name}
                      </h3>
                      <span className="text-[11px] font-semibold text-[#715b41] block">
                        {p.type || 'Consumidor Final'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs text-[#50453a]">
                  {p.cpf && (
                    <div className="font-mono text-[11px] text-[#715b41]">
                      <span className="font-semibold text-[#211a14]">CPF:</span> {p.cpf}
                    </div>
                  )}

                  {p.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#855300] flex-shrink-0" />
                      <span>{p.phone}</span>
                    </div>
                  )}

                  {p.email && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-[#855300] flex-shrink-0" />
                      <span className="truncate">{p.email}</span>
                    </div>
                  )}

                  {p.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#855300] flex-shrink-0" />
                      <span>{p.city} - {p.state}</span>
                    </div>
                  )}
                </div>

                {/* Empresas Vinculadas */}
                <div className="pt-3 mt-3 border-t border-[#f7ede5]">
                  <div className="flex items-center gap-1.5 text-xs text-[#715b41]">
                    <Building2 className="w-3.5 h-3.5 text-[#855300]" />
                    {p.companies && p.companies.length > 0 ? (
                      <span className="font-medium text-[#211a14]">
                        {p.companies[0].company?.trade_name}
                        {p.companies[0].role && ` (${p.companies[0].role})`}
                        {p.companies.length > 1 && ` +${p.companies.length - 1}`}
                      </span>
                    ) : (
                      <span className="italic text-[#827568]">Sem empresas vinculadas</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Ações do Card */}
              <div className="pt-4 mt-3 border-t border-[#f7ede5] flex items-center justify-between">
                <button
                  onClick={() => setViewingPerson(p)}
                  className="text-xs font-bold text-[#855300] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Visão Completa</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    title="Editar Pessoa"
                    className="p-1.5 rounded-lg text-[#715b41] hover:text-[#855300] hover:bg-[#ffddb8]/40 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingPerson(p)}
                    title="Excluir Pessoa"
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
                  <th className="py-3.5 px-4">Nome</th>
                  <th className="py-3.5 px-4">Tipo</th>
                  <th className="py-3.5 px-4">Contato</th>
                  <th className="py-3.5 px-4">Localização</th>
                  <th className="py-3.5 px-4">Empresa Vinculada</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f7ede5]">
                {persons.map((p) => (
                  <tr key={p.id} className="hover:bg-[#fffaf6] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#caeca0] text-[#496636] flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div
                            onClick={() => setViewingPerson(p)}
                            className="font-bold text-[#211a14] hover:text-[#855300] cursor-pointer text-sm"
                          >
                            {p.name}
                          </div>
                          {p.cpf && (
                            <div className="text-[11px] font-mono text-[#715b41]">
                              CPF: {p.cpf}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] bg-[#f7ede5] px-2 py-0.5 rounded-md text-[#50453a] font-semibold border border-[#d4c3b5]">
                        {p.type || 'Consumidor'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#50453a]">
                      <div>{p.phone || '—'}</div>
                      {p.email && <div className="text-[11px] text-[#715b41] truncate max-w-xs">{p.email}</div>}
                    </td>
                    <td className="py-3 px-4 text-[#50453a]">
                      {p.city ? `${p.city} - ${p.state}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-[#50453a]">
                      {p.companies && p.companies.length > 0 ? (
                        <div className="font-medium text-[#211a14] flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-[#855300] flex-shrink-0" />
                          <span className="truncate max-w-[200px]">
                            {p.companies[0].company?.trade_name}
                            {p.companies[0].role && ` (${p.companies[0].role})`}
                            {p.companies.length > 1 && ` +${p.companies.length - 1}`}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Nenhuma</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingPerson(p)}
                          className="px-2.5 py-1 text-xs font-bold text-[#855300] hover:bg-[#ffddb8]/30 rounded-lg cursor-pointer"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          title="Editar"
                          className="p-1.5 rounded-lg text-[#715b41] hover:text-[#855300] hover:bg-[#ffddb8]/40 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingPerson(p)}
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

      {/* Modal M3 de Criação / Edição de Pessoa */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#fff8f4] border border-[#d4c3b5] w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl m3-elevation-3 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#d4c3b5]">
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-[#855300]" />
                <h3 className="text-xl font-bold text-[#211a14]">
                  {editingPerson ? 'Editar Pessoa' : 'Cadastrar Nova Pessoa'}
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
              {/* Seção 1: Dados Pessoais */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#855300] mb-3">
                  1. Dados Pessoais
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#50453a] mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Mariana Albuquerque"
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#50453a] mb-1">CPF</label>
                    <input
                      type="text"
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                      placeholder="000.000.000-00"
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#50453a] mb-1">
                      Data de Nascimento / Aniversário
                    </label>
                    <input
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#50453a] mb-1">
                      Perfil / Classificação
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white font-medium"
                    >
                      <option value="Consumidor Final">Consumidor Final</option>
                      <option value="Contato Corporativo">Contato Corporativo</option>
                      <option value="Parceiro">Parceiro / Fornecedor</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Seção 2: Contatos */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#855300] mb-3">
                  2. Canais de Contato
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#50453a] mb-1">E-mail</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="mariana@exemplo.com.br"
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#50453a] mb-1">Telefone Fixo</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(11) 3456-7890"
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#50453a] mb-1">WhatsApp</label>
                    <input
                      type="text"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="(11) 98765-4321"
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 3: Endereço com Busca Automática por CEP */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#855300] mb-3">
                  3. Endereço
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
                      placeholder="Rua das Flores"
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#50453a] mb-1">Número</label>
                    <input
                      type="text"
                      value={formData.number}
                      onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                      placeholder="123"
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#50453a] mb-1">Complemento</label>
                    <input
                      type="text"
                      value={formData.complement}
                      onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                      placeholder="Apto 101"
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#50453a] mb-1">Bairro</label>
                    <input
                      type="text"
                      value={formData.neighborhood}
                      onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                      placeholder="Jardins"
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

              {/* Seção 4: Vínculo Inicial com Empresa (Apenas na criação) */}
              {!editingPerson && availableCompanies.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#855300] mb-3">
                    4. Vínculo Empresarial Inicial (Opcional)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#f7ede5]/50 p-4 rounded-2xl border border-[#d4c3b5]">
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-[#50453a] mb-1">
                        Empresa Onde Trabalha / Representa
                      </label>
                      <select
                        value={formData.initial_company_id}
                        onChange={(e) => setFormData({ ...formData, initial_company_id: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white font-medium"
                      >
                        <option value="">Não vincular a uma empresa agora (Pessoa Independente)</option>
                        {availableCompanies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.trade_name} {c.corporate_name ? `(${c.corporate_name})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {formData.initial_company_id && (
                      <>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-[#50453a] mb-1">Cargo / Função</label>
                          <input
                            type="text"
                            value={formData.initial_role}
                            onChange={(e) => setFormData({ ...formData, initial_role: e.target.value })}
                            placeholder="Ex: Coordenadora de Eventos"
                            className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] outline-none text-sm bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#50453a] mb-1">Departamento</label>
                          <input
                            type="text"
                            value={formData.initial_department}
                            onChange={(e) => setFormData({ ...formData, initial_department: e.target.value })}
                            placeholder="Ex: Marketing"
                            className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] outline-none text-sm bg-white"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Seção 5: Notas e Preferências */}
              <div>
                <label className="block text-xs font-semibold text-[#50453a] mb-1">
                  Notas / Preferências e Restrições
                </label>
                <textarea
                  rows="3"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Restrições (ex: sem glúten/lactose), sabores favoritos de biscoitos, preferências de atendimento..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white resize-y"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#d4c3b5]">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#50453a] hover:bg-[#f7ede5] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-full bg-[#855300] hover:bg-[#6c4300] text-white text-sm font-semibold shadow-sm cursor-pointer"
                >
                  {saving ? 'Salvando...' : 'Salvar Pessoa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VISÃO COMPLETA DA PESSOA (Full Overview + Empresas Vinculadas + Histórico CRM) */}
      {viewingPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#fff8f4] border border-[#d4c3b5] w-full max-w-4xl rounded-3xl p-6 sm:p-8 shadow-2xl m3-elevation-3 my-4 max-h-[95vh] overflow-y-auto">
            {/* Header da Visão Completa */}
            <div className="flex items-start justify-between pb-5 border-b border-[#d4c3b5]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#caeca0] text-[#496636] font-black text-2xl flex items-center justify-center shadow-xs">
                  {viewingPerson.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black text-[#211a14] tracking-tight">
                      {viewingPerson.name}
                    </h2>
                    <span className="text-xs px-3 py-1 rounded-full bg-[#ffddb8] text-[#855300] font-bold">
                      {viewingPerson.type || 'Consumidor Final'}
                    </span>
                  </div>
                  <p className="text-xs text-[#715b41] mt-0.5">
                    CPF: {viewingPerson.cpf || 'Não informado'} • Cadastrado em {new Date(viewingPerson.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(viewingPerson)}
                  className="p-2 rounded-xl text-[#715b41] hover:text-[#855300] hover:bg-[#ffddb8]/40 cursor-pointer"
                  title="Editar Dados da Pessoa"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewingPerson(null)}
                  className="p-2 text-[#715b41] hover:text-[#211a14] rounded-full hover:bg-[#f7ede5] cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Conteúdo da Visão Completa */}
            <div className="mt-6 space-y-6">
              {/* Painel Informativo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Canais de Comunicação */}
                <div className="bg-white p-4 rounded-2xl border border-[#d4c3b5] shadow-xs space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#855300] flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Contato Direto
                  </span>
                  <div className="text-xs text-[#211a14] space-y-1.5 pt-1">
                    <div>
                      <span className="font-semibold text-[#715b41]">Telefone:</span> {viewingPerson.phone || 'Não informado'}
                    </div>
                    {viewingPerson.whatsapp && (
                      <div>
                        <span className="font-semibold text-[#715b41]">WhatsApp:</span>{' '}
                        <a
                          href={`https://wa.me/55${viewingPerson.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-700 font-bold hover:underline"
                        >
                          {viewingPerson.whatsapp}
                        </a>
                      </div>
                    )}
                    {viewingPerson.email && (
                      <div className="break-all">
                        <span className="font-semibold text-[#715b41]">E-mail:</span> {viewingPerson.email}
                      </div>
                    )}
                    {viewingPerson.birth_date && (
                      <div className="flex items-center gap-1.5 text-amber-800 font-semibold pt-1">
                        <Cake className="w-3.5 h-3.5" />
                        <span>Aniversário: {viewingPerson.birth_date}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Endereço */}
                <div className="bg-white p-4 rounded-2xl border border-[#d4c3b5] shadow-xs space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#855300] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Endereço Residencial/Entrega
                  </span>
                  <div className="text-xs text-[#211a14] pt-1">
                    {viewingPerson.street || viewingPerson.city ? (
                      <div className="space-y-1">
                        <div className="font-semibold">
                          {viewingPerson.street || ''} {viewingPerson.number ? `, ${viewingPerson.number}` : ''}
                        </div>
                        {viewingPerson.complement && <div className="text-[#715b41]">{viewingPerson.complement}</div>}
                        <div className="text-[#50453a]">
                          {viewingPerson.neighborhood && `${viewingPerson.neighborhood} • `}
                          {viewingPerson.city} - {viewingPerson.state}
                        </div>
                        {viewingPerson.zip_code && (
                          <div className="text-[11px] text-[#715b41]">CEP: {viewingPerson.zip_code}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-[#715b41] italic">Endereço não cadastrado</span>
                    )}
                  </div>
                </div>

                {/* Preferências e Sabores de Biscoitos */}
                <div className="bg-white p-4 rounded-2xl border border-[#d4c3b5] shadow-xs space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#855300] flex items-center gap-1.5">
                    <Cake className="w-3.5 h-3.5" /> Preferências do Cliente
                  </span>
                  <div className="text-xs text-[#211a14] pt-1">
                    {viewingPerson.notes ? (
                      <p className="text-xs text-[#50453a] whitespace-pre-wrap leading-relaxed">
                        {viewingPerson.notes}
                      </p>
                    ) : (
                      <span className="text-[#715b41] italic">Nenhuma preferência ou restrição anotada.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Seção de Empresas Vinculadas */}
              <div className="bg-[#fff8f4] border border-[#d4c3b5] rounded-3xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-[#211a14] flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-[#855300]" />
                      Empresas Associadas ({viewingPerson.companies?.length || 0})
                    </h3>
                    <p className="text-xs text-[#715b41]">
                      Empresas onde esta pessoa atua como compradora, representante ou contato
                    </p>
                  </div>

                  <button
                    onClick={handleOpenAddCompany}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ffddb8] hover:bg-[#feddbd] text-[#855300] font-bold text-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Associar Empresa</span>
                  </button>
                </div>

                {/* Lista de Vínculos da Pessoa */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {viewingPerson.companies && viewingPerson.companies.length > 0 ? (
                    viewingPerson.companies.map((contact) => (
                      <div
                        key={contact.id}
                        className="bg-white p-4 rounded-2xl border border-[#d4c3b5] flex items-center justify-between hover:shadow-xs transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#ffddb8] text-[#855300] font-bold flex items-center justify-center text-xs">
                            {contact.company?.trade_name?.charAt(0).toUpperCase() || 'E'}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-[#211a14] flex items-center gap-2">
                              <span>{contact.company?.trade_name}</span>
                              {contact.is_primary && (
                                <span className="text-[10px] bg-[#caeca0] text-[#0b2000] px-2 py-0.5 rounded-full font-bold">
                                  Principal
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-[#715b41] flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                              <span className="font-medium text-[#855300]">
                                {contact.role || 'Cargo não especificado'}
                              </span>
                              {contact.department && <span>• {contact.department}</span>}
                              {contact.company?.city && <span>• {contact.company.city}</span>}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveCompanyLink(contact.id)}
                          title="Desassociar desta empresa"
                          className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full bg-white p-6 rounded-2xl border border-dashed border-[#d4c3b5] text-center text-xs text-[#715b41]">
                      Esta pessoa não está vinculada a nenhuma empresa. Caso passe a representar uma organização, clique em "Associar Empresa".
                    </div>
                  )}
                </div>
              </div>

              {/* Seção CRÍTICA: Histórico de Contatos e Anotações no CRM */}
              <div className="bg-[#f7ede5]/60 border border-[#d4c3b5] rounded-3xl p-5 shadow-xs">
                <InteractionsTimeline
                  entityType="person"
                  entityId={viewingPerson.id}
                  contactPersonList={[viewingPerson]}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal M3 para Associar Empresa à Pessoa */}
      {isAddCompanyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#fff8f4] border border-[#d4c3b5] w-full max-w-md rounded-3xl p-6 shadow-2xl m3-elevation-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#d4c3b5]">
              <h3 className="font-bold text-[#211a14] text-base">
                Associar {viewingPerson?.name} a uma Empresa
              </h3>
              <button onClick={() => setIsAddCompanyModalOpen(false)} className="cursor-pointer">
                <X className="w-5 h-5 text-[#715b41]" />
              </button>
            </div>

            {linkingError && (
              <div className="mt-3 p-3 rounded-2xl bg-[#ffdad6] text-[#ba1a1a] text-xs">
                {linkingError}
              </div>
            )}

            <form onSubmit={handleSaveCompanyLink} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#50453a] mb-1">
                  Selecione a Empresa *
                </label>
                <select
                  required
                  value={newCompanyLink.company_id}
                  onChange={(e) => setNewCompanyLink({ ...newCompanyLink, company_id: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] bg-white text-sm outline-none font-medium"
                >
                  <option value="">Selecione uma empresa...</option>
                  {availableCompanies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.trade_name} {c.cnpj ? `(CNPJ: ${c.cnpj})` : ''}
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
                  value={newCompanyLink.role}
                  onChange={(e) => setNewCompanyLink({ ...newCompanyLink, role: e.target.value })}
                  placeholder="Ex: Compradora Sênior, Diretora de RH"
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] bg-white text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#50453a] mb-1">
                  Departamento
                </label>
                <input
                  type="text"
                  value={newCompanyLink.department}
                  onChange={(e) => setNewCompanyLink({ ...newCompanyLink, department: e.target.value })}
                  placeholder="Ex: Suprimentos, Gente & Gestão"
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] bg-white text-sm outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_primary_company"
                  checked={newCompanyLink.is_primary}
                  onChange={(e) => setNewCompanyLink({ ...newCompanyLink, is_primary: e.target.checked })}
                  className="w-4 h-4 text-[#855300] rounded focus:ring-[#855300]"
                />
                <label htmlFor="is_primary_company" className="text-xs text-[#211a14] font-medium cursor-pointer">
                  Definir como contato principal desta empresa
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#d4c3b5]">
                <button
                  type="button"
                  onClick={() => setIsAddCompanyModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#827568] text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#855300] text-white text-xs font-bold shadow-sm cursor-pointer"
                >
                  Associar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Exclusão de Pessoa */}
      {deletingPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#fff8f4] border border-[#d4c3b5] w-full max-w-sm rounded-3xl p-6 shadow-2xl m3-elevation-3">
            <h3 className="font-bold text-lg text-[#ba1a1a] mb-2">Excluir Pessoa</h3>
            <p className="text-xs text-[#50453a] mb-6">
              Tem certeza que deseja remover <b>{deletingPerson.name}</b>?
              Esta ação removerá todos os vínculos desta pessoa com empresas cadastradas.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeletingPerson(null)}
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
