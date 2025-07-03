
import { Select } from "@/components/ui/select";
import { Globe } from "lucide-react";
import { countries } from "@/data/countries";

interface EventCountryFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  disabled?: boolean;
}

export const EventCountryField = ({ value, onChange, error, disabled = false }: EventCountryFieldProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Globe className="h-5 w-5 text-gray-500" />
        <label htmlFor="country" className="text-sm font-medium">
          Country
        </label>
      </div>
      <select
        id="country"
        name="country"
        value={value}
        onChange={onChange}
        className={`flex h-10 w-full rounded-md border ${error ? "border-red-500" : "border-input"} bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm`}
        required
        disabled={disabled}
      >
        <option value="">Select a country</option>
        {countries.map((country) => (
          <option key={country.code} value={country.code}>
            {country.name}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
