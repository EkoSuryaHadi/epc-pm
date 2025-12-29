'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Download, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DashboardFiltersProps {
  categories: string[];
  onCategoryChange: (category: string) => void;
  onDateRangeChange: (from: Date | undefined, to: Date | undefined) => void;
  onExportPDF: () => void;
  onExportExcel: () => void;
  onReset: () => void;
}

export function DashboardFilters({
  categories,
  onCategoryChange,
  onDateRangeChange,
  onExportPDF,
  onExportExcel,
  onReset,
}: DashboardFiltersProps) {
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    onCategoryChange(value);
  };

  const handleDateFromChange = (date: Date | undefined) => {
    setDateFrom(date);
    onDateRangeChange(date, dateTo);
  };

  const handleDateToChange = (date: Date | undefined) => {
    setDateTo(date);
    onDateRangeChange(dateFrom, date);
  };

  const handleReset = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    setSelectedCategory('all');
    onReset();
  };

  const hasFilters = selectedCategory !== 'all' || dateFrom || dateTo;

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filters:</span>
      </div>

      {/* Category Filter */}
      <Select value={selectedCategory} onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date From */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-[180px] justify-start text-left font-normal',
              !dateFrom && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateFrom ? format(dateFrom, 'MMM dd, yyyy') : 'From date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={dateFrom}
            onSelect={handleDateFromChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Date To */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-[180px] justify-start text-left font-normal',
              !dateTo && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateTo ? format(dateTo, 'MMM dd, yyyy') : 'To date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={dateTo}
            onSelect={handleDateToChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Reset Button */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <X className="h-4 w-4 mr-2" />
          Reset
        </Button>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Export Buttons */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onExportExcel}>
          <Download className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
        <Button variant="outline" size="sm" onClick={onExportPDF}>
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
      </div>
    </div>
  );
}
