import { Injectable } from '@nestjs/common';
import { Prisma, ReactionType, TargetType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ReactionCreateInput) {
    return this.prisma.reaction.create({ data });
  }

  findOne(
    userId: number,
    targetType: TargetType,
    targetId: number,
    reactionType: ReactionType,
  ) {
    return this.prisma.reaction.findFirst({
      where: {
        user_id: userId,
        target_type: targetType,
        target_id: targetId,
        reaction_type: reactionType,
        deleted_at: null,
      },
    });
  }

  softDelete(id: number) {
    return this.prisma.reaction.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  groupSummary(targetType: TargetType, targetId: number) {
    return this.prisma.reaction.groupBy({
      by: ['reaction_type'],
      where: {
        target_type: targetType,
        target_id: targetId,
        deleted_at: null,
      },
      _count: { _all: true },
    });
  }

  findMany(params: {
    skip: number;
    take: number;
    where?: Prisma.ReactionWhereInput;
  }) {
    const where = { deleted_at: null, ...params.where };
    return this.prisma.reaction.findMany({
      skip: params.skip,
      take: params.take,
      where,
      orderBy: { created_at: 'desc' },
    });
  }
}
