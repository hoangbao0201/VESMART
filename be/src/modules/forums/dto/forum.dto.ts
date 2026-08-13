import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ThreadStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateForumCategoryDto {
  @ApiProperty()
  @IsString()
  @MaxLength(150)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(180)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  seoTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  seoDescription?: string;
}

export class UpdateForumCategoryDto extends PartialType(CreateForumCategoryDto) {}

export class CreateForumDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  categoryId!: number;

  @ApiProperty()
  @IsString()
  @MaxLength(150)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(180)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  icon?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  seoTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  seoDescription?: string;
}

export class UpdateForumDto extends PartialType(CreateForumDto) {}

export class QueryForumCategoryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  @IsBoolean()
  includeForums?: boolean;
}

export class CreateThreadDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  forumId!: number;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  title!: string;

  @ApiProperty()
  @IsString()
  content!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(220)
  slug?: string;

  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  tagIds?: number[];
}

export class UpdateThreadDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isLocked?: boolean;

  @ApiPropertyOptional({ enum: ThreadStatus })
  @IsOptional()
  @IsEnum(ThreadStatus)
  status?: ThreadStatus;
}

export class QueryThreadDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  forumSlug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  forumId?: number;

  @ApiPropertyOptional({ enum: ThreadStatus })
  @IsOptional()
  @IsEnum(ThreadStatus)
  status?: ThreadStatus;
}

export class QueryForumPostDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  threadId?: number;
}

export class CreateForumPostDto {
  @ApiProperty()
  @IsString()
  content!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  replyToPostId?: number;
}

export class UpdateForumPostDto {
  @ApiProperty()
  @IsString()
  content!: string;
}

export class CreateForumAutoDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  forumId!: number;

  @ApiProperty({ description: 'Nội dung OP thread (admin nhập)' })
  @IsString()
  @MaxLength(20000)
  content!: string;

  @ApiProperty({ description: 'URL bài Facebook group/permalink' })
  @IsString()
  @MaxLength(2000)
  facebookUrl!: string;
}

