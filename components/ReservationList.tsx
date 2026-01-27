import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Repeat, ChevronDown, ChevronUp } from 'lucide-react';
import { Reservation } from '../types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface ReservationListProps {
  reservations: Reservation[];
  onCancel: (id: string) => void;
  onCancelSeries?: (seriesId: string) => void;
}

interface SeriesChoiceInfo {
  reservationId: string;
  seriesId: string;
  date: string;
}

interface GroupedReservation {
  type: 'single' | 'series';
  reservation?: Reservation;
  seriesId?: string;
  reservations?: Reservation[];
  firstDate?: string;
  lastDate?: string;
  count?: number;
}

const WEEKDAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const PERIOD_NAMES: Record<string, string> = {
  day: 'dia',
  week: 'semana',
  month: 'mês',
  year: 'ano'
};

function formatRecurrenceDescription(rule: Reservation['recurrenceRule']): string {
  if (!rule) return '';
  
  const { repeatEvery, repeatPeriod, weekDays } = rule;
  let description = `A cada ${repeatEvery} ${PERIOD_NAMES[repeatPeriod]}${repeatEvery > 1 ? 's' : ''}`;
  
  if (repeatPeriod === 'week' && weekDays && weekDays.length > 0) {
    const dayNames = weekDays.map(d => WEEKDAY_NAMES[d]).join(', ');
    description += ` (${dayNames})`;
  }
  
  return description;
}

export const ReservationList: React.FC<ReservationListProps> = ({ reservations, onCancel, onCancelSeries }) => {
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
  const [cancelSeriesConfirmId, setCancelSeriesConfirmId] = useState<string | null>(null);
  const [seriesChoiceInfo, setSeriesChoiceInfo] = useState<SeriesChoiceInfo | null>(null);
  const [expandedSeries, setExpandedSeries] = useState<Set<string>>(new Set());

  const handleConfirmCancel = () => {
    if (cancelConfirmId) {
      onCancel(cancelConfirmId);
      setCancelConfirmId(null);
    }
  };

  const handleConfirmCancelSeries = () => {
    if (cancelSeriesConfirmId && onCancelSeries) {
      onCancelSeries(cancelSeriesConfirmId);
      setCancelSeriesConfirmId(null);
    }
  };

  const handleSeriesReservationCancelClick = (reservation: Reservation) => {
    if (reservation.seriesId) {
      setSeriesChoiceInfo({
        reservationId: reservation.id,
        seriesId: reservation.seriesId,
        date: reservation.date
      });
    }
  };

  const handleSeriesChoiceSingle = () => {
    if (seriesChoiceInfo) {
      onCancel(seriesChoiceInfo.reservationId);
      setSeriesChoiceInfo(null);
    }
  };

  const handleSeriesChoiceAll = () => {
    if (seriesChoiceInfo && onCancelSeries) {
      onCancelSeries(seriesChoiceInfo.seriesId);
      setSeriesChoiceInfo(null);
    }
  };

  const toggleSeriesExpanded = (seriesId: string) => {
    setExpandedSeries(prev => {
      const next = new Set(prev);
      if (next.has(seriesId)) {
        next.delete(seriesId);
      } else {
        next.add(seriesId);
      }
      return next;
    });
  };

  const groupedReservations: GroupedReservation[] = React.useMemo(() => {
    const seriesMap = new Map<string, Reservation[]>();
    const singles: Reservation[] = [];
    
    reservations.forEach(res => {
      if (res.seriesId) {
        const existing = seriesMap.get(res.seriesId) || [];
        existing.push(res);
        seriesMap.set(res.seriesId, existing);
      } else {
        singles.push(res);
      }
    });
    
    const result: GroupedReservation[] = [];
    
    seriesMap.forEach((seriesReservations, seriesId) => {
      const sorted = seriesReservations.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      const confirmedCount = sorted.filter(r => r.status === 'confirmed').length;
      
      result.push({
        type: 'series',
        seriesId,
        reservations: sorted,
        firstDate: sorted[0].date,
        lastDate: sorted[sorted.length - 1].date,
        count: confirmedCount
      });
    });
    
    singles.forEach(res => {
      result.push({
        type: 'single',
        reservation: res
      });
    });
    
    const now = Date.now();
    return result.sort((a, b) => {
      const getEarliestDate = (g: GroupedReservation) => {
        if (g.type === 'single') {
          return new Date(`${g.reservation!.date}T${g.reservation!.startTime}`).getTime();
        }
        const firstConfirmed = g.reservations?.find(r => r.status === 'confirmed');
        if (firstConfirmed) {
          return new Date(`${firstConfirmed.date}T${firstConfirmed.startTime}`).getTime();
        }
        return new Date(`${g.firstDate}T00:00:00`).getTime();
      };
      
      const dateA = getEarliestDate(a);
      const dateB = getEarliestDate(b);
      
      const aIsFuture = dateA > now;
      const bIsFuture = dateB > now;
      
      if (aIsFuture && !bIsFuture) return -1;
      if (!aIsFuture && bIsFuture) return 1;
      
      return dateA - dateB;
    });
  }, [reservations]);

  if (reservations.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-dark mb-1">Sem reservas ativas</h3>
        <p className="text-medium text-sm">Suas reservas futuras aparecerão aqui.</p>
      </div>
    );
  }

  const renderSingleCard = (res: Reservation) => (
    <div key={res.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow relative">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-bold text-lg text-dark mb-1">{res.roomName}</h4>
          <Badge variant={res.status === 'confirmed' ? 'success' : 'destructive'}>
            {res.status === 'confirmed' ? 'Confirmado' : 'Cancelado'}
          </Badge>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-sm text-medium">
          <MapPin className="w-4 h-4" />
          <span>{res.roomLocation}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-medium">
          <Calendar className="w-4 h-4" />
          <span>{new Date(res.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-medium">
          <Clock className="w-4 h-4" />
          <span>{res.startTime} - {res.endTime}</span>
        </div>
      </div>

      {res.status === 'confirmed' && (
        <div className="pt-4 border-t border-gray-100 flex justify-center">
          <Button 
            variant="destructive" 
            className="w-full text-xs py-2.5 font-bold" 
            onClick={() => setCancelConfirmId(res.id)}
          >
            Cancelar
          </Button>
        </div>
      )}
    </div>
  );

  const renderSeriesCard = (group: GroupedReservation) => {
    const firstRes = group.reservations![0];
    const hasConfirmed = group.reservations!.some(r => r.status === 'confirmed');
    const allCancelled = group.reservations!.every(r => r.status === 'cancelled');
    const isExpanded = expandedSeries.has(group.seriesId!);
    const confirmedReservations = group.reservations!.filter(r => r.status === 'confirmed');
    
    return (
      <div key={group.seriesId} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow relative">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="font-bold text-lg text-dark mb-1">{firstRes.roomName}</h4>
            <div className="flex items-center gap-2">
              <Badge variant={allCancelled ? 'destructive' : 'success'}>
                {allCancelled ? 'Cancelada' : 'Série Ativa'}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Repeat className="w-3 h-3" />
                {group.count} ocorrências
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3 text-sm text-medium">
            <MapPin className="w-4 h-4" />
            <span>{firstRes.roomLocation}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-medium">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date(group.firstDate + 'T00:00:00').toLocaleDateString('pt-BR')} até {new Date(group.lastDate + 'T00:00:00').toLocaleDateString('pt-BR')}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-medium">
            <Clock className="w-4 h-4" />
            <span>{firstRes.startTime} - {firstRes.endTime}</span>
          </div>
          {firstRes.recurrenceRule && (
            <div className="flex items-center gap-3 text-sm text-medium">
              <Repeat className="w-4 h-4" />
              <span>{formatRecurrenceDescription(firstRes.recurrenceRule)}</span>
            </div>
          )}
        </div>

        {hasConfirmed && confirmedReservations.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <button
              onClick={() => toggleSeriesExpanded(group.seriesId!)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium mb-3 w-full justify-center"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Ocultar datas
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Ver datas para cancelar individualmente
                </>
              )}
            </button>

            {isExpanded && (
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {confirmedReservations.map(res => (
                  <div key={res.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">
                      {new Date(res.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleSeriesReservationCancelClick(res)}
                    >
                      Cancelar
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {onCancelSeries && (
              <Button 
                variant="destructive" 
                className="w-full text-xs py-2.5 font-bold" 
                onClick={() => setCancelSeriesConfirmId(group.seriesId!)}
              >
                Cancelar Série Inteira
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
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
              <Button variant="destructive" onClick={handleConfirmCancel}>
                Cancelar Reserva
              </Button>
            </div>
          </div>
        </div>
      )}

      {cancelSeriesConfirmId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar Cancelamento da Série</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja cancelar toda a série de reservas? Todas as ocorrências futuras serão canceladas. Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setCancelSeriesConfirmId(null)}>
                Voltar
              </Button>
              <Button variant="destructive" onClick={handleConfirmCancelSeries}>
                Cancelar Série
              </Button>
            </div>
          </div>
        </div>
      )}

      {seriesChoiceInfo !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-2 mb-4">
              <Repeat className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Cancelar Reserva de Série</h3>
            </div>
            <p className="text-gray-600 mb-2">
              Esta reserva faz parte de uma série recorrente.
            </p>
            <p className="text-gray-600 mb-6">
              O que você deseja cancelar?
            </p>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleSeriesChoiceSingle}
              >
                Cancelar apenas esta reserva ({new Date(seriesChoiceInfo.date + 'T00:00:00').toLocaleDateString('pt-BR')})
              </Button>
              {onCancelSeries && (
                <Button 
                  variant="destructive" 
                  className="w-full justify-start"
                  onClick={handleSeriesChoiceAll}
                >
                  Cancelar toda a série
                </Button>
              )}
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => setSeriesChoiceInfo(null)}
              >
                Voltar
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groupedReservations.map((group) => 
          group.type === 'single' 
            ? renderSingleCard(group.reservation!) 
            : renderSeriesCard(group)
        )}
      </div>
    </>
  );
};
