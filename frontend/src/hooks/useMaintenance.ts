'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceService, MaintenanceSettings, UpdateMaintenanceSettingsDto, FeatureStatus } from '@/services/maintenance.service';

export function useMaintenanceSettings() {
  return useQuery({
    queryKey: ['maintenance', 'settings'],
    queryFn: () => maintenanceService.getSettings(),
  });
}

export function useUpdateMaintenanceSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateMaintenanceSettingsDto) => maintenanceService.updateSettings(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    },
  });
}

export function useCheckBooking() {
  return useQuery({
    queryKey: ['maintenance', 'check', 'booking'],
    queryFn: () => maintenanceService.checkBooking(),
    staleTime: 30000, // Cache pendant 30 secondes
  });
}

export function useCheckChat() {
  return useQuery({
    queryKey: ['maintenance', 'check', 'chat'],
    queryFn: () => maintenanceService.checkChat(),
    staleTime: 30000,
  });
}

export function useCheckPrestataires() {
  return useQuery({
    queryKey: ['maintenance', 'check', 'prestataires'],
    queryFn: () => maintenanceService.checkPrestataires(),
    staleTime: 30000,
  });
}

export function useCheckAuth() {
  return useQuery({
    queryKey: ['maintenance', 'check', 'auth'],
    queryFn: () => maintenanceService.checkAuth(),
    staleTime: 30000,
  });
}

