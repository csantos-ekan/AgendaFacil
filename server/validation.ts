export interface ReservationTimeValidation {
  isValid: boolean;
  error: string | null;
}

export function parseTime(time: string): { hours: number; minutes: number } {
  const [h, m] = time.split(':').map(Number);
  return { hours: h, minutes: m };
}

export function timeToMinutes(time: string): number {
  const { hours, minutes } = parseTime(time);
  return hours * 60 + minutes;
}

export function getCurrentDateTime(): { date: string; time: string } {
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return { date, time };
}

export function validateReservationTime(
  reservationDate: string,
  startTime: string,
  endTime: string
): ReservationTimeValidation {
  const { date: currentDate, time: currentTime } = getCurrentDateTime();
  
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const currentMinutes = timeToMinutes(currentTime);
  
  if (reservationDate === currentDate) {
    if (startMinutes < currentMinutes) {
      return {
        isValid: false,
        error: 'O horário de início não pode ser menor que o horário atual.'
      };
    }
  }
  
  if (reservationDate < currentDate) {
    return {
      isValid: false,
      error: 'Não é possível fazer reservas para datas passadas.'
    };
  }
  
  const minimumDuration = 15;
  if (endMinutes - startMinutes < minimumDuration) {
    return {
      isValid: false,
      error: 'O horário final deve ser no mínimo 15 minutos após o horário inicial.'
    };
  }
  
  return { isValid: true, error: null };
}
