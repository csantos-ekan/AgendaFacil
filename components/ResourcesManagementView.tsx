import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { Resource } from '../types';
import { api } from '../lib/api';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { NewResourceModal } from './NewResourceModal';
import { DeleteResourceConfirmationModal } from './DeleteResourceConfirmationModal';

export const ResourcesManagementView: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showToast, setShowToast] = useState<{show: boolean, msg: string}>({show: false, msg: ''});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const apiResources = await api.resources.getAll();
      const mappedResources: Resource[] = apiResources.map(r => ({
        id: String(r.id),
        name: r.name,
        category: r.category as 'Equipamento' | 'Infraestrutura' | 'Acessório',
        status: r.status as 'Disponível' | 'Manutenção' | 'Descontinuado',
      }));
      setResources(mappedResources);
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerToast = (msg: string) => {
    setShowToast({ show: true, msg });
    setTimeout(() => setShowToast({ show: false, msg: '' }), 3000);
  };

  const handleOpenCreate = () => {
    setSelectedResource(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (resource: Resource) => {
    setSelectedResource(resource);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (resource: Resource) => {
    setSelectedResource(resource);
    setIsDeleteModalOpen(true);
  };
  
  const handleSaveResource = async (resourceData: Omit<Resource, 'id'>) => {
    try {
      if (selectedResource) {
        await api.resources.update(parseInt(selectedResource.id), resourceData);
        triggerToast('Recurso atualizado com sucesso!');
      } else {
        await api.resources.create(resourceData);
        triggerToast('Novo recurso cadastrado!');
      }
      setIsModalOpen(false);
      loadResources();
    } catch (error) {
      console.error('Error saving resource:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedResource) {
      try {
        await api.resources.delete(parseInt(selectedResource.id));
        setIsDeleteModalOpen(false);
        setSelectedResource(null);
        triggerToast('Recurso removido com sucesso.');
        loadResources();
      } catch (error) {
        console.error('Error deleting resource:', error);
      }
    }
  };

  const getStatusBadge = (status: Resource['status']) => {
    switch (status) {
      case 'Disponível':
        return (
          <Badge className="bg-blue-50 text-blue-600 border-none px-4 py-1 font-semibold text-[11px] rounded-md">
            Disponível
          </Badge>
        );
      case 'Manutenção':
        return (
          <Badge className="bg-[#EF4444] text-white border-none px-4 py-1 font-semibold text-[11px] rounded-md hover:bg-red-600">
            Manutenção
          </Badge>
        );
      case 'Descontinuado':
        return (
          <Badge className="bg-gray-100 text-gray-500 border-none px-4 py-1 font-semibold text-[11px] rounded-md">
            Descontinuado
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="animate-fade-in py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B]">Recursos de Sala</h1>
          <p className="text-[#64748B] mt-1 text-sm">Cadastre equipamentos e itens de infraestrutura disponíveis.</p>
        </div>
        <Button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-6 h-11 font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90"
        >
          <Plus className="w-5 h-5" />
          Novo Recurso
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white border-b border-gray-100">
                <th className="px-6 py-5 text-[13px] font-bold text-[#64748B]">Nome do Recurso</th>
                <th className="px-6 py-5 text-[13px] font-bold text-[#64748B]">Categoria</th>
                <th className="px-6 py-5 text-[13px] font-bold text-[#64748B] text-center">Status</th>
                <th className="px-6 py-5 text-[13px] font-bold text-[#64748B] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {resources.map((resource) => (
                <tr key={resource.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <span className="text-sm font-semibold text-[#1E293B]">{resource.name}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="inline-flex items-center bg-[#F1F5F9] text-[#475569] text-[11px] font-semibold px-3 py-1 rounded-full">
                      {resource.category}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    {getStatusBadge(resource.status)}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <button 
                        onClick={() => handleOpenEdit(resource)}
                        className="text-gray-400 hover:text-primary transition-all p-1"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleOpenDelete(resource)}
                        className="text-gray-400 hover:text-red-500 transition-all p-1"
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

      <NewResourceModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveResource}
        resourceToEdit={selectedResource}
      />

      <DeleteResourceConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        resource={selectedResource}
      />

      {showToast.show && (
        <div className="fixed bottom-8 right-8 bg-white border-l-4 border-success p-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up z-50">
          <div className="bg-green-100 p-1 rounded-full">
            <CheckCircle2 className="w-5 h-5 text-success" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-[#1E293B]">{showToast.msg}</h4>
          </div>
        </div>
      )}
    </div>
  );
};
