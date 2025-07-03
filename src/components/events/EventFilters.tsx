import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Calendar, MapPin, Tag, X, Clock, Globe, ArrowUpDown, Eye, Users, Heart, Building } from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { format, addDays, endOfWeek, endOfMonth, isSaturday, isSunday } from "date-fns";
import { countries, Country } from "@/data/countries";

interface EventFiltersProps {
  categories: string[];
  cities: string[];
  countries: string[];
  onFilterChange: (filters: {
    category: string;
    city: string;
    country: string;
    dateFrom: string;
    dateTo: string;
    quickFilter: string;
    isOnline: string;
    sortBy: string;
  }) => void;
}

export const EventFilters = ({ categories, cities, countries: countryCodes, onFilterChange }: EventFiltersProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [quickFilter, setQuickFilter] = useState<string>("");
  const [isOnline, setIsOnline] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");
  const [filtersVisible, setFiltersVisible] = useState(false);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    applyFilters(value, selectedCity, selectedCountry, dateFrom, dateTo, "", isOnline, sortBy);
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    applyFilters(selectedCategory, value, selectedCountry, dateFrom, dateTo, "", isOnline, sortBy);
  };

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    applyFilters(selectedCategory, selectedCity, value, dateFrom, dateTo, "", isOnline, sortBy);
  };

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFrom(e.target.value);
    applyFilters(selectedCategory, selectedCity, selectedCountry, e.target.value, dateTo, "", isOnline, sortBy);
    setQuickFilter("");
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateTo(e.target.value);
    applyFilters(selectedCategory, selectedCity, selectedCountry, dateFrom, e.target.value, "", isOnline, sortBy);
    setQuickFilter("");
  };

  const handleQuickFilterChange = (value: string) => {
    setQuickFilter(value);
    
    const today = new Date();
    let fromDate = "";
    let toDate = "";
    
    switch (value) {
      case "today":
        fromDate = format(today, "yyyy-MM-dd");
        toDate = format(today, "yyyy-MM-dd");
        break;
      case "tomorrow":
        const tomorrow = addDays(today, 1);
        fromDate = format(tomorrow, "yyyy-MM-dd");
        toDate = format(tomorrow, "yyyy-MM-dd");
        break;
      case "this-week":
        fromDate = format(today, "yyyy-MM-dd");
        toDate = format(endOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
        break;
      case "this-weekend":
        let weekendStart = today;
        if (!isSaturday(today) && !isSunday(today)) {
          const daysUntilSaturday = 6 - today.getDay();
          weekendStart = addDays(today, daysUntilSaturday);
        }
        const weekendEnd = addDays(weekendStart, isSaturday(weekendStart) ? 1 : 0);
        fromDate = format(weekendStart, "yyyy-MM-dd");
        toDate = format(weekendEnd, "yyyy-MM-dd");
        break;
      case "this-month":
        fromDate = format(today, "yyyy-MM-dd");
        toDate = format(endOfMonth(today), "yyyy-MM-dd");
        break;
      case "month-end":
        const monthEnd = endOfMonth(today);
        const monthEndStart = addDays(monthEnd, -6);
        fromDate = format(monthEndStart, "yyyy-MM-dd");
        toDate = format(monthEnd, "yyyy-MM-dd");
        break;
      default:
        break;
    }
    
    setDateFrom(fromDate);
    setDateTo(toDate);
    
    applyFilters(selectedCategory, selectedCity, selectedCountry, fromDate, toDate, value, isOnline, sortBy);
  };

  const handleIsOnlineChange = (value: string) => {
    setIsOnline(value);
    applyFilters(selectedCategory, selectedCity, selectedCountry, dateFrom, dateTo, quickFilter, value, sortBy);
  };

  const handleSortByChange = (value: string) => {
    setSortBy(value);
    applyFilters(selectedCategory, selectedCity, selectedCountry, dateFrom, dateTo, quickFilter, isOnline, value);
  };

  const applyFilters = (
    category: string,
    city: string,
    country: string,
    from: string,
    to: string,
    quick: string,
    online: string,
    sort: string
  ) => {
    onFilterChange({
      category,
      city,
      country,
      dateFrom: from,
      dateTo: to,
      quickFilter: quick,
      isOnline: online,
      sortBy: sort
    });
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedCity("");
    setSelectedCountry("");
    setDateFrom("");
    setDateTo("");
    setQuickFilter("");
    setIsOnline("");
    setSortBy("");
    applyFilters("", "", "", "", "", "", "", "");
  };

  const anyFilterActive = selectedCategory || selectedCity || selectedCountry || dateFrom || dateTo || quickFilter || isOnline || sortBy;
  
  const getQuickFilterText = () => {
    switch (quickFilter) {
      case "today": return "Today";
      case "tomorrow": return "Tomorrow";
      case "this-week": return "This Week";
      case "this-weekend": return "This Weekend";
      case "this-month": return "This Month";
      case "month-end": return "Month End";
      default: return "";
    }
  };

  const getIsOnlineText = () => {
    switch (isOnline) {
      case "true": return "Online Events";
      case "false": return "In-Person Events";
      default: return "";
    }
  };

  const getSortByText = () => {
    switch (sortBy) {
      case "date-asc": return "Date: Old to New";
      case "date-desc": return "Date: New to Old";
      case "views-desc": return "Most Viewed";
      case "rsvps-desc": return "Most RSVPs";
      case "likes-desc": return "Most Liked";
      default: return "";
    }
  };

  const getCountryNameByCode = (code: string): string => {
    const country = countries.find(c => c.code === code);
    return country ? country.name : code;
  };

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2 items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFiltersVisible(!filtersVisible)}
          className="flex items-center gap-1"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <Clock className="h-4 w-4" />
              <span>{quickFilter ? getQuickFilterText() : "Quick Dates"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuRadioGroup
              value={quickFilter}
              onValueChange={handleQuickFilterChange}
            >
              <DropdownMenuRadioItem value="">All Dates</DropdownMenuRadioItem>
              <DropdownMenuSeparator />
              <DropdownMenuRadioItem value="today">Today</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="tomorrow">Tomorrow</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="this-week">This Week</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="this-weekend">This Weekend</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="this-month">This Month</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="month-end">Month End</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <Globe className="h-4 w-4" />
              <span>{isOnline ? getIsOnlineText() : "Event Type"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuRadioGroup
              value={isOnline}
              onValueChange={handleIsOnlineChange}
            >
              <DropdownMenuRadioItem value="">All Events</DropdownMenuRadioItem>
              <DropdownMenuSeparator />
              <DropdownMenuRadioItem value="true">Online Events</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="false">In-Person Events</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <ArrowUpDown className="h-4 w-4" />
              <span>{sortBy ? getSortByText() : "Sort By"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Sort Events</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={sortBy}
              onValueChange={handleSortByChange}
            >
              <DropdownMenuRadioItem value="">Default</DropdownMenuRadioItem>
              <DropdownMenuSeparator />
              <DropdownMenuRadioItem value="date-asc">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Date: Old to New</span>
                </div>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="date-desc">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Date: New to Old</span>
                </div>
              </DropdownMenuRadioItem>
              <DropdownMenuSeparator />
              <DropdownMenuRadioItem value="views-desc">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>Most Viewed</span>
                </div>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="rsvps-desc">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Most RSVPs</span>
                </div>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="likes-desc">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  <span>Most Liked</span>
                </div>
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {anyFilterActive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="flex items-center gap-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <X className="h-4 w-4" />
            <span>Clear Filters</span>
          </Button>
        )}

        {selectedCategory && (
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs">
            <Tag className="h-3 w-3" />
            <span>{selectedCategory}</span>
            <button
              onClick={() => handleCategoryChange("")}
              className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {selectedCity && (
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs">
            <MapPin className="h-3 w-3" />
            <span>{selectedCity}</span>
            <button
              onClick={() => handleCityChange("")}
              className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {selectedCountry && (
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs">
            <Building className="h-3 w-3" />
            <span>{getCountryNameByCode(selectedCountry)}</span>
            <button
              onClick={() => handleCountryChange("")}
              className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {quickFilter && (
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs">
            <Clock className="h-3 w-3" />
            <span>{getQuickFilterText()}</span>
            <button
              onClick={() => handleQuickFilterChange("")}
              className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {isOnline && (
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs">
            <Globe className="h-3 w-3" />
            <span>{getIsOnlineText()}</span>
            <button
              onClick={() => handleIsOnlineChange("")}
              className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {sortBy && (
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs">
            <ArrowUpDown className="h-3 w-3" />
            <span>{getSortByText()}</span>
            <button
              onClick={() => handleSortByChange("")}
              className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {(dateFrom || dateTo) && !quickFilter && (
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs">
            <Calendar className="h-3 w-3" />
            <span>
              {dateFrom ? dateFrom : "Any"} - {dateTo ? dateTo : "Any"}
            </span>
            <button
              onClick={() => {
                setDateFrom("");
                setDateTo("");
                applyFilters(selectedCategory, selectedCity, selectedCountry, "", "", "", isOnline, sortBy);
              }}
              className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {filtersVisible && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium flex items-center gap-1 text-gray-700 dark:text-gray-300">
                <Tag className="h-4 w-4" />
                Category
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedCategory || "All Categories"}
                    <span className="ml-2 opacity-70">▼</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuRadioGroup
                    value={selectedCategory}
                    onValueChange={handleCategoryChange}
                  >
                    <DropdownMenuRadioItem value="">All Categories</DropdownMenuRadioItem>
                    {categories.map((category) => (
                      <DropdownMenuRadioItem key={category} value={category}>
                        {category}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium flex items-center gap-1 text-gray-700 dark:text-gray-300">
                <Building className="h-4 w-4" />
                Country
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedCountry ? getCountryNameByCode(selectedCountry) : "All Countries"}
                    <span className="ml-2 opacity-70">▼</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 max-h-64 overflow-y-auto">
                  <DropdownMenuRadioGroup
                    value={selectedCountry}
                    onValueChange={handleCountryChange}
                  >
                    <DropdownMenuRadioItem value="">All Countries</DropdownMenuRadioItem>
                    {countryCodes.map((code) => (
                      <DropdownMenuRadioItem key={code} value={code}>
                        {getCountryNameByCode(code)}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium flex items-center gap-1 text-gray-700 dark:text-gray-300">
                <MapPin className="h-4 w-4" />
                City
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedCity || "All Cities"}
                    <span className="ml-2 opacity-70">▼</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 max-h-64 overflow-y-auto">
                  <DropdownMenuRadioGroup
                    value={selectedCity}
                    onValueChange={handleCityChange}
                  >
                    <DropdownMenuRadioItem value="">All Cities</DropdownMenuRadioItem>
                    {cities.map((city) => (
                      <DropdownMenuRadioItem key={city} value={city}>
                        {city}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium flex items-center gap-1 text-gray-700 dark:text-gray-300">
                <Calendar className="h-4 w-4" />
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={handleDateFromChange}
                    placeholder="From"
                    className="dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={handleDateToChange}
                    placeholder="To"
                    min={dateFrom}
                    className="dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
