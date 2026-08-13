import { Module } from '@nestjs/common';
import { ForumAutoService } from './forum-auto.service';
import { ForumsController } from './forums.controller';
import { ForumsRepository } from './forums.repository';
import { ForumsService } from './forums.service';

@Module({
  controllers: [ForumsController],
  providers: [ForumsService, ForumsRepository, ForumAutoService],
  exports: [ForumsService],
})
export class ForumsModule {}
