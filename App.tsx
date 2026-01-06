import React, { useState, useEffect } from 'react';
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
import { INITIAL_FILTERS } from './constants';
import { Room, ViewState, SearchFilters as FilterType, Reservation, User, Amenity } from './types';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { api, setAuthUser } from './lib/api';
import { validateReservationTime } from './lib/validation';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [activeTab, setActiveTab] = useState<ViewState>('search');
  const [filters, setFilters] = useState<FilterType>(INITIAL_FILTERS);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      loadRooms();
      loadReservations();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && activeTab === 'search') {
      loadRooms();
    }
  }, [activeTab]);

  const loadRooms = async () => {
    try {
      const apiRooms = await api.rooms.getAll();
      const mappedRooms: Room[] = apiRooms.map(r => ({
        id: String(r.id),
        name: r.name,
        capacity: r.capacity,
        location: r.location,
        image: r.image || '',
        amenities: (r.amenities as Amenity[]) || [],
        isAvailable: r.isAvailable,
        status: r.status as 'active' | 'maintenance' | undefined,
        pricePerHour: r.pricePerHour || undefined,
      }));
      setAvailableRooms(mappedRooms);
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  };

  const loadReservations = async () => {
    if (!currentUser) return;
    try {
      const apiReservations = await api.reservations.getByUser(parseInt(currentUser.id));
      const mappedReservations: Reservation[] = apiReservations.map(r => ({
        id: String(r.id),
        roomId: String(r.roomId),
        roomName: r.roomName,
        roomLocation: r.roomLocation,
        date: r.date,
        startTime: r.startTime,
        endTime: r.endTime,
        status: r.status as 'confirmed' | 'cancelled',
        timestamp: r.timestamp ? new Date(r.timestamp).getTime() : Date.now(),
      }));
      setReservations(mappedReservations);
    } catch (error) {
      console.error('Error loading reservations:', error);
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setAuthUser(user.id, user.role);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthUser(null, null);
    setActiveTab('search');
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const [apiRooms, availability] = await Promise.all([
        api.rooms.getAll(),
        api.rooms.checkAvailability(filters.date, filters.startTime, filters.endTime)
      ]);
      
      const availabilityMap = new Map(
        availability.map(a => [a.roomId, a])
      );
      
      const mappedRooms: Room[] = apiRooms.map(r => {
        const roomAvailability = availabilityMap.get(r.id);
        return {
          id: String(r.id),
          name: r.name,
          capacity: r.capacity,
          location: r.location,
          image: r.image || '',
          amenities: (r.amenities as Amenity[]) || [],
          isAvailable: roomAvailability?.isAvailable ?? r.isAvailable,
          status: r.status as 'active' | 'maintenance' | undefined,
          pricePerHour: r.pricePerHour || undefined,
          nextAvailableTime: roomAvailability?.nextAvailableTime || null,
        };
      });
      const filtered = mappedRooms.filter(room => room.capacity >= Number(filters.capacity));
      setAvailableRooms(filtered);
    } catch (error) {
      console.error('Error searching rooms:', error);
    } finally {
      setIsLoading(false);
    }
    setActiveTab('search');
  };

  const handleOpenBooking = (room: Room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedRoom || !currentUser) return;

    const validation = validateReservationTime(filters.date, filters.startTime, filters.endTime);
    if (!validation.isValid) {
      setErrorMessage(validation.error);
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    try {
      await api.reservations.create({
        roomId: parseInt(selectedRoom.id),
        userId: parseInt(currentUser.id),
        roomName: selectedRoom.name,
        roomLocation: selectedRoom.location,
        date: filters.date,
        startTime: filters.startTime,
        endTime: filters.endTime,
        status: 'confirmed',
      });

      setIsModalOpen(false);
      setSelectedRoom(null);
      
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);

      loadReservations();
      setActiveTab('reservations');
    } catch (error: any) {
      const message = error?.message || 'Erro ao criar reserva. Tente novamente.';
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(null), 5000);
      console.error('Error creating reservation:', error);
    }
  };

  const handleCancelReservation = async (id: string) => {
    try {
      await api.reservations.update(parseInt(id), { status: 'cancelled' });
      loadReservations();
    } catch (error) {
      console.error('Error cancelling reservation:', error);
    }
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
            <ProfileView user={currentUser} onUserUpdate={setCurrentUser} />
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

      {/* Error Toast */}
      {errorMessage && (
        <div className="fixed bottom-8 right-8 bg-white border-l-4 border-red-500 p-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up z-50">
          <div className="bg-red-100 p-1 rounded-full">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-dark">Erro na Reserva</h4>
            <p className="text-xs text-medium">{errorMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;