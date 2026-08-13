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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayloadUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  CreateForumAutoDto,
  CreateForumCategoryDto,
  CreateForumDto,
  CreateForumPostDto,
  CreateThreadDto,
  QueryForumCategoryDto,
  QueryForumPostDto,
  QueryThreadDto,
  UpdateForumCategoryDto,
  UpdateForumDto,
  UpdateForumPostDto,
  UpdateThreadDto,
} from './dto/forum.dto';
import { ForumAutoService } from './forum-auto.service';
import { ForumsService } from './forums.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@ApiTags('forums')
@Controller()
export class ForumsController {
  constructor(
    private readonly forumsService: ForumsService,
    private readonly forumAutoService: ForumAutoService,
  ) {}

  // Forum categories
  @Public()
  @Get('forum-categories')
  findCategories(@Query() query: QueryForumCategoryDto) {
    return this.forumsService.findCategories(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('forum-categories')
  createCategory(@Body() dto: CreateForumCategoryDto) {
    return this.forumsService.createCategory(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('forum-categories/:id')
  updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateForumCategoryDto,
  ) {
    return this.forumsService.updateCategory(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('forum-categories/:id')
  removeCategory(@Param('id', ParseIntPipe) id: number) {
    return this.forumsService.removeCategory(id);
  }

  // Forums
  @Public()
  @Get('forums/:slug')
  findForum(@Param('slug') slug: string) {
    return this.forumsService.findForumBySlug(slug);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('forums')
  createForum(@Body() dto: CreateForumDto) {
    return this.forumsService.createForum(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('forums/:id')
  updateForum(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateForumDto) {
    return this.forumsService.updateForum(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('forums/:id')
  removeForum(@Param('id', ParseIntPipe) id: number) {
    return this.forumsService.removeForum(id);
  }

  @Public()
  @Get('forums/:id/threads')
  findForumThreads(@Param('id', ParseIntPipe) id: number, @Query() query: QueryThreadDto) {
    return this.forumsService.findThreadsByForumId(id, query);
  }

  // Admin moderation lists
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Post('admin/forum-auto')
  createForumAuto(@Body() dto: CreateForumAutoDto) {
    return this.forumAutoService.createFromFacebook(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Get('admin/threads')
  findThreadsAdmin(@Query() query: QueryThreadDto) {
    return this.forumsService.findThreadsAdmin(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Get('admin/forum-posts')
  findPostsAdmin(@Query() query: QueryForumPostDto) {
    return this.forumsService.findPostsAdmin(query);
  }

  // Threads
  @Public()
  @Get('threads')
  findThreads(@Query() query: QueryThreadDto) {
    return this.forumsService.findThreads(query);
  }

  @Public()
  @Get('threads/:slug')
  findThread(@Param('slug') slug: string) {
    return this.forumsService.findThreadBySlug(slug);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('threads')
  createThread(
    @CurrentUser() user: JwtPayloadUser,
    @Body() dto: CreateThreadDto,
  ) {
    return this.forumsService.createThread(user.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('threads/:id')
  updateThread(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateThreadDto,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    return this.forumsService.updateThread(id, dto, user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('threads/:id')
  removeThread(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    return this.forumsService.removeThread(id, user);
  }

  // Forum posts
  @Public()
  @Get('threads/:threadId/posts')
  findPosts(
    @Param('threadId', ParseIntPipe) threadId: number,
    @Query() query: PaginationQueryDto,
  ) {
    return this.forumsService.findPosts(threadId, query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('threads/:threadId/posts')
  createPost(
    @Param('threadId', ParseIntPipe) threadId: number,
    @CurrentUser() user: JwtPayloadUser,
    @Body() dto: CreateForumPostDto,
  ) {
    return this.forumsService.createPost(threadId, user.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('forum-posts/:id')
  updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateForumPostDto,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    return this.forumsService.updatePost(id, dto, user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('forum-posts/:id')
  removePost(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayloadUser) {
    return this.forumsService.removePost(id, user);
  }
}
