import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

export function handlePrismaError(
  error: unknown,
  conflictMessage = 'Resource already exists',
): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      throw new ConflictException({
        message: conflictMessage,
        error: { code: 'CONFLICT', details: error.meta ?? null },
      });
    }
    if (error.code === 'P2025') {
      throw new NotFoundException({
        message: 'Record not found',
        error: { code: 'NOT_FOUND', details: error.meta ?? null },
      });
    }
    if (error.code === 'P2003') {
      throw new BadRequestException({
        message: 'Related record not found or restricted',
        error: { code: 'FK_CONSTRAINT', details: error.meta ?? null },
      });
    }
  }
  throw error;
}
