import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripService, Trip } from '@/services/tripService';
import { aiService, AISuggestion, BackpackCategory } from '@/services/aiService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  MapPin,
  Calendar,
  Users,
  IndianRupee,
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  Copy,
  Check,
  Clock,
  Hotel,
  Plane,
  Briefcase,
  Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';

const TripDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  // Itinerary
  const [newItemDay, setNewItemDay] = useState('');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemNotes, setNewItemNotes] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Expenses
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [isAddingExpense, setIsAddingExpense] = useState(false);

  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editExpenseDescription, setEditExpenseDescription] = useState('');
  const [editExpenseAmount, setEditExpenseAmount] = useState('');
  const [isUpdatingExpense, setIsUpdatingExpense] = useState(false);

  // AI Suggestions
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Smart backpack list
  const [backpackCategories, setBackpackCategories] = useState<BackpackCategory[]>([]);
  const [isLoadingBackpack, setIsLoadingBackpack] = useState(false);

  useEffect(() => {
    if (id) {
      loadTrip();
    }
  }, [id]);

  const loadTrip = async () => {
    try {
      const data = await tripService.getTripById(id!);
      setTrip(data);
    } catch (error: any) {
      console.error('Load trip error:', error);
      toast.error('Failed to load trip');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItineraryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newItemDay || !newItemTitle) {
      toast.error('Please fill required fields');
      return;
    }

    setIsAddingItem(true);
    try {
      const updated = await tripService.addItineraryItem(id!, parseInt(newItemDay), newItemTitle, newItemNotes);
      setTrip(updated);
      setNewItemDay('');
      setNewItemTitle('');
      setNewItemNotes('');
      toast.success('Activity added!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add activity');
    } finally {
      setIsAddingItem(false);
    }
  };

  const handleDeleteItineraryItem = async (itemId: string) => {
    try {
      const updated = await tripService.deleteItineraryItem(id!, itemId);
      setTrip(updated);
      toast.success('Activity removed');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove activity');
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!expenseDescription || !expenseAmount) {
      toast.error('Please fill all fields');
      return;
    }

    setIsAddingExpense(true);
    try {
      const updated = await tripService.addExpense(id!, expenseDescription, parseFloat(expenseAmount));
      setTrip(updated);
      setExpenseDescription('');
      setExpenseAmount('');
      toast.success('Expense added!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add expense');
    } finally {
      setIsAddingExpense(false);
    }
  };

  const startEditExpense = (expense: any) => {
    setEditingExpenseId(expense._id);
    setEditExpenseDescription(expense.description);
    setEditExpenseAmount(expense.amount.toString());
  };

  const handleUpdateExpense = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingExpenseId || !editExpenseDescription || !editExpenseAmount) {
      toast.error('Please fill all fields');
      return;
    }

    setIsUpdatingExpense(true);
    try {
      const updated = await tripService.updateExpense(
        id!,
        editingExpenseId,
        editExpenseDescription,
        parseFloat(editExpenseAmount),
      );
      setTrip(updated);
      setEditingExpenseId(null);
      setEditExpenseDescription('');
      setEditExpenseAmount('');
      toast.success('Expense updated!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update expense');
    } finally {
      setIsUpdatingExpense(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    setIsUpdatingExpense(true);
    try {
      const updated = await tripService.deleteExpense(id!, expenseId);
      setTrip(updated);
      // If we were editing this expense, close the edit form
      if (editingExpenseId === expenseId) {
        setEditingExpenseId(null);
        setEditExpenseDescription('');
        setEditExpenseAmount('');
      }
      toast.success('Expense removed');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove expense');
    } finally {
      setIsUpdatingExpense(false);
    }
  };

  const loadAISuggestions = async () => {
    if (!trip) return;
    
    setIsLoadingAI(true);
    try {
      const result = await aiService.suggestItinerary(
        trip.blueprint.tripDetails.destinationName,
        trip.blueprint.tripDetails.duration,
        trip.blueprint.weatherForecast,
      );
      setAiSuggestions(result.suggestions);
      toast.success('AI itinerary suggestions loaded!');
    } catch (error: any) {
      toast.error('Failed to load AI itinerary suggestions');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const loadBackpackList = async () => {
    if (!trip) return;

    setIsLoadingBackpack(true);
    try {
      const result = await aiService.generateBackpackList(
        trip.blueprint.tripDetails.destinationName,
        trip.blueprint.tripDetails.duration,
        trip.blueprint.tripDetails.travelers,
        trip.blueprint.weatherForecast,
      );
      setBackpackCategories(result.categories);
      toast.success('Smart backpack list generated!');
    } catch (error: any) {
      toast.error('Failed to load smart backpack list');
    } finally {
      setIsLoadingBackpack(false);
    }
  };

  const copyInviteCode = () => {
    if (trip?.inviteCode) {
      navigator.clipboard.writeText(trip.inviteCode);
      setCopiedCode(true);
      toast.success('Invite code copied!');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  if (isLoading || !trip) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <LoadingSpinner message="Loading trip details..." />
        <Footer />
      </div>
    );
  }

  const sortedItinerary = [...trip.itinerary].sort((a, b) => a.day - b.day);
  const totalExpenses = trip.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const joinedMembers = trip.members.length;
  const totalMembers = trip.blueprint.tripDetails.travelers;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-4xl font-bold">{trip.tripName}</h1>
              {trip.tripMode === 'Group Trip' && trip.inviteCode && (
                <Button variant="outline" onClick={copyInviteCode}>
                  {copiedCode ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                  {trip.inviteCode}
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                From {trip.blueprint.tripDetails.origin} to {trip.blueprint.tripDetails.destinationName}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(trip.blueprint.tripDetails.departureDate).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {trip.blueprint.tripDetails.duration} days
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {joinedMembers} {joinedMembers === 1 ? 'member joined' : 'members joined'}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {totalMembers} {totalMembers === 1 ? 'total member' : 'total members'}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Budget */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IndianRupee className="h-5 w-5" />
                      Budget Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-primary/10 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Total Estimated</p>
                      <p className="text-2xl font-bold text-primary">
                        ₹{trip.blueprint.budget.totalEstimatedCost.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 bg-secondary/10 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Per Person</p>
                      <p className="text-2xl font-bold text-secondary">
                        ₹{trip.blueprint.budget.costPerPerson.toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Transport */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plane className="h-5 w-5" />
                      Transport Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {trip.blueprint.transportOptions.flight && (
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span>Flight</span>
                        <span className="font-semibold">₹{trip.blueprint.transportOptions.flight.costPerPerson}</span>
                      </div>
                    )}
                    {trip.blueprint.transportOptions.bus && (
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span>Bus</span>
                        <span className="font-semibold">₹{trip.blueprint.transportOptions.bus.costPerPerson}</span>
                      </div>
                    )}
                    {trip.blueprint.transportOptions.car && (
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span>Car</span>
                        <span className="font-semibold">₹{trip.blueprint.transportOptions.car.totalCost}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Accommodation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Hotel className="h-5 w-5" />
                      Accommodation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span>Estimated Total</span>
                      <span className="font-semibold text-lg">
                        ₹{trip.blueprint.accommodation.estimatedTotalCost.toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Weather */}
                <Card>
                  <CardHeader>
                    <CardTitle>Weather Forecast</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      {trip.blueprint.weatherForecast.slice(0, 3).map((day, i) => {
                        const isWarm = day.temp_max >= 30;
                        const isCold = day.temp_max <= 20;
                        const gradient = isWarm
                          ? 'from-orange-400/90 via-red-500/90 to-rose-500/90'
                          : isCold
                          ? 'from-sky-500/90 via-blue-600/90 to-indigo-700/90'
                          : 'from-emerald-400/90 via-blue-400/90 to-sky-500/90';

                        return (
                          <div
                            key={i}
                            className={`relative overflow-hidden rounded-2xl p-3 text-left text-white shadow-md bg-gradient-to-br ${gradient}`}
                          >
                            <div className="flex items-start justify-between mb-1">
                              <p className="text-xs font-semibold opacity-90">
                                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                              </p>
                              <span className="text-[10px] uppercase tracking-wide opacity-80">
                                {day.description}
                              </span>
                            </div>
                            <div className="flex items-end justify-between mt-2">
                              <div>
                                <p className="text-xl font-bold leading-none">{day.temp_max}°</p>
                                <p className="text-[11px] opacity-80 mt-1">Low {day.temp_min}°</p>
                              </div>
                              <div className="flex flex-col items-end text-[10px] opacity-80">
                                <span>Feels like</span>
                                <span className="text-xs font-semibold">{Math.round((day.temp_max + day.temp_min) / 2)}°</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Itinerary Tab */}
            <TabsContent value="itinerary" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <CardTitle>Itinerary</CardTitle>
                      <CardDescription>Plan your daily activities</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={loadAISuggestions} disabled={isLoadingAI}>
                        {isLoadingAI ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        AI Suggestions
                      </Button>
                      <Button
                        variant="outline"
                        onClick={loadBackpackList}
                        disabled={isLoadingBackpack}
                      >
                        {isLoadingBackpack ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Briefcase className="mr-2 h-4 w-4" />
                        )}
                        Smart Backpack
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add New Item Form */}
                  <form onSubmit={handleAddItineraryItem} className="p-4 border rounded-lg space-y-3">
                    <div className="grid md:grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="day">Day</Label>
                        <Input
                          id="day"
                          type="number"
                          min="1"
                          max={trip.blueprint.tripDetails.duration}
                          placeholder="1"
                          value={newItemDay}
                          onChange={(e) => setNewItemDay(e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="title">Activity Title</Label>
                        <Input
                          id="title"
                          placeholder="e.g., Visit the beach"
                          value={newItemTitle}
                          onChange={(e) => setNewItemTitle(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes (optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Additional details..."
                        value={newItemNotes}
                        onChange={(e) => setNewItemNotes(e.target.value)}
                        rows={2}
                      />
                    </div>
                    <Button type="submit" size="sm" disabled={isAddingItem}>
                      {isAddingItem ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="mr-2 h-4 w-4" />
                      )}
                      Add Activity
                    </Button>
                  </form>

                  {/* AI Suggestions */}
                  {aiSuggestions.length > 0 && (
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        AI Suggestions
                      </h3>
                      {aiSuggestions.map((suggestion) => (
                        <div key={suggestion.day} className="text-sm">
                          <p className="font-medium">Day {suggestion.day}:</p>
                          <ul className="list-disc list-inside text-muted-foreground ml-2">
                            {suggestion.activities.map((activity, i) => (
                              <li key={i}>{activity}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Smart Backpack List */}
                  {backpackCategories.length > 0 && (
                    <div className="p-4 bg-secondary/5 border border-secondary/30 rounded-lg space-y-2">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-secondary" />
                        Smart Backpack List
                      </h3>
                      {backpackCategories.map((cat) => (
                        <div key={cat.category} className="text-sm">
                          <p className="font-medium">{cat.category}</p>
                          <ul className="list-disc list-inside text-muted-foreground ml-2">
                            {cat.items.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Existing Items */}
                  <div className="space-y-3">
                    {sortedItinerary.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No activities planned yet</p>
                    ) : (
                      sortedItinerary.map((item) => (
                        <div key={item._id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold text-primary">Day {item.day}</span>
                              </div>
                              <h4 className="font-semibold">{item.title}</h4>
                              {item.notes && <p className="text-sm text-muted-foreground mt-1">{item.notes}</p>}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItineraryItem(item._id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Expenses Tab */}
            <TabsContent value="expenses" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Expenses</CardTitle>
                  <CardDescription>Track your trip expenses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add Expense Form */}
                  <form onSubmit={handleAddExpense} className="p-4 border rounded-lg space-y-3">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          placeholder="e.g., Dinner at restaurant"
                          value={expenseDescription}
                          onChange={(e) => setExpenseDescription(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="amount">Amount (₹)</Label>
                        <Input
                          id="amount"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={expenseAmount}
                          onChange={(e) => setExpenseAmount(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button type="submit" size="sm" disabled={isAddingExpense}>
                      {isAddingExpense ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="mr-2 h-4 w-4" />
                      )}
                      Add Expense
                    </Button>
                  </form>

                  {/* Total */}
                  <div className="p-4 bg-primary/10 rounded-lg flex items-center justify-between">
                    <span className="font-semibold">Total Expenses</span>
                    <span className="text-2xl font-bold text-primary">₹{totalExpenses.toLocaleString()}</span>
                  </div>

                  {/* Expense List */}
                  <div className="space-y-2">
                    {trip.expenses.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No expenses tracked yet</p>
                    ) : (
                      trip.expenses.map((expense) => (
                        <div key={expense._id} className="p-3 border rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium">{expense.description}</p>
                              <p className="text-sm text-muted-foreground">
                                Paid by {expense.paidBy.name} • {new Date(expense.date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">₹{expense.amount.toLocaleString()}</span>
                              {expense.paidBy._id === user?._id && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => startEditExpense(expense)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {editingExpenseId === expense._id && (
                            <form onSubmit={handleUpdateExpense} className="mt-2 grid md:grid-cols-3 gap-3 items-end">
                              <div className="space-y-1 md:col-span-2">
                                <Label className="text-xs">Description</Label>
                                <Input
                                  value={editExpenseDescription}
                                  onChange={(e) => setEditExpenseDescription(e.target.value)}
                                  placeholder="Update description"
                                />
                              </div>
                              <div className="space-y-1 flex md:block gap-2">
                                <div className="flex-1 space-y-1">
                                  <Label className="text-xs">Amount (₹)</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={editExpenseAmount}
                                    onChange={(e) => setEditExpenseAmount(e.target.value)}
                                  />
                                </div>
                                <div className="flex gap-2 mt-2 md:mt-6 justify-end">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingExpenseId(null);
                                      setEditExpenseDescription('');
                                      setEditExpenseAmount('');
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    disabled={isUpdatingExpense}
                                    onClick={() => handleDeleteExpense(expense._id)}
                                  >
                                    Delete
                                  </Button>
                                  <Button type="submit" size="sm" disabled={isUpdatingExpense}>
                                    {isUpdatingExpense ? (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                      <>
                                        Save
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </form>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Members Tab */}
            <TabsContent value="members">
              <Card>
                <CardHeader>
                  <CardTitle>Trip Members</CardTitle>
                  <CardDescription>
                    {joinedMembers} of {totalMembers} {totalMembers === 1 ? 'member has' : 'members have'} joined
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {trip.members.map((member) => (
                      <div key={member._id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                        {member._id === trip.createdBy && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Organizer</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TripDetails;
