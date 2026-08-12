import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommentStatus, TargetType, UserRole } from '@prisma/client';
import { toCamel } from '../../common/utils/case';
import { buildMeta, parseSort } from '../../common/utils/pagination';
import { PostsService } from '../posts/posts.service';
import { ProductsService } from '../products/products.service';
import { CommentsRepository } from './comments.repository';
import {
  CreateCommentDto,
  ModerateCommentDto,
  QueryCommentDto,
} from './dto/comment.dto';

const COMMENT_TARGETS = new Set<TargetType>([
  TargetType.PRODUCT,
  TargetType.POST,
]);

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly productsService: ProductsService,
    private readonly postsService: PostsService,
  ) {}

  private async assertTarget(targetType: TargetType, targetId: number) {
    if (!COMMENT_TARGETS.has(targetType)) {
      throw new BadRequestException({
        message: 'Invalid targetType for comments',
        error: { code: 'INVALID_TARGET_TYPE', details: null },
      });
    }
    const exists =
      targetType === TargetType.PRODUCT
        ? await this.productsService.exists(targetId)
        : await this.postsService.exists(targetId);
    if (!exists) {
      throw new NotFoundException({
        message: 'Target not found',
        error: { code: 'TARGET_NOT_FOUND', details: null },
      });
    }
  }

  async create(userId: number, dto: CreateCommentDto) {
    await this.assertTarget(dto.targetType, dto.targetId);
    if (dto.parentId) {
      const parent = await this.commentsRepository.findById(dto.parentId);
      if (!parent) {
        throw new NotFoundException({
          message: 'Parent comment not found',
          error: { code: 'PARENT_NOT_FOUND', details: null },
        });
      }
    }
    const comment = await this.commentsRepository.create({
      content: dto.content,
      target_type: dto.targetType,
      target_id: dto.targetId,
      status: CommentStatus.APPROVED,
      user: { connect: { id: userId } },
      ...(dto.parentId
        ? { parent: { connect: { id: dto.parentId } } }
        : {}),
    });
    return toCamel(comment);
  }

  async findAll(query: QueryCommentDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const targetType = query.targetType ?? query.target_type;
    const targetId = query.targetId ?? query.target_id;
    const where = {
      ...(targetType ? { target_type: targetType } : {}),
      ...(targetId ? { target_id: targetId } : {}),
      ...(query.status ? { status: query.status } : {}),
      parent_id: null as number | null,
    };
    const orderBy = parseSort(query.sort, ['created_at'], {
      field: 'created_at',
      direction: 'asc',
    });
    const { items, total } = await this.commentsRepository.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where,
      orderBy,
    });
    return toCamel({ items, meta: buildMeta(page, limit, total) });
  }

  async moderate(id: number, dto: ModerateCommentDto) {
    const existing = await this.commentsRepository.findById(id);
    if (!existing) {
      throw new NotFoundException({
        message: 'Comment not found',
        error: { code: 'COMMENT_NOT_FOUND', details: null },
      });
    }
    const comment = await this.commentsRepository.update(id, {
      status: dto.status,
    });
    return toCamel(comment);
  }

  async remove(id: number, actor: { id: number; role: string }) {
    const existing = await this.commentsRepository.findById(id);
    if (!existing) {
      throw new NotFoundException({
        message: 'Comment not found',
        error: { code: 'COMMENT_NOT_FOUND', details: null },
      });
    }
    const isMod =
      actor.role === UserRole.ADMIN || actor.role === UserRole.MODERATOR;
    if (existing.user_id !== actor.id && !isMod) {
      throw new ForbiddenException({
        message: 'Not allowed to delete this comment',
        error: { code: 'FORBIDDEN', details: null },
      });
    }
    await this.commentsRepository.softDelete(id);
    return null;
  }

  async exists(id: number) {
    const comment = await this.commentsRepository.findById(id);
    return !!comment;
  }
}
