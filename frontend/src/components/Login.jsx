import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Cookie, Lock, Mail, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('biscoitossauros@gmail.com');
  const [password, setPassword] = useState('baronildo');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Erro ao realizar login. Verifique suas credenciais.'
      );
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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#ffddb8] text-[#855300] mb-4 shadow-sm">
              <Cookie className="w-9 h-9 transform -rotate-12" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#211a14] tracking-tight">
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
            <div className="p-3 rounded-xl bg-[#f7ede5] text-xs text-[#715b41] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#855300] flex-shrink-0" />
              <span>Acesso padrão pré-configurado para o primeiro acesso.</span>
            </div>

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
