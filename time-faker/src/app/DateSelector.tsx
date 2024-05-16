import { getDate } from "date-fns/getDate";
import { getHours } from "date-fns/getHours";
import { getMinutes } from "date-fns/getMinutes";
import { getMonth } from "date-fns/getMonth";
import { getYear } from "date-fns/getYear";
import { setDate } from "date-fns/setDate";
import { setHours } from "date-fns/setHours";
import { setMinutes } from "date-fns/setMinutes";
import { setMonth } from "date-fns/setMonth";
import { setYear } from "date-fns/setYear";

export default function DateSelector({
  date,
  dateChanged,
  disabled,
}: { date: Date; dateChanged: (date: Date) => void; disabled?: boolean }) {
  return (
    <div className="flex flex-row gap-2">
      <input
        type="number"
        className="w-20"
        value={getYear(date)}
        disabled={disabled}
        placeholder="year"
        onChange={(e) => {
          dateChanged(setYear(date, parseInt(e.target.value)));
        }}
      />
      <span>-</span>
      <input
        type="number"
        className="w-10"
        value={getMonth(date)}
        disabled={disabled}
        placeholder="month"
        onChange={(e) => {
          dateChanged(setMonth(date, parseInt(e.target.value)));
        }}
      />
      <span>-</span>
      <input
        type="number"
        className="w-10"
        value={getDate(date)}
        disabled={disabled}
        placeholder="day"
        onChange={(e) => {
          dateChanged(setDate(date, parseInt(e.target.value)));
        }}
      />

      <div className="w-4">&nbsp;</div>

      <input
        type="number"
        className="w-10"
        value={getHours(date)}
        disabled={disabled}
        placeholder="hours"
        onChange={(e) => {
          dateChanged(setHours(date, parseInt(e.target.value)));
        }}
      />
      <span>:</span>
      <input
        type="number"
        className="w-10"
        value={getMinutes(date)}
        disabled={disabled}
        placeholder="minutes"
        onChange={(e) => {
          dateChanged(setMinutes(date, parseInt(e.target.value)));
        }}
      />
    </div>
  );
}
