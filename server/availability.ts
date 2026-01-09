import { storage } from "./storage";

export interface RoomAvailabilityResult {
  roomId: number;
  isAvailable: boolean;
  nextAvailableTime: string | null;
  reservedByName: string | null;
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
  let reservedByUserId: number | null = null;

  for (const reservation of roomReservations) {
    const resStart = timeToMinutes(reservation.startTime);
    const resEnd = timeToMinutes(reservation.endTime);

    if (requestedStart < resEnd && requestedEnd > resStart) {
      hasConflict = true;
      reservedByUserId = reservation.userId;
      
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

  let reservedByName: string | null = null;
  if (reservedByUserId) {
    const user = await storage.getUser(reservedByUserId);
    if (user) {
      reservedByName = user.name;
    }
  }

  return {
    roomId,
    isAvailable: !hasConflict,
    nextAvailableTime,
    reservedByName
  };
}

export async function checkAllRoomsAvailability(
  date: string,
  startTime: string,
  endTime: string
): Promise<RoomAvailabilityResult[]> {
  const [rooms, allReservations, allUsers] = await Promise.all([
    storage.getAllRooms(),
    storage.getAllReservations(),
    storage.getAllUsers()
  ]);
  
  const dayReservations = allReservations.filter(
    r => r.date === date && r.status !== 'cancelled'
  );
  
  const usersMap = new Map(allUsers.map(u => [u.id, u]));
  
  const requestedStart = timeToMinutes(startTime);
  const requestedEnd = timeToMinutes(endTime);
  
  return rooms.map(room => {
    const roomReservations = dayReservations
      .filter(r => r.roomId === room.id)
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

    let hasConflict = false;
    let nextAvailableTime: string | null = null;
    let reservedByUserId: number | null = null;

    for (const reservation of roomReservations) {
      const resStart = timeToMinutes(reservation.startTime);
      const resEnd = timeToMinutes(reservation.endTime);

      if (requestedStart < resEnd && requestedEnd > resStart) {
        hasConflict = true;
        reservedByUserId = reservation.userId;
        
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

    const reservedByName = reservedByUserId 
      ? usersMap.get(reservedByUserId)?.name || null
      : null;

    return {
      roomId: room.id,
      isAvailable: !hasConflict,
      nextAvailableTime,
      reservedByName
    };
  });
}
