
import { useState } from "react";
import { Search, Filter, X, Calendar, SortAsc, SortDesc } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

interface SearchFilters {
  query: string;
  type: string;
  dateRange: { from?: Date; to?: Date };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  
}

interface AdvancedSearchProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  totalResults: number;
}

const AdvancedSearch = ({ filters, onFiltersChange, totalResults }: AdvancedSearchProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    filters.dateRange.from || filters.dateRange.to 
      ? { from: filters.dateRange.from, to: filters.dateRange.to }
      : undefined
  );

  const updateFilter = (key: keyof SearchFilters, value: unknown) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      query: '',
      type: 'all',
      dateRange: {},
      sortBy: 'created_at',
      sortOrder: 'desc',
      
    });
    setDateRange(undefined);
  };

  const activeFiltersCount = [
    filters.type !== 'all',
    filters.dateRange.from || filters.dateRange.to,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search QR codes by name or content..."
            value={filters.query}
            onChange={(e) => updateFilter('query', e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Advanced Filters</h3>
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              <X className="h-3.5 w-3.5 mr-1" />
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Type Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Type</label>
              <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="url">URL</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="wifi">WiFi</SelectItem>
                  <SelectItem value="contact">Contact</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="bitcoin">Bitcoin</SelectItem>
                  <SelectItem value="dynamic">Dynamic</SelectItem>
                  <SelectItem value="barcode">Barcode</SelectItem>
                </SelectContent>
              </Select>
            </div>


            {/* Sort By */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Sort By</label>
              <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date Created</SelectItem>
                  <SelectItem value="updated_at">Date Updated</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Order</label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                className="w-full h-8 justify-start"
              >
                {filters.sortOrder === 'asc' ? (
                  <SortAsc className="h-3.5 w-3.5 mr-2" />
                ) : (
                  <SortDesc className="h-3.5 w-3.5 mr-2" />
                )}
                {filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </Button>
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Date Range</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-8 justify-start text-left font-normal"
                >
                  <Calendar className="mr-2 h-3.5 w-3.5" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    "Pick a date range"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(range) => {
                    setDateRange(range);
                    updateFilter('dateRange', range ? { from: range.from, to: range.to } : {});
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{totalResults} result{totalResults !== 1 ? 's' : ''} found</span>
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearch;
