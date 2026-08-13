import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { existsSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';
import { makeSlug } from '../../common/utils/slug';
import { CreateForumAutoDto } from './dto/forum.dto';
import { ForumsService } from './forums.service';
import { ForumsRepository } from './forums.repository';

type ScrapedPayload = {
  postId: string | number;
  datapost: { author_name: string; content: string; source_url?: string };
  comments: Array<{ author_name: string; content: string }>;
};

type FacebookLib = {
  isFacebookPostUrl: (url: string) => boolean;
  validateCookie: (cookie: string) => string | null;
  scrapeFacebookPost: (
    url: string,
    cookie: string,
  ) => Promise<{
    postId: string;
    authorId?: string;
    content: string;
    sourceUrl: string;
    comments: Array<{ author_id?: string; author?: string; message: string }>;
  }>;
};

type PayloadLib = {
  buildForumPayload: (scraped: unknown) => ScrapedPayload;
};

@Injectable()
export class ForumAutoService {
  private readonly logger = new Logger(ForumAutoService.name);
  private passwordHashPromise: Promise<string> | null = null;

  constructor(
    private readonly forumsService: ForumsService,
    private readonly forumsRepository: ForumsRepository,
  ) {}

  private resolveAutoPostRoot(): string {
    const fromEnv = process.env.AUTO_POST_FORUM_DIR?.trim();
    if (fromEnv && existsSync(fromEnv)) return fromEnv;

    const candidates = [
      join(process.cwd(), '..', 'auto-post-forum'),
      join(process.cwd(), 'auto-post-forum'),
      join(__dirname, '..', '..', '..', '..', 'auto-post-forum'),
      join(__dirname, '..', '..', '..', '..', '..', 'auto-post-forum'),
    ];
    for (const dir of candidates) {
      if (existsSync(join(dir, 'lib', 'facebook.js'))) return dir;
    }
    throw new BadRequestException({
      message: 'Không tìm thấy thư mục auto-post-forum',
      error: { code: 'AUTO_POST_FORUM_MISSING', details: null },
    });
  }

  private async loadScrapeLibs(): Promise<{
    facebook: FacebookLib;
    payload: PayloadLib;
    namesPath: string;
  }> {
    const root = this.resolveAutoPostRoot();
    const facebookHref = pathToFileURL(join(root, 'lib', 'facebook.js')).href;
    const payloadHref = pathToFileURL(join(root, 'lib', 'payload.js')).href;
    const [facebook, payload] = await Promise.all([
      import(facebookHref) as Promise<FacebookLib>,
      import(payloadHref) as Promise<PayloadLib>,
    ]);
    return {
      facebook,
      payload,
      namesPath: join(root, 'names.json'),
    };
  }

  private titleFromContent(content: string): string {
    const firstLine =
      content
        .split(/\r?\n/)
        .map((l) => l.trim())
        .find((l) => l.length > 0) || content.trim();
    const cleaned = firstLine.replace(/\s+/g, ' ').trim();
    if (!cleaned) return 'Thread từ Facebook';
    return cleaned.length > 255 ? `${cleaned.slice(0, 252)}...` : cleaned;
  }

  private usernameFromDisplayName(displayName: string): string {
    const base = makeSlug(displayName).replace(/[^a-z0-9_]/gi, '').slice(0, 32);
    const hash = createHash('sha1')
      .update(displayName)
      .digest('hex')
      .slice(0, 6);
    const core = (base || 'user').slice(0, 32);
    // fa_ + up to 32 + _ + 6 = within 50
    return `fa_${core}_${hash}`.slice(0, 50);
  }

  private async sharedPasswordHash(): Promise<string> {
    if (!this.passwordHashPromise) {
      this.passwordHashPromise = bcrypt.hash(
        `ForumAuto!${randomBytes(12).toString('hex')}`,
        10,
      );
    }
    return this.passwordHashPromise;
  }

  private async ensureForumUser(displayName: string): Promise<number> {
    const name = displayName.trim() || 'Thành viên';
    const username = this.usernameFromDisplayName(name);
    const email = `${username}@forum-auto.vesmart.local`;

    const existing = await this.forumsRepository.client.user.findFirst({
      where: {
        deleted_at: null,
        OR: [{ username }, { email }],
      },
    });
    if (existing) return existing.id;

    const password = await this.sharedPasswordHash();
    try {
      const created = await this.forumsRepository.client.user.create({
        data: {
          username,
          email,
          full_name: name.slice(0, 150),
          password,
          role: UserRole.USER,
          status: UserStatus.ACTIVE,
        },
      });
      return created.id;
    } catch {
      const again = await this.forumsRepository.client.user.findFirst({
        where: {
          deleted_at: null,
          OR: [{ username }, { email }],
        },
      });
      if (again) return again.id;
      throw new BadRequestException({
        message: `Không tạo được user cho ${name}`,
        error: { code: 'FORUM_AUTO_USER_FAILED', details: null },
      });
    }
  }

  async createFromFacebook(dto: CreateForumAutoDto) {
    const content = dto.content.trim();
    if (!content) {
      throw new BadRequestException({
        message: 'Nội dung thread không được trống',
        error: { code: 'VALIDATION_ERROR', details: null },
      });
    }

    const facebookUrl = dto.facebookUrl.trim();
    const cookie = process.env.FB_COOKIE || '';
    const { facebook, payload, namesPath } = await this.loadScrapeLibs();

    if (!facebook.isFacebookPostUrl(facebookUrl)) {
      throw new BadRequestException({
        message:
          'URL không hợp lệ. Cần link bài Facebook (groups/.../posts|permalink/...).',
        error: { code: 'INVALID_FACEBOOK_URL', details: null },
      });
    }

    const cookieErr = facebook.validateCookie(cookie);
    if (cookieErr) {
      throw new BadRequestException({
        message: `${cookieErr}. Thêm FB_COOKIE vào be/.env`,
        error: { code: 'FB_COOKIE_INVALID', details: null },
      });
    }

    const forum = await this.forumsRepository.findForumById(dto.forumId);
    if (!forum) {
      throw new NotFoundException({
        message: 'Forum not found',
        error: { code: 'FORUM_NOT_FOUND', details: null },
      });
    }

    let scraped;
    try {
      scraped = await facebook.scrapeFacebookPost(facebookUrl, cookie);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Không scrape được bài Facebook';
      throw new BadRequestException({
        message,
        error: {
          code:
            err && typeof err === 'object' && 'code' in err
              ? String((err as { code: string }).code)
              : 'FACEBOOK_SCRAPE_FAILED',
          details: null,
        },
      });
    }

    // buildForumPayload uses createNameAssigner(namesPath) via options
    const built = (payload.buildForumPayload as (
      scraped: unknown,
      options?: { namesPath?: string },
    ) => ScrapedPayload)(scraped, { namesPath });

    const scrapeMeta =
      scraped && typeof scraped === 'object' && 'meta' in scraped
        ? (scraped as {
            meta?: {
              usedGraphql?: boolean;
              feedbackId?: string;
              fbTotalCount?: number | null;
            };
          }).meta
        : undefined;

    this.logger.log(
      `Forum Auto scrape ${built.comments.length} comments (postId=${built.postId} usedGraphql=${Boolean(scrapeMeta?.usedGraphql)} fbTotal=${scrapeMeta?.fbTotalCount ?? '?'})`,
    );
    const opUserId = await this.ensureForumUser(built.datapost.author_name);
    const title = this.titleFromContent(content);

    const thread = (await this.forumsService.createThread(opUserId, {
      forumId: dto.forumId,
      title,
      content,
    })) as { id: number; slug: string; title: string };

    if (!thread?.id) {
      throw new BadRequestException({
        message: 'Tạo thread thất bại',
        error: { code: 'THREAD_CREATE_FAILED', details: null },
      });
    }

    let replyCount = 0;
    for (const c of built.comments) {
      const text = (c.content || '').trim();
      if (!text) continue;
      const userId = await this.ensureForumUser(c.author_name);
      await this.forumsService.createPost(thread.id, userId, { content: text });
      replyCount += 1;
    }

    return {
      thread,
      replyCount,
      scrapedComments: built.comments.length,
      opAuthor: built.datapost.author_name,
    };
  }
}
