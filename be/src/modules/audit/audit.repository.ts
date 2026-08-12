import { Injectable } from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    actor_id?: number | null;
    action: AuditAction;
    entity_type: string;
    entity_id?: number | null;
    ip_address?: string | null;
    user_agent?: string | null;
    metadata?: Prisma.InputJsonValue;
  }) {
    return this.prisma.auditLog.create({ data });
  }

  async findMany(params: {
    skip: number;
    take: number;
    where?: Prisma.AuditLogWhereInput;
    orderBy?: Prisma.AuditLogOrderByWithRelationInput;
  }) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        ...params,
        include: {
          actor: {
            select: { id: true, username: true, email: true, role: true },
          },
        },
      }),
      this.prisma.auditLog.count({ where: params.where }),
    ]);
    return { items, total };
  }
}
