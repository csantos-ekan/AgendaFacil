import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Room, Amenity } from '../types';
import { api } from '../lib/api';

interface NewRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (roomData: any) => void;
  editRoom?: Room | null;
}

export const NewRoomModal: React.FC<NewRoomModalProps> = ({ isOpen, onClose, onSave, editRoom }) => {
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    location: '',
    selectedAmenities: [] as string[]
  });

  const [resourcesFromDB, setResourcesFromDB] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadResources();
      if (editRoom) {
        setFormData({
          name: editRoom.name,
          capacity: String(editRoom.capacity),
          location: editRoom.location,
          selectedAmenities: editRoom.amenities.map(a => a.name)
        });
      } else {
        setFormData({ name: '', capacity: '', location: '', selectedAmenities: [] });
      }
    }
  }, [isOpen, editRoom]);

  const loadResources = async () => {
    try {
      const resources = await api.resources.getAll();
      setResourcesFromDB(resources.map(r => ({ id: String(r.id), name: r.name })));
    } catch (error) {
      console.error('Error loading resources:', error);
    }
  };

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
      id: editRoom?.id,
      name: formData.name,
      capacity: formData.capacity,
      location: formData.location,
      amenities: formData.selectedAmenities.map(name => ({ name, icon: 'default' }))
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
              <h2 className="text-xl font-bold text-[#1E293B]">{editRoom ? 'Editar Sala' : 'Nova Sala'}</h2>
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
            {resourcesFromDB.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Nenhum recurso cadastrado. Cadastre recursos na aba "Gestão de Recursos".</p>
            ) : (
              <div className="grid grid-cols-2 gap-y-4">
                {resourcesFromDB.map(resource => (
                  <label key={resource.id} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 transition-all checked:bg-primary checked:border-primary"
                        checked={formData.selectedAmenities.includes(resource.name)}
                        onChange={() => handleToggleAmenity(resource.name)}
                      />
                      <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </div>
                    <span className="text-sm text-[#475569] group-hover:text-dark transition-colors">{resource.name}</span>
                  </label>
                ))}
              </div>
            )}
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