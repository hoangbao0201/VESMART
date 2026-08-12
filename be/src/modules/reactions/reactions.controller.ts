import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { ReactionType, TargetType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayloadUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ReactionsService } from './reactions.service';

class CreateReactionDto {
  @ApiProperty({ enum: [TargetType.FORUM_POST, TargetType.COMMENT] })
  @IsEnum(TargetType)
  targetType!: TargetType;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  targetId!: number;

  @ApiProperty({ enum: ReactionType })
  @IsEnum(ReactionType)
  reactionType!: ReactionType;
}

class QueryReactionDto {
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

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  @IsBoolean()
  summary?: boolean;

  @IsOptional()
  @IsEnum(ReactionType)
  reactionType?: ReactionType;

  @IsOptional()
  @IsString()
  reaction_type?: ReactionType;
}

@ApiTags('reactions')
@Controller('reactions')
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @Public()
  @Get()
  async list(@Query() query: QueryReactionDto) {
    const targetType = query.targetType ?? query.target_type;
    const targetId = query.targetId ?? query.target_id;
    if (!targetType || !targetId) {
      return [];
    }
    if (query.summary) {
      return this.reactionsService.summary(targetType, targetId);
    }
    return this.reactionsService.list(targetType, targetId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @CurrentUser() user: JwtPayloadUser,
    @Body() dto: CreateReactionDto,
  ) {
    return this.reactionsService.create(user.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete()
  remove(
    @CurrentUser() user: JwtPayloadUser,
    @Query() query: QueryReactionDto,
  ) {
    const targetType = query.targetType ?? query.target_type;
    const targetId = query.targetId ?? query.target_id;
    const reactionType = query.reactionType ?? query.reaction_type;
    if (!targetType || !targetId || !reactionType) {
      return null;
    }
    return this.reactionsService.remove(
      user.id,
      targetType,
      targetId,
      reactionType,
    );
  }
}
