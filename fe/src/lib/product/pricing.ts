import { formatPrice } from "@/lib/utils/format";

/** Prisma Decimal sometimes leaks as `{ s, e, d }` when not stringified. */
function decimalObjectToNumber(value: object): number | null {
  const v = value as { s?: unknown; e?: unknown; d?: unknown; toString?: unknown };
  if (typeof v.toString === "function") {
    const asString = (v.toString as () => string).call(value);
    // Real Decimal#toString; skip Object.prototype "[object Object]".
    if (typeof asString === "string" && /^-?\d+(\.\d+)?$/.test(asString)) {
      const n = Number(asString);
      return Number.isFinite(n) ? n : null;
    }
  }
  if (typeof v.s === "number" && typeof v.e === "number" && Array.isArray(v.d) && v.d.length > 0) {
    try {
      // decimal.js stores coefficient chunks in base 1e7.
      const chunks = v.d as number[];
      let coeff = String(chunks[0]);
      for (let i = 1; i < chunks.length; i += 1) {
        coeff += String(chunks[i]).padStart(7, "0");
      }
      const exp = v.e - (coeff.length - 1);
      const n = Number(`${v.s < 0 ? "-" : ""}${coeff}e${exp}`);
      return Number.isFinite(n) ? n : null;
    } catch {
      return null;
    }
  }
  return null;
}

/** Parse money from API/cart string|number|Decimal-like. Rejects empty, NaN, and negative. */
export function parseMoney(
  value: string | number | null | undefined | object,
): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "object") {
    const fromObject = decimalObjectToNumber(value);
    if (fromObject === null || fromObject < 0) return null;
    return fromObject;
  }
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return amount;
}

/**
 * Effective sell price: use sale only when > 0 and strictly below list (when list exists).
 * Returns null when neither price is usable (including both zero).
 */
export function effectiveUnitPrice(
  salePrice: string | number | null | undefined | object,
  listPrice: string | number | null | undefined | object,
): number | null {
  const sale = parseMoney(salePrice);
  const list = parseMoney(listPrice);

  if (sale !== null && sale > 0) {
    if (list === null || sale < list) return sale;
  }
  if (list !== null && list > 0) return list;
  return null;
}

export function moneyToString(value: number | null): string | null {
  if (value === null) return null;
  return String(value);
}

export function formatMoneyOrContact(
  value: string | number | null | undefined,
  contactLabel = "Liên hệ",
): string {
  const amount = parseMoney(value);
  if (amount === null || amount <= 0) return contactLabel;
  return formatPrice(amount) ?? contactLabel;
}

export function lineTotal(
  unitPrice: string | number | null | undefined,
  quantity: number,
): number | null {
  const unit = parseMoney(unitPrice);
  if (unit === null || unit <= 0) return null;
  const qty = Math.max(0, Math.floor(quantity));
  return unit * qty;
}
