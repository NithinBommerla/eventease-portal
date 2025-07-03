
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { EventFormData } from "@/types/event";
import { useToast } from "@/components/ui/use-toast";
import { EventTitleField } from "./form/EventTitleField";
import { EventDescriptionField } from "./form/EventDescriptionField";
import { EventDateTimeFields } from "./form/EventDateTimeFields";
import { EventLocationFields } from "./form/EventLocationFields";
import { EventAddressField } from "./form/EventAddressField";
import { EventCategoryField } from "./form/EventCategoryField";
import { EventImageField } from "./form/EventImageField";
import { EventCityField } from "./form/EventCityField";
import { EventCountryField } from "./form/EventCountryField";
import { EventTypeField } from "./form/EventTypeField";
import { EventWebinarLinkField } from "./form/EventWebinarLinkField";
import { EventVisibilityField } from "./form/EventVisibilityField";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface EventFormProps {
  onSubmit: (data: EventFormData) => void;
  isSubmitting: boolean;
  initialData?: EventFormData;
  mode?: "create" | "edit";
  onValidationChange?: (isValid: boolean) => void;
}

export const EventForm = ({ 
  onSubmit, 
  isSubmitting, 
  initialData,
  mode = "create",
  onValidationChange
}: EventFormProps) => {
  const [formData, setFormData] = useState<EventFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    date: initialData?.date || "",
    time: initialData?.time || "",
    location: initialData?.location || "",
    location_url: initialData?.location_url || "",
    address: initialData?.address || "",
    category: initialData?.category || "",
    categories: initialData?.categories || [],
    image_url: initialData?.image_url || "",
    latitude: initialData?.latitude || null,
    longitude: initialData?.longitude || null,
    city: initialData?.city || "",
    country: initialData?.country || "",
    is_online: initialData?.is_online || false,
    webinar_link: initialData?.webinar_link || "",
    is_public: initialData?.is_public !== false, // Default to true if not specified
    imageFile: null,
  });
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialData?.image_url) {
      setImagePreview(initialData.image_url);
    }
  }, [initialData]);

  const validateForm = useCallback(() => {
    if (!isSubmitted) return true;
    
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }
    
    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }
    
    if (!formData.date) {
      errors.date = "Date is required";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.date = "Event date cannot be in the past";
      }
    }
    
    if (!formData.time) {
      errors.time = "Time is required";
    }
    
    if (!formData.is_online) {
      if (!formData.location || !formData.location.trim()) {
        errors.location = "Location is required for in-person events";
      }
      
      if (!formData.country || !formData.country.trim()) {
        errors.country = "Country is required for in-person events";
      }

      if (!formData.city || !formData.city.trim()) {
        errors.city = "City is required for in-person events";
      }
    }
    
    if (formData.is_online && (!formData.webinar_link || !formData.webinar_link.trim())) {
      errors.webinar_link = "Webinar link is required for online events";
    }
    
    if (!formData.is_online && formData.location_url && !validateGoogleMapsUrl(formData.location_url)) {
      errors.location_url = "Please enter a valid Google Maps URL";
    }
    
    if (!formData.categories || formData.categories.length === 0) {
      errors.categories = "At least one category is required";
    }
    
    if (mode === "create" && !initialData?.image_url && !formData.imageFile) {
      errors.image = "Image is required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, mode, initialData, isSubmitted]);

  useEffect(() => {
    const isValid = validateForm();
    if (onValidationChange) {
      onValidationChange(isValid);
    }
  }, [formData, validateForm, onValidationChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'date') {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        setDateError("Event date cannot be in the past");
      } else {
        setDateError(null);
      }
    }
    
    if (name === 'country') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        city: "" 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors(prev => ({
          ...prev,
          image: "Image file is too large. Maximum size is 5MB."
        }));
        return;
      }
      
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setFormErrors(prev => ({
          ...prev,
          image: "Invalid file type. Please upload an image (JPEG, PNG, GIF, WEBP)."
        }));
        return;
      }
      
      setFormData((prev) => ({ ...prev, imageFile: file, image_url: "" }));
      setFormErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.image;
        return newErrors;
      });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({ ...prev, imageFile: null }));
      setImagePreview(initialData?.image_url || null);
      
      if (mode === "create" && !initialData?.image_url) {
        setFormErrors(prev => ({
          ...prev,
          image: "Image is required"
        }));
      }
    }
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      const formattedDate = format(newDate, "yyyy-MM-dd");
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (newDate < today) {
        setDateError("Event date cannot be in the past");
        setFormErrors(prev => ({
          ...prev,
          date: "Event date cannot be in the past"
        }));
      } else {
        setDateError(null);
        setFormErrors(prev => {
          const newErrors = {...prev};
          delete newErrors.date;
          return newErrors;
        });
        setFormData(prev => ({ ...prev, date: formattedDate }));
      }
    }
  };

  const handleEventTypeChange = (isOnline: boolean) => {
    setFormData(prev => ({ 
      ...prev, 
      is_online: isOnline,
      location: isOnline ? "" : prev.location,
      location_url: isOnline ? "" : prev.location_url,
      webinar_link: !isOnline ? "" : prev.webinar_link,
      city: isOnline ? "" : prev.city,
      country: isOnline ? "" : prev.country,
    }));
  };

  const handleVisibilityChange = (isPublic: boolean) => {
    setFormData(prev => ({
      ...prev,
      is_public: isPublic
    }));
  };

  const handleCategoriesChange = (categories: string[]) => {
    setFormData(prev => ({ 
      ...prev, 
      categories,
      category: categories.join(", ")
    }));
    
    if (categories.length > 0) {
      setFormErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.categories;
        return newErrors;
      });
    } else {
      setFormErrors(prev => ({
        ...prev,
        categories: "At least one category is required"
      }));
    }
  };

  const validateGoogleMapsUrl = (url: string): boolean => {
    if (!url) return true;
    return url.includes('google.com/maps') || url.includes('maps.app.goo.gl');
  };

  const validateWebinarUrl = (url: string): boolean => {
    if (!url) return true;
    return url.startsWith('http://') || url.startsWith('https://');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitted(true);
    
    const isValid = validateForm();
    
    if (!isValid) {
      const errorMessages = Object.values(formErrors).join(", ");
      toast({
        title: "Validation Error",
        description: errorMessages,
        variant: "destructive",
      });
      return;
    }
    
    try {
      onSubmit(formData);
    } catch (error) {
      console.error("Error during form submission:", error);
      toast({
        title: "Error",
        description: "There was a problem submitting the form. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <EventTitleField 
          value={formData.title} 
          onChange={handleChange} 
          error={formErrors.title}
          disabled={isSubmitting}
        />

        <EventDescriptionField 
          value={formData.description} 
          onChange={handleChange} 
          error={formErrors.description}
          disabled={isSubmitting}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EventDateTimeFields 
            date={formData.date} 
            time={formData.time} 
            onChange={handleChange}
            onDateChange={handleDateSelect}
            dateError={formErrors.date || dateError}
            timeError={formErrors.time}
            disabled={isSubmitting}
          />

          <EventCategoryField 
            categories={formData.categories || []} 
            onChange={handleCategoriesChange} 
            error={formErrors.categories}
            disabled={isSubmitting}
          />
        </div>

        <EventTypeField 
          isOnline={formData.is_online || false} 
          onChange={handleEventTypeChange} 
          disabled={isSubmitting}
        />

        <EventVisibilityField
          isPublic={formData.is_public !== false}
          onChange={handleVisibilityChange}
          disabled={isSubmitting}
        />

        {formData.is_online ? (
          <EventWebinarLinkField
            value={formData.webinar_link || ""}
            onChange={handleChange}
            error={formErrors.webinar_link}
            disabled={isSubmitting}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EventCountryField
                value={formData.country || ""}
                onChange={handleChange}
                error={formErrors.country}
                disabled={isSubmitting}
              />

              <EventCityField
                value={formData.city || ""}
                onChange={handleChange}
                error={formErrors.city}
                disabled={isSubmitting}
                countryCode={formData.country}
              />
            </div>
            
            <EventLocationFields
              location={formData.location}
              locationUrl={formData.location_url}
              onChange={handleChange}
              validateLocationUrl={validateGoogleMapsUrl}
              locationError={formErrors.location}
              locationUrlError={formErrors.location_url}
              disabled={isSubmitting}
            />

            <EventAddressField
              value={formData.address || ""}
              onChange={handleChange}
              error={formErrors.address}
              disabled={isSubmitting}
            />
          </>
        )}

        <EventImageField 
          onChange={handleImageChange} 
          imagePreview={imagePreview}
          required={mode === "create" && !initialData?.image_url}
          error={formErrors.image}
          disabled={isSubmitting}
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full relative"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span>{mode === "create" ? "Creating Event..." : "Updating Event..."}</span>
          </>
        ) : (
          mode === "create" ? "Create Event" : "Update Event"
        )}
      </Button>
    </form>
  );
};
