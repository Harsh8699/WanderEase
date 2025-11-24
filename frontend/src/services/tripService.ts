import api from '@/lib/axios';
import { TripBlueprint } from './planService';

export interface Trip {
  _id: string;
  tripName: string;
  inviteCode?: string;
  blueprint: TripBlueprint;
  tripMode: 'Solo Trip' | 'Group Trip';
  createdBy: string;
  members: Array<{ _id: string; name: string; email: string }>;
  itinerary: Array<{
    _id: string;
    day: number;
    title: string;
    notes: string;
    addedBy: string;
  }>;
  expenses: Array<{
    _id: string;
    description: string;
    amount: number;
    paidBy: { _id: string; name: string };
    date: string;
  }>;
  polls: Array<{
    _id: string;
    title: string;
    options: Array<{
      _id: string;
      text: string;
      votes: string[];
    }>;
    createdBy: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export const tripService = {
  createTrip: async (tripName: string, tripMode: string, blueprint: TripBlueprint): Promise<Trip> => {
    const response = await api.post('/api/trips', { tripName, tripMode, blueprint });
    return response.data;
  },

  getUserTrips: async (): Promise<Trip[]> => {
    const response = await api.get('/api/trips');
    return response.data;
  },

  getTripById: async (id: string): Promise<Trip> => {
    const response = await api.get(`/api/trips/${id}`);
    return response.data;
  },

  joinTrip: async (inviteCode: string): Promise<Trip> => {
    const response = await api.post('/api/trips/join', { inviteCode });
    return response.data;
  },

  addItineraryItem: async (tripId: string, day: number, title: string, notes?: string): Promise<Trip> => {
    const response = await api.post(`/api/trips/${tripId}/itinerary`, { day, title, notes });
    return response.data;
  },

  deleteItineraryItem: async (tripId: string, itemId: string): Promise<Trip> => {
    const response = await api.delete(`/api/trips/${tripId}/itinerary/${itemId}`);
    return response.data;
  },

  addExpense: async (tripId: string, description: string, amount: number): Promise<Trip> => {
    const response = await api.post(`/api/trips/${tripId}/expenses`, { description, amount });
    return response.data;
  },

  updateExpense: async (
    tripId: string,
    expenseId: string,
    description: string,
    amount: number,
  ): Promise<Trip> => {
    const response = await api.put(`/api/trips/${tripId}/expenses/${expenseId}`, { description, amount });
    return response.data;
  },

  deleteExpense: async (tripId: string, expenseId: string): Promise<Trip> => {
    const response = await api.delete(`/api/trips/${tripId}/expenses/${expenseId}`);
    return response.data;
  },

  createPoll: async (tripId: string, title: string, options: string[]): Promise<Trip> => {
    const response = await api.post(`/api/trips/${tripId}/polls`, { title, options });
    return response.data;
  },

  castVote: async (tripId: string, pollId: string, optionId: string): Promise<Trip> => {
    const response = await api.put(`/api/trips/${tripId}/polls/${pollId}/vote`, { optionId });
    return response.data;
  },
};
