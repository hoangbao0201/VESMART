import { Module } from '@nestjs/common';
import { PostsModule } from '../posts/posts.module';
import { ProductsModule } from '../products/products.module';
import { CommentsController } from './comments.controller';
import { CommentsRepository } from './comments.repository';
import { CommentsService } from './comments.service';

@Module({
  imports: [ProductsModule, PostsModule],
  controllers: [CommentsController],
  providers: [CommentsService, CommentsRepository],
  exports: [CommentsService],
})
export class CommentsModule {}
