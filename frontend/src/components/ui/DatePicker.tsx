import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
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

interface Props {
  placeholder?: string;
  value?: string;
  onChange?: (date: string) => void;
  min?: string;
}

export default function DatePicker({
  value,
  onChange,
  placeholder,
  min,
}: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  // Parse minimum date - ensure today is always allowed
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minDate = min ? new Date(min) : today;
  // Ensure minDate doesn't exceed today (allow today selection)
  const effectiveMinDate = minDate > today ? today : minDate;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant={"outline"}
            className={cn(
              "pl-3 text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            {value ? (
              format(value, "dd/MM/yyyy")
            ) : (
              <span>{placeholder || t("pick_a_date")}</span>
            )}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          <Calendar
            mode="single"
            selected={value ? new Date(value) : undefined}
            defaultMonth={value ? new Date(value) : undefined}
            onSelect={(date) => {
              if (!date) return;
              // call parent and then close the popover
              onChange?.(format(date, "yyyy-MM-dd"));
              setOpen(false);
            }}
            disabled={(date) =>
              date < effectiveMinDate || date < new Date("1900-01-01")
            }
            captionLayout="dropdown"
          />
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                onChange?.(format(today, "yyyy-MM-dd"));
                setOpen(false);
              }}
              className="flex-1"
            >
              {t("today")}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
