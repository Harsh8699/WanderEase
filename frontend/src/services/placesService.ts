import api from '@/lib/axios';

export interface Place {
  id: string;
  name: string;
  address: string;
  category: string;
  coordinates: {
    lon: number;
    lat: number;
  };
}

export const placesService = {
  getPointsOfInterest: async (city: string, category: string): Promise<Place[]> => {
    const response = await api.get('/api/places', { params: { city, category } });
    return response.data;
  },
};
