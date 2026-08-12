import { Module } from '@nestjs/common';
import { ForumsModule } from '../forums/forums.module';
import { PostsModule } from '../posts/posts.module';
import { ProductsModule } from '../products/products.module';
import { FavoritesController } from './favorites.controller';
import { FavoritesRepository } from './favorites.repository';
import { FavoritesService } from './favorites.service';

@Module({
  imports: [ProductsModule, PostsModule, ForumsModule],
  controllers: [FavoritesController],
  providers: [FavoritesService, FavoritesRepository],
})
export class FavoritesModule {}
