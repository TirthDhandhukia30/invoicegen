"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  className,
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          initialFocus
          classNames={{
            day_selected:
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
            day_today: "bg-accent text-accent-foreground",
            day: "hover:bg-accent hover:text-accent-foreground",
            head_cell: "text-muted-foreground",
            nav_button: "hover:bg-accent hover:text-accent-foreground",
            caption_label: "text-foreground",
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
