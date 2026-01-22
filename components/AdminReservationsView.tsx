import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Mail, XCircle, CheckCircle2, Filter } from 'lucide-react';
import { api, AdminReservation } from '../lib/api';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface RoomOption {
  id: number;
  name: string;
}

export const AdminReservationsView: React.FC = () => {
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRoomId, setFilterRoomId] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showToast, setShowToast] = useState<{show: boolean, msg: string, type: 'success' | 'error'}>({show: false, msg: '', type: 'success'});
  const [cancelConfirmId, setCancelConfirmId] = useState<number | null>(null);

  useEffect(() => {
    loadRooms();
    loadReservations();
  }, []);

  useEffect(() => {
    loadReservations();
  }, [filterRoomId, filterDate, filterStatus, sortOrder]);

  const loadRooms = async () => {
    try {
      const data = await api.rooms.getAll();
      setRooms(data.map(r => ({ id: r.id, name: r.name })));
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  };

  const loadReservations = async () => {
    setIsLoading(true);
    try {
      const params: { roomId?: number; date?: string; status?: string; sortOrder?: string } = {};
      if (filterRoomId) params.roomId = parseInt(filterRoomId);
      if (filterDate) params.date = filterDate;
      if (filterStatus) params.status = filterStatus;
      params.sortOrder = sortOrder;
      
      const data = await api.admin.getReservations(params);
      setReservations(data);
    } catch (error) {
      console.error('Error loading admin reservations:', error);
      triggerToast('Erro ao carregar reservas', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setShowToast({ show: true, msg, type });
    setTimeout(() => setShowToast({ show: false, msg: '', type: 'success' }), 3000);
  };

  const handleCancelReservation = async (id: number) => {
    try {
      await api.admin.cancelReservation(id);
      triggerToast('Reserva cancelada com sucesso!', 'success');
      setCancelConfirmId(null);
      loadReservations();
    } catch (error: any) {
      console.error('Error cancelling reservation:', error);
      triggerToast(error.message || 'Erro ao cancelar reserva', 'error');
    }
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const clearFilters = () => {
    setFilterRoomId('');
    setFilterDate('');
    setFilterStatus('');
  };

  return (
    <div className="p-6">
      {showToast.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          showToast.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {showToast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
          <span className="font-medium">{showToast.msg}</span>
        </div>
      )}

      {cancelConfirmId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar Cancelamento</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setCancelConfirmId(null)}>
                Voltar
              </Button>
              <Button variant="destructive" onClick={() => handleCancelReservation(cancelConfirmId)}>
                Cancelar Reserva
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Reservas</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-700">Filtros</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sala</label>
            <select
              value={filterRoomId}
              onChange={(e) => setFilterRoomId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas as salas</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os status</option>
              <option value="active">Ativa</option>
              <option value="completed">Concluída</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="desc">Mais recentes primeiro</option>
              <option value="asc">Mais antigas primeiro</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="outline" onClick={clearFilters} className="w-full">
              Limpar filtros
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : reservations.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Nenhuma reserva encontrada
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sala</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horário</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-gray-900">{reservation.roomName}</div>
                          <div className="text-sm text-gray-500">{reservation.roomLocation}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatDate(reservation.date)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {reservation.startTime} - {reservation.endTime}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-gray-900">{reservation.userName}</div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Mail className="w-3 h-3" />
                            {reservation.userEmail}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {(() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const reservationDate = new Date(reservation.date + 'T00:00:00');
                        const isPast = reservationDate < today;
                        
                        if (reservation.status === 'cancelled') {
                          return <Badge variant="destructive">Cancelada</Badge>;
                        } else if (isPast) {
                          return <Badge variant="secondary">Concluída</Badge>;
                        } else {
                          return <Badge variant="success">Ativa</Badge>;
                        }
                      })()}
                    </td>
                    <td className="px-4 py-4">
                      {(() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const reservationDate = new Date(reservation.date + 'T00:00:00');
                        const isPast = reservationDate < today;
                        
                        if (reservation.status !== 'cancelled' && !isPast) {
                          return (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setCancelConfirmId(reservation.id)}
                            >
                              Cancelar
                            </Button>
                          );
                        }
                        return null;
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
