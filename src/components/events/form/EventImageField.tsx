
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, FileVideo } from "lucide-react";
import { useState } from "react";

interface EventImageFieldProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imagePreview: string | null;
  required: boolean;
  error?: string;
  disabled?: boolean;
}

export const EventImageField = ({ onChange, imagePreview, required, error, disabled = false }: EventImageFieldProps) => {
  const [fileTypeError, setFileTypeError] = useState<string | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Check file size - 50MB limit
      if (file.size > 50 * 1024 * 1024) {
        setFileTypeError("File size exceeds 50MB limit");
        e.target.value = '';
        return;
      }
      
      // Check file type
      const validTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 
        'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'
      ];
      
      if (!validTypes.includes(file.type)) {
        setFileTypeError("Invalid file type. Please upload an image (JPEG, PNG, GIF, WEBP) or video (MP4, MOV, AVI, WEBM)");
        e.target.value = '';
        return;
      }
      
      setFileTypeError(null);
      onChange(e);
    }
  };

  const isVideo = imagePreview?.match(/\.(mp4|mov|avi|webm)(\?|$)/i) || 
                  (imagePreview && (
                    imagePreview.includes('video/mp4') || 
                    imagePreview.includes('video/quicktime') || 
                    imagePreview.includes('video/x-msvideo') || 
                    imagePreview.includes('video/webm')
                  ));

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {isVideo ? 
          <FileVideo className="h-5 w-5 text-gray-500" /> : 
          <ImageIcon className="h-5 w-5 text-gray-500" />
        }
        <label htmlFor="imageFile" className="text-sm font-medium">
          Event Media
        </label>
      </div>
      <div className="flex flex-col gap-4">
        <Input
          id="imageFile"
          name="imageFile"
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className={`flex h-10 w-full cursor-pointer ${error || fileTypeError ? "border-red-500" : ""}`}
          required={required}
          disabled={disabled}
        />
        
        {imagePreview && (
          <div className="relative aspect-video w-full max-w-md mx-auto border rounded-md overflow-hidden">
            {isVideo ? (
              <video 
                src={imagePreview}
                controls
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
            )}
          </div>
        )}
      </div>
      {fileTypeError ? (
        <p className="text-xs text-red-500">{fileTypeError}</p>
      ) : error ? (
        <p className="text-xs text-red-500">{error}</p>
      ) : (
        <p className="text-xs text-gray-500">
          Upload media for your event (Image: PNG, JPG, WEBP, GIF or Video: MP4, MOV, WEBM) - Max size: 50MB
        </p>
      )}
    </div>
  );
};
