
import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { EventFilters } from "@/components/events/EventFilters";
import { EventCard } from "@/components/events/EventCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Event } from "@/types/event";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { countries } from "@/data/countries";

const EVENTS_PER_PAGE = 6;

const Discover = () => {
  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filter state
  const [filterParams, setFilterParams] = useState({
    category: "",
    city: "",
    country: "",
    dateFrom: "",
    dateTo: "",
    quickFilter: "",
    isOnline: "",
    sortBy: ""
  });

  const { user } = useAuth();
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

  // Fetch all events with proper staleTime and refetchInterval
  const { data: allEvents, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_public", true) // Only show public events in discover
        .order("date", { ascending: true });

      if (error) throw error;
      return data as Event[];
    },
    // Add proper caching settings
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Prevent excessive refetching
  });

  // Extract unique categories, cities, and countries from events
  const categories = useMemo(() => {
    if (!allEvents) return [];
    return [...new Set(allEvents.map((event) => event.category).filter(Boolean))];
  }, [allEvents]);
  
  const cities = useMemo(() => {
    if (!allEvents) return [];
    return [...new Set(allEvents.map((event) => event.city).filter(Boolean))];
  }, [allEvents]);

  const eventCountries = useMemo(() => {
    if (!allEvents) return [];
    return [...new Set(allEvents.map((event) => event.country).filter(Boolean))];
  }, [allEvents]);

  // Filter events based on filterParams and searchTerm
  const filteredEvents = useMemo(() => {
    if (!allEvents) return [];
    
    return allEvents.filter((event) => {
      // Filter by search term
      if (searchTerm && !event.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !event.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filter by category
      if (filterParams.category && event.category !== filterParams.category) {
        return false;
      }
      
      // Filter by city
      if (filterParams.city && event.city !== filterParams.city) {
        return false;
      }

      // Filter by country
      if (filterParams.country && event.country !== filterParams.country) {
        return false;
      }
      
      // Filter by date range
      if (filterParams.dateFrom && event.date < filterParams.dateFrom) {
        return false;
      }
      
      if (filterParams.dateTo && event.date > filterParams.dateTo) {
        return false;
      }

      // Filter by online/offline
      if (filterParams.isOnline === "true" && !event.is_online) {
        return false;
      }

      if (filterParams.isOnline === "false" && event.is_online) {
        return false;
      }
      
      return true;
    });
  }, [allEvents, filterParams, searchTerm]);

  // Sort events based on sortBy parameter
  const sortedEvents = useMemo(() => {
    if (!filteredEvents || filteredEvents.length === 0) return [];
    
    // Create a copy to avoid mutating the original array
    const events = [...filteredEvents];
    
    // Apply sorting based on sortBy parameter
    switch(filterParams.sortBy) {
      case "date-asc":
        // Sort by date, old to new
        return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      case "date-desc":
        // Sort by date, new to old
        return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      case "views-desc":
        // Sort by view count, highest first
        return events.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
      
      case "rsvps-desc":
        // Sort by RSVP count, highest first
        return events.sort((a, b) => (b.registration_count || 0) - (a.registration_count || 0));
      
      case "likes-desc":
        // Sort by likes count, highest first
        return events.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
      
      default:
        // Default sorting: upcoming events first, then past events
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Separate upcoming and past events
        const upcomingEvents = events.filter(event => event.date >= today);
        const pastEvents = events.filter(event => event.date < today);
        
        if (user) {
          // For logged-in users, prioritize events with higher view counts within each group
          upcomingEvents.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
        } else {
          // Default sorting for upcoming events - by date
          upcomingEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        }
        
        // Past events always sorted by date, most recent first
        pastEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        // Combine with upcoming events first, then past events
        return [...upcomingEvents, ...pastEvents];
    }
  }, [filteredEvents, filterParams.sortBy, user]);

  // Calculate total number of pages based on the filtered events
  const totalPages = useMemo(() => {
    return Math.ceil(sortedEvents.length / EVENTS_PER_PAGE);
  }, [sortedEvents]);

  // Get events for the current page
  const currentEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * EVENTS_PER_PAGE;
    return sortedEvents.slice(startIndex, startIndex + EVENTS_PER_PAGE);
  }, [sortedEvents, currentPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterParams, searchTerm]);

  // Handle filter changes
  const handleFilterChange = (filters: {
    category: string;
    city: string;
    country: string;
    dateFrom: string;
    dateTo: string;
    quickFilter: string;
    isOnline: string;
    sortBy: string;
  }) => {
    setFilterParams(filters);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // Check if event is past
  const isPastEvent = (event: Event) => {
    return event.date < today;
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Discover Events</h1>
        
        {/* Search Input */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search events by title or description..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 py-2"
          />
        </div>
        
        <EventFilters 
          categories={categories} 
          cities={cities}
          countries={countries.map(c => c.code)}
          onFilterChange={handleFilterChange} 
        />
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[400px] bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : currentEvents.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {currentEvents.map((event) => (
                <div key={event.id} className={`${isPastEvent(event) ? 'grayscale' : ''}`}>
                  <EventCard event={event} />
                </div>
              ))}
            </div>
            
            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium">No events found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Try adjusting your filters or search term
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Discover;
