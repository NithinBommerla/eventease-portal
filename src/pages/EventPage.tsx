import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Event } from "@/types/event";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { MapPin, Calendar, Clock, Globe, Users, User, Trash2, Eye } from "lucide-react";
import { EventLikes } from "@/components/events/EventLikes";
import { EventComments } from "@/components/events/EventComments";
import { EventShareModal } from "@/components/events/EventShareModal";
import { Layout } from "@/components/layout/Layout";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function EventPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [organizerName, setOrganizerName] = useState<string>("");
  const [showPastEventDialog, setShowPastEventDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

  useEffect(() => {
    const trackEventView = async () => {
      if (!id || !user) return;
      
      try {
        await supabase.rpc('increment_event_view', {
          event_id_param: id,
          user_id_param: user.id
        });
        console.log(`View tracked for event ${id} by user ${user.id}`);
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };
    
    trackEventView();
  }, [id, user]);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("id", id)
          .single();
        
        if (error) throw error;
        setEvent(data);
        
        if (data.organizer_id) {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("name, username")
            .eq("id", data.organizer_id)
            .maybeSingle();
          
          if (profileError) console.error("Error fetching organizer profile:", profileError);
          
          if (profileData) {
            setOrganizerName(profileData.name || profileData.username || "Event Organizer");
          }
        }
        
        if (user) {
          const { data: registrationData, error: registrationError } = await supabase
            .from("event_registrations")
            .select("id")
            .eq("event_id", id)
            .eq("user_id", user.id)
            .maybeSingle();
          
          if (registrationError) throw registrationError;
          setIsRegistered(!!registrationData);
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        toast({
          title: "Error",
          description: "Failed to load event details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvent();
    
    const subscription = supabase
      .channel("event-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "events",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setEvent(payload.new as Event);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [id, user, toast]);
  
  const isPastEvent = () => {
    if (!event) return false;
    return event.date < today;
  };
  
  const handleRegister = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to RSVP for events",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    if (!event) return;
    
    if (isPastEvent()) {
      setShowPastEventDialog(true);
      return;
    }
    
    setRegistrationLoading(true);
    
    try {
      if (isRegistered) {
        const { error } = await supabase
          .from("event_registrations")
          .delete()
          .eq("event_id", event.id)
          .eq("user_id", user.id);
        
        if (error) throw error;
        
        setIsRegistered(false);
        
        toast({
          title: "RSVP canceled",
          description: "You have been removed from this event",
        });
      } else {
        const { error } = await supabase
          .from("event_registrations")
          .insert({
            event_id: event.id,
            user_id: user.id,
          });
        
        if (error) throw error;
        
        setIsRegistered(true);
        
        toast({
          title: "RSVP successful",
          description: "You are now registered for this event",
        });
      }
    } catch (error) {
      console.error("Error handling registration:", error);
      toast({
        title: "Error",
        description: "Failed to process your RSVP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRegistrationLoading(false);
    }
  };
  
  const handleDeleteEvent = async () => {
    if (!event || !user || user.id !== event.organizer_id) return;
    
    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", event.id)
        .eq("organizer_id", user.id);
      
      if (error) throw error;
      
      toast({
        title: "Event deleted",
        description: "Your event has been successfully deleted",
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "Failed to delete the event. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="container max-w-7xl mx-auto py-6 px-4 md:px-6">
          <div className="flex flex-col gap-4">
            <div className="w-full h-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
            <div className="h-10 w-3/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
            <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
            <div className="h-20 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!event) {
    return (
      <Layout>
        <div className="container max-w-7xl mx-auto py-6 px-4 md:px-6">
          <h1 className="text-2xl font-bold">Event not found</h1>
          <p className="mt-2">The event you're looking for does not exist or has been removed.</p>
          <Button className="mt-4 bg-primary hover:bg-primary/90 transition-all" onClick={() => navigate("/discover")}>
            Discover Events
          </Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container max-w-7xl mx-auto py-6 px-4 md:px-6">
        <div className={`mb-8 ${isPastEvent() ? 'grayscale' : ''}`}>
          <img 
            src={event.image_url} 
            alt={event.title} 
            className="w-full h-auto max-h-[500px] object-contain rounded-lg"
          />
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-3/5 space-y-8">
            <div>
              <h1 className="text-3xl font-bold">{event.title}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge>{event.category}</Badge>
                <Badge variant="outline">
                  {event.is_online ? "Online Event" : "In-Person"}
                </Badge>
                {isPastEvent() && (
                  <Badge variant="secondary" className="bg-gray-500 text-white">
                    Past Event
                  </Badge>
                )}
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold mb-4">About this event</h2>
              <p className="whitespace-pre-line">{event.description}</p>
            </div>
            
            <Separator />
            
            <div className="flex space-x-4">
              <EventLikes eventId={event.id} currentUser={user} />
              <EventShareModal eventId={event.id} eventTitle={event.title} />
            </div>
            
            <EventComments eventId={event.id} currentUser={user} />
          </div>
          
          <div className="w-full lg:w-2/5 space-y-6">
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Event Details</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <span>
                        {format(new Date(event.date), "EEEE, MMMM d, yyyy")}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <span>{event.time}</span>
                    </div>
                    
                    {event.is_online ? (
                      <>
                        <div className="flex items-center gap-2">
                          <Globe className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <span>Online Event</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <span>{event.location}</span>
                        </div>
                        
                        {event.address && (
                          <div className="flex gap-2">
                            <div className="w-5 flex-shrink-0"></div>
                            <span className="text-sm text-muted-foreground">{event.address}</span>
                          </div>
                        )}
                      </>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <span>{event.registration_count} RSVPs</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <span>{event.view_count || 0} Views</span>
                    </div>
                  </div>
                  
                  {!event.is_online && event.location_url && (
                    <div className="pt-2">
                      <a 
                        href={event.location_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                      >
                        <MapPin className="h-4 w-4" />
                        View on map
                      </a>
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <h4 className="text-lg font-medium mb-2">Organizer</h4>
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <span>{organizerName}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <Button
                    onClick={handleRegister}
                    disabled={registrationLoading || isPastEvent()}
                    className={`w-full ${isPastEvent() ? 'opacity-50 cursor-not-allowed' : 'bg-primary hover:bg-primary/90 transition-all'}`}
                  >
                    {isRegistered ? "Cancel RSVP" : "RSVP"}
                  </Button>
                  
                  {isPastEvent() && (
                    <p className="text-sm text-muted-foreground text-center">
                      This event has already taken place
                    </p>
                  )}
                  
                  {event.is_online && event.webinar_link && isRegistered && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <h3 className="font-medium mb-2">Join Event</h3>
                      <a 
                        href={event.webinar_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline break-words"
                      >
                        {event.webinar_link}
                      </a>
                    </div>
                  )}
                  
                  {user && user.id === event.organizer_id && (
                    <div className="pt-4 space-y-2">
                      <Button 
                        onClick={() => navigate(`/edit-event/${event.id}`)}
                        variant="outline"
                        className="w-full"
                      >
                        Edit Event
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive"
                            className="w-full"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Event
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
                            <AlertDialogAction onClick={handleDeleteEvent}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Dialog open={showPastEventDialog} onOpenChange={setShowPastEventDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Past Event</DialogTitle>
            <DialogDescription>
              This event has already taken place. You cannot RSVP for past events.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              onClick={() => setShowPastEventDialog(false)}
              className="w-full bg-primary hover:bg-primary/90 transition-all"
            >
              Understood
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
