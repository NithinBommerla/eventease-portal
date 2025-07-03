
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Loader2, BellRing, Mail, Calendar, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationPreferences } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

export const NotificationsTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: true,
    in_app_notifications: true,
    marketing_emails: true,
    event_reminders: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch notification preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("notification_preferences")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          setPreferences({
            email_notifications: data.email_notifications,
            in_app_notifications: data.in_app_notifications,
            marketing_emails: data.marketing_emails,
            event_reminders: data.event_reminders,
          });
        } else {
          // Create default preferences if none exist
          await supabase
            .from("notification_preferences")
            .insert({
              user_id: user.id,
              email_notifications: true,
              in_app_notifications: true,
              marketing_emails: true,
              event_reminders: true,
            });
        }
      } catch (error: any) {
        console.error("Error fetching notification preferences:", error);
        toast({
          title: "Error",
          description: "Failed to load notification preferences",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPreferences();
  }, [user, toast]);

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from("notification_preferences")
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString(),
        });
        
      if (error) throw error;
      
      toast({
        title: "Preferences saved",
        description: "Your notification preferences have been updated",
      });
    } catch (error: any) {
      console.error("Error saving notification preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save notification preferences",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Notification Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage how you receive notifications and updates about events and activities.
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-3">
            <BellRing className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="text-sm font-medium">In-app Notifications</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Receive notifications within the application
              </p>
            </div>
          </div>
          <Switch 
            checked={preferences.in_app_notifications} 
            onCheckedChange={() => handleToggle('in_app_notifications')}
            disabled={isSaving}
          />
        </div>
        
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="text-sm font-medium">Email Notifications</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Receive email updates about your account and events
              </p>
            </div>
          </div>
          <Switch 
            checked={preferences.email_notifications} 
            onCheckedChange={() => handleToggle('email_notifications')}
            disabled={isSaving}
          />
        </div>
        
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="text-sm font-medium">Event Reminders</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Receive reminders about upcoming events you're registered for
              </p>
            </div>
          </div>
          <Switch 
            checked={preferences.event_reminders} 
            onCheckedChange={() => handleToggle('event_reminders')}
            disabled={isSaving}
          />
        </div>
        
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-3">
            <Megaphone className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="text-sm font-medium">Marketing Emails</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Receive promotional emails and newsletters
              </p>
            </div>
          </div>
          <Switch 
            checked={preferences.marketing_emails} 
            onCheckedChange={() => handleToggle('marketing_emails')}
            disabled={isSaving}
          />
        </div>
      </div>
      
      <Button 
        onClick={handleSave} 
        disabled={isSaving}
        className="w-full"
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span>Saving...</span>
          </>
        ) : (
          "Save Preferences"
        )}
      </Button>
    </div>
  );
};
