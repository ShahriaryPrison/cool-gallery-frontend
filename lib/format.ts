const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

/** Converts ASCII digits in a value to Persian (Eastern Arabic-Indic) digits. */
export function toFaDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

/** Formats a Toman amount with thousands separators and Persian digits. */
export function formatToman(amount: number): string {
  return toFaDigits(Math.round(amount).toLocaleString("en-US"));
}
