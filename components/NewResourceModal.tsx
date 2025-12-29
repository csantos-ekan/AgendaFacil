import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Resource } from '../types';

interface NewResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (resource: Omit<Resource, 'id'>) => void;
  resourceToEdit?: Resource | null;
}

export const NewResourceModal: React.FC<NewResourceModalProps> = ({ isOpen, onClose, onSave, resourceToEdit }) => {
  const [formData, setFormData] = useState<Omit<Resource, 'id'>>({
    name: '',
    category: '' as any,
    status: 'Disponível'
  });

  useEffect(() => {
    if (isOpen) {
      if (resourceToEdit) {
        setFormData({
          name: resourceToEdit.name,
          category: resourceToEdit.category,
          status: resourceToEdit.status
        });
      } else {
        setFormData({ name: '', category: '' as any, status: 'Disponível' });
      }
    }
  }, [isOpen, resourceToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const isEditing = !!resourceToEdit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[480px] overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="pt-8 px-8 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1E293B]">
              {isEditing ? 'Editar Recurso' : 'Novo Recurso'}
            </h2>
            <p className="text-sm text-[#64748B] mt-1">
              {isEditing ? 'Atualize as propriedades do equipamento ou item.' : 'Defina as propriedades do equipamento ou item.'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-6">
          {/* Nome do Item */}
          <div>
            <label className="block text-sm font-semibold text-[#1E293B] mb-2">Nome do Item</label>
            <input
              type="text"
              required
              placeholder="Ex: Projetor 4K Sony"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-dark bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400 shadow-sm"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-semibold text-[#1E293B] mb-2">Categoria</label>
            <input
              type="text"
              required
              placeholder="Equipamento"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value as any})}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-dark bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400 shadow-sm"
            />
          </div>

          {/* Status Atual */}
          <div>
            <label className="block text-sm font-semibold text-[#1E293B] mb-3">Status Atual</label>
            <div className="flex flex-wrap gap-6">
              {[
                { id: 'Disponível', label: 'Disponível' },
                { id: 'Manutenção', label: 'Em Manutenção' },
                { id: 'Descontinuado', label: 'Descontinuado' }
              ].map((option) => (
                <label key={option.id} className="flex items-center gap-2.5 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="radio"
                      name="status"
                      checked={formData.status === option.id}
                      onChange={() => setFormData({...formData, status: option.id as any})}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-gray-300 transition-all checked:border-primary"
                    />
                    <div className="absolute w-2.5 h-2.5 rounded-full bg-primary scale-0 peer-checked:scale-100 transition-transform" />
                  </div>
                  <span className={`text-sm transition-colors ${formData.status === option.id ? 'text-[#1E293B] font-medium' : 'text-[#94A3B8]'}`}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-semibold text-[#1E293B] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              Cancelar
            </button>
            <Button
              type="submit"
              className="px-8 py-2.5 text-sm font-bold bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all rounded-lg"
            >
              {isEditing ? 'Salvar Alterações' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};