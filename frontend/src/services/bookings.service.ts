import api from '@/lib/api';

export interface Booking {
  id: string;
  bookingNumber: string;
  userId?: string; // Peut être null pour les réservations guest
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  clientName?: string; // Pour les réservations guest
  clientPhone?: string;
  clientEmail?: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes?: string;
  reminderSent: boolean;
  cancellationReason?: string;
  rescheduleCount: number;
  service?: {
    id: string;
    name: string;
    price: number;
    duration: number;
    provider?: {
      id: string;
      firstName: string;
      lastName: string;
    };
    images?: Array<{ url: string }>;
  };
  user?: {
    id: string;
    email: string;
    profile?: {
      firstName: string;
      lastName: string;
      phone?: string;
    };
  };
  payment?: {
    id: string;
    status: string;
    amount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingDto {
  serviceId: string;
  date: string;
  startTime: string;
  location?: string;
  clientName?: string; // Pour les réservations guest
  clientPhone?: string;
  clientEmail?: string;
  notes?: string;
}

export interface UpdateBookingDto {
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  date?: string;
  startTime?: string;
  location?: string;
  notes?: string;
  cancellationReason?: string;
}

export const bookingsService = {
  getAll: async (provider?: boolean): Promise<Booking[]> => {
    const params = provider ? '?provider=true' : '';
    const response = await api.get<Booking[]>(`/api/bookings${params}`);
    return response.data;
  },

  getById: async (id: string): Promise<Booking> => {
    const response = await api.get<Booking>(`/api/bookings/${id}`);
    return response.data;
  },

  create: async (data: CreateBookingDto): Promise<Booking> => {
    const response = await api.post<Booking>('/api/bookings', data);
    return response.data;
  },

  update: async (id: string, data: UpdateBookingDto): Promise<Booking> => {
    const response = await api.patch<Booking>(`/api/bookings/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/bookings/${id}`);
  },

  getAvailability: async (serviceId: string, date: string) => {
    const response = await api.get(`/api/bookings/availability/${serviceId}?date=${date}`);
    return response.data;
  },

  // Pour les prestataires (COIFFEUSE)
  clearProviderHistory: async (): Promise<{ message: string; count: number }> => {
    const response = await api.delete<{ message: string; count: number }>('/api/bookings/provider/clear-history');
    return response.data;
  },

  deleteProviderBooking: async (id: string): Promise<void> => {
    await api.delete(`/api/bookings/provider/${id}`);
  },
};

