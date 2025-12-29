import React from 'react';
import { User as UserIcon, Shield, Key, Mail, CheckCircle2 } from 'lucide-react';
import { User } from '../types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface ProfileViewProps {
  user: User;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user }) => {
  return (
    <div className="animate-fade-in max-w-5xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark">Meu Perfil</h1>
        <p className="text-medium mt-1">Gerencie suas informações pessoais e segurança.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Profile Sidebar Card */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center flex flex-col items-center">
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-16 h-16 text-gray-300" />
              )}
            </div>
            <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full shadow-sm"></div>
          </div>

          <h2 className="text-2xl font-bold text-dark mb-1">{user.name}</h2>
          <div className="flex items-center gap-1.5 text-medium text-sm mb-6">
            <Mail className="w-4 h-4" />
            {user.email}
          </div>

          <Badge variant="secondary" className="bg-blue-50 text-primary border-none px-6 py-1.5 text-xs font-bold uppercase tracking-wide">
            {user.role === 'admin' ? 'Administrador' : 'Colaborador'}
          </Badge>
        </div>

        {/* Account Details Form Card */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-bold text-dark">Dados da Conta</h3>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-semibold text-dark mb-2">Nome Completo</label>
                <input 
                  type="text" 
                  defaultValue={user.name} 
                  disabled
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">CPF</label>
                <input 
                  type="text" 
                  defaultValue={user.cpf || '123.456.789-00'} 
                  disabled
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed"
                />
                <p className="text-[11px] text-medium mt-2 italic">
                  * Para alterar seu CPF ou Nome, entre em contato com o RH.
                </p>
              </div>
            </div>

            {/* Security Section */}
            <div className="relative py-8">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-[10px] font-bold text-gray-400 uppercase tracking-widest">Segurança</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Key className="w-4 h-4 text-dark" />
                <h4 className="text-sm font-bold text-dark">Atualizar Senha</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">Nova Senha</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-dark focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">Confirmar Nova Senha</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-dark focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button size="lg" className="px-10 font-bold shadow-lg shadow-primary/20">
                Salvar Alterações
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};