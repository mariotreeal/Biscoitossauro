import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  MessageSquare,
  Plus,
  Trash2,
  Calendar,
  User,
  Clock,
  PhoneCall,
  Send,
  FileText,
  Users,
  Building,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function InteractionsTimeline({ entityType, entityId, contactPersonList = [] }) {
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    type: 'Anotação',
    description: '',
    contact_person: '',
    date: new Date().toISOString().slice(0, 16)
  });

  const interactionTypes = [
    { label: 'Anotação / Nota Geral', icon: FileText, color: 'bg-amber-100 text-amber-800' },
    { label: 'Contato WhatsApp', icon: Send, color: 'bg-emerald-100 text-emerald-800' },
    { label: 'Ligação Telefônica', icon: PhoneCall, color: 'bg-blue-100 text-blue-800' },
    { label: 'Reunião Presencial/Online', icon: Users, color: 'bg-purple-100 text-purple-800' },
    { label: 'E-mail Enviado/Recebido', icon: MessageSquare, color: 'bg-sky-100 text-sky-800' },
    { label: 'Envio de Amostras', icon: CheckCircle, color: 'bg-orange-100 text-orange-800' },
    { label: 'Proposta Comercial', icon: Building, color: 'bg-rose-100 text-rose-800' }
  ];

  const fetchInteractions = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/crm/interactions/${entityType}/${entityId}`);
      setInteractions(res.data);
    } catch (err) {
      console.error('Erro ao carregar interações:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (entityId) {
      fetchInteractions();
    }
  }, [entityType, entityId]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      setError('Por favor, informe a descrição ou anotação.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await api.post(`/crm/interactions/${entityType}/${entityId}`, {
        type: formData.type,
        description: formData.description,
        contact_person: formData.contact_person || null,
        date: formData.date ? new Date(formData.date).toISOString() : null
      });
      setFormData({
        type: 'Anotação',
        description: '',
        contact_person: '',
        date: new Date().toISOString().slice(0, 16)
      });
      setIsFormOpen(false);
      fetchInteractions();
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao registrar interação.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja excluir este registro do histórico?')) return;
    try {
      await api.delete(`/crm/interactions/${id}`);
      fetchInteractions();
    } catch (err) {
      alert('Erro ao excluir interação.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Interações */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-[#211a14] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#855300]" />
            <span>Histórico de Contatos & Anotações</span>
          </h3>
          <p className="text-xs text-[#715b41]">
            Registro de ligações, reuniões, pedidos de amostras, WhatsApp e notas de acompanhamento
          </p>
        </div>

        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#855300] hover:bg-[#6c4300] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Interação</span>
          </button>
        )}
      </div>

      {/* Form de Nova Interação */}
      {isFormOpen && (
        <form onSubmit={handleSave} className="bg-white p-5 rounded-2xl border border-[#855300]/40 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#f7ede5] pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#855300]">
              Registrar Nova Atividade
            </span>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-xs text-[#715b41] hover:text-[#211a14] font-semibold"
            >
              Cancelar
            </button>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-[#ffdad6] text-[#ba1a1a] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#50453a] mb-1">Tipo de Contato</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#827568] focus:border-[#855300] outline-none bg-white font-medium"
              >
                {interactionTypes.map((t) => (
                  <option key={t.label} value={t.label}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#50453a] mb-1">Data / Hora</label>
              <input
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#827568] focus:border-[#855300] outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#50453a] mb-1">Interlocutor / Pessoa</label>
              {contactPersonList.length > 0 ? (
                <select
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#827568] focus:border-[#855300] outline-none bg-white"
                >
                  <option value="">Selecione ou deixe em branco...</option>
                  {contactPersonList.map((cp, idx) => (
                    <option key={idx} value={cp.name || cp}>
                      {cp.name || cp}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  placeholder="Nome do contato (opcional)"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#827568] focus:border-[#855300] outline-none bg-white"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#50453a] mb-1">
              Descrição / Resumo da Conversa *
            </label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ex: Cliente solicitou catálogo de biscoitos de Natal com embalagem personalizada em lata para 500 colaboradores..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#827568] focus:border-[#855300] outline-none bg-white resize-y"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded-full border border-[#d4c3b5] text-xs font-semibold text-[#715b41] hover:bg-[#f7ede5]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-full bg-[#855300] hover:bg-[#6c4300] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{saving ? 'Registrando...' : 'Salvar Interação'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Lista / Linha do Tempo */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-6 text-center text-xs text-[#715b41]">
            Carregando histórico...
          </div>
        ) : interactions.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-[#d4c3b5]">
            <Clock className="w-8 h-8 text-[#d4c3b5] mx-auto mb-2" />
            <p className="text-xs font-semibold text-[#50453a]">Nenhum contato ou anotação registrado ainda.</p>
            <p className="text-[11px] text-[#715b41] mt-0.5">
              Clique em "Nova Interação" para registrar conversas, negociações ou recados.
            </p>
          </div>
        ) : (
          interactions.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-2xl border border-[#d4c3b5] hover:border-[#855300]/40 transition-colors shadow-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ffddb8] text-[#855300]">
                    {item.type}
                  </span>
                  {item.contact_person && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#50453a] bg-[#f7ede5] px-2 py-0.5 rounded-md">
                      <User className="w-3 h-3 text-[#715b41]" />
                      {item.contact_person}
                    </span>
                  )}
                  <span className="text-[11px] text-[#715b41] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.date || item.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {item.created_by && (
                    <span className="text-[10px] text-[#715b41]">
                      por <b>{item.created_by}</b>
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  title="Excluir este registro"
                  className="p-1 rounded-lg text-[#ba1a1a]/70 hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="mt-2.5 text-xs text-[#211a14] whitespace-pre-wrap leading-relaxed font-normal">
                {item.description}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
