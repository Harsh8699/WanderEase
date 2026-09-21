import api from '@/lib/axios';

export const searchService = {
  discoverDestinations: async (weather, duration) => {
    const response = await api.post('/api/search/discover', { weather, duration });
    return response.data;
  },
};
