
import { useState, useEffect, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ProfileData, DbProfile } from "@/types/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountTab } from "@/components/profile/AccountTab";
import { PasswordTab } from "@/components/profile/PasswordTab";
import { NotificationsTab } from "@/components/profile/NotificationsTab";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("account");

  // Avatar cropping state
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [cropScale, setCropScale] = useState(1);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropShape, setCropShape] = useState<'circle' | 'square'>('circle');
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Memoized fetch profile function
  const fetchProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      const profile = data as DbProfile;
      const fullName = profile?.name || "";
      let firstName = profile?.first_name || "";
      let lastName = profile?.last_name || "";
      
      if (fullName && (!firstName || !lastName)) {
        const nameParts = fullName.split(" ");
        firstName = firstName || nameParts[0] || "";
        lastName = lastName || nameParts.slice(1).join(" ") || "";
      }
      
      setProfileData({
        username: profile?.username || "",
        email: user.email,
        name: fullName,
        first_name: firstName,
        last_name: lastName,
        age: profile?.age || null,
        dob: profile?.dob || null,
        phone_number: profile?.phone_number || "",
        country_code: profile?.country_code || "+1", // Added country_code with default value
        gender: profile?.gender || "",
        country: profile?.country || "",
        city: profile?.city || "",
        address: profile?.address || "",
        bio: profile?.bio || "",
        website: profile?.website || "",
        avatar_url: profile?.avatar_url || "",
      });
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data: " + (error.message || "Unknown error"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Fetch user profile data
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to view this page",
        variant: "destructive",
      });
      navigate("/auth");
    }
    
    return () => {
      setIsSubmitting(false);
    };
  }, [user, authLoading, navigate, toast]);

  // Touch and mouse event handlers for image dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setCropPosition(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    e.preventDefault();
    const deltaX = e.touches[0].clientX - dragStart.x;
    const deltaY = e.touches[0].clientY - dragStart.y;
    setCropPosition(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Add wheel event for zooming
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? -0.05 : 0.05;
    setCropScale(prev => Math.max(0.1, Math.min(3, prev + zoomDelta)));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image file is too large. Maximum size is 5MB.",
          variant: "destructive"
        });
        return;
      }
      
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image (JPEG, PNG, GIF, WEBP).",
          variant: "destructive"
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setShowCropDialog(true);
        setCropPosition({ x: 0, y: 0 });
        setCropScale(1);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropImage = () => {
    if (!originalImage || !profileData) return;
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = 400;
      canvas.height = 400;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (cropShape === 'circle') {
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
      }
      
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(cropScale, cropScale);
      ctx.translate(cropPosition.x, cropPosition.y);
      
      const imgWidth = img.width;
      const imgHeight = img.height;
      ctx.drawImage(img, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
      ctx.restore();
      
      const croppedImageDataUrl = canvas.toDataURL('image/png');
      
      fetch(croppedImageDataUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'avatar.png', { type: 'image/png' });
          
          setProfileData(prev => prev ? { ...prev, avatarFile: file } : null);
          setShowCropDialog(false);
        });
    };
    img.src = originalImage;
  };

  const handleCancelCrop = () => {
    setShowCropDialog(false);
    setOriginalImage(null);
  };

  const handleSubmit = async (data: ProfileData) => {
    if (!user || !profileData) return;
    
    if (isSubmitting) {
      console.log("Form is already submitting, ignoring additional clicks");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (data.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email,
        });
        
        if (emailError) throw emailError;
        
        toast({
          title: "Email verification required",
          description: "Please check your email to confirm the change",
        });
      }

      // Convert Date object to ISO string for database storage
      let dobValue: string | null = null;
      if (data.dob) {
        dobValue = typeof data.dob === 'string' ? data.dob : data.dob.toISOString();
      }

      const updateProfilePromise = supabase
        .from("profiles")
        .update({
          username: data.username,
          name: data.name,
          first_name: data.first_name,
          last_name: data.last_name,
          age: data.age,
          dob: dobValue,
          phone_number: data.phone_number,
          gender: data.gender,
          country: data.country,
          city: data.city,
          address: data.address,
          bio: data.bio,
          website: data.website,
        })
        .eq("id", user.id);
      
      const updateTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Profile update timed out")), 10000)
      );
      
      const { error: profileError } = await Promise.race([
        updateProfilePromise,
        updateTimeout.then(() => ({ error: new Error("Update timed out") }))
      ]) as any;

      if (profileError) throw profileError;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
      
      if (data.avatarFile) {
        const file = data.avatarFile;
        const fileExt = file.name.split('.').pop();
        
        const timestamp = Date.now();
        const fileName = `${timestamp}.${fileExt}`;
        
        const filePath = `${user.id}/${fileName}`;
        
        console.log("Uploading file to avatars bucket:", filePath);
        
        const uploadPromise = supabase.storage
          .from('avatars')
          .upload(filePath, file);
          
        const uploadTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Avatar upload timed out")), 30000)
        );
        
        const { error: uploadError } = await Promise.race([
          uploadPromise,
          uploadTimeout.then(() => ({ error: new Error("Upload timed out") }))
        ]) as any;

        if (uploadError) {
          console.error("Upload error details:", uploadError);
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        if (!urlData.publicUrl) {
          throw new Error('Failed to get avatar URL');
        }

        console.log("Avatar URL:", urlData.publicUrl);

        const { error: avatarError } = await supabase
          .from("profiles")
          .update({
            avatar_url: urlData.publicUrl
          })
          .eq("id", user.id);

        if (avatarError) throw avatarError;
      }

      await fetchProfile();
      
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error updating profile",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader className="flex items-center justify-center pb-2">
              <CardTitle>Loading Profile</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center py-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Profile Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs 
              defaultValue="account" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>
              
              <TabsContent value="account" className="space-y-4">
                {profileData && (
                  <AccountTab
                    profileData={profileData}
                    isSubmitting={isSubmitting}
                    onSubmit={handleSubmit}
                    onAvatarChange={handleAvatarChange}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="password">
                <PasswordTab />
              </TabsContent>
              
              <TabsContent value="notifications">
                <NotificationsTab />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center mb-2">Adjust Profile Picture</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-5">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="circle-crop"
                  checked={cropShape === 'circle'}
                  onCheckedChange={() => setCropShape('circle')}
                />
                <Label htmlFor="circle-crop">Circle</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="square-crop"
                  checked={cropShape === 'square'}
                  onCheckedChange={() => setCropShape('square')}
                />
                <Label htmlFor="square-crop">Square</Label>
              </div>
            </div>
            
            <div className="space-y-1 w-full">
              <div className="flex items-center justify-between">
                <Label htmlFor="zoom-slider">Zoom</Label>
                <span className="text-xs text-muted-foreground">{Math.round(cropScale * 100)}%</span>
              </div>
              <Slider
                id="zoom-slider"
                min={0.1}
                max={3}
                step={0.01}
                value={[cropScale]}
                onValueChange={(value) => setCropScale(value[0])}
              />
            </div>
            
            <p className="text-sm text-center text-muted-foreground">
              Drag to position • Use slider or mouse wheel to zoom
            </p>
            
            <div 
              ref={cropContainerRef} 
              className={`relative w-64 h-64 mx-auto bg-gray-100 dark:bg-gray-800 overflow-hidden ${cropShape === 'circle' ? 'rounded-full' : 'rounded-md'}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onWheel={handleWheel}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              {originalImage && (
                <div 
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  <img 
                    ref={imageRef}
                    src={originalImage} 
                    alt="Crop preview" 
                    style={{
                      transform: `translate(${cropPosition.x}px, ${cropPosition.y}px) scale(${cropScale})`,
                      transformOrigin: 'center',
                      maxWidth: 'none',
                      objectFit: 'cover',
                      userSelect: 'none',
                      touchAction: 'none',
                    }}
                    draggable="false"
                  />
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="mt-4 flex gap-2 justify-end">
            <Button variant="outline" onClick={handleCancelCrop}>
              Cancel
            </Button>
            <Button onClick={handleCropImage}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Profile;

