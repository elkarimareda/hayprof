import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { FormControl } from "./form";
import { useState } from "react";
import { Input } from "./input";

interface Props {
  placeholder?: string;
  value?: string;
  onChange?: (date: string) => void;
  min?: string;
  max?: string;
  includeTime?: boolean; // New prop to determine if time should be included
}

export default function DatePicker({
  value,
  onChange,
  placeholder,
  min,
  max,
  includeTime = false,
}: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  // Parse minimum and maximum dates and normalize them to start of day
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minDate = min
    ? (() => {
        const date = new Date(min);
        date.setHours(0, 0, 0, 0);
        return date;
      })()
    : undefined;

  const maxDate = max
    ? (() => {
        const date = new Date(max);
        date.setHours(0, 0, 0, 0);
        return date;
      })()
    : undefined;

  // Parse the value for date-time mode
  const dateValue = value ? new Date(value) : undefined;
  const timeValue =
    value && includeTime ? format(new Date(value), "HH:mm") : "";

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    if (includeTime) {
      // Keep existing time or use default for datetime mode
      const currentTime = timeValue || "09:00";
      const [hours, minutes] = currentTime.split(":").map(Number);

      const newDateTime = new Date(date);
      newDateTime.setHours(hours, minutes, 0, 0);

      // Check if the new datetime is within bounds
      const isWithinBounds =
        (!minDate || newDateTime >= minDate) &&
        (!maxDate || newDateTime <= maxDate);

      if (isWithinBounds) {
        onChange?.(format(newDateTime, "yyyy-MM-dd'T'HH:mm"));
      }
    } else {
      // Date-only mode
      onChange?.(format(date, "yyyy-MM-dd"));
      setOpen(false);
    }
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!includeTime) return;

    const timeValue = event.target.value;
    if (!timeValue) return;

    const currentDate = dateValue || new Date();
    const [hours, minutes] = timeValue.split(":").map(Number);

    const newDateTime = new Date(currentDate);
    newDateTime.setHours(hours, minutes, 0, 0);

    // Check if the new datetime is within bounds
    const isWithinBounds =
      (!minDate || newDateTime >= minDate) &&
      (!maxDate || newDateTime <= maxDate);

    if (isWithinBounds) {
      onChange?.(format(newDateTime, "yyyy-MM-dd'T'HH:mm"));
    }
  };

  const getDisplayValue = () => {
    if (!value)
      return (
        placeholder || (includeTime ? t("pick_date_time") : t("pick_a_date"))
      );

    if (includeTime) {
      return format(new Date(value), "dd/MM/yyyy HH:mm");
    } else {
      return format(value, "dd/MM/yyyy");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant={"outline"}
            className={cn(
              "w-full pl-3 text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            {includeTime && value ? (
              <div className="flex items-center justify-between w-full">
                <span>{getDisplayValue()}</span>
              </div>
            ) : (
              <span>{getDisplayValue()}</span>
            )}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className={cn("p-3", includeTime && "p-4 space-y-4")}>
          <Calendar
            mode="single"
            selected={dateValue}
            defaultMonth={dateValue}
            onSelect={handleDateSelect}
            disabled={(date) => {
              // Normalize the date being checked to start of day
              const normalizedDate = new Date(date);
              normalizedDate.setHours(0, 0, 0, 0);

              const isBeforeMin = minDate ? normalizedDate < minDate : false;
              const isAfterMax = maxDate ? normalizedDate > maxDate : false;
              const isTooOld = normalizedDate < new Date("1900-01-01");

              return isBeforeMin || isAfterMax || isTooOld;
            }}
            captionLayout="dropdown"
          />

          {includeTime && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {t("time")}
              </label>
              <Input
                type="time"
                value={timeValue}
                onChange={handleTimeChange}
                className="w-full"
              />
            </div>
          )}

          <div className={cn("flex gap-2", includeTime ? "mt-4" : "mt-2")}>
            {includeTime ? (
              <Button
                onClick={() => setOpen(false)}
                className="w-full"
                size="sm"
              >
                {t("done")}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  onChange?.(format(today, "yyyy-MM-dd"));
                  setOpen(false);
                }}
                disabled={
                  (minDate ? today < minDate : false) ||
                  (maxDate ? today > maxDate : false)
                }
                className="flex-1"
              >
                {t("today")}
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
