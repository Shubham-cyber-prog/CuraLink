"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface DaySlot {
  date: string;
  slots: string[];
}

interface AvailabilitySlotPickerProps {
  availabilitySlots: DaySlot[];
}

export function AvailabilitySlotPicker({ availabilitySlots }: AvailabilitySlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    availabilitySlots.length > 0 ? availabilitySlots[0].date : ""
  );
  
  const [selectedTime, setSelectedTime] = useState<string>("");

  const activeDay = availabilitySlots.find((d) => d.date === selectedDate);

  if (availabilitySlots.length === 0) {
    return <p className="text-sm text-slate-500">No availability available.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {availabilitySlots.map((day) => (
          <Button
            key={day.date}
            variant={selectedDate === day.date ? "default" : "outline"}
            className={`shrink-0 ${
              selectedDate === day.date 
                ? "bg-teal-600 hover:bg-teal-700" 
                : "border-slate-200 text-slate-600"
            }`}
            onClick={() => {
              setSelectedDate(day.date);
              setSelectedTime(""); // Reset time when date changes
            }}
          >
            {day.date}
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
                ? "bg-teal-600 hover:bg-teal-700" 
                : "border-slate-200 text-slate-600"
            }
            onClick={() => setSelectedTime(time)}
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
