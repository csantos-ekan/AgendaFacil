import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { Reservation } from '../types';

interface NotificationDropdownProps {
  reservations: Reservation[];
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ 
  reservations, 
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  // Filtra confirmadas e ordena por data/hora mais próxima
  const upcomingReservations = reservations
    .filter(r => r.status === 'confirmed')
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateA.getTime() - dateB.getTime();
    });

  return (
    <>
      {/* Invisible backdrop to close on click outside */}
      <div className="fixed inset-0 z-40" onClick={onClose}></div>

      <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in-up origin-top-right">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h3 className="font-semibold text-sm text-dark">Próximas Reuniões</h3>
          <span className="text-xs text-medium bg-white px-2 py-0.5 rounded-full border border-gray-200">
            {upcomingReservations.length}
          </span>
        </div>

        <div className="max-h-[320px] overflow-y-auto">
          {upcomingReservations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-medium">Nenhuma reunião confirmada.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {upcomingReservations.map((res) => (
                <li key={res.id} className="p-4 hover:bg-gray-50 transition-colors cursor-default">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-2 h-2 rounded-full bg-success"></div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-dark leading-tight mb-1">
                        {res.roomName}
                      </h4>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-medium">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(res.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                          <span className="mx-1">•</span>
                          <Clock className="w-3 h-3" />
                          <span>{res.startTime} - {res.endTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {upcomingReservations.length > 0 && (
          <div className="p-2 border-t border-gray-100 bg-gray-50">
            <button 
              onClick={onClose}
              className="w-full py-2 text-xs font-medium text-primary hover:text-primary-hover text-center"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </>
  );
};
