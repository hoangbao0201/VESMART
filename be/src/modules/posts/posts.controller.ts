import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayloadUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreatePostCategoryDto } from './dto/create-post-category.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@ApiTags('posts')
@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Public()
  @Get('posts')
  findAll(@Query() query: QueryPostDto) {
    return this.postsService.findAll(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Get('posts/id/:id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findByIdForEdit(id);
  }

  @Public()
  @Get('posts/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.postsService.findBySlug(slug);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Post('posts')
  create(@CurrentUser() user: JwtPayloadUser, @Body() dto: CreatePostDto) {
    return this.postsService.create(user.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Patch('posts/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePostDto) {
    return this.postsService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Delete('posts/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.remove(id);
  }

  @Public()
  @Get('post-categories')
  findCategories(@Query() query: PaginationQueryDto) {
    return this.postsService.findCategories(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('post-categories')
  createCategory(@Body() dto: CreatePostCategoryDto) {
    return this.postsService.createCategory(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('post-categories/:id')
  updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreatePostCategoryDto,
  ) {
    return this.postsService.updateCategory(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('post-categories/:id')
  removeCategory(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.removeCategory(id);
  }
}
