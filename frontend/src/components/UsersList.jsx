import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  UserCheck, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Mail, 
  CheckCircle2, 
  XCircle, 
  X, 
  AlertCircle,
  Key
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function UsersList() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    is_active: true
  });
  const [modalError, setModalError] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete confirmation modal
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users', { params: { search: search || undefined } });
      setUsers(res.data);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      is_active: true
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Deixar vazio se não quiser alterar
      is_active: user.is_active
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setModalError('');
    setSaving(true);
    try {
      if (editingUser) {
        // Atualizar
        const payload = {
          name: formData.name,
          email: formData.email,
          is_active: formData.is_active
        };
        if (formData.password.trim()) {
          payload.password = formData.password.trim();
        }
        await api.put(`/users/${editingUser.id}`, payload);
      } else {
        // Criar
        if (!formData.password) {
          setModalError('A senha é obrigatória para novo usuário.');
          setSaving(false);
          return;
        }
        await api.post('/users', formData);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      setModalError(err.response?.data?.detail || 'Erro ao salvar usuário.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    setDeleting(true);
    try {
      await api.delete(`/users/${deletingUser.id}`);
      setDeletingUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao excluir usuário.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#211a14] tracking-tight">
            Gestão de Usuários
          </h1>
          <p className="text-sm text-[#715b41]">
            Controle de operadores com acesso ao Portal Administrativo
          </p>
        </div>

        {/* Material 3 Filled Button */}
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#855300] hover:bg-[#6c4300] text-white font-semibold text-sm shadow-sm transition-all duration-150 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Usuário</span>
        </button>
      </div>

      {/* Barra de Busca Material 3 */}
      <div className="bg-white rounded-2xl p-2 border border-[#d4c3b5] flex items-center gap-2 max-w-md shadow-xs">
        <Search className="w-5 h-5 text-[#715b41] ml-2 flex-shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou e-mail..."
          className="w-full text-sm bg-transparent outline-none text-[#211a14] placeholder-[#827568]"
        />
        {search && (
          <button onClick={() => setSearch('')} className="p-1 text-[#715b41] hover:text-[#211a14]">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tabela Responsiva / Cards */}
      <div className="bg-white rounded-3xl border border-[#d4c3b5] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#211a14]">
            <thead className="bg-[#f7ede5] text-xs uppercase font-bold text-[#715b41] border-b border-[#d4c3b5]">
              <tr>
                <th className="py-4 px-6">Usuário</th>
                <th className="py-4 px-6">E-mail</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f7ede5]">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-[#715b41]">
                    <div className="inline-block w-6 h-6 border-2 border-[#855300] border-t-transparent rounded-full animate-spin mb-2" />
                    <div>Carregando usuários...</div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-[#715b41]">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#fff8f4] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#ffddb8] text-[#855300] flex items-center justify-center font-bold text-sm">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-[#211a14]">{u.name}</div>
                          {u.email === currentUser?.email && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#855300] bg-[#ffddb8] px-2 py-0.5 rounded-full">
                              Você
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-[#50453a]">{u.email}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        u.is_active
                          ? 'bg-[#caeca0] text-[#0b2000]'
                          : 'bg-[#ffdad6] text-[#ba1a1a]'
                      }`}>
                        {u.is_active ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Ativo
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            Inativo
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Botão Editar */}
                        <button
                          onClick={() => handleOpenEdit(u)}
                          title="Editar Usuário"
                          className="p-2 rounded-xl text-[#715b41] hover:text-[#855300] hover:bg-[#ffddb8]/40 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {/* Botão Excluir */}
                        {u.email !== currentUser?.email && (
                          <button
                            onClick={() => setDeletingUser(u)}
                            title="Excluir Usuário"
                            className="p-2 rounded-xl text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal M3 de Criação / Edição de Usuário */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#fff8f4] border border-[#d4c3b5] w-full max-w-md rounded-3xl p-6 shadow-2xl m3-elevation-3">
            <div className="flex items-center justify-between pb-4 border-b border-[#d4c3b5]">
              <h3 className="text-lg font-bold text-[#211a14]">
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#715b41] hover:text-[#211a14] rounded-full hover:bg-[#f7ede5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 p-3 rounded-2xl bg-[#ffdad6] text-[#ba1a1a] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#50453a] mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: João da Silva"
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] focus:ring-2 focus:ring-[#855300]/20 outline-none text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#50453a] mb-1">
                  E-mail *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="joao@biscoitossauro.com.br"
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] focus:ring-2 focus:ring-[#855300]/20 outline-none text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#50453a] mb-1">
                  {editingUser ? 'Nova Senha (deixe em branco para manter)' : 'Senha de Acesso *'}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#827568] focus:border-[#855300] focus:ring-2 focus:ring-[#855300]/20 outline-none text-sm bg-white"
                  />
                  <Key className="w-4 h-4 text-[#827568] absolute right-3.5 top-3" />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="user_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-[#855300] rounded accent-[#855300]"
                />
                <label htmlFor="user_active" className="text-sm font-medium text-[#211a14] cursor-pointer">
                  Usuário com acesso ativo
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#d4c3b5]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-sm font-semibold text-[#50453a] hover:bg-[#f7ede5] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-full bg-[#855300] hover:bg-[#6c4300] text-white text-sm font-semibold shadow-sm transition-all"
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal M3 de Confirmação de Exclusão */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#fff8f4] border border-[#d4c3b5] w-full max-w-sm rounded-3xl p-6 shadow-2xl m3-elevation-3 text-center">
            <div className="w-12 h-12 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#211a14]">Excluir Usuário?</h3>
            <p className="text-sm text-[#715b41] mt-2">
              Tem certeza que deseja remover o usuário <strong>{deletingUser.name}</strong> ({deletingUser.email})? Esta ação não pode ser desfeita.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeletingUser(null)}
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
