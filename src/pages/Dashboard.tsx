
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Event } from "@/types/event";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/events/EventCard";
import { EventAttendeesList } from "@/components/events/EventAttendeesList";
import { PlusCircle, Edit, Trash2, ChevronDown, ChevronUp, Calendar, Clock, CalendarClock } from "lucide-react";
import { EventAnalytics } from "@/components/dashboard/EventAnalytics";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("created");
  const [activeCreatedTab, setActiveCreatedTab] = useState("all");
  const [activeRegisteredTab, setActiveRegisteredTab] = useState("all");
  const {
    toast
  } = useToast();
  const [expandedEventDetails, setExpandedEventDetails] = useState<string | null>(null);
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Query for events created by the user
  const {
    data: createdEvents,
    isLoading: createdLoading,
    refetch: refetchCreatedEvents
  } = useQuery({
    queryKey: ["created-events", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const {
        data,
        error
      } = await supabase.from("events").select("*").eq("organizer_id", user.id).order("created_at", {
        ascending: false
      });
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Query for events the user has registered for
  const {
    data: registeredEvents,
    isLoading: registeredLoading
  } = useQuery({
    queryKey: ["registered-events", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const {
        data,
        error
      } = await supabase.from("event_registrations").select("event_id").eq("user_id", user.id);
      if (error) throw error;
      if (data.length === 0) return [];

      // Get the event details for each registration
      const eventIds = data.map(reg => reg.event_id);
      const {
        data: eventsData,
        error: eventsError
      } = await supabase.from("events").select("*").in("id", eventIds).order("date", {
        ascending: true
      });
      if (eventsError) throw eventsError;
      return eventsData;
    },
    enabled: !!user
  });
  
  const handleEditEvent = (eventId: string) => {
    navigate(`/edit-event/${eventId}`);
  };
  
  const handleDeleteEvent = async (eventId: string) => {
    if (!user) return;
    try {
      const {
        error
      } = await supabase.from("events").delete().eq("id", eventId).eq("organizer_id", user.id);
      if (error) throw error;

      // Refresh the events list
      refetchCreatedEvents();
      toast({
        title: "Event deleted",
        description: "Your event has been successfully deleted"
      });
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "Failed to delete the event. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const toggleEventDetails = (eventId: string) => {
    setExpandedEventDetails(prev => prev === eventId ? null : eventId);
  };

  // Filter functions for tabs
  const filterUpcomingEvents = (events: Event[] | undefined) => {
    if (!events) return [];
    return events.filter(event => event.date >= today);
  };
  
  const filterPastEvents = (events: Event[] | undefined) => {
    if (!events) return [];
    return events.filter(event => event.date < today);
  };

  // Get filtered events based on active tab
  const getFilteredCreatedEvents = () => {
    if (!createdEvents) return [];
    switch (activeCreatedTab) {
      case "upcoming":
        return filterUpcomingEvents(createdEvents);
      case "past":
        return filterPastEvents(createdEvents);
      default:
        return createdEvents;
    }
  };

  // Get filtered registered events based on active tab
  const getFilteredRegisteredEvents = () => {
    if (!registeredEvents) return [];
    switch (activeRegisteredTab) {
      case "upcoming":
        return filterUpcomingEvents(registeredEvents);
      case "past":
        return filterPastEvents(registeredEvents);
      default:
        return registeredEvents;
    }
  };
  
  if (!user) {
    return null; // Will redirect in useEffect
  }
  
  const renderCreatedEventCard = (event: Event) => (
    <div key={event.id} className="space-y-4">
      <div className="relative">
        <EventCard event={event} />
        <div className="absolute top-2 right-2 flex gap-2">
          
        </div>
      </div>
      
      {expandedEventDetails === event.id && (
        <div className="mt-4 animate-fade-in">
          <EventAttendeesList eventId={event.id} />
        </div>
      )}
      
      <div className="flex justify-end mt-2 gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => toggleEventDetails(event.id)}
          className="text-sm"
        >
          {expandedEventDetails === event.id ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Hide Attendees
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              View Attendees
            </>
          )}
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleEditEvent(event.id)}
          className="text-sm"
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 text-sm"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your event and remove all RSVPs.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDeleteEvent(event.id)}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
  
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your events and RSVPs</p>
          </div>
          <Button onClick={() => navigate("/create-event")} className="bg-primary hover:bg-primary/90 transition-all">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Event
          </Button>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Event Analytics</h2>
          {user && <EventAnalytics userId={user.id} />}
        </div>

        <Tabs defaultValue="created" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="created">Events You Created</TabsTrigger>
            <TabsTrigger value="registered">Events You RSVP'd For</TabsTrigger>
          </TabsList>
          
          <TabsContent value="created" className="space-y-6 animate-fade-in">
            <Tabs defaultValue="all" value={activeCreatedTab} onValueChange={setActiveCreatedTab}>
              <TabsList>
                <TabsTrigger value="all">All Events</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {createdLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="h-64 animate-pulse">
                    <div className="h-full bg-gray-200 dark:bg-gray-800"></div>
                  </Card>
                ))}
              </div>
            ) : getFilteredCreatedEvents().length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredCreatedEvents().map((event: Event) => renderCreatedEventCard(event))}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Events Found</CardTitle>
                  <CardDescription>
                    {activeCreatedTab === "upcoming" ? "You don't have any upcoming events." : activeCreatedTab === "past" ? "You don't have any past events." : "You haven't created any events yet."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate("/create-event")} className="bg-primary hover:bg-primary/90 transition-all">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Event
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="registered" className="space-y-6 animate-fade-in">
            <Tabs defaultValue="all" value={activeRegisteredTab} onValueChange={setActiveRegisteredTab}>
              <TabsList>
                <TabsTrigger value="all">All Events</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {registeredLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="h-64 animate-pulse">
                    <div className="h-full bg-gray-200 dark:bg-gray-800"></div>
                  </Card>
                ))}
              </div>
            ) : getFilteredRegisteredEvents().length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredRegisteredEvents().map((event: Event) => (
                  <div key={event.id} className="relative">
                    <EventCard key={event.id} event={event} />
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No RSVP'd Events</CardTitle>
                  <CardDescription>
                    {activeRegisteredTab === "upcoming" ? "You haven't RSVP'd for any upcoming events." : activeRegisteredTab === "past" ? "You don't have any past events you've attended." : "You haven't RSVP'd for any events yet."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate("/discover")} className="bg-primary hover:bg-primary/90 transition-all">
                    RSVP Now
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
