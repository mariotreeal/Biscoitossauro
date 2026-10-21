import React, { useState, useEffect } from 'react';
import api from '../services/api';
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
  Building
} from 'lucide-react';

export default function PersonsList() {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

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
    // Vínculo inicial opcional
    initial_company_id: '',
    initial_role: '',
    initial_department: ''
  };
  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

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

  // Vincular pessoa a uma empresa adicional
  const handleOpenAddCompany = () => {
    const existingCompanyIds = viewingPerson.companies?.map(c => c.company_id) || [];
    const filtered = availableCompanies.filter(c => !existingCompanyIds.includes(c.id));
    setNewCompanyLink({
      company_id: filtered[0]?.id || '',
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
      setLinkingError(err.response?.data?.detail || 'Erro ao associar a empresa.');
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
            Cadastro independente de contatos corporativos e consumidores finais
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

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="bg-white rounded-2xl p-2 border border-[#d4c3b5] flex items-center gap-2 w-full sm:max-w-md shadow-xs">
          <Search className="w-5 h-5 text-[#715b41] ml-2 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, CPF, e-mail, telefone..."
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
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl border border-[#d4c3b5] bg-white text-sm font-medium text-[#211a14] outline-none focus:border-[#855300]"
          >
            <option value="">Todos os tipos</option>
            <option value="Consumidor Final">Consumidor Final (B2C)</option>
            <option value="Contato Corporativo">Contato Corporativo (B2B)</option>
            <option value="Parceiro">Parceiro</option>
          </select>
        </div>
      </div>

      {/* Grid de Pessoas / Cards Material 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-12 text-[#715b41]">
            <div className="inline-block w-8 h-8 border-2 border-[#855300] border-t-transparent rounded-full animate-spin mb-2" />
            <div>Carregando pessoas...</div>
          </div>
        ) : persons.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-[#d4c3b5]">
            <Users className="w-12 h-12 text-[#827568] mx-auto mb-3 opacity-40" />
            <h3 className="text-base font-bold text-[#211a14]">Nenhuma pessoa encontrada</h3>
            <p className="text-xs text-[#715b41] mt-1">
              Cadastre a primeira pessoa física ou contato comercial no botão acima.
            </p>
          </div>
        ) : (
          persons.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-3xl p-5 border border-[#d4c3b5] hover:border-[#855300] transition-all hover:shadow-md flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#caeca0] text-[#496636] flex items-center justify-center font-bold text-base flex-shrink-0">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#211a14] text-base leading-snug group-hover:text-[#855300] transition-colors">
                        {p.name}
                      </h3>
                      <span className="text-[11px] text-[#715b41] font-medium">
                        {p.type || 'Consumidor Final'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dados de Contato */}
                <div className="space-y-1.5 text-xs text-[#50453a] my-4">
                  {p.cpf && (
                    <div className="font-mono text-[11px] text-[#715b41]">
                      CPF: {p.cpf}
                    </div>
                  )}
                  {p.email && (
                    <div className="flex items-center gap-1.5 text-[#715b41] truncate">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0 text-[#855300]" />
                      <span className="truncate">{p.email}</span>
                    </div>
                  )}
                  {(p.phone || p.whatsapp) && (
                    <div className="flex items-center gap-1.5 text-[#715b41]">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0 text-[#855300]" />
                      <span>{p.whatsapp || p.phone}</span>
                    </div>
                  )}
                  {p.city && (
                    <div className="flex items-center gap-1.5 text-[#715b41]">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[#855300]" />
                      <span>{p.city}{p.state ? ` - ${p.state}` : ''}</span>
                    </div>
                  )}
                </div>

                {/* Vínculos com Empresas (Badge e Cargos) */}
                <div className="pt-3 border-t border-[#f7ede5]">
                  <div className="flex items-center gap-1 text-xs text-[#715b41] font-semibold mb-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#855300]" />
                    <span>Empresas Vinculadas ({p.companies?.length || 0}):</span>
                  </div>
                  {p.companies && p.companies.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {p.companies.map((c) => (
                        <span
                          key={c.id}
                          className="text-[11px] bg-[#f7ede5] text-[#211a14] px-2 py-0.5 rounded-md font-medium border border-[#d4c3b5]/50 flex items-center gap-1"
                        >
                          <span className="font-bold">{c.company?.trade_name}</span>
                          {c.role && <span className="text-[#855300]">({c.role})</span>}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-[#827568] italic">Sem vínculos empresariais (Pessoa física individual)</span>
                  )}
                </div>
              </div>

              {/* Ações do Card */}
              <div className="pt-4 mt-3 border-t border-[#f7ede5] flex items-center justify-between">
                <button
                  onClick={() => setViewingPerson(p)}
                  className="text-xs font-bold text-[#855300] hover:underline flex items-center gap-1"
                >
                  <span>Ficha & Empresas</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    title="Editar Pessoa"
                    className="p-1.5 rounded-lg text-[#715b41] hover:text-[#855300] hover:bg-[#ffddb8]/40"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingPerson(p)}
                    title="Excluir Pessoa"
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

      {/* Modal M3 de Criação / Edição de Pessoa */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#fff8f4] border border-[#d4c3b5] w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl m3-elevation-3 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#d4c3b5]">
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-[#855300]" />
                <h3 className="text-xl font-bold text-[#211a14]">
                  {editingPerson ? 'Editar Cadastro de Pessoa' : 'Nova Pessoa (CRM)'}
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
                      placeholder="Ex: Maria Fernandes"
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#50453a] mb-1">
                      CPF
                    </label>
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
                      Tipo de Contato / Perfil
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white"
                    >
                      <option value="Consumidor Final">Consumidor Final (B2C)</option>
                      <option value="Contato Corporativo">Contato Corporativo (B2B)</option>
                      <option value="Parceiro">Parceiro / Fornecedor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#50453a] mb-1">
                      Data de Nascimento
                    </label>
                    <input
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 2: Contato */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#855300] mb-3">
                  2. Contatos & Comunicação
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#50453a] mb-1">
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="maria@email.com"
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#50453a] mb-1">
                      WhatsApp / Celular
                    </label>
                    <input
                      type="text"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="(11) 99999-8888"
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] outline-none text-sm bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 3: Vínculo Opcional Imediato com Empresa (na criação) */}
              {!editingPerson && (
                <div className="p-4 bg-[#f7ede5] rounded-2xl border border-[#d4c3b5]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#855300] mb-2 flex items-center gap-1.5">
                    <Building className="w-4 h-4" />
                    Vincular a uma Empresa Agora (Opcional)
                  </h4>
                  <p className="text-xs text-[#715b41] mb-3">
                    Você pode associar esta pessoa a uma empresa agora ou fazer isso depois.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#50453a] mb-1">Empresa</label>
                      <select
                        value={formData.initial_company_id}
                        onChange={(e) => setFormData({ ...formData, initial_company_id: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-[#827568] bg-white text-xs outline-none"
                      >
                        <option value="">Nenhuma por enquanto</option>
                        {availableCompanies.map((c) => (
                          <option key={c.id} value={c.id}>{c.trade_name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#50453a] mb-1">Cargo / Função</label>
                      <input
                        type="text"
                        value={formData.initial_role}
                        onChange={(e) => setFormData({ ...formData, initial_role: e.target.value })}
                        placeholder="Ex: Gerente de RH"
                        className="w-full px-3 py-2 rounded-xl border border-[#827568] bg-white text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#50453a] mb-1">Departamento</label>
                      <input
                        type="text"
                        value={formData.initial_department}
                        onChange={(e) => setFormData({ ...formData, initial_department: e.target.value })}
                        placeholder="Ex: Compras"
                        className="w-full px-3 py-2 rounded-xl border border-[#827568] bg-white text-xs outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Seção 4: Endereço */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#855300] mb-3">
                  3. Endereço de Entrega / Residencial
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

              {/* Seção 5: Observações */}
              <div>
                <label className="block text-xs font-semibold text-[#50453a] mb-1">
                  Notas / Preferências de Biscoitos
                </label>
                <textarea
                  rows="3"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Restrições (ex: sem glúten/lactose), sabores favoritos, observações..."
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
                  {saving ? 'Salvando...' : 'Salvar Pessoa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drawer / Modal de Detalhes da Pessoa (Ficha Completa + Empresas Vinculadas) */}
      {viewingPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#fff8f4] border border-[#d4c3b5] w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl m3-elevation-3 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-[#d4c3b5]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#caeca0] text-[#496636] font-bold text-lg flex items-center justify-center">
                  {viewingPerson.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#211a14]">
                    {viewingPerson.name}
                  </h2>
                  <p className="text-xs text-[#715b41]">
                    {viewingPerson.type || 'Consumidor Final'} • CPF: {viewingPerson.cpf || 'Não informado'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingPerson(null)}
                className="p-1.5 text-[#715b41] hover:text-[#211a14] rounded-full hover:bg-[#f7ede5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {/* Contatos e Endereço */}
              <div className="bg-white p-5 rounded-2xl border border-[#d4c3b5] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-bold text-[#715b41] uppercase tracking-wider block mb-1">
                    Canais de Comunicação
                  </span>
                  <div className="space-y-1 text-sm text-[#211a14]">
                    {viewingPerson.email && <div>E-mail: <strong className="text-[#855300]">{viewingPerson.email}</strong></div>}
                    {viewingPerson.whatsapp && <div>WhatsApp: <strong>{viewingPerson.whatsapp}</strong></div>}
                    {viewingPerson.birth_date && <div>Aniversário: <strong>{viewingPerson.birth_date}</strong></div>}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-[#715b41] uppercase tracking-wider block mb-1">
                    Endereço
                  </span>
                  <div className="text-sm text-[#211a14]">
                    {viewingPerson.city ? (
                      <div>
                        {viewingPerson.street && `${viewingPerson.street}, ${viewingPerson.number || 'S/N'}`}<br />
                        {viewingPerson.city} - {viewingPerson.state} ({viewingPerson.zip_code || ''})
                      </div>
                    ) : (
                      'Não informado'
                    )}
                  </div>
                </div>

                {viewingPerson.notes && (
                  <div className="sm:col-span-2 pt-2 border-t border-[#f7ede5]">
                    <span className="font-bold text-[#715b41] uppercase tracking-wider block mb-1">
                      Preferências / Sabores
                    </span>
                    <p className="text-[#50453a] whitespace-pre-wrap">{viewingPerson.notes}</p>
                  </div>
                )}
              </div>

              {/* Relação de Empresas onde atua / Cargos */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-[#211a14] flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-[#855300]" />
                      Empresas Associadas & Cargos
                    </h3>
                    <p className="text-xs text-[#715b41]">
                      Empresas com as quais {viewingPerson.name} mantém vínculo profissional
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

                <div className="space-y-2">
                  {viewingPerson.companies && viewingPerson.companies.length > 0 ? (
                    viewingPerson.companies.map((link) => (
                      <div
                        key={link.id}
                        className="bg-white p-4 rounded-2xl border border-[#d4c3b5] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#ffddb8] text-[#855300] flex items-center justify-center font-bold text-xs">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-[#211a14] flex items-center gap-2">
                              <span>{link.company?.trade_name}</span>
                              {link.is_primary && (
                                <span className="text-[10px] bg-[#caeca0] text-[#0b2000] px-2 py-0.5 rounded-full font-bold">
                                  Contato Principal
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-[#715b41] flex items-center gap-2 mt-0.5">
                              <span className="font-semibold text-[#855300]">
                                {link.role || 'Cargo não especificado'}
                              </span>
                              {link.department && <span>• {link.department}</span>}
                              {link.company?.city && <span>• {link.company.city}</span>}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveCompanyLink(link.id)}
                          title="Desassociar desta empresa"
                          className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white p-6 rounded-2xl border border-[#d4c3b5] text-center text-xs text-[#715b41]">
                      Esta pessoa não possui nenhuma empresa associada. Clique em "Associar Empresa" caso ela atue como contato corporativo ou representante.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal M3 para associar empresa à pessoa */}
      {isAddCompanyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#fff8f4] border border-[#d4c3b5] w-full max-w-md rounded-3xl p-6 shadow-2xl m3-elevation-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#d4c3b5]">
              <h3 className="font-bold text-[#211a14] text-base">
                Associar {viewingPerson?.name} a Empresa
              </h3>
              <button onClick={() => setIsAddCompanyModalOpen(false)}>
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
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] bg-white text-sm outline-none"
                >
                  <option value="">Selecione...</option>
                  {availableCompanies.map((c) => (
                    <option key={c.id} value={c.id}>{c.trade_name} ({c.city || 'Sem cidade'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#50453a] mb-1">
                  Cargo / Função que ocupa na Empresa *
                </label>
                <input
                  type="text"
                  required
                  value={newCompanyLink.role}
                  onChange={(e) => setNewCompanyLink({ ...newCompanyLink, role: e.target.value })}
                  placeholder="Ex: Diretor Geral, Comprador, Coordenador de Marketing"
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
                  placeholder="Ex: Suprimentos, Recursos Humanos"
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] bg-white text-sm outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_prim_pers"
                  checked={newCompanyLink.is_primary}
                  onChange={(e) => setNewCompanyLink({ ...newCompanyLink, is_primary: e.target.checked })}
                  className="w-4 h-4 text-[#855300] accent-[#855300] rounded"
                />
                <label htmlFor="is_prim_pers" className="text-xs font-medium text-[#211a14] cursor-pointer">
                  Definir como contato principal desta empresa
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-[#d4c3b5]">
                <button
                  type="button"
                  onClick={() => setIsAddCompanyModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-[#50453a]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#855300] hover:bg-[#6c4300] text-white text-xs font-semibold shadow-sm"
                >
                  Confirmar Associação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal M3 de Confirmação de Exclusão */}
      {deletingPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#fff8f4] border border-[#d4c3b5] w-full max-w-sm rounded-3xl p-6 shadow-2xl m3-elevation-3 text-center">
            <div className="w-12 h-12 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#211a14]">Excluir Pessoa?</h3>
            <p className="text-sm text-[#715b41] mt-2">
              Tem certeza que deseja remover <strong>{deletingPerson.name}</strong>? Seus dados e vínculos com empresas serão excluídos.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeletingPerson(null)}
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
