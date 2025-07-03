
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";

interface Attendee {
  id: string;
  username?: string;
  name?: string;
  email?: string;
}

interface EventAttendeesListProps {
  eventId: string;
}

export const EventAttendeesList = ({ eventId }: EventAttendeesListProps) => {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        // First get all registrations for this event
        const { data: registrations, error: regError } = await supabase
          .from("event_registrations")
          .select("user_id")
          .eq("event_id", eventId);

        if (regError) throw regError;

        if (!registrations || registrations.length === 0) {
          setAttendees([]);
          setLoading(false);
          return;
        }

        // Get the user IDs
        const userIds = registrations.map(reg => reg.user_id);

        // Then fetch profile information for these users
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("id, username, name")
          .in("id", userIds);

        if (profileError) throw profileError;

        setAttendees(profiles || []);
      } catch (error) {
        console.error("Error fetching attendees:", error);
        toast({
          title: "Error",
          description: "Failed to load attendees. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAttendees();

    // Set up listener for new registrations
    const channel = supabase
      .channel(`attendees-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_registrations',
          filter: `event_id=eq.${eventId}`
        },
        () => {
          // Refresh the attendees list
          fetchAttendees();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'event_registrations',
          filter: `event_id=eq.${eventId}`
        },
        () => {
          // Refresh the attendees list
          fetchAttendees();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, toast]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event RSVPs</CardTitle>
          <CardDescription>Loading attendees...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event RSVPs</CardTitle>
        <CardDescription>
          {attendees.length} {attendees.length === 1 ? 'person' : 'people'} attending
        </CardDescription>
      </CardHeader>
      <CardContent>
        {attendees.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No attendees yet</p>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {attendees.map((attendee) => (
                <div key={attendee.id} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {attendee.name || attendee.username || "Anonymous User"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
