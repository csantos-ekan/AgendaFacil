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
  endTime: string,
  clientTimezoneOffset?: number
): ReservationTimeValidation {
  const [year, month, day] = reservationDate.split('-').map(Number);
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const now = new Date();
  
  let clientNow: Date;
  if (clientTimezoneOffset !== undefined) {
    const serverOffset = now.getTimezoneOffset();
    const offsetDiff = (serverOffset - clientTimezoneOffset) * 60 * 1000;
    clientNow = new Date(now.getTime() + offsetDiff);
  } else {
    clientNow = now;
  }
  
  const reservationStart = new Date(year, month - 1, day, startHour, startMin);
  const reservationEnd = new Date(year, month - 1, day, endHour, endMin);
  
  if (reservationStart < clientNow) {
    return {
      isValid: false,
      error: 'O horário de início não pode ser no passado.'
    };
  }
  
  const minimumDurationMs = 15 * 60 * 1000;
  if (reservationEnd.getTime() - reservationStart.getTime() < minimumDurationMs) {
    return {
      isValid: false,
      error: 'O horário final deve ser no mínimo 15 minutos após o horário inicial.'
    };
  }
  
  return { isValid: true, error: null };
}
