
import { Input } from "@/components/ui/input";
import { Type } from "lucide-react";
import { useEffect, useState } from "react";

interface EventTitleFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
}

export const EventTitleField = ({ value, onChange, error, disabled = false }: EventTitleFieldProps) => {
  const [inputValue, setInputValue] = useState(value);
  const [isTyping, setIsTyping] = useState(false);
  
  // Update local state when prop value changes
  useEffect(() => {
    if (!isTyping) {
      setInputValue(value);
    }
  }, [value, isTyping]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsTyping(true);
    onChange(e);
  };
  
  // Reset typing state after user stops typing
  const handleBlur = () => {
    setIsTyping(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Type className="h-5 w-5 text-gray-500" />
        <label htmlFor="title" className="text-sm font-medium">
          Event Title
        </label>
      </div>
      <Input
        id="title"
        name="title"
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Enter event title"
        required
        disabled={disabled}
        className={error ? "border-red-500" : ""}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
