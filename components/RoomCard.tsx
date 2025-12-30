import React from 'react';
import { Users } from 'lucide-react';
import { Room } from '../types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface RoomCardProps {
  room: Room;
  onBook: (room: Room) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onBook }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row mb-6 hover:shadow-lg transition-all duration-300 group">
      
      {/* Image Section */}
      <div className="w-full md:w-72 h-48 md:h-auto relative overflow-hidden">
        <img 
          src={room.image} 
          alt={room.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <Badge variant={room.isAvailable ? 'success' : 'destructive'}>
            {room.isAvailable ? 'Disponível' : 'Ocupada'}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-semibold text-dark">{room.name}</h3>
              <p className="text-medium text-sm mt-1">{room.location}</p>
            </div>
            <div className="flex items-center gap-1.5 text-medium bg-gray-50 px-3 py-1 rounded-full">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">{room.capacity} Lugares</span>
            </div>
          </div>

          <div className="my-4">
            <h4 className="text-xs font-semibold text-medium uppercase tracking-wider mb-3">Recursos</h4>
            <div className="flex flex-wrap gap-2">
              {room.amenities.map((amenity) => (
                <div 
                  key={amenity.id} 
                  className="text-sm text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-md"
                  title={amenity.name}
                >
                  <span>{amenity.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 min-h-[57px]">
          {!room.isAvailable && room.nextAvailableTime && (
             <p className="text-sm text-medium italic">
               Próximo horário livre: {room.nextAvailableTime}
             </p>
          )}
          {!room.isAvailable && !room.nextAvailableTime && (
             <p className="text-sm text-medium italic">
               Indisponível para este horário
             </p>
          )}
          {room.isAvailable && (
            <div className="flex gap-3 ml-auto">
              <Button onClick={() => onBook(room)}>Reservar Agora</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};