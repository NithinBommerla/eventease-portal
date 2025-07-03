
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Globe, Lock } from "lucide-react";

interface EventVisibilityFieldProps {
  isPublic: boolean;
  onChange: (isPublic: boolean) => void;
  disabled?: boolean;
}

export const EventVisibilityField = ({
  isPublic,
  onChange,
  disabled = false
}: EventVisibilityFieldProps) => {
  return (
    <div className="space-y-2">
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="visibility-toggle">Event Visibility</Label>
        <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
          <div className="flex items-center gap-2">
            {isPublic ? (
              <Globe className="h-5 w-5 text-primary" />
            ) : (
              <Lock className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">{isPublic ? "Public Event" : "Private Event"}</p>
              <p className="text-sm text-muted-foreground">
                {isPublic 
                  ? "Anyone can discover and view this event" 
                  : "Only people with the link can view this event"}
              </p>
            </div>
          </div>
          <Switch
            id="visibility-toggle"
            checked={isPublic}
            onCheckedChange={onChange}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};
