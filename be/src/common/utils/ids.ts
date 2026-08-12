import { BadRequestException } from '@nestjs/common';

/** Coerce route/query/body ids to positive integers for Prisma Int PKs. */
export function toId(value: string | number, field = 'id'): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw new BadRequestException({
      message: `Invalid ${field}`,
      error: { code: 'INVALID_ID', details: { field, value } },
    });
  }
  return n;
}

export function toIdOrNull(
  value: string | number | null | undefined,
  field = 'id',
): number | null {
  if (value === null || value === undefined || value === '') return null;
  return toId(value, field);
}
