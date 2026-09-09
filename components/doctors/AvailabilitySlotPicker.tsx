"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DaySlot } from "@/types/doctor";

function formatDateLabel(dateStr: string) {
  try {
    if (!dateStr.includes("-")) return dateStr;
    const [y, m, d] = dateStr.split("-").map(Number);
    if (!y || !m || !d) return dateStr;
    const targetDate = new Date(y, m - 1, d);
    const today = new Date();
    const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const targetZero = new Date(y, m - 1, d);
    const diffDays = Math.round((targetZero.getTime() - todayZero.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    return targetDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

interface AvailabilitySlotPickerProps {
  availabilitySlots: DaySlot[];
  onSlotSelect?: (date: string, time: string) => void;
}

export function AvailabilitySlotPicker({ availabilitySlots, onSlotSelect }: AvailabilitySlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    availabilitySlots.length > 0 ? availabilitySlots[0].date : ""
  );
  
  const [selectedTime, setSelectedTime] = useState<string>("");

  const activeDay = availabilitySlots.find((d) => d.date === selectedDate);

  if (availabilitySlots.length === 0) {
    return <p className="text-sm text-slate-500">No availability available.</p>;
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (onSlotSelect) {
      onSlotSelect(selectedDate, time);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {availabilitySlots.map((day) => (
          <Button
            key={day.date}
            variant={selectedDate === day.date ? "default" : "outline"}
            className={`shrink-0 ${
              selectedDate === day.date 
                ? "bg-teal-600 hover:bg-teal-700 text-white" 
                : "border-slate-200 text-slate-600"
            }`}
            onClick={() => {
              setSelectedDate(day.date);
              setSelectedTime(""); // Reset time when date changes
              if (onSlotSelect) onSlotSelect(day.date, "");
            }}
          >
            {formatDateLabel(day.date)}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {activeDay?.slots.map((time) => (
          <Button
            key={time}
            variant={selectedTime === time ? "default" : "outline"}
            size="sm"
            className={
              selectedTime === time 
                ? "bg-teal-600 hover:bg-teal-700 text-white" 
                : "border-slate-200 text-slate-600"
            }
            onClick={() => handleTimeSelect(time)}
          >
            {time}
          </Button>
        ))}
      </div>
      
      {!activeDay?.slots.length && (
        <p className="text-sm text-slate-500">Fully booked on this day.</p>
      )}
    </div>
  );
}
