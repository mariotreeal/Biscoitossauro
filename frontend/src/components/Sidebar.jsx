import React from 'react';
import { 
  Cookie, 
  LayoutDashboard, 
  Building2, 
  Users, 
  UserCog, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  X,
  Layers,
  Kanban,
  ShoppingBag
} from 'lucide-react';
import InstagramIcon from './InstagramIcon';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({
  currentView,
  setCurrentView,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen
}) {
  const { user, logout } = useAuth();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Visão Geral',
      icon: LayoutDashboard,
      category: 'Geral'
    },
    {
      id: 'pipeline',
      label: 'Funil Comercial',
      icon: Kanban,
      category: 'Comercial'
    },
    {
      id: 'instagram',
      label: 'Instagram',
      icon: InstagramIcon,
      category: 'Comercial'
    },
    {
      id: 'orders',
      label: 'Pedidos & Produção',
      icon: ShoppingBag,
      category: 'Operações'
    },
    {
      id: 'companies',
      label: 'Empresas',
      icon: Building2,
      category: 'CRM'
    },
    {
      id: 'persons',
      label: 'Pessoas',
      icon: Users,
      category: 'CRM'
    },
    {
      id: 'users',
      label: 'Usuários',
      icon: UserCog,
      category: 'Administração'
    }
  ];

  const handleNavClick = (id) => {
    setCurrentView(id);
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 flex flex-col justify-between
          bg-[#f7ede5] border-r border-[#d4c3b5] transition-all duration-300 ease-in-out
          ${/* Mobile */ ''}
          ${isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
          ${/* Desktop Collapsed vs Expanded */ ''}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
        `}
      >
        {/* Top: Logo & Collapse Action */}
        <div>
          <div className="h-20 flex items-center justify-between px-3 border-b border-[#d4c3b5]/60">
            <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => handleNavClick('dashboard')}>
              <img 
                src="/mascot.png" 
                alt="Biscoitossauro" 
                className="w-11 h-11 object-contain flex-shrink-0"
              />
              {(!isCollapsed || isMobileOpen) && (
                <div className="truncate">
                  <div className="font-black text-[#211a14] tracking-tight leading-tight text-base flex items-center gap-1.5">
                    <span>Biscoitossauro</span>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#715b41]">
                    Fábrica & CRM
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-2 text-[#715b41] hover:text-[#211a14] rounded-full hover:bg-[#fff8f4]"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? "Expandir Menu" : "Minimizar Menu"}
              className="hidden lg:flex p-1.5 text-[#715b41] hover:text-[#855300] hover:bg-[#ffddb8]/50 rounded-full transition-colors cursor-pointer"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Nav Items List */}
          <nav className="p-3 space-y-1 mt-2">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              const showCategory = (!isCollapsed || isMobileOpen) && (idx === 0 || navItems[idx - 1].category !== item.category);

              return (
                <React.Fragment key={item.id}>
                  {showCategory && (
                    <div className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#827568]">
                      {item.category}
                    </div>
                  )}
                  <button
                    onClick={() => handleNavClick(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`
                      w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl font-medium text-sm transition-all duration-150 cursor-pointer
                      ${isActive 
                        ? 'bg-[#ffddb8] text-[#855300] font-bold shadow-xs' 
                        : 'text-[#50453a] hover:bg-[#fff8f4] hover:text-[#211a14]'
                      }
                      ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''}
                    `}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[#855300]' : 'text-[#715b41]'}`} />
                    {(!isCollapsed || isMobileOpen) && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </button>
                </React.Fragment>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile & Logout */}
        <div className="p-3 border-t border-[#d4c3b5]/60 bg-[#f7ede5]/50">
          <div className={`flex items-center gap-3 ${isCollapsed && !isMobileOpen ? 'justify-center' : 'p-2'}`}>
            <div className="w-9 h-9 rounded-full bg-[#855300] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-[#211a14] truncate">
                  {user?.name || 'Administrador'}
                </div>
                <div className="text-[11px] text-[#715b41] truncate">
                  {user?.email || 'admin@biscoitossauro.com.br'}
                </div>
              </div>
            )}
            {(!isCollapsed || isMobileOpen) && (
              <button
                onClick={logout}
                title="Sair do Sistema"
                className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6]/50 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
          {isCollapsed && !isMobileOpen && (
            <div className="mt-2 flex justify-center">
              <button
                onClick={logout}
                title="Sair do Sistema"
                className="p-2 text-[#ba1a1a] hover:bg-[#ffdad6]/50 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
