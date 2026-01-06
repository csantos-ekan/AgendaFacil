import React, { useRef, useState } from 'react';
import { User as UserIcon, Shield, Key, Mail, Camera, CheckCircle2, XCircle } from 'lucide-react';
import { User } from '../types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { api } from '../lib/api';

const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
};

interface ProfileViewProps {
  user: User;
  onUserUpdate?: (user: User) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUserUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(user.avatar);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{show: boolean, msg: string, type: 'success' | 'error'}>({show: false, msg: '', type: 'success'});

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({show: true, msg, type});
    setTimeout(() => setToast({show: false, msg: '', type: 'success'}), 3000);
  };

  const handleSavePassword = async () => {
    if (!newPassword || !confirmPassword) {
      showToast('Preencha os campos de senha.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('As senhas não conferem.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('A senha deve ter pelo menos 6 caracteres.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await api.users.update(parseInt(user.id), { password: newPassword });
      showToast('Senha atualizada com sucesso!', 'success');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      showToast('Erro ao atualizar senha. Tente novamente.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    setIsUploading(true);
    try {
      const updatedUser = await api.users.uploadAvatar(parseInt(user.id), file);
      setCurrentAvatar(updatedUser.avatar || null);
      if (onUserUpdate) {
        onUserUpdate({ ...user, avatar: updatedUser.avatar || null });
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao atualizar foto de perfil. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

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
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={handleAvatarClick}
              disabled={isUploading}
              className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden cursor-pointer group relative transition-all hover:shadow-xl"
            >
              {currentAvatar ? (
                <img src={currentAvatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-16 h-16 text-gray-300" />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {isUploading ? (
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Camera className="w-8 h-8 text-white" />
                )}
              </div>
            </button>
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
                  defaultValue={user.cpf ? formatCPF(user.cpf) : ''} 
                  disabled
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed"
                />
                <p className="text-[11px] text-medium mt-2 italic">
                  * Para alterar seu CPF ou Nome, entre em contato com o Administrador.
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
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-dark focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">Confirmar Nova Senha</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-dark focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                size="lg" 
                className="px-10 font-bold shadow-lg shadow-primary/20"
                onClick={handleSavePassword}
                disabled={isSaving}
              >
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        </div>

      </div>

      {toast.show && (
        <div className={`fixed bottom-8 right-8 bg-white border-l-4 ${toast.type === 'success' ? 'border-success' : 'border-red-500'} p-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up z-50`}>
          <div className={`${toast.type === 'success' ? 'bg-green-100' : 'bg-red-100'} p-1 rounded-full`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-success" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
          </div>
          <h4 className="font-semibold text-sm text-dark">{toast.msg}</h4>
        </div>
      )}
    </div>
  );
};