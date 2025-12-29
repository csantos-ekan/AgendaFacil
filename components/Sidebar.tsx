import React from 'react';
import { 
  Users, 
  DoorOpen, 
  Package, 
  Search, 
  CalendarCheck, 
  UserCircle, 
  LogOut 
} from 'lucide-react';
import { ViewState, User } from '../types';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: ViewState;
  onNavigate: (tab: ViewState) => void;
  user: User;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onNavigate, user, onLogout }) => {
  const isAdmin = user.role === 'admin';

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
        onClick={() => tab ? onNavigate(tab) : null}
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

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 hidden lg:flex">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8 cursor-pointer" onClick={() => onNavigate('search')}>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
            R
          </div>
          <span className="text-xl font-bold text-dark tracking-tight">RoomBooker</span>
        </div>

        {/* ADMIN SECTION */}
        {isAdmin && (
          <div className="mb-8">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-4">Administração</p>
            <NavItem tab="users-management" icon={Users} label="Gestão de Usuários" />
            <NavItem tab="rooms-management" icon={DoorOpen} label="Gestão de Salas" />
            <NavItem tab="resources-management" icon={Package} label="Gestão de Recursos" />
          </div>
        )}

        {/* USER SECTION */}
        <div className="mb-8">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-4">Minha Área</p>
          <NavItem tab="search" icon={Search} label="Buscar Sala" />
          <NavItem tab="reservations" icon={CalendarCheck} label="Minhas Reservas" />
          <NavItem tab="profile" icon={UserCircle} label="Meu Perfil" />
        </div>
      </div>

      <div className="mt-auto p-6 border-t border-gray-50">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </button>
      </div>
    </aside>
  );
};