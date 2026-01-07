import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Mail } from 'lucide-react';
import { Room, SearchFilters } from '../types';
import { Button } from './ui/button';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (participantEmails: string) => void;
  room: Room | null;
  filters: SearchFilters;
}

export const BookingModal: React.FC<BookingModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  room, 
  filters 
}) => {
  const [inviteEmails, setInviteEmails] = useState('');

  // Limpa o campo de emails sempre que o modal abre
  useEffect(() => {
    if (isOpen) {
      setInviteEmails('');
    }
  }, [isOpen]);

  if (!isOpen || !room) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-dark/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h3 className="text-lg font-semibold text-dark">Confirmar Reserva</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-dark transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <img 
              src={room.image} 
              alt={room.name} 
              className="w-20 h-20 rounded-lg object-cover shadow-sm border border-gray-100"
            />
            <div>
              <h4 className="text-lg font-bold text-dark">{room.name}</h4>
              <p className="text-medium text-sm flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                {room.location}
              </p>
            </div>
          </div>

          {/* Resumo da Reserva */}
          <div className="bg-blue-50 rounded-lg p-4 space-y-3 mb-6 border border-blue-100">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-medium">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Data</span>
              </div>
              <span className="font-semibold text-dark">{new Date(filters.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-medium">
                <Clock className="w-4 h-4 text-primary" />
                <span>Horário</span>
              </div>
              <span className="font-semibold text-dark">
                {filters.startTime} - {filters.endTime}
              </span>
            </div>
          </div>

          {/* Campo de Convidados (Emails) */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-dark mb-2">Convidar Participantes</label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <textarea
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)}
                placeholder="email@empresa.com, colega@empresa.com"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary min-h-[80px] resize-none bg-white text-dark"
              />
            </div>
            <p className="text-xs text-medium mt-1.5">
              Separe os e-mails por vírgula. Os convites serão enviados automaticamente.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onConfirm(inviteEmails)}>Confirmar Reserva</Button>
        </div>
      </div>
    </div>
  );
};