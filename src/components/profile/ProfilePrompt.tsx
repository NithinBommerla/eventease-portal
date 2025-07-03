
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export const ProfilePrompt = () => {
  const { user } = useAuth();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUserProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Check if the user already dismissed the prompt
        const promptDismissed = localStorage.getItem(`profilePromptDismissed_${user.id}`);
        if (promptDismissed) {
          setLoading(false);
          return;
        }

        // Get user creation time from Supabase auth
        const { data: authData, error: authError } = await supabase.auth.getUser();
        
        if (authError) throw authError;
        
        const userCreatedAt = authData?.user?.created_at;
        if (!userCreatedAt) {
          setLoading(false);
          return;
        }
        
        const creationTime = new Date(userCreatedAt).getTime();
        const currentTime = new Date().getTime();
        const oneHourInMs = 60 * 60 * 1000;
        
        // Check if user has already filled profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, username')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        // Consider profile complete if they have a first_name, last_name or username
        const profileComplete = !!(profileData?.first_name || profileData?.last_name || profileData?.username);
        
        // Only show prompt if:
        // 1. User was created within the last hour (new user)
        // 2. They haven't filled out their profile
        // 3. They haven't dismissed the prompt before
        const isNewUser = currentTime - creationTime < oneHourInMs;
        
        setHasProfile(profileComplete);
        setShowPrompt(isNewUser && !profileComplete);
        setLoading(false);
      } catch (error) {
        console.error("Error checking profile:", error);
        setLoading(false);
      }
    };

    checkUserProfile();
  }, [user]);

  const handleCreateProfile = () => {
    setShowPrompt(false);
    navigate('/profile');
  };

  const handleSkip = () => {
    if (user) {
      // Store in localStorage that the user has dismissed the prompt
      localStorage.setItem(`profilePromptDismissed_${user.id}`, "true");
    }
    setShowPrompt(false);
    toast({
      title: "Profile creation skipped",
      description: "You can complete your profile anytime in the profile section",
    });
  };

  if (loading || hasProfile || !user) {
    return null;
  }

  return (
    <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            Take a moment to set up your profile to get the most out of EventEase
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            A complete profile helps event organizers recognize you and allows you to better connect with other attendees.
          </p>
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleSkip}>Skip for Now</Button>
          <Button onClick={handleCreateProfile} className="bg-primary hover:bg-primary/90 transition-all">Create Profile</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
