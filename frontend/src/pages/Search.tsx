import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchService, Destination } from '@/services/searchService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MapPin, Thermometer, IndianRupee, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Fetch Unsplash image for a given query
const getUnsplashImage = async (query: string): Promise<string | null> => {
  const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY as string | undefined;

  if (!accessKey) {
    console.warn('VITE_UNSPLASH_ACCESS_KEY is not set');
    return null;
  }

  const response = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
      query,
    )}&client_id=${accessKey}&orientation=landscape&per_page=1`,
  );

  if (!response.ok) {
    console.warn('Unsplash API error', response.status, response.statusText);
    return null;
  }

  const data = await response.json();
  return data.results?.[0]?.urls?.regular ?? null;
};

const Search = () => {
  const [weather, setWeather] = useState('');
  const [duration, setDuration] = useState('');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!weather || !duration) {
      toast.error('Please select weather preference and duration');
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchService.discoverDestinations(weather, parseInt(duration));

      // Attach Unsplash images to each destination
      const resultsWithImages: Destination[] = await Promise.all(
        results.map(async (dest) => {
          const img = await getUnsplashImage(`${dest.name} tourism`);
          return {
            ...dest,
            imageUrl: img ?? undefined,
          };
        }),
      );

      setDestinations(resultsWithImages);

      if (resultsWithImages.length === 0) {
        toast.info('No destinations found for your preferences. Try different options!');
      } else {
        toast.success(`Found ${resultsWithImages.length} destinations for you!`);
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast.error(error.response?.data?.message || 'Failed to search destinations');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanTrip = (destination: string) => {
    navigate('/plan', { state: { destinationName: destination } });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Discover Your Next Destination</h1>
            <p className="text-lg text-muted-foreground">
              Find perfect destinations based on your weather preferences and travel duration
            </p>
          </div>

          {/* Search Form */}
          <Card className="mb-8 shadow-card-hover">
            <CardHeader>
              <CardTitle>Search Preferences</CardTitle>
              <CardDescription>Tell us what kind of weather you prefer and how long you want to travel</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weather">Weather Preference</Label>
                    <Select value={weather} onValueChange={setWeather}>
                      <SelectTrigger id="weather">
                        <SelectValue placeholder="Select weather type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hot">Hot (25°C+)</SelectItem>
                        <SelectItem value="Warm">Warm (15-29°C)</SelectItem>
                        <SelectItem value="Cool">Cool (0-20°C)</SelectItem>
                        <SelectItem value="Snowy">Snowy (-20-10°C)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Trip Duration (days)</Label>
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
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <MapPin className="mr-2 h-4 w-4" />
                      Find Destinations
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          {destinations.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Recommended Destinations</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {destinations.map((dest, index) => (
                  <Card
                    key={index}
                    className="hover:shadow-card-hover transition-all hover:-translate-y-1 cursor-pointer"
                  >
                    {/* Unsplash image, if available */}
                    {dest.imageUrl && (
                      <img
                        src={dest.imageUrl}
                        alt={dest.name}
                        className="w-full h-40 object-cover rounded-t-lg"
                      />
                    )}

                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            {dest.name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-2">
                            <Thermometer className="h-4 w-4" />
                            {dest.currentTemp}°C - {dest.weatherDescription}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <IndianRupee className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Estimated Cost</span>
                        </div>
                        <span className="font-semibold">₹{dest.estimatedCostPerPerson.toLocaleString()}</span>
                      </div>
                      <Button className="w-full" onClick={() => handlePlanTrip(dest.name)}>
                        Plan Trip
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Search;
