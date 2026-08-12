import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

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

  async upload(file: Express.Multer.File, keyPrefix = 'uploads') {
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

    const ext = file.originalname.split('.').pop() || 'bin';
    return this.putBuffer({
      buffer: file.buffer,
      contentType: file.mimetype,
      ext,
      keyPrefix,
    });
  }

  async putBuffer(input: PutBufferInput): Promise<{ url: string; key: string }> {
    const prefix = (input.keyPrefix || 'uploads').replace(/^\/+|\/+$/g, '');
    const ext = (input.ext || 'bin').replace(/^\./, '');
    const key = `${prefix}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${ext}`;

    if (!this.s3 || !this.bucket || !this.publicUrl) {
      throw new ServiceUnavailableException({
        message:
          'Upload storage is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL',
        error: {
          code: 'R2_NOT_CONFIGURED',
          details: {
            stubKey: key,
            suggestedUrl: `https://cdn.example.com/${key}`,
          },
        },
      });
    }

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: input.buffer,
        ContentType: input.contentType,
      }),
    );

    const base = this.publicUrl.replace(/\/$/, '');
    return { url: `${base}/${key}`, key };
  }
}
