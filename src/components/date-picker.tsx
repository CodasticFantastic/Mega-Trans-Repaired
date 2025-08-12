"use client";

import * as React from "react";
import dayjs from "dayjs";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/helpers/shadcn/utils";
import { Button } from "@/components/shadcn/ui/button";
import { Calendar } from "@/components/shadcn/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/ui/popover";

interface DatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  label?: React.ReactNode;
  clearable?: boolean;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  className,
  disabled = false,
  label,
  clearable = true,
}: DatePickerProps) {
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDateChange?.(undefined);
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && (
        <div className="px-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </div>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            data-empty={!date}
            className={cn(
              "data-[empty=true]:text-muted-foreground w-full max-w-[280px] justify-start text-left font-normal relative",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1 truncate text-xs">
              {date
                ? dayjs(date).locale("pl").format("D MMMM YYYY")
                : placeholder}
            </span>
            {clearable && date && !disabled && (
              <div
                className="h-6 w-6 p-0 absolute right-1 flex items-center justify-center cursor-pointer rounded-sm hover:bg-muted transition-colors"
                onClick={handleClear}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleClear(e as any);
                  }
                }}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Clear date</span>
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onDateChange}
            lang="pl"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Eksport domyślny dla łatwiejszego importu
export default DatePicker;
