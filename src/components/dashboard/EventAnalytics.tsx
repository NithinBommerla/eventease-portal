
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, CalendarClock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Event } from "@/types/event";

export interface EventAnalyticsProps {
  userId: string;
}

export const EventAnalytics = ({ userId }: EventAnalyticsProps) => {
  const [totalEvents, setTotalEvents] = useState<number>(0);
  const [totalRegistrations, setTotalRegistrations] = useState<number>(0);
  const [upcomingEvents, setUpcomingEvents] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        
        // Get total events created by user
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select("id, date, registration_count")
          .eq("organizer_id", userId);
          
        if (eventsError) throw eventsError;
        
        // Calculate total events
        setTotalEvents(eventsData.length);
        
        // Calculate upcoming events
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        const upcoming = eventsData.filter((event: Event) => event.date >= today);
        setUpcomingEvents(upcoming.length);
        
        // Calculate total registrations across all events
        const registrations = eventsData.reduce((sum: number, event: Event) => {
          return sum + (event.registration_count || 0);
        }, 0);
        
        setTotalRegistrations(registrations);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [userId]);
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalEvents}</div>
          <p className="text-xs text-muted-foreground pt-1">
            Events you've created
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalRegistrations}</div>
          <p className="text-xs text-muted-foreground pt-1">
            People attending your events
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{upcomingEvents}</div>
          <p className="text-xs text-muted-foreground pt-1">
            Events in the future
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
