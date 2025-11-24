import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripService, Trip } from '@/services/tripService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  MapPin,
  Calendar,
  Users,
  Loader2,
  Plus,
  ArrowRight,
  UserPlus,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';

const Dashboard = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      const data = await tripService.getUserTrips();
      setTrips(data);
    } catch (error) {
      console.error('Load trips error:', error);
      toast.error('Failed to load trips');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteCode.trim()) {
      toast.error('Please enter an invite code');
      return;
    }

    setIsJoining(true);
    try {
      const trip = await tripService.joinTrip(inviteCode);
      toast.success('Successfully joined the trip!');
      navigate(`/trip/${trip._id}`);
    } catch (error: any) {
      console.error('Join trip error:', error);
      toast.error(error.response?.data?.message || 'Failed to join trip');
    } finally {
      setIsJoining(false);
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Invite code copied!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <LoadingSpinner message="Loading your trips..." />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name}!</h1>
              <p className="text-lg text-muted-foreground">Manage your trips and start planning new adventures</p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Join Trip
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Join a Trip</DialogTitle>
                    <DialogDescription>Enter the invite code shared by your trip organizer</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleJoinTrip} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="inviteCode">Invite Code</Label>
                      <Input
                        id="inviteCode"
                        placeholder="e.g., ABC123"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                        maxLength={6}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isJoining}>
                      {isJoining ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Joining...
                        </>
                      ) : (
                        'Join Trip'
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Button onClick={() => navigate('/plan')}>
                <Plus className="mr-2 h-4 w-4" />
                New Trip
              </Button>
            </div>
          </div>

          {/* Trips List */}
          {trips.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <MapPin className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">No trips yet</h3>
                  <p className="text-muted-foreground">
                    Start planning your first adventure or join a trip with an invite code
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={() => navigate('/search')}>Discover Destinations</Button>
                    <Button variant="outline" onClick={() => navigate('/plan')}>
                      Plan a Trip
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip) => (
                <Card
                  key={trip._id}
                  className="hover:shadow-card-hover transition-all cursor-pointer hover:-translate-y-1"
                  onClick={() => navigate(`/trip/${trip._id}`)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="truncate">{trip.tripName}</span>
                      {trip.tripMode === 'Group Trip' && (
                        <Users className="h-5 w-5 text-secondary flex-shrink-0" />
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {trip.blueprint.tripDetails.destinationName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(trip.blueprint.tripDetails.departureDate).toLocaleDateString()}
                      </span>
                      <span className="text-muted-foreground">
                        {trip.blueprint.tripDetails.duration} days
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm gap-2">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {trip.members.length}{' '}
                        {trip.members.length === 1 ? 'member joined' : 'members joined'}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {trip.blueprint.tripDetails.travelers}{' '}
                        {trip.blueprint.tripDetails.travelers === 1 ? 'total member' : 'total members'}
                      </span>
                    </div>

                    {trip.inviteCode && (
                      <div className="p-2 bg-muted rounded-lg flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Invite Code</span>
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono font-semibold">{trip.inviteCode}</code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyInviteCode(trip.inviteCode!);
                            }}
                          >
                            {copiedCode === trip.inviteCode ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    <Button className="w-full" size="sm" onClick={() => navigate(`/trip/${trip._id}`)}>
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
