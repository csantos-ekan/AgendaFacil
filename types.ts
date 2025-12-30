export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'colaborador';
  status: 'ativo' | 'inativo';
  avatar?: string;
  cpf?: string;
}

export interface Amenity {
  id: string;
  name: string;
  icon: 'tv' | 'video' | 'wind' | 'board' | 'usb' | 'wifi' | 'coffee' | 'sound';
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  location: string;
  image: string;
  amenities: Amenity[];
  isAvailable: boolean;
  status?: 'active' | 'maintenance';
  pricePerHour?: number;
  nextAvailableTime?: string | null;
}

export interface Resource {
  id: string;
  name: string;
  category: 'Equipamento' | 'Infraestrutura' | 'Acessório';
  status: 'Disponível' | 'Manutenção' | 'Descontinuado';
}

export interface Reservation {
  id: string;
  roomId: string;
  roomName: string;
  roomLocation: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'cancelled';
  timestamp: number;
}

export interface SearchFilters {
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
}

export type ViewState = 'search' | 'reservations' | 'profile' | 'users-management' | 'rooms-management' | 'resources-management';