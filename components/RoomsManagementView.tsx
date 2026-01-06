import React, { useState, useEffect } from 'react';
import { Plus, MapPin, CheckCircle2, Trash2, Pencil, XCircle } from 'lucide-react';
import { Room, Amenity } from '../types';
import { api } from '../lib/api';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { NewRoomModal } from './NewRoomModal';
import { DeleteRoomConfirmationModal } from './DeleteRoomConfirmationModal';

export const RoomsManagementView: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [showToast, setShowToast] = useState<{show: boolean, msg: string}>({show: false, msg: ''});
  const [showErrorToast, setShowErrorToast] = useState<{show: boolean, msg: string}>({show: false, msg: ''});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRooms();
  }, []);

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
      setRooms(mappedRooms);
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerToast = (msg: string) => {
    setShowToast({ show: true, msg });
    setTimeout(() => setShowToast({ show: false, msg: '' }), 3000);
  };

  const triggerErrorToast = (msg: string) => {
    setShowErrorToast({ show: true, msg });
    setTimeout(() => setShowErrorToast({ show: false, msg: '' }), 3000);
  };

  const handleOpenModal = () => {
    setEditingRoom(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (room: Room) => {
    setEditingRoom(room);
    setIsModalOpen(true);
  };
  
  const handleOpenDelete = (room: Room) => {
    setSelectedRoom(room);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedRoom) {
      try {
        await api.rooms.delete(parseInt(selectedRoom.id));
        setIsDeleteModalOpen(false);
        setSelectedRoom(null);
        triggerToast('Sala removida com sucesso.');
        loadRooms();
      } catch (error) {
        console.error('Error deleting room:', error);
        setIsDeleteModalOpen(false);
        setSelectedRoom(null);
        triggerErrorToast('Erro ao excluir sala. Tente novamente.');
      }
    }
  };

  const handleSaveRoom = async (roomData: any) => {
    try {
      if (roomData.id) {
        const updateData: any = {
          name: roomData.name,
          location: roomData.location,
          capacity: Number(roomData.capacity),
          amenities: roomData.amenities
        };
        if (roomData.image) {
          updateData.image = roomData.image;
        }
        await api.rooms.update(parseInt(roomData.id), updateData);
        triggerToast('Sala atualizada com sucesso!');
      } else {
        await api.rooms.create({
          name: roomData.name,
          location: roomData.location,
          capacity: Number(roomData.capacity),
          image: roomData.image || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600',
          amenities: roomData.amenities,
          isAvailable: true,
          status: 'active'
        });
        triggerToast('Sala cadastrada com sucesso!');
      }
      setIsModalOpen(false);
      setEditingRoom(null);
      loadRooms();
    } catch (error) {
      console.error('Error saving room:', error);
    }
  };

  return (
    <div className="animate-fade-in py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-dark">Salas de Reunião</h1>
          <p className="text-medium mt-1">Gerencie a capacidade e recursos dos espaços físicos.</p>
        </div>
        <Button 
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-6 h-11 font-bold shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          Nova Sala
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div key={room.id} className="relative group bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col hover:shadow-md transition-all">
            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-1">
              <button 
                onClick={() => handleOpenEdit(room)}
                className="p-2 text-gray-300 hover:text-primary hover:bg-blue-50 rounded-lg transition-all"
                title="Editar Sala"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleOpenDelete(room)}
                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Excluir Sala"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-xl font-bold text-dark mb-1 pr-8">{room.name}</h3>
            
            <div className="flex items-center gap-1.5 text-medium text-sm mb-3">
              <MapPin className="w-3.5 h-3.5" />
              <span>{room.location}</span>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Capacidade: {room.capacity}</span>
              {room.status === 'maintenance' && (
                <Badge variant="destructive" className="rounded-md px-2 py-0 text-[10px] font-bold">
                  Manutenção
                </Badge>
              )}
            </div>

            <div className="w-full border-t border-gray-100 my-4"></div>

            <div className="mt-auto">
              <p className="text-xs font-medium text-gray-400 mb-3">Recursos Disponíveis:</p>
              <div className="flex flex-wrap gap-2">
                {room.amenities.map((amenity, idx) => (
                  <div 
                    key={`${room.id}-${idx}`}
                    className="bg-gray-50 border border-gray-100 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 shadow-sm"
                  >
                    {amenity.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <NewRoomModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingRoom(null); }} 
        onSave={handleSaveRoom}
        editRoom={editingRoom}
      />

      <DeleteRoomConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        room={selectedRoom}
      />

      {showToast.show && (
        <div className="fixed bottom-8 right-8 bg-white border-l-4 border-success p-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up z-50">
          <div className="bg-green-100 p-1 rounded-full">
            <CheckCircle2 className="w-5 h-5 text-success" />
          </div>
          <h4 className="font-semibold text-sm text-dark">{showToast.msg}</h4>
        </div>
      )}

      {showErrorToast.show && (
        <div className="fixed bottom-8 right-8 bg-white border-l-4 border-red-500 p-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up z-50">
          <div className="bg-red-100 p-1 rounded-full">
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <h4 className="font-semibold text-sm text-dark">{showErrorToast.msg}</h4>
        </div>
      )}
    </div>
  );
};