import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Type, FileText, Repeat, ChevronDown, ChevronUp } from 'lucide-react';
import { Room, SearchFilters } from '../types';
import { Button } from './ui/button';
import { ParticipantAutocomplete } from './ParticipantAutocomplete';
import { TimePickerModal } from './TimePickerModal';

interface UserSuggestion {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
}

export interface RecurrenceRule {
  startDate: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  repeatEvery: number;
  repeatPeriod: 'day' | 'week' | 'month' | 'year';
  weekDays: number[];
  endDate: string;
}

export interface BookingDetails {
  participantEmails: string;
  title?: string;
  description?: string;
  isSeries?: boolean;
  recurrenceRule?: RecurrenceRule;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (details: BookingDetails) => void;
  room: Room | null;
  filters: SearchFilters;
  users?: UserSuggestion[];
  currentUserId?: number;
}

const WEEK_DAYS = [
  { value: 1, label: 'S', fullLabel: 'Segunda' },
  { value: 2, label: 'T', fullLabel: 'Terça' },
  { value: 3, label: 'Q', fullLabel: 'Quarta' },
  { value: 4, label: 'Q', fullLabel: 'Quinta' },
  { value: 5, label: 'S', fullLabel: 'Sexta' },
  { value: 6, label: 'S', fullLabel: 'Sábado' },
  { value: 0, label: 'D', fullLabel: 'Domingo' },
];

export const BookingModal: React.FC<BookingModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  room, 
  filters,
  users = [],
  currentUserId
}) => {
  const [inviteEmails, setInviteEmails] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSeries, setIsSeries] = useState(false);
  const [seriesExpanded, setSeriesExpanded] = useState(false);
  
  const [recurrenceStartDate, setRecurrenceStartDate] = useState(filters.date);
  const [recurrenceStartTime, setRecurrenceStartTime] = useState(filters.startTime);
  const [recurrenceEndTime, setRecurrenceEndTime] = useState(filters.endTime);
  const [isAllDay, setIsAllDay] = useState(false);
  const [isRecurrenceStartTimeOpen, setIsRecurrenceStartTimeOpen] = useState(false);
  const [isRecurrenceEndTimeOpen, setIsRecurrenceEndTimeOpen] = useState(false);
  const [repeatEvery, setRepeatEvery] = useState(1);
  const [repeatPeriod, setRepeatPeriod] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [selectedWeekDays, setSelectedWeekDays] = useState<number[]>([]);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      setInviteEmails('');
      setTitle('');
      setDescription('');
      setIsSeries(false);
      setSeriesExpanded(false);
      setRecurrenceStartDate(filters.date);
      setRecurrenceStartTime(filters.startTime);
      setRecurrenceEndTime(filters.endTime);
      setIsAllDay(false);
      setRepeatEvery(1);
      setRepeatPeriod('week');
      setSelectedWeekDays([]);
      setRecurrenceEndDate('');
    }
  }, [isOpen, filters]);

  if (!isOpen || !room) return null;

  const toggleWeekDay = (day: number) => {
    setSelectedWeekDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const toggleSeries = () => {
    if (!isSeries) {
      setIsSeries(true);
      setSeriesExpanded(true);
      const startDate = new Date(filters.date + 'T00:00:00');
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      setRecurrenceEndDate(endDate.toISOString().split('T')[0]);
    } else {
      setIsSeries(false);
      setSeriesExpanded(false);
    }
  };

  const validateRecurrence = (): string | null => {
    if (!isSeries) return null;
    
    if (!recurrenceEndDate) {
      return 'Selecione a data final da recorrência';
    }
    
    const startD = new Date(recurrenceStartDate + 'T00:00:00');
    const endD = new Date(recurrenceEndDate + 'T00:00:00');
    
    if (endD <= startD) {
      return 'A data final deve ser posterior à data inicial';
    }
    
    if (!isAllDay && recurrenceEndTime <= recurrenceStartTime) {
      return 'A hora final deve ser maior que a hora inicial';
    }
    
    if (repeatPeriod === 'week' && selectedWeekDays.length === 0) {
      return 'Selecione ao menos um dia da semana';
    }
    
    return null;
  };

  const handleConfirm = () => {
    const validationError = validateRecurrence();
    if (validationError) {
      alert(validationError);
      return;
    }
    
    const details: BookingDetails = {
      participantEmails: inviteEmails,
      title: title.trim() || undefined,
      description: description.trim() || undefined,
    };
    
    if (isSeries) {
      details.isSeries = true;
      details.recurrenceRule = {
        startDate: recurrenceStartDate,
        startTime: isAllDay ? '00:00' : recurrenceStartTime,
        endTime: isAllDay ? '23:59' : recurrenceEndTime,
        isAllDay,
        repeatEvery,
        repeatPeriod,
        weekDays: repeatPeriod === 'week' ? selectedWeekDays : [],
        endDate: recurrenceEndDate,
      };
    }
    
    onConfirm(details);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-dark/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto">
        
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 sticky top-0 z-10">
          <h3 className="text-lg font-semibold text-dark">Confirmar Reserva</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-dark transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <img 
              src={room.image} 
              alt={room.name} 
              className="w-20 h-20 rounded-lg object-cover shadow-sm border border-gray-100"
            />
            <div className="flex-1">
              <h4 className="text-lg font-bold text-dark">{room.name}</h4>
              <p className="text-medium text-sm flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                {room.location}
              </p>
            </div>
            <button
              onClick={toggleSeries}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isSeries 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Repeat className="w-4 h-4" />
              Série
            </button>
          </div>

          {!isSeries && (
            <div className="bg-blue-50 rounded-lg p-4 space-y-3 mb-6 border border-blue-100">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 text-medium">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>Data</span>
                </div>
                <span className="font-semibold text-dark">{new Date(filters.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 text-medium">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Horário</span>
                </div>
                <span className="font-semibold text-dark">
                  {filters.startTime} - {filters.endTime}
                </span>
              </div>
            </div>
          )}

          {isSeries && (
            <div className="border border-gray-200 rounded-lg mb-6 overflow-hidden">
              <button
                onClick={() => setSeriesExpanded(!seriesExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-primary" />
                  <span className="font-medium text-dark">Configurar Recorrência</span>
                </div>
                {seriesExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              
              {seriesExpanded && (
                <div className="p-4 space-y-4 bg-white">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark mb-1">Data Inicial</label>
                      <input
                        type="date"
                        value={recurrenceStartDate}
                        onChange={(e) => setRecurrenceStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark mb-1">Data Final</label>
                      <input
                        type="date"
                        value={recurrenceEndDate}
                        onChange={(e) => setRecurrenceEndDate(e.target.value)}
                        min={recurrenceStartDate}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="allDay"
                      checked={isAllDay}
                      onChange={(e) => setIsAllDay(e.target.checked)}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor="allDay" className="text-sm text-dark">Dia inteiro</label>
                  </div>

                  {!isAllDay && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-dark mb-1">Hora Início</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Clock className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                          </div>
                          <input
                            type="text"
                            readOnly
                            value={recurrenceStartTime}
                            onClick={() => setIsRecurrenceStartTimeOpen(true)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary cursor-pointer hover:border-primary transition-colors"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark mb-1">Hora Fim</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Clock className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                          </div>
                          <input
                            type="text"
                            readOnly
                            value={recurrenceEndTime}
                            onClick={() => setIsRecurrenceEndTimeOpen(true)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary cursor-pointer hover:border-primary transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-dark">Repetir a cada</span>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={repeatEvery}
                      onChange={(e) => setRepeatEvery(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                      className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-center focus:ring-primary focus:border-primary"
                    />
                    <select
                      value={repeatPeriod}
                      onChange={(e) => setRepeatPeriod(e.target.value as typeof repeatPeriod)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary"
                    >
                      <option value="day">Dia(s)</option>
                      <option value="week">Semana(s)</option>
                      <option value="month">Mês(es)</option>
                      <option value="year">Ano(s)</option>
                    </select>
                  </div>

                  {repeatPeriod === 'week' && (
                    <div>
                      <label className="block text-sm font-medium text-dark mb-2">Dias da Semana</label>
                      <div className="flex gap-2">
                        {WEEK_DAYS.map((day) => (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => toggleWeekDay(day.value)}
                            title={day.fullLabel}
                            className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${
                              selectedWeekDays.includes(day.value)
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-dark mb-2">Título da Reunião</label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <Type className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Alinhamento de Projeto"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary bg-white text-dark"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-dark mb-2">Descrição</label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <FileText className="h-4 w-4 text-gray-400" />
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o objetivo da reunião..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary focus:border-primary min-h-[60px] resize-none bg-white text-dark"
              />
            </div>
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium text-dark mb-2">Convidar Participantes</label>
            <ParticipantAutocomplete
              value={inviteEmails}
              onChange={setInviteEmails}
              users={users}
              currentUserId={currentUserId}
            />
            <p className="text-xs text-medium mt-1.5">
              Digite para buscar usuários ou adicione e-mails separados por vírgula.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end sticky bottom-0">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleConfirm}>
            {isSeries ? 'Criar Série' : 'Confirmar Reserva'}
          </Button>
        </div>
      </div>

      <TimePickerModal
        isOpen={isRecurrenceStartTimeOpen}
        onClose={() => setIsRecurrenceStartTimeOpen(false)}
        title="Hora de Início"
        time={recurrenceStartTime}
        onSelectTime={(time) => {
          setRecurrenceStartTime(time);
          const [h, m] = time.split(':').map(Number);
          const endDate = new Date();
          endDate.setHours(h);
          endDate.setMinutes(m + 60);
          const newEndTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
          if (recurrenceEndTime <= time) {
            setRecurrenceEndTime(newEndTime);
          }
        }}
      />

      <TimePickerModal
        isOpen={isRecurrenceEndTimeOpen}
        onClose={() => setIsRecurrenceEndTimeOpen(false)}
        title="Hora de Fim"
        time={recurrenceEndTime}
        onSelectTime={setRecurrenceEndTime}
        minTime={(() => {
          const [h, m] = recurrenceStartTime.split(':').map(Number);
          const date = new Date();
          date.setHours(h);
          date.setMinutes(m + 15);
          return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        })()}
      />
    </div>
  );
};
