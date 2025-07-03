
import { Building2 } from "lucide-react";
import { useMemo } from "react";
import { cities } from "@/data/cities";

interface EventCityFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  disabled?: boolean;
  countryCode?: string;
}

export const EventCityField = ({ 
  value, 
  onChange, 
  error, 
  disabled = false,
  countryCode = ""
}: EventCityFieldProps) => {
  // Filter cities based on selected country or use a default list
  const citiesForCountry = useMemo(() => {
    if (!countryCode) return [];
    return cities[countryCode] || [];
  }, [countryCode]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Building2 className="h-5 w-5 text-gray-500" />
        <label htmlFor="city" className="text-sm font-medium">
          City
        </label>
      </div>
      <select
        id="city"
        name="city"
        value={value}
        onChange={onChange}
        className={`flex h-10 w-full rounded-md border ${error ? "border-red-500" : "border-input"} bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm`}
        required
        disabled={disabled || !countryCode}
      >
        <option value="">
          {!countryCode 
            ? "Select a country first" 
            : citiesForCountry.length > 0 
              ? "Select a city" 
              : "No cities available for this country"}
        </option>
        {citiesForCountry.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
