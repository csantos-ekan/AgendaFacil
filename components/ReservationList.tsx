import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { Reservation } from '../types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface ReservationListProps {
  reservations: Reservation[];
  onCancel: (id: string) => void;
}

export const ReservationList: React.FC<ReservationListProps> = ({ reservations, onCancel }) => {
  if (reservations.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-dark mb-1">Sem reservas ativas</h3>
        <p className="text-medium text-sm">Suas reservas futuras aparecerão aqui.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reservations.map((res) => (
        <div key={res.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow relative">
           <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-bold text-lg text-dark mb-1">{res.roomName}</h4>
              <Badge variant={res.status === 'confirmed' ? 'success' : 'destructive'}>
                {res.status === 'confirmed' ? 'Confirmado' : 'Cancelado'}
              </Badge>
            </div>
           </div>

           <div className="space-y-3 mb-6">
             <div className="flex items-center gap-3 text-sm text-medium">
               <MapPin className="w-4 h-4" />
               <span>{res.roomLocation}</span>
             </div>
             <div className="flex items-center gap-3 text-sm text-medium">
               <Calendar className="w-4 h-4" />
               <span>{new Date(res.date).toLocaleDateString()}</span>
             </div>
             <div className="flex items-center gap-3 text-sm text-medium">
               <Clock className="w-4 h-4" />
               <span>{res.startTime} - {res.endTime}</span>
             </div>
           </div>

           <div className="pt-4 border-t border-gray-100 flex justify-center">
             <Button 
               variant="destructive" 
               className="w-full text-xs py-2.5 font-bold" 
               onClick={() => onCancel(res.id)}
             >
               Cancelar
             </Button>
           </div>
        </div>
      ))}
    </div>
  );
};