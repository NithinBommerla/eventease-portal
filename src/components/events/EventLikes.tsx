
import { useState, useEffect } from "react";
import { User } from "@/types/user";
import { EventLikeButton } from "@/components/events/EventLikeButton";
import { supabase } from "@/integrations/supabase/client";

interface EventLikesProps {
  eventId: string;
  currentUser: User | null;
}

export const EventLikes = ({ eventId, currentUser }: EventLikesProps) => {
  const [initialLikeCount, setInitialLikeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLikesCount = async () => {
      try {
        const { count, error } = await supabase
          .from("event_likes")
          .select("*", { count: "exact" })
          .eq("event_id", eventId);
        
        if (error) throw error;
        setInitialLikeCount(count || 0);
      } catch (error) {
        console.error("Error fetching likes count:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikesCount();
  }, [eventId]);

  if (isLoading) {
    return <div className="flex items-center gap-2 h-9 animate-pulse bg-gray-200 dark:bg-gray-700 rounded w-24"></div>;
  }

  return (
    <EventLikeButton 
      eventId={eventId} 
      currentUser={currentUser} 
      initialLikeCount={initialLikeCount}
      variant="full"
    />
  );
};
