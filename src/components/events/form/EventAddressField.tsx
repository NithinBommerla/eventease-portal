
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";

interface EventAddressFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
}

export const EventAddressField = ({ 
  value, 
  onChange,
  error,
  disabled = false
}: EventAddressFieldProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <MapPin className="h-5 w-5 text-gray-500" />
        <label htmlFor="address" className="text-sm font-medium">
          Detailed Address
        </label>
      </div>
      <Input
        id="address"
        name="address"
        value={value}
        onChange={onChange}
        placeholder="Enter the detailed address (e.g., 123 Main St, Suite 200)"
        disabled={disabled}
        className={error ? "border-red-500" : ""}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-xs text-gray-500">
        Provide a specific address for your venue to help attendees find the location easily
      </p>
    </div>
  );
};
