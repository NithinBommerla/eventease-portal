
import { Input } from "@/components/ui/input";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface EventDateTimeFieldsProps {
  date: string;
  time: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDateChange: (date: Date | undefined) => void;
  dateError?: string | null;
  timeError?: string | null;
  disabled?: boolean;
}

export const EventDateTimeFields = ({ 
  date, 
  time, 
  onChange, 
  onDateChange,
  dateError,
  timeError,
  disabled = false
}: EventDateTimeFieldsProps) => {
  // Get today's date for min attribute
  const today = new Date();
  const formattedToday = format(today, "yyyy-MM-dd");
  
  // For the calendar
  const selectedDate = date ? new Date(date) : undefined;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <label htmlFor="date" className="text-sm font-medium">
            Date
          </label>
        </div>
        
        <div className="flex">
          <Input
            id="date"
            name="date"
            type="date"
            value={date}
            onChange={onChange}
            min={formattedToday}
            required
            disabled={disabled}
            className={cn(
              "rounded-r-none",
              dateError ? "border-red-500" : ""
            )}
          />
          
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline"
                className="rounded-l-none border-l-0"
                disabled={disabled}
              >
                <Calendar className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={onDateChange}
                disabled={(date) => date < today}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        {dateError && (
          <p className="text-sm text-red-500">{dateError}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-500" />
          <label htmlFor="time" className="text-sm font-medium">
            Time
          </label>
        </div>
        <Input
          id="time"
          name="time"
          type="time"
          value={time}
          onChange={onChange}
          required
          disabled={disabled}
          className={timeError ? "border-red-500" : ""}
        />
        {timeError && (
          <p className="text-sm text-red-500">{timeError}</p>
        )}
      </div>
    </div>
  );
};
