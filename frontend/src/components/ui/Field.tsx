import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type {
  Control,
  ControllerRenderProps,
  FieldError,
  FieldErrorsImpl,
  FieldValues,
  Merge,
  Path,
} from "react-hook-form";
import Combobox from "@/components/ui/Combobox";
import FieldSelect from "@/components/ui/FieldSelect";
import DatePicker from "@/components/ui/DatePicker";
import DateTimePicker from "@/components/ui/DateTimePicker";
import Dropzone from "@/components/ui/dropzone";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

type FieldType =
  | "string"
  | "number"
  | "date"
  | "datetime"
  | "select"
  | "text"
  | "textarea"
  | "password"
  | "combobox"
  | "file"
  | "email"
  | "time"
  | "tel";

interface Props<T extends FieldValues> {
  control: Control<T>; // react-hook-form control
  name: Path<T>; // name of the field in the form
  label: string;
  options?: { label: string; value: string }[]; // Optional, for select type
  error?: Merge<FieldError, FieldErrorsImpl<object>>;
  type?: FieldType; // Optional, defaults to "text",
  description?: string; // Optional, for additional information
  accept?: string; // Optional, for file input types
  maxFiles?: number; // Optional, for dropzone max files
  maxSize?: number; // Optional, for dropzone max file size
  min?: string; // Optional, for date/datetime minimum value or number minimum
  max?: string; // Optional, for date/datetime maximum value or number maximum
}

function Field<T extends FieldValues>({
  control,
  label,
  type = "text",
  description,
  error,
  options = [],
  name,
  accept,
  maxFiles = 1,
  maxSize = 5 * 1024 * 1024, // 5MB default
  min,
  max,
}: Props<T>) {
  const input = (field: ControllerRenderProps<T, Path<T>>) => {
    switch (type) {
      case "date":
        return <DatePicker {...field} min={min} />;
      case "datetime":
        return <DateTimePicker {...field} min={min} />;
      case "textarea":
        return (
          <Textarea
            {...field}
            className={cn(error && "border-red-400 focus-visible:ring-red-400")}
          />
        );
      case "combobox":
        return (
          <Combobox
            options={options}
            {...field}
            className={cn(error && "border-red-400 focus-visible:ring-red-400")}
          />
        );
      case "select":
        return (
          <FieldSelect
            options={options}
            {...field}
            className={cn(error && "border-red-400 focus-visible:ring-red-400")}
          />
        );
      case "file":
        return (
          <Dropzone
            onFilesChange={(files) => {
              return field.onChange(files);
            }}
            accept={accept ? { [accept]: [] } : undefined}
            value={field.value || []}
            maxFiles={maxFiles}
            maxSize={maxSize}
            className={cn(error && "border-red-400")}
          />
        );
      default:
        return (
          <Input
            type={type}
            autoComplete={type === "password" ? "new-password" : "off"}
            min={min}
            max={max}
            {...field}
            className={cn(error && "border-red-400 focus-visible:ring-red-400")}
          />
        );
        break;
    }
  };
  return (
    <>
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>{input(field)}</FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

export default Field;
