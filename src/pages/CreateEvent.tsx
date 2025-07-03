import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { EventForm } from "@/components/events/EventForm";
import { EventFormData } from "@/types/event";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const CreateEvent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to create an event",
        variant: "destructive",
      });
      navigate("/auth");
    }
    
    return () => {
      setIsSubmitting(false);
    };
  }, [user, navigate, toast]);

  const handleSubmit = async (data: EventFormData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to create an event",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (isSubmitting) {
      console.log("Form is already submitting, ignoring additional clicks");
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
        
        const uploadPromise = supabase.storage
          .from('event-images')
          .upload(filePath, file);
          
        const uploadTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Image upload timed out")), 30000)
        );
        
        const { data: uploadData, error: uploadError } = await Promise.race([
          uploadPromise, 
          uploadTimeout.then(() => ({ data: null, error: new Error("Upload timed out") }))
        ]) as any;

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

      console.log("Creating event with data:", {
        ...data,
        imageUrl: imageUrl,
      });

      const { data: eventData, error } = await supabase.from("events").insert({
        title: data.title,
        description: data.description,
        date: data.date,
        time: data.time,
        location: data.is_online ? 'Online' : data.location,
        location_url: !data.is_online ? data.location_url : null,
        address: !data.is_online ? data.address : null,
        category: Array.isArray(data.categories) ? data.categories.join(", ") : data.category,
        image_url: imageUrl,
        organizer_id: user.id,
        city: !data.is_online ? data.city : null,
        country: !data.is_online ? data.country : null,
        is_online: data.is_online || false,
        webinar_link: data.is_online ? data.webinar_link : null,
        is_public: data.is_public !== false,
      }).select();

      if (error) {
        console.error("Event creation error:", error);
        throw error;
      }

      if (!eventData || eventData.length === 0) {
        console.error("No data returned from event creation");
        throw new Error('Failed to create event: No data returned from the server');
      }

      console.log("Event created successfully:", eventData);

      toast({
        title: "Event created!",
        description: "Your event has been successfully created",
      });
      navigate("/");
    } catch (error: any) {
      console.error("Error creating event:", error);
      
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
        title: "Error creating event",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6 flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-center flex-1 pr-10">Create New Event</h1>
        </div>
        <div className="max-w-4xl mx-auto">
          <EventForm 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting}
            onValidationChange={setIsFormValid}
          />
        </div>
      </div>
    </Layout>
  );
};

export default CreateEvent;
