import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <img
              src="/wanderease-logo.png"
              alt="Wanderease logo"
              className="h-10 w-10 rounded-full bg-transparent object-contain"
            />
            <span className="text-xl font-bold text-primary">Wanderease</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/search" className="text-foreground hover:text-primary transition-colors">
              Discover
            </Link>
            <Link to="/plan" className="text-foreground hover:text-primary transition-colors">
              Plan Trip
            </Link>
            {user && (
              <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">
                Dashboard
              </Link>
            )}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{user.name}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button size="sm" onClick={() => navigate('/register')}>
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/search"
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Discover
              </Link>
              <Link
                to="/plan"
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Plan Trip
              </Link>
              {user && (
                <Link
                  to="/dashboard"
                  className="text-foreground hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              <div className="pt-4 border-t flex flex-col space-y-2">
                {user ? (
                  <>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{user.name}</span>
                    </div>
                    <Button variant="outline" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>
                      Login
                    </Button>
                    <Button onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}>
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
