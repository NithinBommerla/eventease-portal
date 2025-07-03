
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { PlusCircle, CalendarDays, Users, Share2, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Event } from "@/types/event";
import { EventCard } from "@/components/events/EventCard";
import { useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";

const Index = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Fetch featured events (top 3 with most RSVPs)
  const { data: featuredEvents, isLoading: featuredLoading } = useQuery({
    queryKey: ["events", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("registration_count", { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch upcoming events (top 3 upcoming events)
  const { data: upcomingEvents, isLoading: upcomingLoading } = useQuery({
    queryKey: ["events", "upcoming"],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .gte("date", today)
        .order("date", { ascending: true })
        .limit(3);

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Define CSS for blinking gradient effect
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes gradientBlink {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      .gradient-btn {
        background: linear-gradient(90deg, hsla(221, 45%, 73%, 1) 0%, hsla(220, 78%, 29%, 1) 100%);
        background-size: 200% 200%;
        animation: gradientBlink 3s ease infinite;
        color: white;
        border: none;
      }
      .gradient-btn:hover {
        opacity: 0.9;
        background-size: 150% 150%;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Theme-specific hero images
  const darkModeHeroImage = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2940&auto=format&fit=crop";
  const lightModeHeroImage = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2940&auto=format&fit=crop";

  return (
    <Layout>
      <section className="py-10 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Create & Manage Events with Ease
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                  EventEase helps you create, share, and manage events effortlessly. Connect with attendees and track event performance in one place.
                </p>
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                {user ? (
                  <>
                    <Button asChild size="lg" className="font-medium gradient-btn">
                      <Link to="/create-event">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Event
                      </Link>
                    </Button>
                    <Button asChild size="lg" className="font-medium gradient-btn">
                      <Link to="/discover">
                        Discover Events
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild size="lg" className="font-medium gradient-btn">
                      <Link to="/auth">Sign In</Link>
                    </Button>
                    <Button asChild size="lg" className="font-medium gradient-btn">
                      <Link to="/discover">
                        Discover Events
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="mx-auto lg:mx-0 relative">
              <img
                src={isDarkMode ? darkModeHeroImage : lightModeHeroImage}
                alt="Events"
                className="rounded-lg shadow-xl border aspect-video object-cover"
                onError={(e) => {
                  console.error("Image failed to load, falling back to default");
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2940&auto=format&fit=crop";
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-12">
        <div className="container px-4 md:px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Featured Events</h2>
            <Button asChild variant="ghost" className="flex items-center gap-1 text-primary">
              <Link to="/discover">
                <span>View All</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
          
          {featuredLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[400px] bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredEvents && featuredEvents.length > 0 ? (
                featuredEvents.map((event: Event) => (
                  <EventCard key={event.id} event={event} />
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">No featured events available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800/50">
        <div className="container px-4 md:px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Upcoming Events</h2>
            <Button asChild variant="ghost" className="flex items-center gap-1 text-primary">
              <Link to="/discover">
                <span>View All</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
          
          {upcomingLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[400px] bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingEvents && upcomingEvents.length > 0 ? (
                upcomingEvents.map((event: Event) => (
                  <EventCard key={event.id} event={event} />
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">No upcoming events available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="py-16">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Ready to create your first event?
              </h2>
              <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                Join thousands of event organizers who use EventEase to manage their events
              </p>
            </div>
            {user ? (
              <Button asChild size="lg" className="mt-4 font-medium gradient-btn">
                <Link to="/create-event">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Event
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="mt-4 font-medium gradient-btn">
                <Link to="/auth">Create your first Event</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50 dark:bg-gray-800/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Features</h2>
              <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                Everything you need to create and manage successful events
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="flex flex-col items-center space-y-3 p-6 border rounded-lg bg-white dark:bg-gray-950">
              <div className="p-2 bg-primary/10 rounded-full">
                <CalendarDays className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Event Management</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Create, edit, and manage your events with a simple and intuitive interface.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-3 p-6 border rounded-lg bg-white dark:bg-gray-950">
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Attendee Tracking</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Monitor event registrations and engage with your audience.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-3 p-6 border rounded-lg bg-white dark:bg-gray-950">
              <div className="p-2 bg-primary/10 rounded-full">
                <Share2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Easy Sharing</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Share your events on social media and via direct links.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
