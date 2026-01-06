import React, { useState } from 'react';
import { Search, Calendar, Clock, Users } from 'lucide-react';
import { SearchFilters as FilterType } from '../types';
import { Button } from './ui/button';
import { CalendarModal } from './CalendarModal';
import { TimePickerModal } from './TimePickerModal';

interface SearchFiltersProps {
  filters: FilterType;
  onFilterChange: (newFilters: FilterType) => void;
  onSearch: () => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({ filters, onFilterChange, onSearch }) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isStartTimeOpen, setIsStartTimeOpen] = useState(false);
  const [isEndTimeOpen, setIsEndTimeOpen] = useState(false);

  // Helper: Verifica se a data selecionada é hoje
  const isToday = () => {
    if (!filters.date) return false;
    const today = new Date();
    const selected = new Date(filters.date);
    // Comparação simples de string YYYY-MM-DD para evitar problemas de fuso no exemplo local
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return filters.date === todayStr;
  };

  // Helper: Retorna o próximo intervalo de 15 minutos formatado "HH:mm"
  const getNextQuarterHour = () => {
    const now = new Date();
    const minutes = now.getMinutes();
    const remainder = minutes % 15;
    
    if (remainder === 0) {
      // Já está no intervalo, avança para o próximo
      now.setMinutes(minutes + 15);
    } else {
      // Arredonda para o próximo intervalo de 15 minutos
      now.setMinutes(minutes + (15 - remainder));
    }
    
    // Trata virada de hora/dia
    if (now.getHours() >= 24) {
      now.setHours(23, 45);
    }
    
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  // Helper: Adiciona minutos a um horário "HH:mm" e retorna "HH:mm"
  const addMinutes = (time: string, mins: number) => {
    const [h, m] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(h);
    date.setMinutes(m + mins);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // Calcula o minTime para o Inicio
  const getMinStartTime = () => {
    if (isToday()) {
      return getNextQuarterHour();
    }
    return undefined; // Sem restrição se for data futura
  };

  // Calcula o minTime para o Fim (Inicio + 15 min)
  const getMinEndTime = () => {
    if (filters.startTime) {
      return addMinutes(filters.startTime, 15);
    }
    return undefined;
  };

  const handleCapacityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, capacity: Number(e.target.value) });
  };

  const handleDateSelect = (date: string) => {
    onFilterChange({ ...filters, date });
  };

  const handleStartTimeSelect = (time: string) => {
    // Ao mudar o inicio, se o fim ficar inválido (menor que inicio + 15), ajusta o fim automaticamente
    const minEnd = addMinutes(time, 15);
    // Comparação simples de string funciona para formato HH:mm 24h
    let newEndTime = filters.endTime;
    
    if (filters.endTime < minEnd) {
      newEndTime = addMinutes(time, 60); // Sugere 1 hora de duração por padrão
      // Se virar o dia (ex: 23:00 + 60min = 00:00), ajusta para 23:59 ou similar na logica real, 
      // mas aqui vamos manter simples
    }

    onFilterChange({ 
      ...filters, 
      startTime: time,
      endTime: newEndTime
    });
  };

  const handleEndTimeSelect = (time: string) => {
    onFilterChange({ ...filters, endTime: time });
  };

  // Format date for display (DD/MM/YYYY)
  const displayDate = filters.date 
    ? new Date(filters.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) 
    : '';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 transform hover:shadow-md transition-shadow duration-300">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        
        {/* Date Picker Custom */}
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-medium mb-1.5">Data</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
            </div>
            <input
              type="text"
              readOnly
              value={displayDate}
              onClick={() => setIsCalendarOpen(true)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm text-dark bg-white cursor-pointer hover:border-primary transition-colors"
              placeholder="Selecione uma data"
            />
          </div>
        </div>

        {/* Start Time Custom */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-medium mb-1.5">Início</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Clock className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
            </div>
            <input
              type="text"
              readOnly
              value={filters.startTime}
              onClick={() => setIsStartTimeOpen(true)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm text-dark bg-white cursor-pointer hover:border-primary transition-colors"
            />
          </div>
        </div>

        {/* End Time Custom */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-medium mb-1.5">Fim</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Clock className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
            </div>
            <input
              type="text"
              readOnly
              value={filters.endTime}
              onClick={() => setIsEndTimeOpen(true)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm text-dark bg-white cursor-pointer hover:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Capacity */}
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-medium mb-1.5">Capacidade Mínima</label>
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Users className="h-5 w-5 text-gray-400" />
            </div>
            <select
              name="capacity"
              value={filters.capacity}
              onChange={handleCapacityChange}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm text-dark bg-white"
            >
              <option value="1">Qualquer tamanho</option>
              <option value="4">4+ Pessoas</option>
              <option value="8">8+ Pessoas</option>
              <option value="12">12+ Pessoas</option>
              <option value="20">20+ Pessoas</option>
            </select>
          </div>
        </div>

        {/* Action Button */}
        <div className="md:col-span-2">
          <Button onClick={onSearch} fullWidth icon={<Search className="w-4 h-4"/>}>
            Buscar
          </Button>
        </div>

      </div>

      {/* Modals */}
      <CalendarModal 
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={filters.date}
        onSelectDate={handleDateSelect}
      />

      <TimePickerModal
        isOpen={isStartTimeOpen}
        onClose={() => setIsStartTimeOpen(false)}
        title="Horário de Início"
        time={filters.startTime}
        onSelectTime={handleStartTimeSelect}
        minTime={getMinStartTime()}
      />

      <TimePickerModal
        isOpen={isEndTimeOpen}
        onClose={() => setIsEndTimeOpen(false)}
        title="Horário de Fim"
        time={filters.endTime}
        onSelectTime={handleEndTimeSelect}
        minTime={getMinEndTime()}
      />
    </div>
  );
};