
import { Globe, MapPin } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface EventTypeFieldProps {
  isOnline: boolean;
  onChange: (isOnline: boolean) => void;
  disabled?: boolean;
}

export const EventTypeField = ({ isOnline, onChange, disabled = false }: EventTypeFieldProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-full ${!isOnline ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
            <MapPin className="h-5 w-5" />
          </div>
          <Label htmlFor="event-type" className="font-medium cursor-pointer">In-Person</Label>
        </div>
        
        <Switch
          id="event-type"
          checked={isOnline}
          onCheckedChange={onChange}
          disabled={disabled}
        />
        
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-full ${isOnline ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
            <Globe className="h-5 w-5" />
          </div>
          <Label htmlFor="event-type" className="font-medium cursor-pointer">Online</Label>
        </div>
      </div>
    </div>
  );
};
