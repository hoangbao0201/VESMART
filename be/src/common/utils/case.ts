function snakeToCamelKey(key: string): string {
  return key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

/**
 * Prisma Decimal (decimal.js) often ships with a minified class name (`i`),
 * so never rely on `constructor.name === 'Decimal'`.
 * Detect via decimal.js shape: `{ s, e, d }` + `toFixed`/`toString`.
 */
function isDecimalLike(value: unknown): value is { toString: () => string } {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as {
    toFixed?: unknown;
    toString?: unknown;
    s?: unknown;
    e?: unknown;
    d?: unknown;
  };
  return (
    typeof v.toFixed === 'function' &&
    typeof v.toString === 'function' &&
    typeof v.s === 'number' &&
    typeof v.e === 'number' &&
    Array.isArray(v.d)
  );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  if (value instanceof Date) return false;
  if (isDecimalLike(value)) return false;
  return true;
}

function transformValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (value instanceof Date) return value.toISOString();
  if (isDecimalLike(value)) return value.toString();
  if (Array.isArray(value)) {
    return (value as unknown[]).map(transformValue);
  }
  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[snakeToCamelKey(k)] = transformValue(v);
    }
    return out;
  }
  return value;
}

/** Deep-convert Prisma snake_case records to API camelCase JSON. */
export function toCamel<T = unknown>(value: unknown): T {
  return transformValue(value) as T;
}
