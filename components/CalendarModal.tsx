import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const CalendarModal: React.FC<CalendarModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedDate, 
  onSelectDate 
}) => {
  // Parse initial date or default to today
  const initialDate = selectedDate ? new Date(selectedDate) : new Date();
  
  // State for the currently viewed month/year
  const [viewDate, setViewDate] = useState(initialDate);

  // Reset view when modal opens
  useEffect(() => {
    if (isOpen) {
      setViewDate(selectedDate ? new Date(selectedDate) : new Date());
    }
  }, [isOpen, selectedDate]);

  if (!isOpen) return null;

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    // Format: YYYY-MM-DD
    // Note: Month is 0-indexed, so we add 1. padStart ensures 01, 02, etc.
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    onSelectDate(formattedDate);
    onClose();
  };

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth); // 0 = Sunday

  // Helper to check if a date is in the past (ignoring time)
  const isPastDate = (day: number) => {
    const checkDate = new Date(currentYear, currentMonth, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  // Helper to check if date is selected
  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    // We construct the date string manually to avoid timezone issues with standard Date parsing
    const checkDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return selectedDate === checkDateStr;
  };

  // Generate grid placeholders
  const blanks = Array.from({ length: firstDayIndex }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-dark/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h3 className="text-lg font-semibold text-dark">Selecionar Data</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-dark transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar Controls */}
        <div className="p-4 pb-2 flex items-center justify-between">
          <button 
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-full text-medium hover:text-dark transition-colors"
            // Optional: disable going back too far if desired, but usually seeing past months is fine as long as selection is disabled
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-dark text-lg">
            {MONTHS[currentMonth]} {currentYear}
          </span>
          <button 
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-full text-medium hover:text-dark transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="p-4 pt-2">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-400 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {blanks.map((_, i) => (
              <div key={`blank-${i}`} className="aspect-square" />
            ))}
            
            {days.map(day => {
              const disabled = isPastDate(day);
              const selected = isSelected(day);
              
              return (
                <button
                  key={day}
                  disabled={disabled}
                  onClick={() => handleDayClick(day)}
                  className={`
                    aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200
                    ${selected 
                      ? 'bg-primary text-white shadow-md' 
                      : disabled 
                        ? 'text-gray-300 cursor-not-allowed bg-transparent' 
                        : 'text-dark hover:bg-blue-50 hover:text-primary cursor-pointer'
                    }
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
