import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslation } from "react-i18next";

interface Props {
  options: { label: string; value: string }[];
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string) => void;
  className?: string;
}

export default function Combobox({
  options,
  placeholder,
  value,
  onChange,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | null>(
    value != null ? String(value).toLowerCase() : null
  );
  const { t } = useTranslation();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
        >
          {selectedValue
            ? options.find((option) => option.value === selectedValue)?.label
            : (placeholder ?? t("select_option"))}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command
          filter={(value, search) => {
            // Find the option by value
            const option = options.find((opt) => opt.value === value);
            if (!option) return 0;
            const label = option.label.toLowerCase();
            const val = option.value.toLowerCase();
            const s = search.toLowerCase();
            // Return 1 if label or value includes the search string, else 0
            return label.includes(s) || val.includes(s) ? 1 : 0;
          }}
        >
          <CommandInput placeholder={t("search")} className="h-9" />
          <CommandList>
            <CommandEmpty>{t("no_options")}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    const newValue =
                      currentValue === selectedValue ? "" : currentValue;
                    setSelectedValue(newValue);
                    onChange?.(newValue);
                    setOpen(false);
                  }}
                >
                  {option.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      selectedValue === option.value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
