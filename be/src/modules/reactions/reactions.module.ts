import { Module } from '@nestjs/common';
import { CommentsModule } from '../comments/comments.module';
import { ForumsModule } from '../forums/forums.module';
import { ReactionsController } from './reactions.controller';
import { ReactionsRepository } from './reactions.repository';
import { ReactionsService } from './reactions.service';

@Module({
  imports: [ForumsModule, CommentsModule],
  controllers: [ReactionsController],
  providers: [ReactionsService, ReactionsRepository],
})
export class ReactionsModule {}
