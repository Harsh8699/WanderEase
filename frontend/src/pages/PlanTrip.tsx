import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { planService, TripBlueprint } from '@/services/planService';
import { tripService } from '@/services/tripService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  MapPin,
  Calendar,
  Users,
  Loader2,
  IndianRupee,
  Plane,
  Bus,
  Car,
  Hotel,
  Cloud,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';
import RouteMap from '@/components/RouteMap';

const PlanTrip = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState(location.state?.destinationName || '');
  const [departureDate, setDepartureDate] = useState('');
  const [duration, setDuration] = useState('');
  const [travelers, setTravelers] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [blueprint, setBlueprint] = useState<TripBlueprint | null>(null);

  const [tripName, setTripName] = useState('');
  const [tripMode, setTripMode] = useState<'Solo Trip' | 'Group Trip'>('Solo Trip');
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerateBlueprint = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!origin || !destination || !departureDate || !duration || !travelers) {
      toast.error('Please fill all fields');
      return;
    }

    setIsLoading(true);
    try {
      const result = await planService.generateBlueprint(
        origin,
        destination,
        departureDate,
        parseInt(duration),
        parseInt(travelers)
      );
      setBlueprint(result);
      toast.success('Trip blueprint generated successfully!');
    } catch (error: any) {
      console.error('Planning error:', error);
      toast.error(error.response?.data?.message || 'Failed to generate trip blueprint');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!tripName.trim()) {
      toast.error('Please enter a trip name');
      return;
    }

    if (!blueprint) {
      toast.error('Please generate a blueprint first');
      return;
    }

    setIsSaving(true);
    try {
      const trip = await tripService.createTrip(tripName, tripMode, blueprint);
      toast.success('Trip created successfully!');
      navigate(`/trip/${trip._id}`);
    } catch (error: any) {
      console.error('Save trip error:', error);
      toast.error(error.response?.data?.message || 'Failed to create trip');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Plan Your Trip</h1>
            <p className="text-lg text-muted-foreground">
              Get detailed budget, transport options, and weather forecast for your journey
            </p>
          </div>

          {/* Planning Form */}
          <Card className="mb-8 shadow-card-hover">
            <CardHeader>
              <CardTitle>Trip Details</CardTitle>
              <CardDescription>Enter your trip information to generate a detailed blueprint</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerateBlueprint} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="origin">Origin City</Label>
                    <Input
                      id="origin"
                      placeholder="e.g., Mumbai"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination City</Label>
                    <Input
                      id="destination"
                      placeholder="e.g., Goa"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Departure Date</Label>
                    <Input
                      id="date"
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (days)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      max="30"
                      placeholder="e.g., 7"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="travelers">Number of Travelers</Label>
                    <Input
                      id="travelers"
                      type="number"
                      min="1"
                      max="50"
                      placeholder="e.g., 2"
                      value={travelers}
                      onChange={(e) => setTravelers(e.target.value)}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Blueprint...
                    </>
                  ) : (
                    <>
                      <MapPin className="mr-2 h-4 w-4" />
                      Generate Trip Blueprint
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Blueprint Results */}
          {isLoading && <LoadingSpinner message="Generating your trip blueprint..." />}

          {blueprint && !isLoading && (
            <div className="space-y-6">
              {/* Route & Distance */}
              {blueprint.route && (
                <Card className="shadow-card-hover">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Route & Distance
                    </CardTitle>
                    <CardDescription>
                      {blueprint.route.origin.name} to {blueprint.route.destination.name} ·
                      {' '}
                      {blueprint.route.distanceKm.toFixed(1)} km
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RouteMap route={blueprint.route} />
                  </CardContent>
                </Card>
              )}

              {/* Budget Summary */}
              <Card className="shadow-card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IndianRupee className="h-5 w-5" />
                    Budget Estimate
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-primary/10 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Total Estimated Cost</p>
                      <p className="text-2xl font-bold text-primary">
                        ₹{blueprint.budget.totalEstimatedCost.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 bg-secondary/10 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Cost Per Person</p>
                      <p className="text-2xl font-bold text-secondary">
                        ₹{blueprint.budget.costPerPerson.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Transport Options */}
              <Card className="shadow-card-hover">
                <CardHeader>
                  <CardTitle>Transport Options</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4">
                  {blueprint.transportOptions.flight && (
                    <div className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center gap-2 text-primary">
                        <Plane className="h-5 w-5" />
                        <h3 className="font-semibold">Flight</h3>
                      </div>
                      <p className="text-2xl font-bold">₹{blueprint.transportOptions.flight.costPerPerson}</p>
                      <p className="text-sm text-muted-foreground">per person</p>
                      <a
                        href="https://www.skyscanner.co.in/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        Book Now <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {blueprint.transportOptions.bus && (
                    <div className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center gap-2 text-secondary">
                        <Bus className="h-5 w-5" />
                        <h3 className="font-semibold">Bus</h3>
                      </div>
                      <p className="text-2xl font-bold">₹{blueprint.transportOptions.bus.costPerPerson}</p>
                      <p className="text-sm text-muted-foreground">per person</p>
                      <a
                        href={blueprint.transportOptions.bus.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        Book Now <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {blueprint.transportOptions.car && (
                    <div className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center gap-2 text-accent-foreground">
                        <Car className="h-5 w-5" />
                        <h3 className="font-semibold">Car Rental</h3>
                      </div>
                      <p className="text-2xl font-bold">₹{blueprint.transportOptions.car.totalCost}</p>
                      <p className="text-sm text-muted-foreground">total cost</p>
                      <a
                        href={blueprint.transportOptions.car.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        Book Now <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Accommodation */}
              <Card className="shadow-card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hotel className="h-5 w-5" />
                    Accommodation
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Estimated Total Cost</p>
                    <p className="text-2xl font-bold">₹{blueprint.accommodation.estimatedTotalCost.toLocaleString()}</p>
                  </div>
                  <a
                    href={blueprint.accommodation.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    Find Hotels <ExternalLink className="h-4 w-4" />
                  </a>
                </CardContent>
              </Card>

              {/* Weather Forecast */}
              <Card className="shadow-card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="h-5 w-5" />
                    Weather Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {blueprint.weatherForecast.map((day, index) => {
                      const isWarm = day.temp_max >= 30;
                      const isCold = day.temp_max <= 20;
                      const gradient = isWarm
                        ? 'from-orange-400/90 via-red-500/90 to-rose-500/90'
                        : isCold
                        ? 'from-sky-500/90 via-blue-600/90 to-indigo-700/90'
                        : 'from-emerald-400/90 via-blue-400/90 to-sky-500/90';

                      return (
                        <div
                          key={index}
                          className={`relative overflow-hidden rounded-2xl p-3 text-left text-white shadow-md bg-gradient-to-br ${gradient}`}
                        >
                          <p className="text-xs font-semibold opacity-90 mb-1">
                            {new Date(day.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              day: 'numeric',
                            })}
                          </p>
                          <p className="text-[11px] opacity-80 capitalize mb-2">{day.description}</p>
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-xl font-bold leading-none">{day.temp_max}°</p>
                              <p className="text-[11px] opacity-80 mt-1">Low {day.temp_min}°</p>
                            </div>
                            <div className="flex flex-col items-end text-[10px] opacity-80">
                              <span>Feels like</span>
                              <span className="text-xs font-semibold">
                                {Math.round((day.temp_max + day.temp_min) / 2)}°
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Save Trip */}
              <Card className="shadow-card-hover">
                <CardHeader>
                  <CardTitle>Save This Trip</CardTitle>
                  <CardDescription>Create a trip to manage itinerary, expenses, and collaborate with others</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tripName">Trip Name</Label>
                      <Input
                        id="tripName"
                        placeholder="e.g., Goa Beach Vacation 2025"
                        value={tripName}
                        onChange={(e) => setTripName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tripMode">Trip Mode</Label>
                      <Select value={tripMode} onValueChange={(value: any) => setTripMode(value)}>
                        <SelectTrigger id="tripMode">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Solo Trip">Solo Trip</SelectItem>
                          <SelectItem value="Group Trip">Group Trip</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button className="w-full" onClick={handleSaveTrip} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Trip...
                      </>
                    ) : (
                      <>
                        Create Trip
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PlanTrip;
