
import { Input } from "@/components/ui/input";
import { Map, Link } from "lucide-react";

interface EventLocationFieldsProps {
  location: string;
  locationUrl: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  validateLocationUrl: (url: string) => boolean;
  locationError?: string;
  locationUrlError?: string;
  disabled?: boolean;
}

export const EventLocationFields = ({ 
  location, 
  locationUrl, 
  onChange,
  validateLocationUrl,
  locationError,
  locationUrlError,
  disabled = false
}: EventLocationFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Map className="h-5 w-5 text-gray-500" />
          <label htmlFor="location" className="text-sm font-medium">
            Venue Name/Description
          </label>
        </div>
        <Input
          id="location"
          name="location"
          value={location}
          onChange={onChange}
          placeholder="E.g., Central Park, Main Street Community Center"
          required
          disabled={disabled}
          className={locationError ? "border-red-500" : ""}
        />
        {locationError && <p className="text-xs text-red-500">{locationError}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Link className="h-5 w-5 text-gray-500" />
          <label htmlFor="location_url" className="text-sm font-medium">
            Google Maps Link
          </label>
        </div>
        <Input
          id="location_url"
          name="location_url"
          value={locationUrl}
          onChange={onChange}
          placeholder="Paste Google Maps link here"
          required
          disabled={disabled}
          className={locationUrlError ? "border-red-500" : ""}
        />
        {locationUrlError && <p className="text-xs text-red-500">{locationUrlError}</p>}
        <p className="text-xs text-gray-500">
          Open Google Maps, find your location, click "Share" and copy the link
        </p>
      </div>
    </>
  );
};
