
import { Input } from "@/components/ui/input";
import { Link } from "lucide-react";

interface EventWebinarLinkFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
}

export const EventWebinarLinkField = ({ 
  value, 
  onChange, 
  error, 
  disabled = false 
}: EventWebinarLinkFieldProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Link className="h-5 w-5 text-gray-500" />
        <label htmlFor="webinar_link" className="text-sm font-medium">
          Webinar Link
        </label>
      </div>
      <Input
        id="webinar_link"
        name="webinar_link"
        value={value}
        onChange={onChange}
        placeholder="https://zoom.us/j/example"
        required
        disabled={disabled}
        className={error ? "border-red-500" : ""}
      />
      {error ? (
        <p className="text-xs text-red-500">{error}</p>
      ) : (
        <p className="text-xs text-gray-500">
          Add a link to your Zoom, Google Meet, or any other virtual meeting platform
        </p>
      )}
    </div>
  );
};
