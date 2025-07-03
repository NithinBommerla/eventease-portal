
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone } from "lucide-react";
import { Label } from "@/components/ui/label";
import { FormDescription } from "@/components/ui/form";

// List of country codes
const countryCodes = [
  { code: "+1", country: "US/Canada" },
  { code: "+44", country: "UK" },
  { code: "+91", country: "India" },
  { code: "+61", country: "Australia" },
  { code: "+33", country: "France" },
  { code: "+49", country: "Germany" },
  { code: "+81", country: "Japan" },
  { code: "+86", country: "China" },
  { code: "+7", country: "Russia" },
  { code: "+55", country: "Brazil" },
  { code: "+52", country: "Mexico" },
  { code: "+34", country: "Spain" },
  { code: "+39", country: "Italy" },
  { code: "+82", country: "South Korea" },
  { code: "+31", country: "Netherlands" },
  { code: "+65", country: "Singapore" },
  { code: "+64", country: "New Zealand" },
  { code: "+971", country: "UAE" },
  { code: "+27", country: "South Africa" },
  { code: "+20", country: "Egypt" }
];

interface PhoneInputProps {
  phoneNumber: string;
  countryCode: string;
  onPhoneNumberChange: (value: string) => void;
  onCountryCodeChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export function PhoneInput({
  phoneNumber,
  countryCode,
  onPhoneNumberChange,
  onCountryCodeChange,
  disabled = false,
  error
}: PhoneInputProps) {
  // Validate phone number to ensure it contains only digits
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits, limit to 10 characters
    if (/^\d*$/.test(value) && value.length <= 10) {
      onPhoneNumberChange(value);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Phone className="h-4 w-4 text-gray-500" />
        <Label className="text-sm font-medium">Phone Number</Label>
      </div>
      <div className="flex gap-2">
        <div className="w-1/3">
          <Select
            value={countryCode || "+1"}
            onValueChange={onCountryCodeChange}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Code" />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              {countryCodes.map((item) => (
                <SelectItem key={item.code} value={item.code}>
                  {item.code} ({item.country})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-2/3">
          <Input
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder="Phone number (10 digits)"
            disabled={disabled}
            className={error ? "border-red-500" : ""}
          />
        </div>
      </div>
      <FormDescription>
        Enter a 10-digit number without spaces or special characters
      </FormDescription>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
