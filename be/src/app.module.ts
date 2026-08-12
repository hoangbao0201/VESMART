import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { BrandsModule } from './modules/brands/brands.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CommentsModule } from './modules/comments/comments.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { ForumsModule } from './modules/forums/forums.module';
import { HealthModule } from './modules/health/health.module';
import { ImagesModule } from './modules/images/images.module';
import { PostsModule } from './modules/posts/posts.module';
import { ProductsModule } from './modules/products/products.module';
import { ReactionsModule } from './modules/reactions/reactions.module';
import { TagsModule } from './modules/tags/tags.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
    PrismaModule,
    HealthModule,
    AuditModule,
    UsersModule,
    AuthModule,
    UploadsModule,
    ImagesModule,
    BrandsModule,
    CategoriesModule,
    TagsModule,
    ProductsModule,
    PostsModule,
    ForumsModule,
    CommentsModule,
    FavoritesModule,
    ReactionsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
