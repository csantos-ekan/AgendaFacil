import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { User } from '../types';

const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
};

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: any) => void;
  userToEdit?: User | null;
}

export const NewUserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, userToEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    role: 'colaborador',
    password: ''
  });

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        name: userToEdit.name,
        email: userToEdit.email,
        cpf: userToEdit.cpf || '',
        role: userToEdit.role,
        password: '' // Senha não é retornada por segurança
      });
    } else {
      setFormData({ name: '', email: '', cpf: '', role: 'colaborador', password: '' });
    }
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const isEditing = !!userToEdit;

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
        <div className="pt-6 px-8 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1E293B]">
              {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
            </h2>
            <p className="text-sm text-[#64748B] mt-1">
              {isEditing ? 'Atualize as informações do colaborador abaixo.' : 'Preencha as informações do colaborador abaixo.'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-5">
          {/* Nome Completo */}
          <div>
            <label className="block text-sm font-semibold text-[#1E293B] mb-2">Nome Completo</label>
            <input
              type="text"
              required
              placeholder="Ex: Ana Silva"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-dark bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400 shadow-sm"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-[#1E293B] mb-2">E-mail Corporativo</label>
            <input
              type="email"
              required
              placeholder="exemplo@empresa.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-dark bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400 shadow-sm"
            />
          </div>

          {/* CPF e Tipo de Usuário Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#1E293B] mb-2">CPF</label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={formatCPF(formData.cpf)}
                onChange={(e) => setFormData({...formData, cpf: e.target.value.replace(/\D/g, '').slice(0, 11)})}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-dark bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1E293B] mb-2">Tipo de Usuário</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-dark bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer shadow-sm"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
              >
                <option value="colaborador" className="text-dark bg-white">Colaborador</option>
                <option value="admin" className="text-dark bg-white">Admin</option>
              </select>
            </div>
          </div>

          {/* Senha Inicial */}
          <div>
            <label className="block text-sm font-semibold text-[#1E293B] mb-2">
              {isEditing ? 'Alterar Senha (Opcional)' : 'Senha Inicial'}
            </label>
            <input
              type="password"
              required={!isEditing}
              placeholder={isEditing ? 'Deixe em branco para manter' : '••••••••'}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-dark bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400 shadow-sm"
            />
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
            <button
              type="submit"
              className="px-8 py-2.5 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all"
            >
              {isEditing ? 'Salvar Alterações' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};