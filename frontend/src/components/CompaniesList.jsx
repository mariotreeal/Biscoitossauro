import React, { useState, useEffect } from 'react';
import api from '../services/api';
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
  Filter
} from 'lucide-react';

export default function CompaniesList() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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
    status: 'Ativo',
    notes: ''
  };
  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Exclusão
  const [deletingCompany, setDeletingCompany] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/companies', { params });
      setCompanies(res.data);
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
  }, [search, statusFilter]);

  const handleOpenCreate = () => {
    setEditingCompany(null);
    setFormData(initialForm);
    setFormError('');
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
      status: comp.status || 'Ativo',
      notes: comp.notes || ''
    });
    setFormError('');
    setIsFormModalOpen(true);
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
      // Filtrar pessoas que já estão vinculadas
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
      // Recarrega empresa
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

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="bg-white rounded-2xl p-2 border border-[#d4c3b5] flex items-center gap-2 w-full sm:max-w-md shadow-xs">
          <Search className="w-5 h-5 text-[#715b41] ml-2 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome fantasia, CNPJ, cidade..."
            className="w-full text-sm bg-transparent outline-none text-[#211a14] placeholder-[#827568]"
          />
          {search && (
            <button onClick={() => setSearch('')} className="p-1 text-[#715b41] hover:text-[#211a14]">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl border border-[#d4c3b5] bg-white text-sm font-medium text-[#211a14] outline-none focus:border-[#855300]"
          >
            <option value="">Todos os status</option>
            <option value="Ativo">Ativo</option>
            <option value="Lead">Lead / Prospecção</option>
            <option value="Em Negociação">Em Negociação</option>
            <option value="Inativo">Inativo</option>
          </select>
        </div>
      </div>

      {/* Lista de Empresas / Cards Responsivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-12 text-[#715b41]">
            <div className="inline-block w-8 h-8 border-2 border-[#855300] border-t-transparent rounded-full animate-spin mb-2" />
            <div>Carregando empresas...</div>
          </div>
        ) : companies.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-[#d4c3b5]">
            <Building2 className="w-12 h-12 text-[#827568] mx-auto mb-3 opacity-40" />
            <h3 className="text-base font-bold text-[#211a14]">Nenhuma empresa encontrada</h3>
            <p className="text-xs text-[#715b41] mt-1">
              Cadastre sua primeira empresa parceira ou cliente clicando no botão acima.
            </p>
          </div>
        ) : (
          companies.map((comp) => (
            <div
              key={comp.id}
              className="bg-white rounded-3xl p-5 border border-[#d4c3b5] hover:border-[#855300] transition-all hover:shadow-md flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#ffddb8] text-[#855300] flex items-center justify-center font-bold text-base flex-shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#211a14] text-base leading-snug group-hover:text-[#855300] transition-colors">
                        {comp.trade_name}
                      </h3>
                      {comp.corporate_name && (
                        <p className="text-xs text-[#715b41] truncate max-w-[180px]">
                          {comp.corporate_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${
                    comp.status === 'Ativo'
                      ? 'bg-[#caeca0] text-[#0b2000]'
                      : comp.status === 'Lead'
                      ? 'bg-[#feddbd] text-[#281805]'
                      : 'bg-[#f7ede5] text-[#715b41]'
                  }`}>
                    {comp.status || 'Ativo'}
                  </span>
                </div>

                {/* Informações detalhadas */}
                <div className="space-y-1.5 text-xs text-[#50453a] my-4">
                  {comp.cnpj && (
                    <div className="font-mono text-[11px] text-[#715b41]">
                      CNPJ: {comp.cnpj}
                    </div>
                  )}
                  {comp.city && (
                    <div className="flex items-center gap-1.5 text-[#715b41]">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[#855300]" />
                      <span>{comp.city}{comp.state ? ` - ${comp.state}` : ''}</span>
                    </div>
                  )}
                  {comp.phone && (
                    <div className="flex items-center gap-1.5 text-[#715b41]">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0 text-[#855300]" />
                      <span>{comp.phone}</span>
                    </div>
                  )}
                </div>

                {/* Badge de Contatos Vinculados */}
                <div className="pt-3 border-t border-[#f7ede5] flex items-center justify-between text-xs text-[#715b41]">
                  <div className="flex items-center gap-1 font-medium">
                    <Users className="w-4 h-4 text-[#855300]" />
                    <span>{comp.contacts?.length || 0} pessoa(s) na equipe</span>
                  </div>
                  {comp.segment && (
                    <span className="text-[11px] bg-[#f7ede5] px-2 py-0.5 rounded-md text-[#50453a]">
                      {comp.segment}
                    </span>
                  )}
                </div>
              </div>

              {/* Ações do Card */}
              <div className="pt-4 mt-2 border-t border-[#f7ede5] flex items-center justify-between">
                <button
                  onClick={() => setViewingCompany(comp)}
                  className="text-xs font-bold text-[#855300] hover:underline flex items-center gap-1"
                >
                  <span>Ver Detalhes & Equipe</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(comp)}
                    title="Editar Empresa"
                    className="p-1.5 rounded-lg text-[#715b41] hover:text-[#855300] hover:bg-[#ffddb8]/40"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingCompany(comp)}
                    title="Excluir Empresa"
                    className="p-1.5 rounded-lg text-[#ba1a1a] hover:bg-[#ffdad6]/40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

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
                className="p-1 text-[#715b41] hover:text-[#211a14] rounded-full hover:bg-[#f7ede5]"
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
                      Status do Cliente
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white"
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Lead">Lead / Prospecção</option>
                      <option value="Em Negociação">Em Negociação</option>
                      <option value="Inativo">Inativo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#50453a] mb-1">
                      Segmento de Atuação
                    </label>
                    <input
                      type="text"
                      value={formData.segment}
                      onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                      placeholder="Ex: Brindes Corporativos, Eventos, Hotelaria"
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white"
                    />
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

              {/* Seção 3: Endereço */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#855300] mb-3">
                  3. Endereço Comercial
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#50453a] mb-1">CEP</label>
                    <input
                      type="text"
                      value={formData.zip_code}
                      onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                      placeholder="00000-000"
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#50453a] mb-1">Logradouro</label>
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
                    <label className="block text-xs font-semibold text-[#50453a] mb-1">UF (Estado)</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="SP"
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 4: Observações */}
              <div>
                <label className="block text-xs font-semibold text-[#50453a] mb-1">
                  Observações Internas do CRM
                </label>
                <textarea
                  rows="3"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Preferências de entrega, modelos de biscoitos mais pedidos, restrições..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#d4c3b5]">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-sm font-semibold text-[#50453a] hover:bg-[#f7ede5]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-full bg-[#855300] hover:bg-[#6c4300] text-white text-sm font-semibold shadow-sm"
                >
                  {saving ? 'Salvando...' : 'Salvar Empresa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drawer / Modal de Detalhes da Empresa com Gestão de Pessoas Vinculadas */}
      {viewingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#fff8f4] border border-[#d4c3b5] w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-2xl m3-elevation-3 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#d4c3b5]">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-[#211a14]">
                    {viewingCompany.trade_name}
                  </h2>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-[#caeca0] text-[#0b2000] font-semibold">
                    {viewingCompany.status || 'Ativo'}
                  </span>
                </div>
                <p className="text-xs text-[#715b41] mt-0.5">
                  {viewingCompany.corporate_name || 'Razão Social não informada'} • CNPJ: {viewingCompany.cnpj || 'Não informado'}
                </p>
              </div>
              <button
                onClick={() => setViewingCompany(null)}
                className="p-1.5 text-[#715b41] hover:text-[#211a14] rounded-full hover:bg-[#f7ede5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Abas e Conteúdo */}
            <div className="mt-6 space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-5 rounded-2xl border border-[#d4c3b5]">
                <div>
                  <span className="text-[11px] font-bold uppercase text-[#715b41] block">Contatos</span>
                  <div className="text-sm text-[#211a14] mt-1 space-y-1">
                    <div>{viewingCompany.phone || 'Sem telefone cadastrado'}</div>
                    {viewingCompany.email && <div className="text-[#855300]">{viewingCompany.email}</div>}
                    {viewingCompany.whatsapp && <div>WhatsApp: {viewingCompany.whatsapp}</div>}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase text-[#715b41] block">Localização</span>
                  <div className="text-sm text-[#211a14] mt-1">
                    {viewingCompany.city ? (
                      <div>
                        {viewingCompany.street && `${viewingCompany.street}, ${viewingCompany.number || 'S/N'}`}<br />
                        {viewingCompany.city} - {viewingCompany.state} ({viewingCompany.zip_code || ''})
                      </div>
                    ) : (
                      'Endereço não informado'
                    )}
                  </div>
                </div>

                {viewingCompany.notes && (
                  <div className="sm:col-span-2 pt-2 border-t border-[#f7ede5]">
                    <span className="text-[11px] font-bold uppercase text-[#715b41] block">Notas do CRM</span>
                    <p className="text-xs text-[#50453a] mt-1 whitespace-pre-wrap">{viewingCompany.notes}</p>
                  </div>
                )}
              </div>

              {/* Seção CRÍTICA: Equipe & Pessoas Associadas a esta Empresa */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-[#211a14] flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#855300]" />
                      Pessoas e Contatos Vinculados
                    </h3>
                    <p className="text-xs text-[#715b41]">
                      Pessoas cadastradas que atuam nesta empresa com seus respectivos cargos
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
                <div className="space-y-2">
                  {viewingCompany.contacts && viewingCompany.contacts.length > 0 ? (
                    viewingCompany.contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="bg-white p-4 rounded-2xl border border-[#d4c3b5] flex items-center justify-between hover:shadow-xs transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#caeca0] text-[#496636] font-bold flex items-center justify-center text-xs">
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
                            <div className="text-xs text-[#715b41] flex items-center gap-2 mt-0.5">
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
                          title="Remover vínculo com a empresa"
                          className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white p-6 rounded-2xl border border-[#d4c3b5] text-center text-xs text-[#715b41]">
                      Nenhuma pessoa associada a esta empresa ainda. Clique em "Vincular Pessoa" para selecionar uma pessoa já cadastrada no CRM e definir seu cargo.
                    </div>
                  )}
                </div>
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
              <button onClick={() => setIsLinkModalOpen(false)}>
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
                  className="mt-4 px-4 py-2 rounded-full bg-[#855300] text-white text-xs font-semibold"
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
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] bg-white text-sm outline-none"
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
                    Cargo / Função na Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    value={linkData.role}
                    onChange={(e) => setLinkData({ ...linkData, role: e.target.value })}
                    placeholder="Ex: Gerente de Compras, Diretor de Marketing, RH"
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
                    placeholder="Ex: Comercial, Eventos, Suprimentos"
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] bg-white text-sm outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="is_primary"
                    checked={linkData.is_primary}
                    onChange={(e) => setLinkData({ ...linkData, is_primary: e.target.checked })}
                    className="w-4 h-4 text-[#855300] accent-[#855300] rounded"
                  />
                  <label htmlFor="is_primary" className="text-xs font-medium text-[#211a14] cursor-pointer">
                    Definir como contato principal desta empresa
                  </label>
                </div>

                <div className="pt-4 flex items-center justify-end gap-2 border-t border-[#d4c3b5]">
                  <button
                    type="button"
                    onClick={() => setIsLinkModalOpen(false)}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-[#50453a]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#855300] hover:bg-[#6c4300] text-white text-xs font-semibold shadow-sm"
                  >
                    Confirmar Vínculo
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal M3 de Confirmação de Exclusão */}
      {deletingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#fff8f4] border border-[#d4c3b5] w-full max-w-sm rounded-3xl p-6 shadow-2xl m3-elevation-3 text-center">
            <div className="w-12 h-12 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#211a14]">Excluir Empresa?</h3>
            <p className="text-sm text-[#715b41] mt-2">
              Tem certeza que deseja remover <strong>{deletingCompany.trade_name}</strong>? Os vínculos com contatos também serão desfeitos.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeletingCompany(null)}
                className="px-5 py-2.5 rounded-full text-sm font-semibold text-[#50453a] hover:bg-[#f7ede5]"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-6 py-2.5 rounded-full bg-[#ba1a1a] hover:bg-[#93000a] text-white text-sm font-semibold shadow-sm"
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
