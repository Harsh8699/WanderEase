import api from '@/lib/axios';

export interface TripBlueprint {
  tripDetails: {
    origin: string;
    destinationName: string;
    departureDate: string;
    duration: number;
    travelers: number;
  };
  route: {
    distanceKm: number;
    origin: { name: string; lat: number; lon: number };
    destination: { name: string; lat: number; lon: number };
    geometry?: {
      type: string;
      coordinates: [number, number][];
    };
  };
  weatherForecast: {
    date: string;
    temp_max: number;
    temp_min: number;
    description: string;
    icon: string;
  }[];
  transportOptions: {
    flight?: { costPerPerson: number; link: string };
    bus?: { costPerPerson: number; link: string };
    car?: { totalCost: number; link: string };
  };
  accommodation: {
    estimatedTotalCost: number;
    link: string;
  };
  budget: {
    totalEstimatedCost: number;
    costPerPerson: number;
  };
}

export const planService = {
  generateBlueprint: async (
    origin: string,
    destinationName: string,
    departureDate: string,
    duration: number,
    travelers: number
  ): Promise<TripBlueprint> => {
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
