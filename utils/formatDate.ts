import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale"; // Для русского языка

export function formatDate(dateInput: string | Date, short?: boolean): string {
  const date = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
  const dateFormat = short ? "HH:mm" : "d MMM, HH:mm";

  return format(date, dateFormat);
}
