import React, { useState, useEffect } from "react";
import { Clock, Plus, Edit3, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { DayOfWeek } from "@/Models/Common";
import { useTranslation } from "react-i18next";
import Field from "./ui/Field";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { getTimeZoneOptions } from "@/lib/date";

interface TimeSlot {
  id: number;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
}

export interface AvailabilityData {
  [key: string]: TimeSlot[];
}

interface Props {
  onNext: (data: {
    availabilities: AvailabilityData;
    timezone: string;
  }) => void;
  onPrevious: () => void;
}

const FormAvailability: React.FC<Props> = ({ onNext, onPrevious }) => {
  const { t } = useTranslation();
  const [availabilities, setAvailabilities] = useState<AvailabilityData>({
    monday: [
      { id: 1, day_of_week: "monday", start_time: "09:00", end_time: "17:00" },
    ],
    tuesday: [
      {
        id: 2,
        day_of_week: "tuesday",
        start_time: "09:00",
        end_time: "17:00",
      },
    ],
    wednesday: [
      {
        id: 3,
        day_of_week: "wednesday",
        start_time: "09:00",
        end_time: "17:00",
      },
    ],
    thursday: [
      {
        id: 4,
        day_of_week: "thursday",
        start_time: "09:00",
        end_time: "17:00",
      },
    ],
    friday: [
      { id: 5, day_of_week: "friday", start_time: "09:00", end_time: "17:00" },
    ],
    saturday: [
      {
        id: 6,
        day_of_week: "saturday",
        start_time: "09:00",
        end_time: "17:00",
      },
    ],
    sunday: [
      { id: 7, day_of_week: "sunday", start_time: "09:00", end_time: "17:00" },
    ],
  });
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState<DayOfWeek | null>(null);
  const [selectedTimezone, setSelectedTimezone] = useState<string>("");

  // Set default timezone to user's current timezone
  useEffect(() => {
    const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setSelectedTimezone(currentTimezone);
  }, []);

  const daysOfWeek: DayOfWeek[] = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const timeOptions: string[] = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0");
    return `${hour}:00`;
  });

  const generateId = (): number => {
    const allSlots = Object.values(availabilities).flat();
    const maxId =
      allSlots.length > 0 ? Math.max(...allSlots.map((slot) => slot.id)) : 0;
    return maxId + 1;
  };

  const checkTimeOverlap = (
    day: DayOfWeek,
    startTime: string,
    endTime: string,
    excludeId?: number
  ): boolean => {
    const daySlots = availabilities[day] || [];
    return daySlots.some((slot) => {
      if (excludeId && slot.id === excludeId) return false;
      return slot.start_time < endTime && slot.end_time > startTime;
    });
  };

  // unified add handler accepting slot-like data
  const handleAddSlot = (slotData: {
    day_of_week: DayOfWeek;
    start_time: string;
    end_time: string;
  }): void => {
    const { day_of_week, start_time, end_time } = slotData;

    if (start_time >= end_time) {
      toast.error("End time must be after start time");
      return;
    }

    if (checkTimeOverlap(day_of_week, start_time, end_time)) {
      toast("This time slot overlaps with an existing availability");
      return;
    }

    const newTimeSlot: TimeSlot = {
      id: generateId(),
      day_of_week,
      start_time,
      end_time,
    };

    const daySlots = availabilities[day_of_week] || [];
    setAvailabilities({
      ...availabilities,
      [day_of_week]: [...daySlots, newTimeSlot].sort((a, b) =>
        a.start_time.localeCompare(b.start_time)
      ),
    });

    setShowAddForm(null);
  };

  const handleUpdateSlot = (updatedSlot: TimeSlot): void => {
    if (updatedSlot.start_time >= updatedSlot.end_time) {
      toast("End time must be after start time");
      return;
    }

    if (
      checkTimeOverlap(
        updatedSlot.day_of_week,
        updatedSlot.start_time,
        updatedSlot.end_time,
        updatedSlot.id
      )
    ) {
      toast("This time slot overlaps with an existing availability");
      return;
    }

    const updatedAvailabilities = { ...availabilities };

    // Remove from old day if day changed
    Object.keys(updatedAvailabilities).forEach((day) => {
      updatedAvailabilities[day] = updatedAvailabilities[day].filter(
        (slot) => slot.id !== updatedSlot.id
      );
      if (updatedAvailabilities[day].length === 0) {
        delete updatedAvailabilities[day];
      }
    });

    // Add to new/current day
    const daySlots = updatedAvailabilities[updatedSlot.day_of_week] || [];
    updatedAvailabilities[updatedSlot.day_of_week] = [
      ...daySlots,
      updatedSlot,
    ].sort((a, b) => a.start_time.localeCompare(b.start_time));

    setAvailabilities(updatedAvailabilities);
    setEditingSlot(null);
  };

  const handleDeleteSlot = (slotId: number, day: DayOfWeek): void => {
    if (!confirm("Are you sure you want to delete this time slot?")) return;

    const updatedAvailabilities = { ...availabilities };
    updatedAvailabilities[day] = updatedAvailabilities[day].filter(
      (slot) => slot.id !== slotId
    );

    if (updatedAvailabilities[day].length === 0) {
      delete updatedAvailabilities[day];
    }

    setAvailabilities(updatedAvailabilities);
  };

  interface SlotFormProps {
    day?: DayOfWeek; // default day when adding
    initialSlot?: TimeSlot; // present when editing
    onSave: (data: {
      id?: number;
      day_of_week: DayOfWeek;
      start_time: string;
      end_time: string;
    }) => void;
    onCancel: () => void;
  }

  const SlotForm: React.FC<SlotFormProps> = ({
    day,
    initialSlot,
    onSave,
    onCancel,
  }) => {
    type FormValues = {
      id?: number;
      day_of_week: DayOfWeek;
      start_time: string;
      end_time: string;
    };

    const form = useForm<FormValues>({
      defaultValues: {
        id: initialSlot?.id,
        day_of_week: initialSlot?.day_of_week || (day as DayOfWeek),
        start_time: initialSlot?.start_time || "09:00",
        end_time: initialSlot?.end_time || "17:00",
      },
    });

    const onSubmit = (vals: FormValues) => {
      onSave(vals);
    };

    return (
      <div
        className={
          initialSlot
            ? "bg-gray-50 p-4 rounded-lg border-2 border-blue-200 mb-3"
            : "bg-green-50 p-4 rounded-lg border-2 border-green-200 mb-3"
        }
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Field
                  type="select"
                  control={form.control}
                  name="start_time"
                  label="Start Time"
                  options={timeOptions.map((time) => ({
                    label: time,
                    value: time,
                  }))}
                />
                <Field
                  type="select"
                  control={form.control}
                  name="end_time"
                  label="End Time"
                  options={timeOptions.map((time) => ({
                    label: time,
                    value: time,
                  }))}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <Button
                type="submit"
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors text-sm ${
                  initialSlot
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                <Save size={14} />
                {initialSlot ? t("save") : t("add")}
              </Button>
              <Button
                type="button"
                onClick={onCancel}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
              >
                <X size={14} />
                {t("cancel")}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 gap-6">
        <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("select_tz")} />
          </SelectTrigger>
          <SelectContent>
            {getTimeZoneOptions().map((tz) => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {daysOfWeek.map((day) => (
          <div key={day} className="bg-white rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Clock size={20} />
                {t(day)}
              </h3>
              <Button
                variant="outline"
                onClick={() => setShowAddForm(showAddForm === day ? null : day)}
                title="Add time slot"
              >
                <Plus size={16} />
                Add
              </Button>
            </div>

            {showAddForm === day && (
              <SlotForm
                day={day}
                onSave={(data) =>
                  handleAddSlot({
                    day_of_week: data.day_of_week,
                    start_time: data.start_time,
                    end_time: data.end_time,
                  })
                }
                onCancel={() => setShowAddForm(null)}
              />
            )}

            {availabilities[day] && availabilities[day].length > 0 ? (
              <div className="space-y-3">
                {availabilities[day].map((slot) => (
                  <div key={slot.id}>
                    {editingSlot === slot.id ? (
                      <SlotForm
                        initialSlot={slot}
                        onSave={(data) =>
                          handleUpdateSlot({
                            id: slot.id,
                            day_of_week: data.day_of_week,
                            start_time: data.start_time,
                            end_time: data.end_time,
                          })
                        }
                        onCancel={() => setEditingSlot(null)}
                      />
                    ) : (
                      <div className="p-3 rounded-lg border-2 border-blue-200 bg-blue-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-800">
                              {slot.start_time} - {slot.end_time}
                            </div>
                            <div className="text-sm text-blue-600">
                              Available
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              onClick={() => setEditingSlot(slot.id)}
                              title="Edit"
                            >
                              <Edit3 size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => handleDeleteSlot(slot.id, day)}
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-4">
                No availability set for this day
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Button variant="outline" onClick={() => onPrevious()}>
          {t("previous")}
        </Button>
        <Button
          onClick={() => onNext({ availabilities, timezone: selectedTimezone })}
        >
          {t("next")}
        </Button>
      </div>
    </div>
  );
};

export default FormAvailability;
