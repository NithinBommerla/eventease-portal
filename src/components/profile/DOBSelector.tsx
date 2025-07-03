
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon } from "lucide-react";

interface DOBSelectorProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  disabled?: boolean;
}

export function DOBSelector({ value, onChange, disabled = false }: DOBSelectorProps) {
  const [day, setDay] = useState<string>(value ? value.getDate().toString() : "");
  const [month, setMonth] = useState<string>(value ? (value.getMonth() + 1).toString() : "");
  const [year, setYear] = useState<string>(value ? value.getFullYear().toString() : "");

  // Generate arrays for days, months, and years
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  
  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" }
  ];
  
  // Generate years from 1900 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1900 + 1 }, 
    (_, i) => (currentYear - i).toString()
  );

  // Update the date when day, month, or year changes
  useEffect(() => {
    if (day && month && year) {
      const selectedDay = parseInt(day, 10);
      const selectedMonth = parseInt(month, 10) - 1; // JavaScript months are 0-indexed
      const selectedYear = parseInt(year, 10);
      
      // Check if the date is valid
      const date = new Date(selectedYear, selectedMonth, selectedDay);
      if (
        date.getFullYear() === selectedYear &&
        date.getMonth() === selectedMonth &&
        date.getDate() === selectedDay
      ) {
        onChange(date);
      } else {
        // If date is invalid (e.g., February 30), don't update
        console.log("Invalid date selected");
      }
    } else {
      // If any component is missing, set value to null
      onChange(null);
    }
  }, [day, month, year, onChange]);

  // Update component state when value changes
  useEffect(() => {
    if (value) {
      setDay(value.getDate().toString());
      setMonth((value.getMonth() + 1).toString());
      setYear(value.getFullYear().toString());
    } else {
      setDay("");
      setMonth("");
      setYear("");
    }
  }, [value]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <CalendarIcon className="h-4 w-4 text-gray-500" />
        <Label className="text-sm font-medium">Date of Birth</Label>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Select
            value={day}
            onValueChange={setDay}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Day" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day-placeholder">Day</SelectItem>
              {days.map((d) => (
                <SelectItem key={`day-${d}`} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select
            value={month}
            onValueChange={setMonth}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month-placeholder">Month</SelectItem>
              {months.map((m) => (
                <SelectItem key={`month-${m.value}`} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select
            value={year}
            onValueChange={setYear}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              <SelectItem value="year-placeholder">Year</SelectItem>
              {years.map((y) => (
                <SelectItem key={`year-${y}`} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
