
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { User } from "@/types/user";
import { EventLike } from "@/types/like";

interface EventLikeButtonProps {
  eventId: string;
  currentUser: User | null;
  initialLikeCount: number;
  initialIsLiked?: boolean;
  variant?: "icon" | "full";
}

export const EventLikeButton = ({ 
  eventId, 
  currentUser, 
  initialLikeCount = 0,
  initialIsLiked = false,
  variant = "full" 
}: EventLikeButtonProps) => {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Check if the current user has liked the event when component mounts or user changes
  useEffect(() => {
    if (currentUser) {
      const checkLikeStatus = async () => {
        try {
          const { data, error } = await supabase
            .from("event_likes")
            .select("id")
            .eq("event_id", eventId)
            .eq("user_id", currentUser.id)
            .maybeSingle();
          
          if (error) throw error;
          setIsLiked(!!data);
        } catch (error) {
          console.error("Error checking like status:", error);
        }
      };
      
      checkLikeStatus();
    } else {
      setIsLiked(false);
    }
  }, [currentUser, eventId]);
  
  // Set up real-time subscription for like count
  useEffect(() => {
    // Initial likes count fetch from events table
    const fetchEventLikesCount = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("likes_count")
          .eq("id", eventId)
          .single();
        
        if (error) throw error;
        if (data && typeof data.likes_count === 'number') {
          setLikeCount(data.likes_count);
        }
      } catch (error) {
        console.error("Error fetching event likes count:", error);
      }
    };

    fetchEventLikesCount();
    
    // Set up real-time subscription for event likes
    const channel = supabase
      .channel(`event-likes-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_likes',
          filter: `event_id=eq.${eventId}`
        },
        async (payload) => {
          console.log('Like event detected:', payload);
          // Refetch like count when changes occur
          try {
            const { count, error } = await supabase
              .from("event_likes")
              .select("*", { count: "exact" })
              .eq("event_id", eventId);
            
            if (error) throw error;
            console.log('Updated like count:', count);
            setLikeCount(count || 0);
            
            // Update isLiked status if user is logged in
            if (currentUser) {
              const { data, error: userLikeError } = await supabase
                .from("event_likes")
                .select("id")
                .eq("event_id", eventId)
                .eq("user_id", currentUser.id)
                .maybeSingle();
              
              if (userLikeError) throw userLikeError;
              setIsLiked(!!data);
            }
          } catch (error) {
            console.error("Error updating like count:", error);
          }
        }
      )
      .subscribe();
    
    // Also listen for direct updates to the events table likes_count
    const eventsChannel = supabase
      .channel(`event-updates-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'events',
          filter: `id=eq.${eventId}`
        },
        (payload) => {
          console.log('Event update detected:', payload);
          if (payload.new && typeof payload.new.likes_count === 'number') {
            console.log('Setting likes count from event update:', payload.new.likes_count);
            setLikeCount(payload.new.likes_count);
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(eventsChannel);
    };
  }, [eventId, currentUser]);
  
  const handleToggleLike = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like events",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isLiked) {
        // Unlike the event - optimistically update UI
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
        
        // Then perform the delete operation
        const { error } = await supabase
          .from("event_likes")
          .delete()
          .eq("event_id", eventId)
          .eq("user_id", currentUser.id);
        
        if (error) {
          // Revert optimistic update on error
          setIsLiked(true);
          setLikeCount(prev => prev + 1);
          throw error;
        }
      } else {
        // Like the event - optimistically update UI
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
        
        // Then perform the insert operation
        const { error } = await supabase
          .from("event_likes")
          .insert({
            event_id: eventId,
            user_id: currentUser.id,
          });
        
        if (error) {
          // Revert optimistic update on error
          setIsLiked(false);
          setLikeCount(prev => Math.max(0, prev - 1));
          throw error;
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({
        title: "Error",
        description: "Failed to update like status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getButtonLabel = () => {
    if (variant === "icon") {
      return likeCount.toString();
    }
    
    if (isLiked) {
      return likeCount > 1 ? `You and ${likeCount - 1} others` : 'You like this';
    } else {
      return likeCount === 1 ? '1 person likes this' : 
             likeCount > 1 ? `${likeCount} people like this` : 'Be the first to like';
    }
  };
  
  if (variant === "icon") {
    return (
      <div className="flex items-center gap-1 font-medium text-rose-500">
        <button
          onClick={handleToggleLike}
          disabled={isLoading}
          className="flex items-center focus:outline-none"
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-rose-500' : ''}`} />
        </button>
        <span>{getButtonLabel()}</span>
      </div>
    );
  }
  
  return (
    <Button
      variant={isLiked ? "default" : "outline"}
      className={`gap-2 ${isLiked ? 'bg-pink-600 hover:bg-pink-700 text-white' : ''}`}
      onClick={handleToggleLike}
      disabled={isLoading}
    >
      <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
      <span>{getButtonLabel()}</span>
    </Button>
  );
};
