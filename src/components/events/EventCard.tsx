import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Calendar, MapPin, Clock, ExternalLink, Users, Building2, Globe, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { Event } from "@/types/event";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { EventLikeButton } from "@/components/events/EventLikeButton";

interface EventCardProps {
  event: Event;
}

export const EventCard = ({ event }: EventCardProps) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    const channel = supabase
      .channel(`event-${event.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'events',
          filter: `id=eq.${event.id}`
        },
        (payload) => {
          console.log('Event updated:', payload.new);
          queryClient.setQueryData(["event", event.id], payload.new);
          queryClient.setQueriesData({ queryKey: ["events"] }, (oldData: any) => {
            if (!oldData) return oldData;
            
            return oldData.map((item: Event[]) => {
              if (Array.isArray(item)) {
                return item.map((e: Event) => 
                  e.id === event.id ? { ...e, ...payload.new } : e
                );
              }
              return item;
            });
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_registrations',
          filter: `event_id=eq.${event.id}`
        },
        () => {
          console.log('New registration detected for event:', event.id);
          queryClient.invalidateQueries({ queryKey: ["event", event.id] });
          queryClient.invalidateQueries({ queryKey: ["events"] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'event_registrations',
          filter: `event_id=eq.${event.id}`
        },
        () => {
          console.log('Registration removed for event:', event.id);
          queryClient.invalidateQueries({ queryKey: ["event", event.id] });
          queryClient.invalidateQueries({ queryKey: ["events"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [event.id, queryClient]);

  const renderCategories = () => {
    if (!event.category) return null;
    
    const categories = event.category.split(',').map(cat => cat.trim());
    
    if (categories.length <= 1) {
      return (
        <span className="px-3 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-900 dark:text-gray-100">
          {categories[0]}
        </span>
      );
    }
    
    return (
      <div className="flex gap-1 flex-wrap">
        <span className="px-3 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-900 dark:text-gray-100">
          {categories[0]}
        </span>
        <span className="px-3 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-900 dark:text-gray-100">
          +{categories.length - 1}
        </span>
      </div>
    );
  };

  const isUpcoming = () => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return event.date >= today;
  };

  return (
    <div className="group h-full">
      <Link to={`/event/${event.id}`}>
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full dark:bg-gray-800/50">
          <div className="aspect-video relative overflow-hidden">
            <img
              src={event.image_url}
              alt={event.title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-3 right-3 z-10">
              {renderCategories()}
            </div>
            <div className="absolute top-3 left-3 flex gap-1">
              {event.is_online && (
                <Badge variant="secondary" className="flex items-center gap-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-xs">
                  <Globe className="h-3 w-3" />
                  <span>Online</span>
                </Badge>
              )}
              <Badge 
                variant={isUpcoming() ? "default" : "secondary"} 
                className={`flex items-center gap-1 ${isUpcoming() ? 'bg-green-500/90' : 'bg-gray-500/90'} backdrop-blur-sm text-white text-xs`}
              >
                {isUpcoming() ? 'Upcoming' : 'Past'}
              </Badge>
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">
              {event.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
              {event.description}
            </p>
            <div className="flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{event.time}</span>
              </div>
              
              {event.is_online ? (
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4 text-primary" />
                  <span>Online Event</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  {event.city && (
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      <span>{event.city}</span>
                    </div>
                  )}
                </>
              )}
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-1 font-medium text-primary">
                  <Users className="w-4 h-4" />
                  <span>{event.registration_count || 0} {event.registration_count === 1 ? 'RSVP' : 'RSVPs'}</span>
                </div>
                
                <div className="flex items-center gap-1 font-medium text-primary">
                  <Eye className="w-4 h-4" />
                  <span>{event.view_count || 0} {event.view_count === 1 ? 'View' : 'Views'}</span>
                </div>

                <EventLikeButton 
                  eventId={event.id} 
                  currentUser={user} 
                  initialLikeCount={event.likes_count || 0}
                  variant="icon"
                />
              </div>
              
              {!event.is_online && event.location_url && (
                <a 
                  href={event.location_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mt-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>View on Google Maps</span>
                </a>
              )}
              
              {event.is_online && event.webinar_link && (
                <a 
                  href={event.webinar_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mt-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Join Webinar</span>
                </a>
              )}
            </div>
          </div>
        </Card>
      </Link>
    </div>
  );
};
