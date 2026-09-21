import api from '@/lib/axios';

export const planService = {
  generateBlueprint: async (origin, destinationName, departureDate, duration, travelers) => {
    const response = await api.post('/api/plan/generate', {
      origin,
      destinationName,
      departureDate,
      duration,
      travelers,
    });
    return response.data;
  },
};
