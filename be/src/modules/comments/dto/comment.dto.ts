import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommentStatus, TargetType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateCommentDto {
  @ApiProperty({ enum: [TargetType.PRODUCT, TargetType.POST] })
  @IsEnum(TargetType)
  targetType!: TargetType;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  targetId!: number;

  @ApiProperty()
  @IsString()
  content!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  parentId?: number;
}

export class QueryCommentDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: TargetType })
  @IsOptional()
  @IsEnum(TargetType)
  targetType?: TargetType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  target_type?: TargetType;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  targetId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  target_id?: number;

  @ApiPropertyOptional({ enum: CommentStatus })
  @IsOptional()
  @IsEnum(CommentStatus)
  status?: CommentStatus;
}

export class ModerateCommentDto {
  @ApiProperty({ enum: CommentStatus })
  @IsEnum(CommentStatus)
  status!: CommentStatus;
}
