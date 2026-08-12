import { Injectable } from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';
import { toCamel } from '../../common/utils/case';
import { buildMeta, parseSort } from '../../common/utils/pagination';
import { AuditRepository } from './audit.repository';

@Injectable()
export class AuditService {
  constructor(private readonly auditRepository: AuditRepository) {}

  async log(input: {
    actorId?: number | null;
    action: AuditAction;
    entityType: string;
    entityId?: number | null;
    ip?: string | null;
    userAgent?: string | null;
    metadata?: Prisma.InputJsonValue;
  }) {
    try {
      await this.auditRepository.create({
        actor_id: input.actorId,
        action: input.action,
        entity_type: input.entityType,
        entity_id: input.entityId,
        ip_address: input.ip,
        user_agent: input.userAgent,
        metadata: input.metadata,
      });
    } catch {
      // never block main flow on audit failure
    }
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    sort?: string;
    action?: AuditAction;
    entityType?: string;
  }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.AuditLogWhereInput = {
      deleted_at: null,
      ...(query.action ? { action: query.action } : {}),
      ...(query.entityType ? { entity_type: query.entityType } : {}),
    };
    const orderBy = parseSort(query.sort, ['created_at', 'action'], {
      field: 'created_at',
      direction: 'desc',
    });
    const { items, total } = await this.auditRepository.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where,
      orderBy,
    });
    return toCamel({ items, meta: buildMeta(page, limit, total) });
  }
}
