import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        setImagePreview(editRoom.image || null);
        setImageBase64(null);
      } else {
        setFormData({ name: '', capacity: '', location: '', selectedAmenities: [] });
        setImagePreview(null);
        setImageBase64(null);
      }
    }
  }, [isOpen, editRoom]);

  const loadResources = async () => {
    try {
      const resources = await api.resources.getAll();
      const availableResources = resources.filter(r => r.status === 'Disponível');
      setResourcesFromDB(availableResources.map(r => ({ id: String(r.id), name: r.name })));
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const roomData: any = {
      id: editRoom?.id,
      name: formData.name,
      capacity: formData.capacity,
      location: formData.location,
      amenities: formData.selectedAmenities.map(name => ({ name, icon: 'default' }))
    };
    
    if (imageBase64) {
      roomData.image = imageBase64;
    } else if (editRoom && imagePreview) {
      roomData.image = imagePreview;
    }
    
    onSave(roomData);
    setFormData({ name: '', capacity: '', location: '', selectedAmenities: [] });
    setImagePreview(null);
    setImageBase64(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[480px] max-h-[90vh] overflow-hidden animate-fade-in-up flex flex-col">
        <div className="pt-5 px-6 pb-3">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#1E293B]">{editRoom ? 'Editar Sala' : 'Nova Sala'}</h2>
              <p className="text-xs text-[#64748B] mt-0.5">Configure os detalhes e recursos do espaço.</p>
            </div>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-5 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-sm font-semibold text-[#1E293B] mb-1.5">Nome da Sala</label>
            <input
              type="text"
              required
              placeholder="Ex: Sala de Reunião Principal"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400 shadow-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#1E293B] mb-1.5">Capacidade</label>
              <input
                type="number"
                required
                placeholder="0"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1E293B] mb-1.5">Localização</label>
              <input
                type="text"
                required
                placeholder="Ex: 5º andar, Bloco C"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400 shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1E293B] mb-2">Recursos</label>
            {resourcesFromDB.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Nenhum recurso cadastrado.</p>
            ) : (
              <div className="grid grid-cols-2 gap-y-2 gap-x-2">
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

          <div>
            <label className="block text-sm font-semibold text-[#1E293B] mb-1.5">Imagem da Sala</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer border-2 border-dashed border-gray-200 rounded-lg p-3 hover:border-primary/50 transition-colors"
            >
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-medium">Clique para alterar</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3 py-2 text-gray-400">
                  <ImageIcon className="w-8 h-8" />
                  <div>
                    <span className="text-sm block">Adicionar imagem</span>
                    <span className="text-xs">Máx. 5MB</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-semibold text-dark bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              Cancelar
            </button>
            <Button
              type="submit"
              className="px-6 py-2 text-sm font-bold shadow-lg shadow-primary/20 transition-all"
            >
              Salvar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};