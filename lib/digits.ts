/**
 * Digits on the storefront: the shopper sees Persian, the backend gets English.
 *
 * - Typing: `installPersianDigitInputs` turns English digits typed or pasted into any
 *   text field into Persian ones (`PersianDigitInputs`, mounted in the root layout).
 *   The form code already reads Persian digits (`toEnglishDigits` before validating).
 * - Requests: the customer API proxy and the checkout action run every body and query
 *   through `toEnglishDigits` / `toEnglishDigitsDeep` / `englishDigitsInUrl`.
 *
 * A field that must keep Latin digits opts out with `data-latin-digits`; password,
 * e-mail, URL and number fields are left alone.
 */

const FA = '۰۱۲۳۴۵۶۷۸۹';
const NON_LATIN_DIGIT = /[۰-۹٠-٩]/;

export const toEnglishDigits = (str: string): string => {
  return str
    .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1728))
    .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1584));
};

/** English and Arabic-Indic digits written as Persian ones. */
export const toPersianDigits = (str: string): string =>
  str.replace(/[0-9]/g, (d) => FA[+d]).replace(/[٠-٩]/g, (d) => FA[d.charCodeAt(0) - 0x660]);

/** Every string inside a payload with its Persian / Arabic-Indic digits made English. */
export function toEnglishDigitsDeep<T>(value: T): T {
  if (typeof value === 'string') return (NON_LATIN_DIGIT.test(value) ? toEnglishDigits(value) : value) as T;
  if (Array.isArray(value)) return value.map(toEnglishDigitsDeep) as T;
  if (value !== null && typeof value === 'object') {
    const proto = Object.getPrototypeOf(value);
    if (proto !== Object.prototype && proto !== null) return value;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = toEnglishDigitsDeep(v);
    return out as T;
  }
  return value;
}

/** A URL (or query string) with its Persian / Arabic-Indic digits made English, raw or percent-encoded (`%DB%B1` = «۱»). */
export function englishDigitsInUrl(url: string): string {
  return toEnglishDigits(url)
    .replace(/%DB%B([0-9])/gi, '$1')
    .replace(/%D9%A([0-9])/gi, '$1');
}

/** Input types whose value is free text — the only ones whose digits are converted. */
const TEXT_TYPES = new Set(['text', 'search', 'tel', '']);

function isDigitField(el: EventTarget | null): el is HTMLInputElement | HTMLTextAreaElement {
  if (el instanceof HTMLTextAreaElement) return !el.hasAttribute('data-latin-digits');
  if (!(el instanceof HTMLInputElement)) return false;
  return TEXT_TYPES.has(el.getAttribute('type')?.toLowerCase() ?? '') && !el.hasAttribute('data-latin-digits');
}

/**
 * Sets a field's value so React still sees the change: the prototype setter skips
 * the tracker React keeps on the element, so its `onChange` reads the new value.
 */
function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value')?.set?.call(el, value);
}

/** Converts the field's digits in place, keeping the caret. Returns whether it changed. */
function persianizeField(el: HTMLInputElement | HTMLTextAreaElement): boolean {
  if (!/[0-9٠-٩]/.test(el.value)) return false;
  const { selectionStart, selectionEnd, selectionDirection } = el;
  // One digit for one digit: the caret stays where it was.
  setNativeValue(el, toPersianDigits(el.value));
  if (selectionStart != null && selectionEnd != null) {
    el.setSelectionRange(selectionStart, selectionEnd, selectionDirection ?? undefined);
  }
  return true;
}

/**
 * Makes digits typed or pasted into any text field Persian, page-wide. Listens on
 * `window` in the capture phase, so it runs before React's own listener on the root.
 * Returns the cleanup.
 */
export function installPersianDigitInputs(): () => void {
  const onInput = (e: Event) => {
    if ((e as InputEvent).isComposing || !isDigitField(e.target)) return;
    persianizeField(e.target);
  };
  // An input method may hand over its text only when the composition ends.
  const onCompositionEnd = (e: Event) => {
    if (isDigitField(e.target) && persianizeField(e.target)) {
      e.target.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };
  window.addEventListener('input', onInput, true);
  window.addEventListener('compositionend', onCompositionEnd, true);
  return () => {
    window.removeEventListener('input', onInput, true);
    window.removeEventListener('compositionend', onCompositionEnd, true);
  };
}
