
import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProfileData } from "@/types/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  UserCircle,
  Upload,
  Loader2,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from "@/components/ui/dialog";

interface ProfileFormProps {
  initialData: ProfileData;
  onSubmit: (data: ProfileData) => void;
  isSubmitting: boolean;
}

export const ProfileForm = ({ 
  initialData, 
  onSubmit, 
  isSubmitting 
}: ProfileFormProps) => {
  const [formData, setFormData] = useState<ProfileData>(initialData);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [cropScale, setCropScale] = useState(1);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (initialData.avatar_url) {
      setAvatarPreview(initialData.avatar_url);
    }
  }, [initialData]);

  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};
    
    // Username validation
    if (!formData.username) {
      errors.username = "Username is required";
    }
    
    // Email validation
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }
    
    // Phone validation (optional)
    if (formData.phone_number && !/^[0-9+\-\s()]*$/.test(formData.phone_number)) {
      errors.phone_number = "Phone number can only contain digits, +, -, spaces, and parentheses";
    }
    
    // Age validation (optional)
    if (formData.age !== null && (formData.age < 0 || formData.age > 120)) {
      errors.age = "Age must be between 0 and 120";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  useEffect(() => {
    const isFormValid = validateForm();
    setIsValid(isFormValid);
  }, [formData, validateForm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    let parsedValue: string | number | null = value;
    
    if (type === 'number') {
      parsedValue = value ? parseInt(value, 10) : null;
    }
    
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Validate file size
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setValidationErrors(prev => ({
          ...prev,
          avatar: "Image file is too large. Maximum size is 5MB."
        }));
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setValidationErrors(prev => ({
          ...prev,
          avatar: "Invalid file type. Please upload an image (JPEG, PNG, GIF, WEBP)."
        }));
        return;
      }
      
      setValidationErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.avatar;
        return newErrors;
      });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setShowCropDialog(true);
        // Reset crop position and scale when loading a new image
        setCropPosition({ x: 0, y: 0 });
        setCropScale(1);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({ ...prev, avatarFile: null }));
      setAvatarPreview(initialData.avatar_url || null);
    }
  };

  useEffect(() => {
    // Add keyboard event listeners for arrow keys when dialog is open
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showCropDialog) return;
      
      const moveStep = 10;
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setCropPosition(prev => ({ ...prev, y: prev.y + moveStep }));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setCropPosition(prev => ({ ...prev, y: prev.y - moveStep }));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setCropPosition(prev => ({ ...prev, x: prev.x + moveStep }));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setCropPosition(prev => ({ ...prev, x: prev.x - moveStep }));
          break;
        case '+':
        case '=':
          e.preventDefault();
          setCropScale(prev => Math.min(prev + 0.1, 3));
          break;
        case '-':
        case '_':
          e.preventDefault();
          setCropScale(prev => Math.max(prev - 0.1, 0.1));
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showCropDialog]);

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
    // Zoom in/out based on wheel direction
    const zoomDelta = e.deltaY > 0 ? -0.05 : 0.05;
    setCropScale(prev => Math.max(0.1, Math.min(3, prev + zoomDelta)));
  };

  const handleCropImage = () => {
    if (!originalImage) return;
    
    // Create a new image element from the original image
    const img = new Image();
    img.onload = () => {
      // Create a canvas to draw the cropped image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Set the canvas size to be a square (avatar-like)
      canvas.width = 400;
      canvas.height = 400;
      
      // Draw the image centered with the current scale and position
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(cropScale, cropScale);
      ctx.translate(cropPosition.x, cropPosition.y);
      
      // Calculate dimensions to center the image
      const imgWidth = img.width;
      const imgHeight = img.height;
      ctx.drawImage(img, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
      ctx.restore();
      
      // Get the cropped image as a data URL
      const croppedImageDataUrl = canvas.toDataURL('image/png');
      
      // Convert the data URL to a Blob
      fetch(croppedImageDataUrl)
        .then(res => res.blob())
        .then(blob => {
          // Create a File object from the Blob
          const file = new File([blob], 'avatar.png', { type: 'image/png' });
          
          // Update the form data with the cropped image
          setFormData(prev => ({ ...prev, avatarFile: file }));
          setAvatarPreview(croppedImageDataUrl);
          setShowCropDialog(false);
        });
    };
    img.src = originalImage;
  };

  const handleCancelCrop = () => {
    setShowCropDialog(false);
    setOriginalImage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid) {
      // Display validation errors
      return;
    }
    
    // Pass form data to parent component
    onSubmit(formData);
  };

  const getInitials = (name: string, username: string) => {
    if (name) {
      return name.charAt(0).toUpperCase();
    }
    if (username) {
      return username.charAt(0).toUpperCase();
    }
    return "U";
  };

  const genderOptions = ["Male", "Female", "Other", "Prefer not to say"];

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={avatarPreview || undefined} alt="Profile Picture" />
              <AvatarFallback className="text-lg">
                {getInitials(formData.name, formData.username)}
              </AvatarFallback>
            </Avatar>
            <label 
              htmlFor="avatar-upload" 
              className="absolute bottom-0 right-0 p-1 bg-primary text-white rounded-full cursor-pointer"
            >
              <Upload size={16} />
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              disabled={isSubmitting}
            />
          </div>
          <p className="text-xs text-gray-500">
            Click the icon to upload a profile picture
          </p>
          {validationErrors.avatar && (
            <p className="text-xs text-red-500 mt-1">{validationErrors.avatar}</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-500" />
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
            </div>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Your username"
              required
              disabled={isSubmitting}
              className={validationErrors.username ? "border-red-500" : ""}
            />
            {validationErrors.username && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.username}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-gray-500" />
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
            </div>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your email address"
              required
              disabled={isSubmitting}
              className={validationErrors.email ? "border-red-500" : ""}
            />
            {validationErrors.email ? (
              <p className="text-xs text-red-500 mt-1">{validationErrors.email}</p>
            ) : (
              <p className="text-xs text-gray-500">
                Changing your email will require verification
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-gray-500" />
              <label htmlFor="name" className="text-sm font-medium">
                Full Name
              </label>
            </div>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <label htmlFor="age" className="text-sm font-medium">
                  Age
                </label>
              </div>
              <Input
                id="age"
                name="age"
                type="number"
                value={formData.age !== null ? formData.age : ""}
                onChange={handleChange}
                placeholder="Your age"
                min={0}
                max={120}
                disabled={isSubmitting}
                className={validationErrors.age ? "border-red-500" : ""}
              />
              {validationErrors.age && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.age}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-gray-500" />
                <label htmlFor="gender" className="text-sm font-medium">
                  Gender
                </label>
              </div>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={isSubmitting}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              >
                <option value="">Select gender</option>
                {genderOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-gray-500" />
              <label htmlFor="phone_number" className="text-sm font-medium">
                Phone Number
              </label>
            </div>
            <Input
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="Your phone number"
              disabled={isSubmitting}
              className={validationErrors.phone_number ? "border-red-500" : ""}
            />
            {validationErrors.phone_number && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.phone_number}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-500" />
              <label htmlFor="address" className="text-sm font-medium">
                Address
              </label>
            </div>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Your address"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !isValid}
          className="w-full relative"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Saving...</span>
            </>
          ) : (
            "Save Profile"
          )}
        </Button>
      </form>

      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center mb-2">Adjust Profile Picture</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-4">
            <p className="text-sm text-center text-muted-foreground">
              Drag to position • Use mouse wheel or pinch to zoom
              <br />
              Arrow keys to move • + and - keys to zoom
            </p>
            
            <div 
              ref={cropContainerRef} 
              className="relative w-64 h-64 mx-auto bg-gray-100 dark:bg-gray-800 overflow-hidden rounded-full"
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
    </>
  );
};
