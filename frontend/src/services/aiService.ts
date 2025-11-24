import api from '@/lib/axios';

export interface AISuggestion {
  day: number;
  activities: string[];
}

export interface AIItineraryResponse {
  suggestions: AISuggestion[];
}

export interface BackpackCategory {
  category: string;
  items: string[];
}

export interface AIBackpackResponse {
  categories: BackpackCategory[];
}

export const aiService = {
  suggestItinerary: async (
    destinationName: string,
    duration: number,
    weatherForecast: any[]
  ): Promise<AIItineraryResponse> => {
    const response = await api.post('/api/ai/suggest-itinerary', {
      destinationName,
      duration,
      weatherForecast,
    });
    return response.data;
  },

  generateBackpackList: async (
    destinationName: string,
    duration: number,
    travelers: number,
    weatherForecast: any[],
  ): Promise<AIBackpackResponse> => {
    const response = await api.post('/api/ai/backpack-list', {
      destinationName,
      duration,
      travelers,
      weatherForecast,
    });
    return response.data;
  },
};
