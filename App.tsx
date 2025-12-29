import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SearchFilters } from './components/SearchFilters';
import { RoomCard } from './components/RoomCard';
import { BookingModal } from './components/BookingModal';
import { ReservationList } from './components/ReservationList';
import { LoginView } from './components/LoginView';
import { ProfileView } from './components/ProfileView';
import { UsersManagementView } from './components/UsersManagementView';
import { RoomsManagementView } from './components/RoomsManagementView';
import { ResourcesManagementView } from './components/ResourcesManagementView';
import { MOCK_ROOMS, MOCK_RESERVATIONS, INITIAL_FILTERS } from './constants';
import { Room, ViewState, SearchFilters as FilterType, Reservation, User } from './types';
import { CheckCircle2 } from 'lucide-react';

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // App State
  const [activeTab, setActiveTab] = useState<ViewState>('search');
  const [filters, setFilters] = useState<FilterType>(INITIAL_FILTERS);
  const [availableRooms, setAvailableRooms] = useState<Room[]>(MOCK_ROOMS);
  const [reservations, setReservations] = useState<Reservation[]>(MOCK_RESERVATIONS);
  
  // Modal State
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('search');
  };

  const handleSearch = () => {
    const filtered = MOCK_ROOMS.filter(room => {
      const capacityMatch = room.capacity >= Number(filters.capacity);
      return capacityMatch;
    });
    setAvailableRooms(filtered);
    setActiveTab('search');
  };

  const handleOpenBooking = (room: Room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleConfirmBooking = () => {
    if (!selectedRoom) return;

    const newReservation: Reservation = {
      id: Math.random().toString(36).substr(2, 9),
      roomId: selectedRoom.id,
      roomName: selectedRoom.name,
      roomLocation: selectedRoom.location,
      date: filters.date,
      startTime: filters.startTime,
      endTime: filters.endTime,
      status: 'confirmed',
      timestamp: Date.now(),
    };

    setReservations(prev => [newReservation, ...prev]);
    setIsModalOpen(false);
    setSelectedRoom(null);
    
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);

    setActiveTab('reservations');
  };

  const handleCancelReservation = (id: string) => {
    setReservations(prev => prev.filter(r => r.id !== id));
  };

  // Se não estiver autenticado, renderiza a LoginView
  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar - Desktop Only */}
      <Sidebar 
        activeTab={activeTab} 
        onNavigate={setActiveTab} 
        user={currentUser}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-h-screen">
        <Header 
          activeTab={activeTab} 
          onNavigate={setActiveTab} 
          reservations={reservations} 
          user={currentUser}
          onLogout={handleLogout}
        />

        <main className="flex-1 max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 pb-20">
          
          {/* VIEW: Search Rooms */}
          {activeTab === 'search' && (
            <div className="animate-fade-in">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-dark">
                  Olá, {currentUser.name.split(' ')[0]}
                </h1>
                <p className="text-medium">Encontre o espaço ideal para sua próxima reunião.</p>
              </div>

              <SearchFilters 
                filters={filters} 
                onFilterChange={setFilters} 
                onSearch={handleSearch} 
              />

              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-dark">
                  Salas Disponíveis
                  <span className="ml-2 text-sm font-normal text-medium bg-white px-2 py-0.5 rounded-full border border-gray-200">
                    {availableRooms.length}
                  </span>
                </h2>
              </div>

              <div className="space-y-4">
                {availableRooms.map(room => (
                  <RoomCard 
                    key={room.id} 
                    room={room} 
                    onBook={handleOpenBooking} 
                  />
                ))}
              </div>
            </div>
          )}

          {/* VIEW: My Reservations */}
          {activeTab === 'reservations' && (
            <div className="animate-fade-in">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-dark">Minhas Reservas</h1>
                <p className="text-medium">Gerencie seus agendamentos futuros.</p>
              </div>
              <ReservationList 
                reservations={reservations} 
                onCancel={handleCancelReservation} 
              />
            </div>
          )}

          {/* VIEW: My Profile */}
          {activeTab === 'profile' && (
            <ProfileView user={currentUser} />
          )}

          {/* VIEW: Users Management (Admin Only) */}
          {activeTab === 'users-management' && currentUser.role === 'admin' && (
            <UsersManagementView />
          )}

          {/* VIEW: Rooms Management (Admin Only) */}
          {activeTab === 'rooms-management' && currentUser.role === 'admin' && (
            <RoomsManagementView />
          )}

          {/* VIEW: Resources Management (Admin Only) */}
          {activeTab === 'resources-management' && currentUser.role === 'admin' && (
            <ResourcesManagementView />
          )}
        </main>
      </div>

      {/* Booking Modal */}
      <BookingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmBooking}
        room={selectedRoom}
        filters={filters}
      />

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-8 right-8 bg-white border-l-4 border-success p-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up z-50">
          <div className="bg-green-100 p-1 rounded-full">
            <CheckCircle2 className="w-5 h-5 text-success" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-dark">Reserva Confirmada!</h4>
            <p className="text-xs text-medium">A sala foi agendada com sucesso.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;