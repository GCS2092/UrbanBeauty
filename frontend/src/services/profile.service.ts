import api from '@/lib/api';

export interface Profile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  avatar?: string;
  bio?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  specialties?: string[];
  experience?: number;
  isProvider: boolean;
  rating?: number;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  bio?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  specialties?: string[];
  experience?: number;
}

export const profileService = {
  getMyProfile: async (): Promise<Profile> => {
    const response = await api.get('/api/profile');
    return response.data;
  },

  update: async (data: UpdateProfileDto): Promise<Profile> => {
    const response = await api.patch('/api/profile', data);
    return response.data;
  },
};

