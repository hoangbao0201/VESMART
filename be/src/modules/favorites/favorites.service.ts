import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TargetType } from '@prisma/client';
import { toCamel } from '../../common/utils/case';
import { buildMeta, parseSort } from '../../common/utils/pagination';
import { handlePrismaError } from '../../common/utils/prisma-error';
import { ForumsService } from '../forums/forums.service';
import { PostsService } from '../posts/posts.service';
import { ProductsService } from '../products/products.service';
import { FavoritesRepository } from './favorites.repository';

const FAVORITE_TARGETS = new Set<TargetType>([
  TargetType.PRODUCT,
  TargetType.POST,
  TargetType.THREAD,
]);

@Injectable()
export class FavoritesService {
  constructor(
    private readonly favoritesRepository: FavoritesRepository,
    private readonly productsService: ProductsService,
    private readonly postsService: PostsService,
    private readonly forumsService: ForumsService,
  ) {}

  private async assertTarget(targetType: TargetType, targetId: number) {
    if (!FAVORITE_TARGETS.has(targetType)) {
      throw new BadRequestException({
        message: 'Invalid targetType for favorites',
        error: { code: 'INVALID_TARGET_TYPE', details: null },
      });
    }
    let exists = false;
    if (targetType === TargetType.PRODUCT) {
      exists = await this.productsService.exists(targetId);
    } else if (targetType === TargetType.POST) {
      exists = await this.postsService.exists(targetId);
    } else {
      exists = await this.forumsService.threadExists(targetId);
    }
    if (!exists) {
      throw new NotFoundException({
        message: 'Target not found',
        error: { code: 'TARGET_NOT_FOUND', details: null },
      });
    }
  }

  async create(
    userId: number,
    dto: { targetType: TargetType; targetId: number },
  ) {
    await this.assertTarget(dto.targetType, dto.targetId);
    const existing = await this.favoritesRepository.findOne(
      userId,
      dto.targetType,
      dto.targetId,
    );
    if (existing) return toCamel(existing);
    try {
      const favorite = await this.favoritesRepository.create({
        target_type: dto.targetType,
        target_id: dto.targetId,
        user: { connect: { id: userId } },
      });
      return toCamel(favorite);
    } catch (error) {
      handlePrismaError(error, 'Already favorited');
    }
  }

  async findAll(
    userId: number,
    query: { page?: number; limit?: number; sort?: string },
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const orderBy = parseSort(query.sort, ['created_at'], {
      field: 'created_at',
      direction: 'desc',
    });
    const { items, total } = await this.favoritesRepository.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { user_id: userId },
      orderBy,
    });

    const productIds = items
      .filter((item) => item.target_type === TargetType.PRODUCT)
      .map((item) => item.target_id);
    const postIds = items
      .filter((item) => item.target_type === TargetType.POST)
      .map((item) => item.target_id);
    const threadIds = items
      .filter((item) => item.target_type === TargetType.THREAD)
      .map((item) => item.target_id);

    const [products, posts, threads] = await Promise.all([
      this.favoritesRepository.findProductsByIds(productIds),
      this.favoritesRepository.findPostsByIds(postIds),
      this.favoritesRepository.findThreadsByIds(threadIds),
    ]);

    const productMap = new Map(
      products.map((product) => {
        const lowest = product.variants[0];
        const { variants: _variants, ...rest } = product;
        return [
          product.id,
          {
            ...rest,
            price_from: lowest ? lowest.price.toString() : null,
            sale_price_from: lowest?.sale_price
              ? lowest.sale_price.toString()
              : null,
          },
        ] as const;
      }),
    );
    const postMap = new Map(posts.map((post) => [post.id, post] as const));
    const threadMap = new Map(
      threads.map((thread) => [thread.id, thread] as const),
    );

    const enriched = items.map((item) => ({
      ...item,
      product:
        item.target_type === TargetType.PRODUCT
          ? (productMap.get(item.target_id) ?? null)
          : null,
      post:
        item.target_type === TargetType.POST
          ? (postMap.get(item.target_id) ?? null)
          : null,
      thread:
        item.target_type === TargetType.THREAD
          ? (threadMap.get(item.target_id) ?? null)
          : null,
    }));

    return toCamel({ items: enriched, meta: buildMeta(page, limit, total) });
  }

  async removeById(id: number, userId: number) {
    const favorite = await this.favoritesRepository.findById(id);
    if (!favorite || favorite.user_id !== userId) {
      throw new NotFoundException({
        message: 'Favorite not found',
        error: { code: 'FAVORITE_NOT_FOUND', details: null },
      });
    }
    await this.favoritesRepository.softDelete(id);
    return null;
  }

  async removeByTarget(
    userId: number,
    targetType: TargetType,
    targetId: number,
  ) {
    const favorite = await this.favoritesRepository.findOne(
      userId,
      targetType,
      targetId,
    );
    if (!favorite) {
      throw new NotFoundException({
        message: 'Favorite not found',
        error: { code: 'FAVORITE_NOT_FOUND', details: null },
      });
    }
    await this.favoritesRepository.softDelete(favorite.id);
    return null;
  }
}
