
import { useState } from "react";
import { Tag, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface EventCategoryFieldProps {
  categories: string[];
  onChange: (categories: string[]) => void;
  suggestions?: string[];
  error?: string;
  disabled?: boolean;
}

export const EventCategoryField = ({ 
  categories, 
  onChange,
  suggestions = ["Environment", "Education", "Charity", "Technology", "Health", "Arts", "Sports", "Community"],
  error,
  disabled = false
}: EventCategoryFieldProps) => {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addCategory();
    }
  };

  const addCategory = () => {
    const category = inputValue.trim();
    if (category && !categories.includes(category)) {
      const newCategories = [...categories, category];
      onChange(newCategories);
      setInputValue("");
    }
  };

  const removeCategory = (index: number) => {
    const newCategories = [...categories];
    newCategories.splice(index, 1);
    onChange(newCategories);
  };

  const addSuggestion = (suggestion: string) => {
    if (!categories.includes(suggestion)) {
      onChange([...categories, suggestion]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Tag className="h-5 w-5 text-gray-500" />
        <label htmlFor="category" className="text-sm font-medium">
          Categories
        </label>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-2">
        {categories.map((category, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1 py-1">
            {category}
            <button 
              type="button"
              onClick={() => removeCategory(index)}
              className="ml-1 hover:text-destructive"
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      
      <div className="flex gap-2">
        <Input
          id="category-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addCategory}
          placeholder="Add a category and press Enter"
          className={`flex-1 ${error ? "border-red-500" : ""}`}
          disabled={disabled}
        />
      </div>
      
      {categories.length === 0 && (
        <div className="mt-3">
          <p className="text-sm text-gray-500 mb-2">Suggested categories:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <Badge 
                key={suggestion} 
                variant="outline" 
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => addSuggestion(suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      <p className="text-xs text-gray-500 mt-2">
        Press Enter or comma to add a category. You can add multiple categories.
      </p>
      
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
