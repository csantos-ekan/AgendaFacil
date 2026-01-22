import React from 'react';
import { Calendar, Clock, MapPin, Repeat } from 'lucide-react';
import { Reservation } from '../types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface ReservationListProps {
  reservations: Reservation[];
  onCancel: (id: string) => void;
  onCancelSeries?: (seriesId: string) => void;
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
            onClick={() => onCancel(res.id)}
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

        <div className="space-y-3 mb-6">
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

        {hasConfirmed && onCancelSeries && (
          <div className="pt-4 border-t border-gray-100 flex justify-center">
            <Button 
              variant="destructive" 
              className="w-full text-xs py-2.5 font-bold" 
              onClick={() => onCancelSeries(group.seriesId!)}
            >
              Cancelar Série
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {groupedReservations.map((group) => 
        group.type === 'single' 
          ? renderSingleCard(group.reservation!) 
          : renderSeriesCard(group)
      )}
    </div>
  );
};
