const API_BASE = "/api";

let currentUserId: string | null = null;
let currentUserRole: string | null = null;

export function setAuthUser(userId: string | null, role: string | null) {
  currentUserId = userId;
  currentUserRole = role;
}

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (currentUserId) {
    headers["x-user-id"] = currentUserId;
  }
  if (currentUserRole) {
    headers["x-user-role"] = currentUserRole;
  }
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Erro desconhecido" }));
    throw new Error(error.message || "Erro na requisição");
  }
  if (response.status === 204) {
    return {} as T;
  }
  return response.json();
}

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar?: string | null;
  cpf?: string | null;
}

export interface ApiRoom {
  id: number;
  name: string;
  capacity: number;
  location: string;
  image?: string | null;
  amenities: Array<{ id: string; name: string; icon: string }>;
  isAvailable: boolean;
  status?: string | null;
  pricePerHour?: number | null;
}

export interface ApiResource {
  id: number;
  name: string;
  category: string;
  status: string;
}

export interface ApiReservation {
  id: number;
  roomId: number;
  userId: number;
  roomName: string;
  roomLocation: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  timestamp: string | null;
}

export interface RoomAvailability {
  roomId: number;
  isAvailable: boolean;
  nextAvailableTime: string | null;
}

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<{ user: ApiUser }> => {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      return handleResponse(response);
    },
  },

  users: {
    getAll: async (): Promise<ApiUser[]> => {
      const response = await fetch(`${API_BASE}/users`, { headers: getAuthHeaders() });
      return handleResponse(response);
    },
    get: async (id: number): Promise<ApiUser> => {
      const response = await fetch(`${API_BASE}/users/${id}`, { headers: getAuthHeaders() });
      return handleResponse(response);
    },
    create: async (data: Omit<ApiUser, "id"> & { password: string }): Promise<ApiUser> => {
      const response = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    update: async (id: number, data: Partial<ApiUser & { password?: string }>): Promise<ApiUser> => {
      const response = await fetch(`${API_BASE}/users/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    delete: async (id: number): Promise<void> => {
      const response = await fetch(`${API_BASE}/users/${id}`, { method: "DELETE", headers: getAuthHeaders() });
      return handleResponse(response);
    },
    uploadAvatar: async (id: number, file: File): Promise<ApiUser> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64 = reader.result as string;
            const response = await fetch(`${API_BASE}/users/${id}/avatar`, {
              method: "POST",
              headers: getAuthHeaders(),
              body: JSON.stringify({ avatar: base64 }),
            });
            resolve(await handleResponse(response));
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
        reader.readAsDataURL(file);
      });
    },
  },

  rooms: {
    getAll: async (): Promise<ApiRoom[]> => {
      const response = await fetch(`${API_BASE}/rooms`, { headers: getAuthHeaders() });
      return handleResponse(response);
    },
    get: async (id: number): Promise<ApiRoom> => {
      const response = await fetch(`${API_BASE}/rooms/${id}`, { headers: getAuthHeaders() });
      return handleResponse(response);
    },
    checkAvailability: async (date: string, startTime: string, endTime: string): Promise<RoomAvailability[]> => {
      const params = new URLSearchParams({ date, startTime, endTime });
      const response = await fetch(`${API_BASE}/rooms/availability?${params}`, { headers: getAuthHeaders() });
      return handleResponse(response);
    },
    create: async (data: Omit<ApiRoom, "id">): Promise<ApiRoom> => {
      const response = await fetch(`${API_BASE}/rooms`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    update: async (id: number, data: Partial<ApiRoom>): Promise<ApiRoom> => {
      const response = await fetch(`${API_BASE}/rooms/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    delete: async (id: number): Promise<void> => {
      const response = await fetch(`${API_BASE}/rooms/${id}`, { method: "DELETE", headers: getAuthHeaders() });
      return handleResponse(response);
    },
  },

  resources: {
    getAll: async (): Promise<ApiResource[]> => {
      const response = await fetch(`${API_BASE}/resources`, { headers: getAuthHeaders() });
      return handleResponse(response);
    },
    get: async (id: number): Promise<ApiResource> => {
      const response = await fetch(`${API_BASE}/resources/${id}`, { headers: getAuthHeaders() });
      return handleResponse(response);
    },
    create: async (data: Omit<ApiResource, "id">): Promise<ApiResource> => {
      const response = await fetch(`${API_BASE}/resources`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    update: async (id: number, data: Partial<ApiResource>): Promise<ApiResource> => {
      const response = await fetch(`${API_BASE}/resources/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    delete: async (id: number): Promise<void> => {
      const response = await fetch(`${API_BASE}/resources/${id}`, { method: "DELETE", headers: getAuthHeaders() });
      return handleResponse(response);
    },
  },

  reservations: {
    getAll: async (): Promise<ApiReservation[]> => {
      const response = await fetch(`${API_BASE}/reservations`, { headers: getAuthHeaders() });
      return handleResponse(response);
    },
    getByUser: async (userId: number): Promise<ApiReservation[]> => {
      const response = await fetch(`${API_BASE}/reservations/user/${userId}`, { headers: getAuthHeaders() });
      return handleResponse(response);
    },
    get: async (id: number): Promise<ApiReservation> => {
      const response = await fetch(`${API_BASE}/reservations/${id}`, { headers: getAuthHeaders() });
      return handleResponse(response);
    },
    create: async (data: Omit<ApiReservation, "id" | "timestamp">): Promise<ApiReservation> => {
      const clientTimezoneOffset = new Date().getTimezoneOffset();
      const response = await fetch(`${API_BASE}/reservations`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...data, clientTimezoneOffset }),
      });
      return handleResponse(response);
    },
    update: async (id: number, data: Partial<ApiReservation>): Promise<ApiReservation> => {
      const response = await fetch(`${API_BASE}/reservations/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    delete: async (id: number): Promise<void> => {
      const response = await fetch(`${API_BASE}/reservations/${id}`, { method: "DELETE", headers: getAuthHeaders() });
      return handleResponse(response);
    },
  },
};
