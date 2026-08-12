import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReactionType, TargetType } from '@prisma/client';
import { toCamel } from '../../common/utils/case';
import { handlePrismaError } from '../../common/utils/prisma-error';
import { CommentsService } from '../comments/comments.service';
import { ForumsService } from '../forums/forums.service';
import { ReactionsRepository } from './reactions.repository';

const REACTION_TARGETS = new Set<TargetType>([
  TargetType.FORUM_POST,
  TargetType.COMMENT,
]);

@Injectable()
export class ReactionsService {
  constructor(
    private readonly reactionsRepository: ReactionsRepository,
    private readonly forumsService: ForumsService,
    private readonly commentsService: CommentsService,
  ) {}

  private async assertTarget(targetType: TargetType, targetId: number) {
    if (!REACTION_TARGETS.has(targetType)) {
      throw new BadRequestException({
        message: 'Invalid targetType for reactions',
        error: { code: 'INVALID_TARGET_TYPE', details: null },
      });
    }
    const exists =
      targetType === TargetType.FORUM_POST
        ? await this.forumsService.forumPostExists(targetId)
        : await this.commentsService.exists(targetId);
    if (!exists) {
      throw new NotFoundException({
        message: 'Target not found',
        error: { code: 'TARGET_NOT_FOUND', details: null },
      });
    }
  }

  async create(
    userId: number,
    dto: {
      targetType: TargetType;
      targetId: number;
      reactionType: ReactionType;
    },
  ) {
    await this.assertTarget(dto.targetType, dto.targetId);
    const existing = await this.reactionsRepository.findOne(
      userId,
      dto.targetType,
      dto.targetId,
      dto.reactionType,
    );
    if (existing) return toCamel(existing);
    try {
      const reaction = await this.reactionsRepository.create({
        target_type: dto.targetType,
        target_id: dto.targetId,
        reaction_type: dto.reactionType,
        user: { connect: { id: userId } },
      });
      return toCamel(reaction);
    } catch (error) {
      handlePrismaError(error, 'Reaction already exists');
    }
  }

  async summary(targetType: TargetType, targetId: number) {
    const groups = await this.reactionsRepository.groupSummary(
      targetType,
      targetId,
    );
    return groups.map((g) => ({
      reactionType: g.reaction_type,
      count: g._count._all,
    }));
  }

  async list(targetType: TargetType, targetId: number) {
    const items = await this.reactionsRepository.findMany({
      skip: 0,
      take: 100,
      where: { target_type: targetType, target_id: targetId },
    });
    return toCamel({ items });
  }

  async remove(
    userId: number,
    targetType: TargetType,
    targetId: number,
    reactionType: ReactionType,
  ) {
    const existing = await this.reactionsRepository.findOne(
      userId,
      targetType,
      targetId,
      reactionType,
    );
    if (!existing) {
      throw new NotFoundException({
        message: 'Reaction not found',
        error: { code: 'REACTION_NOT_FOUND', details: null },
      });
    }
    await this.reactionsRepository.softDelete(existing.id);
    return null;
  }
}
