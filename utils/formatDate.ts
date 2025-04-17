import { format, formatDistanceToNow } from "date-fns";
import { ru, enUS } from "date-fns/locale";

export function formatDate(dateInput: string | Date, short?: boolean, isDDMMYY?: boolean): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat("ru-RU", {
    year: short ? "2-digit" : "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatRelativeTime(dateInput: string | Date, lang: string = "ru"): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays <= 7) {
    return formatDistanceToNow(date, { addSuffix: true, locale: lang === "ru" ? ru : enUS });
  }

  return formatDate(date);
}
