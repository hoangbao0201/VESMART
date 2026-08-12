import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { TargetType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayloadUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FavoritesService } from './favorites.service';

class CreateFavoriteDto {
  @ApiProperty({ enum: [TargetType.PRODUCT, TargetType.POST, TargetType.THREAD] })
  @IsEnum(TargetType)
  targetType!: TargetType;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  targetId!: number;
}

class DeleteFavoriteQueryDto {
  @IsOptional()
  @IsEnum(TargetType)
  targetType?: TargetType;

  @IsOptional()
  @IsString()
  target_type?: TargetType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  targetId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  target_id?: number;
}

@ApiTags('favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  findAll(
    @CurrentUser() user: JwtPayloadUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.favoritesService.findAll(user.id, query);
  }

  @Post()
  create(
    @CurrentUser() user: JwtPayloadUser,
    @Body() dto: CreateFavoriteDto,
  ) {
    return this.favoritesService.create(user.id, dto);
  }

  @Delete(':id')
  removeById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    return this.favoritesService.removeById(id, user.id);
  }

  @Delete()
  removeByTarget(
    @CurrentUser() user: JwtPayloadUser,
    @Query() query: DeleteFavoriteQueryDto,
  ) {
    const targetType = query.targetType ?? query.target_type;
    const targetId = query.targetId ?? query.target_id;
    if (!targetType || !targetId) {
      return null;
    }
    return this.favoritesService.removeByTarget(
      user.id,
      targetType,
      targetId,
    );
  }
}
