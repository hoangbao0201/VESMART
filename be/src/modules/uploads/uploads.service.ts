import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import {
  buildTripleWebp,
  keysFromStem,
} from '../../common/utils/image-webp';

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);
const MAX_SIZE = 5 * 1024 * 1024;

export type PutBufferInput = {
  buffer: Buffer;
  contentType: string;
  ext?: string;
  /** Key prefix without trailing slash, e.g. media/san-pham-chia-se */
  keyPrefix?: string;
};

export type TripleUploadResult = {
  /** Canonical full WebP URL stored in DB */
  url: string;
  fullUrl: string;
  resize1000Url: string;
  resize500Url: string;
  key: string;
  fullKey: string;
  resize1000Key: string;
  resize500Key: string;
  mime: string;
  bytes: number;
  width: number;
  height: number;
};

@Injectable()
export class UploadsService {
  private readonly s3: S3Client | null;
  private readonly bucket: string | undefined;
  private readonly publicUrl: string | undefined;

  constructor(private readonly config: ConfigService) {
    const accountId = this.config.get<string>('R2_ACCOUNT_ID');
    const accessKeyId = this.config.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('R2_SECRET_ACCESS_KEY');
    this.bucket = this.config.get<string>('R2_BUCKET');
    this.publicUrl = this.config.get<string>('R2_PUBLIC_URL');

    if (accountId && accessKeyId && secretAccessKey && this.bucket) {
      this.s3 = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId, secretAccessKey },
      });
    } else {
      this.s3 = null;
    }
  }

  isConfigured(): boolean {
    return Boolean(this.s3 && this.bucket && this.publicUrl);
  }

  private requireStorage() {
    if (!this.s3 || !this.bucket || !this.publicUrl) {
      throw new ServiceUnavailableException({
        message:
          'Upload storage is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL',
        error: { code: 'R2_NOT_CONFIGURED', details: null },
      });
    }
    return {
      s3: this.s3,
      bucket: this.bucket,
      publicUrl: this.publicUrl.replace(/\/$/, ''),
    };
  }

  private validateImageFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException({
        message: 'File is required',
        error: { code: 'FILE_REQUIRED', details: null },
      });
    }
    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw new BadRequestException({
        message: 'Unsupported file type',
        error: { code: 'INVALID_MIME', details: { mimetype: file.mimetype } },
      });
    }
    if (file.size > MAX_SIZE) {
      throw new BadRequestException({
        message: 'File too large (max 5MB)',
        error: { code: 'FILE_TOO_LARGE', details: { maxBytes: MAX_SIZE } },
      });
    }
  }

  /** Upload image as triple WebP (full + resize:1000 + resize:500). Returns full URL. */
  async upload(file: Express.Multer.File, keyPrefix = 'uploads') {
    this.validateImageFile(file);
    return this.uploadTripleWebp(file.buffer, keyPrefix);
  }

  async uploadTripleWebp(
    buffer: Buffer,
    keyPrefix = 'uploads',
    stemSuffix?: string,
  ): Promise<TripleUploadResult> {
    const { publicUrl } = this.requireStorage();
    const prefix = (keyPrefix || 'uploads').replace(/^\/+|\/+$/g, '');
    const stem =
      stemSuffix ||
      `${prefix}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}`;
    const keys = keysFromStem(stem);
    const variants = await buildTripleWebp(buffer);

    await Promise.all([
      this.putBufferAtKey(keys.fullKey, variants.full.buffer, 'image/webp'),
      this.putBufferAtKey(
        keys.resize1000Key,
        variants.resize1000.buffer,
        'image/webp',
      ),
      this.putBufferAtKey(
        keys.resize500Key,
        variants.resize500.buffer,
        'image/webp',
      ),
    ]);

    const fullUrl = `${publicUrl}/${keys.fullKey}`;
    return {
      url: fullUrl,
      fullUrl,
      resize1000Url: `${publicUrl}/${keys.resize1000Key}`,
      resize500Url: `${publicUrl}/${keys.resize500Key}`,
      key: keys.fullKey,
      fullKey: keys.fullKey,
      resize1000Key: keys.resize1000Key,
      resize500Key: keys.resize500Key,
      mime: 'image/webp',
      bytes: variants.full.bytes,
      width: variants.full.width,
      height: variants.full.height,
    };
  }

  async putBuffer(input: PutBufferInput): Promise<{ url: string; key: string }> {
    const prefix = (input.keyPrefix || 'uploads').replace(/^\/+|\/+$/g, '');
    const ext = (input.ext || 'bin').replace(/^\./, '');
    const key = `${prefix}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${ext}`;
    return this.putBufferAtKey(key, input.buffer, input.contentType);
  }

  async putBufferAtKey(
    key: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<{ url: string; key: string }> {
    const { s3, bucket, publicUrl } = this.requireStorage();
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );
    return { url: `${publicUrl}/${key}`, key };
  }

  async deleteObject(key: string): Promise<void> {
    const { s3, bucket } = this.requireStorage();
    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
  }

  async objectExists(key: string): Promise<boolean> {
    const { s3, bucket } = this.requireStorage();
    try {
      await s3.send(
        new HeadObjectCommand({
          Bucket: bucket,
          Key: key,
        }),
      );
      return true;
    } catch {
      return false;
    }
  }
}
