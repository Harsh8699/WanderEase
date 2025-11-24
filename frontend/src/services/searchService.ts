import api from '@/lib/axios';

export interface Destination {
  name: string;
  currentTemp: number;
  weatherDescription: string;
  estimatedCostPerPerson: number;
  imageUrl?: string; // optional Unsplash image URL added on the frontend
}

export const searchService = {
  discoverDestinations: async (weather: string, duration: number): Promise<Destination[]> => {
    const response = await api.post('/api/search/discover', { weather, duration });
    return response.data;
  },
};
