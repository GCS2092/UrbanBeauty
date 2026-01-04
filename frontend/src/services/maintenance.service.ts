import api from '@/lib/api';

export interface MaintenanceSettings {
  id: string;
  isBookingDisabled: boolean;
  bookingMessage?: string;
  isChatDisabled: boolean;
  chatMessage?: string;
  isPrestatairesDisabled: boolean;
  prestatairesMessage?: string;
  isAuthDisabled: boolean;
  authMessage?: string;
  updatedBy?: string;
  updatedAt: string;
  createdAt: string;
}

export interface UpdateMaintenanceSettingsDto {
  isBookingDisabled?: boolean;
  bookingMessage?: string;
  isChatDisabled?: boolean;
  chatMessage?: string;
  isPrestatairesDisabled?: boolean;
  prestatairesMessage?: string;
  isAuthDisabled?: boolean;
  authMessage?: string;
}

export interface FeatureStatus {
  disabled: boolean;
  message?: string;
}

export const maintenanceService = {
  getSettings: async (): Promise<MaintenanceSettings> => {
    const response = await api.get<MaintenanceSettings>('/api/maintenance/settings');
    return response.data;
  },

  updateSettings: async (dto: UpdateMaintenanceSettingsDto): Promise<MaintenanceSettings> => {
    const response = await api.put<MaintenanceSettings>('/api/maintenance/settings', dto);
    return response.data;
  },

  checkBooking: async (): Promise<FeatureStatus> => {
    const response = await api.get<FeatureStatus>('/api/maintenance/check/booking');
    return response.data;
  },

  checkChat: async (): Promise<FeatureStatus> => {
    const response = await api.get<FeatureStatus>('/api/maintenance/check/chat');
    return response.data;
  },

  checkPrestataires: async (): Promise<FeatureStatus> => {
    const response = await api.get<FeatureStatus>('/api/maintenance/check/prestataires');
    return response.data;
  },

  checkAuth: async (): Promise<FeatureStatus> => {
    const response = await api.get<FeatureStatus>('/api/maintenance/check/auth');
    return response.data;
  },
};

