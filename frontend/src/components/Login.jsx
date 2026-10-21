import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Cookie, Lock, Mail, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Por favor, informe seu e-mail de acesso.');
      return;
    }

    if (!password) {
      setError('Por favor, informe sua senha.');
      return;
    }

    setLoading(true);
    try {
      await login(cleanEmail, password);
    } catch (err) {
      if (err.response?.status === 401) {
        setError(err.response?.data?.detail || 'E-mail ou senha incorretos.');
      } else if (err.response?.status === 403) {
        setError(err.response?.data?.detail || 'Sua conta de usuário está desativada.');
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (!err.response) {
        setError('Não foi possível conectar ao servidor. Verifique sua conexão.');
      } else {
        setError('Erro ao realizar login. Verifique suas credenciais.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#fff8f4]">
      {/* Background ambient accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#ffddb8] opacity-50 blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#caeca0] opacity-40 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Material 3 Elevated Card */}
        <div className="bg-[#fff8f4] border border-[#d4c3b5] rounded-3xl p-8 sm:p-10 shadow-xl m3-elevation-2 backdrop-blur-sm">
          {/* Brand header */}
          <div className="text-center mb-8">
            <div className="inline-block mb-3">
              <img 
                src="/mascot.png" 
                alt="Mascote Biscoitossauro" 
                className="w-28 h-28 sm:w-32 sm:h-32 mx-auto object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#211a14] tracking-tight">
              Biscoitossauro
            </h1>
            <p className="text-sm font-medium text-[#715b41] mt-1">
              Portal Administrativo & CRM
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-[#ffdad6] text-[#ba1a1a] text-sm flex items-start gap-3 border border-[#ffb4ab]">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Outlined TextField Material 3: Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#50453a] mb-1.5 ml-1">
                E-mail de Acesso
              </label>
              <div className="relative rounded-2xl border border-[#827568] focus-within:border-[#855300] focus-within:ring-2 focus-within:ring-[#855300]/20 transition-all bg-white/70">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#715b41]">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@empresa.com"
                  className="w-full pl-11 pr-4 py-3.5 text-sm bg-transparent rounded-2xl outline-none text-[#211a14] placeholder-[#827568]/60 font-medium"
                />
              </div>
            </div>

            {/* Outlined TextField Material 3: Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#50453a] mb-1.5 ml-1">
                Senha
              </label>
              <div className="relative rounded-2xl border border-[#827568] focus-within:border-[#855300] focus-within:ring-2 focus-within:ring-[#855300]/20 transition-all bg-white/70">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#715b41]">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 text-sm bg-transparent rounded-2xl outline-none text-[#211a14] placeholder-[#827568]/60 font-medium"
                />
              </div>
            </div>

            {/* Hint of default login */}
            {/* Material 3 Filled Button (Pill shape) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-6 rounded-full bg-[#855300] hover:bg-[#6c4300] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Entrar no Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#d4c3b5]/60 text-center text-xs text-[#715b41]">
            © {new Date().getFullYear()} Biscoitossauro • Biscoitos Artesanais Personalizados
          </div>
        </div>
      </div>
    </div>
  );
}
