import api from '@/lib/axios';

export const tripService = {
  createTrip: async (tripName, tripMode, blueprint) => {
    const response = await api.post('/api/trips', { tripName, tripMode, blueprint });
    return response.data;
  },

  getUserTrips: async () => {
    const response = await api.get('/api/trips');
    return response.data;
  },

  getTripById: async (id) => {
    const response = await api.get(`/api/trips/${id}`);
    return response.data;
  },

  joinTrip: async (inviteCode) => {
    const response = await api.post('/api/trips/join', { inviteCode });
    return response.data;
  },

  addItineraryItem: async (tripId, day, title, notes) => {
    const response = await api.post(`/api/trips/${tripId}/itinerary`, { day, title, notes });
    return response.data;
  },

  deleteItineraryItem: async (tripId, itemId) => {
    const response = await api.delete(`/api/trips/${tripId}/itinerary/${itemId}`);
    return response.data;
  },

  addExpense: async (tripId, description, amount) => {
    const response = await api.post(`/api/trips/${tripId}/expenses`, { description, amount });
    return response.data;
  },

  updateExpense: async (tripId, expenseId, description, amount) => {
    const response = await api.put(`/api/trips/${tripId}/expenses/${expenseId}`, { description, amount });
    return response.data;
  },

  deleteExpense: async (tripId, expenseId) => {
    const response = await api.delete(`/api/trips/${tripId}/expenses/${expenseId}`);
    return response.data;
  },

  createPoll: async (tripId, title, options) => {
    const response = await api.post(`/api/trips/${tripId}/polls`, { title, options });
    return response.data;
  },

  castVote: async (tripId, pollId, optionId) => {
    const response = await api.put(`/api/trips/${tripId}/polls/${pollId}/vote`, { optionId });
    return response.data;
  },

  deleteTrip: async (tripId) => {
    const response = await api.delete(`/api/trips/${tripId}`);
    return response.data;
  },
};
