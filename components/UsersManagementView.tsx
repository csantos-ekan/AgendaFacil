import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { User } from '../types';
import { api } from '../lib/api';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { NewUserModal } from './NewUserModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

export const UsersManagementView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showToast, setShowToast] = useState<{show: boolean, msg: string}>({show: false, msg: ''});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const apiUsers = await api.users.getAll();
      const mappedUsers: User[] = apiUsers.map(u => ({
        id: String(u.id),
        name: u.name,
        email: u.email,
        role: u.role as 'admin' | 'colaborador',
        status: u.status as 'ativo' | 'inativo',
        avatar: u.avatar || undefined,
        cpf: u.cpf || undefined,
      }));
      setUsers(mappedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerToast = (msg: string) => {
    setShowToast({ show: true, msg });
    setTimeout(() => setShowToast({ show: false, msg: '' }), 3000);
  };

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setIsUserModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleOpenDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleSaveUser = async (userData: any) => {
    try {
      if (selectedUser) {
        await api.users.update(parseInt(selectedUser.id), userData);
        triggerToast('Usuário atualizado com sucesso!');
      } else {
        await api.users.create({
          ...userData,
          password: userData.password || 'senha123'
        });
        triggerToast('Novo usuário cadastrado!');
      }
      loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedUser) {
      try {
        await api.users.delete(parseInt(selectedUser.id));
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
        triggerToast('Usuário removido do sistema.');
        loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  return (
    <div className="animate-fade-in py-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-dark">Usuários</h1>
          <p className="text-medium mt-1">Gerencie o acesso e permissões dos colaboradores.</p>
        </div>
        <Button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-6 h-11 font-bold shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          Novo Usuário
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Nome</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">CPF</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Função</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 overflow-hidden">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-primary font-bold text-sm">{user.name.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-dark">{user.name}</p>
                        <p className="text-xs text-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge 
                      variant="outline" 
                      className="px-4 py-1 border-none bg-blue-50 text-primary uppercase text-[10px] tracking-wide font-bold inline-flex pointer-events-none"
                    >
                      {user.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-medium">{user.cpf}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge 
                      variant="default" 
                      className={user.role === 'admin' 
                        ? "bg-primary text-white border-none px-4 py-1 text-[10px] tracking-wide font-bold uppercase inline-flex" 
                        : "bg-white border border-gray-200 text-dark px-4 py-1 text-[10px] tracking-wide font-bold uppercase inline-flex"
                      }
                    >
                      {user.role === 'admin' ? 'Admin' : 'Colaborador'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleOpenEdit(user)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-all"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleOpenDelete(user)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Success Toast */}
      {showToast.show && (
        <div className="fixed bottom-8 right-8 bg-white border-l-4 border-success p-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up z-50">
          <div className="bg-green-100 p-1 rounded-full">
            <CheckCircle2 className="w-5 h-5 text-success" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-dark">{showToast.msg}</h4>
          </div>
        </div>
      )}

      {/* Modals */}
      <NewUserModal 
        isOpen={isUserModalOpen} 
        onClose={() => setIsUserModalOpen(false)} 
        onSave={handleSaveUser}
        userToEdit={selectedUser}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        user={selectedUser}
      />
    </div>
  );
};