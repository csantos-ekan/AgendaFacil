
import { Room, Amenity, Reservation, User, Resource } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'admin-test',
    name: 'Administrador Sistema',
    email: 'admin@empresa.com',
    role: 'admin',
    status: 'ativo',
    cpf: '000.000.000-00',
    avatar: 'https://i.pravatar.cc/150?u=admin'
  },
  {
    id: 'colab-test',
    name: 'Colaborador Teste',
    email: 'colab@empresa.com',
    role: 'colaborador',
    status: 'ativo',
    cpf: '111.111.111-11',
    avatar: 'https://i.pravatar.cc/150?u=colab'
  },
  {
    id: 'u1',
    name: 'Ana Silva',
    email: 'ana.silva@empresa.com',
    role: 'admin',
    status: 'ativo',
    cpf: '123.456.789-00',
    avatar: 'https://i.pravatar.cc/150?u=u1'
  },
  {
    id: 'u2',
    name: 'Carlos Oliveira',
    email: 'carlos.o@empresa.com',
    role: 'colaborador',
    status: 'ativo',
    cpf: '234.567.890-11',
    avatar: 'https://i.pravatar.cc/150?u=u2'
  }
];

export const AMENITIES: Record<string, Amenity> = {
  TV: { id: '1', name: '4K TV / Monitor', icon: 'tv' },
  VIDEO: { id: '2', name: 'Vídeo Conf.', icon: 'video' },
  AC: { id: '3', name: 'Ar Condicionado', icon: 'wind' },
  BOARD: { id: '4', name: 'Quadro Branco', icon: 'board' },
  USB: { id: '5', name: 'Tomadas USB', icon: 'usb' },
  WIFI: { id: '6', name: 'Wi-Fi Dedicado', icon: 'wifi' },
  COFFEE: { id: '7', name: 'Máquina de Café', icon: 'coffee' },
  SOUND: { id: '8', name: 'Sound', icon: 'coffee' }, // Using coffee as placeholder if sound icon missing in simple map
  PROJECTOR: { id: '9', name: 'Projetor', icon: 'video' },
};

export const MOCK_ROOMS: Room[] = [
  {
    id: '101',
    name: 'Sala de Conferência A',
    location: 'Bloco A, 4º Andar',
    capacity: 20,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600',
    amenities: [AMENITIES.PROJECTOR, AMENITIES.AC, AMENITIES.WIFI],
    isAvailable: true,
    status: 'active'
  },
  {
    id: '102',
    name: 'Meeting Room B',
    location: 'Bloco B, 2º Andar',
    capacity: 6,
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=600',
    amenities: [AMENITIES.TV, AMENITIES.WIFI],
    isAvailable: false,
    status: 'active'
  },
  {
    id: '201',
    name: 'Auditório Principal',
    location: 'Térreo, Ala Sul',
    capacity: 100,
    image: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=600',
    amenities: [AMENITIES.PROJECTOR, AMENITIES.AC, AMENITIES.WIFI, AMENITIES.SOUND],
    isAvailable: true,
    status: 'maintenance'
  },
  {
    id: '305',
    name: 'Sala Brainstorm',
    location: 'Bloco C, 1º Andar',
    capacity: 8,
    image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&q=80&w=600',
    amenities: [AMENITIES.BOARD, AMENITIES.AC],
    isAvailable: true,
    status: 'active'
  }
];

// Mock data for resources
export const MOCK_RESOURCES: Resource[] = [
  { id: 'res_01', name: 'Projetor Sony 4K', category: 'Equipamento', status: 'Disponível' },
  { id: 'res_02', name: 'Sistema Ar Condicionado Central', category: 'Infraestrutura', status: 'Disponível' },
  { id: 'res_03', name: 'Webcam Logitech Brio', category: 'Equipamento', status: 'Manutenção' },
  { id: 'res_04', name: 'Cabo HDMI 5m', category: 'Acessório', status: 'Disponível' },
  { id: 'res_05', name: 'Adaptador USB-C para HDMI', category: 'Acessório', status: 'Descontinuado' }
];

export const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: 'res_001',
    roomId: '101',
    roomName: 'Sala Alpha – Torre A',
    roomLocation: 'Bloco A, 4º Andar',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:00',
    status: 'confirmed',
    timestamp: Date.now(),
  }
];

export const INITIAL_FILTERS = {
  date: new Date().toISOString().split('T')[0],
  startTime: '09:00',
  endTime: '10:00',
  capacity: 1,
};
