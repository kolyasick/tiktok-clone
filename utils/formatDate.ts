import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";

export function formatDate(dateInput: string | Date, short?: boolean, isDDMMYY?: boolean): string {
  const date = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;

  let dateFormat: string;

  if (isDDMMYY) {
    dateFormat = "dd.MM.yy"; // Формат ДД.ММ.ГГ
  } else if (short) {
    dateFormat = "HH:mm"; // Короткий формат (только время)
  } else {
    dateFormat = "d MMM, HH:mm"; // Полный формат (день, месяц, время)
  }

  return format(date, dateFormat, { locale: ru });
}
