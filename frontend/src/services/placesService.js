import api from '@/lib/axios';

export const placesService = {
  getPointsOfInterest: async (city, category) => {
    const response = await api.get('/api/places', { params: { city, category } });
    return response.data;
  },
};
