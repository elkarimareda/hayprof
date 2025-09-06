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
  onChange?: (datetime: string) => void;
  min?: string;
}

export default function DateTimePicker({
  value,
  onChange,
  placeholder,
  min,
}: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  // Parse the datetime value
  const dateValue = value ? new Date(value) : undefined;
  const timeValue = value ? format(new Date(value), "HH:mm") : "";

  // Parse min datetime
  const minDate = min ? new Date(min) : new Date();

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    // Keep existing time or use default
    const currentTime = timeValue || "09:00";
    const [hours, minutes] = currentTime.split(":").map(Number);

    const newDateTime = new Date(date);
    newDateTime.setHours(hours, minutes, 0, 0);

    onChange?.(newDateTime.toISOString().slice(0, 16));
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = event.target.value;
    if (!timeValue) return;

    const currentDate = dateValue || new Date();
    const [hours, minutes] = timeValue.split(":").map(Number);

    const newDateTime = new Date(currentDate);
    newDateTime.setHours(hours, minutes, 0, 0);

    onChange?.(newDateTime.toISOString().slice(0, 16));
  };

  return (
    <div className="space-y-2">
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
              {value ? (
                <div className="flex items-center justify-between w-full">
                  <span>{format(new Date(value), "dd/MM/yyyy HH:mm")}</span>
                </div>
              ) : (
                <span>{placeholder || t("pick_date_time")}</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4 space-y-4">
            <Calendar
              mode="single"
              selected={dateValue}
              defaultMonth={dateValue}
              onSelect={handleDateSelect}
              disabled={(date) => date < minDate}
              captionLayout="dropdown"
            />
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
            <Button onClick={() => setOpen(false)} className="w-full" size="sm">
              {t("done")}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
