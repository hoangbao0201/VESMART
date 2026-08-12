import { Module } from '@nestjs/common';
import { UploadsModule } from '../uploads/uploads.module';
import { ImagesController } from './images.controller';
import { ImagesRepository } from './images.repository';
import { ImagesService } from './images.service';

@Module({
  imports: [UploadsModule],
  controllers: [ImagesController],
  providers: [ImagesService, ImagesRepository],
  exports: [ImagesService],
})
export class ImagesModule {}
