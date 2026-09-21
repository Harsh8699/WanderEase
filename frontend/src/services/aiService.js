import api from '@/lib/axios';

export const aiService = {
  suggestItinerary: async (destinationName, duration, weatherForecast) => {
    const response = await api.post('/api/ai/suggest-itinerary', {
      destinationName,
      duration,
      weatherForecast,
    });
    return response.data;
  },

  generateBackpackList: async (destinationName, duration, travelers, weatherForecast) => {
    const response = await api.post('/api/ai/backpack-list', {
      destinationName,
      duration,
      travelers,
      weatherForecast,
    });
    return response.data;
  },
};
