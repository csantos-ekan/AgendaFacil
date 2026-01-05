import { storage } from "./storage";

export interface RoomAvailabilityResult {
  roomId: number;
  isAvailable: boolean;
  nextAvailableTime: string | null;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export async function checkRoomAvailability(
  roomId: number,
  date: string,
  startTime: string,
  endTime: string
): Promise<RoomAvailabilityResult> {
  const allReservations = await storage.getAllReservations();
  
  const roomReservations = allReservations
    .filter(r => r.roomId === roomId && r.date === date && r.status !== 'cancelled')
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  const requestedStart = timeToMinutes(startTime);
  const requestedEnd = timeToMinutes(endTime);

  let hasConflict = false;
  let nextAvailableTime: string | null = null;

  for (const reservation of roomReservations) {
    const resStart = timeToMinutes(reservation.startTime);
    const resEnd = timeToMinutes(reservation.endTime);

    if (requestedStart < resEnd && requestedEnd > resStart) {
      hasConflict = true;
      
      let candidateTime = resEnd;
      
      for (const futureRes of roomReservations) {
        const futureStart = timeToMinutes(futureRes.startTime);
        const futureEnd = timeToMinutes(futureRes.endTime);
        
        if (futureStart <= candidateTime && futureEnd > candidateTime) {
          candidateTime = futureEnd;
        }
      }
      
      nextAvailableTime = minutesToTime(candidateTime);
      break;
    }
  }

  return {
    roomId,
    isAvailable: !hasConflict,
    nextAvailableTime
  };
}

export async function checkAllRoomsAvailability(
  date: string,
  startTime: string,
  endTime: string
): Promise<RoomAvailabilityResult[]> {
  const rooms = await storage.getAllRooms();
  const results: RoomAvailabilityResult[] = [];

  for (const room of rooms) {
    const availability = await checkRoomAvailability(room.id, date, startTime, endTime);
    results.push(availability);
  }

  return results;
}
