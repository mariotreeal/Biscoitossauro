import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CompaniesList from './components/CompaniesList';
import PersonsList from './components/PersonsList';
import UsersList from './components/UsersList';
import PipelineKanban from './components/PipelineKanban';
import OrdersList from './components/OrdersList';
import InstagramMonitor from './components/InstagramMonitor';
import api from './services/api';
import { Menu, Bell, Sparkles } from 'lucide-react';

export default function App() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [metrics, setMetrics] = useState(null);

  const fetchDashboardMetrics = async () => {
    try {
      const res = await api.get('/dashboard/metrics');
      setMetrics(res.data);
    } catch (err) {
      console.error('Erro ao buscar métricas:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardMetrics();
    }
  }, [isAuthenticated, currentView]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff8f4]">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#855300] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#715b41]">Iniciando Biscoitossauro...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-[#fff8f4] text-[#211a14] flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top App Bar Material 3 */}
        <header className="sticky top-0 z-30 h-16 bg-[#fff8f4]/90 backdrop-blur-md border-b border-[#d4c3b5]/60 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#715b41] hover:text-[#211a14] hover:bg-[#f7ede5]"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Breadcrumb / Page Title */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#715b41]">
                {currentView === 'dashboard'
                  ? 'Painel Geral'
                  : currentView === 'pipeline'
                  ? 'Comercial • Pipeline de Vendas'
                  : currentView === 'instagram'
                  ? 'Marketing • Instagram Analytics'
                  : currentView === 'orders'
                  ? 'Operações • Pedidos & Produção'
                  : currentView === 'companies'
                  ? 'CRM • Clientes & Parceiros'
                  : currentView === 'persons'
                  ? 'CRM • Pessoas'
                  : 'Administração'}
              </span>
              <h2 className="text-lg font-bold text-[#211a14] capitalize">
                {currentView === 'dashboard'
                  ? 'Visão Geral'
                  : currentView === 'pipeline'
                  ? 'Funil Comercial'
                  : currentView === 'instagram'
                  ? 'Monitor do Instagram'
                  : currentView === 'orders'
                  ? 'Pedidos & Produção'
                  : currentView === 'companies'
                  ? 'Empresas'
                  : currentView === 'persons'
                  ? 'Pessoas'
                  : 'Gestão de Usuários'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#caeca0] text-[#0b2000] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#496636] animate-pulse"></span>
              Sistema Operacional
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {currentView === 'dashboard' && (
            <Dashboard metrics={metrics} onNavigate={(view) => setCurrentView(view)} />
          )}
          {currentView === 'pipeline' && <PipelineKanban />}
          {currentView === 'instagram' && <InstagramMonitor />}
          {currentView === 'orders' && <OrdersList />}
          {currentView === 'companies' && <CompaniesList />}
          {currentView === 'persons' && <PersonsList />}
          {currentView === 'users' && <UsersList />}
        </main>
      </div>
    </div>
  );
}
