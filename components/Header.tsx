import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { ViewState, Reservation, User } from '../types';
import { NotificationDropdown } from './NotificationDropdown';

interface HeaderProps {
  activeTab: ViewState;
  onNavigate: (tab: ViewState) => void;
  reservations: Reservation[];
  user: User | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeTab, 
  onNavigate, 
  reservations, 
  user,
  onLogout 
}) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const hasNotifications = reservations.some(r => r.status === 'confirmed');

  const getBreadcrumbLabel = () => {
    switch(activeTab) {
      case 'search': return 'Buscar Sala';
      case 'reservations': return 'Minhas Reservas';
      case 'profile': return 'Meu Perfil';
      case 'users-management': return 'Gestão de Usuários';
      default: return 'Home';
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-100/50 backdrop-blur-md bg-white/80 hidden lg:block">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Breadcrumbs for desktop only */}
          <div className="hidden lg:flex items-center gap-2 text-gray-400 text-sm font-medium">
            <span>Sistema RoomBooker</span>
            <span>/</span>
            <span className="text-dark">
              {getBreadcrumbLabel()}
            </span>
          </div>

          {/* Right Section: Notifications & Profile Display */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                }}
                className={`relative p-2 transition-colors rounded-full hover:bg-gray-100 ${
                  isNotificationsOpen ? 'text-dark bg-gray-100' : 'text-medium hover:text-dark'
                }`}
              >
                <Bell className="w-5 h-5" />
                {hasNotifications && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                )}
              </button>

              <NotificationDropdown 
                isOpen={isNotificationsOpen} 
                onClose={() => setIsNotificationsOpen(false)}
                reservations={reservations}
              />
            </div>
            
            <div className="relative pl-4 border-l border-gray-100">
              <div className="flex items-center gap-3 py-1 px-2">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-dark">{user?.name || 'Usuário'}</p>
                </div>
                <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                  <img 
                    src={user?.avatar || "https://i.pravatar.cc/150?u=fallback"} 
                    alt="Avatar" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};