import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { EventForm } from "@/components/events/EventForm";
import { EventFormData, Event } from "@/types/event";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const fetchEvent = async (id: string): Promise<Event | null> => {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const EditEvent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: event, isLoading, error } = useQuery({
    queryKey: ["event", id],
    queryFn: () => fetchEvent(id!),
    enabled: !!id && !!user,
  });

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to edit an event",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (event && event.organizer_id !== user.id) {
      toast({
        title: "Unauthorized",
        description: "You can only edit events that you created",
        variant: "destructive",
      });
      navigate(`/event/${id}`);
      return;
    }
  }, [user, event, id, navigate, toast]);

  const handleSubmit = async (data: EventFormData) => {
    if (!user || !id) {
      toast({
        title: "Error",
        description: "User or event ID is missing",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl = data.image_url;

      if (data.imageFile) {
        const file = data.imageFile;
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = fileName;

        console.log("Uploading image:", fileName);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(filePath, file);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw new Error(`Error uploading image: ${uploadError.message}`);
        }

        console.log("Upload successful:", uploadData);

        const { data: urlData } = supabase.storage
          .from('event-images')
          .getPublicUrl(filePath);

        if (!urlData || !urlData.publicUrl) {
          console.error("Failed to get public URL", urlData);
          throw new Error('Failed to get image URL');
        }

        imageUrl = urlData.publicUrl;
        console.log("Image URL:", imageUrl);
      }

      if (!imageUrl) {
        throw new Error('No image URL available');
      }

      console.log("Updating event with data:", {
        ...data,
        imageUrl: imageUrl,
      });

      const { data: eventData, error } = await supabase
        .from("events")
        .update({
          title: data.title,
          description: data.description,
          date: data.date,
          time: data.time,
          location: data.is_online ? 'Online' : data.location,
          location_url: !data.is_online ? data.location_url : null,
          address: !data.is_online ? data.address : null,
          category: Array.isArray(data.categories) ? data.categories.join(", ") : data.category,
          image_url: imageUrl,
          city: !data.is_online ? data.city : null,
          country: !data.is_online ? data.country : null,
          is_online: data.is_online || false,
          webinar_link: data.is_online ? data.webinar_link : null,
          is_public: data.is_public !== false,
        })
        .eq("id", id)
        .eq("organizer_id", user.id)
        .select();

      if (error) {
        console.error("Event update error:", error);
        throw error;
      }

      if (!eventData || eventData.length === 0) {
        console.error("No data returned from event update");
        throw new Error('Failed to update event: No data returned from the server');
      }

      console.log("Event updated successfully:", eventData);

      toast({
        title: "Event updated!",
        description: "Your event has been successfully updated",
      });
      navigate(`/event/${id}`);
    } catch (error: any) {
      console.error("Error updating event:", error);
      
      let errorMessage = "Something went wrong. Please try again.";
      
      if (error.message.includes("storage")) {
        errorMessage = "Failed to upload image. Please try a different image or try again later.";
      } else if (error.message.includes("URL")) {
        errorMessage = "Failed to process image. Please try a different image.";
      } else if (error.message.includes("violates")) {
        errorMessage = "Invalid event data. Please check all fields and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error updating event",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
          <h1 className="text-3xl font-bold mb-8 text-center">Edit Event</h1>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-full"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !event) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 text-center">
          <h1 className="text-3xl font-bold mb-4">Event Not Found</h1>
          <p className="mb-6">The event you're trying to edit doesn't exist or you don't have permission to edit it.</p>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>
      </Layout>
    );
  }

  if (!user || event.organizer_id !== user.id) {
    return null;
  }

  const eventCategories = event.category ? event.category.split(",").map(cat => cat.trim()) : [];

  const initialFormData: EventFormData = {
    title: event.title,
    description: event.description,
    date: event.date,
    time: event.time,
    location: event.is_online ? "" : event.location,
    location_url: event.location_url || "",
    address: event.address || "",
    category: event.category,
    categories: eventCategories,
    image_url: event.image_url,
    latitude: event.latitude || null,
    longitude: event.longitude || null,
    city: event.city || "",
    country: event.country || "",
    is_online: event.is_online || false,
    webinar_link: event.webinar_link || "",
    is_public: event.is_public !== false,
    imageFile: null,
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6 flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-center flex-1 pr-10">Edit Event</h1>
        </div>
        <div className="max-w-4xl mx-auto">
          <EventForm 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting} 
            initialData={initialFormData}
            mode="edit"
          />
        </div>
      </div>
    </Layout>
  );
};

export default EditEvent;
