import React from 'react';
import { 
  Users, 
  DoorOpen, 
  Package, 
  Search, 
  CalendarCheck, 
  UserCircle, 
  LogOut,
  X
} from 'lucide-react';
import { ViewState, User } from '../types';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: ViewState;
  onNavigate: (tab: ViewState) => void;
  user: User;
  onLogout: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onNavigate, user, onLogout, isMobileOpen = false, onMobileClose }) => {
  const isAdmin = user.role === 'admin';

  const handleNavigate = (tab: ViewState) => {
    onNavigate(tab);
    onMobileClose?.();
  };

  const handleLogout = () => {
    onLogout();
    onMobileClose?.();
  };

  const NavItem = ({ 
    tab, 
    icon: Icon, 
    label, 
    danger = false 
  }: { 
    tab?: ViewState; 
    icon: any; 
    label: string; 
    danger?: boolean 
  }) => {
    const active = activeTab === tab;
    
    return (
      <button
        onClick={() => tab ? handleNavigate(tab) : null}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 mb-1",
          active 
            ? "bg-blue-50 text-primary shadow-sm shadow-blue-100/50" 
            : danger 
              ? "text-red-500 hover:bg-red-50" 
              : "text-gray-500 hover:bg-gray-50 hover:text-dark"
        )}
      >
        <Icon className={cn("w-5 h-5", active ? "text-primary" : "")} />
        {label}
      </button>
    );
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 flex-1">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavigate('search')}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
              R
            </div>
            <span className="text-xl font-bold text-dark tracking-tight">RoomBooker</span>
          </div>
          {onMobileClose && (
            <button onClick={onMobileClose} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* ADMIN SECTION */}
        {isAdmin && (
          <div className="mb-6">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-3">Administração</p>
            <NavItem tab="users-management" icon={Users} label="Gestão de Usuários" />
            <NavItem tab="rooms-management" icon={DoorOpen} label="Gestão de Salas" />
            <NavItem tab="resources-management" icon={Package} label="Gestão de Recursos" />
          </div>
        )}

        {/* USER SECTION */}
        <div className="mb-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-3">Minha Área</p>
          <NavItem tab="search" icon={Search} label="Buscar Sala" />
          <NavItem tab="reservations" icon={CalendarCheck} label="Minhas Reservas" />
          <NavItem tab="profile" icon={UserCircle} label="Meu Perfil" />
        </div>
      </div>

      <div className="mt-auto p-6 border-t border-gray-50">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex-col h-screen sticky top-0 hidden lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={onMobileClose} />
          <aside className="fixed left-0 top-0 h-full w-64 bg-white flex flex-col shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
};