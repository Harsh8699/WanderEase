import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plane, MapPin, Users, Calendar, TrendingUp, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-hero py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Plan Your Perfect{' '}
              <span className="bg-gradient-primary bg-clip-text text-transparent">Journey</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Discover destinations based on weather, create detailed itineraries, and manage group trips with
              ease. Your adventure starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="shadow-elegant" onClick={() => navigate('/search')}>
                <MapPin className="mr-2 h-5 w-5" />
                Discover Destinations
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/plan')}>
                <Calendar className="mr-2 h-5 w-5" />
                Plan a Trip
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose TravelPlanner?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to plan and manage your trips in one place
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-card-hover transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Destination Discovery</h3>
              <p className="text-muted-foreground">
                Find perfect destinations based on your preferred weather and trip duration with real-time data.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-card-hover transition-shadow">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Complete Trip Planning</h3>
              <p className="text-muted-foreground">
                Get detailed budgets, transport options, accommodation suggestions, and weather forecasts all in
                one place.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-card-hover transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Group Trip Management</h3>
              <p className="text-muted-foreground">
                Collaborate with friends, share expenses, create polls, and build itineraries together
                seamlessly.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to plan your perfect trip
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-elegant">
                1
              </div>
              <h3 className="text-xl font-semibold">Discover</h3>
              <p className="text-muted-foreground">
                Search for destinations based on your preferred weather conditions and trip duration
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-elegant">
                2
              </div>
              <h3 className="text-xl font-semibold">Plan</h3>
              <p className="text-muted-foreground">
                Generate a detailed trip blueprint with budget estimates, transport, and accommodation options
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-elegant">
                3
              </div>
              <h3 className="text-xl font-semibold">Manage</h3>
              <p className="text-muted-foreground">
                Create trips, invite friends, manage itineraries, track expenses, and make group decisions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-primary text-white p-8 md:p-12 shadow-elegant">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">Ready to Start Your Adventure?</h2>
              <p className="text-lg opacity-90">
                Join thousands of travelers who plan their perfect trips with TravelPlanner
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" onClick={() => navigate('/register')}>
                  <Shield className="mr-2 h-5 w-5" />
                  Create Free Account
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 border-white text-white hover:bg-white/20"
                  onClick={() => navigate('/search')}
                >
                  <Plane className="mr-2 h-5 w-5" />
                  Start Exploring
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
