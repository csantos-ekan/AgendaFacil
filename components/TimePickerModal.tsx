import React, { useEffect, useState, useRef } from 'react';
import { X, Check } from 'lucide-react';
import { Button } from './ui/button';

interface TimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  time: string; // Formato "HH:mm"
  onSelectTime: (time: string) => void;
  minTime?: string; // Formato "HH:mm", opcional
}

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  isOpen,
  onClose,
  title,
  time,
  onSelectTime,
  minTime
}) => {
  const [selectedHour, setSelectedHour] = useState<number>(9);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);
  
  // Refs para scroll automático
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);

  // Inicializa o estado com o tempo recebido
  useEffect(() => {
    if (isOpen && time) {
      const [h, m] = time.split(':').map(Number);
      setSelectedHour(h);
      setSelectedMinute(m);
    }
  }, [isOpen, time]);

  // Efeito para scrollar até o item selecionado ao abrir
  useEffect(() => {
    if (isOpen) {
      const scrollSmooth = (ref: React.RefObject<HTMLDivElement | null>, index: number) => {
        if (ref.current) {
          const itemHeight = 40; // Altura aproximada de cada item
          ref.current.scrollTop = index * itemHeight - (ref.current.clientHeight / 2) + (itemHeight / 2);
        }
      };
      // Pequeno timeout para garantir que o DOM renderizou
      setTimeout(() => {
        scrollSmooth(hoursRef, selectedHour);
        scrollSmooth(minutesRef, selectedMinute / 15);
      }, 100);
    }
  }, [isOpen, selectedHour, selectedMinute]);

  if (!isOpen) return null;

  // Gerar listas
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45]; // Passos de 15 minutos para agendamento corporativo

  // Helpers de validação
  const isHourDisabled = (h: number) => {
    if (!minTime) return false;
    const [minH] = minTime.split(':').map(Number);
    return h < minH;
  };

  const isMinuteDisabled = (h: number, m: number) => {
    if (!minTime) return false;
    const [minH, minM] = minTime.split(':').map(Number);
    if (h < minH) return true;
    if (h === minH) return m < minM;
    return false;
  };

  const handleConfirm = () => {
    const formattedTime = `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;
    onSelectTime(formattedTime);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-dark/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 flex-shrink-0">
          <h3 className="text-lg font-semibold text-dark">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-dark transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Picker Content */}
        <div className="flex-1 overflow-hidden p-6">
          <div className="flex justify-center gap-8 h-64">
            
            {/* Coluna Horas */}
            <div className="flex flex-col items-center w-20">
              <span className="text-xs font-semibold text-medium mb-2 uppercase tracking-wide">Horas</span>
              <div 
                ref={hoursRef}
                className="w-full h-full overflow-y-auto scrollbar-hide snap-y snap-mandatory border-r border-gray-100 pr-2"
              >
                {hours.map((h) => {
                  const disabled = isHourDisabled(h);
                  return (
                    <button
                      key={h}
                      disabled={disabled}
                      onClick={() => !disabled && setSelectedHour(h)}
                      className={`
                        w-full py-2 mb-1 rounded-md text-center transition-all snap-center
                        ${selectedHour === h ? 'bg-primary text-white font-bold shadow-sm' : ''}
                        ${disabled ? 'text-gray-300 cursor-not-allowed' : selectedHour !== h ? 'text-dark hover:bg-gray-50' : ''}
                      `}
                    >
                      {String(h).padStart(2, '0')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Coluna Minutos */}
            <div className="flex flex-col items-center w-20">
              <span className="text-xs font-semibold text-medium mb-2 uppercase tracking-wide">Minutos</span>
              <div 
                ref={minutesRef}
                className="w-full h-full overflow-y-auto scrollbar-hide snap-y snap-mandatory pl-2"
              >
                {minutes.map((m) => {
                  const disabled = isMinuteDisabled(selectedHour, m);
                  return (
                    <button
                      key={m}
                      disabled={disabled}
                      onClick={() => !disabled && setSelectedMinute(m)}
                      className={`
                        w-full py-2 mb-1 rounded-md text-center transition-all snap-center
                        ${selectedMinute === m ? 'bg-primary text-white font-bold shadow-sm' : ''}
                        ${disabled ? 'text-gray-300 cursor-not-allowed' : selectedMinute !== m ? 'text-dark hover:bg-gray-50' : ''}
                      `}
                    >
                      {String(m).padStart(2, '0')}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <Button onClick={handleConfirm} fullWidth icon={<Check className="w-4 h-4" />}>
            Confirmar Horário
          </Button>
        </div>

      </div>
    </div>
  );
};
