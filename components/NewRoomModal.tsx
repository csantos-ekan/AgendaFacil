import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { AMENITIES } from '../constants';

interface NewRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (roomData: any) => void;
}

export const NewRoomModal: React.FC<NewRoomModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    location: '',
    selectedAmenities: [] as string[]
  });

  const amenitiesOptions = [
    { id: 'PROJECTOR', label: 'Projetor' },
    { id: 'AC', label: 'Ar Condicionado' },
    { id: 'TV', label: 'TV 4K' },
    { id: 'WIFI', label: 'Wi-Fi Dedicado' },
    { id: 'BOARD', label: 'Quadro Branco' },
    { id: 'VIDEO', label: 'Vídeo Conf.' },
  ];

  if (!isOpen) return null;

  const handleToggleAmenity = (id: string) => {
    setFormData(prev => {
      const isSelected = prev.selectedAmenities.includes(id);
      return {
        ...prev,
        selectedAmenities: isSelected 
          ? prev.selectedAmenities.filter(item => item !== id)
          : [...prev.selectedAmenities, id]
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      capacity: formData.capacity,
      location: formData.location,
      amenities: formData.selectedAmenities.map(id => AMENITIES[id])
    });
    setFormData({ name: '', capacity: '', location: '', selectedAmenities: [] });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[480px] overflow-hidden animate-fade-in-up">
        <div className="pt-8 px-8 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#1E293B]">Nova Sala</h2>
              <p className="text-sm text-[#64748B] mt-1">Configure os detalhes e recursos do espaço.</p>
            </div>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[#1E293B] mb-2">Nome da Sala</label>
            <input
              type="text"
              required
              placeholder="Ex: Sala de Reunião Principal"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1E293B] mb-2">Capacidade (Pessoas)</label>
            <input
              type="number"
              required
              placeholder="0"
              value={formData.capacity}
              onChange={(e) => setFormData({...formData, capacity: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1E293B] mb-2">Endereço / Localização</label>
            <input
              type="text"
              required
              placeholder="Ex: Av. Central, 250 – Bloco C, 5º andar"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1E293B] mb-3">Recursos</label>
            <div className="grid grid-cols-2 gap-y-4">
              {amenitiesOptions.map(option => (
                <label key={option.id} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 transition-all checked:bg-primary checked:border-primary"
                      checked={formData.selectedAmenities.includes(option.id)}
                      onChange={() => handleToggleAmenity(option.id)}
                    />
                    <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </div>
                  <span className="text-sm text-[#475569] group-hover:text-dark transition-colors">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-semibold text-dark bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              Cancelar
            </button>
            <Button
              type="submit"
              className="px-8 py-2.5 text-sm font-bold shadow-lg shadow-primary/20 transition-all"
            >
              Salvar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};