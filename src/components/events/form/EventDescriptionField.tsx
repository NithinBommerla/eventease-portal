
import { FileText } from "lucide-react";

interface EventDescriptionFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  disabled?: boolean;
}

export const EventDescriptionField = ({ value, onChange, error, disabled = false }: EventDescriptionFieldProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-gray-500" />
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
      </div>
      <textarea
        id="description"
        name="description"
        value={value}
        onChange={onChange}
        placeholder="Describe your event"
        className={`flex w-full rounded-md border ${error ? "border-red-500" : "border-input"} bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm`}
        rows={5}
        required
        disabled={disabled}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
