import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './ui/button';
import { User } from '../types';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: User | null;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  user 
}) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[400px] overflow-hidden animate-fade-in-up">
        <div className="p-8 text-center">
          {/* Warning Icon */}
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>

          <h3 className="text-xl font-bold text-[#1E293B] mb-2">Excluir Usuário?</h3>
          <p className="text-sm text-[#64748B] mb-8 leading-relaxed">
            Você está prestes a excluir <span className="font-bold text-dark">{user.name}</span>. 
            Esta ação não pode ser desfeita e o colaborador perderá o acesso imediatamente.
          </p>

          <div className="flex flex-col gap-3">
            <Button 
              variant="destructive" 
              onClick={onConfirm}
              className="w-full py-6 text-sm font-bold bg-red-600 hover:bg-red-700 shadow-lg shadow-red-100"
            >
              Sim, excluir usuário
            </Button>
            <button
              onClick={onClose}
              className="w-full py-3 text-sm font-semibold text-gray-500 hover:text-dark transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};